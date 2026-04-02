## Why

Der aktuelle Stack ist auf lokale Entwicklung mit Port-Mappings optimiert und nicht als dedizierte Coolify-Deployment-Definition dokumentiert. Fuer stabile, reproduzierbare Deployments in Coolify wird eine separate, platform-kompatible Compose-Datei benoetigt.

## What Changes

- Add a dedicated Compose file for Coolify deployments that keeps frontend, backend, and database services separated while aligning with Coolify expectations.
- Define Coolify-compatible service wiring (internal service DNS, persistent volumes, health checks, restart behavior, and required environment variables).
- Keep the existing root `docker-compose.yml` focused on local development and avoid breaking current dev workflows.
- Document intended operator usage and boundary between local compose and Coolify compose.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `containerized-deployment-orchestration`: Extend orchestration requirements with a Coolify-valid compose variant for production-style hosting.

## Impact

- Affected code and assets:
  - New Coolify-specific compose file at repository root (name finalized in design/tasks).
  - Documentation updates for deployment workflow separation (local vs Coolify).
- Affected systems:
  - Coolify-managed Docker deployment environment.
  - Existing Docker Compose local development workflow (must remain compatible).
- Non-goals:
  - No migration to Kubernetes, Helm, or alternative orchestration tooling.
  - No backend/frontend feature changes unrelated to deployment topology.
- Risks:
  - Misconfigured environment variable defaults can cause failed startup in Coolify.
  - Incorrect network assumptions may break inter-service communication.
- Rollout impact:
  - Additive change with low migration risk; local compose remains primary for developers while operators can adopt the Coolify compose path incrementally.
