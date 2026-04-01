## Context

Die bestehende Domaene speichert Vermietungen als Einzelbuchung mit genau einem Gegenstand (`itemId`, `quantity`). Um mehrere Gegenstaende in einem Vorgang abzubilden, wird ein Kopf-Positionen-Modell benoetigt.

Gleichzeitig soll der Status `Returned` als eigener technischer Zustand eingefuehrt werden, wobei `Completed` weiterhin existiert. Damit entsteht ein erweiterter Lifecycle, der in Backend-Regeln, API-Vertraegen, Kalenderdarstellung und UI-Aktionen konsistent umgesetzt werden muss.

Im Inventar wird Kategorie von Freitext auf verwaltete Entitaet umgestellt. Kategorien duerfen nur loeschbar sein, wenn sie von keinem Gegenstand verwendet werden.

## Goals / Non-Goals

**Goals:**
- Vermietung mit mindestens einer Position (`lines`) statt Single-Item-Modell.
- `Returned` als eigener technischer Rental-Status, `Completed` bleibt bestehen.
- Leiher als Freitextfeld auf Vermietungsebene.
- Vollstaendiges Rental-Edit (Positionen, Zeitraum, Leiher, Status).
- Kategorienverwaltung mit referenzierter Nutzung in Inventargegenstaenden.
- Startseiten-Links innerhalb von Cards als klar erkennbare Buttons.

**Non-Goals:**
- Kein dediziertes Leiher-Adressbuch.
- Keine Rechnungslogik oder Kautionsverwaltung.
- Keine Erweiterung des Autorisierungssystems.

## Decisions

1. Rental-Modell wird in `Rental` (Kopf) und `RentalLine` (Positionen) getrennt.
- Why: Fachlich saubere Abbildung einer Vermietung mit mehreren Gegenstaenden.
- Alternative: Gruppierung mehrerer Einzelbuchungen per Gruppenschluessel.
- Reason against alternative: Inkonsistente Lifecycle-Steuerung und hohe Komplexitaet bei Updates.

2. Mindestanzahl Positionen pro Vermietung: `lines.count >= 1`.
- Why: Entspricht der fachlichen Mindestanforderung und verhindert leere Vermietungen.

3. Statusmodell wird auf `Planned`, `Active`, `Returned`, `Canceled`, `Completed` erweitert.
- Why: Rueckgabe ist ein eigener technischer Zustand; Abschluss bleibt getrennt sichtbar.

4. Rental-Edit darf alle Felder aendern.
- Why: Entspricht Arbeitsrealitaet bei kurzfristigen Umbuchungen.
- Guardrail: Validierung und Konfliktpruefung gelten fuer jede Aenderung erneut.

5. Kategorien werden als eigene Ressource verwaltet; Inventargegenstaende referenzieren Kategorie-ID.
- Why: Vermeidet Dubletten/Schreibvarianten und erlaubt kontrollierte Governance.

6. Kategorien-Loeschregel: Nur loeschbar ohne Referenzen.
- Why: Erhaelt Datenintegritaet und vermeidet verwaiste Fremdschluessel.

7. Startseite: Card bleibt passiv, CTA-Link innerhalb Card wird als Button dargestellt.
- Why: Klares Interaktionsmodell ohne doppelte Klickzonen.

## Architecture Sketch

```text
Rental

+------------------------------+
| id                           |
| borrowerName                 |
| startDate / endDate          |
| status: Planned|...          |
| createdAt / updatedAt        |
+---------------+--------------+
                | 1..n
                v
          RentalLine
        +------------------+
        | id               |
        | rentalId         |
        | itemId           |
        | quantity >= 1    |
        +------------------+

Category

+------------------+
| id               |
| name (unique)    |
| createdAt        |
| updatedAt        |
+--------+---------+
         | 1..n
         v
InventoryItem.categoryId
```

## Lifecycle Design

```text
Planned -> Active -> Returned -> Completed
   │         │          │
   └-------->└--------->└-----> Canceled (nur nach fachlicher Regel)
```

Hinweis: Exakte erlaubte Transitionen werden im Service explizit validiert und als API-Fehler mit eindeutigem Code zurueckgegeben.

## API Contract Impact

1. Rental Create/Update Requests wechseln auf Positionsliste (`lines[]`) plus `borrowerName`.
2. Rental Responses enthalten Positionen sowie den erweiterten Statusraum.
3. Bestehende Proxy-Routen und Frontend-Mappingfunktionen muessen auf neue Modelle angepasst werden.
4. Kategorien erhalten eigene Endpunkte (list/create/update/delete/get).
5. Inventory Create/Update referenziert `categoryId` statt Kategorie-Freitext.

Der OpenAPI-Export bleibt Source of Truth; der generierte Frontend-Client muss nach Vertragsaenderungen aktualisiert und synchron validiert werden.

## Data Migration Strategy

1. Neue Tabellen/Relationen anlegen (`rentals`, `rental_lines`, `categories`) und Inventory-Kategorie-Referenz einfuehren.
2. Bestehende Freitext-Kategorien in Kategorieeintraege ueberfuehren (distinct values).
3. Bestehende Single-Item-Rentals in Kopf+eine Position migrieren.
4. Statuswerte ueberfuehren; bestehende `Completed` bleiben erhalten.
5. Nach erfolgreicher Migration alte Felder/Strukturen in kontrollierten Schritten entfernen.

Rollback:
- Rueckwaertsmigration fuer Schemaaenderungen vorbereiten.
- Vor destruktiven Schritten Datensicherung und verifizierbares Restore-Szenario.

## Risks / Trade-offs

- Mehr Tabellen und Join-Operationen erhoehen Query-Komplexitaet.
- Vollstaendiges Editieren kann zu haeufigeren Konflikten fuehren.
- Zusaetzlicher Pflegeaufwand fuer Statusdarstellung in Listen, Kalender und Aktionen.
- Kategorie-Loeschverbote benoetigen klare UX-Fehlermeldungen.

## Validation Strategy

- Backend: xUnit fuer Rental-Lifecycle-Transitions, Multi-Line-Konfliktpruefung, Kategorie-Loeschschutz.
- Frontend: Vitest fuer Formvalidierung (mindestens eine Position), Statusdarstellung und Kategorie-Combo.
- E2E: Playwright fuer End-to-End-Flow mit Mehrpositions-Vermietung, Rueckgabe (`Returned`) und Abschluss (`Completed`).
- Contract: OpenAPI-Export, Client-Regenerierung und Drift-Pruefung als Pflichtcheck.

## Open Questions

- Soll `Canceled` nach `Returned` weiterhin erlaubt sein oder nur bis einschliesslich `Active`?
- Sollen Kategorien beim Loeschen hard-deleted oder zuerst soft-deleted werden?
