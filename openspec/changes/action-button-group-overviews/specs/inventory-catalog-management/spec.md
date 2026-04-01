## MODIFIED Requirements

### Requirement: Inventory UI shall use a consistent design-system based presentation
The system SHALL render inventory list and inventory form experiences using a unified component and spacing system instead of page-local inline styling patterns.

#### Scenario: Inventory list follows shared visual patterns
- **WHEN** a user opens the inventory overview
- **THEN** table/list structure, headings, spacing, and actions MUST follow the shared design-system conventions

#### Scenario: Inventory overview actions use grouped action column
- **WHEN** a user views inventory rows with direct actions
- **THEN** the system MUST render those controls in a dedicated Aktionen column as a grouped action pattern with stable ordering

#### Scenario: Inventory form controls follow shared component behavior
- **WHEN** a user opens inventory create or edit forms
- **THEN** input, select, validation, and submit controls MUST use consistent design-system behavior and visual states