using FireInvent.Api.Contracts.InventoryItems;

namespace FireInvent.Api.Application.Services.InventoryItems;

public interface IInventoryItemService
{
    Task<IReadOnlyList<InventoryItemResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<InventoryItemResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<InventoryItemServiceResult> CreateAsync(CreateInventoryItemRequest request, CancellationToken cancellationToken);
    Task<InventoryItemServiceResult> UpdateAsync(Guid id, UpdateInventoryItemRequest request, CancellationToken cancellationToken);
    Task<InventoryItemServiceResult> DeleteAsync(Guid id, CancellationToken cancellationToken);
}
