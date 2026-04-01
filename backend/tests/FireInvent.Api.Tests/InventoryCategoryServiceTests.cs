using FireInvent.Api.Application.Services.Categories;
using FireInvent.Api.Contracts.Categories;
using FireInvent.Api.Domain.Entities;
using FireInvent.Api.Domain.Enums;
using FireInvent.Api.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace FireInvent.Api.Tests;

public sealed class InventoryCategoryServiceTests
{
    [Fact]
    public async Task DeleteAsync_ReturnsConflict_WhenCategoryIsInUse()
    {
        await using var dbContext = TestDbContextFactory.Create("category-tests");

        var category = new InventoryCategory
        {
            Id = Guid.NewGuid(),
            Name = "Rescue",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await dbContext.InventoryCategories.AddAsync(category);
        await dbContext.InventoryItems.AddAsync(new InventoryItem
        {
            Id = Guid.NewGuid(),
            InventoryCode = "CAT-001",
            Name = "Hydraulic Cutter",
            Category = "Rescue",
            CategoryId = category.Id,
            Condition = ItemCondition.Good,
            Location = "Station A",
            TotalQuantity = 2,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var repository = new InventoryCategoryRepository(dbContext);
        var service = new InventoryCategoryService(repository);

        var result = await service.DeleteAsync(category.Id, CancellationToken.None);

        Assert.Equal("category_in_use", result.ErrorCode);
        Assert.True(await dbContext.InventoryCategories.AnyAsync(entry => entry.Id == category.Id));
    }

    [Fact]
    public async Task DeleteAsync_RemovesCategory_WhenUnused()
    {
        await using var dbContext = TestDbContextFactory.Create("category-tests");

        var category = new InventoryCategory
        {
            Id = Guid.NewGuid(),
            Name = "Water",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await dbContext.InventoryCategories.AddAsync(category);
        await dbContext.SaveChangesAsync();

        var repository = new InventoryCategoryRepository(dbContext);
        var service = new InventoryCategoryService(repository);

        var result = await service.DeleteAsync(category.Id, CancellationToken.None);

        Assert.NotNull(result.Category);
        Assert.False(await dbContext.InventoryCategories.AnyAsync(entry => entry.Id == category.Id));
    }

    [Fact]
    public async Task CreateAsync_ReturnsConflict_WhenNameAlreadyExists()
    {
        await using var dbContext = TestDbContextFactory.Create("category-tests");

        await dbContext.InventoryCategories.AddAsync(new InventoryCategory
        {
            Id = Guid.NewGuid(),
            Name = "Power",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var repository = new InventoryCategoryRepository(dbContext);
        var service = new InventoryCategoryService(repository);

        var result = await service.CreateAsync(
            new CreateInventoryCategoryRequest(" power "),
            CancellationToken.None);

        Assert.Equal("category_name_conflict", result.ErrorCode);
    }

    [Fact]
    public async Task GetAllAsync_RefreshesCacheAfterCreate()
    {
        await using var dbContext = TestDbContextFactory.Create("category-tests");

        await dbContext.InventoryCategories.AddAsync(new InventoryCategory
        {
            Id = Guid.NewGuid(),
            Name = "Medical",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var repository = new InventoryCategoryRepository(dbContext);
        var service = new InventoryCategoryService(repository);

        var initial = await service.GetAllAsync(CancellationToken.None);
        Assert.Single(initial);

        var createResult = await service.CreateAsync(
            new CreateInventoryCategoryRequest("Rescue"),
            CancellationToken.None);

        Assert.NotNull(createResult.Category);

        var refreshed = await service.GetAllAsync(CancellationToken.None);
        Assert.Equal(2, refreshed.Count);
    }
}
