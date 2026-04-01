using FireInvent.Api.Domain.Entities;
using FireInvent.Api.Domain.Enums;
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

    public async Task<PagedResult<InventoryOverviewRow>> GetOverviewAsync(
        InventoryOverviewQuery query,
        CancellationToken cancellationToken)
    {
        var filteredQuery = dbContext.InventoryItems.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            filteredQuery = filteredQuery.Where(item =>
                item.InventoryCode.ToLower().Contains(search)
                || item.Name.ToLower().Contains(search)
                || item.Category.ToLower().Contains(search)
                || item.Location.ToLower().Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(query.Category))
        {
            var category = query.Category.Trim().ToLower();
            filteredQuery = filteredQuery.Where(item => item.Category.ToLower() == category);
        }

        if (query.Condition.HasValue)
        {
            filteredQuery = filteredQuery.Where(item => item.Condition == query.Condition.Value);
        }

        var totalCount = await filteredQuery.CountAsync(cancellationToken);
        var orderedQuery = filteredQuery
            .OrderBy(item => item.Name)
            .ThenBy(item => item.Id);

        var offset = (query.Page - 1) * query.PageSize;
        var pageItems = await orderedQuery
            .Skip(offset)
            .Take(query.PageSize)
            .Select(item => new
            {
                item.Id,
                item.InventoryCode,
                item.Name,
                item.Category,
                item.Condition,
                item.Location,
                item.TotalQuantity,
                item.CreatedAt,
                item.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        if (pageItems.Count == 0)
        {
            return ToPagedResult([], query.Page, query.PageSize, totalCount);
        }

        var itemIds = pageItems.Select(item => item.Id).ToArray();

        var activeBookingIds = dbContext.RentalBookings
            .AsNoTracking()
            .Where(booking => booking.Status == RentalStatus.Planned || booking.Status == RentalStatus.Active)
            .Where(booking => booking.StartDate <= query.At && booking.EndDate >= query.At)
            .Select(booking => booking.Id);

        var reservedByLines = await dbContext.RentalBookingLines
            .AsNoTracking()
            .Where(line => itemIds.Contains(line.ItemId))
            .Where(line => activeBookingIds.Contains(line.RentalBookingId))
            .GroupBy(line => line.ItemId)
            .Select(group => new { ItemId = group.Key, Quantity = group.Sum(line => line.Quantity) })
            .ToListAsync(cancellationToken);

        var reservedByLegacyRows = await dbContext.RentalBookings
            .AsNoTracking()
            .Where(booking => booking.Status == RentalStatus.Planned || booking.Status == RentalStatus.Active)
            .Where(booking => booking.StartDate <= query.At && booking.EndDate >= query.At)
            .Where(booking => itemIds.Contains(booking.ItemId))
            .Where(booking => !dbContext.RentalBookingLines.Any(line => line.RentalBookingId == booking.Id))
            .GroupBy(booking => booking.ItemId)
            .Select(group => new { ItemId = group.Key, Quantity = group.Sum(booking => booking.Quantity) })
            .ToListAsync(cancellationToken);

        var reservedByItemId = new Dictionary<Guid, int>();

        foreach (var entry in reservedByLines)
        {
            reservedByItemId[entry.ItemId] = entry.Quantity;
        }

        foreach (var entry in reservedByLegacyRows)
        {
            reservedByItemId[entry.ItemId] = (reservedByItemId.TryGetValue(entry.ItemId, out var existing) ? existing : 0)
                                            + entry.Quantity;
        }

        var rows = pageItems
            .Select(item =>
            {
                var rented = reservedByItemId.TryGetValue(item.Id, out var reserved) ? reserved : 0;
                var available = Math.Max(item.TotalQuantity - rented, 0);

                return new InventoryOverviewRow(
                    item.Id,
                    item.InventoryCode,
                    item.Name,
                    item.Category,
                    item.Condition,
                    item.Location,
                    item.TotalQuantity,
                    rented,
                    available,
                    item.CreatedAt,
                    item.UpdatedAt);
            })
            .ToList();

        return ToPagedResult(rows, query.Page, query.PageSize, totalCount);
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

    private static PagedResult<InventoryOverviewRow> ToPagedResult(
        IReadOnlyList<InventoryOverviewRow> items,
        int page,
        int pageSize,
        int totalCount)
    {
        var totalPages = totalCount == 0
            ? 0
            : (int)Math.Ceiling(totalCount / (double)pageSize);

        return new PagedResult<InventoryOverviewRow>(
            items,
            page,
            pageSize,
            totalCount,
            totalPages,
            page > 1,
            totalPages > 0 && page < totalPages);
    }
}
