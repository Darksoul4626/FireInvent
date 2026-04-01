"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { parseApiError } from "@/lib/api/api-error";

type Props = {
    itemId: string;
    itemName: string;
    redirectPath?: string;
    buttonVariant?: "outline" | "destructive";
};

export function InventoryItemDeleteAction({ itemId, itemName, redirectPath, buttonVariant }: Readonly<Props>) {
    const router = useRouter();
    const [isBusy, setIsBusy] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    async function onDelete() {
        if (isBusy) {
            return;
        }

        const confirmed = globalThis.confirm(`Soll der Gegenstand "${itemName}" wirklich geloescht werden?`);
        if (!confirmed) {
            return;
        }

        setErrorMessage(null);
        setIsBusy(true);

        try {
            const response = await fetch(`/api/proxy/items/${itemId}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                const parsed = await parseApiError(response, "Gegenstand konnte nicht geloescht werden");
                setErrorMessage(parsed.message);
                return;
            }

            if (redirectPath) {
                router.push(redirectPath);
            }
            router.refresh();
        } finally {
            setIsBusy(false);
        }
    }

    return (
        <div className="grid gap-1">
            <Button
                data-testid={`inventory-delete-button-${itemId}`}
                type="button"
                variant={buttonVariant ?? "outline"}
                size="sm"
                onClick={() => void onDelete()}
                disabled={isBusy}
            >
                {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                loeschen
            </Button>
            {errorMessage ? (
                <p data-testid={`inventory-delete-error-${itemId}`} className="m-0 text-xs text-red-700 dark:text-red-400">
                    {errorMessage}
                </p>
            ) : null}
        </div>
    );
}
