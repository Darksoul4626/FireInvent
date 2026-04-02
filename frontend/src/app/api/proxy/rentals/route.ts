import { NextResponse } from "next/server";
import { RentalBookingsService, type CreateRentalBookingRequest } from "@/lib/api/generated";
import { configureOpenApiClient } from "@/lib/api/openapi-client";
import { toApiErrorResponse } from "@/app/api/proxy/_shared/proxy-api-error";

export async function GET(request: Request) {
    try {
        configureOpenApiClient();

        const { searchParams } = new URL(request.url);
        const isOverviewRequest = searchParams.get("overview") === "true";

        if (isOverviewRequest) {
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
        }

        const rentals = await RentalBookingsService.getApiRentals();
        return NextResponse.json(rentals, { status: 200 });
    } catch (error) {
        return toApiErrorResponse(error, "Rental list failed");
    }
}

export async function POST(request: Request) {
    try {
        configureOpenApiClient();
        const body = (await request.json()) as CreateRentalBookingRequest;
        const created = await RentalBookingsService.postApiRentals({ requestBody: body });
        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        return toApiErrorResponse(error, "Rental create failed");
    }
}
