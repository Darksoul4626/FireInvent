## 1. Coolify Compose Manifest

- [x] 1.1 Add a dedicated Coolify compose file (for example `docker-compose.coolify.yml`) with frontend, backend, and db services.
- [x] 1.2 Configure Coolify-compatible service communication, startup dependencies, and health checks without introducing custom user-defined networks.
- [x] 1.3 Define persistent named volume mappings for database data and mark critical runtime environment values as required for deployment.

## 2. Deployment Documentation

- [x] 2.1 Update deployment docs to clearly separate local development compose usage from Coolify deployment compose usage.
- [x] 2.2 Document required Coolify environment variables and expected service endpoints for frontend-to-backend and backend-to-db communication.
- [x] 2.3 Add rollback notes describing how to revert Coolify to the previous deployment configuration without affecting local compose workflows.

## 3. Validation and Regression Checks

- [x] 3.1 Validate the new Coolify compose manifest with `docker compose -f <coolify-compose-file> config` and resolve any schema issues.
- [x] 3.2 Validate the existing local compose manifest with `docker compose -f docker-compose.yml config` to ensure no regressions in developer workflows.
- [x] 3.3 Run backend build (`dotnet build backend/src/FireInvent.Api/FireInvent.Api.csproj`) after compose/documentation updates to confirm no incidental breakage.
- [x] 3.4 Run frontend quality checks relevant to the repository standard (for example configured build/test command) and confirm no contract-sync impact.
