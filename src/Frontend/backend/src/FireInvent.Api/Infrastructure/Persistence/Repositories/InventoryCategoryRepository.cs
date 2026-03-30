using FireInvent.Api.Domain.Entities;
using FireInvent.Api.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FireInvent.Api.Infrastructure.Persistence.Repositories;

public sealed class InventoryCategoryRepository(FireInventDbContext dbContext) : IInventoryCategoryRepository
{
    public async Task<IReadOnlyList<InventoryCategory>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await dbContext.InventoryCategories
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);
    }

    public Task<InventoryCategory?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return dbContext.InventoryCategories.SingleOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public Task<InventoryCategory?> GetByNameAsync(string name, CancellationToken cancellationToken)
    {
        return dbContext.InventoryCategories
            .SingleOrDefaultAsync(c => c.Name.ToLower() == name.ToLower(), cancellationToken);
    }

    public Task<bool> HasInventoryItemsAsync(Guid categoryId, CancellationToken cancellationToken)
    {
        return dbContext.InventoryItems
            .AsNoTracking()
            .AnyAsync(i => i.CategoryId == categoryId, cancellationToken);
    }

    public Task AddAsync(InventoryCategory category, CancellationToken cancellationToken)
    {
        return dbContext.InventoryCategories.AddAsync(category, cancellationToken).AsTask();
    }

    public Task RemoveAsync(InventoryCategory category, CancellationToken cancellationToken)
    {
        dbContext.InventoryCategories.Remove(category);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        return dbContext.SaveChangesAsync(cancellationToken);
    }
}
