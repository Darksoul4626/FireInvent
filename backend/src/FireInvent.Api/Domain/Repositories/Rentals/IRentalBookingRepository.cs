using FireInvent.Api.Domain.Entities;

namespace FireInvent.Api.Domain.Repositories.Rentals;

public interface IRentalBookingRepository
{
    Task<IReadOnlyList<RentalBooking>> GetAllAsync(CancellationToken cancellationToken);
    Task<RentalBooking?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
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
