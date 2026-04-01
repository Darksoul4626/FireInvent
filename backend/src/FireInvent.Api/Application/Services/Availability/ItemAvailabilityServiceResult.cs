using FireInvent.Api.Contracts.Availability;

namespace FireInvent.Api.Application.Services.Availability;

public sealed record ItemAvailabilityServiceResult(
    ItemAvailabilityResponse? Availability,
    bool NotFound = false)
{
    public static ItemAvailabilityServiceResult Success(ItemAvailabilityResponse availability) =>
        new(availability, NotFound: false);

    public static ItemAvailabilityServiceResult Missing() =>
        new(null, NotFound: true);
}
