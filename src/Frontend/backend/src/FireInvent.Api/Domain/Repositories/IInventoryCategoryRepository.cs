using FireInvent.Api.Domain.Entities;

namespace FireInvent.Api.Domain.Repositories;

public interface IInventoryCategoryRepository
{
    Task<IReadOnlyList<InventoryCategory>> GetAllAsync(CancellationToken cancellationToken);
    Task<InventoryCategory?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<InventoryCategory?> GetByNameAsync(string name, CancellationToken cancellationToken);
    Task<bool> HasInventoryItemsAsync(Guid categoryId, CancellationToken cancellationToken);
    Task AddAsync(InventoryCategory category, CancellationToken cancellationToken);
    Task RemoveAsync(InventoryCategory category, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
