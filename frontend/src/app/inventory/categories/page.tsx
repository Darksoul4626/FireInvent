import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { InventoryCategoryManager } from "@/components/inventory-category-manager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getInventoryCategories } from "@/lib/api/fireinvent-api";

export const dynamic = "force-dynamic";

export default async function InventoryCategoriesPage() {
    const categories = await getInventoryCategories();

    return (
        <section className="grid gap-4">
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
                    <CardTitle>Kategorieverwaltung</CardTitle>
                    <CardDescription>Kategorien anlegen, umbenennen und loeschen, sofern sie nicht verwendet werden.</CardDescription>
                </CardHeader>
                <CardContent>
                    <InventoryCategoryManager initialCategories={categories} />
                </CardContent>
            </Card>
        </section>
    );
}
