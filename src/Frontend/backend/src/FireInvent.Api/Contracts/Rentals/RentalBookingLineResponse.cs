namespace FireInvent.Api.Contracts.Rentals;

public sealed record RentalBookingLineResponse(
    Guid ItemId,
    int Quantity);
