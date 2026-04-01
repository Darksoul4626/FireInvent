using FireInvent.Api.Application.Services.Rentals;
using FireInvent.Api.Contracts.Rentals;
using FireInvent.Api.Infrastructure.Http;
using Microsoft.AspNetCore.Mvc;

namespace FireInvent.Api.Controllers;

[ApiController]
[Route("api/rentals")]
public sealed class RentalBookingsController(IRentalBookingService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<RentalBookingResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var rentals = await service.GetAllAsync(cancellationToken);
        return Ok(rentals);
    }

    [HttpGet("overview")]
    public async Task<ActionResult<PagedRentalOverviewResponse>> GetOverview(
        [FromQuery] GetRentalOverviewQuery query,
        CancellationToken cancellationToken)
    {
        var overview = await service.GetOverviewAsync(query, cancellationToken);
        return Ok(overview);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<RentalBookingResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var rental = await service.GetByIdAsync(id, cancellationToken);
        return rental is null
            ? NotFound(ApiProblemDetails.NotFound(
                "Rental booking not found",
                $"No rental booking exists for id '{id}'.",
                "rental_not_found"))
            : Ok(rental);
    }

    [HttpPost]
    public async Task<ActionResult<RentalBookingResponse>> Create(
        [FromBody] CreateRentalBookingRequest request,
        CancellationToken cancellationToken)
    {
        var result = await service.CreateAsync(request, cancellationToken);
        if (result.ErrorCode is not null)
        {
            return Conflict(ApiProblemDetails.Conflict(
                "Rental creation failed",
                result.ErrorMessage ?? "Rental create conflict.",
                result.ErrorCode));
        }

        var rental = result.Booking!;
        return CreatedAtAction(nameof(GetById), new { id = rental.Id }, rental);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<RentalBookingResponse>> Update(
        Guid id,
        [FromBody] UpdateRentalBookingRequest request,
        CancellationToken cancellationToken)
    {
        var result = await service.UpdateAsync(id, request, cancellationToken);
        if (result.NotFound)
        {
            return NotFound(ApiProblemDetails.NotFound(
                "Rental booking not found",
                $"No rental booking exists for id '{id}'.",
                "rental_not_found"));
        }

        if (result.ErrorCode is not null)
        {
            return Conflict(ApiProblemDetails.Conflict(
                "Rental update failed",
                result.ErrorMessage ?? "Rental update conflict.",
                result.ErrorCode));
        }

        return Ok(result.Booking);
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<ActionResult<RentalBookingResponse>> Cancel(Guid id, CancellationToken cancellationToken)
    {
        var result = await service.CancelAsync(id, cancellationToken);
        if (result.NotFound)
        {
            return NotFound(ApiProblemDetails.NotFound(
                "Rental booking not found",
                $"No rental booking exists for id '{id}'.",
                "rental_not_found"));
        }

        if (result.ErrorCode is not null)
        {
            return Conflict(ApiProblemDetails.Conflict(
                "Rental cancel failed",
                result.ErrorMessage ?? "Rental cancel conflict.",
                result.ErrorCode));
        }

        return Ok(result.Booking);
    }

    [HttpPost("{id:guid}/return")]
    public async Task<ActionResult<RentalBookingResponse>> Return(Guid id, CancellationToken cancellationToken)
    {
        var result = await service.ReturnAsync(id, cancellationToken);
        if (result.NotFound)
        {
            return NotFound(ApiProblemDetails.NotFound(
                "Rental booking not found",
                $"No rental booking exists for id '{id}'.",
                "rental_not_found"));
        }

        if (result.ErrorCode is not null)
        {
            return Conflict(ApiProblemDetails.Conflict(
                "Rental return failed",
                result.ErrorMessage ?? "Rental return conflict.",
                result.ErrorCode));
        }

        return Ok(result.Booking);
    }

    [HttpPost("{id:guid}/complete")]
    public async Task<ActionResult<RentalBookingResponse>> Complete(Guid id, CancellationToken cancellationToken)
    {
        var result = await service.CompleteAsync(id, cancellationToken);
        if (result.NotFound)
        {
            return NotFound(ApiProblemDetails.NotFound(
                "Rental booking not found",
                $"No rental booking exists for id '{id}'.",
                "rental_not_found"));
        }

        if (result.ErrorCode is not null)
        {
            return Conflict(ApiProblemDetails.Conflict(
                "Rental completion failed",
                result.ErrorMessage ?? "Rental completion conflict.",
                result.ErrorCode));
        }

        return Ok(result.Booking);
    }
}
