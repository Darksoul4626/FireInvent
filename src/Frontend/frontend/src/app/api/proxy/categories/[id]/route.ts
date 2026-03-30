import { NextResponse } from "next/server";
import { InventoryCategoriesService, type UpdateInventoryCategoryRequest } from "@/lib/api/generated";
import { configureOpenApiClient } from "@/lib/api/openapi-client";
import { toApiErrorResponse } from "@/app/api/proxy/_shared/proxy-api-error";

type RouteParams = {
    params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: RouteParams) {
    const { id } = await params;
    try {
        configureOpenApiClient();
        const body = (await request.json()) as UpdateInventoryCategoryRequest;
        const updated = await InventoryCategoriesService.putApiCategories({ id, requestBody: body });
        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        return toApiErrorResponse(error, "Category update failed");
    }
}

export async function DELETE(_: Request, { params }: RouteParams) {
    const { id } = await params;
    try {
        configureOpenApiClient();
        await InventoryCategoriesService.deleteApiCategories({ id });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return toApiErrorResponse(error, "Category delete failed");
    }
}
