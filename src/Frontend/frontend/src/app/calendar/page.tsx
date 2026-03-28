import Link from "next/link";
import { RentalCalendar } from "@/components/rental-calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getInventoryItems, getRentalBookings } from "@/lib/api/fireinvent-api";
import type { RentalStatus } from "@/lib/api/fireinvent-api";

export const dynamic = "force-dynamic";

function isCalendarStatus(status: RentalStatus): status is "Planned" | "Active" {
    return status === "Planned" || status === "Active";
}

type Props = {
    searchParams?: Promise<{ itemId?: string }>;
};

type CalendarRental = {
    id: string;
    itemId: string;
    itemLabel: string;
    startDate: string;
    endDate: string;
    quantity: number;
    status: "Planned" | "Active";
};

type TimePoint = {
    at: number;
    type: "start" | "end";
    rentalId: string;
    quantity: number;
};

function detectConflictRentalIds(rentals: CalendarRental[], itemTotalQuantity: number): Set<string> {
    const points: TimePoint[] = [];
    for (const rental of rentals) {
        points.push({
            at: new Date(rental.startDate).getTime(),
            type: "start",
            rentalId: rental.id,
            quantity: rental.quantity
        });
        points.push({
            at: new Date(rental.endDate).getTime(),
            type: "end",
            rentalId: rental.id,
            quantity: rental.quantity
        });
    }

    points.sort((a, b) => {
        if (a.at !== b.at) {
            return a.at - b.at;
        }

        if (a.type === b.type) {
            return 0;
        }

        // End first to treat equal timestamps as non-overlapping handover.
        return a.type === "end" ? -1 : 1;
    });

    const activeRentalIds = new Set<string>();
    const quantityByRentalId = new Map<string, number>();
    const conflictRentalIds = new Set<string>();
    let activeTotal = 0;

    for (const point of points) {
        if (point.type === "end") {
            if (activeRentalIds.has(point.rentalId)) {
                activeRentalIds.delete(point.rentalId);
                activeTotal -= quantityByRentalId.get(point.rentalId) ?? point.quantity;
                quantityByRentalId.delete(point.rentalId);
            }
            continue;
        }

        activeRentalIds.add(point.rentalId);
        quantityByRentalId.set(point.rentalId, point.quantity);
        activeTotal += point.quantity;

        if (activeTotal > itemTotalQuantity) {
            for (const rentalId of activeRentalIds) {
                conflictRentalIds.add(rentalId);
            }
        }
    }

    return conflictRentalIds;
}

export default async function RentalCalendarPage({ searchParams }: Props) {
    const resolvedSearchParams = await searchParams;
    const requestedItemId = resolvedSearchParams?.itemId;

    const [items, rentals] = await Promise.all([getInventoryItems(), getRentalBookings()]);
    const itemMap = new Map(items.map((item) => [item.id, `${item.inventoryCode} - ${item.name}`]));
    const itemTotalQuantityMap = new Map(items.map((item) => [item.id, item.totalQuantity]));
    const selectedItemId = items.some((item) => item.id === requestedItemId) ? requestedItemId : undefined;

    const baseCalendarRentals: CalendarRental[] = rentals
        .filter((rental) => isCalendarStatus(rental.status))
        .map((rental) => ({
            id: rental.id,
            itemId: rental.itemId,
            itemLabel: itemMap.get(rental.itemId) ?? rental.itemId,
            startDate: rental.startDate,
            endDate: rental.endDate,
            quantity: rental.quantity,
            status: rental.status as "Planned" | "Active"
        }));

    const conflictIds = new Set<string>();
    const rentalsByItem = new Map<string, CalendarRental[]>();

    for (const rental of baseCalendarRentals) {
        const list = rentalsByItem.get(rental.itemId) ?? [];
        list.push(rental);
        rentalsByItem.set(rental.itemId, list);
    }

    for (const [itemId, groupedRentals] of rentalsByItem) {
        const totalQuantity = itemTotalQuantityMap.get(itemId);
        if (typeof totalQuantity !== "number" || totalQuantity <= 0) {
            continue;
        }

        const detected = detectConflictRentalIds(groupedRentals, totalQuantity);
        for (const id of detected) {
            conflictIds.add(id);
        }
    }

    const calendarRentals = baseCalendarRentals.map((rental) => ({
        ...rental,
        isConflict: conflictIds.has(rental.id)
    }));

    const itemOptions = items.map((item) => ({
        id: item.id,
        label: `${item.inventoryCode} - ${item.name}`
    }));

    return (
        <section className="grid gap-4">
            <p className="m-0">
                <Link className="text-red-700 hover:underline dark:text-red-400" href="/">
                    Zur Startseite
                </Link>
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>Vermietungskalender</CardTitle>
                    <CardDescription>
                        Zeigt geplante und aktive Vermietungen fuer ausgewaehlte Zeitraeume (Monat/Woche/Tag).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RentalCalendar rentals={calendarRentals} itemOptions={itemOptions} selectedItemId={selectedItemId} />
                </CardContent>
            </Card>
        </section>
    );
}
