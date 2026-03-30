"use client";

import { Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ActionButtonGroup } from "@/components/ui/action-button-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { InventoryCategoryDto } from "@/lib/api/fireinvent-api";
import { parseApiError } from "@/lib/api/api-error";

type Props = {
    initialCategories: InventoryCategoryDto[];
};

type BusyAction = "create" | `update:${string}` | `delete:${string}` | null;

export function InventoryCategoryManager({ initialCategories }: Readonly<Props>) {
    const [categories, setCategories] = useState<InventoryCategoryDto[]>(initialCategories);
    const [createName, setCreateName] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [busyAction, setBusyAction] = useState<BusyAction>(null);

    const sortedCategories = useMemo(() => {
        return [...categories].sort((a, b) => a.name.localeCompare(b.name, "de"));
    }, [categories]);

    async function createCategory() {
        const name = createName.trim();
        if (!name) {
            setErrorMessage("Bitte einen Kategorienamen eingeben.");
            return;
        }

        setErrorMessage(null);
        setBusyAction("create");

        try {
            const response = await fetch("/api/proxy/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name })
            });

            if (!response.ok) {
                const parsed = await parseApiError(response, "Kategorie konnte nicht erstellt werden");
                setErrorMessage(parsed.message);
                return;
            }

            const created = (await response.json()) as InventoryCategoryDto;
            setCategories((previous) => [...previous, created]);
            setCreateName("");
        } finally {
            setBusyAction(null);
        }
    }

    async function updateCategory(id: string) {
        const name = editingName.trim();
        if (!name) {
            setErrorMessage("Bitte einen gueltigen Kategorienamen eingeben.");
            return;
        }

        setErrorMessage(null);
        setBusyAction(`update:${id}`);

        try {
            const response = await fetch(`/api/proxy/categories/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name })
            });

            if (!response.ok) {
                const parsed = await parseApiError(response, "Kategorie konnte nicht aktualisiert werden");
                setErrorMessage(parsed.message);
                return;
            }

            const updated = (await response.json()) as InventoryCategoryDto;
            setCategories((previous) => previous.map((entry) => (entry.id === id ? updated : entry)));
            setEditingId(null);
            setEditingName("");
        } finally {
            setBusyAction(null);
        }
    }

    async function deleteCategory(id: string) {
        setErrorMessage(null);
        setBusyAction(`delete:${id}`);

        try {
            const response = await fetch(`/api/proxy/categories/${id}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                const parsed = await parseApiError(response, "Kategorie konnte nicht geloescht werden");
                setErrorMessage(parsed.message);
                return;
            }

            setCategories((previous) => previous.filter((entry) => entry.id !== id));
        } finally {
            setBusyAction(null);
        }
    }

    return (
        <section className="grid gap-4" data-testid="category-manager-root">
            <div className="grid gap-2 rounded-md border border-(--border) p-3">
                <p className="m-0 text-sm font-semibold">Neue Kategorie anlegen</p>
                <div className="flex flex-wrap items-end gap-2">
                    <label className="grid min-w-64 flex-1 gap-2 text-sm font-semibold">
                        <span>Name</span>
                        <Input
                            data-testid="category-create-name-input"
                            value={createName}
                            maxLength={128}
                            onChange={(event) => setCreateName(event.target.value)}
                            placeholder="z.B. Atemschutz"
                        />
                    </label>
                    <Button
                        data-testid="category-create-submit"
                        type="button"
                        onClick={() => void createCategory()}
                        disabled={busyAction !== null}
                    >
                        {busyAction === "create" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        Erstellen
                    </Button>
                </div>
            </div>

            {errorMessage ? (
                <p data-testid="category-manager-error" className="m-0 text-sm text-red-700 dark:text-red-400">{errorMessage}</p>
            ) : null}

            <div className="grid gap-2">
                {sortedCategories.map((category) => {
                    const isEditing = editingId === category.id;
                    const isBusy = busyAction === `update:${category.id}` || busyAction === `delete:${category.id}`;

                    return (
                        <article key={category.id} className="grid gap-2 rounded-md border border-(--border) p-3" data-testid={`category-row-${category.id}`}>
                            {isEditing ? (
                                <div className="flex flex-wrap items-end gap-2">
                                    <label className="grid min-w-64 flex-1 gap-2 text-sm font-semibold">
                                        <span>Name bearbeiten</span>
                                        <Input
                                            data-testid={`category-edit-name-input-${category.id}`}
                                            value={editingName}
                                            maxLength={128}
                                            onChange={(event) => setEditingName(event.target.value)}
                                        />
                                    </label>
                                    <Button
                                        data-testid={`category-edit-save-${category.id}`}
                                        type="button"
                                        onClick={() => void updateCategory(category.id)}
                                        disabled={busyAction !== null}
                                    >
                                        {busyAction === `update:${category.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        Speichern
                                    </Button>
                                    <Button
                                        data-testid={`category-edit-cancel-${category.id}`}
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setEditingId(null);
                                            setEditingName("");
                                        }}
                                        disabled={busyAction !== null}
                                    >
                                        <X className="h-4 w-4" />
                                        Abbrechen
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p data-testid={`category-name-${category.id}`} className="m-0 text-sm font-semibold">{category.name}</p>
                                        <p className="m-0 text-xs text-slate-600 dark:text-slate-300">
                                            Aktualisiert: {new Date(category.updatedAt).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}
                                        </p>
                                    </div>
                                    <div className="grid justify-items-end gap-1">
                                        <p className="m-0 text-xs font-semibold text-slate-600 dark:text-slate-300">Aktionen</p>
                                        <ActionButtonGroup data-testid={`category-row-actions-${category.id}`}>
                                            <Button
                                                data-testid={`category-edit-button-${category.id}`}
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setEditingId(category.id);
                                                    setEditingName(category.name);
                                                }}
                                                disabled={busyAction !== null}
                                            >
                                                <Pencil className="h-4 w-4" />
                                                Bearbeiten
                                            </Button>
                                            <Button
                                                data-testid={`category-delete-button-${category.id}`}
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => void deleteCategory(category.id)}
                                                disabled={isBusy || busyAction !== null}
                                            >
                                                {busyAction === `delete:${category.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                Loeschen
                                            </Button>
                                        </ActionButtonGroup>
                                    </div>
                                </div>
                            )}
                        </article>
                    );
                })}

                {sortedCategories.length === 0 ? (
                    <p className="m-0 text-sm text-slate-600 dark:text-slate-300">Noch keine Kategorien vorhanden.</p>
                ) : null}
            </div>
        </section>
    );
}
