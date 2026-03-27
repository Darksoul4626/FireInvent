namespace FireInvent.Api.Contracts.Rentals;

public sealed record CreateRentalBookingRequest(
    Guid ItemId,
    DateTimeOffset StartDate,
    DateTimeOffset EndDate,
    int Quantity);
