## ADDED Requirements

### Requirement: Inventory item category input shall support inline category creation
The system SHALL allow users to select existing categories or create a new category inline while creating a new inventory item.

#### Scenario: User selects an existing category through combobox search
- **WHEN** a user types in the category input while creating an inventory item
- **THEN** the system MUST present matching existing categories and allow selecting one value

#### Scenario: User creates a new category inline
- **WHEN** a user enters a category value that does not exist and confirms inline creation
- **THEN** the system MUST create the category via backend API and set it as the selected category for the form

#### Scenario: Inline category creation handles duplicate names
- **WHEN** inline creation is requested for a category name that already exists by backend uniqueness rules
- **THEN** the system MUST prevent duplicate creation and provide conflict feedback without losing the typed form state
