"use client";

import Link from "next/link";
import { Loader2, Plus, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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
    categoryOptions: Array<{ id: string; name: string }>;
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

export function InventoryItemForm({ mode, itemId, categoryOptions, initialValues }: Readonly<Props>) {
    const router = useRouter();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitFieldErrors, setSubmitFieldErrors] = useState<string[]>([]);
    const [inlineCategoryError, setInlineCategoryError] = useState<string | null>(null);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [localCategoryOptions, setLocalCategoryOptions] = useState(categoryOptions);

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
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormValues>({ defaultValues: defaults });

    const categoryValue = watch("category");
    const normalizedCategory = categoryValue?.trim() ?? "";
    const hasExistingCategory = localCategoryOptions
        .some((category) => category.name.toLowerCase() === normalizedCategory.toLowerCase());

    let submitLabel = mode === "create" ? "Anlegen" : "Speichern";
    if (isSubmitting) {
        submitLabel = "Speichert...";
    }

    const onSubmit = handleSubmit(async (values) => {
        setSubmitError(null);
        setSubmitFieldErrors([]);
        setInlineCategoryError(null);

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

    async function createCategoryInline() {
        const name = normalizedCategory;
        if (!name) {
            setInlineCategoryError("Bitte zuerst einen Kategorienamen eingeben.");
            return;
        }

        if (hasExistingCategory) {
            setInlineCategoryError(null);
            return;
        }

        setInlineCategoryError(null);
        setIsCreatingCategory(true);

        try {
            const response = await fetch("/api/proxy/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name })
            });

            if (!response.ok) {
                const parsed = await parseApiError(response, "Kategorie konnte nicht erstellt werden");
                setInlineCategoryError(parsed.message);
                return;
            }

            const created = (await response.json()) as { id: string; name: string };
            setLocalCategoryOptions((previous) => {
                const alreadyPresent = previous.some((entry) => entry.name.toLowerCase() === created.name.toLowerCase());
                if (alreadyPresent) {
                    return previous;
                }

                return [...previous, created]
                    .sort((a, b) => a.name.localeCompare(b.name, "de"));
            });
            setValue("category", created.name, { shouldDirty: true, shouldValidate: true });
            setInlineCategoryError(null);
        } finally {
            setIsCreatingCategory(false);
        }
    }

    return (
        <form data-testid="inventory-item-form" onSubmit={onSubmit} className="grid max-w-3xl gap-4">
            {mode === "create" ? (
                <label className="grid gap-2 text-sm font-semibold">
                    Inventar-Code
                    <Input
                        data-testid="inventory-code-input"
                        {...register("inventoryCode", { required: true, maxLength: 64 })}
                    />
                    {errors.inventoryCode ? <span className="text-sm text-red-700 dark:text-red-400">Code ist erforderlich (max. 64).</span> : null}
                </label>
            ) : null}

            <label className="grid gap-2 text-sm font-semibold">
                Name
                <Input data-testid="inventory-name-input" {...register("name", { required: true, maxLength: 256 })} />
                {errors.name ? <span className="text-sm text-red-700 dark:text-red-400">Name ist erforderlich (max. 256).</span> : null}
            </label>

            <label className="grid gap-2 text-sm font-semibold">
                Kategorie
                <Input
                    data-testid="inventory-category-select"
                    list="inventory-category-options"
                    placeholder="Kategorie auswaehlen oder neu eingeben"
                    {...register("category", { required: true, maxLength: 128 })}
                />
                <datalist id="inventory-category-options">
                    {localCategoryOptions.map((category) => (
                        <option key={category.id} value={category.name} />
                    ))}
                </datalist>
                {errors.category ? <span className="text-sm text-red-700 dark:text-red-400">Kategorie ist erforderlich (max. 128).</span> : null}
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        data-testid="inventory-category-create-inline"
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isCreatingCategory || !normalizedCategory || hasExistingCategory}
                        onClick={() => void createCategoryInline()}
                    >
                        {isCreatingCategory ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        Kategorie anlegen
                    </Button>
                    <span className="text-xs text-slate-600 dark:text-slate-300">
                        Kategorie fehlt? <Link href="/inventory/categories" className="font-semibold text-red-700 hover:underline dark:text-red-400">Zur Kategorieverwaltung</Link>
                    </span>
                </div>
                {inlineCategoryError ? <span className="text-sm text-red-700 dark:text-red-400">{inlineCategoryError}</span> : null}
            </label>

            <label className="grid gap-2 text-sm font-semibold">
                Zustand
                <Select data-testid="inventory-condition-select" {...register("condition", { required: true })}>
                    <option value="Unknown">Unknown</option>
                    <option value="Good">Good</option>
                    <option value="NeedsRepair">NeedsRepair</option>
                    <option value="OutOfService">OutOfService</option>
                </Select>
            </label>

            <label className="grid gap-2 text-sm font-semibold">
                Ort
                <Input
                    data-testid="inventory-location-input"
                    {...register("location", { required: true, maxLength: 128 })}
                />
                {errors.location ? <span className="text-sm text-red-700 dark:text-red-400">Ort ist erforderlich (max. 128).</span> : null}
            </label>

            <label className="grid gap-2 text-sm font-semibold">
                Gesamtmenge
                <Input
                    data-testid="inventory-total-quantity-input"
                    type="number"
                    min={1}
                    {...register("totalQuantity", {
                        required: true,
                        valueAsNumber: true,
                        min: 1
                    })}
                />
                {errors.totalQuantity ? <span className="text-sm text-red-700 dark:text-red-400">Gesamtmenge muss groesser 0 sein.</span> : null}
            </label>

            {submitError ? <p className="m-0 text-sm text-red-700 dark:text-red-400">{submitError}</p> : null}
            {submitFieldErrors.length > 0 ? (
                <ul className="m-0 grid list-disc gap-1 pl-5 text-sm text-red-700 dark:text-red-400">
                    {submitFieldErrors.map((error) => (
                        <li key={error}>{error}</li>
                    ))}
                </ul>
            ) : null}

            <Button data-testid="inventory-submit-button" type="submit" disabled={isSubmitting} className="w-fit">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "create" ? <Plus className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {submitLabel}
            </Button>
        </form>
    );
}
