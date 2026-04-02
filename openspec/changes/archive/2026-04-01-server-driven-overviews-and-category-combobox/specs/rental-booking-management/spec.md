## MODIFIED Requirements

### Requirement: Rental UI shall use a consistent design-system based presentation
The system SHALL render rental list, rental form, and lifecycle action areas with unified design-system components and interaction patterns.

#### Scenario: Rental list and lifecycle actions are visually consistent
- **WHEN** a user opens rental management
- **THEN** list/table structure, action controls, and status emphasis MUST follow shared design-system conventions

#### Scenario: Rental overview actions use grouped action column
- **WHEN** a user views rental rows with direct open, edit, or delete-style actions
- **THEN** the system MUST present those actions in a dedicated Aktionen column using a grouped action pattern with stable ordering and preserved destructive emphasis

#### Scenario: Rental form feedback is consistently presented
- **WHEN** a user submits invalid or conflicting rental input
- **THEN** validation and error feedback MUST be shown with consistent design-system feedback patterns

## ADDED Requirements

### Requirement: Rental overview queries shall be server-driven
The system SHALL provide rental overview data via backend-driven query processing including paging and filtering.

#### Scenario: Rental overview default page size
- **WHEN** a user opens the rental overview without explicit paging parameters
- **THEN** the system MUST return the first page with a default of 20 entries

#### Scenario: Rental overview filter change triggers backend query
- **WHEN** a user changes rental status, item, or date-range filters
- **THEN** the system MUST request updated rows from the backend using the updated query parameters

#### Scenario: Rental overview sorting is local to loaded rows
- **WHEN** a user applies sorting in the rental overview table
- **THEN** the system MUST sort the currently loaded rows locally without triggering an additional backend overview request

#### Scenario: Rental overview response includes paging metadata
- **WHEN** the backend returns rental overview rows
- **THEN** the response MUST include paging metadata needed to render navigation state

### Requirement: Rental creation shall not allow past start days
The system SHALL only allow rental creation for start dates on or after the current operational day, where the day boundary is defined in `Europe/Berlin` and evaluated on date-only semantics.

#### Scenario: Create rejects past start day
- **WHEN** a user submits a rental creation request with a start date before today in `Europe/Berlin`
- **THEN** the system MUST reject the request with validation feedback and MUST NOT persist the rental

#### Scenario: Edit enforces the same start-day boundary for applicable changes
- **WHEN** a user updates a rental in a way that sets or moves the start date before today in `Europe/Berlin`
- **THEN** the system MUST reject the update with validation feedback and MUST NOT persist the change

### Requirement: Rental form shall provide pre-submit availability validation
The system SHALL validate rental input in the UI before submit by refreshing availability for selected positions and date range changes.

#### Scenario: Availability refresh on date range change
- **WHEN** a user changes rental start or end date in the form
- **THEN** the system MUST refresh and display current availability for all selected rental positions

#### Scenario: Availability refresh on position change
- **WHEN** a user adds, removes, or changes a rental position or quantity
- **THEN** the system MUST refresh and display current availability for the affected positions in the selected date range

#### Scenario: Save is blocked on detected conflicts
- **WHEN** the UI detects that requested quantity exceeds current availability for any position
- **THEN** the system MUST disable or block save and present actionable conflict feedback before submission
