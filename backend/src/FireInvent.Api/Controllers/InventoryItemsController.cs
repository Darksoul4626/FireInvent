using FireInvent.Api.Application.Services.InventoryItems;
using FireInvent.Api.Contracts.InventoryItems;
using FireInvent.Api.Infrastructure.Http;
using Microsoft.AspNetCore.Mvc;

namespace FireInvent.Api.Controllers;

[ApiController]
[Route("api/items")]
public sealed class InventoryItemsController(IInventoryItemService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<InventoryItemResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var items = await service.GetAllAsync(cancellationToken);
        return Ok(items);
    }

    [HttpGet("overview")]
    public async Task<ActionResult<PagedInventoryOverviewResponse>> GetOverview(
        [FromQuery] GetInventoryOverviewQuery query,
        CancellationToken cancellationToken)
    {
        var overview = await service.GetOverviewAsync(query, cancellationToken);
        return Ok(overview);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<InventoryItemResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var item = await service.GetByIdAsync(id, cancellationToken);

        if (item is null)
        {
            return NotFound(ApiProblemDetails.NotFound(
                "Inventory item not found",
                $"No inventory item exists for id '{id}'.",
                "item_not_found"));
        }

        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<InventoryItemResponse>> Create(
        [FromBody] CreateInventoryItemRequest request,
        CancellationToken cancellationToken)
    {
        var result = await service.CreateAsync(request, cancellationToken);
        if (result.ErrorCode is not null)
        {
            return Conflict(ApiProblemDetails.Conflict(
                "Inventory code already exists",
                result.ErrorMessage ?? "Inventory code conflict.",
                result.ErrorCode));
        }

        var item = result.Item!;
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<InventoryItemResponse>> Update(
        Guid id,
        [FromBody] UpdateInventoryItemRequest request,
        CancellationToken cancellationToken)
    {
        var result = await service.UpdateAsync(id, request, cancellationToken);
        if (result.NotFound)
        {
            return NotFound(ApiProblemDetails.NotFound(
                "Inventory item not found",
                $"No inventory item exists for id '{id}'.",
                "item_not_found"));
        }

        return Ok(result.Item);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await service.DeleteAsync(id, cancellationToken);
        if (result.NotFound)
        {
            return NotFound(ApiProblemDetails.NotFound(
                "Inventory item not found",
                $"No inventory item exists for id '{id}'.",
                "item_not_found"));
        }

        if (result.ErrorCode is not null)
        {
            return Conflict(ApiProblemDetails.Conflict(
                "Item cannot be deleted",
                result.ErrorMessage ?? "Inventory item delete conflict.",
                result.ErrorCode));
        }

        return NoContent();
    }
}
