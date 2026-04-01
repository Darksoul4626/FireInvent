import { NextResponse } from "next/server";
import { RentalBookingsService } from "@/lib/api/generated";
import { configureOpenApiClient } from "@/lib/api/openapi-client";
import { toApiErrorResponse } from "@/app/api/proxy/_shared/proxy-api-error";

export async function GET(request: Request) {
    try {
        configureOpenApiClient();
        const { searchParams } = new URL(request.url);

        const overview = await RentalBookingsService.getApiRentalsOverview({
            page: searchParams.get("page") ?? undefined,
            pageSize: searchParams.get("pageSize") ?? undefined,
            search: searchParams.get("search") ?? undefined,
            status: searchParams.get("status") ?? undefined,
            itemId: searchParams.get("itemId") ?? undefined,
            from: searchParams.get("from") ?? undefined,
            to: searchParams.get("to") ?? undefined
        });

        return NextResponse.json(overview, { status: 200 });
    } catch (error) {
        return toApiErrorResponse(error, "Rental overview failed");
    }
}
