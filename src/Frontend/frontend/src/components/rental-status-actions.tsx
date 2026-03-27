"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CSSProperties } from "react";
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
        return <span style={{ color: "#6b7280" }}>-</span>;
    }

    return (
        <div style={{ display: "grid", gap: 6 }}>
            <div style={{ display: "flex", gap: 8 }}>
                <button style={smallButton} disabled={loading !== null} onClick={() => run("cancel")} type="button">
                    {loading === "cancel" ? "..." : "Cancel"}
                </button>
                <button style={smallButton} disabled={loading !== null} onClick={() => run("complete")} type="button">
                    {loading === "complete" ? "..." : "Complete"}
                </button>
            </div>
            {error ? <span style={{ color: "#b91c1c", fontSize: 12 }}>{error}</span> : null}
        </div>
    );
}

const smallButton: CSSProperties = {
    border: "1px solid #d1d5db",
    borderRadius: 6,
    background: "#ffffff",
    padding: "4px 8px",
    cursor: "pointer"
};
