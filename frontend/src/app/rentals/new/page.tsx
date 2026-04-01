import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RentalBookingForm } from "@/components/rental-booking-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getInventoryItems } from "@/lib/api/fireinvent-api";

export const dynamic = "force-dynamic";

export default async function NewRentalPage() {
    const items = await getInventoryItems();

    return (
        <section className="grid max-w-3xl gap-4">
            <div>
                <Button asChild variant="secondary" size="sm">
                    <Link href="/rentals">
                        <ArrowLeft className="h-4 w-4" />
                        Zurueck zur Vermietungsliste
                    </Link>
                </Button>
            </div>
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
