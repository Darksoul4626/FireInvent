namespace FireInvent.Api.Contracts.Rentals;

public sealed record PagedRentalOverviewResponse(
    IReadOnlyList<RentalOverviewItemResponse> Items,
    int Page,
    int PageSize,
    int TotalCount,
    int TotalPages,
    bool HasPrevious,
    bool HasNext);
