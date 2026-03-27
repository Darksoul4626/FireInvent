using FireInvent.Api.Application.Services.InventoryItems;
using FireInvent.Api.Contracts.InventoryItems;
using FireInvent.Api.Domain.Entities;
using FireInvent.Api.Domain.Enums;
using FireInvent.Api.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FireInvent.Api.Tests;

public sealed class InventoryItemServiceTests
{
    [Fact]
    public async Task CreateAsync_PersistsItemAndTrimsFields()
    {
        await using var dbContext = TestDbContextFactory.Create("inventory-tests");
        var repository = new InventoryItemRepository(dbContext);
        var service = new InventoryItemService(repository);

        var result = await service.CreateAsync(
            new CreateInventoryItemRequest("  I-001  ", "  Ladder ", " Rescue  ", ItemCondition.Good, "  Station A  ", 5),
            CancellationToken.None);

        Assert.NotNull(result.Item);
        Assert.Null(result.ErrorCode);
        Assert.Equal("I-001", result.Item.InventoryCode);
        Assert.Equal("Ladder", result.Item.Name);
        Assert.Equal("Rescue", result.Item.Category);
        Assert.Equal("Station A", result.Item.Location);
        Assert.Equal(1, await dbContext.InventoryItems.CountAsync());
    }

    [Fact]
    public async Task CreateAsync_ReturnsConflict_WhenInventoryCodeExists()
    {
        await using var dbContext = TestDbContextFactory.Create("inventory-tests");
        await dbContext.InventoryItems.AddAsync(new InventoryItem
        {
            Id = Guid.NewGuid(),
            InventoryCode = "I-001",
            Name = "Existing",
            Category = "Rescue",
            Condition = ItemCondition.Good,
            Location = "Station A",
            TotalQuantity = 1,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var repository = new InventoryItemRepository(dbContext);
        var service = new InventoryItemService(repository);

        var result = await service.CreateAsync(
            new CreateInventoryItemRequest("I-001", "Ladder", "Rescue", ItemCondition.Good, "Station A", 5),
            CancellationToken.None);

        Assert.Null(result.Item);
        Assert.Equal("inventory_code_conflict", result.ErrorCode);
        Assert.Equal(1, await dbContext.InventoryItems.CountAsync());
    }

    [Fact]
    public async Task UpdateAsync_ReturnsNotFound_WhenItemIsMissing()
    {
        await using var dbContext = TestDbContextFactory.Create("inventory-tests");
        var repository = new InventoryItemRepository(dbContext);
        var service = new InventoryItemService(repository);

        var result = await service.UpdateAsync(
            Guid.NewGuid(),
            new UpdateInventoryItemRequest("Updated", "Category", ItemCondition.NeedsRepair, "New Location", 2),
            CancellationToken.None);

        Assert.True(result.NotFound);
    }

    [Fact]
    public async Task UpdateAsync_UpdatesExistingItem()
    {
        await using var dbContext = TestDbContextFactory.Create("inventory-tests");
        var existing = new InventoryItem
        {
            Id = Guid.NewGuid(),
            InventoryCode = "I-123",
            Name = "Old",
            Category = "OldCat",
            Condition = ItemCondition.Good,
            Location = "OldLoc",
            TotalQuantity = 1,
            CreatedAt = DateTimeOffset.UtcNow.AddDays(-1),
            UpdatedAt = DateTimeOffset.UtcNow.AddDays(-1)
        };
        await dbContext.InventoryItems.AddAsync(existing);
        await dbContext.SaveChangesAsync();

        var repository = new InventoryItemRepository(dbContext);
        var service = new InventoryItemService(repository);

        var result = await service.UpdateAsync(
            existing.Id,
            new UpdateInventoryItemRequest(" New Name ", " New Cat ", ItemCondition.OutOfService, " New Loc ", 7),
            CancellationToken.None);

        Assert.NotNull(result.Item);
        Assert.Equal("New Name", existing.Name);
        Assert.Equal("New Cat", existing.Category);
        Assert.Equal(ItemCondition.OutOfService, existing.Condition);
        Assert.Equal("New Loc", existing.Location);
        Assert.Equal(7, existing.TotalQuantity);
    }

    [Fact]
    public async Task DeleteAsync_ReturnsConflict_WhenItemHasLinkedRentals()
    {
        await using var dbContext = TestDbContextFactory.Create("inventory-tests");
        var existing = new InventoryItem
        {
            Id = Guid.NewGuid(),
            InventoryCode = "I-100",
            Name = "Pump",
            Category = "Water",
            Condition = ItemCondition.Good,
            Location = "S1",
            TotalQuantity = 3,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
        await dbContext.InventoryItems.AddAsync(existing);
        await dbContext.RentalBookings.AddAsync(new RentalBooking
        {
            Id = Guid.NewGuid(),
            ItemId = existing.Id,
            StartDate = DateTimeOffset.UtcNow,
            EndDate = DateTimeOffset.UtcNow.AddDays(1),
            Quantity = 1,
            Status = RentalStatus.Planned,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var repository = new InventoryItemRepository(dbContext);
        var service = new InventoryItemService(repository);

        var result = await service.DeleteAsync(existing.Id, CancellationToken.None);

        Assert.Equal("item_has_rentals", result.ErrorCode);
        Assert.True(await dbContext.InventoryItems.AnyAsync(i => i.Id == existing.Id));
    }

    [Fact]
    public async Task DeleteAsync_RemovesItem_WhenNoLinkedRentals()
    {
        await using var dbContext = TestDbContextFactory.Create("inventory-tests");
        var existing = new InventoryItem
        {
            Id = Guid.NewGuid(),
            InventoryCode = "I-101",
            Name = "Cone",
            Category = "Traffic",
            Condition = ItemCondition.Good,
            Location = "S2",
            TotalQuantity = 12,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
        await dbContext.InventoryItems.AddAsync(existing);
        await dbContext.SaveChangesAsync();

        var repository = new InventoryItemRepository(dbContext);
        var service = new InventoryItemService(repository);

        var result = await service.DeleteAsync(existing.Id, CancellationToken.None);

        Assert.NotNull(result.Item);
        Assert.False(await dbContext.InventoryItems.AnyAsync(i => i.Id == existing.Id));
    }
}
