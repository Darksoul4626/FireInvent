using FireInvent.Api.Contracts.Availability;
using FluentValidation;

namespace FireInvent.Api.Validation.Availability;

public sealed class GetItemAvailabilityQueryValidator : AbstractValidator<GetItemAvailabilityQuery>
{
    public GetItemAvailabilityQueryValidator()
    {
        RuleFor(x => x.To)
            .GreaterThanOrEqualTo(x => x.From);
    }
}
