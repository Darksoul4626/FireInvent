import Link from "next/link";
import { InventoryItemForm } from "@/components/inventory-item-form";

export default function NewInventoryItemPage() {
    return (
        <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui", maxWidth: 860 }}>
            <p>
                <Link href="/inventory">Zurueck zur Inventarliste</Link>
            </p>
            <h1>Gegenstand anlegen</h1>
            <InventoryItemForm mode="create" />
        </main>
    );
}
