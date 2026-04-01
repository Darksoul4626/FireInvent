import { NextResponse } from "next/server";
import { RentalBookingsService, type UpdateRentalBookingRequest } from "@/lib/api/generated";
import { configureOpenApiClient } from "@/lib/api/openapi-client";
import { toApiErrorResponse } from "@/app/api/proxy/_shared/proxy-api-error";

type RouteParams = {
    params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: RouteParams) {
    const { id } = await params;
    try {
        configureOpenApiClient();
        const body = (await request.json()) as UpdateRentalBookingRequest;
        const updated = await RentalBookingsService.putApiRentals({ id, requestBody: body });
        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        return toApiErrorResponse(error, "Rental update failed");
    }
}
