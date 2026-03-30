namespace FireInvent.Api.Contracts.Categories;

public sealed record InventoryCategoryResponse(
    Guid Id,
    string Name,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
