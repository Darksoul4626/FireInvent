import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(frontendDir, "..");
const openApiSpecPath = path.resolve(
  repoRoot,
  "backend",
  "openapi",
  "openapi.v1.json",
);

if (!existsSync(openApiSpecPath)) {
  console.error(`OpenAPI spec not found: ${openApiSpecPath}`);
  console.error(
    "Run backend/scripts/export-openapi.sh before running this contract check.",
  );
  process.exit(1);
}

execFileSync("node", ["./scripts/generate-api-client.mjs"], {
  cwd: frontendDir,
  stdio: "inherit",
  env: {
    ...process.env,
    OPENAPI_SPEC_URL: openApiSpecPath,
  },
});

try {
  execFileSync(
    "git",
    ["diff", "--exit-code", "--", "frontend/src/lib/api/generated"],
    {
      cwd: repoRoot,
      stdio: "inherit",
    },
  );
  console.log("OpenAPI client is in sync with backend/openapi/openapi.v1.json");
} catch {
  console.error(
    "Contract drift detected: generated API client is out of sync.",
  );
  console.error(
    "Run npm run generate:api-client and commit the generated changes.",
  );
  process.exit(1);
}
