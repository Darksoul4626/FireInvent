## ADDED Requirements

### Requirement: Rental periods shall be visible in a calendar interface
The system SHALL provide a calendar view that displays planned and active rental periods for inventory items across configurable date ranges.

#### Scenario: Display rentals in selected month
- **WHEN** a user opens the calendar and selects a month
- **THEN** the system MUST display all bookings that overlap with that month

#### Scenario: Filter calendar by item
- **WHEN** a user applies an item filter in the calendar
- **THEN** the system MUST show only bookings related to the selected item

#### Scenario: Highlight conflicting overlaps
- **WHEN** overlapping bookings would exceed available quantity for an item
- **THEN** the system MUST visually mark the affected entries as conflicts

### Requirement: Test-targeted calendar UI elements shall expose data-testid attributes
The system SHALL provide stable `data-testid` attributes on calendar filter and table/list elements targeted by automated tests.

#### Scenario: Calendar filter tests use stable test IDs
- **WHEN** calendar filter behavior is validated in unit or end-to-end tests
- **THEN** targeted filter and visible-row elements MUST be addressable via `data-testid`