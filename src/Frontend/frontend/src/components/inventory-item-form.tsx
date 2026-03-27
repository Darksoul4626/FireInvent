"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { parseApiError } from "@/lib/api/api-error";

type Mode = "create" | "edit";

type FormValues = {
    inventoryCode: string;
    name: string;
    category: string;
    condition: "Unknown" | "Good" | "NeedsRepair" | "OutOfService";
    location: string;
    totalQuantity: number;
};

const conditionToApiValue: Record<FormValues["condition"], number> = {
    Unknown: 0,
    Good: 1,
    NeedsRepair: 2,
    OutOfService: 3
};

type Props = {
    mode: Mode;
    itemId?: string;
    initialValues?: Partial<FormValues>;
};

const baseSchema = z.object({
    name: z.string().trim().min(1).max(256),
    category: z.string().trim().min(1).max(128),
    condition: z.enum(["Unknown", "Good", "NeedsRepair", "OutOfService"]),
    location: z.string().trim().min(1).max(128),
    totalQuantity: z.number().int().min(1)
});

const createSchema = baseSchema.extend({
    inventoryCode: z.string().trim().min(1).max(64)
});

const editSchema = baseSchema;

export function InventoryItemForm({ mode, itemId, initialValues }: Props) {
    const router = useRouter();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitFieldErrors, setSubmitFieldErrors] = useState<string[]>([]);

    const defaults: FormValues = useMemo(
        () => ({
            inventoryCode: initialValues?.inventoryCode ?? "",
            name: initialValues?.name ?? "",
            category: initialValues?.category ?? "",
            condition: initialValues?.condition ?? "Good",
            location: initialValues?.location ?? "",
            totalQuantity: initialValues?.totalQuantity ?? 1
        }),
        [initialValues]
    );

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<FormValues>({ defaultValues: defaults });

    const onSubmit = handleSubmit(async (values) => {
        setSubmitError(null);
        setSubmitFieldErrors([]);

        const parsed = mode === "create" ? createSchema.safeParse(values) : editSchema.safeParse(values);
        if (!parsed.success) {
            setSubmitError(parsed.error.issues.map((i) => i.message).join("; "));
            return;
        }

        const payload =
            mode === "create"
                ? {
                    inventoryCode: values.inventoryCode.trim(),
                    name: values.name.trim(),
                    category: values.category.trim(),
                    condition: conditionToApiValue[values.condition],
                    location: values.location.trim(),
                    totalQuantity: values.totalQuantity
                }
                : {
                    name: values.name.trim(),
                    category: values.category.trim(),
                    condition: conditionToApiValue[values.condition],
                    location: values.location.trim(),
                    totalQuantity: values.totalQuantity
                };

        const url = mode === "create" ? "/api/proxy/items" : `/api/proxy/items/${itemId}`;
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

        const item = await response.json();
        router.push(`/inventory/${item.id}`);
        router.refresh();
    });

    return (
        <form data-testid="inventory-item-form" onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 720 }}>
            {mode === "create" ? (
                <label style={labelStyle}>
                    Inventar-Code
                    <input
                        data-testid="inventory-code-input"
                        style={inputStyle}
                        {...register("inventoryCode", { required: true, maxLength: 64 })}
                    />
                    {errors.inventoryCode ? <span style={errorStyle}>Code ist erforderlich (max. 64).</span> : null}
                </label>
            ) : null}

            <label style={labelStyle}>
                Name
                <input data-testid="inventory-name-input" style={inputStyle} {...register("name", { required: true, maxLength: 256 })} />
                {errors.name ? <span style={errorStyle}>Name ist erforderlich (max. 256).</span> : null}
            </label>

            <label style={labelStyle}>
                Kategorie
                <input
                    data-testid="inventory-category-input"
                    style={inputStyle}
                    {...register("category", { required: true, maxLength: 128 })}
                />
                {errors.category ? <span style={errorStyle}>Kategorie ist erforderlich (max. 128).</span> : null}
            </label>

            <label style={labelStyle}>
                Zustand
                <select data-testid="inventory-condition-select" style={inputStyle} {...register("condition", { required: true })}>
                    <option value="Unknown">Unknown</option>
                    <option value="Good">Good</option>
                    <option value="NeedsRepair">NeedsRepair</option>
                    <option value="OutOfService">OutOfService</option>
                </select>
            </label>

            <label style={labelStyle}>
                Ort
                <input
                    data-testid="inventory-location-input"
                    style={inputStyle}
                    {...register("location", { required: true, maxLength: 128 })}
                />
                {errors.location ? <span style={errorStyle}>Ort ist erforderlich (max. 128).</span> : null}
            </label>

            <label style={labelStyle}>
                Gesamtmenge
                <input
                    data-testid="inventory-total-quantity-input"
                    style={inputStyle}
                    type="number"
                    min={1}
                    {...register("totalQuantity", {
                        required: true,
                        valueAsNumber: true,
                        min: 1
                    })}
                />
                {errors.totalQuantity ? <span style={errorStyle}>Gesamtmenge muss groesser 0 sein.</span> : null}
            </label>

            {submitError ? <p style={errorStyle}>{submitError}</p> : null}
            {submitFieldErrors.length > 0 ? (
                <ul style={errorListStyle}>
                    {submitFieldErrors.map((error) => (
                        <li key={error}>{error}</li>
                    ))}
                </ul>
            ) : null}

            <button data-testid="inventory-submit-button" type="submit" disabled={isSubmitting} style={buttonStyle}>
                {isSubmitting ? "Speichert..." : mode === "create" ? "Anlegen" : "Speichern"}
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
