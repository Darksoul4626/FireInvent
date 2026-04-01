using FireInvent.Api.Application.Services.Availability;
using FireInvent.Api.Contracts.Availability;
using FireInvent.Api.Infrastructure.Http;
using Microsoft.AspNetCore.Mvc;

namespace FireInvent.Api.Controllers;

[ApiController]
[Route("api/items/{itemId:guid}/availability")]
public sealed class AvailabilityController(IItemAvailabilityService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ItemAvailabilityResponse>> Get(
        Guid itemId,
        [FromQuery] GetItemAvailabilityQuery query,
        CancellationToken cancellationToken)
    {
        var result = await service.GetAsync(itemId, query.From, query.To, cancellationToken);
        if (result.NotFound)
        {
            return NotFound(ApiProblemDetails.NotFound(
                "Inventory item not found",
                $"No inventory item exists for id '{itemId}'.",
                "item_not_found"));
        }

        return Ok(result.Availability);
    }
}
