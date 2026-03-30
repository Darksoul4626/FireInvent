## Why

Action controls in list-heavy workflows are currently not grouped consistently, especially across rental and inventory overviews. Grouping row actions into a dedicated Aktionen column improves scanning speed, reduces misclick risk, and creates a predictable interaction pattern for Feuerwehr users who execute these operations frequently.

## What Changes

- Introduce a dedicated Aktionen column in rental and inventory overview tables where row-level actions are available.
- Group row actions (for example Open, Edit, Delete) into a consistent ButtonGroup pattern instead of separated standalone controls.
- Standardize action ordering and visual treatment so users can reliably find primary and destructive actions.
- Extend the same grouping pattern to additional overview/list contexts where it is semantically appropriate and action density justifies grouping.
- Ensure responsive behavior keeps grouped actions usable on narrow viewports (for example horizontal overflow or compact wrapping strategy).
- Keep existing action permissions and backend behavior unchanged.

Non-goals:
- No backend API, domain, or database changes.
- No redefinition of business lifecycle rules for rentals or inventory.
- No broad redesign of unrelated page layouts.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `inventory-catalog-management`: require inventory overview row actions to appear in a dedicated Aktionen column using a grouped button pattern.
- `rental-booking-management`: require rental overview row and lifecycle actions to follow grouped action presentation where table/list context supports it.
- `inventory-category-management`: require category list actions to adopt grouped presentation in action-heavy list rows where applicable.

## Impact

- Affected code: frontend list/table components in inventory, rentals, and category management; shared UI composition for grouped row actions.
- Affected tests: frontend unit tests for action components and table rendering; Playwright flows that click row actions in inventory/rental overviews.
- APIs/dependencies: no API contract changes expected; no new external service dependencies required.
- Rollout impact: mostly visual/interaction-level change with low migration cost; requires coordinated test selector updates where action control structure changes.
- Risks:
  - Potential mobile layout crowding if button groups are not compact enough.
  - Potential regressions in keyboard navigation or focus order if grouping is not accessibility-validated.