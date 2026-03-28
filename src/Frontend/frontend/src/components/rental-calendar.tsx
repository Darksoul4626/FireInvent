"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const denseThreshold = 30;

type CalendarRental = {
    id: string;
    itemId: string;
    itemLabel: string;
    startDate: string;
    endDate: string;
    quantity: number;
    status: "Planned" | "Active";
    isConflict?: boolean;
};

type ItemOption = {
    id: string;
    label: string;
};

type Props = {
    rentals: CalendarRental[];
    itemOptions: ItemOption[];
    selectedItemId?: string;
};

const statusColor: Record<CalendarRental["status"], string> = {
    Planned: "#2563eb",
    Active: "#059669"
};

const conflictColor = "#dc2626";

export function RentalCalendar({ rentals, itemOptions, selectedItemId }: Readonly<Props>) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const selectedView = searchParams.get("view") === "table" ? "table" : "calendar";
    const hasExplicitView = searchParams.has("view");

    const filteredRentals = selectedItemId
        ? rentals.filter((rental) => rental.itemId === selectedItemId)
        : rentals;

    const isDense = filteredRentals.length >= denseThreshold;
    const effectiveView = !hasExplicitView && isDense ? "table" : selectedView;
    const [isMobile, setIsMobile] = useState(false);
    const resolvedView = isMobile ? "calendar" : effectiveView;
    const viewLabel = resolvedView === "calendar" ? "Kalender" : "Tabelle";

    const viewSummary = isDense && !hasExplicitView
        ? `Dichter Zeitraum erkannt (${filteredRentals.length} Eintraege), Tabellenansicht als Fallback aktiv.`
        : `Ansicht: ${viewLabel}`;

    useEffect(() => {
        if (typeof globalThis.matchMedia !== "function") {
            return;
        }

        const query = globalThis.matchMedia("(max-width: 767px)");

        const update = () => {
            setIsMobile(query.matches);
        };

        update();
        query.addEventListener("change", update);

        return () => {
            query.removeEventListener("change", update);
        };
    }, []);

    const visibleEvents = filteredRentals.map((rental) => ({
        id: rental.id,
        title: `${rental.itemLabel} (x${rental.quantity})`,
        start: rental.startDate,
        end: rental.endDate,
        backgroundColor: rental.isConflict ? conflictColor : statusColor[rental.status],
        borderColor: rental.isConflict ? conflictColor : statusColor[rental.status],
        extendedProps: {
            status: rental.status,
            quantity: rental.quantity,
            isConflict: Boolean(rental.isConflict)
        }
    }));

    const tableRows = [...filteredRentals].sort((a, b) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    function setSearchParam(key: string, value?: string) {
        const next = new URLSearchParams(searchParams.toString());
        if (value && value.length > 0) {
            next.set(key, value);
        } else {
            next.delete(key);
        }

        const query = next.toString();
        router.push(query ? `${pathname}?${query}` : pathname);
    }

    function onFilterChange(itemId: string) {
        setSearchParam("itemId", itemId || undefined);
    }

    function onViewChange(view: "calendar" | "table") {
        setSearchParam("view", view);
    }

    return (
        <section data-testid="rental-calendar-root" className="grid gap-4">
            <div className="flex flex-wrap items-end gap-3">
                <label className="grid min-w-60 max-w-105 gap-2 text-sm font-semibold">
                    Gegenstand filtern
                    <Select
                        data-testid="calendar-item-filter"
                        value={selectedItemId ?? ""}
                        onChange={(event) => onFilterChange(event.target.value)}
                    >
                        <option value="">Alle Gegenstaende</option>
                        {itemOptions.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.label}
                            </option>
                        ))}
                    </Select>
                </label>

                <div className="flex gap-2">
                    <Button
                        data-testid="calendar-view-calendar"
                        type="button"
                        onClick={() => onViewChange("calendar")}
                        variant={effectiveView === "calendar" ? "default" : "outline"}
                    >
                        Kalender
                    </Button>
                    <Button
                        data-testid="calendar-view-table"
                        type="button"
                        onClick={() => onViewChange("table")}
                        variant={effectiveView === "table" ? "default" : "outline"}
                        className="hidden sm:inline-flex"
                    >
                        Tabelle
                    </Button>
                </div>
            </div>

            <label data-testid="calendar-view-summary" className="grid max-w-120 gap-1 text-sm font-semibold">
                {viewSummary}
            </label>

            <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="secondary" className="fi-status-planned">Planned: geplant</Badge>
                <Badge variant="secondary" className="fi-status-active">Active: aktiv ausgeliehen</Badge>
                <Badge variant="secondary" className="fi-status-conflict">Conflict: ueberbucht</Badge>
            </div>

            {resolvedView === "calendar" ? (
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay"
                    }}
                    events={visibleEvents}
                    height="auto"
                    eventTimeFormat={{
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false
                    }}
                />
            ) : (
                <>
                    <div className="grid gap-2 sm:hidden">
                        {tableRows.map((rental) => (
                            <article key={rental.id} className="fi-mobile-list-card grid gap-1" data-testid={`calendar-mobile-row-${rental.id}`}>
                                <h3 className="text-sm font-semibold">{rental.itemLabel}</h3>
                                <p className="text-xs text-slate-600 dark:text-slate-300">
                                    {formatDateTime(rental.startDate)} - {formatDateTime(rental.endDate)}
                                </p>
                                <div className="flex items-center justify-between text-xs">
                                    <span>Menge: {rental.quantity}</span>
                                    <span>{rental.status}</span>
                                </div>
                                <p className="text-xs font-medium">Konflikt: {rental.isConflict ? "Ja" : "Nein"}</p>
                            </article>
                        ))}
                    </div>

                    <div className="hidden sm:block">
                        <Table data-testid="calendar-table" className="min-w-[48rem] lg:min-w-[54rem]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Gegenstand</TableHead>
                                    <TableHead>Start</TableHead>
                                    <TableHead>Ende</TableHead>
                                    <TableHead>Menge</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Konflikt</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tableRows.map((rental) => (
                                    <TableRow
                                        key={rental.id}
                                        data-testid={`calendar-table-row-${rental.id}`}
                                        className={rental.isConflict ? "bg-red-50 dark:bg-red-950/40" : undefined}
                                    >
                                        <TableCell>{rental.itemLabel}</TableCell>
                                        <TableCell>{formatDateTime(rental.startDate)}</TableCell>
                                        <TableCell>{formatDateTime(rental.endDate)}</TableCell>
                                        <TableCell>{rental.quantity}</TableCell>
                                        <TableCell>{rental.status}</TableCell>
                                        <TableCell>{rental.isConflict ? "Ja" : "Nein"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </>
            )}

            <p data-testid="calendar-visible-count" className="m-0 text-sm text-slate-600 dark:text-slate-300">
                {selectedItemId
                    ? `Zeige ${visibleEvents.length} Termin(e) fuer den ausgewaehlten Gegenstand.`
                    : `Zeige ${visibleEvents.length} Termin(e) fuer alle Gegenstaende.`}
            </p>

            <p className="m-0 text-xs text-red-700 dark:text-red-400">
                Rot markierte Eintraege befinden sich in ueberbuchten Zeitraeumen.
            </p>
        </section>
    );
}

function formatDateTime(value: string): string {
    return new Date(value).toLocaleString("de-DE", {
        dateStyle: "short",
        timeStyle: "short"
    });
}
