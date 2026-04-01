using FireInvent.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FireInvent.Api.Tests;

internal static class TestDbContextFactory
{
    public static FireInventDbContext Create(string scope)
    {
        var options = new DbContextOptionsBuilder<FireInventDbContext>()
            .UseInMemoryDatabase($"{scope}-{Guid.NewGuid()}")
            .Options;

        return new FireInventDbContext(options);
    }
}