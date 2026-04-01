import { NextResponse } from "next/server";
import { AvailabilityService } from "@/lib/api/generated";
import { configureOpenApiClient } from "@/lib/api/openapi-client";
import { toApiErrorResponse } from "@/app/api/proxy/_shared/proxy-api-error";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
    const { id } = await params;

    try {
        configureOpenApiClient();

        const { searchParams } = new URL(request.url);
        const from = searchParams.get("from") ?? undefined;
        const to = searchParams.get("to") ?? undefined;

        const availability = await AvailabilityService.getApiItemsAvailability({
            itemId: id,
            from,
            to
        });

        return NextResponse.json(availability, { status: 200 });
    } catch (error) {
        return toApiErrorResponse(error, "Availability request failed");
    }
}
