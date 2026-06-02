import { requireDatabaseUrl } from "@/modules/shared/config/env";
import { verifyImport } from "@/modules/verification/infrastructure/services/content-importer";

async function main() {
  requireDatabaseUrl();
  const importId = process.argv[2];

  if (!importId) {
    throw new Error("Usage: npm run content:verify -- <import-id>");
  }

  const result = await verifyImport(importId);
  console.log(
    `Verification ${result.status}: checked ${result.checkedRecords}, differences ${result.differencesFound}.`
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
