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
            dbContext.RentalBookingLines.RemoveRange(dbContext.RentalBookingLines);
            dbContext.RentalBookings.RemoveRange(dbContext.RentalBookings);
            dbContext.InventoryItems.RemoveRange(dbContext.InventoryItems);
            dbContext.InventoryCategories.RemoveRange(dbContext.InventoryCategories);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        var now = DateTimeOffset.UtcNow;

        var powerCategoryId = Guid.Parse("44444444-4444-4444-4444-444444444441");
        var rescueCategoryId = Guid.Parse("44444444-4444-4444-4444-444444444442");
        var waterCategoryId = Guid.Parse("44444444-4444-4444-4444-444444444443");

        var generatorId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var ladderId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var pumpId = Guid.Parse("33333333-3333-3333-3333-333333333333");

        var categories = new[]
        {
            new InventoryCategory
            {
                Id = powerCategoryId,
                Name = "Power",
                CreatedAt = now,
                UpdatedAt = now
            },
            new InventoryCategory
            {
                Id = rescueCategoryId,
                Name = "Rescue",
                CreatedAt = now,
                UpdatedAt = now
            },
            new InventoryCategory
            {
                Id = waterCategoryId,
                Name = "Water",
                CreatedAt = now,
                UpdatedAt = now
            }
        };

        var items = new[]
        {
            new InventoryItem
            {
                Id = generatorId,
                InventoryCode = "FI-SEED-001",
                Name = "Generator 8kVA",
                Category = "Power",
                CategoryId = powerCategoryId,
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
                CategoryId = rescueCategoryId,
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
                CategoryId = waterCategoryId,
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
                BorrowerName = "Feuerwehr Uebungsgruppe Nord",
                Status = RentalStatus.Active,
                CreatedAt = now,
                UpdatedAt = now,
                Lines =
                [
                    new RentalBookingLine
                    {
                        Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1"),
                        ItemId = generatorId,
                        Quantity = 3
                    }
                ]
            },
            new RentalBooking
            {
                Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2"),
                ItemId = generatorId,
                StartDate = now.AddDays(1),
                EndDate = now.AddDays(4),
                Quantity = 2,
                BorrowerName = "Jugendfeuerwehr Zentrum",
                Status = RentalStatus.Planned,
                CreatedAt = now,
                UpdatedAt = now,
                Lines =
                [
                    new RentalBookingLine
                    {
                        Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2"),
                        ItemId = generatorId,
                        Quantity = 2
                    }
                ]
            },
            new RentalBooking
            {
                Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3"),
                ItemId = generatorId,
                StartDate = now.AddDays(-10),
                EndDate = now.AddDays(-8),
                Quantity = 2,
                BorrowerName = "THW Partnergruppe",
                Status = RentalStatus.Completed,
                CreatedAt = now,
                UpdatedAt = now,
                Lines =
                [
                    new RentalBookingLine
                    {
                        Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3"),
                        ItemId = generatorId,
                        Quantity = 2
                    }
                ]
            },
            new RentalBooking
            {
                Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4"),
                ItemId = ladderId,
                StartDate = now.AddDays(1),
                EndDate = now.AddDays(3),
                Quantity = 1,
                BorrowerName = "Dorfverein West",
                Status = RentalStatus.Canceled,
                CreatedAt = now,
                UpdatedAt = now,
                Lines =
                [
                    new RentalBookingLine
                    {
                        Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4"),
                        ItemId = ladderId,
                        Quantity = 1
                    }
                ]
            }
        };

        await dbContext.InventoryCategories.AddRangeAsync(categories, cancellationToken);
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