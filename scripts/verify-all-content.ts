import { requireDatabaseUrl } from "@/modules/shared/config/env";
import { prisma } from "@/modules/shared/database/prisma";
import { verifyImport } from "@/modules/verification/infrastructure/services/content-importer";

async function main() {
  requireDatabaseUrl();
  const stagedImports = await prisma.contentImport.findMany({
    where: { importStatus: "staged" },
    select: { id: true }
  });

  for (const contentImport of stagedImports) {
    const result = await verifyImport(contentImport.id);
    console.log(
      `${contentImport.id}: ${result.status} (${result.differencesFound} differences)`
    );
  }

  if (stagedImports.length === 0) {
    console.log("No staged imports found.");
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
