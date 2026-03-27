namespace FireInvent.Api.Contracts.Rentals;

public sealed record UpdateRentalBookingRequest(
    DateTimeOffset StartDate,
    DateTimeOffset EndDate,
    int Quantity);
