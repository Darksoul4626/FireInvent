## ADDED Requirements

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
