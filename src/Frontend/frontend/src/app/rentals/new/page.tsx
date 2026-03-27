import Link from "next/link";
import { RentalBookingForm } from "@/components/rental-booking-form";
import { getInventoryItems } from "@/lib/api/fireinvent-api";

export const dynamic = "force-dynamic";

export default async function NewRentalPage() {
    const items = await getInventoryItems();

    return (
        <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui", maxWidth: 860 }}>
            <p>
                <Link href="/rentals">Zurueck zur Vermietungsliste</Link>
            </p>
            <h1>Vermietung anlegen</h1>
            <RentalBookingForm
                mode="create"
                itemOptions={items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    inventoryCode: item.inventoryCode,
                    totalQuantity: item.totalQuantity
                }))}
            />
        </main>
    );
}
