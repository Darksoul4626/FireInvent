"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, Pencil } from "lucide-react";
import Link from "next/link";
import { type ReadonlyURLSearchParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { InventoryItemDeleteAction } from "@/components/inventory-item-delete-action";
import { ActionButtonGroup } from "@/components/ui/action-button-group";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type InventoryOverviewRow = {
    id: string;
    code: string;
    name: string;
    category: string;
    condition: string;
    location: string;
    total: number;
    rented: number;
    available: number;
};

type InventoryOverviewResponse = {
    items: Array<{
        id: string;
        inventoryCode: string;
        name: string;
        category: string;
        condition: number | string;
        location: string;
        totalQuantity: number | string;
        rented: number | string;
        available: number | string;
    }>;
    page: number | string;
    pageSize: number | string;
    totalCount: number | string;
    totalPages: number | string;
    hasPrevious: boolean;
    hasNext: boolean;
};

const inventoryColumns: ColumnDef<InventoryOverviewRow, unknown>[] = [
    {
        accessorKey: "code",
        header: "Code"
    },
    {
        accessorKey: "name",
        header: "Name"
    },
    {
        accessorKey: "category",
        header: "Kategorie"
    },
    {
        accessorKey: "condition",
        header: "Zustand"
    },
    {
        accessorKey: "location",
        header: "Ort"
    },
    {
        accessorKey: "total",
        header: "Gesamt",
        cell: ({ row }) => <span data-testid={`inventory-row-total-${row.original.id}`}>{row.original.total}</span>
    },
    {
        accessorKey: "rented",
        header: "Vermietet",
        cell: ({ row }) => <span data-testid={`inventory-row-rented-${row.original.id}`}>{row.original.rented}</span>
    },
    {
        accessorKey: "available",
        header: "Verfuegbar",
        cell: ({ row }) => <span data-testid={`inventory-row-available-${row.original.id}`}>{row.original.available}</span>
    },
    {
        id: "actions",
        header: "Aktionen",
        enableSorting: false,
        cell: ({ row }) => <InventoryActions row={row.original} />
    }
];

export function InventoryOverviewTable() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const page = toPositiveNumber(searchParams.get("page"), 1);
    const pageSize = toPositiveNumber(searchParams.get("pageSize"), 20);
    const search = searchParams.get("search") ?? "";
    const category = searchParams.get("category") ?? "";
    const condition = searchParams.get("condition") ?? "";

    const [searchInput, setSearchInput] = useState(search);
    const [rows, setRows] = useState<InventoryOverviewRow[]>([]);
    const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
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

        async function loadCategories() {
            try {
                const response = await fetch("/api/proxy/categories", { signal: controller.signal });
                if (!response.ok) {
                    return;
                }

                const categories = (await response.json()) as Array<{ name: string }>;
                setCategoryOptions(categories.map((entry) => entry.name));
            } catch {
                if (!controller.signal.aborted) {
                    setCategoryOptions([]);
                }
            }
        }

        void loadCategories();

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
                if (category) {
                    query.set("category", category);
                }
                if (condition) {
                    query.set("condition", condition);
                }

                const response = await fetch(`/api/proxy/items/overview?${query.toString()}`, {
                    signal: controller.signal
                });

                if (!response.ok) {
                    throw new Error("overview_failed");
                }

                const payload = (await response.json()) as InventoryOverviewResponse;
                setRows(payload.items.map(mapInventoryOverviewRow));
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
                    setErrorMessage("Inventaruebersicht konnte nicht geladen werden.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        void loadOverview();

        return () => controller.abort();
    }, [page, pageSize, search, category, condition]);

    const conditionOptions = useMemo(() => ["Unknown", "Good", "NeedsRepair", "OutOfService"], []);

    return (
        <section className="grid gap-3">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <label className="grid gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Suche
                    <Input
                        data-testid="inventory-overview-search"
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="Name, Code oder Ort"
                    />
                </label>

                <label className="grid gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Kategorie
                    <Select
                        data-testid="inventory-overview-category"
                        value={category}
                        onChange={(event) => {
                            setQueryParams(router, pathname, searchParams, {
                                category: event.target.value || undefined,
                                page: "1"
                            });
                        }}
                    >
                        <option value="">Alle Kategorien</option>
                        {categoryOptions.map((value) => (
                            <option key={value} value={value}>{value}</option>
                        ))}
                    </Select>
                </label>

                <label className="grid gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Zustand
                    <Select
                        data-testid="inventory-overview-condition"
                        value={condition}
                        onChange={(event) => {
                            setQueryParams(router, pathname, searchParams, {
                                condition: event.target.value || undefined,
                                page: "1"
                            });
                        }}
                    >
                        <option value="">Alle Zustaende</option>
                        {conditionOptions.map((value) => (
                            <option key={value} value={value}>{value}</option>
                        ))}
                    </Select>
                </label>

            </div>

            {errorMessage ? <p className="m-0 text-sm text-red-700 dark:text-red-400">{errorMessage}</p> : null}
            {isLoading ? <p className="m-0 text-sm text-slate-600 dark:text-slate-300">Lade Daten...</p> : null}

            <DataTable
                data={rows}
                columns={inventoryColumns}
                emptyMessage="Keine Gegenstaende vorhanden."
                tableTestId="inventory-table"
                tableClassName="min-w-176 lg:min-w-208"
                getRowTestId={(row) => `inventory-row-${row.original.id}`}
                renderMobileRow={(row) => (
                    <article
                        key={row.id}
                        className="fi-mobile-list-card grid gap-2"
                        data-testid={`inventory-mobile-card-${row.original.id}`}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="text-xs text-slate-600 dark:text-slate-300">{row.original.code}</p>
                                <h3 className="text-base font-semibold">{row.original.name}</h3>
                            </div>
                            <span className="rounded-full bg-slate-200 px-2 py-1 text-xs dark:bg-slate-700">{row.original.category}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{row.original.condition} · {row.original.location}</p>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                                <p className="text-slate-500">Gesamt</p>
                                <p data-testid={`inventory-row-total-${row.original.id}`} className="font-semibold">{row.original.total}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Vermietet</p>
                                <p data-testid={`inventory-row-rented-${row.original.id}`} className="font-semibold">{row.original.rented}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Verfuegbar</p>
                                <p data-testid={`inventory-row-available-${row.original.id}`} className="font-semibold">{row.original.available}</p>
                            </div>
                        </div>
                        <div className="grid gap-1">
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Aktionen</p>
                            <InventoryActions row={row.original} />
                        </div>
                    </article>
                )}
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="m-0 text-sm text-slate-600 dark:text-slate-300" data-testid="inventory-overview-page-summary">
                    Seite {paging.page} von {Math.max(paging.totalPages, 1)} · {paging.totalCount} Eintraege
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        data-testid="inventory-overview-page-prev"
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
                        data-testid="inventory-overview-page-next"
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

function InventoryActions({ row }: Readonly<{ row: InventoryOverviewRow }>) {
    return (
        <ActionButtonGroup data-testid={`inventory-row-actions-${row.id}`}>
            <Button asChild variant="outline" size="sm">
                <Link href={`/inventory/${row.id}`}>
                    <ExternalLink className="h-4 w-4" />
                    oeffnen
                </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
                <Link href={`/inventory/${row.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                    bearbeiten
                </Link>
            </Button>
            <InventoryItemDeleteAction itemId={row.id} itemName={row.name} buttonVariant="destructive" />
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

function mapInventoryOverviewRow(item: InventoryOverviewResponse["items"][number]): InventoryOverviewRow {
    return {
        id: item.id,
        code: item.inventoryCode,
        name: item.name,
        category: item.category,
        condition: toConditionLabel(item.condition),
        location: item.location,
        total: toNumber(item.totalQuantity),
        rented: toNumber(item.rented),
        available: toNumber(item.available)
    };
}

function toConditionLabel(value: number | string): string {
    const numeric = typeof value === "number" ? value : Number(value);

    switch (numeric) {
        case 1:
            return "Good";
        case 2:
            return "NeedsRepair";
        case 3:
            return "OutOfService";
        default:
            return "Unknown";
    }
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
