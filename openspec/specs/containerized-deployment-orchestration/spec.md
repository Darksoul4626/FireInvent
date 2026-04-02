## Purpose
Define how frontend, backend, and database are packaged and orchestrated as containers.
## Requirements
### Requirement: Application components shall run in separate containers
The system SHALL provide dedicated container images and runtime configuration for frontend, backend, and database as separate deployable services.

#### Scenario: Build frontend container image
- **WHEN** the frontend container build process is executed
- **THEN** the system MUST produce a runnable Next.JS image for the frontend service

#### Scenario: Build backend container image
- **WHEN** the backend container build process is executed
- **THEN** the system MUST produce a runnable .NET 10 API image for the backend service

#### Scenario: Run database in dedicated container
- **WHEN** the stack is started
- **THEN** the database MUST run in a dedicated PostgreSQL container with persisted storage

### Requirement: Docker Compose shall orchestrate the full stack
The system SHALL provide a Docker Compose configuration that composes frontend, backend, and database services into a runnable multi-container application.

#### Scenario: Start complete stack with compose
- **WHEN** an operator starts the stack via Docker Compose
- **THEN** frontend, backend, and database services MUST be started in one composed environment

#### Scenario: Service dependency and health handling
- **WHEN** dependent services are not yet ready
- **THEN** Docker Compose configuration MUST enforce startup dependencies and health checks to reduce boot-time connection failures

#### Scenario: Document compose workflows
- **WHEN** developers onboard or reset local environments
- **THEN** the project documentation MUST define compose-based start, stop, and reset commands

### Requirement: Coolify deployment compose manifest shall be provided
The system SHALL provide a dedicated Docker Compose manifest for Coolify deployments that is separate from the local development compose manifest.

#### Scenario: Operator selects Coolify-specific manifest
- **WHEN** an operator configures FireInvent deployment in Coolify
- **THEN** a dedicated Coolify compose manifest MUST be available and usable without requiring local-development-only settings

#### Scenario: Local compose remains dedicated to development workflow
- **WHEN** developers start FireInvent using the existing local compose workflow
- **THEN** local startup behavior MUST remain unchanged by introduction of the Coolify manifest

### Requirement: Coolify compose manifest shall be platform-compatible
The Coolify-specific compose manifest MUST align with Coolify runtime expectations for networking, service health, persistence, and configuration validation.

#### Scenario: Coolify-managed networking is preserved
- **WHEN** services are deployed with the Coolify compose manifest
- **THEN** service-to-service communication MUST rely on platform-managed networking without requiring custom user-defined Docker networks

#### Scenario: Critical settings are validated before startup
- **WHEN** required runtime configuration values are missing
- **THEN** deployment MUST fail fast with explicit configuration validation instead of starting services with invalid state

#### Scenario: Data persistence survives redeployments
- **WHEN** the database service is recreated during update or restart
- **THEN** persistent storage MUST retain inventory and rental data across container lifecycle events

