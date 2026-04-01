using FireInvent.Api.Contracts.Rentals;
using FireInvent.Api.Domain.Enums;
using FluentValidation;

namespace FireInvent.Api.Validation.Rentals;

public sealed class GetRentalOverviewQueryValidator : AbstractValidator<GetRentalOverviewQuery>
{
    public GetRentalOverviewQueryValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThanOrEqualTo(1);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 200);

        RuleFor(x => x.Status)
            .Must(status => string.IsNullOrWhiteSpace(status) || Enum.TryParse<RentalStatus>(status, true, out _))
            .WithMessage("Status must be a valid rental status.");

        RuleFor(x => x.To)
            .GreaterThanOrEqualTo(x => x.From)
            .When(x => x.From.HasValue && x.To.HasValue);
    }
}
