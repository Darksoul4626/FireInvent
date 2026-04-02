## Purpose
Define how stock availability is computed, validated, and presented for rental operations.
## Requirements
### Requirement: Availability shall be derived from stock and overlapping rentals
The system SHALL calculate per-item availability as total quantity minus quantities reserved or rented in overlapping periods, including all rental lines of a rental, and SHALL expose query-consistent availability values for inventory overview responses.

#### Scenario: Prevent overbooking for any rental line during create or update
- **WHEN** a user creates or updates a rental with one or more lines and any line exceeds available stock for its item in the selected period
- **THEN** the system MUST reject the rental change with a stock conflict error

#### Scenario: Overbooking is rejected before persistence
- **WHEN** a rental create or update request would exceed available stock
- **THEN** the system MUST reject the request and MUST NOT persist an overbooked rental state

#### Scenario: Recalculate after lifecycle transition with returned/completed
- **WHEN** a rental status changes to `Returned`, `Completed`, or `Canceled`
- **THEN** the system MUST recalculate affected item availability immediately according to status rules

#### Scenario: Inventory overview exposes rented and available values from backend
- **WHEN** the inventory overview is requested for a specific query context
- **THEN** the backend MUST return `rented` and `available` values per item that are consistent with stock and overlapping planned or active rentals for that context

#### Scenario: Availability supports pre-submit rental form checks for selected periods
- **WHEN** a client requests item availability for a specified rental period during form input
- **THEN** the backend MUST return period-consistent availability values suitable for pre-submit validation decisions

### Requirement: Stock availability cues shall be clearly readable in all themes
The system SHALL present availability-related statuses and quantities with sufficient visual clarity in both light and dark mode.

#### Scenario: Availability values in dark mode
- **WHEN** a user views stock values in dark mode
- **THEN** total, rented, available, and warning-like cues MUST remain readable and clearly differentiated

#### Scenario: Availability values in light mode
- **WHEN** a user views stock values in light mode
- **THEN** total, rented, available, and warning-like cues MUST remain readable and clearly differentiated

