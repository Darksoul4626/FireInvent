## 1. API Contracts and Query Models

- [x] 1.1 Add paginated response contracts for inventory and rental overviews (items, page, pageSize, totalCount, totalPages, hasPrevious, hasNext).
- [x] 1.2 Add validated query contracts for inventory overview (`page`, `pageSize`, `search`, `category`, `condition`, optional timestamp context).
- [x] 1.3 Add validated query contracts for rental overview (`page`, `pageSize`, `search`, `status`, `itemId`, optional date range).
- [x] 1.4 Expose new overview endpoints in OpenAPI and regenerate frontend API client.

## 2. Backend Inventory Overview

- [x] 2.1 Implement repository query pipeline for inventory overview filtering and paging.
- [x] 2.2 Move `rented` and `available` projection into backend overview response using stock-overlap rules.
- [x] 2.3 Add filter validation and deterministic fallback ordering for stable paging.
- [x] 2.4 Add controller/service wiring for `GET /api/items/overview` following layered architecture.

## 3. Backend Rental Overview

- [x] 3.1 Implement repository query pipeline for rental overview filtering and paging.
- [x] 3.2 Return rental overview projections with item summary and paging metadata.
- [x] 3.3 Add controller/service wiring for `GET /api/rentals/overview` following layered architecture.
- [x] 3.4 Enforce rental start-date boundary (`start day >= today`) in create flow and applicable update flow.
- [x] 3.5 Implement a shared business-day boundary helper using `Europe/Berlin` date semantics for all rental start-date validations.

## 4. Category Input and Caching

- [x] 4.1 Register and configure in-memory cache for read-heavy category lookups.
- [x] 4.2 Implement category cache invalidation on category create, update, and delete operations.
- [x] 4.3 Keep backend duplicate-category conflict handling deterministic for inline creation flows.
- [x] 4.4 Replace inventory item category select with a creatable combobox supporting inline category creation.

## 5. Frontend Server-Driven Tables

- [x] 5.1 Introduce URL-driven query state for inventory overview (paging, filter) with backend refetch.
- [x] 5.2 Introduce URL-driven query state for rental overview (paging, filter) with backend refetch.
- [x] 5.3 Reset page to first page on filter change and cancel superseded requests.
- [x] 5.4 Render paging controls based on backend metadata with default 20 rows.

## 6. Rental Form Pre-Validation UX

- [x] 6.1 Add UI validation for rental date boundary (`start day >= today`) in create and applicable edit flows.
- [x] 6.2 Refresh position availability when rental period changes.
- [x] 6.3 Refresh affected position availability when item/quantity lines change.
- [x] 6.4 Block save while any selected line exceeds available stock and show actionable inline feedback.
- [x] 6.5 Mirror the backend `Europe/Berlin` business-day boundary in the UI date validation flow.

## 7. Verification and Release Readiness

- [x] 7.1 Add backend tests for query validation, overview paging/filter behavior, and availability projection consistency.
- [x] 7.2 Add backend tests for rental start-date boundary in create and applicable update flows.
- [x] 7.3 Add backend tests for category cache invalidation and duplicate name conflict handling.
- [x] 7.4 Add frontend unit tests for URL query synchronization, backend refetch triggers, date-boundary validation, pre-submit availability checks, save-blocking, and combobox behavior.
- [x] 7.5 Update or add e2e flows for overview paging/filtering, rental form pre-validation, and inline category creation.
- [x] 7.6 Run and pass `dotnet test`, frontend unit tests, frontend build, and API contract sync checks.
	- Status: `dotnet test`, `npm run test:unit`, `npm run build`, and `npm run check:api-contract-sync` passed.
