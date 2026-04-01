## ADDED Requirements

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
