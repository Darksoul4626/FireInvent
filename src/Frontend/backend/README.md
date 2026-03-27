# Backend (.NET 10)

Dieses Backend verwendet:

- ASP.NET Core Web API
- Entity Framework Core (inkl. Design/Tools fuer Migrationen)
- FluentValidation fuer Request-Validierung
- Swagger/OpenAPI fuer API-Dokumentation

Projektpfad:

- `src/FireInvent.Api/FireInvent.Api.csproj`

## Lokale Konfiguration

Standard-Konfiguration liegt in:

- `src/FireInvent.Api/appsettings.json`
- `src/FireInvent.Api/appsettings.Development.json`

Connection-String-Key:

- `ConnectionStrings:DefaultConnection`

User Secrets setzen (empfohlen fuer lokale Passwoerter):

1. `cd src/FireInvent.Api`
2. `dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=fireinvent_dev;Username=postgres;Password=<dein-passwort>"`

Beim Start wird geprueft, ob `DefaultConnection` vorhanden ist.

## Seed-Daten aktivieren (Task 5.5)

Die API kann beim Start optionale Pilot-Seed-Daten laden. Aktivierung erfolgt ueber `FIREINVENT_SEED_MODE`:

- `none` (Standard): kein Seeding
- `if-empty`: seedet nur, wenn die Datenbank leer ist
- `reset`: loescht vorhandene Inventar-/Vermietungsdaten und seedet neu

Beispiele:

1. PostgreSQL mit Seeding nur bei leerer Datenbank:
	`FIREINVENT_SEED_MODE=if-empty dotnet run --project src/FireInvent.Api/FireInvent.Api.csproj`
2. InMemory fuer lokalen Pilot-Check mit frischem Seed:
	`FIREINVENT_DB_PROVIDER=inmemory FIREINVENT_SEED_MODE=reset FIREINVENT_DISABLE_HTTPS_REDIRECTION=true dotnet run --project src/FireInvent.Api/FireInvent.Api.csproj`

Hinweis: `reset` ist nur fuer lokale Test-/Pilotumgebungen gedacht.

## Pilot-Validierung mit repraesentativen Szenarien

Die Pilot-Validierung fuer Seed-Daten wird ueber dedizierte Backend-Tests ausgefuehrt:

1. `cd backend`
2. `dotnet test tests/FireInvent.Api.Tests/FireInvent.Api.Tests.csproj --filter "SeedDataPilotValidationTests"`

## OpenAPI Export (Task 2.8)

Automatisierter Export der OpenAPI-Spezifikation:

1. `cd backend`
2. `chmod +x scripts/export-openapi.sh` (einmalig unter Linux/macOS)
3. `./scripts/export-openapi.sh`

Ergebnis:

- OpenAPI JSON wird nach `openapi/openapi.v1.json` geschrieben.
- Laufzeit-Logs liegen in `openapi/export-openapi.log`.

CI-Integration:

- Workflow: `.github/workflows/openapi-export.yml`
- Der Workflow startet die API, exportiert die OpenAPI-Datei und validiert, dass `openapi/openapi.v1.json` vorhanden ist.
