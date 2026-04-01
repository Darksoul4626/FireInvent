using FireInvent.Api.Application.Services.Availability;
using FireInvent.Api.Application.Services.Categories;
using FireInvent.Api.Application.Services.InventoryItems;
using FireInvent.Api.Application.Services.Rentals;
using FireInvent.Api.Domain.Repositories;
using FireInvent.Api.Domain.Repositories.Rentals;
using FireInvent.Api.Infrastructure.HostedServices;
using FireInvent.Api.Infrastructure.Http;
using FireInvent.Api.Infrastructure.Persistence;
using FireInvent.Api.Infrastructure.Persistence.Repositories;
using FireInvent.Api.Infrastructure.Persistence.Repositories.Rentals;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var dbProvider = builder.Configuration["FIREINVENT_DB_PROVIDER"]?.Trim().ToLowerInvariant();
var useInMemoryProvider = dbProvider == "inmemory";

builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var problem = new ValidationProblemDetails(context.ModelState)
            {
                Title = "Validation failed",
                Detail = "One or more validation errors occurred.",
                Status = StatusCodes.Status400BadRequest
            };
            problem.Extensions["code"] = "validation_failed";

            return new BadRequestObjectResult(problem);
        };
    });
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddMemoryCache();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton<IBusinessDayBoundary, EuropeBerlinBusinessDayBoundary>();
if (useInMemoryProvider)
{
    builder.Services.AddDbContext<FireInventDbContext>(options =>
        options.UseInMemoryDatabase("fireinvent-e2e"));
}
else
{
    var defaultConnection = builder.Configuration.GetConnectionString("DefaultConnection");
    if (string.IsNullOrWhiteSpace(defaultConnection))
    {
        throw new InvalidOperationException(
            "Connection string 'DefaultConnection' is missing. Configure appsettings or user secrets.");
    }

    builder.Services.AddDbContext<FireInventDbContext>(options =>
        options.UseNpgsql(defaultConnection));
}
builder.Services.AddScoped<IInventoryItemRepository, InventoryItemRepository>();
builder.Services.AddScoped<IInventoryItemService, InventoryItemService>();
builder.Services.AddScoped<IInventoryCategoryRepository, InventoryCategoryRepository>();
builder.Services.AddScoped<IInventoryCategoryService, InventoryCategoryService>();
builder.Services.AddScoped<IRentalBookingRepository, RentalBookingRepository>();
builder.Services.AddScoped<IRentalBookingService, RentalBookingService>();
builder.Services.Configure<RentalLifecycleAutomationOptions>(
    builder.Configuration.GetSection(RentalLifecycleAutomationOptions.SectionName));
builder.Services.AddHostedService<RentalLifecycleAutomationHostedService>();
builder.Services.AddScoped<IItemAvailabilityService, ItemAvailabilityService>();
builder.Services.AddProblemDetails();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();

var app = builder.Build();

await using (var scope = app.Services.CreateAsyncScope())
{
    var logger = scope.ServiceProvider
        .GetRequiredService<ILoggerFactory>()
        .CreateLogger("DatabaseStartup");
    var dbContext = scope.ServiceProvider.GetRequiredService<FireInventDbContext>();

    var seedResult = await dbContext.InitializeDatabaseAsync(CancellationToken.None);

    if (seedResult.Executed)
    {
        logger.LogInformation(
            "Seed data applied (mode: {Mode}) with {ItemCount} items and {RentalCount} rentals.",
            seedResult.Mode,
            seedResult.ItemCount,
            seedResult.RentalCount);
    }
    else
    {
        logger.LogInformation("Seed data skipped (mode: {Mode}). Reason: {Reason}", seedResult.Mode, seedResult.Reason);
    }
}

app.UseExceptionHandler(exceptionApp =>
{
    exceptionApp.Run(async context =>
    {
        var problem = ApiProblemDetails.InternalError(
            "An unexpected error occurred while processing the request.");

        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/problem+json";
        await context.Response.WriteAsJsonAsync(problem);
    });
});

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

var disableHttpsRedirection = builder.Configuration.GetValue<bool>("FIREINVENT_DISABLE_HTTPS_REDIRECTION");
if (!disableHttpsRedirection)
{
    app.UseHttpsRedirection();
}
app.MapControllers();

await app.RunAsync();
