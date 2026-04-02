## Context

FireInvent nutzt bereits mehrere Dokumentationsquellen (Root-README, Backend-README, Frontend-README, API-Contract-Hinweise und OpenSpec-Artefakte), aber sie sind nicht als zusammenhaengendes System definiert. Dadurch entstehen Inkonsistenzen bei Setup, Betrieb, API-Workflow und Beitragendenprozessen. Die Dokumentation soll als produktionsrelevantes Asset behandelt werden, ohne funktionale Aenderungen an Inventar-, Vermietungs- oder Verfuegbarkeitslogik.

Stakeholder:

- Entwicklerteam (Onboarding, Feature-Umsetzung, Tests)
- Betrieb/Deployment-Verantwortliche (Rollout, Fehlerbehebung, Recovery)
- Product/Projektverantwortliche (Scope, Release-Kommunikation)

Constraints:

- API-first Workflow bleibt unveraendert (OpenAPI als Source of Truth, Client-Generierung im Frontend).
- Bestehende Architekturgrenzen bleiben unveraendert; es werden keine neuen Laufzeitkomponenten eingefuehrt.
- Dokumentationsaenderungen muessen in bestehende Release- und Change-Prozesse integrierbar sein.

## Goals / Non-Goals

**Goals:**

- Eine verbindliche Informationsarchitektur fuer Projekt-, Betriebs- und Entwicklungsdokumentation definieren.
- Dokumentationsinhalte fuer Setup, API-Contract-Sync, Testen, Deployment und Troubleshooting vereinheitlichen.
- Pflegeverantwortung und Aktualisierungsregeln festlegen, damit Dokumentation dauerhaft aktuell bleibt.
- Dokumentationsanforderungen in den bestehenden OpenSpec- und Delivery-Workflow integrieren.

**Non-Goals:**

- Keine Aenderung fachlicher Anforderungen in den bestaehenden Produkt-Capabilities.
- Keine technische Migration von Backend, Frontend, Datenbank oder Container-Stack.
- Kein neues externes Dokumentationsportal ausserhalb des Repositories.

## Decisions

1. Decision: Dokumentation bleibt versioniert im Repository als "docs-as-code" Ansatz.
Rationale: Aenderungen koennen gemeinsam mit Code reviewed, versioniert und reproduzierbar ausgerollt werden.
Alternativen:
- Externes Wiki als Primarquelle: verworfen, da Versionskopplung zu Code und Release-Stand verloren geht.

2. Decision: Root-Dokumentation dient als zentraler Einstieg mit klaren Deep-Links in Backend-, Frontend- und API-spezifische Dokumente.
Rationale: Reduziert Suchaufwand und verhindert redundante Basiserklaerungen.
Alternativen:
- Mehrere gleichberechtigte Einstiegsdokumente: verworfen, da Ownership und Navigationslogik unklar bleiben.

3. Decision: API-first Ablauf wird als verbindlicher Prozess dokumentiert (OpenAPI aktualisieren, Client generieren, Contract-Sync pruefen).
Rationale: Verhindert Drift zwischen Backend-Contract und Frontend-Client.
Alternativen:
- Implizites Wissen im Team belassen: verworfen, da hohes Risiko fuer inkonsistente Aenderungen.

4. Decision: Betriebsdokumentation wird um standardisierte Runbooks fuer lokale Entwicklung, Container-Deployment und Stoerfallbehandlung erweitert.
Rationale: Erhoeht Betriebssicherheit und verkuerzt Wiederherstellungszeiten.
Alternativen:
- Nur Minimal-Setup dokumentieren: verworfen, da produktionsnahe Fehlerpfade dann unzureichend abgedeckt sind.

5. Decision: Dokumentationsqualitaet wird als Delivery-Kriterium verankert (DoD-Checkliste pro Aenderung, inkl. betroffener Doku-Pfade).
Rationale: Dokumentation bleibt nur aktuell, wenn sie Teil der normalen Lieferpraxis ist.
Alternativen:
- Ad-hoc Aktualisierung nach Bedarf: verworfen, da dies erfahrungsgemaess zu veralteten Inhalten fuehrt.

6. Decision: Es werden keine Datenmodell- oder API-Verhaltensmigrationen eingefuehrt; Aenderungen sind inhaltlich-strukturell.
Rationale: Scope bleibt auf Dokumentationsgovernance fokussiert und rolloutarm.
Alternativen:
- Gleichzeitige technische Bereinigung im selben Change: verworfen, um Risiken und Review-Aufwand zu begrenzen.

## Risks / Trade-offs

- [Risk] Dokumentation altert trotz initialer Konsolidierung.
  Mitigation: Ownership je Dokumentbereich benennen und Doku-Checks in Tasks/PR-Prozess verankern.

- [Risk] Hoeherer kurzfristiger Aufwand fuer Teams bei Aenderungen mit grosser Doku-Reichweite.
  Mitigation: Klare Templates und "minimum required updates" pro Change definieren.

- [Risk] Ueberschneidungen zwischen README-Inhalten erzeugen erneut Redundanz.
  Mitigation: Root als Index, fachspezifische Details nur in den jeweiligen Teil-READMEs.

- [Trade-off] Mehr Prozessdisziplin kann initial als Reibung wahrgenommen werden.
  Mitigation: Checkliste schlank halten und auf releasekritische Informationen fokussieren.

## Migration Plan

1. Dokumentationsinventur der bestehenden Dateien und Zuordnung zu Zielbereichen (Produkt, Architektur, API, Betrieb, Contribution).
2. Zielstruktur und Link-Navigation in zentralen Einstiegsdokumenten herstellen.
3. Fehlende Kerninhalte (Runbooks, API-Workflow, Contribution-Regeln) erstellen oder konsolidieren.
4. Dokumentations-DoD fuer Aenderungen einfuehren und in Teamprozess kommunizieren.
5. Verifikation ueber vorhandene Build/Test/Contract-Sync Ablaeufe und manuelle Doku-Checkliste durchfuehren.

Rollback:

- Bei Bedarf koennen einzelne Dokumente auf letzten stabilen Git-Stand zurueckgesetzt werden.
- Da keine Laufzeitmigration erfolgt, ist kein Daten- oder API-Rollback erforderlich.

## Open Questions

- Soll mittelfristig ein automatisierter Markdown-Link-Check verpflichtend in CI aufgenommen werden?
- Welche Rolle verantwortet die finale Freigabe von Betriebs-Runbooks vor Release?
- Sollen deutsch- und englischsprachige Fassungen parallel gepflegt werden oder bleibt es bei einer Hauptsprache?