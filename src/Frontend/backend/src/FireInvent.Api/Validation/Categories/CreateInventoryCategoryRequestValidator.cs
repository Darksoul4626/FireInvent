using FireInvent.Api.Contracts.Categories;
using FluentValidation;

namespace FireInvent.Api.Validation.Categories;

public sealed class CreateInventoryCategoryRequestValidator : AbstractValidator<CreateInventoryCategoryRequest>
{
    public CreateInventoryCategoryRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(128);
    }
}
