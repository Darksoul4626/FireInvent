## MODIFIED Requirements

### Requirement: Rental periods shall be visible in the existing FullCalendar interface
The system SHALL keep the FullCalendar-based calendar interface and SHALL present calendar/list entries for operationally relevant rental statuses.

#### Scenario: FullCalendar interaction model remains available
- **WHEN** a user opens the rental calendar
- **THEN** the system MUST provide the existing FullCalendar-driven month/week/day interaction model

#### Scenario: Calendar focuses on operational statuses
- **WHEN** a user views rental entries in calendar or fallback list/table
- **THEN** the system MUST focus visible entries on `Planned` and `Active` statuses

### Requirement: Calendar view shall not expose conflict status cues
The system SHALL not render `Conflict` as a calendar-visible status, legend badge, or row-level cue.

#### Scenario: Conflict cue removal in calendar and fallback list/table
- **WHEN** rental entries are rendered in calendar or fallback list/table
- **THEN** no conflict-specific status label, badge, or highlight MUST be shown
