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

    public Task<InventoryCategory?> GetCategoryByNameAsync(string categoryName, CancellationToken cancellationToken)
    {
        return dbContext.InventoryCategories
            .SingleOrDefaultAsync(c => c.Name.ToLower() == categoryName.ToLower(), cancellationToken);
    }

    public Task<bool> ExistsByInventoryCodeAsync(string inventoryCode, CancellationToken cancellationToken)
    {
        return dbContext.InventoryItems
            .AsNoTracking()
            .AnyAsync(i => i.InventoryCode == inventoryCode, cancellationToken);
    }

    public async Task<bool> HasLinkedRentalsAsync(Guid itemId, CancellationToken cancellationToken)
    {
        var legacyLinkQuery = dbContext.RentalBookings
            .AsNoTracking()
            .AnyAsync(r => r.ItemId == itemId, cancellationToken);

        var lineLinkQuery = dbContext.RentalBookingLines
            .AsNoTracking()
            .AnyAsync(l => l.ItemId == itemId, cancellationToken);

        var legacyLinked = await legacyLinkQuery;
        var lineLinked = await lineLinkQuery;

        return legacyLinked || lineLinked;
    }

    public Task AddCategoryAsync(InventoryCategory category, CancellationToken cancellationToken)
    {
        return dbContext.InventoryCategories.AddAsync(category, cancellationToken).AsTask();
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
