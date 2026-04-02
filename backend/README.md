# Backend (.NET 10)

Autoritative Backend-Dokumentation fuer lokale Entwicklung und API-Contract-Pflege.

## Documentation Navigation

- Zentraler Projekteinstieg: [../README.md](../README.md)
- API-first Vertragsprozess: [../shared/api-contract.md](../shared/api-contract.md)
- Deployment und Recovery: [../docs/operations-runbook.md](../docs/operations-runbook.md)
- Contribution und DoD-Regeln: [../docs/contributing.md](../docs/contributing.md)

## Stack

- ASP.NET Core Web API
- Entity Framework Core (Npgsql)
- FluentValidation
- Swagger/OpenAPI

Projektdatei:

- `src/FireInvent.Api/FireInvent.Api.csproj`

## Local Setup

Konfiguration:

- `src/FireInvent.Api/appsettings.json`
- `src/FireInvent.Api/appsettings.Development.json`
- `ConnectionStrings:DefaultConnection`

User Secrets (empfohlen):

1. `cd src/FireInvent.Api`
2. `dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=fireinvent_dev;Username=postgres;Password=<dein-passwort>"`

Start:

1. `cd ..`
2. `dotnet run --project src/FireInvent.Api/FireInvent.Api.csproj`

## Optional Seed Mode

`FIREINVENT_SEED_MODE`:

- `none` (default): kein Seeding
- `if-empty`: Seed nur bei leerer Datenbank
- `reset`: lokale Daten loeschen und neu seeden

Beispiele:

- `FIREINVENT_SEED_MODE=if-empty dotnet run --project src/FireInvent.Api/FireInvent.Api.csproj`
- `FIREINVENT_DB_PROVIDER=inmemory FIREINVENT_SEED_MODE=reset FIREINVENT_DISABLE_HTTPS_REDIRECTION=true dotnet run --project src/FireInvent.Api/FireInvent.Api.csproj`

## OpenAPI Export

Die normative API-first Reihenfolge steht in [../shared/api-contract.md](../shared/api-contract.md).

Lokaler Export:

1. `cd ..`
2. `./scripts/export-openapi.sh`

Output:

- `openapi/openapi.v1.json`
- `openapi/export-openapi.log`

## Backend Validation

- Volltestlauf: `dotnet test`
- Fokus auf Seed-Pilotfall: `dotnet test tests/FireInvent.Api.Tests/FireInvent.Api.Tests.csproj --filter "SeedDataPilotValidationTests"`

Fuer containerisierte Betriebsdiagnostik und Rollback-Signale siehe [../docs/operations-runbook.md](../docs/operations-runbook.md).
