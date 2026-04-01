namespace FireInvent.Api.Contracts.InventoryItems;

public sealed class GetInventoryOverviewQuery
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string? Search { get; init; }
    public string? Category { get; init; }
    public string? Condition { get; init; }
    public DateTimeOffset? At { get; init; }
}
