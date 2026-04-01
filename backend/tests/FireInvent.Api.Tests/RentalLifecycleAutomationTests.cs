using FireInvent.Api.Application.Services.Rentals;
using FireInvent.Api.Domain.Entities;
using FireInvent.Api.Domain.Enums;
using FireInvent.Api.Infrastructure.Persistence.Repositories.Rentals;
using Microsoft.EntityFrameworkCore;

namespace FireInvent.Api.Tests;

public sealed class RentalLifecycleAutomationTests
{
    [Fact]
    public void Options_DefaultToEnabledAndFiveMinuteInterval()
    {
        var options = new RentalLifecycleAutomationOptions();

        Assert.True(options.Enabled);
        Assert.Equal(5, options.IntervalMinutes);
    }

    [Fact]
    public async Task ActivateDuePlannedAsync_TransitionsOnlyDuePlannedRentals()
    {
        var itemId = Guid.NewGuid();
        var bookingDue = Guid.NewGuid();
        var bookingFuture = Guid.NewGuid();
        var nowUtc = new DateTimeOffset(2026, 4, 1, 12, 0, 0, TimeSpan.Zero);

        await using var dbContext = TestDbContextFactory.Create("rental-lifecycle-tests");
        await dbContext.InventoryItems.AddAsync(CreateItem(itemId));
        await dbContext.RentalBookings.AddRangeAsync(
            CreateBooking(
                bookingDue,
                itemId,
                RentalStatus.Planned,
                new DateTimeOffset(2026, 4, 1, 13, 59, 0, TimeSpan.FromHours(2)),
                nowUtc),
            CreateBooking(
                bookingFuture,
                itemId,
                RentalStatus.Planned,
                nowUtc.AddMinutes(15),
                nowUtc));
        await dbContext.SaveChangesAsync();

        var repository = new RentalBookingRepository(dbContext);

        var transitioned = await repository.ActivateDuePlannedAsync(nowUtc, CancellationToken.None);

        Assert.Equal(1, transitioned);

        var due = await dbContext.RentalBookings.SingleAsync(r => r.Id == bookingDue);
        var future = await dbContext.RentalBookings.SingleAsync(r => r.Id == bookingFuture);

        Assert.Equal(RentalStatus.Active, due.Status);
        Assert.Equal(nowUtc, due.UpdatedAt);
        Assert.Equal(RentalStatus.Planned, future.Status);
    }

    [Fact]
    public async Task ActivateDuePlannedAsync_IsIdempotent_AndSkipsTerminalStatuses()
    {
        var itemId = Guid.NewGuid();
        var duePlannedId = Guid.NewGuid();
        var canceledId = Guid.NewGuid();
        var completedId = Guid.NewGuid();
        var nowUtc = DateTimeOffset.UtcNow;

        await using var dbContext = TestDbContextFactory.Create("rental-lifecycle-tests");
        await dbContext.InventoryItems.AddAsync(CreateItem(itemId));
        await dbContext.RentalBookings.AddRangeAsync(
            CreateBooking(duePlannedId, itemId, RentalStatus.Planned, nowUtc.AddMinutes(-30), nowUtc),
            CreateBooking(canceledId, itemId, RentalStatus.Canceled, nowUtc.AddMinutes(-30), nowUtc),
            CreateBooking(completedId, itemId, RentalStatus.Completed, nowUtc.AddMinutes(-30), nowUtc));
        await dbContext.SaveChangesAsync();

        var repository = new RentalBookingRepository(dbContext);

        var firstRun = await repository.ActivateDuePlannedAsync(nowUtc, CancellationToken.None);
        var secondRun = await repository.ActivateDuePlannedAsync(nowUtc.AddMinutes(1), CancellationToken.None);

        Assert.Equal(1, firstRun);
        Assert.Equal(0, secondRun);

        var canceled = await dbContext.RentalBookings.SingleAsync(r => r.Id == canceledId);
        var completed = await dbContext.RentalBookings.SingleAsync(r => r.Id == completedId);

        Assert.Equal(RentalStatus.Canceled, canceled.Status);
        Assert.Equal(RentalStatus.Completed, completed.Status);
    }

    private static InventoryItem CreateItem(Guid id)
    {
        return new InventoryItem
        {
            Id = id,
            InventoryCode = "INV-LC",
            Name = "Lifecycle Item",
            Category = "Ops",
            Condition = ItemCondition.Good,
            Location = "Station",
            TotalQuantity = 10,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
    }

    private static RentalBooking CreateBooking(
        Guid id,
        Guid itemId,
        RentalStatus status,
        DateTimeOffset startDate,
        DateTimeOffset updatedAt)
    {
        return new RentalBooking
        {
            Id = id,
            ItemId = itemId,
            StartDate = startDate,
            EndDate = startDate.AddHours(3),
            Quantity = 1,
            Status = status,
            CreatedAt = updatedAt,
            UpdatedAt = updatedAt
        };
    }
}