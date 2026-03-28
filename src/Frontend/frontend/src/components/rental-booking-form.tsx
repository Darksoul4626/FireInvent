"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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

type FormValues = {
    itemId: string;
    startDate: string;
    endDate: string;
    quantity: number;
};

type Props = {
    mode: Mode;
    rentalId?: string;
    itemOptions: ItemOption[];
    initialValues?: Partial<FormValues>;
};

const baseSchema = z.object({
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    quantity: z.number().int().min(1)
});

const createSchema = baseSchema.extend({ itemId: z.string().uuid() });
const editSchema = baseSchema;

function toIso(value: string): string {
    const day = value.includes("T") ? value.slice(0, 10) : value;
    return `${day}T00:00:00.000Z`;
}

function toRangeEndIso(value: string): string {
    const day = value.includes("T") ? value.slice(0, 10) : value;
    return `${day}T23:59:59.999Z`;
}

function getAvailabilityMessage(info: {
    loading: boolean;
    availableQuantity: number | null;
    reservedOrRentedQuantity: number | null;
    totalQuantity: number | null;
    error: string | null;
}): string {
    if (info.loading) {
        return "Verfuegbarkeit wird geladen...";
    }

    if (info.error) {
        return info.error;
    }

    return `Verfuegbar im Zeitraum: ${info.availableQuantity ?? "-"} (Reserviert/Vermietet: ${info.reservedOrRentedQuantity ?? "-"}, Gesamt: ${info.totalQuantity ?? "-"})`;
}

export function RentalBookingForm({ mode, rentalId, itemOptions, initialValues }: Readonly<Props>) {
    const router = useRouter();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitFieldErrors, setSubmitFieldErrors] = useState<string[]>([]);
    const [availabilityInfo, setAvailabilityInfo] = useState<{
        loading: boolean;
        availableQuantity: number | null;
        reservedOrRentedQuantity: number | null;
        totalQuantity: number | null;
        error: string | null;
    }>({
        loading: false,
        availableQuantity: null,
        reservedOrRentedQuantity: null,
        totalQuantity: null,
        error: null
    });

    const defaults: FormValues = useMemo(
        () => ({
            itemId: initialValues?.itemId ?? itemOptions[0]?.id ?? "",
            startDate: initialValues?.startDate ?? "",
            endDate: initialValues?.endDate ?? "",
            quantity: initialValues?.quantity ?? 1
        }),
        [initialValues, itemOptions]
    );

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormValues>({ defaultValues: defaults });

    const selectedItemId = watch("itemId");
    const selectedStartDate = watch("startDate");
    const selectedEndDate = watch("endDate");

    const selectedItem = useMemo(
        () => itemOptions.find((item) => item.id === selectedItemId) ?? null,
        [itemOptions, selectedItemId]
    );
    const availabilityMessage = getAvailabilityMessage(availabilityInfo);
    let submitLabel = "Vermietung speichern";
    if (mode === "create") {
        submitLabel = "Vermietung anlegen";
    }
    if (isSubmitting) {
        submitLabel = "Speichert...";
    }

    useEffect(() => {
        if (!selectedItemId || !selectedStartDate || !selectedEndDate) {
            setAvailabilityInfo({
                loading: false,
                availableQuantity: null,
                reservedOrRentedQuantity: null,
                totalQuantity: null,
                error: null
            });
            return;
        }

        let cancelled = false;

        async function loadAvailability() {
            setAvailabilityInfo((previous) => ({
                ...previous,
                loading: true,
                error: null
            }));

            const from = toIso(selectedStartDate);
            const to = toRangeEndIso(selectedEndDate);
            const query = new URLSearchParams({ from, to }).toString();

            const response = await fetch(`/api/proxy/items/${selectedItemId}/availability?${query}`);

            if (cancelled) {
                return;
            }

            if (!response.ok) {
                setAvailabilityInfo({
                    loading: false,
                    availableQuantity: null,
                    reservedOrRentedQuantity: null,
                    totalQuantity: null,
                    error: "Verfuegbarkeit konnte nicht geladen werden."
                });
                return;
            }

            const body = (await response.json()) as {
                availableQuantity: number;
                reservedOrRentedQuantity: number;
                totalQuantity: number;
            };

            setAvailabilityInfo({
                loading: false,
                availableQuantity: Number(body.availableQuantity),
                reservedOrRentedQuantity: Number(body.reservedOrRentedQuantity),
                totalQuantity: Number(body.totalQuantity),
                error: null
            });
        }

        void loadAvailability();

        return () => {
            cancelled = true;
        };
    }, [selectedItemId, selectedStartDate, selectedEndDate]);

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

        const payload =
            mode === "create"
                ? {
                    itemId: values.itemId,
                    startDate: toIso(values.startDate),
                    endDate: toRangeEndIso(values.endDate),
                    quantity: values.quantity
                }
                : {
                    startDate: toIso(values.startDate),
                    endDate: toRangeEndIso(values.endDate),
                    quantity: values.quantity
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
                <span>Gegenstand</span>
                <Select
                    data-testid="rental-item-select"
                    {...register("itemId", { required: mode === "create" })}
                    disabled={mode === "edit"}
                >
                    {itemOptions.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.inventoryCode} - {item.name}
                        </option>
                    ))}
                </Select>
            </label>

            {selectedItem ? (
                <p data-testid="rental-item-total-quantity" className="m-0 text-sm">
                    Gesamtbestand: <strong>{selectedItem.totalQuantity}</strong>
                </p>
            ) : null}

            <label className="grid gap-2 text-sm font-semibold">
                <span>Start</span>
                <Input
                    data-testid="rental-start-input"
                    type="date"
                    {...register("startDate", { required: true })}
                />
                {errors.startDate ? <span className="text-sm text-red-700 dark:text-red-400">Start ist erforderlich.</span> : null}
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

            {selectedStartDate && selectedEndDate ? (
                <div className="grid gap-1">
                    <p data-testid="rental-availability-info" className="m-0 text-sm">
                        {availabilityMessage}
                    </p>
                    <p data-testid="rental-availability-hint" className="m-0 text-xs text-slate-600 dark:text-slate-300">
                        Hinweis: Die Verfuegbarkeit wird fuer den gesamten ausgewaehlten Tageszeitraum berechnet.
                    </p>
                </div>
            ) : null}

            <label className="grid gap-2 text-sm font-semibold">
                <span>Menge</span>
                <Input
                    data-testid="rental-quantity-input"
                    type="number"
                    min={1}
                    {...register("quantity", { required: true, valueAsNumber: true, min: 1 })}
                />
                {errors.quantity ? <span className="text-sm text-red-700 dark:text-red-400">Menge muss groesser 0 sein.</span> : null}
            </label>

            {submitError ? <p className="m-0 text-sm text-red-700 dark:text-red-400">{submitError}</p> : null}
            {submitFieldErrors.length > 0 ? (
                <ul className="m-0 grid list-disc gap-1 pl-5 text-sm text-red-700 dark:text-red-400">
                    {submitFieldErrors.map((error) => (
                        <li key={error}>{error}</li>
                    ))}
                </ul>
            ) : null}

            <Button data-testid="rental-submit-button" type="submit" disabled={isSubmitting} className="w-fit">
                {submitLabel}
            </Button>
        </form>
    );
}
