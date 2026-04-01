using FireInvent.Api.Domain.Entities;
using FireInvent.Api.Domain.Enums;
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
}
