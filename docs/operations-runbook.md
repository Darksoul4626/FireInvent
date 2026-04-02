# Operations Runbook

## Scope

Runbook fuer lokale Entwicklung, containerisierte Deployments und Stoerfallbehandlung von Frontend, Backend und Datenbank.

## Service Topology

- Frontend: Next.js, Port `3000`
- Backend: ASP.NET Core, Port `5153` extern (`8080` im Container)
- Database: PostgreSQL, Port `5432`

Compose-Dateien:

- Lokal: `docker-compose.yml`
- Coolify: `docker-compose.coolify.yml`

## Local Startup (Containerized)

1. `docker compose up --build -d`
2. Health pruefen: `docker compose ps`
3. Frontend erreichbar: `http://localhost:3000`
4. Backend OpenAPI erreichbar: `http://localhost:5153/openapi/v1.json`

Logs:

- Gesamt: `docker compose logs -f`
- Einzelservice: `docker compose logs -f backend` (oder `frontend`/`db`)

Stoppen:

- `docker compose down`

Kompletter Reset inkl. Daten:

- `docker compose down -v`

## Coolify Deployment Checks

Vor Deployment:

1. `docker compose -f docker-compose.coolify.yml config`
2. Pflichtvariablen sicherstellen: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
3. Optionale Variablen pruefen: `ASPNETCORE_ENVIRONMENT`, `FIREINVENT_SEED_MODE`, `NEXT_PUBLIC_API_BASE_URL`

Nach Deployment:

1. Frontend-Route antwortet ueber Coolify-Domain
2. Backend-Healthcheck wird gruener Zustand
3. Datenbank ist `service_healthy`

## Troubleshooting Playbook

### Backend unhealthy

Diagnostik:

1. `docker compose logs --tail=200 backend`
2. `docker compose exec backend printenv | grep ConnectionStrings__DefaultConnection`
3. `curl -f http://localhost:5153/openapi/v1.json`

Typische Ursachen:

- Falscher DB-Connection-String
- DB noch nicht healthy
- Fehlerhafte App-Konfiguration

Recovery:

1. Konfiguration korrigieren
2. `docker compose up -d backend`
3. Health erneut pruefen

Rollback trigger:

- Backend bleibt >10 Minuten unhealthy trotz Konfigurationsfix

Rollback action:

- Letzte stabile Revision in Deployment-Umgebung erneut ausrollen

Kommunikation:

- Incident-Owner informiert Team ueber Ursache, Auswirkung, ETA und Rollback-Entscheid

### Frontend unhealthy

Diagnostik:

1. `docker compose logs --tail=200 frontend`
2. `docker compose exec frontend printenv | grep NEXT_PUBLIC_API_BASE_URL`
3. Browser/Probe auf `http://localhost:3000`

Typische Ursachen:

- Fehlerhafte Build-Artefakte
- Ungueltige API-Base-URL
- Unerreichbarer Backend-Service

Recovery:

1. Variable korrigieren
2. Frontend neu deployen/starten
3. End-to-end Aufruf pruefen

Rollback trigger:

- Frontend bleibt nicht erreichbar oder liefert kritische Laufzeitfehler nach Redeploy

Rollback action:

- Vorheriges Frontend-Image/Revision aktivieren

Kommunikation:

- Rollback und Nutzerimpact in Deployment-Channel dokumentieren

### Database unhealthy

Diagnostik:

1. `docker compose logs --tail=200 db`
2. `docker compose exec db pg_isready -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-fireinvent}`
3. Volume- und Ressourcenstatus pruefen

Typische Ursachen:

- Ungueltige Credentials
- Korruptes oder volles Volume
- Startunterbrechung durch Host-Ressourcenmangel

Recovery:

1. Credentials und Runtime-Parameter korrigieren
2. DB-Service neu starten
3. Bei irreparabler lokaler Umgebung: `docker compose down -v` und sauber neu initialisieren

Rollback trigger:

- Datenbankinstanz startet weiterhin nicht oder Datenintegritaet ist unklar

Rollback action:

- In produktionsnahen Umgebungen auf letzte validierte DB-Sicherung zurueckgehen

Kommunikation:

- Incident-Owner, Tech Lead und betroffene Stakeholder ueber Datenrisiko und Wiederherstellungsstrategie informieren

## Release Readiness Signals

Ein Deployment gilt erst als stabil, wenn:

1. Alle Services healthy sind
2. Kernpfade (Inventory, Rentals, Calendar) antworten
3. API OpenAPI Endpoint erreichbar ist
4. Keine kritischen Fehler in den letzten Logs auftreten