import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { getInventoryItem, getItemAvailability } from "@/lib/api/fireinvent-api";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function InventoryDetailPage({ params }: Props) {
    const { id } = await params;

    let item;
    try {
        item = await getInventoryItem(id);
    } catch {
        notFound();
    }

    const availability = await getItemAvailability(id, new Date());

    return (
        <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui", maxWidth: 900 }}>
            <p>
                <Link href="/inventory">Zurueck zur Inventarliste</Link>
            </p>
            <p>
                <Link href={`/inventory/${id}/edit`}>Diesen Gegenstand bearbeiten</Link>
            </p>
            <p>
                <Link href={`/calendar?itemId=${id}`}>Diesen Gegenstand im Kalender anzeigen</Link>
            </p>

            <h1 data-testid="inventory-detail-name" style={{ marginBottom: 6 }}>{item.name}</h1>
            <p style={{ marginTop: 0, color: "#4b5563" }}>Code: {item.inventoryCode}</p>

            <section style={panel}>
                <h2 style={sectionTitle}>Stammdaten</h2>
                <dl style={{ margin: 0 }}>
                    <Row label="Kategorie" value={item.category} />
                    <Row label="Zustand" value={item.condition} />
                    <Row label="Ort" value={item.location} />
                </dl>
            </section>

            <section style={panel}>
                <h2 style={sectionTitle}>Aktueller Bestand</h2>
                <dl style={{ margin: 0 }}>
                    <Row label="Gesamtbestand" value={String(availability.totalQuantity)} valueTestId="availability-total" />
                    <Row
                        label="Vermietet/Reserviert"
                        value={String(availability.reservedOrRentedQuantity)}
                        valueTestId="availability-rented"
                    />
                    <Row label="Verfuegbar" value={String(availability.availableQuantity)} valueTestId="availability-available" />
                </dl>
            </section>
        </main>
    );
}

function Row({ label, value, valueTestId }: { label: string; value: string; valueTestId?: string }) {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 8, padding: "6px 0" }}>
            <dt style={{ color: "#4b5563" }}>{label}</dt>
            <dd data-testid={valueTestId} style={{ margin: 0 }}>
                {value}
            </dd>
        </div>
    );
}

const panel: CSSProperties = {
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 16,
    marginBottom: 14
};

const sectionTitle: CSSProperties = {
    marginTop: 0,
    marginBottom: 10,
    fontSize: 18
};
