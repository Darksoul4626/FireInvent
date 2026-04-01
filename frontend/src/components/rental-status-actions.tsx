"use client";

import { Check, CornerDownLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActionButtonGroup } from "@/components/ui/action-button-group";
import { Button } from "@/components/ui/button";
import { parseApiError } from "@/lib/api/api-error";

type Props = {
    rentalId: string;
    status: "Planned" | "Active" | "Returned" | "Canceled" | "Completed";
    showPlaceholder?: boolean;
};

export function RentalStatusActions({ rentalId, status, showPlaceholder = false }: Readonly<Props>) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<"cancel" | "return" | "complete" | null>(null);

    const canMutate = status === "Planned" || status === "Active" || status === "Returned";

    async function run(action: "cancel" | "return" | "complete") {
        setError(null);
        setLoading(action);

        try {
            const response = await fetch(`/api/proxy/rentals/${rentalId}/${action}`, {
                method: "POST"
            });

            if (response.ok) {
                router.refresh();
                return;
            }

            const parsed = await parseApiError(response, `${action} fehlgeschlagen`);
            const details = parsed.fieldErrors.length > 0 ? ` | ${parsed.fieldErrors.join(" | ")}` : "";
            setError(`${parsed.message}${details}`);
        } finally {
            setLoading(null);
        }
    }

    if (!canMutate) {
        if (showPlaceholder) {
            return <span className="text-slate-500 dark:text-slate-400">-</span>;
        }

        return null;
    }

    return (
        <div className="grid gap-2">
            <ActionButtonGroup data-testid={`rental-row-lifecycle-actions-${rentalId}`}>
                {status === "Planned" || status === "Active" ? (
                    <Button
                        data-testid={`rental-cancel-button-${rentalId}`}
                        variant="outline"
                        size="sm"
                        disabled={loading !== null}
                        onClick={() => run("cancel")}
                        type="button"
                    >
                        <X className="h-4 w-4" />
                        {loading === "cancel" ? "..." : "Cancel"}
                    </Button>
                ) : null}
                {status === "Active" ? (
                    <Button
                        data-testid={`rental-return-button-${rentalId}`}
                        variant="outline"
                        size="sm"
                        disabled={loading !== null}
                        onClick={() => run("return")}
                        type="button"
                    >
                        <CornerDownLeft className="h-4 w-4" />
                        {loading === "return" ? "..." : "Return"}
                    </Button>
                ) : null}
                {status === "Returned" ? (
                    <Button
                        data-testid={`rental-complete-button-${rentalId}`}
                        variant="outline"
                        size="sm"
                        disabled={loading !== null}
                        onClick={() => run("complete")}
                        type="button"
                    >
                        <Check className="h-4 w-4" />
                        {loading === "complete" ? "..." : "Complete"}
                    </Button>
                ) : null}
            </ActionButtonGroup>
            {error ? <span className="text-xs text-red-700 dark:text-red-400">{error}</span> : null}
        </div>
    );
}
