import { requireDatabaseUrl } from "@/modules/shared/config/env";
import { stageImportFromFile } from "@/modules/verification/infrastructure/services/content-importer";

async function main() {
  requireDatabaseUrl();
  const filePath = process.argv[2];

  if (!filePath) {
    throw new Error("Usage: npm run content:import -- data/sources/<type>/source.json");
  }

  const result = await stageImportFromFile(filePath);
  console.log(
    `Staged ${result.contentType} import ${result.id} with ${result.totalRecords} rows.`
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
