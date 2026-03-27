# Shared API Contract

## Contract Conventions

- Backend (.NET 10 + Swagger/OpenAPI) ist Eigentumer der API-Spezifikation.
- Frontend (Next.JS) konsumiert API-Endpunkte ausschliesslich ueber generierten Client.
- Generierter Client wird unter `frontend/src/lib/api/generated/` abgelegt.
- Bei jeder API-Aenderung werden OpenAPI und generierter Client gemeinsam aktualisiert.
- Contract-Checks in CI stellen sicher, dass kein Drift zwischen API und Client entsteht.

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
