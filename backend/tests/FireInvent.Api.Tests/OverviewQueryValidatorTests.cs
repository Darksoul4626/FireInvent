using FireInvent.Api.Contracts.InventoryItems;
using FireInvent.Api.Contracts.Rentals;
using FireInvent.Api.Validation.InventoryItems;
using FireInvent.Api.Validation.Rentals;

namespace FireInvent.Api.Tests;

public sealed class OverviewQueryValidatorTests
{
    [Fact]
    public void InventoryOverviewQuery_RejectsInvalidPage()
    {
        var validator = new GetInventoryOverviewQueryValidator();

        var result = validator.Validate(new GetInventoryOverviewQuery
        {
            Page = 0,
            PageSize = 20
        });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.PropertyName == "Page");
    }

    [Fact]
    public void RentalOverviewQuery_RejectsInvalidDateRange()
    {
        var validator = new GetRentalOverviewQueryValidator();

        var result = validator.Validate(new GetRentalOverviewQuery
        {
            Page = 1,
            PageSize = 20,
            From = new DateTimeOffset(2026, 4, 5, 0, 0, 0, TimeSpan.Zero),
            To = new DateTimeOffset(2026, 4, 1, 0, 0, 0, TimeSpan.Zero)
        });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.PropertyName == "To");
    }
}
