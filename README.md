# FireInvent

Webbasierte Inventarisierungs- und Vermietungsloesung fuer Feuerwehr.

## Primary Documentation Entry Point

Diese Datei ist der zentrale Einstieg. Detaillierte Inhalte liegen in den unten verlinkten, autoritativen Dokumenten.

### Documentation Index

- Projekt und Navigation: [docs/documentation-governance.md](docs/documentation-governance.md)
- Backend Setup und Betrieb: [backend/README.md](backend/README.md)
- Frontend Setup und API-Client-Nutzung: [frontend/README.md](frontend/README.md)
- API-Vertrag und API-first Regeln: [shared/api-contract.md](shared/api-contract.md)
- Deployment, Health Checks und Recovery: [docs/operations-runbook.md](docs/operations-runbook.md)
- Troubleshooting Playbook: [docs/operations-runbook.md#troubleshooting-playbook](docs/operations-runbook.md#troubleshooting-playbook)
- Beitragenden-Workflow (OpenSpec, Tests, Doku-Pflege): [docs/contributing.md](docs/contributing.md)

## Repository Structure

- `frontend/`: Next.js App Router UI und generierter API-Client
- `backend/`: ASP.NET Core API, OpenAPI-Quelle, EF Core
- `shared/`: API-Vertragsdokumentation
- `openspec/`: Changes, Specs, Design und Tasks
- `docs/`: Governance, Beitragendenprozess und Betriebs-Runbooks

## Quick Start

1. Backend nach [backend/README.md](backend/README.md) konfigurieren und starten.
2. Frontend nach [frontend/README.md](frontend/README.md) starten.
3. API-first Workflow fuer Vertragsaenderungen nach [shared/api-contract.md](shared/api-contract.md) ausfuehren.
4. Fuer containerisierten Betrieb und Diagnostik [docs/operations-runbook.md](docs/operations-runbook.md) verwenden.

## Coolify Exposure Model

Fuer Deployments mit [docker-compose.coolify.yml](docker-compose.coolify.yml) ist nur das Frontend oeffentlich erreichbar. Backend und Datenbank bleiben ohne oeffentliche Port- oder Domain-Freigabe ausschliesslich intern erreichbar.

## Authoritative Sources Policy

- Wiederverwendete Anleitungstexte (Setup, API-Workflow, Deployment, Troubleshooting) werden nur an einer Stelle gepflegt.
- Sekundaere Dokumente verlinken auf die autoritative Quelle statt Inhalte zu duplizieren.
- Ownership, Review-Kriterien und Definition of Done stehen in [docs/documentation-governance.md](docs/documentation-governance.md).
