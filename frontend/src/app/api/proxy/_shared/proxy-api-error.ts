import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api/generated";

export function toApiErrorResponse(error: unknown, fallbackMessage: string): NextResponse {
    if (error instanceof ApiError) {
        const body =
            typeof error.body === "object" && error.body !== null
                ? error.body
                : { detail: error.message, status: error.status };

        return NextResponse.json(body, { status: error.status });
    }

    return NextResponse.json(
        {
            title: "Proxy request failed",
            detail: fallbackMessage
        },
        { status: 500 }
    );
}
