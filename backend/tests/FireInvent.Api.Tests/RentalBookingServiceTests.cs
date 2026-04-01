using FireInvent.Api.Application.Services.Rentals;
using FireInvent.Api.Contracts.Rentals;
using FireInvent.Api.Domain.Entities;
using FireInvent.Api.Domain.Enums;
using FireInvent.Api.Infrastructure.Persistence.Repositories;
using FireInvent.Api.Infrastructure.Persistence.Repositories.Rentals;
using Microsoft.EntityFrameworkCore;

namespace FireInvent.Api.Tests;

public sealed class RentalBookingServiceTests
{
    [Fact]
    public async Task CreateAsync_ReturnsConflict_WhenItemDoesNotExist()
    {
        await using var dbContext = TestDbContextFactory.Create("rental-tests");
        var inventoryRepository = new InventoryItemRepository(dbContext);
        var rentalRepository = new RentalBookingRepository(dbContext);
        var service = new RentalBookingService(rentalRepository, inventoryRepository);

        var result = await service.CreateAsync(
            new CreateRentalBookingRequest(
                DateTimeOffset.UtcNow,
                DateTimeOffset.UtcNow.AddDays(1),
                [new RentalBookingLineRequest(Guid.NewGuid(), 1)],
                null),
            CancellationToken.None);

        Assert.Equal("item_not_found", result.ErrorCode);
        Assert.Equal(0, await dbContext.RentalBookings.CountAsync());
    }

    [Fact]
    public async Task CreateAsync_ReturnsConflict_WhenRequestedQuantityExceedsAvailability()
    {
        var itemId = Guid.NewGuid();
        await using var dbContext = TestDbContextFactory.Create("rental-tests");
        await dbContext.InventoryItems.AddAsync(CreateItem(itemId, totalQuantity: 5));
        await dbContext.RentalBookings.AddAsync(new RentalBooking
        {
            Id = Guid.NewGuid(),
            ItemId = itemId,
            StartDate = DateTimeOffset.UtcNow,
            EndDate = DateTimeOffset.UtcNow.AddDays(2),
            Quantity = 4,
            Status = RentalStatus.Planned,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        });
        await dbContext.SaveChangesAsync();

        var inventoryRepository = new InventoryItemRepository(dbContext);
        var rentalRepository = new RentalBookingRepository(dbContext);
        var service = new RentalBookingService(rentalRepository, inventoryRepository);

        var result = await service.CreateAsync(
            new CreateRentalBookingRequest(
                DateTimeOffset.UtcNow,
                DateTimeOffset.UtcNow.AddDays(2),
                [new RentalBookingLineRequest(itemId, 2)],
                null),
            CancellationToken.None);

        Assert.Equal("stock_conflict", result.ErrorCode);
        Assert.Equal(1, await dbContext.RentalBookings.CountAsync());
    }

    [Fact]
    public async Task CreateAsync_CreatesPlannedRental_WhenInputIsValid()
    {
        var itemId = Guid.NewGuid();
        await using var dbContext = TestDbContextFactory.Create("rental-tests");
        await dbContext.InventoryItems.AddAsync(CreateItem(itemId, totalQuantity: 10));
        await dbContext.SaveChangesAsync();

        var inventoryRepository = new InventoryItemRepository(dbContext);
        var rentalRepository = new RentalBookingRepository(dbContext);
        var service = new RentalBookingService(rentalRepository, inventoryRepository);

        var result = await service.CreateAsync(
            new CreateRentalBookingRequest(
                DateTimeOffset.UtcNow,
                DateTimeOffset.UtcNow.AddDays(1),
                [new RentalBookingLineRequest(itemId, 2)],
                null),
            CancellationToken.None);

        Assert.NotNull(result.Booking);
        Assert.Equal(RentalStatus.Planned, result.Booking.Status);
        Assert.Equal(1, await dbContext.RentalBookings.CountAsync());
    }

    [Fact]
    public async Task CancelAsync_TransitionsBookingToCanceled()
    {
        var bookingId = Guid.NewGuid();
        var itemId = Guid.NewGuid();
        var booking = new RentalBooking
        {
            Id = bookingId,
            ItemId = itemId,
            StartDate = DateTimeOffset.UtcNow,
            EndDate = DateTimeOffset.UtcNow.AddDays(1),
            Quantity = 1,
            Status = RentalStatus.Active,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await using var dbContext = TestDbContextFactory.Create("rental-tests");
        await dbContext.InventoryItems.AddAsync(CreateItem(itemId, totalQuantity: 4));
        await dbContext.RentalBookings.AddAsync(booking);
        await dbContext.SaveChangesAsync();

        var inventoryRepository = new InventoryItemRepository(dbContext);
        var rentalRepository = new RentalBookingRepository(dbContext);
        var service = new RentalBookingService(rentalRepository, inventoryRepository);

        var result = await service.CancelAsync(bookingId, CancellationToken.None);

        Assert.NotNull(result.Booking);
        var persisted = await dbContext.RentalBookings.SingleAsync(b => b.Id == bookingId);
        Assert.Equal(RentalStatus.Canceled, persisted.Status);
    }

    [Fact]
    public async Task CompleteAsync_TransitionsBookingToCompleted()
    {
        var bookingId = Guid.NewGuid();
        var itemId = Guid.NewGuid();
        var booking = new RentalBooking
        {
            Id = bookingId,
            ItemId = itemId,
            StartDate = DateTimeOffset.UtcNow,
            EndDate = DateTimeOffset.UtcNow.AddDays(1),
            Quantity = 2,
            Status = RentalStatus.Returned,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await using var dbContext = TestDbContextFactory.Create("rental-tests");
        await dbContext.InventoryItems.AddAsync(CreateItem(itemId, totalQuantity: 6));
        await dbContext.RentalBookings.AddAsync(booking);
        await dbContext.SaveChangesAsync();

        var inventoryRepository = new InventoryItemRepository(dbContext);
        var rentalRepository = new RentalBookingRepository(dbContext);
        var service = new RentalBookingService(rentalRepository, inventoryRepository);

        var result = await service.CompleteAsync(bookingId, CancellationToken.None);

        Assert.NotNull(result.Booking);
        var persisted = await dbContext.RentalBookings.SingleAsync(b => b.Id == bookingId);
        Assert.Equal(RentalStatus.Completed, persisted.Status);
    }

    [Fact]
    public async Task UpdateAsync_ReturnsConflict_WhenBookingStateIsFinal()
    {
        var bookingId = Guid.NewGuid();
        var itemId = Guid.NewGuid();
        var booking = new RentalBooking
        {
            Id = bookingId,
            ItemId = itemId,
            StartDate = DateTimeOffset.UtcNow,
            EndDate = DateTimeOffset.UtcNow.AddDays(1),
            Quantity = 1,
            Status = RentalStatus.Completed,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await using var dbContext = TestDbContextFactory.Create("rental-tests");
        await dbContext.InventoryItems.AddAsync(CreateItem(itemId, totalQuantity: 3));
        await dbContext.RentalBookings.AddAsync(booking);
        await dbContext.SaveChangesAsync();

        var inventoryRepository = new InventoryItemRepository(dbContext);
        var rentalRepository = new RentalBookingRepository(dbContext);
        var service = new RentalBookingService(rentalRepository, inventoryRepository);

        var result = await service.UpdateAsync(
            bookingId,
            new UpdateRentalBookingRequest(
                DateTimeOffset.UtcNow,
                DateTimeOffset.UtcNow.AddDays(2),
                [new RentalBookingLineRequest(itemId, 1)],
                null,
                RentalStatus.Completed),
            CancellationToken.None);

        Assert.Equal("invalid_rental_state", result.ErrorCode);
    }

    [Fact]
    public async Task UpdateAsync_ReturnsConflict_WhenUpdatedQuantityExceedsAvailability()
    {
        var bookingId = Guid.NewGuid();
        var itemId = Guid.NewGuid();
        var now = DateTimeOffset.UtcNow;
        var booking = new RentalBooking
        {
            Id = bookingId,
            ItemId = itemId,
            StartDate = now,
            EndDate = now.AddDays(1),
            Quantity = 1,
            Status = RentalStatus.Planned,
            CreatedAt = now,
            UpdatedAt = now
        };

        await using var dbContext = TestDbContextFactory.Create("rental-tests");
        await dbContext.InventoryItems.AddAsync(CreateItem(itemId, totalQuantity: 5));
        await dbContext.RentalBookings.AddAsync(booking);
        await dbContext.RentalBookings.AddAsync(new RentalBooking
        {
            Id = Guid.NewGuid(),
            ItemId = itemId,
            StartDate = now,
            EndDate = now.AddDays(3),
            Quantity = 4,
            Status = RentalStatus.Active,
            CreatedAt = now,
            UpdatedAt = now
        });
        await dbContext.SaveChangesAsync();

        var inventoryRepository = new InventoryItemRepository(dbContext);
        var rentalRepository = new RentalBookingRepository(dbContext);
        var service = new RentalBookingService(rentalRepository, inventoryRepository);

        var result = await service.UpdateAsync(
            bookingId,
            new UpdateRentalBookingRequest(
                now,
                now.AddDays(3),
                [new RentalBookingLineRequest(itemId, 2)],
                null,
                RentalStatus.Planned),
            CancellationToken.None);

        Assert.Equal("stock_conflict", result.ErrorCode);
    }

    private static InventoryItem CreateItem(Guid itemId, int totalQuantity)
    {
        return new InventoryItem
        {
            Id = itemId,
            InventoryCode = "INV-1",
            Name = "Generator",
            Category = "Power",
            Condition = ItemCondition.Good,
            Location = "Station",
            TotalQuantity = totalQuantity,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
    }
}
