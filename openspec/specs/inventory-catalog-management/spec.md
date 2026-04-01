## ADDED Requirements

### Requirement: Inventory items can be managed with complete core data
The system SHALL manage inventory items with a required category reference from managed categories instead of free-text category input.

#### Scenario: Create inventory item with category reference
- **WHEN** a user creates an inventory item
- **THEN** the system MUST require a valid existing category reference

#### Scenario: Update inventory item category reference
- **WHEN** a user updates an inventory item
- **THEN** the system MUST persist the selected managed category reference

#### Scenario: Reject inventory item with missing category reference
- **WHEN** a user submits inventory item data without category reference
- **THEN** the system MUST reject the request with a validation error

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