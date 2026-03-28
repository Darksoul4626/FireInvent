import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
    return (
        <section className="grid gap-5">
            <div className="grid gap-2">
                <h1 className="text-3xl font-bold tracking-tight">FireInvent Frontend</h1>
                <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                    Moderne Uebersicht fuer Inventar, Vermietungen und kalenderbasierte Planung im Feuerwehralltag.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Inventar</CardTitle>
                        <CardDescription>Bestand, Zustand und Standorte im Blick behalten.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link className="text-sm font-semibold text-red-700 hover:underline dark:text-red-400" href="/inventory">
                            Zur Inventarliste
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Vermietungen</CardTitle>
                        <CardDescription>Buchungen verwalten und Lifecycle-Aktionen steuern.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link className="text-sm font-semibold text-red-700 hover:underline dark:text-red-400" href="/rentals">
                            Zur Vermietungsliste
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Kalender</CardTitle>
                        <CardDescription>Zeitraeume und Konflikte visuell pruefen.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link className="text-sm font-semibold text-red-700 hover:underline dark:text-red-400" href="/calendar">
                            Zum Vermietungskalender
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
