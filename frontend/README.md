# Frontend (Next.JS)

Task 1.3 liefert die Basis-Dependencies fuer:

- Routing: Next.JS App Router (`src/app`)
- Data Fetching: `@tanstack/react-query` + `axios`
- Forms: `react-hook-form` + `zod`
- Kalenderdarstellung: `@fullcalendar/react` + DayGrid/TimeGrid/Interaction

Generierter API-Client wird unter `src/lib/api/generated/` erwartet.

## OpenAPI Client-Generierung (Task 1.5)

Tooling:

- Generator: `openapi-typescript-codegen`
- HTTP-Client im generierten Code: `axios`
- Output-Verzeichnis: `src/lib/api/generated/`

Generierung aus lokal laufendem Backend:

- `npm run generate:api-client`

Alternative OpenAPI-Quelle (z. B. Datei oder andere URL):

- Bash: `OPENAPI_SPEC_URL=http://localhost:5153/openapi/v1.json npm run generate:api-client`
- PowerShell: `$env:OPENAPI_SPEC_URL='http://localhost:5153/openapi/v1.json'; npm run generate:api-client`

Konventionen:

- Verzeichnis `src/lib/api/generated/` nicht manuell bearbeiten.
- API-Aenderungen im Backend erfordern Client-Regenerierung vor Frontend-Implementierung.

## Contract-Sync-Check (Task 5.6)

Das Frontend enthaelt einen automatischen Check, der den API-Client gegen die aktuelle OpenAPI-Datei prueft.

Voraussetzung:

- `backend/openapi/openapi.v1.json` ist vorhanden und aktuell (z. B. nach Export im Backend).

Ausfuehrung:

- `npm run check:api-contract-sync`

Was der Check macht:

1. Generiert den Client mit `scripts/generate-api-client.mjs` neu.
2. Vergleicht das generierte Ergebnis unter `src/lib/api/generated/` via Git-Diff.
3. Schlaegt fehl, wenn ungecommitte Drift im generierten Client erkannt wird.

Typischer Ablauf bei API-Aenderungen:

1. OpenAPI-Datei im Backend aktualisieren/exportieren.
2. `npm run generate:api-client` ausfuehren.
3. Generierte Aenderungen committen.
4. Optional lokal mit `npm run check:api-contract-sync` gegenpruefen.
