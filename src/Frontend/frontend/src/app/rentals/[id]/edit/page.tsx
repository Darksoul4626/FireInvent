import Link from "next/link";
import { notFound } from "next/navigation";
import { RentalBookingForm } from "@/components/rental-booking-form";
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
        <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui", maxWidth: 860 }}>
            <p>
                <Link href="/rentals">Zurueck zur Vermietungsliste</Link>
            </p>
            <h1>Vermietung bearbeiten</h1>
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
        </main>
    );
}
