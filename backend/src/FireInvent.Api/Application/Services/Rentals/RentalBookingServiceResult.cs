using FireInvent.Api.Contracts.Rentals;

namespace FireInvent.Api.Application.Services.Rentals;

public sealed record RentalBookingServiceResult(
    RentalBookingResponse? Booking,
    string? ErrorCode,
    string? ErrorMessage,
    bool NotFound = false)
{
    public static RentalBookingServiceResult Success(RentalBookingResponse booking) =>
        new(booking, null, null);

    public static RentalBookingServiceResult Conflict(string code, string message) =>
        new(null, code, message);

    public static RentalBookingServiceResult Missing() =>
        new(null, null, null, NotFound: true);
}
