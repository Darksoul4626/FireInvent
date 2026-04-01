## ADDED Requirements

### Requirement: Categories shall be managed centrally for inventory usage
The system SHALL allow users to create, list, update, and delete categories used by inventory items.

#### Scenario: Create category
- **WHEN** a user creates a category with a valid unique name
- **THEN** the system MUST persist and expose the new category for inventory selection

#### Scenario: Delete unused category
- **WHEN** a user deletes a category that is not referenced by any inventory item
- **THEN** the system MUST remove the category

#### Scenario: Reject delete of used category
- **WHEN** a user deletes a category that is referenced by one or more inventory items
- **THEN** the system MUST reject the delete operation with a conflict response
