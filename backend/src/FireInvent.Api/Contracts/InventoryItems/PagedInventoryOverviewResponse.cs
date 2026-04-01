namespace FireInvent.Api.Contracts.InventoryItems;

public sealed record PagedInventoryOverviewResponse(
    IReadOnlyList<InventoryOverviewItemResponse> Items,
    int Page,
    int PageSize,
    int TotalCount,
    int TotalPages,
    bool HasPrevious,
    bool HasNext);
