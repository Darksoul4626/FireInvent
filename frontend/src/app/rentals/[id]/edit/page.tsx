import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { RentalBookingForm } from "@/components/rental-booking-form";
import { Button } from "@/components/ui/button";
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
                            borrowerName: rental.borrowerName ?? "",
                            startDate: toLocalInput(rental.startDate),
                            endDate: toLocalInput(rental.endDate),
                            status: rental.status,
                            lines: rental.lines.map((line) => ({
                                itemId: line.itemId,
                                quantity: line.quantity
                            }))
                        }}
                    />
                </CardContent>
            </Card>
        </section>
    );
}
