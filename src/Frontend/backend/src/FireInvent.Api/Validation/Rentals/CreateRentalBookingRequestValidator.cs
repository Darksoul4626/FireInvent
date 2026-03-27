using FireInvent.Api.Contracts.Rentals;
using FluentValidation;

namespace FireInvent.Api.Validation.Rentals;

public sealed class CreateRentalBookingRequestValidator : AbstractValidator<CreateRentalBookingRequest>
{
    public CreateRentalBookingRequestValidator()
    {
        RuleFor(x => x.ItemId)
            .NotEqual(Guid.Empty);

        RuleFor(x => x.Quantity)
            .GreaterThan(0);

        RuleFor(x => x.EndDate)
            .GreaterThanOrEqualTo(x => x.StartDate);
    }
}
