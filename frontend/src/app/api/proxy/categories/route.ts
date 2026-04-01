import { NextResponse } from "next/server";
import { InventoryCategoriesService, type CreateInventoryCategoryRequest } from "@/lib/api/generated";
import { configureOpenApiClient } from "@/lib/api/openapi-client";
import { toApiErrorResponse } from "@/app/api/proxy/_shared/proxy-api-error";

export async function GET() {
    try {
        configureOpenApiClient();
        const categories = await InventoryCategoriesService.getApiCategories();
        return NextResponse.json(categories, { status: 200 });
    } catch (error) {
        return toApiErrorResponse(error, "Category list failed");
    }
}

export async function POST(request: Request) {
    try {
        configureOpenApiClient();
        const body = (await request.json()) as CreateInventoryCategoryRequest;
        const created = await InventoryCategoriesService.postApiCategories({ requestBody: body });
        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        return toApiErrorResponse(error, "Category create failed");
    }
}
