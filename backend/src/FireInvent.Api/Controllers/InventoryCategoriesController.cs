using FireInvent.Api.Application.Services.Categories;
using FireInvent.Api.Contracts.Categories;
using FireInvent.Api.Infrastructure.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.AspNetCore.Mvc;

namespace FireInvent.Api.Controllers;

[ApiController]
[Route("api/categories")]
public sealed class InventoryCategoriesController(
    IInventoryCategoryService service,
    IMemoryCache cache) : ControllerBase
{
    private const string CategoryCacheKey = "api:categories:all";
    private static readonly TimeSpan CategoryCacheDuration = TimeSpan.FromMinutes(5);

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<InventoryCategoryResponse>>> GetAll(CancellationToken cancellationToken)
    {
        if (cache.TryGetValue(CategoryCacheKey, out IReadOnlyList<InventoryCategoryResponse>? cached)
            && cached is not null)
        {
            return Ok(cached);
        }

        var categories = await service.GetAllAsync(cancellationToken);

        cache.Set(CategoryCacheKey, categories, new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = CategoryCacheDuration
        });

        return Ok(categories);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<InventoryCategoryResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var category = await service.GetByIdAsync(id, cancellationToken);
        if (category is null)
        {
            return NotFound(ApiProblemDetails.NotFound(
                "Category not found",
                $"No category exists for id '{id}'.",
                "category_not_found"));
        }

        return Ok(category);
    }

    [HttpPost]
    public async Task<ActionResult<InventoryCategoryResponse>> Create(
        [FromBody] CreateInventoryCategoryRequest request,
        CancellationToken cancellationToken)
    {
        var result = await service.CreateAsync(request, cancellationToken);
        if (result.ErrorCode is not null)
        {
            return Conflict(ApiProblemDetails.Conflict(
                "Category create failed",
                result.ErrorMessage ?? "Category create conflict.",
                result.ErrorCode));
        }

        var category = result.Category!;
        InvalidateCategoryCache();
        return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<InventoryCategoryResponse>> Update(
        Guid id,
        [FromBody] UpdateInventoryCategoryRequest request,
        CancellationToken cancellationToken)
    {
        var result = await service.UpdateAsync(id, request, cancellationToken);
        if (result.NotFound)
        {
            return NotFound(ApiProblemDetails.NotFound(
                "Category not found",
                $"No category exists for id '{id}'.",
                "category_not_found"));
        }

        if (result.ErrorCode is not null)
        {
            return Conflict(ApiProblemDetails.Conflict(
                "Category update failed",
                result.ErrorMessage ?? "Category update conflict.",
                result.ErrorCode));
        }

        InvalidateCategoryCache();
        return Ok(result.Category);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await service.DeleteAsync(id, cancellationToken);
        if (result.NotFound)
        {
            return NotFound(ApiProblemDetails.NotFound(
                "Category not found",
                $"No category exists for id '{id}'.",
                "category_not_found"));
        }

        if (result.ErrorCode is not null)
        {
            return Conflict(ApiProblemDetails.Conflict(
                "Category delete failed",
                result.ErrorMessage ?? "Category delete conflict.",
                result.ErrorCode));
        }

        InvalidateCategoryCache();
        return NoContent();
    }

    private void InvalidateCategoryCache()
    {
        cache.Remove(CategoryCacheKey);
    }
}
