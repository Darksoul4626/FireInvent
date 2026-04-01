## Why

Die aktuelle Vermietungslogik erlaubt pro Buchung nur einen Gegenstand. Fuer reale Einsaetze der Feuerwehr werden jedoch Vermietungen benoetigt, die mehrere Gegenstaende in einem gemeinsamen Vorgang zusammenfassen.

Zusaetzlich fehlen zwei fachlich wichtige Erweiterungen:
- ein eigener technischer Status fuer Rueckgaben (`Returned`),
- ein freies Leiher-Feld zur klaren Zuordnung einer Vermietung.

Im Inventar ist die Kategorie aktuell ein Freitextfeld. Fuer konsistente Stammdaten wird eine zentrale Kategorienverwaltung mit referenzierten Kategorien benoetigt, inklusive sicherem Loeschen nur bei Nichtverwendung.

Auf der Startseite soll die Navigation ueber klar erkennbare Link-Buttons in Cards erfolgen (Card selbst bleibt nicht klickbar).

## What Changes

- Umbau des Vermietungsmodells von Einzelposition auf Vermietung mit mindestens einer Position.
- Erweiterung des Rental-Statusmodells um `Returned` als eigenen technischen Status, wobei `Completed` weiterhin bestehen bleibt.
- Erweiterung der Vermietung um ein Freitextfeld fuer Leiher.
- Erweiterung des Rental-Edit-Workflows, sodass Zeitraum, Leiher, Status und Positionen vollstaendig anpassbar sind.
- Einfuehrung einer eigenstaendigen Kategorienverwaltung (CRUD mit Loeschschutz bei Verwendung).
- Umstellung von Inventargegenstand-Kategorie von Freitext auf referenzierte Kategorie (ComboBox im Formular).
- Anpassung der Startseiten-Cards: Link bleibt innerhalb der Card und wird als Button dargestellt; Card selbst ist nicht klickbar.

## Capabilities

### New Capabilities
- `inventory-category-management`: Verwaltung von Kategorien fuer Inventargegenstaende inklusive Verwendungspruefung vor dem Loeschen.
- `application-entry-navigation`: Klare modulbezogene Einstiegspunkte auf der Startseite mit buttonartigen Links innerhalb von Cards.

### Modified Capabilities
- `rental-booking-management`: Mehrpositions-Vermietungen, Leiher-Freitext, neuer technischer Rueckgabe-Status und vollstaendig bearbeitbare Vermietungen.
- `stock-availability-tracking`: Verfuegbarkeitspruefung ueber mehrere Positionen innerhalb einer Vermietung.
- `inventory-catalog-management`: Inventargegenstaende referenzieren verwaltete Kategorien statt Freitext.
- `rental-calendar-visualization`: Zusaetzliche Statusdarstellung fuer Returned/Completed im Kalender und in Fallback-Ansichten.

## Non-Goals

- Keine Einfuehrung eines separaten Leiher-Stammdatensystems in diesem Change.
- Keine Rechnungs- oder Abrechnungslogik.
- Keine Aenderung an Rollen-/Rechteverwaltung.
- Keine klickbare Gesamt-Card auf der Startseite.

## Impact

- Affected code:
  - Backend-Domainmodell, API-Vertraege, Migrationen, Services, Repositories und Validierung fuer Vermietungen und Kategorien.
  - Frontend-Formulare fuer Vermietung und Inventar sowie Seiten fuer Kategorienverwaltung und Startseite.
  - Frontend-API-Adapter und generierter OpenAPI-Client.
- APIs:
  - Vertragsaenderungen fuer Rental-Create/-Update/-Response (Positionen, Leiher, Status).
  - Neue Kategorienendpunkte.
- Dependencies:
  - Keine neuen Pflichtlaufzeitabhaengigkeiten geplant; bestehender OpenAPI-Generierungsworkflow wird erweitert genutzt.
- Systems:
  - Datenmodellmigration fuer Rental-Kopf/Positionen und Kategorienreferenzen.
  - Bestandsschutz fuer bestehende Daten ueber Migrations- und Rueckfallstrategie.

## Risks

- Migrationsrisiko beim Umbau von Single-Item-Rentals auf Mehrpositionsmodell.
- Erhoehte Konfliktkomplexitaet bei Verfuegbarkeitspruefungen ueber mehrere Positionen.
- Testaufwand fuer bestehende Flows (Unit, E2E, Contract-Sync) steigt deutlich.
- Kategorie-Loeschregeln koennen zu Bedienkonflikten fuehren, falls UI den Nutzungsgrund nicht transparent macht.

## Rollout

- Schrittweiser Rollout in drei Wellen:
  - Welle 1: Kategorienverwaltung und Kategorie-Referenzierung im Inventar.
  - Welle 2: Vermietungsmodell, Statusfluss und Leiher-Feld.
  - Welle 3: UI-Abschluss inkl. Startseiten-Linkbuttons und Regressionstests.
- OpenAPI-Sync und Testpyramide (xUnit, Vitest, Playwright) als Freigabekriterien pro Welle.
