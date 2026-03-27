import Link from "next/link";
import { RentalStatusActions } from "@/components/rental-status-actions";
import { getInventoryItems, getRentalBookings } from "@/lib/api/fireinvent-api";

export const dynamic = "force-dynamic";

export default async function RentalsPage() {
    const [rentals, items] = await Promise.all([getRentalBookings(), getInventoryItems()]);
    const itemMap = new Map(items.map((i) => [i.id, i]));

    return (
        <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
            <h1 style={{ marginBottom: 6 }}>Vermietungen</h1>
            <p style={{ marginTop: 0, color: "#4b5563" }}>Anlegen, bearbeiten und Lifecycle-Status verwalten.</p>
            <p>
                <Link href="/rentals/new">Neue Vermietung anlegen</Link>
            </p>

            <div style={{ overflowX: "auto" }}>
                <table data-testid="rentals-table" style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                        <tr style={{ background: "#f3f4f6" }}>
                            <th style={th}>Gegenstand</th>
                            <th style={th}>Zeitraum</th>
                            <th style={th}>Menge</th>
                            <th style={th}>Status</th>
                            <th style={th}>Bearbeiten</th>
                            <th style={th}>Lifecycle</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rentals.map((rental) => {
                            const item = itemMap.get(rental.itemId);
                            return (
                                <tr key={rental.id} data-testid={`rental-row-${rental.id}`}>
                                    <td data-testid={`rental-row-item-${rental.id}`} style={td}>
                                        {item ? `${item.inventoryCode} - ${item.name}` : rental.itemId}
                                    </td>
                                    <td style={td}>
                                        {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                                    </td>
                                    <td style={td}>{rental.quantity}</td>
                                    <td data-testid={`rental-row-status-${rental.id}`} style={td}>{rental.status}</td>
                                    <td style={td}>
                                        <Link href={`/rentals/${rental.id}/edit`}>bearbeiten</Link>
                                    </td>
                                    <td style={td}>
                                        <RentalStatusActions rentalId={rental.id} status={rental.status} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </main>
    );
}

function formatDate(input: string): string {
    return new Date(input).toLocaleString("de-DE", {
        dateStyle: "short",
        timeStyle: "short"
    });
}

const th: React.CSSProperties = {
    textAlign: "left",
    padding: "10px 8px",
    borderBottom: "1px solid #d1d5db",
    fontWeight: 600
};

const td: React.CSSProperties = {
    padding: "10px 8px",
    borderBottom: "1px solid #e5e7eb",
    verticalAlign: "top"
};
