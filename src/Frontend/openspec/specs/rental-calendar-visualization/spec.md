## ADDED Requirements

### Requirement: Rental periods shall be visible in a calendar interface
The system SHALL provide a calendar and fallback list/table view that include all relevant rental lifecycle statuses including `Returned` and `Completed`.

#### Scenario: Display returned and completed rentals distinctly
- **WHEN** a user views rental entries in calendar or fallback table/list
- **THEN** the system MUST present `Returned` and `Completed` with clearly distinguishable status cues

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

### Requirement: Calendar display shall remain legible in light and dark mode
The system SHALL ensure rental status and conflict emphasis are readable in both themes.

#### Scenario: Conflict visibility in both themes
- **WHEN** a conflicting rental entry is displayed
- **THEN** conflict emphasis MUST remain clearly distinguishable in light and dark modes