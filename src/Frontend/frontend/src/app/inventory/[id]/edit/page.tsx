import Link from "next/link";
import { notFound } from "next/navigation";
import { InventoryItemForm } from "@/components/inventory-item-form";
import { getInventoryItem } from "@/lib/api/fireinvent-api";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function EditInventoryItemPage({ params }: Props) {
    const { id } = await params;

    let item;
    try {
        item = await getInventoryItem(id);
    } catch {
        notFound();
    }

    return (
        <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui", maxWidth: 860 }}>
            <p>
                <Link href={`/inventory/${id}`}>Zurueck zur Detailansicht</Link>
            </p>
            <h1>Gegenstand bearbeiten</h1>
            <InventoryItemForm
                mode="edit"
                itemId={id}
                initialValues={{
                    inventoryCode: item.inventoryCode,
                    name: item.name,
                    category: item.category,
                    condition: item.condition,
                    location: item.location,
                    totalQuantity: item.totalQuantity
                }}
            />
        </main>
    );
}
