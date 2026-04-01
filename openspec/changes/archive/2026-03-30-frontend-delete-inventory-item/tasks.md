## 1. Proxy and API Integration

- [x] 1.1 Extend item-by-id proxy route with `DELETE` handler using `InventoryItemsService.deleteApiItems`
- [x] 1.2 Reuse shared proxy error mapping so item delete conflict and not-found responses stay consistent
- [x] 1.3 Add/adjust focused tests for the proxy delete path if route tests exist for this layer (no existing dedicated proxy-route test suite in this layer)

## 2. Inventory UI Delete Workflow

- [x] 2.1 Add delete action entry point in inventory overview (desktop table and mobile cards) with stable `data-testid` selectors
- [x] 2.2 Add delete action entry point on inventory detail page
- [x] 2.3 Implement explicit user confirmation before sending delete request
- [x] 2.4 Implement busy state to prevent duplicate delete requests while operation is running
- [x] 2.5 On successful delete, navigate/refresh so removed item is no longer visible in inventory views
- [x] 2.6 On conflict or not-found, surface user-readable error feedback without breaking page interaction

## 3. Tests and Verification

- [x] 3.1 Update/add Vitest tests for delete action rendering, confirmation cancel path, and error display behavior
- [x] 3.2 Update/add Playwright flow to cover successful item deletion and conflict feedback for linked-rental item
- [x] 3.3 Run frontend unit tests and Playwright suite (or targeted specs) and fix regressions
- [x] 3.4 Run frontend build validation and ensure no type/lint regressions in touched files
