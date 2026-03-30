## MODIFIED Requirements

### Requirement: Rental bookings can be created and lifecycle-managed
The system SHALL allow users to create, modify, cancel, return, and complete rental bookings with one or more rental lines, a defined date range, a borrower free-text value, and a booking status.

#### Scenario: Create valid multi-line rental
- **WHEN** a user creates a rental with a valid date range, borrower text, and at least one valid line item
- **THEN** the system MUST create a rental with one-or-many lines and an initial status according to lifecycle rules

#### Scenario: Reject rental without lines
- **WHEN** a user submits a rental without any line items
- **THEN** the system MUST reject the request with a validation error

#### Scenario: Edit rental with full field scope
- **WHEN** a user edits an existing rental
- **THEN** the system MUST allow updates to lines, date range, borrower text, and status subject to validation and lifecycle constraints

#### Scenario: Mark active rental as returned
- **WHEN** a user marks an active rental as returned
- **THEN** the system MUST set booking status to `Returned` as a technical status

#### Scenario: Complete a returned rental
- **WHEN** a user completes a rental in status `Returned`
- **THEN** the system MUST set booking status to `Completed`
