namespace FireInvent.Api.Contracts.Availability;

public sealed record GetItemAvailabilityQuery(
    DateTimeOffset From,
    DateTimeOffset To,
    Guid? ExcludeBookingId = null);
