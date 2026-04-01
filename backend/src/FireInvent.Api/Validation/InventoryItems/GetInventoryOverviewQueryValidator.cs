using FireInvent.Api.Contracts.InventoryItems;
using FireInvent.Api.Domain.Enums;
using FluentValidation;

namespace FireInvent.Api.Validation.InventoryItems;

public sealed class GetInventoryOverviewQueryValidator : AbstractValidator<GetInventoryOverviewQuery>
{
    public GetInventoryOverviewQueryValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThanOrEqualTo(1);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 200);

        RuleFor(x => x.Condition)
            .Must(condition => string.IsNullOrWhiteSpace(condition) || Enum.TryParse<ItemCondition>(condition, true, out _))
            .WithMessage("Condition must be a valid item condition.");
    }
}
