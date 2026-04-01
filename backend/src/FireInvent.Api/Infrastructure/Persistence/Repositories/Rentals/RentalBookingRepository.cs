using FireInvent.Api.Domain.Entities;
using FireInvent.Api.Domain.Enums;
using FireInvent.Api.Domain.Repositories;
using FireInvent.Api.Domain.Repositories.Rentals;
using Microsoft.EntityFrameworkCore;

namespace FireInvent.Api.Infrastructure.Persistence.Repositories.Rentals;

public sealed class RentalBookingRepository(FireInventDbContext dbContext) : IRentalBookingRepository
{
    public async Task<IReadOnlyList<RentalBooking>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await dbContext.RentalBookings
            .Include(r => r.Lines)
            .AsNoTracking()
            .OrderBy(r => r.StartDate)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> ActivateDuePlannedAsync(DateTimeOffset utcNow, CancellationToken cancellationToken)
    {
        var duePlannedRentals = await dbContext.RentalBookings
            .Where(r => r.Status == RentalStatus.Planned)
            .Where(r => r.StartDate <= utcNow)
            .ToListAsync(cancellationToken);

        if (duePlannedRentals.Count == 0)
        {
            return 0;
        }

        foreach (var rental in duePlannedRentals)
        {
            rental.Status = RentalStatus.Active;
            rental.UpdatedAt = utcNow;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return duePlannedRentals.Count;
    }

    public async Task<PagedResult<RentalOverviewRow>> GetOverviewAsync(
        RentalOverviewQuery query,
        CancellationToken cancellationToken)
    {
        var filteredQuery = ApplyOverviewFilters(dbContext.RentalBookings.AsNoTracking(), query);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);

        var orderedQuery = filteredQuery
            .OrderBy(booking => booking.StartDate)
            .ThenBy(booking => booking.Id);

        var offset = (query.Page - 1) * query.PageSize;

        var pageBookings = await orderedQuery
            .Skip(offset)
            .Take(query.PageSize)
            .Include(booking => booking.Lines)
            .ThenInclude(line => line.Item)
            .Include(booking => booking.Item)
            .ToListAsync(cancellationToken);

        var rows = pageBookings
            .Select(ToOverviewRow)
            .ToList();

        var totalPages = totalCount == 0
            ? 0
            : (int)Math.Ceiling(totalCount / (double)query.PageSize);

        return new PagedResult<RentalOverviewRow>(
            rows,
            query.Page,
            query.PageSize,
            totalCount,
            totalPages,
            query.Page > 1,
            totalPages > 0 && query.Page < totalPages);
    }

    public Task<RentalBooking?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return dbContext.RentalBookings
            .Include(r => r.Lines)
            .SingleOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public Task<bool> ItemExistsAsync(Guid itemId, CancellationToken cancellationToken)
    {
        return dbContext.InventoryItems
            .AsNoTracking()
            .AnyAsync(i => i.Id == itemId, cancellationToken);
    }

    public async Task<int> GetReservedOrRentedQuantityAsync(
        Guid itemId,
        DateTimeOffset from,
        DateTimeOffset to,
        Guid? excludeBookingId,
        CancellationToken cancellationToken)
    {
        var query = dbContext.RentalBookings
            .AsNoTracking()
            .Where(r => r.Status == RentalStatus.Planned || r.Status == RentalStatus.Active)
            .Where(r => r.StartDate <= to && r.EndDate >= from);

        if (excludeBookingId.HasValue)
        {
            query = query.Where(r => r.Id != excludeBookingId.Value);
        }

        var bookingIdsQuery = query.Select(r => r.Id);

        var lineSum = await dbContext.RentalBookingLines
            .AsNoTracking()
            .Where(l => l.ItemId == itemId)
            .Where(l => bookingIdsQuery.Contains(l.RentalBookingId))
            .Select(l => (int?)l.Quantity)
            .SumAsync(cancellationToken);

        // Fallback for legacy rows without lines during migration phase.
        var legacySum = await query
            .Where(r => r.ItemId == itemId)
            .Where(r => !dbContext.RentalBookingLines.Any(l => l.RentalBookingId == r.Id))
            .Select(r => (int?)r.Quantity)
            .SumAsync(cancellationToken);

        return (lineSum ?? 0) + (legacySum ?? 0);
    }

    public Task AddAsync(RentalBooking booking, CancellationToken cancellationToken)
    {
        return dbContext.RentalBookings.AddAsync(booking, cancellationToken).AsTask();
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        return dbContext.SaveChangesAsync(cancellationToken);
    }

    private static IQueryable<RentalBooking> ApplyOverviewFilters(
        IQueryable<RentalBooking> query,
        RentalOverviewQuery overview)
    {
        if (!string.IsNullOrWhiteSpace(overview.Search))
        {
            var search = overview.Search.Trim().ToLower();
            query = query.Where(booking =>
                (booking.BorrowerName ?? string.Empty).ToLower().Contains(search)
                || booking.Lines.Any(line => line.Item.Name.ToLower().Contains(search)
                                             || line.Item.InventoryCode.ToLower().Contains(search))
                || booking.Item.Name.ToLower().Contains(search)
                || booking.Item.InventoryCode.ToLower().Contains(search));
        }

        if (overview.Status.HasValue)
        {
            query = query.Where(booking => booking.Status == overview.Status.Value);
        }

        if (overview.ItemId.HasValue)
        {
            var itemId = overview.ItemId.Value;
            query = query.Where(booking => booking.ItemId == itemId || booking.Lines.Any(line => line.ItemId == itemId));
        }

        if (overview.From.HasValue)
        {
            query = query.Where(booking => booking.EndDate >= overview.From.Value);
        }

        if (overview.To.HasValue)
        {
            query = query.Where(booking => booking.StartDate <= overview.To.Value);
        }

        return query;
    }

    private static RentalOverviewRow ToOverviewRow(RentalBooking booking)
    {
        var lines = booking.Lines.Count > 0
            ? booking.Lines
                .Select(line => new
                {
                    Label = $"{line.Item.InventoryCode} - {line.Item.Name}",
                    line.Quantity
                })
                .ToList()
            :
            [
                new
                {
                    Label = $"{booking.Item.InventoryCode} - {booking.Item.Name}",
                    booking.Quantity
                }
            ];

        var itemSummary = string.Join(" | ", lines.Select(line => $"{line.Label} x{line.Quantity}"));
        var totalQuantity = lines.Sum(line => line.Quantity);

        return new RentalOverviewRow(
            booking.Id,
            booking.StartDate,
            booking.EndDate,
            booking.BorrowerName,
            booking.Status,
            totalQuantity,
            itemSummary,
            booking.CreatedAt,
            booking.UpdatedAt);
    }
}
