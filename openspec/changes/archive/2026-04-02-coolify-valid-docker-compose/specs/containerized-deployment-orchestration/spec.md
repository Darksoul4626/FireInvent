## ADDED Requirements

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
