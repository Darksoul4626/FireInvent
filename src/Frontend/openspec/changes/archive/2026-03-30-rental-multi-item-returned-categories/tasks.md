## 1. Domain and Data Model

- [x] 1.1 Introduce rental header and rental line model to support one-or-many items per rental
- [x] 1.2 Add `borrowerName` field to rental domain and persistence model
- [x] 1.3 Extend rental status model with technical status `Returned` while keeping `Completed`
- [x] 1.4 Introduce category entity and reference category from inventory items via identifier
- [x] 1.5 Create and apply migrations for rental restructuring and category normalization

Done criteria:
- Existing rental and inventory data is migrated deterministically
- At least one line per rental is enforced at validation and persistence levels
- Category references are consistent and non-null for inventory items

## 2. Backend API and Rules

- [x] 2.1 Refactor rental contracts/endpoints to accept and return rental lines plus borrower field
- [x] 2.2 Implement full rental edit behavior (lines, dates, borrower, status)
- [x] 2.3 Implement lifecycle transition validation including `Returned` and `Completed`
- [x] 2.4 Adapt stock conflict checks to aggregate by rental lines over overlapping periods
- [x] 2.5 Add category management endpoints including delete-with-usage-check behavior

Done criteria:
- API exposes consistent problem details for transition, stock, and category delete conflicts
- Inventory create/update uses category identifier instead of free-text category
- OpenAPI document reflects all new/changed contracts

## 3. Frontend Workflows

- [x] 3.1 Update rental create/edit forms to manage dynamic item lines with min one line
- [x] 3.2 Add borrower input and status handling for returned/completed lifecycle
- [x] 3.3 Update rental list and calendar status presentation to include returned/completed distinctions
- [x] 3.4 Replace inventory category free-text input with category combo box
- [x] 3.5 Add category management page for create/edit/delete workflows with usage conflict feedback
- [x] 3.6 Update start page cards so CTA links appear as buttons while cards stay non-clickable

Done criteria:
- Rental edit can change all allowed fields without UI dead ends
- Category delete conflict is understandable and recoverable in UI
- Start page module links are visually button-like and keyboard accessible

## 4. Tests and Contract Sync

- [x] 4.1 Update backend unit tests for rental line aggregation, lifecycle transitions, and category delete guard
- [x] 4.2 Update frontend unit tests for dynamic rental lines, borrower field, status mapping, and category combo behavior
- [x] 4.3 Update Playwright flow to cover multi-item rental and returned/completed progression
- [x] 4.4 Regenerate frontend OpenAPI client and run contract sync checks
- [x] 4.5 Run backend tests, frontend tests, e2e smoke, and build validation

Done criteria:
- Test suites pass with stable selectors and no contract drift
- Generated client and backend OpenAPI are synchronized
