import type { SourceFileInput } from "@/modules/shared/validation/content";

export const TANZIL_SOURCE_NAME = "Tanzil Project";
export const TANZIL_PROVIDER = "Tanzil Project";
export const TANZIL_VERSION = "1.1";
export const TANZIL_RELEASE_NOTE = "Version 1.1, published February 2021";
export const TANZIL_OFFICIAL_DOWNLOAD_PAGE = "https://tanzil.net/download/";
export const TANZIL_TEXT_LICENSE_URL = "https://tanzil.net/docs/Text_License";
export const TANZIL_EXPECTED_RECORDS = 6236;
export const TANZIL_QURAN_TYPE = "uthmani";
export const TANZIL_OUTPUT_TYPE = "txt-2";

export const TANZIL_DOWNLOAD_URL =
  "https://tanzil.net/pub/download/index.php" +
  "?quranType=uthmani&outType=txt-2&marks=true&sajdah=true&tatweel=true&agree=true";

export type TanzilParsedRow = {
  surahNumber: number;
  ayahNumber: number;
  text: string;
};

export type TanzilProcessedSourceArgs = {
  rows: TanzilParsedRow[];
  downloadedAt: string;
  originalFileName: string;
  originalFileSha256: string;
};

export function parseTanzilTxt2Source(text: string): TanzilParsedRow[] {
  const rows = text
    .split(/\r?\n/)
    .filter((line) => line.length > 0 && !line.startsWith("#"))
    .map(parseTanzilTxt2Line);

  const seen = new Set<string>();

  for (const row of rows) {
    const key = `${row.surahNumber}:${row.ayahNumber}`;
    if (seen.has(key)) {
      throw new Error(`Duplicate Tanzil row for ${key}.`);
    }
    seen.add(key);
  }

  if (rows.length !== TANZIL_EXPECTED_RECORDS) {
    throw new Error(
      `Expected ${TANZIL_EXPECTED_RECORDS} Tanzil rows but received ${rows.length}.`
    );
  }

  return rows;
}

export function parseTanzilTxt2Line(line: string): TanzilParsedRow {
  const firstSeparator = line.indexOf("|");
  const secondSeparator =
    firstSeparator === -1 ? -1 : line.indexOf("|", firstSeparator + 1);

  if (firstSeparator === -1 || secondSeparator === -1) {
    throw new Error("Tanzil row must use surah|ayah|text format.");
  }

  const surahNumber = Number.parseInt(line.slice(0, firstSeparator), 10);
  const ayahNumber = Number.parseInt(
    line.slice(firstSeparator + 1, secondSeparator),
    10
  );
  const verseText = line.slice(secondSeparator + 1);

  if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    throw new Error(`Invalid Tanzil surah number: ${line}`);
  }

  if (!Number.isInteger(ayahNumber) || ayahNumber < 1) {
    throw new Error(`Invalid Tanzil ayah number: ${line}`);
  }

  if (verseText.length === 0) {
    throw new Error(`Missing Tanzil verse text for ${surahNumber}:${ayahNumber}.`);
  }

  return {
    surahNumber,
    ayahNumber,
    text: verseText
  };
}

export function buildTanzilProcessedSourceFile({
  rows,
  downloadedAt,
  originalFileName,
  originalFileSha256
}: TanzilProcessedSourceArgs): SourceFileInput {
  return {
    metadata: {
      sourceName: TANZIL_SOURCE_NAME,
      provider: TANZIL_PROVIDER,
      contentType: "quran_text",
      language: "ar",
      version: `${TANZIL_VERSION} (${TANZIL_RELEASE_NOTE}; quranType=${TANZIL_QURAN_TYPE}; outType=${TANZIL_OUTPUT_TYPE})`,
      url: TANZIL_OFFICIAL_DOWNLOAD_PAGE,
      downloadUrl: TANZIL_DOWNLOAD_URL,
      licenseName:
        "Creative Commons Attribution 3.0 with Tanzil Terms of Use",
      licenseUrl: TANZIL_TEXT_LICENSE_URL,
      trustStatus: "approved",
      downloadedAt,
      originalFileName,
      originalFileSha256,
      notes: [
        "Official Tanzil Quran text download.",
        "Terms require verbatim copies only; changing the text is not allowed.",
        "Source attribution to Tanzil Project and a link to tanzil.net are required.",
        "Processed JSON preserves verse text exactly after structural parsing of surah|ayah|text rows."
      ].join(" ")
    },
    expectedRecords: TANZIL_EXPECTED_RECORDS,
    rows: rows.map((row) => ({
      surahNumber: row.surahNumber,
      ayahNumber: row.ayahNumber,
      scriptType: TANZIL_QURAN_TYPE,
      text: row.text
    }))
  };
}
