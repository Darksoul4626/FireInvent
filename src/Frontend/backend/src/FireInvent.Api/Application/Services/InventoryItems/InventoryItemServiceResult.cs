using FireInvent.Api.Contracts.InventoryItems;

namespace FireInvent.Api.Application.Services.InventoryItems;

public sealed record InventoryItemServiceResult(
    InventoryItemResponse? Item,
    string? ErrorCode,
    string? ErrorMessage,
    bool NotFound = false)
{
    public static InventoryItemServiceResult Success(InventoryItemResponse item) =>
        new(item, null, null);

    public static InventoryItemServiceResult Conflict(string code, string message) =>
        new(null, code, message);

    public static InventoryItemServiceResult Missing() =>
        new(null, null, null, NotFound: true);
}
