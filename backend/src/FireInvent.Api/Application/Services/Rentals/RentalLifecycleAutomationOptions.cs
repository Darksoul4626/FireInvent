namespace FireInvent.Api.Application.Services.Rentals;

public sealed class RentalLifecycleAutomationOptions
{
    public const string SectionName = "RentalLifecycleAutomation";

    public bool Enabled { get; set; } = true;
    public int IntervalMinutes { get; set; } = 5;
}