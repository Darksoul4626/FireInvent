import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { InventoryItemForm } from "@/components/inventory-item-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getInventoryCategories, getInventoryItem } from "@/lib/api/fireinvent-api";

export const dynamic = "force-dynamic";

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

    const categories = await getInventoryCategories();
    const hasInitialCategory = categories.some((category) => category.name === item.category);
    const categoryOptions = hasInitialCategory
        ? categories
        : [{ id: "legacy", name: item.category }, ...categories];

    return (
        <section className="grid max-w-3xl gap-4">
            <div>
                <Button asChild variant="secondary" size="sm">
                    <Link href={`/inventory/${id}`}>
                        <ArrowLeft className="h-4 w-4" />
                        Zurueck zur Detailansicht
                    </Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Gegenstand bearbeiten</CardTitle>
                    <CardDescription>Stammdaten und Menge aktualisieren.</CardDescription>
                </CardHeader>
                <CardContent>
                    <InventoryItemForm
                        mode="edit"
                        itemId={id}
                        categoryOptions={categoryOptions.map((category) => ({
                            id: category.id,
                            name: category.name
                        }))}
                        initialValues={{
                            inventoryCode: item.inventoryCode,
                            name: item.name,
                            category: item.category,
                            condition: item.condition,
                            location: item.location,
                            totalQuantity: item.totalQuantity
                        }}
                    />
                </CardContent>
            </Card>
        </section>
    );
}
