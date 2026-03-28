import Link from "next/link";
import { notFound } from "next/navigation";
import { RentalBookingForm } from "@/components/rental-booking-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getInventoryItems, getRentalBooking } from "@/lib/api/fireinvent-api";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ id: string }>;
};

function toLocalInput(isoString: string): string {
    const date = new Date(isoString);
    return date.toISOString().slice(0, 10);
}

export default async function EditRentalPage({ params }: Props) {
    const { id } = await params;

    let rental;
    try {
        rental = await getRentalBooking(id);
    } catch {
        notFound();
    }

    const items = await getInventoryItems();

    return (
        <section className="grid max-w-3xl gap-4">
            <p className="m-0">
                <Link className="text-red-700 hover:underline dark:text-red-400" href="/rentals">
                    Zurueck zur Vermietungsliste
                </Link>
            </p>
            <Card>
                <CardHeader>
                    <CardTitle>Vermietung bearbeiten</CardTitle>
                    <CardDescription>Zeitraum oder Menge der Buchung aktualisieren.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RentalBookingForm
                        mode="edit"
                        rentalId={id}
                        itemOptions={items.map((item) => ({
                            id: item.id,
                            name: item.name,
                            inventoryCode: item.inventoryCode,
                            totalQuantity: item.totalQuantity
                        }))}
                        initialValues={{
                            itemId: rental.itemId,
                            startDate: toLocalInput(rental.startDate),
                            endDate: toLocalInput(rental.endDate),
                            quantity: rental.quantity
                        }}
                    />
                </CardContent>
            </Card>
        </section>
    );
}
