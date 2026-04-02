"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { type ReadonlyURLSearchParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { RentalStatusActions } from "@/components/rental-status-actions";
import { ActionButtonGroup } from "@/components/ui/action-button-group";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type RentalStatus = "Planned" | "Active" | "Returned" | "Canceled" | "Completed";

type RentalOverviewRow = {
    id: string;
    itemSummary: string;
    startDate: string;
    endDate: string;
    borrowerName: string | null;
    totalQuantity: number;
    status: RentalStatus;
};

type RentalOverviewResponse = {
    items: Array<{
        id: string;
        itemSummary: string;
        startDate: string;
        endDate: string;
        borrowerName: string | null;
        totalQuantity: number | string;
        status: number | string;
    }>;
    page: number | string;
    pageSize: number | string;
    totalCount: number | string;
    totalPages: number | string;
    hasPrevious: boolean;
    hasNext: boolean;
};

const rentalColumns: ColumnDef<RentalOverviewRow, unknown>[] = [
    {
        accessorKey: "itemSummary",
        header: "Gegenstand",
        cell: ({ row }) => <span data-testid={`rental-row-item-${row.original.id}`}>{row.original.itemSummary}</span>
    },
    {
        id: "period",
        accessorFn: (row) => row.startDate,
        header: "Zeitraum",
        cell: ({ row }) => <span>{formatDate(row.original.startDate)} - {formatDate(row.original.endDate)}</span>
    },
    {
        accessorKey: "borrowerName",
        header: "Leiher",
        cell: ({ row }) => row.original.borrowerName ?? "-"
    },
    {
        accessorKey: "totalQuantity",
        header: "Menge"
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <span data-testid={`rental-row-status-${row.original.id}`}>
                <Badge
                    variant={row.original.status === "Canceled" ? "outline" : "secondary"}
                    className={getStatusBadgeClassName(row.original.status)}
                >
                    {row.original.status}
                </Badge>
            </span>
        )
    },
    {
        id: "actions",
        header: "Aktionen",
        enableSorting: false,
        cell: ({ row }) => <RentalActions row={row.original} />
    }
];

export function RentalOverviewTable() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const page = toPositiveNumber(searchParams.get("page"), 1);
    const pageSize = toPositiveNumber(searchParams.get("pageSize"), 20);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "";
    const itemId = searchParams.get("itemId") ?? "";
    const from = searchParams.get("from") ?? "";
    const to = searchParams.get("to") ?? "";

    const [searchInput, setSearchInput] = useState(search);
    const [itemOptions, setItemOptions] = useState<Array<{ id: string; label: string }>>([]);
    const [rows, setRows] = useState<RentalOverviewRow[]>([]);
    const [paging, setPaging] = useState({
        page: 1,
        pageSize: 20,
        totalCount: 0,
        totalPages: 0,
        hasPrevious: false,
        hasNext: false
    });
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        setSearchInput(search);
    }, [search]);

    useEffect(() => {
        const handle = globalThis.setTimeout(() => {
            const normalized = searchInput.trim();
            if (normalized === search) {
                return;
            }

            setQueryParams(router, pathname, searchParams, {
                search: normalized || undefined,
                page: "1"
            });
        }, 300);

        return () => globalThis.clearTimeout(handle);
    }, [pathname, router, search, searchInput, searchParams]);

    useEffect(() => {
        const controller = new AbortController();

        async function loadItemOptions() {
            try {
                const response = await fetch("/api/proxy/items", { signal: controller.signal });
                if (!response.ok) {
                    return;
                }

                const items = (await response.json()) as Array<{
                    id: string;
                    inventoryCode: string;
                    name: string;
                }>;

                setItemOptions(items.map((item) => ({
                    id: item.id,
                    label: `${item.inventoryCode} - ${item.name}`
                })));
            } catch {
                if (!controller.signal.aborted) {
                    setItemOptions([]);
                }
            }
        }

        void loadItemOptions();

        return () => controller.abort();
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        async function loadOverview() {
            setIsLoading(true);
            setErrorMessage(null);

            try {
                const query = new URLSearchParams();
                query.set("page", String(page));
                query.set("pageSize", String(pageSize));

                if (search) {
                    query.set("search", search);
                }
                if (status) {
                    query.set("status", status);
                }
                if (itemId) {
                    query.set("itemId", itemId);
                }
                if (from) {
                    query.set("from", `${from}T00:00:00.000Z`);
                }
                if (to) {
                    query.set("to", `${to}T23:59:59.999Z`);
                }

                query.set("overview", "true");

                const response = await fetch(`/api/proxy/rentals?${query.toString()}`, {
                    signal: controller.signal
                });

                if (!response.ok) {
                    throw new Error("overview_failed");
                }

                const payload = (await response.json()) as RentalOverviewResponse;
                setRows(payload.items.map(mapRentalOverviewRow));
                setPaging({
                    page: toNumber(payload.page),
                    pageSize: toNumber(payload.pageSize),
                    totalCount: toNumber(payload.totalCount),
                    totalPages: toNumber(payload.totalPages),
                    hasPrevious: payload.hasPrevious,
                    hasNext: payload.hasNext
                });
            } catch {
                if (!controller.signal.aborted) {
                    setRows([]);
                    setErrorMessage("Vermietungsuebersicht konnte nicht geladen werden.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        void loadOverview();

        return () => controller.abort();
    }, [from, itemId, page, pageSize, search, status, to]);

    const statusOptions = useMemo(() => ["Planned", "Active", "Returned", "Canceled", "Completed"], []);

    return (
        <section className="grid gap-3">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <label className="grid gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Suche
                    <Input
                        data-testid="rentals-overview-search"
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="Gegenstand oder Leiher"
                    />
                </label>

                <label className="grid gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Status
                    <Select
                        data-testid="rentals-overview-status"
                        value={status}
                        onChange={(event) => {
                            setQueryParams(router, pathname, searchParams, {
                                status: event.target.value || undefined,
                                page: "1"
                            });
                        }}
                    >
                        <option value="">Alle Status</option>
                        {statusOptions.map((value) => (
                            <option key={value} value={value}>{value}</option>
                        ))}
                    </Select>
                </label>

                <label className="grid gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Gegenstand
                    <Select
                        data-testid="rentals-overview-item"
                        value={itemId}
                        onChange={(event) => {
                            setQueryParams(router, pathname, searchParams, {
                                itemId: event.target.value || undefined,
                                page: "1"
                            });
                        }}
                    >
                        <option value="">Alle Gegenstaende</option>
                        {itemOptions.map((item) => (
                            <option key={item.id} value={item.id}>{item.label}</option>
                        ))}
                    </Select>
                </label>

                <label className="grid gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Von
                    <Input
                        data-testid="rentals-overview-from"
                        type="date"
                        value={from}
                        onChange={(event) => {
                            setQueryParams(router, pathname, searchParams, {
                                from: event.target.value || undefined,
                                page: "1"
                            });
                        }}
                    />
                </label>

                <label className="grid gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Bis
                    <Input
                        data-testid="rentals-overview-to"
                        type="date"
                        value={to}
                        onChange={(event) => {
                            setQueryParams(router, pathname, searchParams, {
                                to: event.target.value || undefined,
                                page: "1"
                            });
                        }}
                    />
                </label>
            </div>

            {errorMessage ? <p className="m-0 text-sm text-red-700 dark:text-red-400">{errorMessage}</p> : null}
            {isLoading ? <p className="m-0 text-sm text-slate-600 dark:text-slate-300">Lade Daten...</p> : null}

            <DataTable
                data={rows}
                columns={rentalColumns}
                emptyMessage="Keine Vermietungen vorhanden."
                tableTestId="rentals-table"
                tableClassName="min-w-184 lg:min-w-4xl"
                getRowTestId={(row) => `rental-row-${row.original.id}`}
                renderMobileRow={(row) => (
                    <article key={row.id} className="fi-mobile-list-card grid gap-2" data-testid={`rental-mobile-card-${row.original.id}`}>
                        <h3 data-testid={`rental-row-item-${row.original.id}`} className="text-sm font-semibold">
                            {row.original.itemSummary}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                            {formatDate(row.original.startDate)} - {formatDate(row.original.endDate)}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-sm">Menge gesamt: {row.original.totalQuantity}</p>
                            <Badge
                                data-testid={`rental-row-status-${row.original.id}`}
                                variant={row.original.status === "Canceled" ? "outline" : "secondary"}
                                className={getStatusBadgeClassName(row.original.status)}
                            >
                                {row.original.status}
                            </Badge>
                        </div>
                        {row.original.borrowerName ? (
                            <p className="text-xs text-slate-600 dark:text-slate-300">Leiher: {row.original.borrowerName}</p>
                        ) : null}
                        <div className="grid gap-1">
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Aktionen</p>
                            <RentalActions row={row.original} />
                        </div>
                    </article>
                )}
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="m-0 text-sm text-slate-600 dark:text-slate-300" data-testid="rentals-overview-page-summary">
                    Seite {paging.page} von {Math.max(paging.totalPages, 1)} · {paging.totalCount} Eintraege
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        data-testid="rentals-overview-page-prev"
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!paging.hasPrevious}
                        onClick={() => {
                            setQueryParams(router, pathname, searchParams, {
                                page: String(Math.max(paging.page - 1, 1))
                            });
                        }}
                    >
                        Zurueck
                    </Button>
                    <Button
                        data-testid="rentals-overview-page-next"
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!paging.hasNext}
                        onClick={() => {
                            setQueryParams(router, pathname, searchParams, {
                                page: String(paging.page + 1)
                            });
                        }}
                    >
                        Weiter
                    </Button>
                </div>
            </div>
        </section>
    );
}

function RentalActions({ row }: Readonly<{ row: RentalOverviewRow }>) {
    return (
        <ActionButtonGroup data-testid={`rental-row-actions-${row.id}`}>
            <Button asChild variant="outline" size="sm">
                <Link href={`/rentals/${row.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                    bearbeiten
                </Link>
            </Button>
            <RentalStatusActions rentalId={row.id} status={row.status} />
        </ActionButtonGroup>
    );
}

function setQueryParams(
    router: ReturnType<typeof useRouter>,
    pathname: string,
    searchParams: ReadonlyURLSearchParams,
    updates: Record<string, string | undefined>
) {
    const next = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
        if (!value) {
            next.delete(key);
            continue;
        }

        next.set(key, value);
    }

    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
}

function mapRentalOverviewRow(item: RentalOverviewResponse["items"][number]): RentalOverviewRow {
    return {
        id: item.id,
        itemSummary: item.itemSummary,
        startDate: item.startDate,
        endDate: item.endDate,
        borrowerName: item.borrowerName,
        totalQuantity: toNumber(item.totalQuantity),
        status: toRentalStatus(item.status)
    };
}

function toRentalStatus(value: number | string): RentalStatus {
    const numeric = typeof value === "number" ? value : Number(value);

    switch (numeric) {
        case 1:
            return "Active";
        case 2:
            return "Returned";
        case 3:
            return "Canceled";
        case 4:
            return "Completed";
        default:
            return "Planned";
    }
}

function getStatusBadgeClassName(status: RentalStatus): string | undefined {
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

function toPositiveNumber(value: string | null, fallback: number): number {
    if (!value) {
        return fallback;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 1) {
        return fallback;
    }

    return Math.floor(parsed);
}

function toNumber(value: number | string): number {
    return typeof value === "number" ? value : Number(value);
}
