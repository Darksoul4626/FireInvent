using FireInvent.Api.Application.Services.Rentals;
using FireInvent.Api.Domain.Repositories.Rentals;
using Microsoft.Extensions.Options;

namespace FireInvent.Api.Infrastructure.HostedServices;

public sealed class RentalLifecycleAutomationHostedService(
    IServiceScopeFactory scopeFactory,
    IOptionsMonitor<RentalLifecycleAutomationOptions> optionsMonitor,
    ILogger<RentalLifecycleAutomationHostedService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Rental lifecycle automation scheduler started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            var options = NormalizeOptions(optionsMonitor.CurrentValue);

            if (options.Enabled)
            {
                await RunCycleAsync(stoppingToken);
            }
            else
            {
                logger.LogDebug("Rental lifecycle automation is disabled by configuration.");
            }

            try
            {
                await Task.Delay(TimeSpan.FromMinutes(options.IntervalMinutes), stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }

        logger.LogInformation("Rental lifecycle automation scheduler stopped.");
    }

    private async Task RunCycleAsync(CancellationToken stoppingToken)
    {
        try
        {
            await using var scope = scopeFactory.CreateAsyncScope();
            var repository = scope.ServiceProvider.GetRequiredService<IRentalBookingRepository>();
            var utcNow = DateTimeOffset.UtcNow;

            var transitionedCount = await repository.ActivateDuePlannedAsync(utcNow, stoppingToken);

            logger.LogInformation(
                "Rental lifecycle scheduler cycle finished at {UtcNow} with {TransitionedCount} transition(s).",
                utcNow,
                transitionedCount);
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            // Host shutdown requested; no additional handling required.
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Rental lifecycle scheduler cycle failed; continuing with next interval.");
        }
    }

    private RentalLifecycleAutomationOptions NormalizeOptions(RentalLifecycleAutomationOptions rawOptions)
    {
        var normalizedInterval = Math.Max(rawOptions.IntervalMinutes, 1);

        if (normalizedInterval != rawOptions.IntervalMinutes)
        {
            logger.LogWarning(
                "Invalid RentalLifecycleAutomation interval {ConfiguredIntervalMinutes} detected. Using {NormalizedIntervalMinutes} minute minimum.",
                rawOptions.IntervalMinutes,
                normalizedInterval);
        }

        return new RentalLifecycleAutomationOptions
        {
            Enabled = rawOptions.Enabled,
            IntervalMinutes = normalizedInterval
        };
    }
}