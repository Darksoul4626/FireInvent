## Why

Das aktuelle Frontend nutzt ueberwiegend Inline-Styles und keine gemeinsame UI-Bibliothek. Dadurch entstehen inkonsistente Bedienmuster, hoher Styling-Aufwand pro Seite und fehlende Grundlagen fuer Dark-/Light-Mode.

Fuer die Feuerwehr wird eine moderne, robuste und responsive Bedienoberflaeche benoetigt, die auch bei hoher Datendichte (Inventar, Vermietungen, Kalender) klar navigierbar bleibt.

## What Changes

- Einfuehrung von shadcn/ui als zentrales UI-Fundament fuer die Frontend-Oberflaeche.
- Aufbau einer einheitlichen App-Shell mit permanenter, einklappbarer Sidenav.
- Ergaenzung einer mobilen Drawer-Navigation, die die Sidenav-Inhalte responsiv uebernimmt.
- Einfuehrung von Dark-Mode und Light-Mode inklusive sichtbarem Theme-Switch.
- Definition eines feuerwehrnahen, markanten aber nicht ueberzeichneten Farbkonzepts.
- Migration zentraler Seiten (Start, Inventar, Vermietungen, Kalender) auf konsistente Komponenten, Abstaende und Typografie.
- Sicherstellung responsiven Verhaltens fuer Desktop, Tablet und Mobile.

## Capabilities

### New Capabilities
- Keine.

### Modified Capabilities
- `inventory-catalog-management`: Konsistentes, responsives UI fuer Inventarlisten und Inventarformulare.
- `rental-booking-management`: Konsistentes, responsives UI fuer Vermietungslisten, Lifecycle-Aktionen und Formulare.
- `rental-calendar-visualization`: Kalender- und Tabellenansicht in einheitlichem Designsystem mit Theme-Unterstuetzung.
- `stock-availability-tracking`: Verfuegbarkeitsanzeigen und Statuskennzeichnungen mit klarer Lesbarkeit in beiden Themes.

## Non-Goals

- Keine Aenderung an fachlicher Backend-Logik, API-Vertraegen oder Datenmodell.
- Kein Rebranding des Produktnamens oder Neuausrichtung der Informationsarchitektur.
- Keine Einfuehrung von Rollen-/Rechtekonzepten in diesem Change.

## Impact

- Affected code:
  - Frontend-App-Shell in `src/app/layout.tsx` und Seitenstruktur unter `src/app/*`.
  - UI-Komponenten unter `src/components/*`.
  - Globale Styling- und Theme-Basis (neu einzufuehrende Theme-/Token-Dateien).
- APIs:
  - Keine API-Vertragsaenderung geplant.
- Dependencies:
  - Hinzufuegen von shadcn/ui-abhängigen Frontend-Paketen.
  - Theme-Handling (Dark/Light) im Frontend.
- Test impact:
  - Unit- und E2E-Tests muessen auf stabile `data-testid` und neue Navigationsstruktur abgestimmt bleiben.

## Risks

- Layout-Umbauten koennen bestehende UI-Tests brechen.
- Kalenderdarstellung mit Fremdkomponente (FullCalendar) kann visuell hinter dem Designsystem zurueckbleiben.
- Zusaetzlicher Aufwand bei responsiver Tabellen-Darstellung auf sehr kleinen Viewports.

## Rollout

- Iterative Migration pro Seite (Start -> Inventar -> Vermietungen -> Kalender).
- Design und Accessibility-Check pro Schritt in Light und Dark Theme.
- Abschluss mit visueller Regression und kritischen E2E-Flows.
