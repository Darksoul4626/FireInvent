#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_PATH="$ROOT_DIR/src/FireInvent.Api/FireInvent.Api.csproj"
OUTPUT_PATH="$ROOT_DIR/openapi/openapi.v1.json"
URL="${OPENAPI_URL:-http://localhost:5153/openapi/v1.json}"
APP_URLS="${OPENAPI_APP_URLS:-http://localhost:5153}"

mkdir -p "$(dirname "$OUTPUT_PATH")"

ASPNETCORE_ENVIRONMENT=Development ASPNETCORE_URLS="$APP_URLS" FIREINVENT_DISABLE_HTTPS_REDIRECTION=true \
  dotnet run --project "$PROJECT_PATH" > "$ROOT_DIR/openapi/export-openapi.log" 2>&1 &
APP_PID=$!

cleanup() {
  if kill -0 "$APP_PID" 2>/dev/null; then
    kill "$APP_PID" || true
    wait "$APP_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

for i in {1..30}; do
  if curl -fsS "$URL" -o "$OUTPUT_PATH"; then
    echo "OpenAPI exported to $OUTPUT_PATH"
    exit 0
  fi
  sleep 2
done

echo "Failed to fetch OpenAPI document from $URL"
exit 1
