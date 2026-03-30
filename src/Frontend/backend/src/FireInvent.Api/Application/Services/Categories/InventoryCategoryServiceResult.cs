using FireInvent.Api.Contracts.Categories;

namespace FireInvent.Api.Application.Services.Categories;

public sealed record InventoryCategoryServiceResult(
    InventoryCategoryResponse? Category,
    string? ErrorCode,
    string? ErrorMessage,
    bool NotFound = false)
{
    public static InventoryCategoryServiceResult Success(InventoryCategoryResponse category) =>
        new(category, null, null);

    public static InventoryCategoryServiceResult Conflict(string code, string message) =>
        new(null, code, message);

    public static InventoryCategoryServiceResult Missing() =>
        new(null, null, null, NotFound: true);
}
