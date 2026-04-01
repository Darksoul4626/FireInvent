import { NextResponse } from "next/server";
import { RentalBookingsService } from "@/lib/api/generated";
import { configureOpenApiClient } from "@/lib/api/openapi-client";
import { toApiErrorResponse } from "@/app/api/proxy/_shared/proxy-api-error";

type RouteParams = {
    params: Promise<{ id: string }>;
};

export async function POST(_: Request, { params }: RouteParams) {
    const { id } = await params;
    try {
        configureOpenApiClient();
        const canceled = await RentalBookingsService.postApiRentalsCancel({ id });
        return NextResponse.json(canceled, { status: 200 });
    } catch (error) {
        return toApiErrorResponse(error, "Rental cancel failed");
    }
}
