## 1. Scope and adoption criteria

- [x] 1.1 Enumerate all frontend list/table views with row-level actions (inventory, rentals, categories, and other candidate overviews).
- [x] 1.2 Mark each view as in-scope or out-of-scope using the agreed rule: apply grouped actions when two or more direct row actions exist.
- [x] 1.3 Confirm unresolved scope decisions from design open questions (for example calendar fallback action grouping) and record the result in the change notes.

## 2. Shared row action group foundation

- [x] 2.1 Implement or extract a reusable row action ButtonGroup composition for table/list rows with stable action ordering.
- [x] 2.2 Ensure grouped actions preserve destructive emphasis for Delete and keep text labels visible for accessibility.
- [x] 2.3 Add or update reusable test selectors/attributes used by unit and e2e tests for grouped action controls.

## 3. Apply grouped actions to targeted capabilities

- [x] 3.1 Update inventory overview to render a dedicated Aktionen column with grouped row actions.
- [x] 3.2 Update rental overview to render a dedicated Aktionen column with grouped row and lifecycle-compatible actions.
- [x] 3.3 Update category management list rows to use grouped action presentation where multiple direct actions exist.
- [x] 3.4 Apply the same pattern to additional in-scope overview contexts identified in 1.1 and leave out-of-scope contexts unchanged.

## 4. Validation and regression checks

- [x] 4.1 Update and pass frontend unit tests for affected action-rendering components and table views (`npm run test:unit`).
- [x] 4.2 Update and pass affected Playwright flows for inventory/rental action interactions (`npm run test:e2e`).
- [x] 4.3 Validate responsive and keyboard interaction behavior on affected overviews (desktop and narrow viewport).
- [x] 4.4 Run frontend build (`npm run build`) and verify API contract sync remains clean (`npm run check:api-contract-sync`); linting intentionally skipped per user request.