## ADDED Requirements

### Requirement: Category list actions shall be grouped where action density warrants it
The system SHALL group category row actions into a dedicated Aktionen column when two or more direct row-level actions are available.

#### Scenario: Category rows with multiple direct actions use grouped presentation
- **WHEN** a user views category rows that provide multiple direct actions
- **THEN** the system MUST render those actions as a grouped pattern in a dedicated Aktionen column

#### Scenario: Single-action category contexts remain ungrouped
- **WHEN** a category row exposes only one direct action
- **THEN** the system MUST allow a non-grouped action presentation to avoid unnecessary visual complexity