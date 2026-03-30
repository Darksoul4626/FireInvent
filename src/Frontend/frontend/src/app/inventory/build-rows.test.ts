import { buildInventoryRows } from "@/app/inventory/build-rows";

describe("buildInventoryRows", () => {
    it("calculates total/rented/available from active and planned rentals", () => {
        const now = new Date("2026-03-10T12:00:00.000Z");
        const rows = buildInventoryRows(
            now,
            [
                {
                    id: "item-1",
                    inventoryCode: "INV-1",
                    name: "Generator",
                    category: "Power",
                    condition: "Good",
                    location: "Station",
                    totalQuantity: 5,
                    createdAt: now.toISOString(),
                    updatedAt: now.toISOString()
                }
            ],
            [
                {
                    id: "r-1",
                    startDate: "2026-03-10T11:00:00.000Z",
                    endDate: "2026-03-10T13:00:00.000Z",
                    lines: [{ itemId: "item-1", quantity: 2 }],
                    borrowerName: null,
                    status: "Planned",
                    createdAt: now.toISOString(),
                    updatedAt: now.toISOString()
                },
                {
                    id: "r-2",
                    startDate: "2026-03-10T11:30:00.000Z",
                    endDate: "2026-03-10T12:30:00.000Z",
                    lines: [{ itemId: "item-1", quantity: 1 }],
                    borrowerName: null,
                    status: "Active",
                    createdAt: now.toISOString(),
                    updatedAt: now.toISOString()
                },
                {
                    id: "r-3",
                    startDate: "2026-03-10T11:30:00.000Z",
                    endDate: "2026-03-10T12:30:00.000Z",
                    lines: [{ itemId: "item-1", quantity: 99 }],
                    borrowerName: null,
                    status: "Completed",
                    createdAt: now.toISOString(),
                    updatedAt: now.toISOString()
                }
            ]
        );

        expect(rows).toHaveLength(1);
        expect(rows[0].total).toBe(5);
        expect(rows[0].rented).toBe(3);
        expect(rows[0].available).toBe(2);
    });

    it("never returns negative available quantity", () => {
        const now = new Date("2026-03-10T12:00:00.000Z");
        const rows = buildInventoryRows(
            now,
            [
                {
                    id: "item-2",
                    inventoryCode: "INV-2",
                    name: "Pumpe",
                    category: "Water",
                    condition: "Good",
                    location: "Depot",
                    totalQuantity: 2,
                    createdAt: now.toISOString(),
                    updatedAt: now.toISOString()
                }
            ],
            [
                {
                    id: "r-4",
                    startDate: "2026-03-10T11:00:00.000Z",
                    endDate: "2026-03-10T13:00:00.000Z",
                    lines: [{ itemId: "item-2", quantity: 5 }],
                    borrowerName: null,
                    status: "Active",
                    createdAt: now.toISOString(),
                    updatedAt: now.toISOString()
                }
            ]
        );

        expect(rows[0].available).toBe(0);
    });
});
