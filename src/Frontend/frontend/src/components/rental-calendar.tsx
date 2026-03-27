"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CSSProperties } from "react";

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

export function RentalCalendar({ rentals, itemOptions, selectedItemId }: Props) {
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
        <section data-testid="rental-calendar-root" style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "end" }}>
                <label style={{ display: "grid", gap: 6, minWidth: 260, maxWidth: 420, fontWeight: 600 }}>
                    Gegenstand filtern
                    <select
                        data-testid="calendar-item-filter"
                        value={selectedItemId ?? ""}
                        onChange={(event) => onFilterChange(event.target.value)}
                        style={{
                            border: "1px solid #d1d5db",
                            borderRadius: 6,
                            padding: "8px 10px",
                            font: "inherit"
                        }}
                    >
                        <option value="">Alle Gegenstaende</option>
                        {itemOptions.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                </label>

                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        data-testid="calendar-view-calendar"
                        type="button"
                        onClick={() => onViewChange("calendar")}
                        style={effectiveView === "calendar" ? activeToggleButton : toggleButton}
                    >
                        Kalender
                    </button>
                    <button
                        data-testid="calendar-view-table"
                        type="button"
                        onClick={() => onViewChange("table")}
                        style={effectiveView === "table" ? activeToggleButton : toggleButton}
                    >
                        Tabelle
                    </button>
                </div>
            </div>

            <label data-testid="calendar-view-summary" style={{ display: "grid", gap: 6, maxWidth: 420, fontWeight: 600 }}>
                {isDense && !hasExplicitView
                    ? `Dichter Zeitraum erkannt (${filteredRentals.length} Eintraege), Tabellenansicht als Fallback aktiv.`
                    : `Ansicht: ${effectiveView === "calendar" ? "Kalender" : "Tabelle"}`}
            </label>

            <div style={{ display: "flex", gap: 16, fontSize: 14, color: "#374151" }}>
                <span>
                    <strong style={{ color: statusColor.Planned }}>Planned</strong>: geplant
                </span>
                <span>
                    <strong style={{ color: statusColor.Active }}>Active</strong>: aktiv ausgeliehen
                </span>
                <span>
                    <strong style={{ color: conflictColor }}>Conflict</strong>: ueberbucht
                </span>
            </div>

            {effectiveView === "calendar" ? (
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
                <div style={{ overflowX: "auto" }}>
                    <table data-testid="calendar-table" style={{ borderCollapse: "collapse", width: "100%", minWidth: 820 }}>
                        <thead>
                            <tr style={{ background: "#f3f4f6" }}>
                                <th style={tableHeader}>Gegenstand</th>
                                <th style={tableHeader}>Start</th>
                                <th style={tableHeader}>Ende</th>
                                <th style={tableHeader}>Menge</th>
                                <th style={tableHeader}>Status</th>
                                <th style={tableHeader}>Konflikt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows.map((rental) => (
                                <tr
                                    key={rental.id}
                                    data-testid={`calendar-table-row-${rental.id}`}
                                    style={rental.isConflict ? conflictRowStyle : undefined}
                                >
                                    <td style={tableCell}>{rental.itemLabel}</td>
                                    <td style={tableCell}>{formatDateTime(rental.startDate)}</td>
                                    <td style={tableCell}>{formatDateTime(rental.endDate)}</td>
                                    <td style={tableCell}>{rental.quantity}</td>
                                    <td style={tableCell}>{rental.status}</td>
                                    <td style={tableCell}>{rental.isConflict ? "Ja" : "Nein"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <p data-testid="calendar-visible-count" style={{ margin: 0, color: "#4b5563", fontSize: 14 }}>
                {selectedItemId
                    ? `Zeige ${visibleEvents.length} Termin(e) fuer den ausgewaehlten Gegenstand.`
                    : `Zeige ${visibleEvents.length} Termin(e) fuer alle Gegenstaende.`}
            </p>

            <p style={{ margin: 0, color: conflictColor, fontSize: 13 }}>
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

const toggleButton: CSSProperties = {
    border: "1px solid #d1d5db",
    borderRadius: 6,
    padding: "8px 12px",
    background: "#ffffff",
    cursor: "pointer",
    fontWeight: 600
};

const activeToggleButton: CSSProperties = {
    ...toggleButton,
    borderColor: "#111827",
    background: "#111827",
    color: "#ffffff"
};

const tableHeader: CSSProperties = {
    textAlign: "left",
    padding: "10px 8px",
    borderBottom: "1px solid #d1d5db",
    fontWeight: 600
};

const tableCell: CSSProperties = {
    padding: "10px 8px",
    borderBottom: "1px solid #e5e7eb",
    verticalAlign: "top"
};

const conflictRowStyle: CSSProperties = {
    background: "#fef2f2"
};
