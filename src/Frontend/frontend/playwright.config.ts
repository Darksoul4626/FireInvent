import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: false,
    workers: 1,
    timeout: 60_000,
    expect: {
        timeout: 10_000
    },
    use: {
        baseURL: "http://localhost:3000",
        trace: "on-first-retry"
    },
    webServer: [
        {
            command:
                "dotnet run --project ../backend/src/FireInvent.Api/FireInvent.Api.csproj --urls http://localhost:5153",
            url: "http://localhost:5153/openapi/v1.json",
            reuseExistingServer: true,
            timeout: 120_000,
            env: {
                ASPNETCORE_ENVIRONMENT: "Development",
                FIREINVENT_DB_PROVIDER: "inmemory",
                FIREINVENT_DISABLE_HTTPS_REDIRECTION: "true"
            }
        },
        {
            command: "npm run dev",
            url: "http://localhost:3000",
            reuseExistingServer: true,
            timeout: 120_000,
            env: {
                NEXT_PUBLIC_API_BASE_URL: "http://localhost:5153"
            }
        }
    ]
});
