using FireInvent.Api.Domain.Entities;
using FireInvent.Api.Domain.Repositories;

namespace FireInvent.Api.Domain.Repositories.Rentals;

public interface IRentalBookingRepository
{
    Task<IReadOnlyList<RentalBooking>> GetAllAsync(CancellationToken cancellationToken);
    Task<PagedResult<RentalOverviewRow>> GetOverviewAsync(RentalOverviewQuery query, CancellationToken cancellationToken);
    Task<RentalBooking?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<int> ActivateDuePlannedAsync(DateTimeOffset utcNow, CancellationToken cancellationToken);
    Task<bool> ItemExistsAsync(Guid itemId, CancellationToken cancellationToken);
    Task<int> GetReservedOrRentedQuantityAsync(
        Guid itemId,
        DateTimeOffset from,
        DateTimeOffset to,
        Guid? excludeBookingId,
        CancellationToken cancellationToken);
    Task AddAsync(RentalBooking booking, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
