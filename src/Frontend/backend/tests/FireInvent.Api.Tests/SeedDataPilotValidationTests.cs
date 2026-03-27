using FireInvent.Api.Application.Services.Availability;
using FireInvent.Api.Application.Services.Rentals;
using FireInvent.Api.Contracts.Rentals;
using FireInvent.Api.Infrastructure.Persistence;
using FireInvent.Api.Infrastructure.Persistence.Repositories;
using FireInvent.Api.Infrastructure.Persistence.Repositories.Rentals;
using Microsoft.EntityFrameworkCore;

namespace FireInvent.Api.Tests;

public sealed class SeedDataPilotValidationTests
{
    [Fact]
    public async Task SeedAsync_Reset_InsertsRepresentativeInventoryAndRentals()
    {
        await using var dbContext = TestDbContextFactory.Create("seed-tests");

        var result = await FireInventSeedData.SeedAsync(
            dbContext,
            FireInventSeedMode.Reset,
            CancellationToken.None);

        Assert.True(result.Executed);
        Assert.Equal(3, await dbContext.InventoryItems.CountAsync());
        Assert.Equal(4, await dbContext.RentalBookings.CountAsync());
    }

    [Fact]
    public async Task Availability_WithSeedData_UsesOnlyPlannedAndActiveBookings()
    {
        await using var dbContext = TestDbContextFactory.Create("seed-tests");
        await FireInventSeedData.SeedAsync(dbContext, FireInventSeedMode.Reset, CancellationToken.None);

        var inventoryRepository = new InventoryItemRepository(dbContext);
        var rentalRepository = new RentalBookingRepository(dbContext);
        var availabilityService = new ItemAvailabilityService(inventoryRepository, rentalRepository);

        var generatorId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var from = DateTimeOffset.UtcNow;
        var to = from.AddDays(2);

        var result = await availabilityService.GetAsync(generatorId, from, to, CancellationToken.None);

        Assert.NotNull(result.Availability);
        Assert.Equal(8, result.Availability.TotalQuantity);
        Assert.Equal(5, result.Availability.ReservedOrRentedQuantity);
        Assert.Equal(3, result.Availability.AvailableQuantity);
    }

    [Fact]
    public async Task RentalCreation_WithSeedData_RejectsOverbookingForPilotScenario()
    {
        await using var dbContext = TestDbContextFactory.Create("seed-tests");
        await FireInventSeedData.SeedAsync(dbContext, FireInventSeedMode.Reset, CancellationToken.None);

        var inventoryRepository = new InventoryItemRepository(dbContext);
        var rentalRepository = new RentalBookingRepository(dbContext);
        var rentalService = new RentalBookingService(rentalRepository, inventoryRepository);

        var generatorId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var from = DateTimeOffset.UtcNow;
        var to = from.AddDays(2);

        var createResult = await rentalService.CreateAsync(
            new CreateRentalBookingRequest(generatorId, from, to, 4),
            CancellationToken.None);

        Assert.Equal("stock_conflict", createResult.ErrorCode);
    }
}