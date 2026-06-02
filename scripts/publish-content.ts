import { requireDatabaseUrl } from "@/modules/shared/config/env";
import { publishVerifiedImport } from "@/modules/verification/infrastructure/services/content-importer";

async function main() {
  requireDatabaseUrl();
  const importId = process.argv[2];

  if (!importId) {
    throw new Error("Usage: npm run content:publish -- <import-id>");
  }

  await publishVerifiedImport(importId);
  console.log(`Published verified import ${importId}.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
