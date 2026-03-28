import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { RentalStatusActions } from "@/components/rental-status-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getInventoryItems, getRentalBookings } from "@/lib/api/fireinvent-api";

export const dynamic = "force-dynamic";

export default async function RentalsPage() {
    const [rentals, items] = await Promise.all([getRentalBookings(), getInventoryItems()]);
    const itemMap = new Map(items.map((i) => [i.id, i]));

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
                    <CardDescription>Alle Buchungen inkl. Status und Aktionen.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 xl:hidden">
                        {rentals.map((rental) => {
                            const item = itemMap.get(rental.itemId);
                            return (
                                <article key={rental.id} className="fi-mobile-list-card grid gap-2" data-testid={`rental-mobile-card-${rental.id}`}>
                                    <h3 data-testid={`rental-row-item-${rental.id}`} className="text-sm font-semibold">
                                        {item ? `${item.inventoryCode} - ${item.name}` : rental.itemId}
                                    </h3>
                                    <p className="text-xs text-slate-600 dark:text-slate-300">
                                        {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                                    </p>
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm">Menge: {rental.quantity}</p>
                                        <Badge data-testid={`rental-row-status-${rental.id}`} variant={rental.status === "Canceled" ? "outline" : "secondary"}>
                                            {rental.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/rentals/${rental.id}/edit`}>
                                                <Pencil className="h-4 w-4" />
                                                bearbeiten
                                            </Link>
                                        </Button>
                                        <RentalStatusActions rentalId={rental.id} status={rental.status} />
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    <div className="hidden xl:block">
                        <Table data-testid="rentals-table" className="min-w-[46rem] lg:min-w-[56rem]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Gegenstand</TableHead>
                                    <TableHead>Zeitraum</TableHead>
                                    <TableHead>Menge</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Bearbeiten</TableHead>
                                    <TableHead>Lifecycle</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rentals.map((rental) => {
                                    const item = itemMap.get(rental.itemId);
                                    return (
                                        <TableRow key={rental.id} data-testid={`rental-row-${rental.id}`}>
                                            <TableCell data-testid={`rental-row-item-${rental.id}`}>
                                                {item ? `${item.inventoryCode} - ${item.name}` : rental.itemId}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                                            </TableCell>
                                            <TableCell>{rental.quantity}</TableCell>
                                            <TableCell data-testid={`rental-row-status-${rental.id}`}>
                                                <Badge variant={rental.status === "Canceled" ? "outline" : "secondary"}>{rental.status}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={`/rentals/${rental.id}/edit`}>
                                                        <Pencil className="h-4 w-4" />
                                                        bearbeiten
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                <RentalStatusActions rentalId={rental.id} status={rental.status} />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}

function formatDate(input: string): string {
    return new Date(input).toLocaleString("de-DE", {
        dateStyle: "short",
        timeStyle: "short"
    });
}

