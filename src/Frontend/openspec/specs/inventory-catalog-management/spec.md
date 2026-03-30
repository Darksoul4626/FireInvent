## ADDED Requirements

### Requirement: Inventory items can be managed with complete core data
The system SHALL provide CRUD operations for inventory items including name, category, unique inventory identifier, total quantity, current condition, and storage location.

#### Scenario: Create inventory item
- **WHEN** a user submits a new item with all required fields and an initial total quantity
- **THEN** the system MUST persist the item and return it with a unique identifier

#### Scenario: Update inventory item metadata
- **WHEN** a user updates category, condition, or location of an existing item
- **THEN** the system MUST save the new metadata and keep historical rental references intact

#### Scenario: Reject incomplete item creation
- **WHEN** a user submits a new item without required fields
- **THEN** the system MUST reject the request with validation errors

### Requirement: Frontend inventory unit tests shall run with Vitest
The system SHALL validate inventory form behavior and stock presentation logic with Vitest-based frontend unit tests.

#### Scenario: Validate inventory create/edit form behavior
- **WHEN** frontend unit tests are executed
- **THEN** inventory create/edit form validation and submit behavior MUST be verified via Vitest

#### Scenario: Validate stock display calculation output
- **WHEN** frontend unit tests are executed
- **THEN** stock display logic for total, rented, and available quantities MUST be verified via Vitest

### Requirement: Test-targeted inventory UI elements shall expose data-testid attributes
The system SHALL provide stable `data-testid` attributes on inventory form and stock display elements that are targeted by automated tests.

#### Scenario: Vitest inventory selectors use stable test IDs
- **WHEN** frontend inventory unit tests run
- **THEN** the addressed DOM elements MUST be selected via `data-testid` attributes instead of fragile text-only selectors

### Requirement: Inventory UI shall use a consistent design-system based presentation
The system SHALL render inventory list and inventory form experiences using a unified component and spacing system instead of page-local inline styling patterns.

#### Scenario: Inventory list follows shared visual patterns
- **WHEN** a user opens the inventory overview
- **THEN** table/list structure, headings, spacing, and actions MUST follow the shared design-system conventions

#### Scenario: Inventory form controls follow shared component behavior
- **WHEN** a user opens inventory create or edit forms
- **THEN** input, select, validation, and submit controls MUST use consistent design-system behavior and visual states

### Requirement: Inventory screens shall remain fully usable on mobile and tablet
The system SHALL provide responsive inventory list and form layouts for common viewport sizes.

#### Scenario: Inventory list on narrow viewport
- **WHEN** a user views inventory on a narrow screen
- **THEN** the system MUST keep data accessible via responsive layout behavior (for example horizontal table overflow or equivalent fallback)

#### Scenario: Inventory form on narrow viewport
- **WHEN** a user views the inventory form on mobile
- **THEN** the form MUST remain readable and fully operable without horizontal clipping