using FireInvent.Api.Domain.Enums;

namespace FireInvent.Api.Contracts.InventoryItems;

public sealed record CreateInventoryItemRequest(
    string InventoryCode,
    string Name,
    string Category,
    ItemCondition Condition,
    string Location,
    int TotalQuantity);
