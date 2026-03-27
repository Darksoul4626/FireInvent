import type { InventoryItemDto, RentalBookingDto } from "@/lib/api/fireinvent-api";

export type InventoryListRow = {
    id: string;
    code: string;
    name: string;
    category: string;
    condition: string;
    location: string;
    total: number;
    rented: number;
    available: number;
};

export function buildInventoryRows(
    now: Date,
    items: InventoryItemDto[],
    rentals: RentalBookingDto[]
): InventoryListRow[] {
    const rentedByItem = new Map<string, number>();

    for (const rental of rentals) {
        if (rental.status !== "Planned" && rental.status !== "Active") {
            continue;
        }

        const start = new Date(rental.startDate);
        const end = new Date(rental.endDate);
        if (start <= now && now <= end) {
            rentedByItem.set(rental.itemId, (rentedByItem.get(rental.itemId) ?? 0) + rental.quantity);
        }
    }

    return items.map((item) => {
        const rented = rentedByItem.get(item.id) ?? 0;
        const available = Math.max(item.totalQuantity - rented, 0);

        return {
            id: item.id,
            code: item.inventoryCode,
            name: item.name,
            category: item.category,
            condition: item.condition,
            location: item.location,
            total: item.totalQuantity,
            rented,
            available
        };
    });
}