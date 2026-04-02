import { NextResponse } from "next/server";
import { InventoryItemsService, type CreateInventoryItemRequest } from "@/lib/api/generated";
import { configureOpenApiClient } from "@/lib/api/openapi-client";
import { toApiErrorResponse } from "@/app/api/proxy/_shared/proxy-api-error";

export async function GET(request: Request) {
    try {
        configureOpenApiClient();

        const { searchParams } = new URL(request.url);
        const isOverviewRequest = searchParams.get("overview") === "true";

        if (isOverviewRequest) {
            const overview = await InventoryItemsService.getApiItemsOverview({
                page: searchParams.get("page") ?? undefined,
                pageSize: searchParams.get("pageSize") ?? undefined,
                search: searchParams.get("search") ?? undefined,
                category: searchParams.get("category") ?? undefined,
                condition: searchParams.get("condition") ?? undefined,
                at: searchParams.get("at") ?? undefined
            });

            return NextResponse.json(overview, { status: 200 });
        }

        const items = await InventoryItemsService.getApiItems();
        return NextResponse.json(items, { status: 200 });
    } catch (error) {
        return toApiErrorResponse(error, "Inventory item list failed");
    }
}

export async function POST(request: Request) {
    try {
        configureOpenApiClient();
        const body = (await request.json()) as CreateInventoryItemRequest;
        const created = await InventoryItemsService.postApiItems({ requestBody: body });
        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        return toApiErrorResponse(error, "Inventory item create failed");
    }
}
