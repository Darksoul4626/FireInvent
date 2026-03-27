using FireInvent.Api.Domain.Entities;
using FireInvent.Api.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FireInvent.Api.Infrastructure.Persistence.Repositories;

public sealed class InventoryItemRepository(FireInventDbContext dbContext) : IInventoryItemRepository
{
    public async Task<IReadOnlyList<InventoryItem>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await dbContext.InventoryItems
            .AsNoTracking()
            .OrderBy(i => i.Name)
            .ToListAsync(cancellationToken);
    }

    public Task<InventoryItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return dbContext.InventoryItems.SingleOrDefaultAsync(i => i.Id == id, cancellationToken);
    }

    public Task<bool> ExistsByInventoryCodeAsync(string inventoryCode, CancellationToken cancellationToken)
    {
        return dbContext.InventoryItems
            .AsNoTracking()
            .AnyAsync(i => i.InventoryCode == inventoryCode, cancellationToken);
    }

    public Task<bool> HasLinkedRentalsAsync(Guid itemId, CancellationToken cancellationToken)
    {
        return dbContext.RentalBookings
            .AsNoTracking()
            .AnyAsync(r => r.ItemId == itemId, cancellationToken);
    }

    public Task AddAsync(InventoryItem item, CancellationToken cancellationToken)
    {
        return dbContext.InventoryItems.AddAsync(item, cancellationToken).AsTask();
    }

    public Task RemoveAsync(InventoryItem item, CancellationToken cancellationToken)
    {
        dbContext.InventoryItems.Remove(item);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        return dbContext.SaveChangesAsync(cancellationToken);
    }
}
