using FireInvent.Api.Application.Services.InventoryItems;
using FireInvent.Api.Application.Services.Rentals;
using FireInvent.Api.Contracts.InventoryItems;
using FireInvent.Api.Contracts.Rentals;
using FireInvent.Api.Domain.Entities;
using FireInvent.Api.Domain.Enums;
using FireInvent.Api.Infrastructure.Persistence.Repositories;
using FireInvent.Api.Infrastructure.Persistence.Repositories.Rentals;

namespace FireInvent.Api.Tests;

public sealed class OverviewServiceTests
{
    [Fact]
    public async Task InventoryOverview_ProjectsRentedAndAvailableFromBackend()
    {
        await using var dbContext = TestDbContextFactory.Create("overview-tests");

        var categoryId = Guid.NewGuid();
        await dbContext.InventoryCategories.AddAsync(new InventoryCategory
        {
            Id = categoryId,
            Name = "Power",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        });

        var itemId = Guid.NewGuid();
        await dbContext.InventoryItems.AddAsync(new InventoryItem
        {
            Id = itemId,
            InventoryCode = "INV-001",
            Name = "Generator",
            Category = "Power",
            CategoryId = categoryId,
            Condition = ItemCondition.Good,
            Location = "Station",
            TotalQuantity = 8,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        });

        var now = new DateTimeOffset(2026, 4, 1, 10, 0, 0, TimeSpan.Zero);
        var rentalId = Guid.NewGuid();
        await dbContext.RentalBookings.AddAsync(new RentalBooking
        {
            Id = rentalId,
            ItemId = itemId,
            StartDate = now.AddHours(-1),
            EndDate = now.AddHours(5),
            Quantity = 3,
            Status = RentalStatus.Planned,
            CreatedAt = now,
            UpdatedAt = now,
            Lines = [
                new RentalBookingLine
                {
                    Id = Guid.NewGuid(),
                    ItemId = itemId,
                    Quantity = 3
                }
            ]
        });

        await dbContext.SaveChangesAsync();

        var repository = new InventoryItemRepository(dbContext);
        var service = new InventoryItemService(repository);

        var result = await service.GetOverviewAsync(new GetInventoryOverviewQuery
        {
            Page = 1,
            PageSize = 20,
            At = now
        }, CancellationToken.None);

        Assert.Single(result.Items);
        Assert.Equal(8, result.Items[0].TotalQuantity);
        Assert.Equal(3, result.Items[0].Rented);
        Assert.Equal(5, result.Items[0].Available);
        Assert.Equal(1, result.TotalCount);
    }

    [Fact]
    public async Task RentalOverview_FiltersByStatusAndReturnsPagingMetadata()
    {
        await using var dbContext = TestDbContextFactory.Create("overview-tests");

        var categoryId = Guid.NewGuid();
        var itemId = Guid.NewGuid();

        await dbContext.InventoryCategories.AddAsync(new InventoryCategory
        {
            Id = categoryId,
            Name = "Water",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        });

        await dbContext.InventoryItems.AddAsync(new InventoryItem
        {
            Id = itemId,
            InventoryCode = "INV-010",
            Name = "Pump",
            Category = "Water",
            CategoryId = categoryId,
            Condition = ItemCondition.Good,
            Location = "Truck",
            TotalQuantity = 4,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        });

        var now = DateTimeOffset.UtcNow;

        await dbContext.RentalBookings.AddRangeAsync(
            new RentalBooking
            {
                Id = Guid.NewGuid(),
                ItemId = itemId,
                StartDate = now,
                EndDate = now.AddDays(1),
                Quantity = 1,
                Status = RentalStatus.Planned,
                CreatedAt = now,
                UpdatedAt = now,
                Lines = [
                    new RentalBookingLine
                    {
                        Id = Guid.NewGuid(),
                        ItemId = itemId,
                        Quantity = 1
                    }
                ]
            },
            new RentalBooking
            {
                Id = Guid.NewGuid(),
                ItemId = itemId,
                StartDate = now,
                EndDate = now.AddDays(1),
                Quantity = 1,
                Status = RentalStatus.Canceled,
                CreatedAt = now,
                UpdatedAt = now,
                Lines = [
                    new RentalBookingLine
                    {
                        Id = Guid.NewGuid(),
                        ItemId = itemId,
                        Quantity = 1
                    }
                ]
            });

        await dbContext.SaveChangesAsync();

        var inventoryRepository = new InventoryItemRepository(dbContext);
        var rentalRepository = new RentalBookingRepository(dbContext);
        var service = new RentalBookingService(
            rentalRepository,
            inventoryRepository,
            new StubBusinessDayBoundary(new DateOnly(2000, 1, 1)));

        var result = await service.GetOverviewAsync(new GetRentalOverviewQuery
        {
            Page = 1,
            PageSize = 20,
            Status = "Planned"
        }, CancellationToken.None);

        Assert.Single(result.Items);
        Assert.Equal(1, result.TotalCount);
        Assert.Equal(1, result.Page);
        Assert.Equal(20, result.PageSize);
        Assert.Contains("INV-010", result.Items[0].ItemSummary);
    }

    private sealed class StubBusinessDayBoundary(DateOnly currentBusinessDate) : IBusinessDayBoundary
    {
        public DateOnly GetCurrentBusinessDate()
        {
            return currentBusinessDate;
        }

        public DateOnly ToBusinessDate(DateTimeOffset value)
        {
            return DateOnly.FromDateTime(value.UtcDateTime);
        }
    }
}
