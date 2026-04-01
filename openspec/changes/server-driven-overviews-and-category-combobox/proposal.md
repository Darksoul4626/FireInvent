## Why

Die aktuellen Inventory- und Rental-Overviews laden komplette Datenmengen und verarbeiten sie anschließend stark im Frontend. Das wird bei wachsender Datenmenge langsamer, erschwert mobile Nutzung und verhindert konsistente serverseitige Query- und Cache-Strategien fuer Filter und Paging.

## What Changes

- Fuehre servergetriebene Overview-Queries fuer Inventar und Vermietungen ein (Paging und Filter; Default `pageSize=20`).
- Verlagere die Inventory-Overview-Projektion fuer `rented` und `available` in das Backend, damit die Anzeige je Seite konsistent und skalierbar bleibt.
- Stelle Frontend-Tabellen auf URL-getriebenen Query-State um; bei Filter- und Paging-Aenderungen werden Daten neu vom Backend geladen, die Sortierung bleibt lokal in der Tabelle.
- Schraenke die Anlage von Vermietungen auf Starttage `>= heute` ein (gleiches Regelwerk fuer relevante Bearbeitungsfaelle), wobei "heute" als Betriebstag in der Zeitzone `Europe/Berlin` definiert ist.
- Fuehre UI-seitige Pre-Validation fuer Vermietungen ein: Bei Zeitraum- oder Positionsaenderung werden verfuegbare Bestaende sofort aktualisiert und konfliktbehaftete Eingaben vor dem Speichern blockiert.
- Ergaenze selektives Backend-Caching fuer read-heavy Lookup-Daten (insbesondere Kategorien), inklusive Invalidation bei schreibenden Operationen.
- Ersetze das Kategorie-`select` im Gegenstand-Formular durch eine erstellbare Combobox mit Inline-Kategorieanlage.

Non-goals:

- Keine Aenderung der fachlichen Rental-Lifecycle-Statuslogik.
- Kein Austausch von FullCalendar.
- Keine AuthN/AuthZ-Umstellung.
- Kein Wechsel auf verteiltes Cache-System in diesem Schritt.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `inventory-catalog-management`: Inventory-Overview nutzt serverseitiges Paging/Filterung mit backendseitiger Datenprojektion; Sortierung erfolgt lokal in der Tabelle.
- `rental-booking-management`: Rental-Overview nutzt serverseitiges Paging/Filterung mit lokaler Tabellensortierung; Vermietungsanlage und relevante Bearbeitung beachten Starttage `>= heute` mit UI-seitiger Pre-Validation.
- `inventory-category-management`: Gegenstand-Anlage unterstuetzt eine erstellbare Kategorie-Combobox mit Inline-Kategorieanlage.
- `stock-availability-tracking`: Verfuegbarkeitswerte in der Inventory-Overview werden backendseitig und query-konsistent bereitgestellt; Verfuegbarkeit wird im Vermietungsformular bei Eingabeaenderungen live aktualisiert.

## Impact

- Affected code:
  - Backend Controller/Service/Repository fuer Inventory- und Rental-Overview-Queries.
  - Backend Validierung fuer Vermietungsdatum (`StartDate >= heute`) bei Anlage und relevanten Bearbeitungsfaellen.
  - Backend Caching-Integration und Invalidation-Hooks in Category-Schreibpfaden.
  - Frontend Tabellen- und Query-State-Handling fuer serverseitiges Refetching.
  - Frontend Vermietungsformular fuer Live-Verfuegbarkeitsanzeige, Pre-Validation und Save-Blocking bei Konflikten.
  - Frontend Inventory-Form-Komponente fuer Combobox-UX.
- APIs/dependencies:
  - OpenAPI-Contract erweitert (neue Query-Parameter und paginierte Responses fuer Overviews).
  - Frontend OpenAPI-Client-Regeneration erforderlich.
- Test impact:
  - Neue/angepasste Backend-Tests fuer Paging, Filter, Datumsregeln und Cache-Invalidation.
  - Neue/angepasste Frontend Unit- und e2e-Tests fuer URL-Query-State, Refetch-Verhalten, lokale Sortierung ohne Refetch, Live-Verfuegbarkeits-Feedback, Save-Blocking und Combobox-Flows.
- Rollout and risks:
  - Moderate API- und UI-Aenderung mit hohem operativem Nutzen bei groesseren Datenmengen.
  - Risiko fuer Performance-Regressions bei unguenstigen Query-Plans; wird durch Filter-Validierung und Index-Review adressiert.
  - Risiko fuer stale Cache-Daten; wird durch kurze TTL und gezielte Invalidation reduziert.
