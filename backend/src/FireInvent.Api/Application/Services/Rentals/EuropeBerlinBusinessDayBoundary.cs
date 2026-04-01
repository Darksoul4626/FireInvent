namespace FireInvent.Api.Application.Services.Rentals;

public sealed class EuropeBerlinBusinessDayBoundary(TimeProvider timeProvider) : IBusinessDayBoundary
{
    private static readonly TimeZoneInfo BerlinTimeZone = ResolveBerlinTimeZone();

    public DateOnly GetCurrentBusinessDate()
    {
        var berlinNow = TimeZoneInfo.ConvertTime(timeProvider.GetUtcNow(), BerlinTimeZone);
        return DateOnly.FromDateTime(berlinNow.DateTime);
    }

    public DateOnly ToBusinessDate(DateTimeOffset value)
    {
        var berlinDate = TimeZoneInfo.ConvertTime(value, BerlinTimeZone);
        return DateOnly.FromDateTime(berlinDate.DateTime);
    }

    private static TimeZoneInfo ResolveBerlinTimeZone()
    {
        foreach (var id in new[] { "Europe/Berlin", "W. Europe Standard Time" })
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById(id);
            }
            catch (TimeZoneNotFoundException)
            {
                continue;
            }
            catch (InvalidTimeZoneException)
            {
                continue;
            }
        }

        throw new InvalidOperationException("Could not resolve Europe/Berlin timezone on this host.");
    }
}
