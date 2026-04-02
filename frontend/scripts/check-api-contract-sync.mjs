import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(frontendDir, "..");
const committedClientDir = path.resolve(
  frontendDir,
  "src",
  "lib",
  "api",
  "generated",
);
const openApiSpecPath = path.resolve(
  repoRoot,
  "backend",
  "openapi",
  "openapi.v1.json",
);
const ignoredFiles = new Set([".gitkeep"]);

function listFilesRecursively(directory, baseDirectory = directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFilesRecursively(fullPath, baseDirectory));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const relativePath = path
      .relative(baseDirectory, fullPath)
      .replaceAll("\\", "/");
    if (!ignoredFiles.has(relativePath)) {
      files.push(relativePath);
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
}

function normalizeContent(content) {
  return content.replaceAll("\r\n", "\n").replaceAll(/\n*$/g, "\n");
}

if (!existsSync(openApiSpecPath)) {
  console.error(`OpenAPI spec not found: ${openApiSpecPath}`);
  console.error(
    "Run backend/scripts/export-openapi.sh before running this contract check.",
  );
  process.exit(1);
}

if (!existsSync(committedClientDir)) {
  console.error(`Generated client directory not found: ${committedClientDir}`);
  process.exit(1);
}

const tempRoot = mkdtempSync(path.join(frontendDir, ".tmp-openapi-check-"));
const tempClientDir = path.join(tempRoot, "generated");

try {
  execFileSync(process.execPath, ["./scripts/generate-api-client.mjs"], {
    cwd: frontendDir,
    stdio: "inherit",
    env: {
      ...process.env,
      OPENAPI_SPEC_URL: openApiSpecPath,
      OPENAPI_OUTPUT_DIR: tempClientDir,
    },
  });

  const committedFiles = listFilesRecursively(committedClientDir);
  const generatedFiles = listFilesRecursively(tempClientDir);

  const committedSet = new Set(committedFiles);
  const generatedSet = new Set(generatedFiles);
  const missingFiles = committedFiles.filter((file) => !generatedSet.has(file));
  const unexpectedFiles = generatedFiles.filter(
    (file) => !committedSet.has(file),
  );
  const changedFiles = committedFiles.filter((file) => {
    if (!generatedSet.has(file)) {
      return false;
    }

    const committedPath = path.join(committedClientDir, file);
    const generatedPath = path.join(tempClientDir, file);
    const committedContent = normalizeContent(
      readFileSync(committedPath, "utf8"),
    );
    const generatedContent = normalizeContent(
      readFileSync(generatedPath, "utf8"),
    );
    return committedContent !== generatedContent;
  });

  if (
    missingFiles.length > 0 ||
    unexpectedFiles.length > 0 ||
    changedFiles.length > 0
  ) {
    if (missingFiles.length > 0) {
      console.error("Missing generated files:");
      for (const file of missingFiles) {
        console.error(`  - ${file}`);
      }
    }

    if (unexpectedFiles.length > 0) {
      console.error("Unexpected generated files:");
      for (const file of unexpectedFiles) {
        console.error(`  - ${file}`);
      }
    }

    if (changedFiles.length > 0) {
      console.error("Changed generated files:");
      for (const file of changedFiles) {
        console.error(`  - ${file}`);
      }
    }

    throw new Error("Generated client differs from committed client.");
  }

  console.log("OpenAPI client is in sync with backend/openapi/openapi.v1.json");
} catch {
  console.error(
    "Contract drift detected: generated API client is out of sync.",
  );
  console.error(
    "Run npm run generate:api-client and commit the generated changes.",
  );
  process.exit(1);
} finally {
  // rmSync(tempRoot, { recursive: true, force: true });
}
