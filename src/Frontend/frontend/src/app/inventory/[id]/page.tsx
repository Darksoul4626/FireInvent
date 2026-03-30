import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Pencil } from "lucide-react";
import { InventoryItemDeleteAction } from "@/components/inventory-item-delete-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInventoryItem, getItemAvailability } from "@/lib/api/fireinvent-api";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function InventoryDetailPage({ params }: Readonly<Props>) {
    const { id } = await params;

    let item;
    try {
        item = await getInventoryItem(id);
    } catch {
        notFound();
    }

    const availability = await getItemAvailability(id, new Date());

    return (
        <section className="grid max-w-4xl gap-4">
            <div className="flex flex-wrap gap-2">
                <Button asChild variant="secondary" size="sm">
                    <Link href="/inventory">
                        <ArrowLeft className="h-4 w-4" />
                        Zurueck zur Inventarliste
                    </Link>
                </Button>
                <Button asChild size="sm">
                    <Link href={`/inventory/${id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        Diesen Gegenstand bearbeiten
                    </Link>
                </Button>
                <InventoryItemDeleteAction itemId={id} itemName={item.name} redirectPath="/inventory" />
                <Button asChild variant="outline" size="sm">
                    <Link href={`/calendar?itemId=${id}`}>
                        <CalendarDays className="h-4 w-4" />
                        Diesen Gegenstand im Kalender anzeigen
                    </Link>
                </Button>
            </div>

            <div className="grid gap-1">
                <h1 data-testid="inventory-detail-name" className="text-2xl font-bold">{item.name}</h1>
                <p className="text-sm text-slate-600 dark:text-slate-300">Code: {item.inventoryCode}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Stammdaten</CardTitle>
                </CardHeader>
                <CardContent>
                    <dl className="m-0 grid gap-2">
                        <Row label="Kategorie" value={item.category} />
                        <Row label="Zustand" value={item.condition} />
                        <Row label="Ort" value={item.location} />
                    </dl>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Aktueller Bestand</CardTitle>
                </CardHeader>
                <CardContent>
                    <dl className="m-0 grid gap-2">
                        <Row label="Gesamtbestand" value={String(availability.totalQuantity)} valueTestId="availability-total" />
                        <Row
                            label="Vermietet/Reserviert"
                            value={String(availability.reservedOrRentedQuantity)}
                            valueTestId="availability-rented"
                        />
                        <Row label="Verfuegbar" value={String(availability.availableQuantity)} valueTestId="availability-available" />
                    </dl>
                </CardContent>
            </Card>
        </section>
    );
}

function Row({ label, value, valueTestId }: Readonly<{ label: string; value: string; valueTestId?: string }>) {
    return (
        <div className="grid grid-cols-1 gap-1 border-b border-[var(--border)] py-1 sm:grid-cols-[220px_1fr]">
            <dt className="text-sm text-slate-600 dark:text-slate-300">{label}</dt>
            <dd data-testid={valueTestId} className="m-0 font-medium">
                {value}
            </dd>
        </div>
    );
}
