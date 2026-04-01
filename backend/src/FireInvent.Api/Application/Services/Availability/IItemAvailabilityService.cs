namespace FireInvent.Api.Application.Services.Availability;

public interface IItemAvailabilityService
{
    Task<ItemAvailabilityServiceResult> GetAsync(
        Guid itemId,
        DateTimeOffset from,
        DateTimeOffset to,
    CancellationToken cancellationToken,
    Guid? excludeBookingId = null);
}
