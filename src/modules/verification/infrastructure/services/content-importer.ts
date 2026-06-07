import { readFile } from "node:fs/promises";

import {
  rowChecksum,
  summaryChecksum
} from "@/modules/shared/crypto/checksum";
import { prisma } from "@/modules/shared/database/prisma";
import type { SourceFileInput } from "@/modules/shared/validation/content";
import { sourceFileSchema } from "@/modules/shared/validation/content";
import {
  validateImportSourceFile
} from "@/modules/verification/application/services/import-validation";
import { verifyStoredContentRows } from "@/modules/verification/application/services/verification-service";

export async function readSourceFile(filePath: string): Promise<SourceFileInput> {
  const file = await readFile(filePath, "utf8");
  const parsedJson = JSON.parse(file) as unknown;
  const parsed = sourceFileSchema.parse(parsedJson);
  const validation = validateImportSourceFile(parsed);

  if (!validation.ok) {
    throw new Error(
      validation.issues.map((issue) => issue.message).join("\n")
    );
  }

  return validation.data;
}

export async function stageImportFromFile(filePath: string) {
  const sourceFile = await readSourceFile(filePath);
  const metadata = sourceFile.metadata;

  const source = await prisma.contentSource.upsert({
    where: {
      name_provider_contentType_version: {
        name: metadata.sourceName,
        provider: metadata.provider,
        contentType: metadata.contentType,
        version: metadata.version ?? ""
      }
    },
    update: {
      language: metadata.language,
      url: metadata.url,
      licenseName: metadata.licenseName,
      licenseUrl: metadata.licenseUrl,
      notes: metadata.notes,
      trustStatus: metadata.trustStatus
    },
    create: {
      name: metadata.sourceName,
      provider: metadata.provider,
      contentType: metadata.contentType,
      language: metadata.language,
      url: metadata.url,
      licenseName: metadata.licenseName,
      licenseUrl: metadata.licenseUrl,
      version: metadata.version ?? "",
      notes: metadata.notes,
      trustStatus: metadata.trustStatus
    }
  });

  const contentImport = await prisma.contentImport.create({
    data: {
      sourceId: source.id,
      contentType: metadata.contentType,
      sourceVersion: metadata.version,
      importStatus: "staged",
      totalRecords: sourceFile.rows.length,
      manifestJson: {
        metadata,
        expectedRecords: sourceFile.expectedRecords ?? null
      }
    }
  });

  const rowChecksums: string[] = [];

  for (const row of sourceFile.rows) {
    const surah = await prisma.surah.upsert({
      where: { number: row.surahNumber },
      update: {
        ayahCount: { increment: 0 }
      },
      create: {
        number: row.surahNumber,
        ayahCount: Math.max(
          row.ayahNumber,
          ...sourceFile.rows
            .filter((candidate) => candidate.surahNumber === row.surahNumber)
            .map((candidate) => candidate.ayahNumber)
        )
      }
    });

    const ayah = await prisma.ayah.upsert({
      where: {
        surahId_ayahNumber: {
          surahId: surah.id,
          ayahNumber: row.ayahNumber
        }
      },
      update: {},
      create: {
        surahId: surah.id,
        ayahNumber: row.ayahNumber
      }
    });

    const scriptOrLanguage = scriptOrLanguageForRow(
      metadata.contentType,
      metadata.language,
      row
    );
    const checksum = rowChecksum({
      contentType: metadata.contentType,
      sourceId: source.id,
      importId: contentImport.id,
      surahNumber: row.surahNumber,
      ayahNumber: row.ayahNumber,
      scriptOrLanguage,
      text: row.text
    });

    rowChecksums.push(checksum);

    if (metadata.contentType === "quran_text") {
      await prisma.quranText.create({
        data: {
          ayahId: ayah.id,
          scriptType: row.scriptType ?? "source",
          text: row.text,
          sourceId: source.id,
          importId: contentImport.id,
          checksum,
          locked: true,
          active: false
        }
      });
    }

    if (metadata.contentType === "translation") {
      await prisma.translation.create({
        data: {
          ayahId: ayah.id,
          language: row.language ?? metadata.language ?? "und",
          translatorName: row.translatorName,
          text: row.text,
          sourceId: source.id,
          importId: contentImport.id,
          checksum,
          active: false
        }
      });
    }

    if (metadata.contentType === "tafsir") {
      await prisma.tafsir.create({
        data: {
          ayahId: ayah.id,
          language: row.language ?? metadata.language ?? "und",
          tafsirName: row.tafsirName ?? metadata.sourceName,
          authorName: row.authorName,
          text: row.text,
          sourceId: source.id,
          importId: contentImport.id,
          checksum,
          active: false
        }
      });
    }
  }

  const checksumSummary = summaryChecksum(rowChecksums);
  return prisma.contentImport.update({
    where: { id: contentImport.id },
    data: { checksumSummary }
  });
}

export async function verifyImport(importId: string) {
  const contentImport = await prisma.contentImport.findUniqueOrThrow({
    where: { id: importId },
    include: {
      quranTexts: { include: { ayah: { include: { surah: true } } } },
      translations: { include: { ayah: { include: { surah: true } } } },
      tafsirs: { include: { ayah: { include: { surah: true } } } }
    }
  });

  const rows = [
    ...contentImport.quranTexts.map((row) => ({
      contentType: "quran_text" as const,
      sourceId: row.sourceId,
      importId: row.importId,
      surahNumber: row.ayah.surah.number,
      ayahNumber: row.ayah.ayahNumber,
      scriptOrLanguage: row.scriptType,
      text: row.text,
      checksum: row.checksum
    })),
    ...contentImport.translations.map((row) => ({
      contentType: "translation" as const,
      sourceId: row.sourceId,
      importId: row.importId,
      surahNumber: row.ayah.surah.number,
      ayahNumber: row.ayah.ayahNumber,
      scriptOrLanguage: row.language,
      text: row.text,
      checksum: row.checksum
    })),
    ...contentImport.tafsirs.map((row) => ({
      contentType: "tafsir" as const,
      sourceId: row.sourceId,
      importId: row.importId,
      surahNumber: row.ayah.surah.number,
      ayahNumber: row.ayah.ayahNumber,
      scriptOrLanguage: row.language,
      text: row.text,
      checksum: row.checksum
    }))
  ];

  const verification = verifyStoredContentRows(rows);

  await prisma.verificationReport.create({
    data: {
      importId,
      status: verification.status,
      differencesFound: verification.differencesFound,
      checkedRecords: verification.checkedRecords,
      reportJson: verification
    }
  });

  await prisma.contentImport.update({
    where: { id: importId },
    data: {
      importStatus: verification.status === "passed" ? "verified" : "failed"
    }
  });

  return verification;
}

export async function publishVerifiedImport(importId: string) {
  const contentImport = await prisma.contentImport.findUniqueOrThrow({
    where: { id: importId },
    include: {
      source: true
    }
  });

  if (contentImport.source.trustStatus !== "approved") {
    throw new Error("Source must be approved before publication.");
  }

  if (contentImport.importStatus !== "verified") {
    throw new Error("Only verified imports can be published.");
  }

  await prisma.$transaction([
    prisma.quranText.updateMany({
      where: { sourceId: contentImport.sourceId },
      data: { active: false }
    }),
    prisma.translation.updateMany({
      where: { sourceId: contentImport.sourceId },
      data: { active: false }
    }),
    prisma.tafsir.updateMany({
      where: { sourceId: contentImport.sourceId },
      data: { active: false }
    }),
    prisma.quranText.updateMany({
      where: { importId },
      data: { active: true, verifiedAt: new Date(), locked: true }
    }),
    prisma.translation.updateMany({
      where: { importId },
      data: { active: true }
    }),
    prisma.tafsir.updateMany({
      where: { importId },
      data: { active: true }
    }),
    prisma.contentImport.update({
      where: { id: importId },
      data: { importStatus: "published" }
    }),
    prisma.contentImport.updateMany({
      where: {
        sourceId: contentImport.sourceId,
        id: { not: importId },
        importStatus: "published"
      },
      data: { importStatus: "archived" }
    })
  ]);
}

function scriptOrLanguageForRow(
  contentType: "quran_text" | "translation" | "tafsir",
  sourceLanguage: string | undefined,
  row: SourceFileInput["rows"][number]
) {
  if (contentType === "quran_text") {
    return row.scriptType ?? "source";
  }

  return row.language ?? sourceLanguage ?? "und";
}
