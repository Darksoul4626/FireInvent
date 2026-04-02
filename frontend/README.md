# Frontend (Next.js)

Autoritative Frontend-Dokumentation fuer lokale Entwicklung, Tests und OpenAPI-Client-Nutzung.

## Documentation Navigation

- Zentraler Projekteinstieg: [../README.md](../README.md)
- API-first Vertragsprozess: [../shared/api-contract.md](../shared/api-contract.md)
- Deployment und Recovery: [../docs/operations-runbook.md](../docs/operations-runbook.md)
- Contribution und DoD-Regeln: [../docs/contributing.md](../docs/contributing.md)

## Stack

- Next.js App Router (`src/app`)
- React 19
- React Query + Axios
- React Hook Form + Zod
- FullCalendar

## Local Setup

1. `npm install`
2. `npm run dev`
3. App unter `http://localhost:3000` aufrufen

Falls notwendig API-Basis setzen:

- Bash: `NEXT_PUBLIC_API_BASE_URL=http://localhost:5153 npm run dev`
- PowerShell: `$env:NEXT_PUBLIC_API_BASE_URL='http://localhost:5153'; npm run dev`

## API Client Generation

Normativer Gesamtprozess steht in [../shared/api-contract.md](../shared/api-contract.md).

- Standard: `npm run generate:api-client`
- Alternative OpenAPI-Quelle:
	- Bash: `OPENAPI_SPEC_URL=http://localhost:5153/openapi/v1.json npm run generate:api-client`
	- PowerShell: `$env:OPENAPI_SPEC_URL='http://localhost:5153/openapi/v1.json'; npm run generate:api-client`

Regeln:

- `src/lib/api/generated/` nicht manuell bearbeiten.
- API-Aenderungen werden erst nach Regenerierung und Sync-Check als abgeschlossen betrachtet.

## Validation Commands

- Unit Tests: `npm run test:unit`
- Build: `npm run build`
- Contract Sync: `npm run check:api-contract-sync`

Der Contract-Sync-Check regeneriert den Client und bricht bei Drift gegenueber dem committed Stand ab.

## Troubleshooting Links

- Container-/Service-Stoerungen: [../docs/operations-runbook.md#troubleshooting-playbook](../docs/operations-runbook.md#troubleshooting-playbook)
- API-Contract-Drift: [../shared/api-contract.md#contract-drift-recovery](../shared/api-contract.md#contract-drift-recovery)
