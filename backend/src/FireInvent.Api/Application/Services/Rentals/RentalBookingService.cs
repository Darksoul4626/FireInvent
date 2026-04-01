using FireInvent.Api.Contracts.Rentals;
using FireInvent.Api.Domain.Entities;
using FireInvent.Api.Domain.Enums;
using FireInvent.Api.Domain.Repositories;
using FireInvent.Api.Domain.Repositories.Rentals;

namespace FireInvent.Api.Application.Services.Rentals;

public sealed class RentalBookingService(
    IRentalBookingRepository repository,
    IInventoryItemRepository inventoryRepository,
    IBusinessDayBoundary businessDayBoundary) : IRentalBookingService
{
    private const string InvalidRentalStateCode = "invalid_rental_state";

    public async Task<IReadOnlyList<RentalBookingResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        var bookings = await repository.GetAllAsync(cancellationToken);
        return bookings.Select(ToResponse).ToList();
    }

    public async Task<PagedRentalOverviewResponse> GetOverviewAsync(
        GetRentalOverviewQuery query,
        CancellationToken cancellationToken)
    {
        var normalized = NormalizeOverviewQuery(query);
        var page = await repository.GetOverviewAsync(normalized, cancellationToken);

        return new PagedRentalOverviewResponse(
            page.Items.Select(ToOverviewResponse).ToList(),
            page.Page,
            page.PageSize,
            page.TotalCount,
            page.TotalPages,
            page.HasPrevious,
            page.HasNext);
    }

    public async Task<RentalBookingResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var booking = await repository.GetByIdAsync(id, cancellationToken);
        return booking is null ? null : ToResponse(booking);
    }

    public async Task<RentalBookingServiceResult> CreateAsync(
        CreateRentalBookingRequest request,
        CancellationToken cancellationToken)
    {
        if (!IsStartDateValid(request.StartDate))
        {
            return RentalBookingServiceResult.Conflict(
                "rental_start_in_past",
                "Start date must be today or later in Europe/Berlin.");
        }

        var normalizedLines = NormalizeLines(request.Lines);
        if (normalizedLines.Count == 0)
        {
            return RentalBookingServiceResult.Conflict(
                "rental_lines_required",
                "At least one rental line is required.");
        }

        var availabilityError = await ValidateAvailabilityAsync(
            normalizedLines,
            request.StartDate,
            request.EndDate,
            excludeBookingId: null,
            cancellationToken);

        if (availabilityError is not null)
        {
            return RentalBookingServiceResult.Conflict(availabilityError.Value.Code, availabilityError.Value.Message);
        }

        var now = DateTimeOffset.UtcNow;
        var booking = new RentalBooking
        {
            Id = Guid.NewGuid(),
            ItemId = normalizedLines[0].ItemId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Quantity = normalizedLines.Sum(l => l.Quantity),
            BorrowerName = NormalizeBorrower(request.BorrowerName),
            Status = RentalStatus.Planned,
            CreatedAt = now,
            UpdatedAt = now,
            Lines = normalizedLines
                .Select(line => new RentalBookingLine
                {
                    Id = Guid.NewGuid(),
                    ItemId = line.ItemId,
                    Quantity = line.Quantity
                })
                .ToList()
        };

        await repository.AddAsync(booking, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        return RentalBookingServiceResult.Success(ToResponse(booking));
    }

    public async Task<RentalBookingServiceResult> UpdateAsync(
        Guid id,
        UpdateRentalBookingRequest request,
        CancellationToken cancellationToken)
    {
        var booking = await repository.GetByIdAsync(id, cancellationToken);
        if (booking is null)
        {
            return RentalBookingServiceResult.Missing();
        }

        if (booking.Status is RentalStatus.Canceled or RentalStatus.Completed)
        {
            return RentalBookingServiceResult.Conflict(
                InvalidRentalStateCode,
                "Canceled or completed rentals cannot be updated.");
        }

        if (!IsStartDateValid(request.StartDate))
        {
            return RentalBookingServiceResult.Conflict(
                "rental_start_in_past",
                "Start date must be today or later in Europe/Berlin.");
        }

        var normalizedLines = NormalizeLines(request.Lines);
        if (normalizedLines.Count == 0)
        {
            return RentalBookingServiceResult.Conflict(
                "rental_lines_required",
                "At least one rental line is required.");
        }

        var availabilityError = await ValidateAvailabilityAsync(
            normalizedLines,
            request.StartDate,
            request.EndDate,
            booking.Id,
            cancellationToken);

        if (availabilityError is not null)
        {
            return RentalBookingServiceResult.Conflict(
                availabilityError.Value.Code,
                availabilityError.Value.Message);
        }

        booking.StartDate = request.StartDate;
        booking.EndDate = request.EndDate;
        booking.BorrowerName = NormalizeBorrower(request.BorrowerName);
        booking.ItemId = normalizedLines[0].ItemId;
        booking.Quantity = normalizedLines.Sum(l => l.Quantity);

        if (!CanTransition(booking.Status, request.Status))
        {
            return RentalBookingServiceResult.Conflict(
                InvalidRentalStateCode,
                $"Rental cannot transition from '{booking.Status}' to '{request.Status}'.");
        }

        booking.Status = request.Status;
        booking.UpdatedAt = DateTimeOffset.UtcNow;

        var targetQuantitiesByItemId = normalizedLines.ToDictionary(line => line.ItemId, line => line.Quantity);

        var linesToRemove = booking.Lines
            .Where(existing => !targetQuantitiesByItemId.ContainsKey(existing.ItemId))
            .ToList();

        foreach (var lineToRemove in linesToRemove)
        {
            booking.Lines.Remove(lineToRemove);
        }

        var existingByItemId = booking.Lines
            .GroupBy(existing => existing.ItemId)
            .ToDictionary(group => group.Key, group => group.First());

        foreach (var line in normalizedLines)
        {
            if (existingByItemId.TryGetValue(line.ItemId, out var existingLine))
            {
                existingLine.Quantity = line.Quantity;
                continue;
            }

            booking.Lines.Add(new RentalBookingLine
            {
                Id = Guid.NewGuid(),
                ItemId = line.ItemId,
                Quantity = line.Quantity
            });
        }

        await repository.SaveChangesAsync(cancellationToken);
        return RentalBookingServiceResult.Success(ToResponse(booking));
    }

    public async Task<RentalBookingServiceResult> CancelAsync(Guid id, CancellationToken cancellationToken)
    {
        var booking = await repository.GetByIdAsync(id, cancellationToken);
        if (booking is null)
        {
            return RentalBookingServiceResult.Missing();
        }

        if (!CanTransition(booking.Status, RentalStatus.Canceled))
        {
            return RentalBookingServiceResult.Conflict(
                InvalidRentalStateCode,
                "Rental cannot be canceled from current status.");
        }

        booking.Status = RentalStatus.Canceled;
        booking.UpdatedAt = DateTimeOffset.UtcNow;

        await repository.SaveChangesAsync(cancellationToken);
        return RentalBookingServiceResult.Success(ToResponse(booking));
    }

    public async Task<RentalBookingServiceResult> ReturnAsync(Guid id, CancellationToken cancellationToken)
    {
        var booking = await repository.GetByIdAsync(id, cancellationToken);
        if (booking is null)
        {
            return RentalBookingServiceResult.Missing();
        }

        if (!CanTransition(booking.Status, RentalStatus.Returned))
        {
            return RentalBookingServiceResult.Conflict(
                InvalidRentalStateCode,
                "Rental cannot be marked as returned from current status.");
        }

        booking.Status = RentalStatus.Returned;
        booking.UpdatedAt = DateTimeOffset.UtcNow;

        await repository.SaveChangesAsync(cancellationToken);
        return RentalBookingServiceResult.Success(ToResponse(booking));
    }

    public async Task<RentalBookingServiceResult> CompleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var booking = await repository.GetByIdAsync(id, cancellationToken);
        if (booking is null)
        {
            return RentalBookingServiceResult.Missing();
        }

        if (!CanTransition(booking.Status, RentalStatus.Completed))
        {
            return RentalBookingServiceResult.Conflict(
                InvalidRentalStateCode,
                "Rental cannot be completed from current status.");
        }

        booking.Status = RentalStatus.Completed;
        booking.UpdatedAt = DateTimeOffset.UtcNow;

        await repository.SaveChangesAsync(cancellationToken);
        return RentalBookingServiceResult.Success(ToResponse(booking));
    }

    private static RentalBookingResponse ToResponse(RentalBooking booking)
    {
        var lines = booking.Lines.Count > 0
            ? booking.Lines
                .Select(line => new RentalBookingLineResponse(line.ItemId, line.Quantity))
                .ToList()
            :
            [
                new RentalBookingLineResponse(booking.ItemId, booking.Quantity)
            ];

        return new RentalBookingResponse(
            booking.Id,
            booking.StartDate,
            booking.EndDate,
            lines,
            booking.BorrowerName,
            booking.Status,
            booking.CreatedAt,
            booking.UpdatedAt);
    }

    private static List<RentalBookingLineRequest> NormalizeLines(IReadOnlyList<RentalBookingLineRequest> lines)
    {
        return lines
            .GroupBy(line => line.ItemId)
            .Select(group => new RentalBookingLineRequest(group.Key, group.Sum(entry => entry.Quantity)))
            .ToList();
    }

    private static string? NormalizeBorrower(string? borrowerName)
    {
        if (string.IsNullOrWhiteSpace(borrowerName))
        {
            return null;
        }

        return borrowerName.Trim();
    }

    private async Task<(string Code, string Message)?> ValidateAvailabilityAsync(
        IReadOnlyList<RentalBookingLineRequest> lines,
        DateTimeOffset startDate,
        DateTimeOffset endDate,
        Guid? excludeBookingId,
        CancellationToken cancellationToken)
    {
        foreach (var line in lines)
        {
            var item = await inventoryRepository.GetByIdAsync(line.ItemId, cancellationToken);
            if (item is null)
            {
                return (
                    "item_not_found",
                    $"Item '{line.ItemId}' does not exist.");
            }

            var reservedOrRented = await repository.GetReservedOrRentedQuantityAsync(
                line.ItemId,
                startDate,
                endDate,
                excludeBookingId,
                cancellationToken);

            if (reservedOrRented + line.Quantity > item.TotalQuantity)
            {
                return (
                    "stock_conflict",
                    $"Requested quantity for item '{line.ItemId}' exceeds available stock for the selected period.");
            }
        }

        return null;
    }

    private static bool CanTransition(RentalStatus currentStatus, RentalStatus targetStatus)
    {
        if (currentStatus == targetStatus)
        {
            return true;
        }

        return currentStatus switch
        {
            RentalStatus.Planned => targetStatus is RentalStatus.Active or RentalStatus.Canceled,
            RentalStatus.Active => targetStatus is RentalStatus.Returned or RentalStatus.Canceled,
            RentalStatus.Returned => targetStatus == RentalStatus.Completed,
            RentalStatus.Canceled => false,
            RentalStatus.Completed => false,
            _ => false
        };
    }

    private static RentalOverviewItemResponse ToOverviewResponse(RentalOverviewRow row)
    {
        return new RentalOverviewItemResponse(
            row.Id,
            row.StartDate,
            row.EndDate,
            row.BorrowerName,
            row.Status,
            row.TotalQuantity,
            row.ItemSummary,
            row.CreatedAt,
            row.UpdatedAt);
    }

    private static RentalOverviewQuery NormalizeOverviewQuery(GetRentalOverviewQuery query)
    {
        var page = query.Page <= 0 ? 1 : query.Page;
        var pageSize = query.PageSize switch
        {
            <= 0 => 20,
            > 200 => 200,
            _ => query.PageSize
        };

        RentalStatus? status = null;
        if (!string.IsNullOrWhiteSpace(query.Status)
            && Enum.TryParse<RentalStatus>(query.Status, true, out var parsedStatus))
        {
            status = parsedStatus;
        }

        return new RentalOverviewQuery(
            page,
            pageSize,
            NormalizeOptional(query.Search),
            status,
            query.ItemId,
            query.From,
                query.To);
    }

    private static string? NormalizeOptional(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return value.Trim();
    }

    private bool IsStartDateValid(DateTimeOffset startDate)
    {
        var startDay = businessDayBoundary.ToBusinessDate(startDate);
        var today = businessDayBoundary.GetCurrentBusinessDate();
        return startDay >= today;
    }
}
