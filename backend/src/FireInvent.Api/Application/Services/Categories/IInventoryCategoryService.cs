using FireInvent.Api.Contracts.Categories;

namespace FireInvent.Api.Application.Services.Categories;

public interface IInventoryCategoryService
{
    Task<IReadOnlyList<InventoryCategoryResponse>> GetAllAsync(CancellationToken cancellationToken);
    Task<InventoryCategoryResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<InventoryCategoryServiceResult> CreateAsync(CreateInventoryCategoryRequest request, CancellationToken cancellationToken);
    Task<InventoryCategoryServiceResult> UpdateAsync(Guid id, UpdateInventoryCategoryRequest request, CancellationToken cancellationToken);
    Task<InventoryCategoryServiceResult> DeleteAsync(Guid id, CancellationToken cancellationToken);
}
