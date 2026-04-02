## Purpose
Define how rental periods are visualized in calendar and fallback list/table views.

## Requirements

### Requirement: Rental periods shall be visible in the existing FullCalendar interface
The system SHALL keep the FullCalendar-based calendar interface and SHALL present calendar/list entries for operationally relevant rental statuses.

#### Scenario: FullCalendar interaction model remains available
- **WHEN** a user opens the rental calendar
- **THEN** the system MUST provide the existing FullCalendar-driven month/week/day interaction model

#### Scenario: Calendar focuses on operational statuses
- **WHEN** a user views rental entries in calendar or fallback list/table
- **THEN** the system MUST focus visible entries on `Planned` and `Active` statuses

### Requirement: Test-targeted calendar UI elements shall expose data-testid attributes
The system SHALL provide stable `data-testid` attributes on calendar filter and table/list elements targeted by automated tests.

#### Scenario: Calendar filter tests use stable test IDs
- **WHEN** calendar filter behavior is validated in unit or end-to-end tests
- **THEN** targeted filter and visible-row elements MUST be addressable via `data-testid`

### Requirement: Calendar view shall align with global theme and design system
The system SHALL present calendar controls, legends, and fallback table/list elements with the shared theme and design-system styling.

#### Scenario: Calendar controls follow global style
- **WHEN** a user opens the calendar page
- **THEN** filter controls, view toggles, and supporting labels MUST use shared component styling and state behavior

#### Scenario: Calendar fallback table follows shared data presentation pattern
- **WHEN** dense data triggers or user selects table/list fallback view
- **THEN** fallback presentation MUST follow the same spacing and status styling language as other data-heavy pages

### Requirement: Calendar view shall not expose conflict status cues
The system SHALL not render `Conflict` as a calendar-visible status, legend badge, or row-level cue.

#### Scenario: Conflict cue removal in calendar and fallback list/table
- **WHEN** rental entries are rendered in calendar or fallback list/table
- **THEN** no conflict-specific status label, badge, or highlight MUST be shown