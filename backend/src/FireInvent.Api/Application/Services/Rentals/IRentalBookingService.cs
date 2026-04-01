using FireInvent.Api.Contracts.Rentals;

namespace FireInvent.Api.Application.Services.Rentals;

public interface IRentalBookingService
{
    Task<IReadOnlyList<RentalBookingResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<PagedRentalOverviewResponse> GetOverviewAsync(GetRentalOverviewQuery query, CancellationToken cancellationToken);
    Task<RentalBookingResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<RentalBookingServiceResult> CreateAsync(CreateRentalBookingRequest request, CancellationToken cancellationToken);
    Task<RentalBookingServiceResult> UpdateAsync(Guid id, UpdateRentalBookingRequest request, CancellationToken cancellationToken);
    Task<RentalBookingServiceResult> CancelAsync(Guid id, CancellationToken cancellationToken);
    Task<RentalBookingServiceResult> ReturnAsync(Guid id, CancellationToken cancellationToken);
    Task<RentalBookingServiceResult> CompleteAsync(Guid id, CancellationToken cancellationToken);
}
