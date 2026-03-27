using FireInvent.Api.Contracts.InventoryItems;
using FireInvent.Api.Domain.Entities;
using FireInvent.Api.Domain.Repositories;

namespace FireInvent.Api.Application.Services.InventoryItems;

public sealed class InventoryItemService(IInventoryItemRepository repository) : IInventoryItemService
{
    public async Task<IReadOnlyList<InventoryItemResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        var items = await repository.GetAllAsync(cancellationToken);
        return items.Select(ToResponse).ToList();
    }

    public async Task<InventoryItemResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var item = await repository.GetByIdAsync(id, cancellationToken);
        return item is null ? null : ToResponse(item);
    }

    public async Task<InventoryItemServiceResult> CreateAsync(
        CreateInventoryItemRequest request,
        CancellationToken cancellationToken)
    {
        var code = request.InventoryCode.Trim();
        var exists = await repository.ExistsByInventoryCodeAsync(code, cancellationToken);
        if (exists)
        {
            return InventoryItemServiceResult.Conflict(
                "inventory_code_conflict",
                $"An item with code '{code}' already exists.");
        }

        var now = DateTimeOffset.UtcNow;
        var item = new InventoryItem
        {
            Id = Guid.NewGuid(),
            InventoryCode = code,
            Name = request.Name.Trim(),
            Category = request.Category.Trim(),
            Condition = request.Condition,
            Location = request.Location.Trim(),
            TotalQuantity = request.TotalQuantity,
            CreatedAt = now,
            UpdatedAt = now
        };

        await repository.AddAsync(item, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        return InventoryItemServiceResult.Success(ToResponse(item));
    }

    public async Task<InventoryItemServiceResult> UpdateAsync(
        Guid id,
        UpdateInventoryItemRequest request,
        CancellationToken cancellationToken)
    {
        var item = await repository.GetByIdAsync(id, cancellationToken);
        if (item is null)
        {
            return InventoryItemServiceResult.Missing();
        }

        item.Name = request.Name.Trim();
        item.Category = request.Category.Trim();
        item.Condition = request.Condition;
        item.Location = request.Location.Trim();
        item.TotalQuantity = request.TotalQuantity;
        item.UpdatedAt = DateTimeOffset.UtcNow;

        await repository.SaveChangesAsync(cancellationToken);
        return InventoryItemServiceResult.Success(ToResponse(item));
    }

    public async Task<InventoryItemServiceResult> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var item = await repository.GetByIdAsync(id, cancellationToken);
        if (item is null)
        {
            return InventoryItemServiceResult.Missing();
        }

        var hasLinkedRentals = await repository.HasLinkedRentalsAsync(id, cancellationToken);
        if (hasLinkedRentals)
        {
            return InventoryItemServiceResult.Conflict(
                "item_has_rentals",
                "The item has rental history and cannot be removed.");
        }

        await repository.RemoveAsync(item, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        return InventoryItemServiceResult.Success(ToResponse(item));
    }

    private static InventoryItemResponse ToResponse(InventoryItem item)
    {
        return new InventoryItemResponse(
            item.Id,
            item.InventoryCode,
            item.Name,
            item.Category,
            item.Condition,
            item.Location,
            item.TotalQuantity,
            item.CreatedAt,
            item.UpdatedAt);
    }
}
