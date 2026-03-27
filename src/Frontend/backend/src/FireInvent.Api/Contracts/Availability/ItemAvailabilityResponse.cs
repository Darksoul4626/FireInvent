namespace FireInvent.Api.Contracts.Availability;

public sealed record ItemAvailabilityResponse(
    Guid ItemId,
    int TotalQuantity,
    int ReservedOrRentedQuantity,
    int AvailableQuantity,
    DateTimeOffset From,
    DateTimeOffset To);
