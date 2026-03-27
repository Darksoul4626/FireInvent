import { generate } from "openapi-typescript-codegen";

const input =
  process.env.OPENAPI_SPEC_URL ?? "http://localhost:5153/openapi/v1.json";
const output = "src/lib/api/generated";

await generate({
  input,
  output,
  httpClient: "axios",
  useOptions: true,
  useUnionTypes: false,
  exportCore: true,
  exportServices: true,
  exportModels: true,
  exportSchemas: true,
});

console.log(`Generated OpenAPI client from ${input} to ${output}`);
