import { requireDatabaseUrl } from "@/modules/shared/config/env";
import {
  publishVerifiedImport,
  verifyImport
} from "@/modules/verification/infrastructure/services/content-importer";

async function main() {
  requireDatabaseUrl();
  const importId = process.argv[2];
  const shouldPublish = process.argv.includes("--publish");

  if (!importId) {
    throw new Error("Usage: npm run content:verify:quran -- <import-id> [--publish]");
  }

  const result = await verifyImport(importId);
  console.log(
    `Verification ${result.status}: checked ${result.checkedRecords}, differences ${result.differencesFound}.`
  );

  if (shouldPublish) {
    await publishVerifiedImport(importId);
    console.log(`Published verified import ${importId}.`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
