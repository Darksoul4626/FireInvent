import Link from "next/link";
import { RentalBookingForm } from "@/components/rental-booking-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getInventoryItems } from "@/lib/api/fireinvent-api";

export const dynamic = "force-dynamic";

export default async function NewRentalPage() {
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
                    <CardTitle>Vermietung anlegen</CardTitle>
                    <CardDescription>Buchung mit Zeitraum und Menge erfassen.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RentalBookingForm
                        mode="create"
                        itemOptions={items.map((item) => ({
                            id: item.id,
                            name: item.name,
                            inventoryCode: item.inventoryCode,
                            totalQuantity: item.totalQuantity
                        }))}
                    />
                </CardContent>
            </Card>
        </section>
    );
}
