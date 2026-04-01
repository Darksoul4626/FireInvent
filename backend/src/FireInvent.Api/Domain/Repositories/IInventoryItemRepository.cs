using FireInvent.Api.Domain.Entities;

namespace FireInvent.Api.Domain.Repositories;

public interface IInventoryItemRepository
{
    Task<IReadOnlyList<InventoryItem>> GetAllAsync(CancellationToken cancellationToken);
    Task<PagedResult<InventoryOverviewRow>> GetOverviewAsync(InventoryOverviewQuery query, CancellationToken cancellationToken);
    Task<InventoryItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<InventoryCategory?> GetCategoryByNameAsync(string categoryName, CancellationToken cancellationToken);
    Task<bool> ExistsByInventoryCodeAsync(string inventoryCode, CancellationToken cancellationToken);
    Task<bool> HasLinkedRentalsAsync(Guid itemId, CancellationToken cancellationToken);
    Task AddCategoryAsync(InventoryCategory category, CancellationToken cancellationToken);
    Task AddAsync(InventoryItem item, CancellationToken cancellationToken);
    Task RemoveAsync(InventoryItem item, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
