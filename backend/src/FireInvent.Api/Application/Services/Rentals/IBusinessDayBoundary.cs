namespace FireInvent.Api.Application.Services.Rentals;

public interface IBusinessDayBoundary
{
    DateOnly GetCurrentBusinessDate();
    DateOnly ToBusinessDate(DateTimeOffset value);
}
