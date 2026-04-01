import { NextResponse } from "next/server";
import { RentalBookingsService, type CreateRentalBookingRequest } from "@/lib/api/generated";
import { configureOpenApiClient } from "@/lib/api/openapi-client";
import { toApiErrorResponse } from "@/app/api/proxy/_shared/proxy-api-error";

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
