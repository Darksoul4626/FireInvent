import Link from "next/link";
import { RentalCalendar } from "@/components/rental-calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getInventoryItems, getRentalBookings } from "@/lib/api/fireinvent-api";
import type { RentalStatus } from "@/lib/api/fireinvent-api";

type VisibleCalendarStatus = Extract<RentalStatus, "Planned" | "Active">;

export const dynamic = "force-dynamic";

function isVisibleCalendarStatus(status: RentalStatus): status is VisibleCalendarStatus {
    return status === "Planned" || status === "Active";
}

type Props = {
    searchParams?: Promise<{ itemId?: string }>;
};

type CalendarRental = {
    id: string;
    rentalId: string;
    itemId: string;
    itemLabel: string;
    startDate: string;
    endDate: string;
    quantity: number;
    status: VisibleCalendarStatus;
};

export default async function RentalCalendarPage({ searchParams }: Readonly<Props>) {
    const resolvedSearchParams = await searchParams;
    const requestedItemId = resolvedSearchParams?.itemId;

    const [items, rentals] = await Promise.all([getInventoryItems(), getRentalBookings()]);
    const itemMap = new Map(items.map((item) => [item.id, `${item.inventoryCode} - ${item.name}`]));
    const selectedItemId = items.some((item) => item.id === requestedItemId) ? requestedItemId : undefined;

    const calendarRentals: CalendarRental[] = rentals
        .filter((rental) => isVisibleCalendarStatus(rental.status))
        .flatMap((rental, rentalIndex) => {
            const status = rental.status as VisibleCalendarStatus;
            return rental.lines.map((line, lineIndex) => ({
                id: `${rental.id}-${line.itemId}-${rentalIndex}-${lineIndex}`,
                rentalId: rental.id,
                itemId: line.itemId,
                itemLabel: itemMap.get(line.itemId) ?? line.itemId,
                startDate: rental.startDate,
                endDate: rental.endDate,
                quantity: line.quantity,
                status
            }));
        });

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
                        Zeigt relevante Vermietungen in den Status Planned und Active fuer ausgewaehlte Zeitraeume.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RentalCalendar rentals={calendarRentals} itemOptions={itemOptions} selectedItemId={selectedItemId} />
                </CardContent>
            </Card>
        </section>
    );
}
