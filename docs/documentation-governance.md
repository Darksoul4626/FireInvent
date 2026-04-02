# Documentation Governance

## Purpose

Dieses Dokument definiert die verbindliche Dokumentationsstruktur, Ownership und Qualitaetskriterien fuer FireInvent.

## Documentation Inventory and Target Mapping

| Datei | Zielbereich | Status | Autoritative Quelle |
| --- | --- | --- | --- |
| `README.md` | Projektueberblick und Navigation | aktiv | ja |
| `backend/README.md` | Backend Setup und Runtime | aktiv | ja |
| `frontend/README.md` | Frontend Setup und API-Client-Nutzung | aktiv | ja |
| `shared/api-contract.md` | API-first Workflow und Contract-Regeln | aktiv | ja |
| `docs/operations-runbook.md` | Deployment, Health Checks, Recovery | neu | ja |
| `docs/contributing.md` | OpenSpec-Workflow und Beitragendenregeln | neu | ja |
| `openspec/changes/*` | Change-spezifische Artefakte | aktiv | change-spezifisch |

## Authoritative Entry Points and Cross-Link Strategy

1. `README.md` ist der einzige primare Einstiegspunkt.
2. Themen mit wiederkehrender Nutzung haben genau eine autoritative Quelle:
   - API-first Ablauf: `shared/api-contract.md`
   - Deployment/Recovery: `docs/operations-runbook.md`
   - Beitragendenprozess: `docs/contributing.md`
3. Sekundaere Dokumente verlinken auf die autoritative Quelle und duplizieren keine normativen Schritte.
4. Bei Konflikten zwischen Dokumenten gilt immer die autoritative Quelle.

## Ownership Matrix

| Bereich | Primare Owner-Rolle | Backup-Rolle | Review-Pflicht bei Aenderung |
| --- | --- | --- | --- |
| Projekt-Navigation (`README.md`) | Tech Lead | Maintainer | ja |
| Backend-Dokumentation | Backend Maintainer | Tech Lead | ja |
| Frontend-Dokumentation | Frontend Maintainer | Tech Lead | ja |
| API-Contract (`shared/api-contract.md`) | API Owner | Backend Maintainer | ja |
| Operations Runbook | Ops/Deployment Owner | Backend Maintainer | ja |
| Contribution Guide | Tech Lead | Project Maintainer | ja |

## Documentation Definition of Done (DoD)

Ein Change ist nur dann abgeschlossen, wenn alle zutreffenden Punkte erfuellt sind:

- [ ] Betroffene autoritative Dokumente wurden aktualisiert.
- [ ] Neue Dokumente sind von `README.md` aus verlinkt.
- [ ] Doppelte Anleitungen wurden durch Verweise auf autoritative Quellen ersetzt.
- [ ] API-Aenderungen folgen dem Ablauf in `shared/api-contract.md`.
- [ ] Deployment-/Betriebsaenderungen sind im Runbook dokumentiert.
- [ ] Contribution-Auswirkungen (Workflow, Tests, OpenSpec) sind in `docs/contributing.md` reflektiert.

## Freshness Review Criteria

Jeder PR mit Workflow-, Betriebs- oder API-Auswirkung MUSS eines enthalten:

1. Dokumentationsupdate in den betroffenen autoritativen Dateien.
2. Oder explizite Begruendung "No documentation impact" mit kurzer Beweisfuehrung.

Reviewende pruefen mindestens:

- Konsistenz der Links zu autoritativen Quellen
- Korrekte Kommando-Reihenfolge (insbesondere API-first)
- Uebereinstimmung mit aktuellen Skriptnamen und Pfaden
- Fehlende oder veraltete Recovery-Hinweise