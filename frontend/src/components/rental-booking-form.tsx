"use client";

import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { parseApiError } from "@/lib/api/api-error";

type Mode = "create" | "edit";

type ItemOption = {
    id: string;
    name: string;
    inventoryCode: string;
    totalQuantity: number;
};

type FormStatus = "Planned" | "Active" | "Returned" | "Canceled" | "Completed";

type FormValues = {
    borrowerName: string;
    startDate: string;
    endDate: string;
    status: FormStatus;
    lines: Array<{
        itemId: string;
        quantity: number;
    }>;
};

type Props = {
    mode: Mode;
    rentalId?: string;
    itemOptions: ItemOption[];
    initialValues?: Partial<Pick<FormValues, "borrowerName" | "startDate" | "endDate" | "status" | "lines">>;
};

type AvailabilityInfo = {
    availableQuantity: number;
    totalQuantity: number;
};

const lineSchema = z.object({
    itemId: z.string().uuid(),
    quantity: z.number().int().min(1)
});

const baseSchema = z.object({
    borrowerName: z.string().max(256),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    lines: z.array(lineSchema).min(1)
});

const createSchema = baseSchema;
const editSchema = baseSchema.extend({
    status: z.enum(["Planned", "Active", "Returned", "Canceled", "Completed"])
});

const statusToApiValue: Record<FormStatus, number> = {
    Planned: 0,
    Active: 1,
    Returned: 2,
    Canceled: 3,
    Completed: 4
};

function normalizeLines(lines: FormValues["lines"]) {
    const grouped = new Map<string, number>();
    for (const line of lines) {
        grouped.set(line.itemId, (grouped.get(line.itemId) ?? 0) + line.quantity);
    }

    return Array.from(grouped.entries()).map(([itemId, quantity]) => ({
        itemId,
        quantity
    }));
}

function toIso(value: string): string {
    const day = value.includes("T") ? value.slice(0, 10) : value;
    return `${day}T00:00:00.000Z`;
}

function toRangeEndIso(value: string): string {
    const day = value.includes("T") ? value.slice(0, 10) : value;
    return `${day}T23:59:59.999Z`;
}

function getBerlinToday(): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Berlin"
    }).format(new Date());
}

function toNumber(value: number | string): number {
    return typeof value === "number" ? value : Number(value);
}

export function RentalBookingForm({ mode, rentalId, itemOptions, initialValues }: Readonly<Props>) {
    const router = useRouter();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitFieldErrors, setSubmitFieldErrors] = useState<string[]>([]);
    const [availabilityByItemId, setAvailabilityByItemId] = useState<Record<string, AvailabilityInfo>>({});
    const [availabilityLoadingByItemId, setAvailabilityLoadingByItemId] = useState<Record<string, boolean>>({});
    const [availabilityError, setAvailabilityError] = useState<string | null>(null);

    const defaults: FormValues = useMemo(
        () => ({
            borrowerName: initialValues?.borrowerName ?? "",
            startDate: initialValues?.startDate ?? "",
            endDate: initialValues?.endDate ?? "",
            status: initialValues?.status ?? "Planned",
            lines: initialValues?.lines?.length
                ? initialValues.lines
                : [{ itemId: itemOptions[0]?.id ?? "", quantity: 1 }]
        }),
        [initialValues, itemOptions]
    );

    const {
        control,
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormValues>({ defaultValues: defaults });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "lines"
    });

    const watchedLines = watch("lines");
    const watchedStartDate = watch("startDate");
    const watchedEndDate = watch("endDate");

    const berlinToday = useMemo(() => getBerlinToday(), []);
    const startDateTooEarly = Boolean(watchedStartDate) && watchedStartDate < berlinToday;

    const requestedQuantityByItemId = useMemo(() => {
        const grouped = new Map<string, number>();
        for (const line of watchedLines ?? []) {
            if (!line?.itemId) {
                continue;
            }

            const parsedQuantity = Number(line.quantity ?? 1);
            const normalizedQuantity = Number.isFinite(parsedQuantity)
                ? Math.max(1, Math.trunc(parsedQuantity))
                : 1;

            grouped.set(
                line.itemId,
                (grouped.get(line.itemId) ?? 0) + normalizedQuantity
            );
        }

        return grouped;
    }, [watchedLines]);

    const conflictByItemId = useMemo(() => {
        const conflicts = new Map<string, { requested: number; available: number }>();

        for (const [itemId, requested] of requestedQuantityByItemId.entries()) {
            const availability = availabilityByItemId[itemId];
            if (!availability) {
                continue;
            }

            if (requested > availability.availableQuantity) {
                conflicts.set(itemId, {
                    requested,
                    available: availability.availableQuantity
                });
            }
        }

        return conflicts;
    }, [availabilityByItemId, requestedQuantityByItemId]);

    const hasAvailabilityConflict = conflictByItemId.size > 0;
    const hasAvailabilityError = Boolean(availabilityError);

    let submitIcon = <Save className="h-4 w-4" />;
    if (isSubmitting) {
        submitIcon = <Loader2 className="h-4 w-4 animate-spin" />;
    } else if (mode === "create") {
        submitIcon = <Plus className="h-4 w-4" />;
    }

    useEffect(() => {
        if (fields.length > 0) {
            return;
        }

        append({ itemId: itemOptions[0]?.id ?? "", quantity: 1 });
    }, [append, fields.length, itemOptions]);

    useEffect(() => {
        const itemIds = Array.from(
            new Set((watchedLines ?? []).map((line) => line.itemId).filter((itemId): itemId is string => Boolean(itemId)))
        );

        if (!watchedStartDate || !watchedEndDate || itemIds.length === 0 || watchedEndDate < watchedStartDate) {
            setAvailabilityByItemId({});
            setAvailabilityLoadingByItemId({});
            setAvailabilityError(null);
            return;
        }

        const controller = new AbortController();

        async function loadAvailability() {
            setAvailabilityError(null);
            setAvailabilityLoadingByItemId(Object.fromEntries(itemIds.map((itemId) => [itemId, true])));

            try {
                const from = toIso(watchedStartDate);
                const to = toRangeEndIso(watchedEndDate);
                const excludeBookingId = mode === "edit" && rentalId ? rentalId : null;

                const results = await Promise.all(itemIds.map(async (itemId) => {
                    const search = new URLSearchParams({
                        from,
                        to
                    });

                    if (excludeBookingId) {
                        search.set("excludeBookingId", excludeBookingId);
                    }

                    const response = await fetch(
                        `/api/proxy/items/${itemId}/availability?${search.toString()}`,
                        { signal: controller.signal }
                    );

                    if (!response.ok) {
                        throw new Error("availability_failed");
                    }

                    const payload = (await response.json()) as {
                        availableQuantity: number | string;
                        totalQuantity: number | string;
                    };

                    return {
                        itemId,
                        availableQuantity: toNumber(payload.availableQuantity),
                        totalQuantity: toNumber(payload.totalQuantity)
                    };
                }));

                if (controller.signal.aborted) {
                    return;
                }

                setAvailabilityByItemId(Object.fromEntries(results.map((result) => [result.itemId, {
                    availableQuantity: result.availableQuantity,
                    totalQuantity: result.totalQuantity
                }])));
            } catch {
                if (!controller.signal.aborted) {
                    setAvailabilityByItemId({});
                    setAvailabilityError("Verfuegbarkeit konnte nicht geladen werden.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setAvailabilityLoadingByItemId({});
                }
            }
        }

        void loadAvailability();

        return () => controller.abort();
    }, [mode, rentalId, watchedLines, watchedStartDate, watchedEndDate]);

    let submitLabel = "Vermietung speichern";
    if (mode === "create") {
        submitLabel = "Vermietung anlegen";
    }
    if (isSubmitting) {
        submitLabel = "Speichert...";
    }

    const onSubmit = handleSubmit(async (values) => {
        setSubmitError(null);
        setSubmitFieldErrors([]);

        const parsed = mode === "create" ? createSchema.safeParse(values) : editSchema.safeParse(values);
        if (!parsed.success) {
            setSubmitError(parsed.error.issues.map((i) => i.message).join("; "));
            return;
        }

        if (values.endDate < values.startDate) {
            setSubmitError("Enddatum muss groesser oder gleich Startdatum sein.");
            return;
        }

        if (values.startDate < berlinToday) {
            setSubmitError("Startdatum muss in Europe/Berlin heute oder spaeter sein.");
            return;
        }

        if (hasAvailabilityConflict) {
            setSubmitError("Speichern nicht moeglich: mindestens eine Position uebersteigt die verfuegbare Menge.");
            return;
        }

        if (hasAvailabilityError) {
            setSubmitError("Speichern nicht moeglich: Verfuegbarkeit konnte nicht geladen werden.");
            return;
        }

        const normalizedLines = normalizeLines(values.lines);

        const payload =
            mode === "create"
                ? {
                    startDate: toIso(values.startDate),
                    endDate: toRangeEndIso(values.endDate),
                    lines: normalizedLines,
                    borrowerName: values.borrowerName.trim() ? values.borrowerName.trim() : null
                }
                : {
                    startDate: toIso(values.startDate),
                    endDate: toRangeEndIso(values.endDate),
                    lines: normalizedLines,
                    borrowerName: values.borrowerName.trim() ? values.borrowerName.trim() : null,
                    status: statusToApiValue[values.status]
                };

        const url = mode === "create" ? "/api/proxy/rentals" : `/api/proxy/rentals/${rentalId}`;
        const method = mode === "create" ? "POST" : "PUT";

        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const parsed = await parseApiError(response, "Speichern fehlgeschlagen");
            setSubmitError(parsed.message);
            setSubmitFieldErrors(parsed.fieldErrors);
            return;
        }

        router.push("/rentals");
        router.refresh();
    });

    return (
        <form data-testid="rental-booking-form" onSubmit={onSubmit} className="grid max-w-3xl gap-4">
            <label className="grid gap-2 text-sm font-semibold">
                <span>Leiher (optional)</span>
                <Input
                    data-testid="rental-borrower-input"
                    placeholder="z.B. Feuerwehr Musterstadt"
                    maxLength={256}
                    {...register("borrowerName")}
                />
            </label>

            <label className="grid gap-2 text-sm font-semibold">
                <span>Start</span>
                <Input
                    data-testid="rental-start-input"
                    type="date"
                    {...register("startDate", { required: true })}
                />
                {errors.startDate ? <span className="text-sm text-red-700 dark:text-red-400">Start ist erforderlich.</span> : null}
                {startDateTooEarly ? (
                    <span className="text-sm text-red-700 dark:text-red-400" data-testid="rental-start-berlin-error">
                        Startdatum muss in Europe/Berlin heute oder spaeter sein.
                    </span>
                ) : null}
            </label>

            <label className="grid gap-2 text-sm font-semibold">
                <span>Ende</span>
                <Input
                    data-testid="rental-end-input"
                    type="date"
                    {...register("endDate", { required: true })}
                />
                {errors.endDate ? <span className="text-sm text-red-700 dark:text-red-400">Ende ist erforderlich.</span> : null}
            </label>

            {mode === "edit" ? (
                <label className="grid gap-2 text-sm font-semibold">
                    <span>Status</span>
                    <Select data-testid="rental-status-select" {...register("status", { required: true })}>
                        <option value="Planned">Planned</option>
                        <option value="Active">Active</option>
                        <option value="Returned">Returned</option>
                        <option value="Canceled">Canceled</option>
                        <option value="Completed">Completed</option>
                    </Select>
                </label>
            ) : null}

            <div className="grid gap-3 rounded-md border border-(--border) p-3">
                <div className="flex items-center justify-between gap-2">
                    <p className="m-0 text-sm font-semibold">Positionen</p>
                    <Button
                        data-testid="rental-add-line-button"
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ itemId: itemOptions[0]?.id ?? "", quantity: 1 })}
                    >
                        <Plus className="h-4 w-4" />
                        Position hinzufuegen
                    </Button>
                </div>

                {availabilityError ? (
                    <p className="m-0 text-sm text-red-700 dark:text-red-400" data-testid="rental-availability-error">{availabilityError}</p>
                ) : null}

                {fields.map((field, index) => {
                    const selectedItemId = watchedLines?.[index]?.itemId;
                    const selectedItem = itemOptions.find((item) => item.id === selectedItemId);
                    const availability = selectedItemId ? availabilityByItemId[selectedItemId] : undefined;
                    const isAvailabilityLoading = selectedItemId ? availabilityLoadingByItemId[selectedItemId] : false;
                    const conflict = selectedItemId ? conflictByItemId.get(selectedItemId) : undefined;

                    return (
                        <div key={field.id} className="grid gap-2 rounded-md border border-(--border) p-3">
                            <div className="grid gap-2 md:grid-cols-[1fr_170px_auto] md:items-end">
                                <label className="grid gap-2 text-sm font-semibold">
                                    <span>Gegenstand</span>
                                    <Select
                                        data-testid={index === 0 ? "rental-item-select" : `rental-line-item-select-${index}`}
                                        {...register(`lines.${index}.itemId`, { required: true })}
                                    >
                                        {itemOptions.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.inventoryCode} - {item.name}
                                            </option>
                                        ))}
                                    </Select>
                                </label>

                                <label className="grid gap-2 text-sm font-semibold">
                                    <span>Menge</span>
                                    <Input
                                        data-testid={index === 0 ? "rental-quantity-input" : `rental-line-quantity-input-${index}`}
                                        type="number"
                                        min={1}
                                        {...register(`lines.${index}.quantity`, {
                                            required: true,
                                            valueAsNumber: true,
                                            min: 1
                                        })}
                                    />
                                </label>

                                <Button
                                    data-testid={`rental-remove-line-button-${index}`}
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => remove(index)}
                                    disabled={fields.length <= 1}
                                    aria-label={`Position ${index + 1} entfernen`}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            {selectedItem ? (
                                <p className="m-0 text-xs text-slate-600 dark:text-slate-300">
                                    Bestand fuer diesen Gegenstand: {selectedItem.totalQuantity}
                                </p>
                            ) : null}

                            {isAvailabilityLoading ? (
                                <p className="m-0 text-xs text-slate-600 dark:text-slate-300" data-testid={`rental-line-availability-loading-${index}`}>
                                    Verfuegbarkeit wird aktualisiert...
                                </p>
                            ) : null}

                            {availability ? (
                                <p className="m-0 text-xs text-slate-600 dark:text-slate-300" data-testid={`rental-line-availability-${index}`}>
                                    Verfuegbar im Zeitraum: {availability.availableQuantity} / {availability.totalQuantity}
                                </p>
                            ) : null}

                            {conflict ? (
                                <p className="m-0 text-sm text-red-700 dark:text-red-400" data-testid={`rental-line-conflict-${index}`}>
                                    Konflikt: Angefragt {conflict.requested}, verfuegbar {conflict.available}. Bitte Menge oder Zeitraum anpassen.
                                </p>
                            ) : null}
                        </div>
                    );
                })}

                {errors.lines ? (
                    <p className="m-0 text-sm text-red-700 dark:text-red-400">Mindestens eine gueltige Position ist erforderlich.</p>
                ) : null}
            </div>

            {submitError ? <p className="m-0 text-sm text-red-700 dark:text-red-400">{submitError}</p> : null}
            {submitFieldErrors.length > 0 ? (
                <ul className="m-0 grid list-disc gap-1 pl-5 text-sm text-red-700 dark:text-red-400">
                    {submitFieldErrors.map((error) => (
                        <li key={error}>{error}</li>
                    ))}
                </ul>
            ) : null}

            <Button
                data-testid="rental-submit-button"
                type="submit"
                disabled={isSubmitting || hasAvailabilityConflict || hasAvailabilityError || startDateTooEarly}
                className="w-fit"
            >
                {submitIcon}
                {submitLabel}
            </Button>
        </form>
    );
}
