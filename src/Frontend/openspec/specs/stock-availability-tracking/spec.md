## ADDED Requirements

### Requirement: Availability shall be derived from stock and overlapping rentals
The system SHALL calculate per-item availability as total quantity minus quantity currently reserved or rented in overlapping booking periods.

#### Scenario: Show current availability for an item
- **WHEN** a user opens an item detail view
- **THEN** the system MUST show total quantity, currently rented quantity, and currently available quantity

#### Scenario: Prevent overbooking
- **WHEN** a user attempts to create or update a booking whose quantity exceeds available stock in the selected period
- **THEN** the system MUST reject the booking with a stock conflict error

#### Scenario: Recalculate after booking change
- **WHEN** a booking is canceled, completed, or quantity-adjusted
- **THEN** the system MUST recalculate and expose updated availability immediately

### Requirement: Stock availability cues shall be clearly readable in all themes
The system SHALL present availability-related statuses and quantities with sufficient visual clarity in both light and dark mode.

#### Scenario: Availability values in dark mode
- **WHEN** a user views stock values in dark mode
- **THEN** total, rented, available, and warning-like cues MUST remain readable and clearly differentiated

#### Scenario: Availability values in light mode
- **WHEN** a user views stock values in light mode
- **THEN** total, rented, available, and warning-like cues MUST remain readable and clearly differentiated