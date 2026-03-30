using FireInvent.Api.Domain.Enums;

namespace FireInvent.Api.Contracts.Rentals;

public sealed record UpdateRentalBookingRequest(
    DateTimeOffset StartDate,
    DateTimeOffset EndDate,
    IReadOnlyList<RentalBookingLineRequest> Lines,
    string? BorrowerName,
    RentalStatus Status);
