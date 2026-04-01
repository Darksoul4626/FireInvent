## Context

Die Loesung wird als Webanwendung mit getrenntem Frontend und Backend umgesetzt. Das Frontend wird mit Next.JS umgesetzt und soll Inventar, Verfuegbarkeit und Vermietungszeiträume uebersichtlich darstellen, waehrend das Backend auf .NET 10 basiert und fachliche Regeln (Bestandspruefung, Konfliktpruefung bei Vermietungen, Statusverwaltung) sowie Persistenz kapselt. Die aktuelle Ausgangslage ist ohne zentrale Datenhaltung und ohne kalendarische Belegungsdarstellung.

Wesentliche Randbedingungen:
- Datenkonsistenz zwischen Inventarbestand und Vermietungen ist kritisch.
- Die Anwendung muss auch bei wachsendem Bestand performant filter- und suchbar bleiben.
- Kalenderdarstellung muss Zeitraeume ueberschneidungsfrei und nachvollziehbar visualisieren.

Stakeholder:
- Inventarverantwortliche (Pflege Bestand und Stammdaten)
- Vermietungsverwaltung (Anlage, Planung, Ruecknahme)
- Operative Nutzer (Abfrage Verfuegbarkeit)

## Goals / Non-Goals

**Goals:**
- Bereitstellung einer konsistenten, rollenunabhaengigen Inventar- und Vermietungsverwaltung.
- Klare Trennung von Darstellung (Frontend), Geschäftslogik (Backend) und Datenpersistenz (Datenbank).
- Sofort sichtbare Verfuegbarkeit je Gegenstand aus Gesamtbestand minus aktiver Reservierungen/Vermietungen.
- Kalendarische Uebersicht aller Vermietungen inklusive Konflikterkennung im gewaehlten Zeitraum.
- API-Design, das zukunftssichere Erweiterungen (z. B. Buchungsfreigaben, Benachrichtigungen) ermoeglicht.

**Non-Goals:**
- Keine Abrechnungs- oder Rechnungslogik.
- Kein Mandantenbetrieb (Single-Organisation).
- Keine externe Online-Zahlungsintegration.
- Kein Offline-First-Sync.

## Decisions

1. Architektur: Drei-Schichten-Modell (Next.JS-Frontend, .NET-10-REST-Backend, relationale Datenbank).
- Why: Gute Wartbarkeit, klare Verantwortlichkeiten, testbare API-Vertraege.
- Alternative: Monolithisches Server-Rendered UI.
- Reason against alternative: Geringere UX-Flexibilitaet fuer interaktive Kalender- und Filteransichten.

2. Persistenz: Entity Framework mit relationalem Datenmodell und Transaktionen.
- Why: Vermietung und Bestandsaenderung benoetigen ACID-Sicherheit bei konkurrierenden Buchungen.
- Alternative: Dokumentenorientierte Datenbank.
- Reason against alternative: Konflikt- und Aggregationslogik fuer Bestand und Zeitraeume ist relational einfacher und robuster.

3. Verfuegbarkeitsberechnung: Serverseitige Berechnung pro Gegenstand mit Zeitraumbezug.
- Why: Einheitliche fachliche Wahrheit, keine divergierende Logik in mehreren Clients.
- Alternative: Rein clientseitige Berechnung aus Rohdaten.
- Reason against alternative: Hoeheres Risiko fuer inkonsistente Ergebnisse und Performance-Probleme bei groesseren Datenmengen.

4. Kalenderintegration in Next.JS: Einheitliches Vermietungs-Event-Modell (startDate, endDate, quantity, status, itemId).
- Why: Direkte Abbildung im UI-Kalender und einfache Konfliktpruefung.
- Alternative: Separate Event- und Reservierungsmodelle ohne gemeinsame Sicht.
- Reason against alternative: Erhoeht Komplexitaet bei der Darstellung uebergreifender Zeitraeume.

5. API-Konventionen und Dokumentation: Ressourcenorientierte Endpunkte fuer Items, Rentals, Availability mit Swagger/OpenAPI in .NET 10.
- Why: Vorhersagbare Schnittstellen, einfache Automatisierung von Tests und Dokumentation.
- Alternative: RPC-aehnliche Endpunkte pro Aktion.
- Reason against alternative: Geringere Lesbarkeit und schlechtere Evolvierbarkeit.

6. Client-Generierung: Das Next.JS-Frontend nutzt einen aus Swagger/OpenAPI generierten typsicheren API-Client als Standardzugriffsschicht.
- Why: Vermeidet Drift zwischen Backend-Vertrag und Frontend-Aufrufen und reduziert manuelle API-Fehler.
- Alternative: Manuell gepflegte HTTP-Clients ohne Generierung.
- Reason against alternative: Hoeherer Wartungsaufwand und erhoehtes Risiko fuer inkonsistente Request/Response-Typen.

7. Betriebsmodell: Frontend, Backend und Datenbank laufen in jeweils separaten Docker-Containern; Zusammensetzung erfolgt ueber Docker Compose.
- Why: Reproduzierbare Laufzeitumgebung, klare Isolation der Komponenten und einfaches lokales Gesamtsetup.
- Alternative: Gemischter Betrieb ohne Container oder nur teilweise Containerisierung.
- Reason against alternative: Hoeheres Risiko fuer Umgebungsdrift und aufwendigere Team-Onboarding-Prozesse.

8. Backend-Schichtenprinzip: Controller greifen nur auf Services zu; Datenzugriffe laufen ausschliesslich ueber Repository-Layer.
- Why: Bessere Testbarkeit, geringere Kopplung, klarere Verantwortlichkeiten pro Schicht.
- Alternative: Direkter DbContext-Zugriff in Controllern.
- Reason against alternative: Vermischung von API- und Persistenzlogik, erschwerte Wiederverwendung und hoehere Refactoring-Kosten.

9. Teststrategie: Frontend-Unit-Tests werden mit Vitest umgesetzt; End-to-End-Flows werden mit Playwright validiert.
- Why: Schnelle komponentennahe Rueckmeldung im Frontend plus realistische Browser-Validierung zentraler Nutzerfluesse.
- Alternative: Einheitliches Testen nur mit einem Framework.
- Reason against alternative: Entweder zu wenig Integrationsabdeckung (nur Unit) oder zu langsame Feedbackzyklen (nur E2E).

## Risks / Trade-offs

- [Race Conditions bei gleichzeitigen Vermietungen] -> Mitigation: Transaktionale Buchung, Sperrstrategie auf Bestandszeilen, Konfliktantworten mit klaren Fehlercodes.
- [Kalender wird bei vielen Eintraegen unuebersichtlich] -> Mitigation: Filter nach Gegenstand/Status, Monats- und Listenansicht, Paging fuer Detailtabellen.
- [Inkonsistente Stammdatenqualitaet] -> Mitigation: Validierungsregeln im Backend und verpflichtende Felder fuer Kernattribute.
- [Hoeherer Initialaufwand durch klare Schichtentrennung] -> Mitigation: Schnellstart mit minimalem End-to-End Vertical Slice (Item anlegen -> vermieten -> Kalender sichtbar).
- [Container-Netzwerk oder Startreihenfolge fuehrt zu Verbindungsfehlern] -> Mitigation: Healthchecks, dependency conditions und dokumentierte Compose-Startsequenz.
- [Controller-Logik umgeht Service/Repository-Layer] -> Mitigation: Architekturkonvention dokumentieren, Code-Reviews und Tests auf Schichtentrennung ausrichten.

## Migration Plan

1. Initiales Datenbankschema fuer Gegenstaende, Bestandsfuehrung und Vermietungen erstellen.
2. Basis-REST-Endpunkte fuer Gegenstaende und Vermietungen bereitstellen.
3. Verfuegbarkeitslogik im Backend implementieren und mit API-Tests absichern.
4. Swagger/OpenAPI-Dokumentation finalisieren und Client-Generierung fuer das Frontend automatisieren.
5. Next.JS-Views fuer Inventar, Vermietungserfassung und Kalender in iterativen Slices anbinden.
6. Container-Images fuer Frontend, Backend und Datenbank konfigurieren sowie Compose-Datei fuer das integrierte Setup erstellen.
7. Seed-Daten importieren und fachliche Validierung mit Stakeholdern durchfuehren.
8. Rollout stufenweise (Pilotbetrieb), danach Produktivschaltung.

Rollback-Strategie:
- Datenbankmigrationen rueckwaertsfaehig gestalten.
- Feature-Flags fuer neue UI-Bereiche vorsehen.
- Bei kritischen Fehlern auf letzte stabile API/DB-Version zurueckrollen.

## Open Questions

- Welche Benutzerrollen und Berechtigungen werden in der ersten Version benoetigt?
- Welche Pflichtattribute muessen Inventargegenstaende mindestens enthalten (z. B. Kategorie, Standort, Zustand)?
- Soll es neben Vermietung auch interne Reservierungen ohne externe Vermietung geben?
- Wie soll mit Teilrueckgaben ueber mehrere Tage umgegangen werden?
