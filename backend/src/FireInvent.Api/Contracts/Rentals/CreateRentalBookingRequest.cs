namespace FireInvent.Api.Contracts.Rentals;

public sealed record CreateRentalBookingRequest(
    DateTimeOffset StartDate,
    DateTimeOffset EndDate,
    IReadOnlyList<RentalBookingLineRequest> Lines,
    string? BorrowerName);
