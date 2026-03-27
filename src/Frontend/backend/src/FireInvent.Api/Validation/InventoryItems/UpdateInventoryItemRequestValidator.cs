using FireInvent.Api.Contracts.InventoryItems;
using FluentValidation;

namespace FireInvent.Api.Validation.InventoryItems;

public sealed class UpdateInventoryItemRequestValidator : AbstractValidator<UpdateInventoryItemRequest>
{
    public UpdateInventoryItemRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(256);

        RuleFor(x => x.Category)
            .NotEmpty()
            .MaximumLength(128);

        RuleFor(x => x.Location)
            .NotEmpty()
            .MaximumLength(128);

        RuleFor(x => x.TotalQuantity)
            .GreaterThan(0);
    }
}
