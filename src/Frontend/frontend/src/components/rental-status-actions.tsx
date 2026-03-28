"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { parseApiError } from "@/lib/api/api-error";

type Props = {
    rentalId: string;
    status: "Planned" | "Active" | "Canceled" | "Completed";
};

export function RentalStatusActions({ rentalId, status }: Props) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<"cancel" | "complete" | null>(null);

    const canMutate = status === "Planned" || status === "Active";

    async function run(action: "cancel" | "complete") {
        setError(null);
        setLoading(action);

        try {
            const response = await fetch(`/api/proxy/rentals/${rentalId}/${action}`, {
                method: "POST"
            });

            if (!response.ok) {
                const parsed = await parseApiError(response, `${action} fehlgeschlagen`);
                const details = parsed.fieldErrors.length > 0 ? ` | ${parsed.fieldErrors.join(" | ")}` : "";
                setError(`${parsed.message}${details}`);
            } else {
                router.refresh();
            }
        } finally {
            setLoading(null);
        }
    }

    if (!canMutate) {
        return <span className="text-slate-500 dark:text-slate-400">-</span>;
    }

    return (
        <div className="grid gap-2">
            <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={loading !== null} onClick={() => run("cancel")} type="button">
                    {loading === "cancel" ? "..." : "Cancel"}
                </Button>
                <Button variant="outline" size="sm" disabled={loading !== null} onClick={() => run("complete")} type="button">
                    {loading === "complete" ? "..." : "Complete"}
                </Button>
            </div>
            {error ? <span className="text-xs text-red-700 dark:text-red-400">{error}</span> : null}
        </div>
    );
}
