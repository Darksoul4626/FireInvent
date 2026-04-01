"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    type Row,
    type SortingState,
    useReactTable
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type DataTableFilterOption = {
    label: string;
    value: string;
};

type DataTableSelectFilter = {
    columnId: string;
    label: string;
    allLabel: string;
    options: DataTableFilterOption[];
    testId?: string;
};

type DataTableProps<TData> = {
    data: TData[];
    columns: ColumnDef<TData, unknown>[];
    emptyMessage: string;
    tableTestId: string;
    tableClassName?: string;
    searchColumnId?: string;
    searchPlaceholder?: string;
    selectFilters?: DataTableSelectFilter[];
    getRowTestId?: (row: Row<TData>) => string | undefined;
    renderMobileRow?: (row: Row<TData>) => React.ReactNode;
};

export function DataTable<TData>({
    data,
    columns,
    emptyMessage,
    tableTestId,
    tableClassName,
    searchColumnId,
    searchPlaceholder,
    selectFilters,
    getRowTestId,
    renderMobileRow
}: Readonly<DataTableProps<TData>>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel()
    });

    const searchColumn = searchColumnId ? table.getColumn(searchColumnId) : undefined;
    const searchValue = toFilterString(searchColumn?.getFilterValue());
    const rows = table.getRowModel().rows;
    const shouldRenderToolbar = Boolean(searchColumn) || (selectFilters?.length ?? 0) > 0;

    const columnCount = useMemo(() => {
        return table.getVisibleFlatColumns().length;
    }, [table]);

    return (
        <section className="grid gap-3">
            {shouldRenderToolbar ? (
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    {searchColumn ? (
                        <label className="grid gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                            Suche
                            <Input
                                data-testid={`${tableTestId}-search`}
                                value={searchValue}
                                onChange={(event) => searchColumn.setFilterValue(event.target.value)}
                                placeholder={searchPlaceholder ?? "Suche"}
                            />
                        </label>
                    ) : null}

                    {selectFilters?.map((filter) => {
                        const column = table.getColumn(filter.columnId);
                        if (!column) {
                            return null;
                        }

                        return (
                            <label key={filter.columnId} className="grid gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                                {filter.label}
                                <Select
                                    data-testid={filter.testId ?? `${tableTestId}-filter-${filter.columnId}`}
                                    value={toFilterString(column.getFilterValue())}
                                    onChange={(event) => column.setFilterValue(event.target.value)}
                                >
                                    <option value="">{filter.allLabel}</option>
                                    {filter.options.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </Select>
                            </label>
                        );
                    })}
                </div>
            ) : null}

            {renderMobileRow ? (
                <div className="grid gap-3 xl:hidden">
                    {rows.length > 0 ? rows.map((row) => renderMobileRow(row)) : <p className="m-0 text-sm">{emptyMessage}</p>}
                </div>
            ) : null}

            <div className={cn(renderMobileRow ? "hidden xl:block" : undefined)}>
                <Table data-testid={tableTestId} className={tableClassName}>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const sortDirection = header.column.getIsSorted();
                                    const canSort = header.column.getCanSort();
                                    let content: React.ReactNode = null;

                                    if (!header.isPlaceholder && canSort) {
                                        content = (
                                            <button
                                                data-testid={`${tableTestId}-sort-${header.column.id}`}
                                                type="button"
                                                onClick={() => header.column.toggleSorting(sortDirection === "asc")}
                                                className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-left hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:hover:bg-slate-800"
                                            >
                                                <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                                                <SortIcon direction={sortDirection} />
                                            </button>
                                        );
                                    }

                                    if (!header.isPlaceholder && !canSort) {
                                        content = flexRender(header.column.columnDef.header, header.getContext());
                                    }

                                    return (
                                        <TableHead key={header.id}>
                                            {content}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {rows.length > 0 ? (
                            rows.map((row) => {
                                const rowTestId = getRowTestId?.(row);

                                return (
                                    <TableRow key={row.id} data-testid={rowTestId}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columnCount} className="text-sm text-slate-600 dark:text-slate-300">
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </section>
    );
}

function SortIcon({ direction }: Readonly<{ direction: false | "asc" | "desc" }>) {
    if (direction === "asc") {
        return <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />;
    }

    if (direction === "desc") {
        return <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />;
    }

    return <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />;
}

function toFilterString(value: unknown): string {
    return typeof value === "string" ? value : "";
}