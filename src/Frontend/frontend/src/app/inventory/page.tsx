import Link from "next/link";
import type { CSSProperties } from "react";
import { buildInventoryRows } from "@/app/inventory/build-rows";
import { getInventoryItems, getRentalBookings } from "@/lib/api/fireinvent-api";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
    const now = new Date();
    const [items, rentals] = await Promise.all([getInventoryItems(), getRentalBookings()]);
    const rows = buildInventoryRows(now, items, rentals);

    return (
        <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
            <h1 style={{ marginBottom: 6 }}>Inventar</h1>
            <p style={{ marginTop: 0, color: "#4b5563" }}>
                Bestand, aktuell vermietete Menge und verfuegbare Menge je Gegenstand.
            </p>
            <p>
                <Link href="/inventory/new">Neuen Gegenstand anlegen</Link>
            </p>

            <div style={{ overflowX: "auto" }}>
                <table data-testid="inventory-table" style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                        <tr style={{ background: "#f3f4f6" }}>
                            <th style={cellHeader}>Code</th>
                            <th style={cellHeader}>Name</th>
                            <th style={cellHeader}>Kategorie</th>
                            <th style={cellHeader}>Zustand</th>
                            <th style={cellHeader}>Ort</th>
                            <th style={cellHeader}>Gesamt</th>
                            <th style={cellHeader}>Vermietet</th>
                            <th style={cellHeader}>Verfuegbar</th>
                            <th style={cellHeader}>Details</th>
                            <th style={cellHeader}>Bearbeiten</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.id} data-testid={`inventory-row-${row.id}`}>
                                <td style={cell}>{row.code}</td>
                                <td style={cell}>{row.name}</td>
                                <td style={cell}>{row.category}</td>
                                <td style={cell}>{row.condition}</td>
                                <td style={cell}>{row.location}</td>
                                <td data-testid={`inventory-row-total-${row.id}`} style={cell}>{row.total}</td>
                                <td data-testid={`inventory-row-rented-${row.id}`} style={cell}>{row.rented}</td>
                                <td data-testid={`inventory-row-available-${row.id}`} style={cell}>{row.available}</td>
                                <td style={cell}>
                                    <Link href={`/inventory/${row.id}`}>oeffnen</Link>
                                </td>
                                <td style={cell}>
                                    <Link href={`/inventory/${row.id}/edit`}>bearbeiten</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}

const cellHeader: CSSProperties = {
    textAlign: "left",
    padding: "10px 8px",
    borderBottom: "1px solid #d1d5db",
    fontWeight: 600
};

const cell: CSSProperties = {
    padding: "10px 8px",
    borderBottom: "1px solid #e5e7eb"
};
