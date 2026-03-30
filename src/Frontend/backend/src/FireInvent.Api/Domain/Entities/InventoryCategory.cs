namespace FireInvent.Api.Domain.Entities;

public sealed class InventoryCategory
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public ICollection<InventoryItem> Items { get; set; } = new List<InventoryItem>();
}
