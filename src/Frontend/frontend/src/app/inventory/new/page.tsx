import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { InventoryItemForm } from "@/components/inventory-item-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewInventoryItemPage() {
    return (
        <section className="grid max-w-3xl gap-4">
            <div>
                <Button asChild variant="secondary" size="sm">
                    <Link href="/inventory">
                        <ArrowLeft className="h-4 w-4" />
                        Zurueck zur Inventarliste
                    </Link>
                </Button>
            </div>
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
