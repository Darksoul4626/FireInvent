## MODIFIED Requirements

### Requirement: Rental UI shall use a consistent design-system based presentation
The system SHALL render rental list, rental form, and lifecycle action areas with unified design-system components and interaction patterns.

#### Scenario: Rental overview supports sortable and filterable columns
- **WHEN** a user opens rental overview tables
- **THEN** the system MUST provide sorting and filtering interactions through the shared DataTable foundation

## ADDED Requirements

### Requirement: Planned rentals shall be activated automatically based on start time
The system SHALL transition rentals from `Planned` to `Active` when the planned rental start has been reached.

#### Scenario: Automatic activation on scheduler cycle
- **WHEN** lifecycle automation runs and a rental is `Planned` with `StartDate` at or before current processing time
- **THEN** the system MUST persist that rental as `Active`

#### Scenario: Terminal states remain unchanged
- **WHEN** lifecycle automation runs
- **THEN** rentals in `Canceled` or `Completed` MUST remain unchanged

### Requirement: Lifecycle automation cadence shall be configurable
The system SHALL allow scheduling cadence configuration via application settings.

#### Scenario: Default cadence is applied when unset
- **WHEN** lifecycle cadence configuration is absent
- **THEN** the hosted lifecycle automation MUST run every 5 minutes by default

#### Scenario: Configured cadence overrides default
- **WHEN** lifecycle cadence is configured in application settings
- **THEN** the hosted lifecycle automation MUST use the configured value
