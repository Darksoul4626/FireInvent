## ADDED Requirements

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
