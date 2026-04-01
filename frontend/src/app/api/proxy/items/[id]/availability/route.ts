import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/api/openapi-client";
import { toApiErrorResponse } from "@/app/api/proxy/_shared/proxy-api-error";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
    const { id } = await params;

    try {
        const { searchParams } = new URL(request.url);
        const upstreamUrl = new URL(`/api/items/${id}/availability`, getApiBaseUrl());

        const from = searchParams.get("from");
        const to = searchParams.get("to");
        const excludeBookingId = searchParams.get("excludeBookingId");

        if (from) {
            upstreamUrl.searchParams.set("from", from);
        }

        if (to) {
            upstreamUrl.searchParams.set("to", to);
        }

        if (excludeBookingId) {
            upstreamUrl.searchParams.set("excludeBookingId", excludeBookingId);
        }

        const response = await fetch(upstreamUrl, {
            method: "GET",
            headers: {
                Accept: "application/json"
            },
            cache: "no-store"
        });

        const payload = await response.json();

        return NextResponse.json(payload, { status: response.status });
    } catch (error) {
        return toApiErrorResponse(error, "Availability request failed");
    }
}
