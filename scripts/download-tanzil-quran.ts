import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { sha256Bytes } from "@/modules/shared/crypto/checksum";
import {
  buildTanzilProcessedSourceFile,
  parseTanzilTxt2Source,
  TANZIL_DOWNLOAD_URL,
  TANZIL_OFFICIAL_DOWNLOAD_PAGE,
  TANZIL_QURAN_TYPE,
  TANZIL_TEXT_LICENSE_URL,
  TANZIL_VERSION
} from "@/modules/verification/infrastructure/services/tanzil-source";

const originalDirectory = path.join(
  process.cwd(),
  "data",
  "sources",
  "original",
  "tanzil"
);
const processedDirectory = path.join(
  process.cwd(),
  "data",
  "sources",
  "processed",
  "tanzil"
);
const originalFileName = `quran-${TANZIL_QURAN_TYPE}-v${TANZIL_VERSION}.txt`;
const processedFileName = `quran-${TANZIL_QURAN_TYPE}-v${TANZIL_VERSION}.json`;
const manifestFileName = `quran-${TANZIL_QURAN_TYPE}-v${TANZIL_VERSION}.manifest.json`;

async function main() {
  await mkdir(originalDirectory, { recursive: true });
  await mkdir(processedDirectory, { recursive: true });

  const response = await fetch(TANZIL_DOWNLOAD_URL);
  if (!response.ok) {
    throw new Error(
      `Tanzil download failed: ${response.status} ${response.statusText}`
    );
  }

  const downloadedAt = new Date().toISOString();
  const originalBytes = new Uint8Array(await response.arrayBuffer());
  const originalFileSha256 = sha256Bytes(originalBytes);
  const originalText = new TextDecoder("utf-8", { fatal: true }).decode(
    originalBytes
  );
  const rows = parseTanzilTxt2Source(originalText);
  const processedSource = buildTanzilProcessedSourceFile({
    rows,
    downloadedAt,
    originalFileName,
    originalFileSha256
  });
  const processedJson = `${JSON.stringify(processedSource, null, 2)}\n`;
  const processedFileSha256 = sha256Bytes(
    new TextEncoder().encode(processedJson)
  );

  const originalPath = path.join(originalDirectory, originalFileName);
  const processedPath = path.join(processedDirectory, processedFileName);
  const manifestPath = path.join(processedDirectory, manifestFileName);

  await writeFile(originalPath, originalBytes);
  await writeFile(processedPath, processedJson, "utf8");
  await writeFile(
    manifestPath,
    `${JSON.stringify(
      {
        sourceName: "Tanzil Project",
        provider: "Tanzil Project",
        officialDownloadPage: TANZIL_OFFICIAL_DOWNLOAD_PAGE,
        exactDownloadUrl: TANZIL_DOWNLOAD_URL,
        licenseUrl: TANZIL_TEXT_LICENSE_URL,
        version: TANZIL_VERSION,
        downloadedAt,
        originalPath: path.relative(process.cwd(), originalPath),
        originalFileSha256,
        processedPath: path.relative(process.cwd(), processedPath),
        processedFileSha256,
        rowCount: rows.length
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  console.log(`Downloaded Tanzil source to ${path.relative(process.cwd(), originalPath)}.`);
  console.log(`Wrote processed import file to ${path.relative(process.cwd(), processedPath)}.`);
  console.log(`Original file SHA-256: ${originalFileSha256}`);
  console.log(`Processed file SHA-256: ${processedFileSha256}`);
  console.log(`Rows: ${rows.length}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
