## ADDED Requirements

### Requirement: Rental bookings can be created and lifecycle-managed
The system SHALL allow users to create, modify, cancel, and complete rental bookings for inventory items with a defined start date, end date, quantity, and booking status.

#### Scenario: Create valid rental booking
- **WHEN** a user creates a booking with valid item, date range, and quantity
- **THEN** the system MUST create the booking with an initial active or planned status

#### Scenario: Cancel rental booking
- **WHEN** a user cancels an existing planned or active booking
- **THEN** the system MUST mark the booking as canceled and release reserved quantity

#### Scenario: Complete rental booking on return
- **WHEN** a user marks an active booking as returned
- **THEN** the system MUST set booking status to completed and recalculate availability

### Requirement: End-to-end rental flow shall be validated with Playwright
The system SHALL validate the cross-page rental workflow with Playwright-based browser end-to-end tests.

#### Scenario: Validate rental lifecycle flow in browser
- **WHEN** Playwright end-to-end tests are executed
- **THEN** the flow item create -> rental create -> return/completion -> availability update MUST be verified

### Requirement: Test-targeted rental UI elements shall expose data-testid attributes
The system SHALL provide stable `data-testid` attributes on rental form and rental list elements addressed by Vitest or Playwright tests.

#### Scenario: Playwright rental selectors use stable test IDs
- **WHEN** end-to-end rental flow tests run
- **THEN** addressed create/complete flow elements MUST be selected via `data-testid` attributes

### Requirement: Rental UI shall use a consistent design-system based presentation
The system SHALL render rental list, rental form, and lifecycle action areas with unified design-system components and interaction patterns.

#### Scenario: Rental list and lifecycle actions are visually consistent
- **WHEN** a user opens rental management
- **THEN** list/table structure, action controls, and status emphasis MUST follow shared design-system conventions

#### Scenario: Rental form feedback is consistently presented
- **WHEN** a user submits invalid or conflicting rental input
- **THEN** validation and error feedback MUST be shown with consistent design-system feedback patterns

### Requirement: Rental management screens shall remain fully usable across breakpoints
The system SHALL provide responsive rental page behavior for desktop, tablet, and mobile viewports.

#### Scenario: Rental list remains operable on mobile
- **WHEN** a user accesses rental management on a narrow viewport
- **THEN** critical booking data and actions MUST remain accessible without broken layout