## Why

Die Projektdokumentation ist aktuell auf mehrere Orte verteilt, teilweise veraltet und fuer neue Mitwirkende sowie Einsatzverantwortliche schwer nachvollziehbar. Eine konsistente, vollstaendige Dokumentationsbasis ist jetzt noetig, um Betrieb, Weiterentwicklung und Onboarding zu beschleunigen und Fehlkonfigurationen in produktionsnahen Deployments zu reduzieren.

## What Changes

- Definiere eine einheitliche Dokumentationsstruktur fuer Produkt, Architektur, API, Betrieb und Entwicklungsworkflow.
- Erstelle oder ueberarbeite zentrale Dokumente in Root-, Backend- und Frontend-Kontext mit klaren Verantwortlichkeiten und Querverweisen.
- Dokumentiere den API-first Ablauf (OpenAPI-Export, Client-Generierung, Contract-Sync-Pruefung) als verbindlichen Prozess.
- Ergaenze Betriebs- und Deployment-Dokumentation fuer lokale Umgebung und containerisierte Zielumgebungen (inklusive Fehlerbilder und Recovery-Schritte).
- Erstelle einen Beitragenden-Guide fuer Coding-, Testing- und Change-Workflow mit OpenSpec.

Non-goals:

- Keine funktionalen Produktaenderungen an Inventar-, Kategorie-, Vermietungs- oder Kalenderlogik.
- Keine Einfuehrung neuer AuthN/AuthZ-Anforderungen.
- Keine Umstellung der Laufzeitarchitektur oder Datenbanktechnologie.

Risks:

- Dokumentation kann schnell wieder veralten, wenn Ownership und Pflegeprozess nicht klar sind.
- Hoher Initialaufwand bei der Konsolidierung kann laufende Feature-Arbeit kurzzeitig bremsen.

Rollout impact:

- Niedriges Betriebsrisiko, da primaer Dokumentationsaenderungen.
- Mittlerer organisatorischer Impact durch neue Standards fuer Pull Requests und Release-Vorbereitung.

## Capabilities

### New Capabilities
- `project-documentation-governance`: Definiert verbindliche, versionierte Projekt-, Betriebs- und Entwicklungsdokumentation inklusive Pflegeprozess und Qualitaetskriterien.

### Modified Capabilities
- None.

## Impact

- Affected code:
  - Root-Dokumentation (z. B. `README.md`) und projektspezifische Guides unterhalb der bestehenden Dokumentationspfade.
  - `backend/README.md` und `frontend/README.md` inklusive Setup-, Test- und Troubleshooting-Abschnitte.
  - API-Vertragsdokumentation in `shared/api-contract.md` inklusive Synchronisationsprozess.
- APIs/dependencies:
  - Keine API-Verhaltensaenderung; OpenAPI bleibt Source of Truth, Dokumentation zur Nutzung wird praezisiert.
  - Keine neuen Laufzeitabhaengigkeiten erforderlich.
- Test impact:
  - Dokumentations-Checks werden in bestehende Verifikationsablaeufe integriert (mindestens manuelle Checkliste, optional automatisierte Link- und Script-Checks).
- Delivery impact:
  - Schnellere Einarbeitung neuer Entwicklerinnen und Entwickler.
  - Bessere Betriebssicherheit durch nachvollziehbare Deployment- und Recovery-Schritte.