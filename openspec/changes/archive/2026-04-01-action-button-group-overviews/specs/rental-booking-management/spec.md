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