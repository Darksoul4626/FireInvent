using FireInvent.Api.Domain.Enums;

namespace FireInvent.Api.Contracts.Rentals;

public sealed record RentalOverviewItemResponse(
    Guid Id,
    DateTimeOffset StartDate,
    DateTimeOffset EndDate,
    string? BorrowerName,
    RentalStatus Status,
    int TotalQuantity,
    string ItemSummary,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
