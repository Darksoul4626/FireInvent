import Link from "next/link";
import { buildInventoryRows } from "@/app/inventory/build-rows";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getInventoryItems, getRentalBookings } from "@/lib/api/fireinvent-api";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
    const now = new Date();
    const [items, rentals] = await Promise.all([getInventoryItems(), getRentalBookings()]);
    const rows = buildInventoryRows(now, items, rentals);

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
                    <Link href="/inventory/new">Neuen Gegenstand anlegen</Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Inventaruebersicht</CardTitle>
                    <CardDescription>Responsiv mit horizontalem Overflow fuer schmale Viewports.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 xl:hidden">
                        {rows.map((row) => (
                            <article key={row.id} className="fi-mobile-list-card grid gap-2" data-testid={`inventory-mobile-card-${row.id}`}>
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-xs text-slate-600 dark:text-slate-300">{row.code}</p>
                                        <h3 className="text-base font-semibold">{row.name}</h3>
                                    </div>
                                    <span className="rounded-full bg-slate-200 px-2 py-1 text-xs dark:bg-slate-700">{row.category}</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{row.condition} · {row.location}</p>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div>
                                        <p className="text-slate-500">Gesamt</p>
                                        <p data-testid={`inventory-row-total-${row.id}`} className="font-semibold">{row.total}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Vermietet</p>
                                        <p data-testid={`inventory-row-rented-${row.id}`} className="font-semibold">{row.rented}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Verfuegbar</p>
                                        <p data-testid={`inventory-row-available-${row.id}`} className="font-semibold">{row.available}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 text-sm">
                                    <Link className="text-red-700 hover:underline dark:text-red-400" href={`/inventory/${row.id}`}>
                                        oeffnen
                                    </Link>
                                    <Link className="text-red-700 hover:underline dark:text-red-400" href={`/inventory/${row.id}/edit`}>
                                        bearbeiten
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="hidden xl:block">
                        <Table data-testid="inventory-table" className="min-w-[44rem] lg:min-w-[52rem]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Kategorie</TableHead>
                                    <TableHead>Zustand</TableHead>
                                    <TableHead>Ort</TableHead>
                                    <TableHead>Gesamt</TableHead>
                                    <TableHead>Vermietet</TableHead>
                                    <TableHead>Verfuegbar</TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead>Bearbeiten</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.id} data-testid={`inventory-row-${row.id}`}>
                                        <TableCell>{row.code}</TableCell>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell>{row.category}</TableCell>
                                        <TableCell>{row.condition}</TableCell>
                                        <TableCell>{row.location}</TableCell>
                                        <TableCell data-testid={`inventory-row-total-${row.id}`}>{row.total}</TableCell>
                                        <TableCell data-testid={`inventory-row-rented-${row.id}`}>{row.rented}</TableCell>
                                        <TableCell data-testid={`inventory-row-available-${row.id}`}>{row.available}</TableCell>
                                        <TableCell>
                                            <Link className="text-red-700 hover:underline dark:text-red-400" href={`/inventory/${row.id}`}>
                                                oeffnen
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                className="text-red-700 hover:underline dark:text-red-400"
                                                href={`/inventory/${row.id}/edit`}
                                            >
                                                bearbeiten
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
