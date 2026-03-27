using FireInvent.Api.Contracts.Rentals;
using FireInvent.Api.Domain.Entities;
using FireInvent.Api.Domain.Enums;
using FireInvent.Api.Domain.Repositories;
using FireInvent.Api.Domain.Repositories.Rentals;

namespace FireInvent.Api.Application.Services.Rentals;

public sealed class RentalBookingService(
    IRentalBookingRepository repository,
    IInventoryItemRepository inventoryRepository) : IRentalBookingService
{
    public async Task<IReadOnlyList<RentalBookingResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        var bookings = await repository.GetAllAsync(cancellationToken);
        return bookings.Select(ToResponse).ToList();
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
        var item = await inventoryRepository.GetByIdAsync(request.ItemId, cancellationToken);
        if (item is null)
        {
            return RentalBookingServiceResult.Conflict(
                "item_not_found",
                $"Item '{request.ItemId}' does not exist.");
        }

        var reservedOrRented = await repository.GetReservedOrRentedQuantityAsync(
            request.ItemId,
            request.StartDate,
            request.EndDate,
            excludeBookingId: null,
            cancellationToken);

        if (reservedOrRented + request.Quantity > item.TotalQuantity)
        {
            return RentalBookingServiceResult.Conflict(
                "stock_conflict",
                "Requested quantity exceeds available stock for the selected period.");
        }

        var now = DateTimeOffset.UtcNow;
        var booking = new RentalBooking
        {
            Id = Guid.NewGuid(),
            ItemId = request.ItemId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Quantity = request.Quantity,
            Status = RentalStatus.Planned,
            CreatedAt = now,
            UpdatedAt = now
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
                "invalid_rental_state",
                "Canceled or completed rentals cannot be updated.");
        }

        var item = await inventoryRepository.GetByIdAsync(booking.ItemId, cancellationToken);
        if (item is null)
        {
            return RentalBookingServiceResult.Conflict(
                "item_not_found",
                $"Item '{booking.ItemId}' does not exist.");
        }

        var reservedOrRented = await repository.GetReservedOrRentedQuantityAsync(
            booking.ItemId,
            request.StartDate,
            request.EndDate,
            booking.Id,
            cancellationToken);

        if (reservedOrRented + request.Quantity > item.TotalQuantity)
        {
            return RentalBookingServiceResult.Conflict(
                "stock_conflict",
                "Requested quantity exceeds available stock for the selected period.");
        }

        booking.StartDate = request.StartDate;
        booking.EndDate = request.EndDate;
        booking.Quantity = request.Quantity;
        booking.UpdatedAt = DateTimeOffset.UtcNow;

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

        if (booking.Status is RentalStatus.Canceled or RentalStatus.Completed)
        {
            return RentalBookingServiceResult.Conflict(
                "invalid_rental_state",
                "Rental cannot be canceled from current status.");
        }

        booking.Status = RentalStatus.Canceled;
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

        if (booking.Status is RentalStatus.Canceled or RentalStatus.Completed)
        {
            return RentalBookingServiceResult.Conflict(
                "invalid_rental_state",
                "Rental cannot be completed from current status.");
        }

        booking.Status = RentalStatus.Completed;
        booking.UpdatedAt = DateTimeOffset.UtcNow;

        await repository.SaveChangesAsync(cancellationToken);
        return RentalBookingServiceResult.Success(ToResponse(booking));
    }

    private static RentalBookingResponse ToResponse(RentalBooking booking)
    {
        return new RentalBookingResponse(
            booking.Id,
            booking.ItemId,
            booking.StartDate,
            booking.EndDate,
            booking.Quantity,
            booking.Status,
            booking.CreatedAt,
            booking.UpdatedAt);
    }
}
