using FireInvent.Api.Domain.Enums;

namespace FireInvent.Api.Domain.Entities;

public sealed class RentalBooking
{
    public Guid Id { get; set; }
    public Guid ItemId { get; set; }
    public InventoryItem Item { get; set; } = null!;
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset EndDate { get; set; }
    public int Quantity { get; set; }
    public RentalStatus Status { get; set; } = RentalStatus.Planned;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
