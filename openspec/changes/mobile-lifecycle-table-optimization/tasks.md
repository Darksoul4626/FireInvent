## Phase 1: MVP Core (functional correctness first)

Goal: Ship the mandatory behavior changes with minimal operational risk.

### 1. Scope and baseline validation

- [x] 1.1 Confirm and document that FullCalendar remains the active calendar engine and is not replaced.
- [x] 1.2 Confirm calendar route behavior remains unchanged and compatible with existing navigation links.
- [x] 1.3 Record conflict-removal scope boundaries (UI cues removed, API conflict validation retained).

### 2. Backend lifecycle automation

- [x] 2.1 Introduce lifecycle automation options binding in backend configuration with defaults (`Enabled=true`, `IntervalMinutes=5`).
- [x] 2.2 Implement hosted service that transitions eligible rentals from `Planned` to `Active` on configured cadence.
- [x] 2.3 Ensure lifecycle automation is idempotent, UTC-safe, and excludes terminal/non-planned states.

### 3. Calendar behavior adjustments (FullCalendar retained)

- [x] 3.1 Remove conflict legend/cues from calendar/list presentation.
- [x] 3.2 Restrict operational calendar visibility to relevant statuses (`Planned`, `Active`) per approved scope.
- [x] 3.3 Keep FullCalendar month/week/day interactions and verify no regression in filter/view controls.

### 6. Validation and regression checks

- [x] 6.1 Add/update backend tests for lifecycle automation interval defaults and `Planned` -> `Active` transitions.
- [x] 6.2 Add/update frontend unit tests for DataTable sorting/filtering and calendar conflict-cue removal.
- [x] 6.3 Run and pass backend tests (`dotnet test`) and frontend unit tests (`npm run test:unit`).

## Phase 2: MVP Usability (table interactions + mobile fit)

Goal: Deliver sortable/filterable overviews and consistent mobile usability.

### 4. Shared DataTable foundation (Option 2)

- [x] 4.1 Add or extend shared DataTable foundation using TanStack sorting/filtering state patterns.
- [x] 4.2 Apply sortable/filterable columns to inventory overview.
- [x] 4.3 Apply sortable/filterable columns to rental overview.
- [x] 4.4 Ensure DataTable controls remain usable and compact on mobile/tablet breakpoints.

### 5. Mobile UX optimization

- [x] 5.1 Harmonize responsive behavior across inventory, rentals, and calendar-related views.
- [x] 5.2 Verify action density, spacing, and readability on narrow viewports.

### 6. Validation and regression checks

- [x] 6.4 Run and pass targeted e2e flows for mobile views and table interactions (`npm run test:e2e`).

## Phase 3: Hardening and release readiness

Goal: Strengthen resilience, accessibility, and release confidence.

### 2. Backend lifecycle automation

- [x] 2.4 Add structured logs and failure handling so scheduler errors do not crash API startup.

### 5. Mobile UX optimization

- [x] 5.3 Keep keyboard/focus accessibility intact after responsive and table interaction changes.

### 6. Validation and regression checks

- [x] 6.5 Run frontend build and contract-sync checks (`npm run build`, `npm run check:api-contract-sync`).
