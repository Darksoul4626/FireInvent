namespace FireInvent.Api.Domain.Entities;

public sealed class RentalBookingLine
{
    public Guid Id { get; set; }
    public Guid RentalBookingId { get; set; }
    public RentalBooking RentalBooking { get; set; } = null!;

    public Guid ItemId { get; set; }
    public InventoryItem Item { get; set; } = null!;

    public int Quantity { get; set; }
}
