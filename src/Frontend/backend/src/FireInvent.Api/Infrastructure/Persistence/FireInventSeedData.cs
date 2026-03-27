using FireInvent.Api.Domain.Entities;
using FireInvent.Api.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace FireInvent.Api.Infrastructure.Persistence;

public enum FireInventSeedMode
{
    None = 0,
    IfEmpty = 1,
    Reset = 2
}

public sealed record FireInventSeedResult(FireInventSeedMode Mode, bool Executed, string Reason, int ItemCount, int RentalCount);

public static class FireInventSeedData
{
    public static FireInventSeedMode ParseMode(string? value)
    {
        return value?.Trim().ToLowerInvariant() switch
        {
            "if-empty" => FireInventSeedMode.IfEmpty,
            "reset" => FireInventSeedMode.Reset,
            "none" or null or "" => FireInventSeedMode.None,
            _ => FireInventSeedMode.None
        };
    }

    public static async Task<FireInventSeedResult> SeedAsync(
        FireInventDbContext dbContext,
        FireInventSeedMode mode,
        CancellationToken cancellationToken)
    {
        if (mode == FireInventSeedMode.None)
        {
            return new FireInventSeedResult(mode, false, "Seed mode is none.", 0, 0);
        }

        var hasData = await dbContext.InventoryItems.AnyAsync(cancellationToken) ||
                      await dbContext.RentalBookings.AnyAsync(cancellationToken);

        if (mode == FireInventSeedMode.IfEmpty && hasData)
        {
            return new FireInventSeedResult(mode, false, "Database already contains data.", 0, 0);
        }

        if (mode == FireInventSeedMode.Reset)
        {
            dbContext.RentalBookings.RemoveRange(dbContext.RentalBookings);
            dbContext.InventoryItems.RemoveRange(dbContext.InventoryItems);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        var now = DateTimeOffset.UtcNow;

        var generatorId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var ladderId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var pumpId = Guid.Parse("33333333-3333-3333-3333-333333333333");

        var items = new[]
        {
            new InventoryItem
            {
                Id = generatorId,
                InventoryCode = "FI-SEED-001",
                Name = "Generator 8kVA",
                Category = "Power",
                Condition = ItemCondition.Good,
                Location = "Station A",
                TotalQuantity = 8,
                CreatedAt = now,
                UpdatedAt = now
            },
            new InventoryItem
            {
                Id = ladderId,
                InventoryCode = "FI-SEED-002",
                Name = "Rescue Ladder",
                Category = "Rescue",
                Condition = ItemCondition.Good,
                Location = "Station B",
                TotalQuantity = 4,
                CreatedAt = now,
                UpdatedAt = now
            },
            new InventoryItem
            {
                Id = pumpId,
                InventoryCode = "FI-SEED-003",
                Name = "Water Pump",
                Category = "Water",
                Condition = ItemCondition.NeedsRepair,
                Location = "Station C",
                TotalQuantity = 2,
                CreatedAt = now,
                UpdatedAt = now
            }
        };

        var rentals = new[]
        {
            new RentalBooking
            {
                Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1"),
                ItemId = generatorId,
                StartDate = now.AddDays(-1),
                EndDate = now.AddDays(2),
                Quantity = 3,
                Status = RentalStatus.Active,
                CreatedAt = now,
                UpdatedAt = now
            },
            new RentalBooking
            {
                Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2"),
                ItemId = generatorId,
                StartDate = now.AddDays(1),
                EndDate = now.AddDays(4),
                Quantity = 2,
                Status = RentalStatus.Planned,
                CreatedAt = now,
                UpdatedAt = now
            },
            new RentalBooking
            {
                Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3"),
                ItemId = generatorId,
                StartDate = now.AddDays(-10),
                EndDate = now.AddDays(-8),
                Quantity = 2,
                Status = RentalStatus.Completed,
                CreatedAt = now,
                UpdatedAt = now
            },
            new RentalBooking
            {
                Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4"),
                ItemId = ladderId,
                StartDate = now.AddDays(1),
                EndDate = now.AddDays(3),
                Quantity = 1,
                Status = RentalStatus.Canceled,
                CreatedAt = now,
                UpdatedAt = now
            }
        };

        await dbContext.InventoryItems.AddRangeAsync(items, cancellationToken);
        await dbContext.RentalBookings.AddRangeAsync(rentals, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new FireInventSeedResult(
            mode,
            true,
            "Seed data prepared.",
            items.Length,
            rentals.Length);
    }
}