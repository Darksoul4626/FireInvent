import { OpenAPI } from "@/lib/api/generated";

export function getApiBaseUrl(): string {
    return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5153";
}

export function configureOpenApiClient(): void {
    OpenAPI.BASE = getApiBaseUrl();
}
