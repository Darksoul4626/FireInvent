using FireInvent.Api.Contracts.Availability;
using FireInvent.Api.Domain.Repositories;
using FireInvent.Api.Domain.Repositories.Rentals;

namespace FireInvent.Api.Application.Services.Availability;

public sealed class ItemAvailabilityService(
    IInventoryItemRepository inventoryRepository,
    IRentalBookingRepository rentalRepository) : IItemAvailabilityService
{
    public async Task<ItemAvailabilityServiceResult> GetAsync(
        Guid itemId,
        DateTimeOffset from,
        DateTimeOffset to,
        CancellationToken cancellationToken,
        Guid? excludeBookingId = null)
    {
        var item = await inventoryRepository.GetByIdAsync(itemId, cancellationToken);
        if (item is null)
        {
            return ItemAvailabilityServiceResult.Missing();
        }

        var reservedOrRented = await rentalRepository.GetReservedOrRentedQuantityAsync(
            itemId,
            from,
            to,
            excludeBookingId,
            cancellationToken);

        var available = Math.Max(item.TotalQuantity - reservedOrRented, 0);
        var response = new ItemAvailabilityResponse(
            item.Id,
            item.TotalQuantity,
            reservedOrRented,
            available,
            from,
            to);

        return ItemAvailabilityServiceResult.Success(response);
    }
}
