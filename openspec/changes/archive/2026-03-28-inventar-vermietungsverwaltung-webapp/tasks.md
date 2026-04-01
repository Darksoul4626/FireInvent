## 1. Foundation and Project Setup

- [x] 1.1 Define Next.JS frontend and .NET 10 backend project structure with shared API contract conventions
- [x] 1.2 Add backend dependencies for ASP.NET Core, Entity Framework Core, validation, Swagger/OpenAPI, and migrations
- [x] 1.3 Add frontend dependencies for Next.JS routing, data fetching, forms, and calendar rendering
- [x] 1.4 Configure local .NET settings (appsettings/User Secrets) and database connection
- [x] 1.5 Set up OpenAPI client generation tooling and define generated client output conventions for the frontend

## 2. Database and Backend Core

- [x] 2.1 Design and implement relational schema for inventory items, rentals, and statuses
- [x] 2.2 Create and apply initial Entity Framework migration with referential integrity constraints
- [x] 2.3 Implement .NET 10 inventory item CRUD endpoints with required field validation via service and repository layers (no direct DbContext in controllers)
- [x] 2.4 Implement .NET 10 rental booking CRUD/lifecycle endpoints (create, update, cancel, complete)
- [x] 2.5 Implement server-side availability calculation endpoint for item and date range
- [x] 2.6 Add conflict detection to prevent overbooking in overlapping rental periods
- [x] 2.7 Expose and verify Swagger/OpenAPI documentation for all inventory, rental, and availability endpoints
- [x] 2.8 Add automated OpenAPI spec export/availability step for local development and CI

## 3. Frontend Inventory and Rental Workflows

- [x] 3.1 Implement Next.JS inventory list and detail views with total, rented, and available quantities
- [x] 3.2 Implement Next.JS inventory create/edit forms with client-side validation and API integration
- [x] 3.3 Implement Next.JS rental create/edit/cancel/complete workflows with backend integration
- [x] 3.4 Surface booking conflicts and validation errors clearly in the UI
- [x] 3.5 Replace manual API calls with generated OpenAPI client usage in inventory, rental, and availability features

## 4. Calendar Visualization and Filtering

- [x] 4.1 Implement calendar view showing planned and active rentals across selected periods
- [x] 4.2 Add item-based filtering in the calendar and synchronize with current inventory selection
- [x] 4.3 Implement conflict highlighting in calendar entries for overbooked periods
- [x] 4.4 Add alternate list/table fallback view for dense calendar data

## 5. Quality, Security, and Delivery

- [x] 5.1 Add .NET backend tests for inventory CRUD, rental lifecycle, availability logic, and conflict detection
- [x] 5.2 Add Next.JS frontend unit tests with Vitest for inventory forms, rental flows, stock display, and calendar filters
- [x] 5.3 Add Playwright end-to-end tests for item create -> rent -> return -> availability update
- [x] 5.4 Add API request validation and error mapping
- [x] 5.5 Prepare seed data and run pilot validation with representative inventory and rental scenarios
- [x] 5.6 Add contract checks to ensure generated OpenAPI client stays in sync with backend API specification
- [x] 5.7 Define and implement authorization hooks for future roles

Hinweis zu 5.7: Die konkrete Autorisierungsimplementierung wird bewusst in einem separaten Folge-Change umgesetzt.

## 6. Containerization and Orchestration

- [x] 6.1 Create Dockerfile for frontend (Next.JS) with production-ready runtime configuration
- [x] 6.2 Create Dockerfile for backend (.NET 10 API) with multi-stage build
- [x] 6.3 Define containerized PostgreSQL setup with persistent volume and required environment variables  
- [x] 6.4 Create docker-compose configuration that orchestrates frontend, backend, and database containers 
- [x] 6.5 Add healthchecks and startup dependency rules in docker-compose to ensure reliable boot order    
- [x] 6.6 Document compose-based local start, stop, and reset workflows for the full stack
