## Purpose
Define backend API, persistence, contract, and validation behavior for inventory and rental domain operations.

## Requirements

### Requirement: Backend API and relational data model shall support inventory and rentals
The system SHALL expose REST endpoints and persist data in a relational model that links inventory items, stock quantities, and rental bookings.

#### Scenario: Persist and retrieve inventory items
- **WHEN** a client creates and then queries an inventory item via API
- **THEN** the system MUST return consistent persisted data from the database

#### Scenario: Persist rental with referential integrity
- **WHEN** a client creates a rental booking for an existing item
- **THEN** the system MUST persist the booking with a valid foreign-key relation to that item

#### Scenario: Reject rental for missing inventory item
- **WHEN** a client submits a rental booking referencing a non-existent item
- **THEN** the system MUST reject the request with a not-found or validation error

#### Scenario: Expose availability endpoint
- **WHEN** a client requests availability for an item and time range
- **THEN** the system MUST return total, reserved/rented, and available quantities for that period

### Requirement: OpenAPI specification shall drive client generation
The system SHALL expose a Swagger/OpenAPI specification that is used to generate the frontend API client for inventory, rental, and availability operations.

#### Scenario: Generate typed client from current API contract
- **WHEN** the frontend client generation process is run against the backend OpenAPI specification
- **THEN** the generated client MUST include typed operations for inventory, rental, and availability endpoints

#### Scenario: Detect contract drift
- **WHEN** backend endpoints change without regenerating the client
- **THEN** the build or validation process MUST fail with a contract/client synchronization error

### Requirement: Backend API shall use service and repository layers
The system SHALL enforce a layered backend architecture where controllers call services and persistence access is encapsulated in repository classes.

#### Scenario: Controller delegates business logic to service layer
- **WHEN** an API request reaches an inventory or rental controller
- **THEN** the controller MUST delegate business operations to a service and MUST NOT contain direct persistence logic

#### Scenario: Persistence is encapsulated by repositories
- **WHEN** business logic needs to read or write inventory or rental data
- **THEN** the service MUST use repository abstractions, and direct DbContext usage in controllers MUST be avoided

### Requirement: API validation and error mapping shall be consistent
The system SHALL validate API requests on the backend and return consistent ProblemDetails-based error payloads for validation, not-found, and conflict responses.

#### Scenario: Reject invalid request with validation problem details
- **WHEN** a client sends invalid payload or query parameters
- **THEN** the API MUST return HTTP 400 with ValidationProblemDetails and a stable error code field

#### Scenario: Return structured domain conflict details
- **WHEN** a request violates domain constraints such as stock conflicts or duplicate inventory codes
- **THEN** the API MUST return HTTP 409 with ProblemDetails containing a stable domain error code

### Requirement: Backend shall support deterministic pilot seed data
The system SHALL provide an optional startup seeding mode for representative inventory and rental scenarios so pilot validation can run reproducibly.

#### Scenario: Seed representative pilot dataset on demand
- **WHEN** startup seeding is enabled with reset mode
- **THEN** the backend MUST create a deterministic inventory and rental dataset including planned, active, canceled, and completed rentals

#### Scenario: Validate pilot scenarios against seeded data
- **WHEN** pilot validation tests are executed
- **THEN** the backend MUST verify expected availability values and overbooking conflict behavior from the seeded dataset


