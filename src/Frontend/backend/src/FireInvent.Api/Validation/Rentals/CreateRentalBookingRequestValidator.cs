using FireInvent.Api.Contracts.Rentals;
using FluentValidation;

namespace FireInvent.Api.Validation.Rentals;

public sealed class CreateRentalBookingRequestValidator : AbstractValidator<CreateRentalBookingRequest>
{
    public CreateRentalBookingRequestValidator()
    {
        RuleFor(x => x.Lines)
            .NotNull()
            .Must(lines => lines is { Count: > 0 })
            .WithMessage("At least one rental line is required.");

        RuleForEach(x => x.Lines)
            .ChildRules(line =>
            {
                line.RuleFor(l => l.ItemId)
                    .NotEqual(Guid.Empty);

                line.RuleFor(l => l.Quantity)
                    .GreaterThan(0);
            });

        RuleFor(x => x.EndDate)
            .GreaterThanOrEqualTo(x => x.StartDate);

        RuleFor(x => x.BorrowerName)
            .MaximumLength(256);
    }
}
