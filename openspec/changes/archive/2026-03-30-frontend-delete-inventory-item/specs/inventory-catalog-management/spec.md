## MODIFIED Requirements

### Requirement: Inventory items can be managed with complete core data
The system SHALL provide CRUD operations for inventory items including name, category, unique inventory identifier, total quantity, current condition, and storage location, and SHALL support deletion via the inventory management interface with clear conflict feedback.

#### Scenario: Create inventory item
- **WHEN** a user submits a new item with all required fields and an initial total quantity
- **THEN** the system MUST persist the item and return it with a unique identifier

#### Scenario: Update inventory item metadata
- **WHEN** a user updates category, condition, or location of an existing item
- **THEN** the system MUST save the new metadata and keep historical rental references intact

#### Scenario: Delete inventory item without rental history
- **WHEN** a user confirms deletion of an inventory item that has no linked rental history
- **THEN** the system MUST remove the inventory item and reflect that removal in the inventory overview

#### Scenario: Reject delete for inventory item with rental history
- **WHEN** a user requests deletion of an inventory item that has linked rental history
- **THEN** the system MUST reject deletion with a conflict response and provide a user-readable error message

#### Scenario: Cancel inventory item deletion
- **WHEN** a user initiates deletion but cancels the confirmation step
- **THEN** the system MUST keep the inventory item unchanged
