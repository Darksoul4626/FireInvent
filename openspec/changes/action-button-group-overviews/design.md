## Context

FireInvent currently uses list/table-heavy management screens for inventory, rentals, and categories. Row-level actions exist, but their placement and grouping are inconsistent across modules, which increases cognitive load for frequent operational workflows.

This change is frontend-only and targets presentation/interaction consistency. Domain model, rental lifecycle rules, availability calculations, API contracts, and database schema remain unchanged.

Key constraints:
- Preserve existing permissions and business behavior of all actions.
- Keep layouts usable on desktop and narrow viewports.
- Avoid introducing backend or OpenAPI client regeneration work for a purely UI concern.

## Goals / Non-Goals

**Goals:**
- Provide a dedicated Aktionen column in inventory and rental overview tables.
- Render row actions as a consistent ButtonGroup pattern with predictable order and styling.
- Apply the same pattern to other suitable list contexts (for example category rows) using clear applicability criteria.
- Preserve keyboard accessibility, focus order, and destructive-action affordances.

**Non-Goals:**
- No backend API, DTO, or validation changes.
- No data model or migration changes.
- No redesign of unrelated navigation, forms, or calendar visualization patterns outside action-group applicability.

## Decisions

1. Decision: Introduce a shared row action group composition for table/list rows.
Rationale: A shared composition reduces divergence and improves long-term consistency across modules.
Alternative considered: Keep per-page custom action markup. Rejected because it continues drift and duplicates accessibility/styling work.

2. Decision: Standardize action order to Open -> Edit -> Delete where all three exist.
Rationale: Stable ordering improves recognition and lowers interaction errors.
Alternative considered: Preserve existing per-screen ordering. Rejected because inconsistent ordering is the current usability problem.

3. Decision: Define applicability rule for "where meaningful" as follows: use ButtonGroup when a row exposes two or more direct, frequently used actions.
Rationale: Avoid forcing grouping on single-action rows or contexts that are better served by status toggles/menus.
Alternative considered: Enforce ButtonGroup everywhere. Rejected because it can create visual noise and poor fit in low-action contexts.

4. Decision: Keep labels visible (no icon-only default) and retain destructive visual treatment for Delete.
Rationale: Text labels reduce ambiguity for mixed user groups and improve accessibility.
Alternative considered: Icon-only compact buttons by default. Rejected due to discoverability and accessibility trade-offs.

5. Decision: Treat this as zero API-contract-impact change.
Rationale: Action grouping changes rendering only; endpoints and payloads stay identical.
Alternative considered: API-level action metadata introduction. Rejected as unnecessary complexity for current scope.

## Risks / Trade-offs

- [Risk] Table width growth on small screens due to grouped actions -> Mitigation: keep responsive overflow strategy and verify mobile/tablet behavior in affected pages.
- [Risk] Test fragility from DOM structure changes -> Mitigation: migrate tests to stable role/label or dedicated test IDs where needed.
- [Risk] Inconsistent adoption if applicability is interpreted differently per module -> Mitigation: codify applicability criteria in tasks and review checklist.
- [Trade-off] Shared group abstraction may limit per-page stylistic freedom -> Mitigation: allow controlled variant props for legitimate exceptions.

## Migration Plan

1. Implement shared row-action group pattern in frontend components.
2. Update inventory and rental overview tables first, then category list where criteria match.
3. Update unit and e2e selectors/assertions impacted by grouped action markup.
4. Validate responsive and keyboard behavior before merge.

Rollback strategy:
- Revert affected frontend component changes; no database/API rollback required.
- Since contracts remain unchanged, rollback risk is limited to UI behavior restoration.

## Open Questions

- Calendar fallback table rows remain out-of-scope for this change because they currently expose no direct row actions to group.
- Grouped actions use global compact `sm` sizing in affected overview contexts for consistent density.

## Implementation Scope Notes

- In-scope: `frontend/src/app/inventory/page.tsx` mobile cards and desktop table rows (oeffnen, bearbeiten, loeschen).
- In-scope: `frontend/src/app/rentals/page.tsx` mobile cards and desktop table rows (bearbeiten plus lifecycle row actions).
- In-scope: `frontend/src/components/inventory-category-manager.tsx` non-edit list rows with multiple direct actions.
- Out-of-scope: `frontend/src/components/rental-calendar.tsx` fallback rows (no direct row action buttons).
- Out-of-scope: detail/edit pages that are not overview/list rows.