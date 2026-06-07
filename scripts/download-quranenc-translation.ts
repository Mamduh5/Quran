import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { sha256Bytes } from "@/modules/shared/crypto/checksum";
import {
  QURANENC_TRANSLATION_KEY,
  QURANENC_TRANSLATIONS_LIST_URL,
  buildQuranEncProcessedTranslationSourceFile,
  findQuranEncTranslation,
  quranEncSuraUrl
} from "@/modules/translation/infrastructure/services/quranenc-source";

const originalDirectory = path.join(
  process.cwd(),
  "data",
  "sources",
  "original",
  "quranenc",
  "translation",
  QURANENC_TRANSLATION_KEY
);
const processedDirectory = path.join(
  process.cwd(),
  "data",
  "sources",
  "processed",
  "quranenc",
  "translation"
);
const processedFileName = `${QURANENC_TRANSLATION_KEY}.json`;
const manifestFileName = `${QURANENC_TRANSLATION_KEY}.manifest.json`;

async function main() {
  await mkdir(originalDirectory, { recursive: true });
  await mkdir(processedDirectory, { recursive: true });

  const downloadedAt = new Date().toISOString();
  const originalFileChecksums: Record<string, string> = {};

  const listJson = await fetchJson(QURANENC_TRANSLATIONS_LIST_URL);
  const translation = findQuranEncTranslation(listJson, QURANENC_TRANSLATION_KEY);
  await writeOriginalJson("translations-list.json", listJson, originalFileChecksums);

  const suraResponses = [];
  for (let surahNumber = 1; surahNumber <= 114; surahNumber += 1) {
    const response = await fetchJson(
      quranEncSuraUrl(QURANENC_TRANSLATION_KEY, surahNumber)
    );
    const fileName = `sura-${String(surahNumber).padStart(3, "0")}.json`;
    await writeOriginalJson(fileName, response, originalFileChecksums);
    suraResponses.push({ surahNumber, response });
  }

  const processedSource = buildQuranEncProcessedTranslationSourceFile({
    translation,
    suraResponses,
    downloadedAt,
    originalFileChecksums
  });
  const processedJson = `${JSON.stringify(processedSource, null, 2)}\n`;
  const processedFileSha256 = sha256Bytes(new TextEncoder().encode(processedJson));

  const processedPath = path.join(processedDirectory, processedFileName);
  const manifestPath = path.join(processedDirectory, manifestFileName);

  await writeFile(processedPath, processedJson, "utf8");
  await writeFile(
    manifestPath,
    `${JSON.stringify(
      {
        sourceName: processedSource.metadata.sourceName,
        provider: processedSource.metadata.provider,
        translationKey: QURANENC_TRANSLATION_KEY,
        apiDocsUrl: processedSource.metadata.apiDocsUrl,
        termsUrl: processedSource.metadata.termsUrl,
        trustStatus: processedSource.metadata.trustStatus,
        downloadedAt,
        originalDirectory: path.relative(process.cwd(), originalDirectory),
        originalFileChecksums,
        processedPath: path.relative(process.cwd(), processedPath),
        processedFileSha256,
        rowCount: processedSource.rows.length,
        licenseReviewRequired:
          "QuranEnc API docs do not state permanent redistribution terms; review before changing trustStatus to approved."
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  console.log(
    `Downloaded QuranEnc ${QURANENC_TRANSLATION_KEY} responses to ${path.relative(
      process.cwd(),
      originalDirectory
    )}.`
  );
  console.log(`Wrote processed import file to ${path.relative(process.cwd(), processedPath)}.`);
  console.log(`Processed file SHA-256: ${processedFileSha256}`);
  console.log(`Rows: ${processedSource.rows.length}`);
  console.log("Trust status: candidate; review source terms before publication.");
}

async function fetchJson(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`QuranEnc download failed: ${response.status} ${response.statusText} ${url}`);
  }

  return response.json() as Promise<unknown>;
}

async function writeOriginalJson(
  fileName: string,
  payload: unknown,
  checksums: Record<string, string>
) {
  const json = `${JSON.stringify(payload, null, 2)}\n`;
  const filePath = path.join(originalDirectory, fileName);
  await writeFile(filePath, json, "utf8");
  checksums[path.relative(process.cwd(), filePath)] = sha256Bytes(
    new TextEncoder().encode(json)
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
