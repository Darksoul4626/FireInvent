## MODIFIED Requirements

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
