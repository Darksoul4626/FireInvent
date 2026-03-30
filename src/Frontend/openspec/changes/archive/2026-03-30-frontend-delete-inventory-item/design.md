## Context

Der Backend-Stack unterstuetzt bereits `DELETE /api/items/{id}` inklusive sauberer Konfliktsignale (`item_has_rentals`) und `404` fuer unbekannte IDs. Im Frontend fehlt jedoch ein durchgaengiger Loeschworkflow fuer Inventargegenstaende.

Aktuell existieren Bearbeiten- und Detailaktionen in der Inventarliste sowie auf der Detailseite, aber keine Loeschaktion. Zusaetzlich ist in der bestehenden Proxyroute fuer Item by Id nur `PUT` umgesetzt; ein `DELETE`-Handler fehlt.

Relevante Rahmenbedingungen:
- Next.js App Router mit serverseitigen Pages plus Client-Komponenten fuer interaktive Formflows.
- Einheitliche ProblemDetails-nahe Fehlerbehandlung ueber `toApiErrorResponse` und `parseApiError`.
- Responsives Inventar-UI (Desktop-Tabelle + Mobile-Cards), beide Varianten benoetigen konsistente Loeschaktionen.

## Goals / Non-Goals

**Goals:**
- Loeschbarkeit von Inventargegenstaenden im Frontend mit expliziter Benutzerbestaetigung.
- Konsistente Nutzung der bestehenden Backend-Loeschregeln ueber den Frontend-Proxy.
- Transparente, benutzerverstaendliche Fehlermeldungen bei Konflikten (z. B. Vermietungshistorie vorhanden).
- Testabdeckung fuer Erfolgs-, Konflikt- und Abbruchpfad auf Unit- und E2E-Ebene.

**Non-Goals:**
- Keine Aenderung der Backend-Fachlogik, Error-Codes oder Datenbankstruktur.
- Keine Soft-Delete-/Archivierungsfunktion.
- Keine Erweiterung des Inventory-Domainmodells.

## Decisions

1. Loeschzugriff ueber bestehende Next.js-Proxyschicht statt direktem Browserzugriff auf Backend.
- Why: Behaelt API-Basis-URL, Header-Handling und Fehlernormalisierung zentral in der vorhandenen Integrationsschicht.
- Alternative: Direkter Client-Aufruf gegen Backend-API.
- Reason against alternative: Dupliziert Integrationslogik und erhoeht CORS/Runtime-Konfigurationskomplexitaet.

2. Item-by-Id-Proxyroute wird um `DELETE` erweitert, analog zum Kategorien-Pattern.
- Why: Minimal-invasive Erweiterung am bereits etablierten Routing-Muster (`PUT` vorhanden, gleiche Fehlerbehandlung).
- Alternative: Neue separate Proxyroute nur fuer Delete-Aktionen.
- Reason against alternative: Erhoeht Routing-Oberflaeche ohne funktionalen Mehrwert.

3. Loeschaktion in zwei UI-Kontexten: Inventarliste (Desktop/Mobile) und Detailseite.
- Why: Nutzer koennen im Arbeitsalltag entweder schnell aus der Liste bereinigen oder aus der Detailansicht entscheiden.
- Alternative: Loeschen nur in Detailseite.
- Reason against alternative: Erhoehte Klickstrecke bei Stammdatenpflege mit vielen Eintraegen.

4. Vor dem Request wird eine explizite Bestaetigung erzwungen.
- Why: Gegenstaende sind zentrale Stammdaten; unbeabsichtigtes Loeschen muss verhindert werden.
- Alternative: Sofortiges Loeschen mit Undo-Hinweis.
- Reason against alternative: Kein garantiertes Undo im aktuellen Datenmodell und potenziell irrefuehrendes Sicherheitsgefuehl.

5. Nach erfolgreicher Loeschung erfolgt Navigation/Refresh statt komplexer lokaler Reconciliation.
- Why: Inventaransicht zeigt abgeleitete Kennzahlen (verfuegbar/vermietet), die serverseitig konsistent neu geladen werden sollen.
- Alternative: Optimistisches Entfernen aus lokaler Liste.
- Reason against alternative: Risiko inkonsistenter Anzeige bei Race-Conditions oder partiellen Fehlern.

6. Konflikt- und Fehlerfeedback wird ueber bestehende API-Fehlerparser aufbereitet.
- Why: Einheitliches UX-Verhalten mit bestehenden Formularen/Kategorieverwaltung.
- Alternative: Endpoint-spezifische String-Mappings in jeder Komponente.
- Reason against alternative: Hoher Pflegeaufwand und uneinheitliche Fehlermeldungsqualitaet.

## Risks / Trade-offs

- [Unbeabsichtigte Loeschung durch unklare CTA-Beschriftung] -> Mitigation: Deutliche Button-Texte, destruktiver Stil, bestaetigende Dialogsprache mit Itembezug.
- [Konfliktmeldungen sind fachlich korrekt, aber zu technisch] -> Mitigation: API-Fehler auf benutzernahe Meldung abbilden und Originaldetail optional in Tests absichern.
- [Responsive Regressionen durch neue Aktionsspalte/Buttons] -> Mitigation: Gleiche Aktion in Desktop-Tabelle und Mobile-Card mit stabilen `data-testid`-Selektoren und Playwright-Abdeckung.
- [Doppelklick/Mehrfachrequest auf Delete] -> Mitigation: Busy-State pro Aktion und deaktivierte Controls waehrend laufender Anfrage.

## Migration Plan

1. Frontend-Proxyroute fuer Item by Id um `DELETE` erweitern.
2. Loeschaktion mit Bestaetigung in Liste und Detailseite integrieren.
3. Fehlerdarstellung fuer Konflikt/NotFound konsistent anbinden.
4. Tests erweitern (Vitest fuer Komponentenzustand, Playwright fuer End-to-End-Flow).
5. Build und bestehende Testpipelines ausfuehren.

Rollback:
- Da keine Datenmigration stattfindet, reicht ein Rollback auf das vorherige Frontend-Artefakt.
- Backend bleibt unveraendert kompatibel.

## Open Questions

- Soll die Loeschaktion in der Desktop-Tabelle als eigene Spalte erscheinen oder in ein bestehendes Aktionsmuster mit Detail/Bearbeiten integriert werden?
- Soll bei erfolgreichem Loeschen ein explizites Success-Feedback (Toast/Banner) angezeigt werden oder reicht der sichtbare Wegfall des Gegenstands?
