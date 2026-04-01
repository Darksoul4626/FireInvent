## Context

The current FireInvent implementation already enforces stock conflicts on API create/update paths, but the calendar still renders an additional computed conflict cue. In parallel, status progression to `Active` is manual (or edit-driven), and overview tables are static without unified sort/filter behavior.

This design intentionally keeps FullCalendar in place and introduces targeted lifecycle automation plus shared tabular interaction capabilities.

## Goals / Non-Goals

**Goals:**

- Preserve FullCalendar-based calendar UX and route structure.
- Remove conflict as a calendar-visible status/cue.
- Ensure overbooking is handled at API validation time during create/update.
- Automatically transition rentals from `Planned` to `Active` when start time is reached.
- Make hosted service cadence configurable in `appsettings` with a default of 5 minutes.
- Implement sortable/filterable inventory and rental overviews using Option 2 (shared DataTable + TanStack Table state models).
- Improve mobile usability in affected pages without changing business workflows.

**Non-Goals:**

- Replacing FullCalendar with another library.
- Introducing a new `Conflict` lifecycle status in domain/API.
- Building server-side query endpoints for sorting/filtering in this change.
- Redesigning unrelated pages.

## Decisions

1. Decision: Keep FullCalendar as the calendar rendering engine.
Rationale: This change targets operational UX/lifecycle consistency, not calendar library migration risk.
Alternative considered: Replace FullCalendar immediately. Rejected by scope decision.

2. Decision: Remove conflict cues from calendar/list visualization.
Rationale: Conflict prevention belongs to API validation during create/update and should not appear as a standalone UI status in normal operations.
Alternative considered: Keep visual conflict fallback for diagnostics. Rejected to reduce user-facing noise.

3. Decision: Add a hosted lifecycle automation service for `Planned` -> `Active`.
Rationale: Lifecycle should reflect real-time operations without manual status editing.
Alternative considered: Trigger only on read. Rejected because it hides stale persisted state and weakens operational consistency.

4. Decision: Configure hosted service interval through `appsettings`.
Rationale: Cadence tuning should be environment-specific and explicit.
Default: run every 5 minutes when configuration is absent.
Alternative considered: hard-coded interval. Rejected due to operational inflexibility.

5. Decision: Implement table interactions via shared DataTable foundation (TanStack Option 2).
Rationale: Consistent sorting/filtering behavior across inventory and rental overviews with reusable state handling.
Alternative considered: per-page ad hoc sorting/filtering. Rejected because it duplicates logic and diverges UX.

## Architecture and Flow

### Lifecycle Automation

- Hosted service loop:
  - Wait for configured interval.
  - Query rentals in `Planned` whose `StartDate <= now` (UTC-safe comparison).
  - Transition eligible rows to `Active`.
  - Persist in a bounded, idempotent batch.
  - Log counts and errors with structured logging.

- Idempotency rules:
  - Already `Active` rows are skipped.
  - Canceled/completed rows are never touched.

### Configuration Contract

- Add a dedicated options section in appsettings, for example:
  - `RentalLifecycleAutomation:Enabled` (default `true`)
  - `RentalLifecycleAutomation:IntervalMinutes` (default `5`)
- Enforce minimum safe interval guard (for example >= 1 minute) to avoid accidental hot loops.

### Calendar Behavior

- Keep existing FullCalendar month/week/day interaction model.
- Narrow visible operational statuses in calendar/list context to `Planned` and `Active`.
- Remove conflict legend badge, conflict-specific row field, and conflict-specific color semantics.

### DataTable Foundation (Option 2)

- Introduce/extend a shared DataTable composition backed by TanStack Table state:
  - sorting state
  - column filters
  - shared table toolbar/filter controls
- Apply to:
  - inventory overview columns
  - rental overview columns
- Mobile behavior:
  - preserve card/list readability on narrow viewports
  - ensure filter controls remain usable and not overcrowded

## API / Contract Impact

- No public endpoint additions are required.
- No OpenAPI schema changes are required for hosted-service automation.
- Existing create/update conflict responses remain the contract boundary for overbooking prevention.

## Data Model / Migration / Rollback

- Data model changes: none required.
- Database migration: none required.
- Rollback strategy:
  - Disable hosted automation via configuration flag.
  - Revert frontend DataTable/calendar presentation changes.
  - No schema rollback needed.

## Risks / Trade-offs

- [Risk] Activation timing mismatch around timezone assumptions.
  - Mitigation: use UTC consistently and add edge-case tests.
- [Risk] High-volume rental datasets may impact client-side filtering performance.
  - Mitigation: baseline dataset expectations and add follow-up server-side query change if needed.
- [Trade-off] Removing conflict cues reduces diagnostic visibility in calendar UI.
  - Mitigation: rely on API validation and logs for conflict diagnostics.

## Rollout Plan

1. Add lifecycle automation behind config defaults.
2. Ship DataTable foundation on inventory/rentals.
3. Simplify calendar status rendering (FullCalendar retained).
4. Validate mobile, unit, and e2e coverage before merge.

## Open Questions

- None. Scope constraints are explicit:
  - FullCalendar remains.
  - Conflict cues removed.
  - Hosted interval appsettings-configurable with 5-minute default.
  - DataTable Option 2 adopted.

## Implementation Validation Notes

- FullCalendar remains the active calendar engine; no calendar library migration was introduced.
- The calendar route and navigation remain unchanged (`/calendar` entry points are preserved).
- Conflict-removal scope is limited to UI presentation cues in calendar/list contexts; backend create/update stock-conflict validation remains the authoritative conflict gate.
