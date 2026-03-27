import { NextResponse } from "next/server";
import { InventoryItemsService, type UpdateInventoryItemRequest } from "@/lib/api/generated";
import { configureOpenApiClient } from "@/lib/api/openapi-client";
import { toApiErrorResponse } from "@/app/api/proxy/_shared/proxy-api-error";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    try {
        configureOpenApiClient();
        const body = (await request.json()) as UpdateInventoryItemRequest;
        const updated = await InventoryItemsService.putApiItems({ id, requestBody: body });
        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        return toApiErrorResponse(error, "Inventory item update failed");
    }
}
