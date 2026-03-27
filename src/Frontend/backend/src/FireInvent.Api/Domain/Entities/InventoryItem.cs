using FireInvent.Api.Domain.Enums;

namespace FireInvent.Api.Domain.Entities;

public sealed class InventoryItem
{
    public Guid Id { get; set; }
    public string InventoryCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public ItemCondition Condition { get; set; } = ItemCondition.Unknown;
    public string Location { get; set; } = string.Empty;
    public int TotalQuantity { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<RentalBooking> RentalBookings { get; set; } = new List<RentalBooking>();
}
