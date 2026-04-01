using FireInvent.Api.Domain.Enums;

namespace FireInvent.Api.Contracts.Rentals;

public sealed record RentalBookingResponse(
    Guid Id,
    DateTimeOffset StartDate,
    DateTimeOffset EndDate,
    IReadOnlyList<RentalBookingLineResponse> Lines,
    string? BorrowerName,
    RentalStatus Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
