using FireInvent.Api.Domain.Enums;

namespace FireInvent.Api.Domain.Entities;

public sealed class RentalBooking
{
    public Guid Id { get; set; }

    // Legacy projection fields kept temporarily for compatibility during API transition.
    public Guid ItemId { get; set; }
    public InventoryItem Item { get; set; } = null!;

    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset EndDate { get; set; }

    // Legacy projection fields kept temporarily for compatibility during API transition.
    public int Quantity { get; set; }

    public string? BorrowerName { get; set; }
    public RentalStatus Status { get; set; } = RentalStatus.Planned;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<RentalBookingLine> Lines { get; set; } = new List<RentalBookingLine>();
}
