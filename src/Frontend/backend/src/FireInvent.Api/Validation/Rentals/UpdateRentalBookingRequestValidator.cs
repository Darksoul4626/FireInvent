using FireInvent.Api.Contracts.Rentals;
using FluentValidation;

namespace FireInvent.Api.Validation.Rentals;

public sealed class UpdateRentalBookingRequestValidator : AbstractValidator<UpdateRentalBookingRequest>
{
    public UpdateRentalBookingRequestValidator()
    {
        RuleFor(x => x.Quantity)
            .GreaterThan(0);

        RuleFor(x => x.EndDate)
            .GreaterThanOrEqualTo(x => x.StartDate);
    }
}
