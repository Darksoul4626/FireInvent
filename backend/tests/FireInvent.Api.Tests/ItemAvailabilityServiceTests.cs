using FireInvent.Api.Application.Services.Availability;
using FireInvent.Api.Domain.Entities;
using FireInvent.Api.Domain.Enums;
using FireInvent.Api.Infrastructure.Persistence.Repositories;
using FireInvent.Api.Infrastructure.Persistence.Repositories.Rentals;

namespace FireInvent.Api.Tests;

public sealed class ItemAvailabilityServiceTests
{
    [Fact]
    public async Task GetAsync_ReturnsNotFound_WhenItemDoesNotExist()
    {
        await using var dbContext = TestDbContextFactory.Create("availability-tests");
        var inventoryRepository = new InventoryItemRepository(dbContext);
        var rentalRepository = new RentalBookingRepository(dbContext);
        var service = new ItemAvailabilityService(inventoryRepository, rentalRepository);

        var result = await service.GetAsync(
            Guid.NewGuid(),
            DateTimeOffset.UtcNow,
            DateTimeOffset.UtcNow.AddDays(1),
            CancellationToken.None);

        Assert.True(result.NotFound);
        Assert.Null(result.Availability);
    }

    [Fact]
    public async Task GetAsync_ComputesAvailability_FromTotalMinusReservedOrRented()
    {
        var itemId = Guid.NewGuid();
        await using var dbContext = TestDbContextFactory.Create("availability-tests");
        var now = DateTimeOffset.UtcNow;
        await dbContext.InventoryItems.AddAsync(new InventoryItem
        {
            Id = itemId,
            InventoryCode = "INV-2",
            Name = "Tent",
            Category = "Shelter",
            Condition = ItemCondition.Good,
            Location = "Depot",
            TotalQuantity = 10,
            CreatedAt = now,
            UpdatedAt = now
        });
        await dbContext.RentalBookings.AddAsync(new RentalBooking
        {
            Id = Guid.NewGuid(),
            ItemId = itemId,
            StartDate = now,
            EndDate = now.AddDays(4),
            Quantity = 4,
            Status = RentalStatus.Active,
            CreatedAt = now,
            UpdatedAt = now
        });
        await dbContext.SaveChangesAsync();

        var inventoryRepository = new InventoryItemRepository(dbContext);
        var rentalRepository = new RentalBookingRepository(dbContext);
        var service = new ItemAvailabilityService(inventoryRepository, rentalRepository);

        var from = now;
        var to = from.AddDays(7);

        var result = await service.GetAsync(itemId, from, to, CancellationToken.None);

        Assert.False(result.NotFound);
        Assert.NotNull(result.Availability);
        Assert.Equal(10, result.Availability.TotalQuantity);
        Assert.Equal(4, result.Availability.ReservedOrRentedQuantity);
        Assert.Equal(6, result.Availability.AvailableQuantity);
    }

    [Fact]
    public async Task GetAsync_ClampsAvailabilityToZero_WhenReservedExceedsTotal()
    {
        var itemId = Guid.NewGuid();
        await using var dbContext = TestDbContextFactory.Create("availability-tests");
        var now = DateTimeOffset.UtcNow;
        await dbContext.InventoryItems.AddAsync(new InventoryItem
        {
            Id = itemId,
            InventoryCode = "INV-3",
            Name = "Radio",
            Category = "Communication",
            Condition = ItemCondition.Good,
            Location = "Locker",
            TotalQuantity = 2,
            CreatedAt = now,
            UpdatedAt = now
        });
        await dbContext.RentalBookings.AddAsync(new RentalBooking
        {
            Id = Guid.NewGuid(),
            ItemId = itemId,
            StartDate = now,
            EndDate = now.AddDays(2),
            Quantity = 5,
            Status = RentalStatus.Planned,
            CreatedAt = now,
            UpdatedAt = now
        });
        await dbContext.SaveChangesAsync();

        var inventoryRepository = new InventoryItemRepository(dbContext);
        var rentalRepository = new RentalBookingRepository(dbContext);
        var service = new ItemAvailabilityService(inventoryRepository, rentalRepository);

        var result = await service.GetAsync(
            itemId,
            now,
            now.AddDays(2),
            CancellationToken.None);

        Assert.NotNull(result.Availability);
        Assert.Equal(0, result.Availability.AvailableQuantity);
    }

    [Fact]
    public async Task GetAsync_ExcludesBooking_WhenExcludeBookingIdIsProvided()
    {
        var itemId = Guid.NewGuid();
        var bookingId = Guid.NewGuid();
        await using var dbContext = TestDbContextFactory.Create("availability-tests");
        var now = DateTimeOffset.UtcNow;

        await dbContext.InventoryItems.AddAsync(new InventoryItem
        {
            Id = itemId,
            InventoryCode = "INV-4",
            Name = "Floodlight",
            Category = "Lighting",
            Condition = ItemCondition.Good,
            Location = "Rack",
            TotalQuantity = 3,
            CreatedAt = now,
            UpdatedAt = now
        });

        await dbContext.RentalBookings.AddAsync(new RentalBooking
        {
            Id = bookingId,
            ItemId = itemId,
            StartDate = now,
            EndDate = now.AddDays(2),
            Quantity = 2,
            Status = RentalStatus.Planned,
            CreatedAt = now,
            UpdatedAt = now
        });

        await dbContext.SaveChangesAsync();

        var inventoryRepository = new InventoryItemRepository(dbContext);
        var rentalRepository = new RentalBookingRepository(dbContext);
        var service = new ItemAvailabilityService(inventoryRepository, rentalRepository);

        var withoutExclusion = await service.GetAsync(
            itemId,
            now,
            now.AddDays(2),
            CancellationToken.None);

        var withExclusion = await service.GetAsync(
            itemId,
            now,
            now.AddDays(2),
            CancellationToken.None,
            bookingId);

        Assert.NotNull(withoutExclusion.Availability);
        Assert.Equal(1, withoutExclusion.Availability.AvailableQuantity);

        Assert.NotNull(withExclusion.Availability);
        Assert.Equal(3, withExclusion.Availability.AvailableQuantity);
        Assert.Equal(0, withExclusion.Availability.ReservedOrRentedQuantity);
    }
}
