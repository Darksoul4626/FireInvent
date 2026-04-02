## MODIFIED Requirements

### Requirement: Inventory UI shall use a consistent design-system based presentation
The system SHALL render inventory list and inventory form experiences using a unified component and spacing system instead of page-local inline styling patterns.

#### Scenario: Inventory overview supports sortable and filterable columns
- **WHEN** a user opens the inventory overview
- **THEN** the system MUST provide sortable and filterable columns through the shared DataTable foundation

#### Scenario: Inventory overview remains usable on mobile viewports
- **WHEN** a user accesses inventory overview on narrow viewports
- **THEN** table/list interactions and actions MUST remain readable and operable without layout breakage
