using FireInvent.Api.Domain.Enums;

namespace FireInvent.Api.Contracts.InventoryItems;

public sealed record InventoryOverviewItemResponse(
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
