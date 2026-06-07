import { requireDatabaseUrl } from "@/modules/shared/config/env";
import { prisma } from "@/modules/shared/database/prisma";

async function main() {
  requireDatabaseUrl();
  const [
    sources,
    imports,
    activeQuranTexts,
    activeTranslations,
    activeTafsirs,
    unsafeQuranRows,
    unsafeTranslationRows,
    unsafeTafsirRows
  ] =
    await Promise.all([
      prisma.contentSource.count(),
      prisma.contentImport.count(),
      prisma.quranText.count({ where: { active: true } }),
      prisma.translation.count({ where: { active: true } }),
      prisma.tafsir.count({ where: { active: true } }),
      prisma.quranText.count({
        where: {
          active: true,
          OR: [
            { verifiedAt: null },
            { source: { trustStatus: { not: "approved" } } },
            { import: { importStatus: { not: "published" } } }
          ]
        }
      }),
      prisma.translation.count({
        where: {
          active: true,
          OR: [
            { source: { trustStatus: { not: "approved" } } },
            { import: { importStatus: { not: "published" } } }
          ]
        }
      }),
      prisma.tafsir.count({
        where: {
          active: true,
          OR: [
            { source: { trustStatus: { not: "approved" } } },
            { import: { importStatus: { not: "published" } } }
          ]
        }
      })
    ]);

  const unsafePublicRows =
    unsafeQuranRows + unsafeTranslationRows + unsafeTafsirRows;

  console.log(
    JSON.stringify(
      {
        sources,
        imports,
        activeQuranTexts,
        activeTranslations,
        activeTafsirs,
        unsafeQuranRows,
        unsafeTranslationRows,
        unsafeTafsirRows,
        passed: unsafePublicRows === 0
      },
      null,
      2
    )
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
