import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { RentalStatusActions } from "@/components/rental-status-actions";
import { ActionButtonGroup } from "@/components/ui/action-button-group";
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
                            const lineLabels = rental.lines.map((line) => {
                                const item = itemMap.get(line.itemId);
                                const label = item ? `${item.inventoryCode} - ${item.name}` : line.itemId;
                                return `${label} x${line.quantity}`;
                            });
                            const totalQuantity = rental.lines.reduce((sum, line) => sum + line.quantity, 0);
                            return (
                                <article key={rental.id} className="fi-mobile-list-card grid gap-2" data-testid={`rental-mobile-card-${rental.id}`}>
                                    <h3 data-testid={`rental-row-item-${rental.id}`} className="text-sm font-semibold">
                                        {lineLabels.join(" | ")}
                                    </h3>
                                    <p className="text-xs text-slate-600 dark:text-slate-300">
                                        {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                                    </p>
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm">Menge gesamt: {totalQuantity}</p>
                                        <Badge
                                            data-testid={`rental-row-status-${rental.id}`}
                                            variant={rental.status === "Canceled" ? "outline" : "secondary"}
                                            className={getStatusBadgeClassName(rental.status)}
                                        >
                                            {rental.status}
                                        </Badge>
                                    </div>
                                    {rental.borrowerName ? (
                                        <p className="text-xs text-slate-600 dark:text-slate-300">Leiher: {rental.borrowerName}</p>
                                    ) : null}
                                    <div className="grid gap-1">
                                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Aktionen</p>
                                        <ActionButtonGroup data-testid={`rental-row-actions-${rental.id}`}>
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/rentals/${rental.id}/edit`}>
                                                    <Pencil className="h-4 w-4" />
                                                    bearbeiten
                                                </Link>
                                            </Button>
                                            <RentalStatusActions rentalId={rental.id} status={rental.status} />
                                        </ActionButtonGroup>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    <div className="hidden xl:block">
                        <Table data-testid="rentals-table" className="min-w-184 lg:min-w-4xl">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Gegenstand</TableHead>
                                    <TableHead>Zeitraum</TableHead>
                                    <TableHead>Leiher</TableHead>
                                    <TableHead>Menge</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Aktionen</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rentals.map((rental) => {
                                    const lineLabels = rental.lines.map((line) => {
                                        const item = itemMap.get(line.itemId);
                                        const label = item ? `${item.inventoryCode} - ${item.name}` : line.itemId;
                                        return `${label} x${line.quantity}`;
                                    });
                                    const totalQuantity = rental.lines.reduce((sum, line) => sum + line.quantity, 0);
                                    return (
                                        <TableRow key={rental.id} data-testid={`rental-row-${rental.id}`}>
                                            <TableCell data-testid={`rental-row-item-${rental.id}`}>
                                                {lineLabels.join(" | ")}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                                            </TableCell>
                                            <TableCell>{rental.borrowerName ?? "-"}</TableCell>
                                            <TableCell>{totalQuantity}</TableCell>
                                            <TableCell data-testid={`rental-row-status-${rental.id}`}>
                                                <Badge
                                                    variant={rental.status === "Canceled" ? "outline" : "secondary"}
                                                    className={getStatusBadgeClassName(rental.status)}
                                                >
                                                    {rental.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <ActionButtonGroup data-testid={`rental-row-actions-${rental.id}`}>
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link href={`/rentals/${rental.id}/edit`}>
                                                            <Pencil className="h-4 w-4" />
                                                            bearbeiten
                                                        </Link>
                                                    </Button>
                                                    <RentalStatusActions rentalId={rental.id} status={rental.status} />
                                                </ActionButtonGroup>
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

function getStatusBadgeClassName(status: string): string | undefined {
    if (status === "Returned") {
        return "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200";
    }

    if (status === "Completed") {
        return "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200";
    }

    return undefined;
}

function formatDate(input: string): string {
    return new Date(input).toLocaleString("de-DE", {
        dateStyle: "short",
        timeStyle: "short"
    });
}

