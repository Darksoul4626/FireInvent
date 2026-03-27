using FireInvent.Api.Domain.Enums;

namespace FireInvent.Api.Contracts.InventoryItems;

public sealed record InventoryItemResponse(
    Guid Id,
    string InventoryCode,
    string Name,
    string Category,
    ItemCondition Condition,
    string Location,
    int TotalQuantity,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
