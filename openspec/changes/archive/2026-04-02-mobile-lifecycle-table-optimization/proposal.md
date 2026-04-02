## Why

FireInvent still has operational friction in four connected areas:

- Mobile usability across inventory, rentals, and calendar is not yet consistent enough for field usage.
- Rental lifecycle status can stay stale in `Planned` without automatic activation.
- Calendar conflict visualization duplicates backend validation behavior and adds noise.
- Inventory and rental overview tables still lack built-in sorting and filtering.

This change aligns those topics into one coherent operational improvement while keeping calendar technology stable.

## What Changes

- Keep the existing FullCalendar-based calendar implementation and route.
- Optimize mobile presentation and interaction density for inventory, rentals, and calendar-related views.
- Remove `Conflict` as a calendar-visible status/cue and rely on API-side create/update validation for overbooking prevention.
- Introduce automated lifecycle transition from `Planned` to `Active` via a backend hosted service.
- Make hosted-service execution interval configurable via `appsettings`, with default execution every 5 minutes.
- Implement sortable and filterable overview tables using the shared DataTable foundation approach (Option 2 based on TanStack Table composition).

Non-goals:

- No replacement of FullCalendar.
- No introduction of new rental lifecycle statuses.
- No server-side search/sort API redesign in this change (table interaction remains frontend-driven).
- No auth/permission model changes.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `rental-calendar-visualization`: keep FullCalendar, narrow status focus, and remove conflict cues from calendar/list presentation.
- `rental-booking-management`: add automated `Planned` -> `Active` lifecycle progression and configurable execution cadence.
- `inventory-catalog-management`: add sortable/filterable column behavior and mobile-optimized overview interaction.
- `stock-availability-tracking`: make API-level overbooking prevention the single conflict-control mechanism for create/update flows.

## Impact

- Affected code:
  - Backend rental lifecycle orchestration (hosted service + configuration).
  - Frontend calendar presentation logic (status legend/filtering/conflict cue removal while retaining FullCalendar).
  - Frontend shared table foundations and inventory/rental overview pages.
  - Responsive layout behavior for mobile/tablet breakpoints in affected screens.
- Affected tests:
  - Backend unit tests for lifecycle transitions and scheduler cadence defaults.
  - Frontend unit tests for calendar status rendering and DataTable sorting/filtering behavior.
  - Playwright flows covering mobile viewport behavior and table interactions.
- APIs/dependencies:
  - No public API contract changes required.
  - No OpenAPI client regeneration expected.
  - No replacement of existing calendar dependency.
- Rollout impact:
  - Moderate UX and lifecycle behavior change.
  - Requires clear release notes for auto-activation timing and removed conflict badges.
- Risks:
  - Time-zone and execution-window edge cases for automated activation.
  - Potential frontend performance regression if client-side table filtering is not bounded for larger datasets.
  - Selector/test fragility where table markup transitions to shared DataTable abstractions.
