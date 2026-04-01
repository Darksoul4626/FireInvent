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