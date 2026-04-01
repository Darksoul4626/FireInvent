## Why

Die Feuerwehr benoetigt eine zentrale, webbasierte Loesung, um Inventar strukturiert zu erfassen und Vermietungen verlässlich zu verwalten. Aktuell fehlt ein durchgaengiger Ueberblick ueber Bestand und Belegungszeiträume, wodurch Verfuegbarkeit und Planung unnötig aufwendig sind.

## What Changes

- Einfuehrung einer Webanwendung mit Frontend und Backend fuer Inventarisierung und Vermietungsverwaltung.
- Festlegung des Frontend-Stacks auf Next.JS fuer Inventar-, Vermietungs- und Kalenderansichten.
- Festlegung des Backend-Stacks auf .NET 10 mit Entity Framework fuer Persistenz sowie Swagger/OpenAPI fuer API-Dokumentation.
- Backend-Architektur ueber Service- und Repository-Layer; Controller duerfen keinen direkten DbContext-Zugriff enthalten.
- Nutzung der Swagger/OpenAPI-Spezifikation als verbindliche Quelle fuer die Client-Generierung im Frontend.
- Containerisierung von Frontend, Backend und Datenbank in jeweils eigenen Docker-Containern.
- Orchestrierung der Gesamtloesung ueber Docker Compose als Ziel fuer lokale und spaetere integrierte Ausfuehrung.
- Aufbau einer Datenbankanbindung im Backend zur persistenten Verwaltung von Gegenstaenden, Bestandsmengen und Vermietungen.
- Erfassung und Pflege von Inventargegenstaenden inklusive relevanter Stammdaten.
- Verwaltung von Vermietungen mit Zeitraum, Menge und Status.
- Uebersichtliche Bestandsanzeige pro Gegenstand inklusive verfuegbarer und vermieteter Menge.
- Kalenderansicht fuer Vermietungszeiträume zur schnellen Belegungspruefung.

## Capabilities

### New Capabilities
- `inventory-catalog-management`: Erfassung, Anzeige und Pflege von Inventargegenstaenden und deren Stammdaten.
- `rental-booking-management`: Anlegen, Aktualisieren und Nachverfolgen von Vermietungsvorgaengen mit Zeitraum und Menge.
- `stock-availability-tracking`: Berechnung und Darstellung von Gesamtbestand, aktuell vermietetem Bestand und verfuegbarem Bestand je Gegenstand.
- `rental-calendar-visualization`: Kalenderbasierte Darstellung geplanter und aktiver Vermietungen zur Kapazitaetsplanung.
- `inventory-rental-backend-data-model`: Backend-API und Datenmodell fuer Inventar-, Bestands- und Vermietungsdaten inklusive Persistenz.
- `containerized-deployment-orchestration`: Container-Betriebsmodell mit separaten Images/Containern fuer Frontend, Backend und Datenbank sowie Zusammensetzung via Docker Compose.

### Modified Capabilities
- Keine.

## Impact

- Affected code:
  - Neue Next.JS-Module fuer Inventarlisten, Detailansichten, Vermietungsmaske und Kalender.
  - Neues .NET-10-Backend fuer REST-API, Geschäftslogik, Entity-Framework-Datenzugriff und Swagger/OpenAPI.
- APIs:
  - Neue interne API-Endpunkte fuer Inventarverwaltung, Bestandsabfrage und Vermietungsverwaltung.
- Dependencies:
  - Entity Framework im Backend fuer relationale Persistenz.
  - Service- und Repository-Abstraktionen fuer saubere Trennung von API, Geschäftslogik und Datenzugriff.
  - Swagger/OpenAPI fuer API-Spezifikation und Dokumentation.
  - OpenAPI-Client-Generator im Frontend-Build/Dev-Workflow fuer typsichere API-Clients.
  - Vitest als Standard fuer Frontend-Unit-Tests.
  - Playwright als Standard fuer End-to-End-Tests kritischer Nutzerfluesse.
  - Next.JS-kompatible Kalender-/Datumsverarbeitung im Frontend.
  - Docker fuer Build und Betrieb der Einzelcontainer.
  - Docker Compose fuer Orchestrierung des Multi-Container-Setups.
- Systems:
  - Einfuehrung eines durchgaengigen Datenflusses zwischen UI, API und Datenbank.
