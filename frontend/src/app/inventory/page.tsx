import Link from "next/link";
import { Plus } from "lucide-react";
import { InventoryOverviewTable } from "@/components/inventory-overview-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function InventoryPage() {
    return (
        <section className="grid gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="grid gap-1">
                    <h1 className="text-2xl font-bold">Inventar</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Bestand, aktuell vermietete Menge und verfuegbare Menge je Gegenstand.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/inventory/new">
                        <Plus className="h-4 w-4" />
                        Neuen Gegenstand anlegen
                    </Link>
                </Button>
                <Button asChild variant="outline">
                    <Link href="/inventory/categories">
                        Kategorien verwalten
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Inventaruebersicht</CardTitle>
                    <CardDescription>Serverseitige Filter und Paging mit URL-Status, Sortierung pro Tabelle lokal.</CardDescription>
                </CardHeader>
                <CardContent>
                    <InventoryOverviewTable />
                </CardContent>
            </Card>
        </section>
    );
}
