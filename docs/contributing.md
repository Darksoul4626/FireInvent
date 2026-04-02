# Contributing to FireInvent

## Scope

Dieser Guide beschreibt den verbindlichen Workflow fuer Code-, Test- und Dokumentationsaenderungen.

## Required Flow (OpenSpec)

1. Change vorschlagen: `/opsx:propose <change-name>`
2. Artefakte pruefen: `proposal.md`, `design.md`, `specs/*`, `tasks.md`
3. Implementieren: `/opsx:apply <change-name>`
4. Nach Fertigstellung archivieren: `/opsx:archive <change-name>`

OpenSpec-Artefakte liegen unter `openspec/changes/<change-name>/`.

## Coding Expectations

- Backend: layered architecture respektieren (Controller -> Service -> Repository).
- Frontend: API-Zugriffe ueber generierten Client statt handgeschriebener Request-Wrapper.
- Keine stillen Vertragsaenderungen ohne aktualisierte OpenAPI.
- Kleine, nachvollziehbare Commits mit klarer Scope-Abgrenzung.

## Testing Expectations

Vor Merge mindestens relevante Checks ausfuehren:

- Backend: `dotnet test`
- Frontend Unit: `npm run test:unit`
- Frontend Build: `npm run build`
- API Contract Sync: `npm run check:api-contract-sync`

Bei Aenderungen mit hohem Risiko sind zusaetzliche zielgerichtete Testlaeufe erforderlich.

## API-First Responsibility

Bei API-Aenderungen ist die Reihenfolge aus [../shared/api-contract.md](../shared/api-contract.md) verpflichtend:

1. Backend anpassen
2. OpenAPI exportieren
3. Frontend Client regenerieren
4. Contract Sync pruefen

## Documentation Update Responsibility

Wenn ein Change Setup, Betrieb, API-Workflow, Tests oder Contribution-Regeln beeinflusst, MUESSEN die betroffenen Dokumente im selben Change aktualisiert werden.

Checkliste:

- [ ] Betroffene autoritative Dokumente identifiziert
- [ ] Aktualisierte Inhalte committed
- [ ] Links vom Root-Einstieg geprueft
- [ ] "No documentation impact" begruendet, falls keine Anpassung noetig

Die detaillierten Governance-Regeln stehen in [documentation-governance.md](documentation-governance.md).