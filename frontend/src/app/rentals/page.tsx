import Link from "next/link";
import { Plus } from "lucide-react";
import { RentalOverviewTable } from "@/components/rental-overview-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function RentalsPage() {
    return (
        <section className="grid gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="grid gap-1">
                    <h1 className="text-2xl font-bold">Vermietungen</h1>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Anlegen, bearbeiten und Lifecycle-Status verwalten.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/rentals/new">
                        <Plus className="h-4 w-4" />
                        Neue Vermietung anlegen
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Vermietungsuebersicht</CardTitle>
                    <CardDescription>Serverseitige Filter und Paging mit URL-Status, Sortierung pro Tabelle lokal.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RentalOverviewTable />
                </CardContent>
            </Card>
        </section>
    );
}

