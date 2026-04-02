## 1. Documentation Inventory and Target Structure

- [x] 1.1 Audit existing documentation files (root, backend, frontend, shared) and map them to target areas: project overview, setup, API workflow, operations, contribution.
- [x] 1.2 Define authoritative entry points and cross-link strategy to eliminate duplicated startup or workflow instructions.
- [x] 1.3 Create an ownership matrix that assigns responsible maintainers for each documentation area.

## 2. Unified Entry Points and Core Guides

- [x] 2.1 Update root documentation to serve as the single primary entry point with direct links to backend, frontend, API contract, deployment, and troubleshooting guides.
- [x] 2.2 Align `backend/README.md` and `frontend/README.md` with the shared navigation model and remove conflicting duplicate instructions.
- [x] 2.3 Add or update a contributor workflow guide covering OpenSpec change flow, coding/testing expectations, and documentation update responsibilities.

## 3. API-First and Operational Runbooks

- [x] 3.1 Document the normative API-first workflow: OpenAPI update/export, frontend client generation, and contract sync verification order.
- [x] 3.2 Expand deployment and operations runbooks for local startup, containerized deployment checks, and service health diagnostics.
- [x] 3.3 Add explicit recovery procedures with rollback triggers and communication expectations for backend, frontend, and database incidents.

## 4. Documentation Governance and Quality Gates

- [x] 4.1 Introduce a lightweight documentation Definition of Done checklist for all changes that affect developer or operator workflows.
- [x] 4.2 Define review criteria for documentation freshness, including required updates or explicit non-impact justification.
- [x] 4.3 Ensure each documentation area references one authoritative source for repeated guidance patterns.

## 5. Validation and Release Readiness

- [x] 5.1 Verify that all new and updated documentation links resolve and navigation paths are complete.
- [x] 5.2 Run backend validation (`dotnet test`) to confirm no collateral regressions during documentation workflow updates.
- [x] 5.3 Run frontend validation (`npm run test:unit` and `npm run build`) to confirm documentation-related script/process guidance remains accurate.
- [x] 5.4 Run API contract sync validation (`npm run check:api-contract-sync`) and confirm documented API-first steps match actual tooling behavior.