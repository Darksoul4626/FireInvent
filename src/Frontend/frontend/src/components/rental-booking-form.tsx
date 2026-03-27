"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
        <form data-testid="rental-booking-form" onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 760 }}>
            <label style={labelStyle}>
                <span>Gegenstand</span>
                <select
                    data-testid="rental-item-select"
                    style={inputStyle}
                    {...register("itemId", { required: mode === "create" })}
                    disabled={mode === "edit"}
                >
                    {itemOptions.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.inventoryCode} - {item.name}
                        </option>
                    ))}
                </select>
            </label>

            {selectedItem ? (
                <p data-testid="rental-item-total-quantity" style={infoStyle}>
                    Gesamtbestand: <strong>{selectedItem.totalQuantity}</strong>
                </p>
            ) : null}

            <label style={labelStyle}>
                <span>Start</span>
                <input
                    data-testid="rental-start-input"
                    style={inputStyle}
                    type="date"
                    {...register("startDate", { required: true })}
                />
                {errors.startDate ? <span style={errorStyle}>Start ist erforderlich.</span> : null}
            </label>

            <label style={labelStyle}>
                <span>Ende</span>
                <input
                    data-testid="rental-end-input"
                    style={inputStyle}
                    type="date"
                    {...register("endDate", { required: true })}
                />
                {errors.endDate ? <span style={errorStyle}>Ende ist erforderlich.</span> : null}
            </label>

            {selectedStartDate && selectedEndDate ? (
                <div style={{ display: "grid", gap: 4 }}>
                    <p data-testid="rental-availability-info" style={infoStyle}>
                        {availabilityMessage}
                    </p>
                    <p data-testid="rental-availability-hint" style={hintStyle}>
                        Hinweis: Die Verfuegbarkeit wird fuer den gesamten ausgewaehlten Tageszeitraum berechnet.
                    </p>
                </div>
            ) : null}

            <label style={labelStyle}>
                <span>Menge</span>
                <input
                    data-testid="rental-quantity-input"
                    style={inputStyle}
                    type="number"
                    min={1}
                    {...register("quantity", { required: true, valueAsNumber: true, min: 1 })}
                />
                {errors.quantity ? <span style={errorStyle}>Menge muss groesser 0 sein.</span> : null}
            </label>

            {submitError ? <p style={errorStyle}>{submitError}</p> : null}
            {submitFieldErrors.length > 0 ? (
                <ul style={errorListStyle}>
                    {submitFieldErrors.map((error) => (
                        <li key={error}>{error}</li>
                    ))}
                </ul>
            ) : null}

            <button data-testid="rental-submit-button" type="submit" disabled={isSubmitting} style={buttonStyle}>
                {submitLabel}
            </button>
        </form>
    );
}

const labelStyle: CSSProperties = {
    display: "grid",
    gap: 6,
    fontWeight: 600
};

const inputStyle: CSSProperties = {
    border: "1px solid #d1d5db",
    borderRadius: 6,
    padding: "8px 10px",
    font: "inherit"
};

const buttonStyle: CSSProperties = {
    border: "1px solid #111827",
    borderRadius: 6,
    padding: "10px 14px",
    background: "#111827",
    color: "#ffffff",
    fontWeight: 600,
    width: "fit-content"
};

const infoStyle: CSSProperties = {
    margin: 0,
    color: "#111827",
    fontSize: 14
};

const hintStyle: CSSProperties = {
    margin: 0,
    color: "#4b5563",
    fontSize: 13
};

const errorStyle: CSSProperties = {
    color: "#b91c1c",
    margin: 0,
    fontSize: 14
};

const errorListStyle: CSSProperties = {
    color: "#b91c1c",
    margin: 0,
    paddingLeft: 18,
    fontSize: 14,
    display: "grid",
    gap: 4
};
