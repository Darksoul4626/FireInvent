# FireInvent

Webbasierte Inventarisierungs- und Vermietungsloesung.

## Struktur

- `frontend/`: Next.JS fuer Inventar-, Vermietungs- und Kalenderansichten
- `backend/`: .NET 10 mit Swagger / OpenAPI Spec & Entity Framework 
- `shared/`: API-Kontrakte und geteilte Typen
- `openspec/`: Anforderungen, Design und Tasks

### Zielstruktur (Task 1.1)

```text
frontend/
  src/
    app/
      inventory/
      rentals/
      calendar/
    components/
    lib/
      api/
        generated/
backend/
  src/
    FireInvent.Api/
      Controllers/
      Contracts/
      Domain/
      Infrastructure/
  tests/
shared/
  api-contract.md
```

Konventionen:
- API-first: Backend publiziert OpenAPI als Vertragsquelle.
- Frontend nutzt nur generierte API-Clients aus `frontend/src/lib/api/generated/`.
- JSON-Feldnamen bleiben uebergreifend in camelCase.
- Breaking API-Aenderungen erfordern OpenAPI-Update und Client-Regenerierung.

## API-Konventionen

- Ressourcenorientierte Endpunkte unter `/api`
- JSON Payloads mit camelCase
- Fehlerformat:
  - `code`: maschinenlesbarer Fehlercode
  - `message`: lesbare Fehlermeldung
  - `details`: optionale Validierungsdetails
- OpenAPI dient als Single Source of Truth fuer Request-/Response-Vertraege
- Frontend-Client wird aus OpenAPI generiert, nicht manuell gepflegt

## Lokaler Start

1. Backend-Konfiguration in `appsettings.Development.json` und/oder User Secrets setzen.
2. In `backend/` NuGet-Pakete wiederherstellen und Entity-Framework-Migrationen ausfuehren.
3. In `frontend/` Abhaengigkeiten installieren und Next.js Dev-Server starten.

## Docker Compose Workflows (Task 6.6)

Der Full-Stack kann containerisiert mit Frontend, Backend und PostgreSQL gestartet werden.

Voraussetzung:

- Docker Engine mit Compose v2

Start (Build + Run):

1. `docker compose up --build -d`
2. Frontend: `http://localhost:3000`
3. Backend: `http://localhost:5153`

Logs anzeigen:

- `docker compose logs -f`

Stoppen (Container bleiben erhalten):

- `docker compose down`

Reset (Container + Datenbank-Volume entfernen):

- `docker compose down -v`

Optionale Umgebungsvariablen (mit Defaults aus `docker-compose.yml`):

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `ASPNETCORE_ENVIRONMENT`
- `FIREINVENT_SEED_MODE`
- `NEXT_PUBLIC_API_BASE_URL`
