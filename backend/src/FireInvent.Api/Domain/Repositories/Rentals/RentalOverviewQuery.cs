using FireInvent.Api.Domain.Enums;

namespace FireInvent.Api.Domain.Repositories.Rentals;

public sealed record RentalOverviewQuery(
    int Page,
    int PageSize,
    string? Search,
    RentalStatus? Status,
    Guid? ItemId,
    DateTimeOffset? From,
    DateTimeOffset? To);

public sealed record RentalOverviewRow(
    Guid Id,
    DateTimeOffset StartDate,
    DateTimeOffset EndDate,
    string? BorrowerName,
    RentalStatus Status,
    int TotalQuantity,
    string ItemSummary,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
