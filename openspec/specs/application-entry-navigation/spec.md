## Purpose
Define how users navigate from the start page into the core application modules.

## Requirements

### Requirement: Start page module entries shall provide clear button-like navigation links
The system SHALL provide module entry cards on the start page where navigation is triggered by explicit links styled as buttons, while cards themselves remain non-clickable containers.

#### Scenario: Navigate via inventory entry link button
- **WHEN** a user activates the inventory entry link within the start page card
- **THEN** the system MUST navigate to the inventory section

#### Scenario: Navigate via rental entry link button
- **WHEN** a user activates the rental entry link within the start page card
- **THEN** the system MUST navigate to the rental section

#### Scenario: Navigate via calendar entry link button
- **WHEN** a user activates the calendar entry link within the start page card
- **THEN** the system MUST navigate to the calendar section
