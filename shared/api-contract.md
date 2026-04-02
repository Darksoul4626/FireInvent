# Shared API Contract

## Authoritative Scope

Dieses Dokument ist die autoritative Quelle fuer den API-first Workflow in FireInvent.

Weitere Einstiege:

- Projekt-Navigation: [../README.md](../README.md)
- Backend Runtime/OpenAPI Export: [../backend/README.md](../backend/README.md)
- Frontend Client-Nutzung: [../frontend/README.md](../frontend/README.md)

## Contract Conventions

- Backend (.NET 10 + Swagger/OpenAPI) ist Eigentuemer der API-Spezifikation.
- Frontend (Next.js) konsumiert API-Endpunkte ausschliesslich ueber generierten Client.
- Generierter Client liegt unter `frontend/src/lib/api/generated/`.
- OpenAPI ist die Single Source of Truth fuer API-Requests und Responses.

## Normative API-First Workflow

Bei jeder API-Aenderung MUSS die folgende Reihenfolge eingehalten werden:

1. Backend-Endpunkt/Schema aktualisieren.
2. OpenAPI JSON aktualisieren (`backend/openapi/openapi.v1.json`).
3. Frontend-Client regenerieren (`npm run generate:api-client` in `frontend/`).
4. Contract-Sync validieren (`npm run check:api-contract-sync` in `frontend/`).
5. OpenAPI- und generierte Client-Aenderungen gemeinsam committen.

## Recommended Command Sequence

1. `cd backend`
2. `./scripts/export-openapi.sh`
3. `cd ../frontend`
4. `npm run generate:api-client`
5. `npm run check:api-contract-sync`

## Contract Drift Recovery

Wenn `npm run check:api-contract-sync` fehlschlaegt, gilt der Change als nicht release-ready.

Pflichtschritte zur Behebung:

1. Pruefen, ob `backend/openapi/openapi.v1.json` den aktuellen Backend-Stand repraesentiert.
2. OpenAPI bei Bedarf neu exportieren.
3. Client regenerieren.
4. Diff in `frontend/src/lib/api/generated/` pruefen.
5. Erst nach konsistentem Stand erneut Sync-Check ausfuehren.

## Item

```json
{
  "id": "uuid",
  "inventoryCode": "FW-001",
  "name": "Leiter",
  "category": "Ausrustung",
  "condition": "GOOD",
  "location": "Lager 1",
  "totalQuantity": 10,
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

## Rental

```json
{
  "id": "uuid",
  "itemId": "uuid",
  "startDate": "ISO-8601",
  "endDate": "ISO-8601",
  "quantity": 2,
  "status": "PLANNED|ACTIVE|CANCELED|COMPLETED"
}
```

## Availability Response

```json
{
  "itemId": "uuid",
  "totalQuantity": 10,
  "reservedOrRentedQuantity": 4,
  "availableQuantity": 6
}
```
