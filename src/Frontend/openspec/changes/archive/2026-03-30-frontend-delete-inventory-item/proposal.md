## Why

Derzeit kann ein Inventargegenstand im Frontend nicht geloescht werden, obwohl das Backend bereits eine Loesch-API mit Konfliktschutz bereitstellt. Das fuehrt zu Medienbruechen und verhindert eine vollstaendige Stammdatenpflege direkt in der Webanwendung.

## What Changes

- Fuehre einen Frontend-Loeschworkflow fuer Inventargegenstaende ein (aus Liste und Detailansicht erreichbar).
- Ergaenze eine explizite Bestaetigung vor dem Loeschen, um versehentliche Datenverluste zu vermeiden.
- Erweitere den Next.js-Proxy fuer `DELETE /api/proxy/items/{id}` auf Basis des bestehenden OpenAPI-Clients.
- Stelle konfliktfaehige Fehlermeldungen im UI dar (z. B. wenn ein Gegenstand Vermietungshistorie hat und nicht geloescht werden darf).
- Ergaenze/aktualisiere Unit- und E2E-Tests fuer den neuen Loeschfluss.

## Capabilities

### New Capabilities
- none: Keine neue Capability; der Change erweitert bestehende Inventarverwaltung.

### Modified Capabilities
- `inventory-catalog-management`: Frontend muss Inventargegenstaende loeschen koennen, inklusive Bestaetigung, Erfolgspfad und Konfliktfeedback.

## Impact

- Affected code:
  - Frontend-Inventarseiten (Liste/Detail) und ggf. gemeinsame Aktionskomponenten.
  - Next.js-Proxyroute fuer Item by Id.
  - Frontend-Tests (Vitest/Playwright) fuer Loeschfluss.
- APIs:
  - Nutzung des bestehenden Backend-Endpoints `DELETE /api/items/{id}` ueber Frontend-Proxy.
- Dependencies:
  - Keine neuen Laufzeitabhaengigkeiten erforderlich; vorhandene UI-Komponenten fuer Dialog/Buttons koennen wiederverwendet werden.
- Systems:
  - Keine Datenmigration erforderlich.

## Non-Goals

- Keine Aenderung der Backend-Loeschregeln oder Fehlercodes.
- Keine Einfuehrung von Soft-Delete oder Archivierungslogik.
- Keine Aenderung an Kategorie-Loeschworkflows.

## Risks

- Unklare oder zu technische Konfliktmeldungen koennen im Einsatz zu Bedienabbruechen fuehren.
- Fehlende Bestaetigung im falschen Kontext kann versehentliches Loeschen beguenstigen.
- Regressionen in responsiven Inventory-Layouts, falls Aktionen auf Mobil/Desktop unterschiedlich eingebunden werden.

## Rollout

- Rollout in einer Frontend-Welle mit Testabsicherung:
  - Proxy-Route und UI-Aktionen implementieren.
  - Konflikt-/Erfolgsfeedback absichern.
  - Vitest + Playwright + Build laufen lassen als Freigabekriterium.
