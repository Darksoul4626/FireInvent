import Link from "next/link";
import { InventoryItemForm } from "@/components/inventory-item-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewInventoryItemPage() {
    return (
        <section className="grid max-w-3xl gap-4">
            <p className="m-0">
                <Link className="text-red-700 hover:underline dark:text-red-400" href="/inventory">
                    Zurueck zur Inventarliste
                </Link>
            </p>
            <Card>
                <CardHeader>
                    <CardTitle>Gegenstand anlegen</CardTitle>
                    <CardDescription>Neuen Inventargegenstand mit allen Stammdaten erfassen.</CardDescription>
                </CardHeader>
                <CardContent>
                    <InventoryItemForm mode="create" />
                </CardContent>
            </Card>
        </section>
    );
}
