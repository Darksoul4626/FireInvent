## Context

Das archivierte Vorgangspaket zur mobilen Tabellenoptimierung hat Sortierung/Filterung in der UI verbessert, jedoch weiterhin mit vollstaendigen Listenabfragen und clientseitiger Verarbeitung. In der aktuellen Architektur werden Inventory- und Rental-Overviews ueber unparametrisierte GET-Endpunkte geladen und anschließend im Frontend weiterverarbeitet.

Mit steigender Datenmenge fuehrt das zu drei Problemen:

- Uebertragung und Rendering skalieren schlecht auf mobilen Endgeraeten.
- Filter- und Sortierlogik ist nicht zwischen Clients konsistent.
- Inventory-Verfuegbarkeit in der Overview wird aus kompletten Rental-Daten lokal berechnet statt query-konsistent vom Backend geliefert.

## Goals / Non-Goals

**Goals:**

- Serverseitige Overview-Queries fuer Inventar und Vermietungen mit Paging und Filterung einfuehren.
- Standard-Paging mit `pageSize=20` und klaren Metadaten (`totalCount`, `totalPages`, `hasNext`, `hasPrevious`) bereitstellen.
- Inventory-Overview-Felder `rented` und `available` backendseitig und zeitpunktbezogen berechnen.
- Frontend auf URL-getriebenen Query-State fuer Paging/Filter umstellen, inklusive Refetch bei Filteraenderungen.
- Sortierung in den Overview-Tabellen lokal auf die aktuell geladene Seite beschraenken.
- Vermietungsanlage nur fuer Starttage `>= heute` zulassen und Regel in relevanten Bearbeitungsfaellen konsistent durchsetzen.
- Vermietungsformular mit UI-seitiger Pre-Validation ausstatten, damit Verfuegbarkeit je Position bei Zeitraum- oder Positionsaenderung sofort sichtbar ist und konfliktbehaftetes Speichern blockiert wird.
- Kategorieauswahl beim Gegenstand-Anlegen auf eine erstellbare Combobox mit Inline-Kategorieanlage umstellen.
- Selektives Memory-Caching fuer read-heavy Lookup-Daten mit Invalidation bei schreibenden Operationen einbauen.
- API-first Ablauf einhalten (OpenAPI aktualisieren, Frontend-Client regenerieren).

**Non-Goals:**

- Keine Aenderung der Rental-Lifecycle-Domainlogik.
- Keine FullCalendar-Migration.
- Kein globaler Wechsel auf verteilten Cache (Redis o.a.) in diesem Schritt.
- Kein generisches Query-DSL ueber alle Endpunkte hinweg.

## Decisions

1. Decision: Separate Overview-Endpunkte statt Erweiterung bestehender List-GETs.
Rationale: Die aktuellen List-GETs liefern Domaintypen fuer allgemeine Nutzung; Overviews benoetigen projektspezifische Felder, Aggregation und Paging-Metadaten.
Alternativen:
- Bestehende Endpunkte mit optionalen Query-Parametern erweitern: verworfen, weil Contract und Semantik vermischt werden.

2. Decision: Offset-basiertes Paging mit `page`/`pageSize` als Startstrategie.
Rationale: Geringe Komplexitaet, leicht testbar und kompatibel mit OpenAPI-Codegen.
Alternativen:
- Cursor/Keyset sofort: vorerst verworfen, da aktueller Scope primär Tabellenkonsistenz und mobile Performance adressiert.

3. Decision: Inventory-Overview-Projektion inkl. Verfuegbarkeitsfeldern im Backend berechnen.
Rationale: Query-konsistente Werte pro Seite, weniger Frontend-Rechenlast, weniger Datentransfer.
Alternativen:
- Verfuegbarkeit weiter im Frontend berechnen: verworfen, da es serverseitigem Paging widerspricht.

4. Decision: Frontend-Query-State in URL als Single Source of Truth.
Rationale: Deep-Linking, reproduzierbare Ansichten, browser-native Navigation.
Alternativen:
- Nur lokaler Komponentenstate: verworfen, da nicht teilbar und weniger robust bei Reload/Navigation.

5. Decision: Creatable Combobox fuer Kategorieanlage im Item-Form.
Rationale: Schnellere Datenerfassung ohne Kontextwechsel in separate Kategorieverwaltung.
Alternativen:
- Bestehendes Select + Link beibehalten: verworfen, da zusaetzliche Navigation und Reibung.

6. Decision: Selektives In-Memory-Caching fuer Kategorien mit expliziter Invalidation.
Rationale: Hoher Read-Anteil bei geringem Stale-Risiko bei kurzer TTL und invalidierenden Schreibpfaden.
Alternativen:
- Kein Caching: verworfen, da unnötige Last auf häufige Lookup-Daten.
- Breites Caching von Overviews: verworfen, da hohes Stale-Risiko fuer operative Daten.

7. Decision: Rental-Startdatum-Regel wird serverseitig und UI-seitig erzwungen.
Rationale: Die Regel ist fachlich bindend und darf nicht nur von einem Client abhaengen.
Alternativen:
- Nur UI-Validierung: verworfen, da API sonst inkonsistente oder veraltete Clients akzeptiert.

7a. Decision: "Heute" wird als Betriebstag in `Europe/Berlin` auf Datumsebene (ohne Uhrzeitanteil) festgelegt.
Rationale: Einheitliche und fuer Anwender nachvollziehbare Tagesgrenze unabhaengig von Client-Standort oder Uhrzeitanteil.
Alternativen:
- UTC-Tagesgrenze: verworfen, da aus Nutzersicht lokal unerwartete Tageswechsel moeglich sind.

8. Decision: Formular-Pre-Validation nutzt verteilte Verfuegbarkeitsabfragen pro Position und Zeitraum.
Rationale: Nutzer erhalten fruehes Feedback fuer Konflikte, bevor ein Persistierungsversuch erfolgt.
Alternativen:
- Nur finale API-Konfliktpruefung beim Speichern: verworfen, da zu spaetes Feedback.
- Neuer monolithischer "draft validation"-Endpoint: fuer den aktuellen Scope zurueckgestellt.

## Risks / Trade-offs

- [Risk] Query-Performance degradiert bei unguenstigen Filter-/Paging-Kombinationen.
  Mitigation: Filter-Validierung, Index-Review, EXPLAIN-Checks auf Hauptqueries.

- [Risk] Cache-Staleness bei Kategorien nach Schreibvorgaengen.
  Mitigation: Invalidation in Category-Create/Update/Delete und kurze TTL.

- [Risk] UI-Reaktivitaet bei haeufigen Filteraenderungen.
  Mitigation: Debounce fuer Textsuche, sofortiger Refetch fuer Select-Filter, Request-Cancellation.

- [Risk] Unterschiedliche Interpretation von "heute" zwischen Client-Zeitzone und Backend-Zeitzone.
  Mitigation: Regel im Backend verbindlich auf `Europe/Berlin` und Datumsebene validieren und dieselbe Grenze in der UI spiegeln.

- [Risk] Hohe Anzahl paralleler Verfuegbarkeitsabfragen bei vielen Positionen.
  Mitigation: Debounce, deduplizierte Requests je Position/Zeitraum und Abbruch veralteter Requests.

- [Trade-off] Zusaetzliche API-Endpunkte erhoehen Contract-Oberflaeche.
  Mitigation: Klare Trennung zwischen Domain-Detail-Endpunkten und Overview-Projektionen.

## Migration Plan

1. Neue Contracts fuer paginierte Overview-Responses und Query-Parameter einfuehren.
2. Backend-Endpunkte fuer Inventory- und Rental-Overview mit Filter/Paging und deterministischer Standardordnung implementieren.
3. Kategorie-Caching samt Invalidation integrieren.
4. OpenAPI aktualisieren und Frontend-Client regenerieren.
5. Backend-Regel fuer Vermietungsstarttage (`>= heute`) in Create- und relevanten Update-Pfaden implementieren.
6. Frontend-Overviews auf servergetriebene Queries und URL-State umstellen.
7. Frontend-Vermietungsformular um Live-Verfuegbarkeitsfeedback und Save-Blocking bei Konflikten ergaenzen.
8. Inventory-Form auf erstellbare Kategorie-Combobox umstellen.
9. Unit-, Integrations- und e2e-Tests fuer Paging, Refetching, Datumsregeln, Pre-Validation, Combobox und Konfliktfaelle ergaenzen.

Rollback:

- Frontend kurzfristig auf bestehende List-GET-Nutzung zurueckschalten.
- Neue Overview-Endpunkte deaktivieren oder ungenutzt lassen.
- Kategorie-Caching abschalten (Konfigurations- oder DI-seitig), ohne Datenmigration.

## Open Questions

- Soll neben Offset-Paging spaeter optional ein Cursor-Modell eingefuehrt werden?
- Soll Kategorie-Cache zunaechst nur in-process bleiben oder direkt auf verteilten Cache vorbereitet werden?
- Welche maximale `pageSize` wird produktiv freigegeben (z.B. 100 oder 200)?
