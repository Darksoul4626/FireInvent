## MODIFIED Requirements

### Requirement: Availability shall be derived from stock and overlapping rentals
The system SHALL calculate per-item availability as total quantity minus quantities reserved or rented in overlapping periods, including all rental lines of a rental.

#### Scenario: Prevent overbooking for any rental line
- **WHEN** a user creates or updates a rental with one or more lines and any line exceeds available stock for its item in the selected period
- **THEN** the system MUST reject the rental change with a stock conflict error

#### Scenario: Recalculate after lifecycle transition with returned/completed
- **WHEN** a rental status changes to `Returned`, `Completed`, or `Canceled`
- **THEN** the system MUST recalculate affected item availability immediately according to status rules
