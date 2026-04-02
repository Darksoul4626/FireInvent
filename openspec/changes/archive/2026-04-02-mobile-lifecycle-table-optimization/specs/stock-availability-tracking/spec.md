## MODIFIED Requirements

### Requirement: Availability shall be derived from stock and overlapping rentals
The system SHALL calculate per-item availability as total quantity minus quantities reserved or rented in overlapping periods, including all rental lines of a rental.

#### Scenario: Prevent overbooking for any rental line during create or update
- **WHEN** a user creates or updates a rental with one or more lines and any line exceeds available stock for its item in the selected period
- **THEN** the system MUST reject the rental change with a stock conflict error

#### Scenario: Overbooking is rejected before persistence
- **WHEN** a rental create or update request would exceed available stock
- **THEN** the system MUST reject the request and MUST NOT persist an overbooked rental state
