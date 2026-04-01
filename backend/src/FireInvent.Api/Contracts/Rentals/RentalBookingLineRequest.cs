namespace FireInvent.Api.Contracts.Rentals;

public sealed record RentalBookingLineRequest(
    Guid ItemId,
    int Quantity);
