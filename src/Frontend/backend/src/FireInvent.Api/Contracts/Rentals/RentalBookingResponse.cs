using FireInvent.Api.Domain.Enums;

namespace FireInvent.Api.Contracts.Rentals;

public sealed record RentalBookingResponse(
    Guid Id,
    Guid ItemId,
    DateTimeOffset StartDate,
    DateTimeOffset EndDate,
    int Quantity,
    RentalStatus Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
