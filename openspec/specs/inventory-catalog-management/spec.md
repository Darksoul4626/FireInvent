## Purpose
Define expected behavior and UX consistency for inventory catalog listing and item form workflows.
## Requirements
### Requirement: Inventory UI shall use a consistent design-system based presentation
The system SHALL render inventory list and inventory form experiences using a unified component and spacing system instead of page-local inline styling patterns.

#### Scenario: Inventory list follows shared visual patterns
- **WHEN** a user opens the inventory overview
- **THEN** table/list structure, headings, spacing, and actions MUST follow the shared design-system conventions

#### Scenario: Inventory overview supports sortable and filterable columns
- **WHEN** a user opens the inventory overview
- **THEN** the system MUST provide sortable and filterable columns through the shared DataTable foundation

#### Scenario: Inventory overview remains usable on mobile viewports
- **WHEN** a user accesses inventory overview on narrow viewports
- **THEN** table/list interactions and actions MUST remain readable and operable without layout breakage

#### Scenario: Inventory overview actions use grouped action column
- **WHEN** a user views inventory rows with direct actions
- **THEN** the system MUST render those controls in a dedicated Aktionen column as a grouped action pattern with stable ordering

#### Scenario: Inventory form controls follow shared component behavior
- **WHEN** a user opens inventory create or edit forms
- **THEN** input, select or combobox, validation, and submit controls MUST use consistent design-system behavior and visual states

### Requirement: Inventory overview queries shall be server-driven
The system SHALL provide inventory overview data via backend-driven query processing including paging and filtering.

#### Scenario: Inventory overview default page size
- **WHEN** a user opens the inventory overview without explicit paging parameters
- **THEN** the system MUST return the first page with a default of 20 entries

#### Scenario: Inventory overview filter change triggers backend query
- **WHEN** a user changes a filter value in the inventory overview
- **THEN** the system MUST request updated rows from the backend using the new query parameters

#### Scenario: Inventory overview search is evaluated server-side
- **WHEN** a user applies search text in the inventory overview
- **THEN** the backend MUST evaluate search criteria before returning the paged result

#### Scenario: Inventory overview sorting is local to loaded rows
- **WHEN** a user applies sorting in the inventory overview table
- **THEN** the system MUST sort the currently loaded rows locally without triggering an additional backend overview request

#### Scenario: Inventory overview response includes paging metadata
- **WHEN** the backend returns inventory overview rows
- **THEN** the response MUST include paging metadata needed to render navigation state

