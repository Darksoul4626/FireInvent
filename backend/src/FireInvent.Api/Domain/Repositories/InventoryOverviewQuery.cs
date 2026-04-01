using FireInvent.Api.Domain.Enums;

namespace FireInvent.Api.Domain.Repositories;

public sealed record InventoryOverviewQuery(
    int Page,
    int PageSize,
    string? Search,
    string? Category,
    ItemCondition? Condition,
    DateTimeOffset At);

public sealed record InventoryOverviewRow(
    Guid Id,
    string InventoryCode,
    string Name,
    string Category,
    ItemCondition Condition,
    string Location,
    int TotalQuantity,
    int Rented,
    int Available,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
