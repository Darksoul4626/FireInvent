using FireInvent.Api.Contracts.Categories;
using FireInvent.Api.Domain.Entities;
using FireInvent.Api.Domain.Repositories;

namespace FireInvent.Api.Application.Services.Categories;

public sealed class InventoryCategoryService(IInventoryCategoryRepository repository) : IInventoryCategoryService
{
    public async Task<IReadOnlyList<InventoryCategoryResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        var categories = await repository.GetAllAsync(cancellationToken);
        return categories.Select(ToResponse).ToList();
    }

    public async Task<InventoryCategoryResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var category = await repository.GetByIdAsync(id, cancellationToken);
        return category is null ? null : ToResponse(category);
    }

    public async Task<InventoryCategoryServiceResult> CreateAsync(
        CreateInventoryCategoryRequest request,
        CancellationToken cancellationToken)
    {
        var name = request.Name.Trim();
        var exists = await repository.GetByNameAsync(name, cancellationToken);
        if (exists is not null)
        {
            return InventoryCategoryServiceResult.Conflict(
                "category_name_conflict",
                $"A category with name '{name}' already exists.");
        }

        var now = DateTimeOffset.UtcNow;
        var category = new InventoryCategory
        {
            Id = Guid.NewGuid(),
            Name = name,
            CreatedAt = now,
            UpdatedAt = now
        };

        await repository.AddAsync(category, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        return InventoryCategoryServiceResult.Success(ToResponse(category));
    }

    public async Task<InventoryCategoryServiceResult> UpdateAsync(
        Guid id,
        UpdateInventoryCategoryRequest request,
        CancellationToken cancellationToken)
    {
        var category = await repository.GetByIdAsync(id, cancellationToken);
        if (category is null)
        {
            return InventoryCategoryServiceResult.Missing();
        }

        var name = request.Name.Trim();
        var existing = await repository.GetByNameAsync(name, cancellationToken);
        if (existing is not null && existing.Id != id)
        {
            return InventoryCategoryServiceResult.Conflict(
                "category_name_conflict",
                $"A category with name '{name}' already exists.");
        }

        category.Name = name;
        category.UpdatedAt = DateTimeOffset.UtcNow;

        await repository.SaveChangesAsync(cancellationToken);
        return InventoryCategoryServiceResult.Success(ToResponse(category));
    }

    public async Task<InventoryCategoryServiceResult> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var category = await repository.GetByIdAsync(id, cancellationToken);
        if (category is null)
        {
            return InventoryCategoryServiceResult.Missing();
        }

        var hasItems = await repository.HasInventoryItemsAsync(id, cancellationToken);
        if (hasItems)
        {
            return InventoryCategoryServiceResult.Conflict(
                "category_in_use",
                "Category is assigned to inventory items and cannot be deleted.");
        }

        await repository.RemoveAsync(category, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        return InventoryCategoryServiceResult.Success(ToResponse(category));
    }

    private static InventoryCategoryResponse ToResponse(InventoryCategory category)
    {
        return new InventoryCategoryResponse(category.Id, category.Name, category.CreatedAt, category.UpdatedAt);
    }
}
