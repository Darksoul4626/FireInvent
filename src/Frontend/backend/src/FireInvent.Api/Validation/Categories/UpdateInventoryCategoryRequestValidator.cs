using FireInvent.Api.Contracts.Categories;
using FluentValidation;

namespace FireInvent.Api.Validation.Categories;

public sealed class UpdateInventoryCategoryRequestValidator : AbstractValidator<UpdateInventoryCategoryRequest>
{
    public UpdateInventoryCategoryRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(128);
    }
}
