import { z } from "zod";

import {
  QURAN_TOTAL_AYAHS,
  isValidAyahReference
} from "@/modules/quran/domain/ayah-counts";
import type { SourceFileInput } from "@/modules/shared/validation/content";

export const QURANENC_API_DOCS_URL = "https://quranenc.com/en/home/api/";
export const QURANENC_TRANSLATIONS_LIST_URL =
  "https://quranenc.com/api/v1/translations/list";
export const QURANENC_TRANSLATION_KEY = "english_saheeh";
export const QURANENC_PROVIDER = "QuranEnc";

export function quranEncSuraUrl(
  translationKey: string,
  surahNumber: number
): string {
  return `https://quranenc.com/api/v1/translation/sura/${translationKey}/${surahNumber}`;
}

export const quranEncTranslationMetadataSchema = z
  .object({
    key: z.string().min(1),
    language_iso_code: z.string().min(2),
    version: z.string().min(1),
    last_update: z.number(),
    title: z.string().min(1),
    description: z.string().optional(),
    database_url: z.string().url().nullable().optional(),
    database_uncompressed_url: z.string().url().nullable().optional()
  })
  .passthrough();

export const quranEncTranslationsListSchema = z.object({
  translations: z.array(quranEncTranslationMetadataSchema)
});

const stringNumberSchema = z.union([z.string(), z.number()]).transform((value) => {
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
  if (!Number.isInteger(parsed)) {
    throw new Error(`Invalid numeric value: ${value}`);
  }

  return parsed;
});

export const quranEncSuraRowSchema = z
  .object({
    sura: stringNumberSchema,
    aya: stringNumberSchema,
    translation: z.string().min(1),
    footnotes: z.string().optional().default("")
  })
  .passthrough();

export const quranEncSuraResponseSchema = z.object({
  result: z.array(quranEncSuraRowSchema)
});

export type QuranEncTranslationMetadata = z.infer<
  typeof quranEncTranslationMetadataSchema
>;
export type QuranEncSuraResponse = z.input<typeof quranEncSuraResponseSchema>;
export type QuranEncParsedSuraResponse = z.infer<typeof quranEncSuraResponseSchema>;

export type QuranEncProcessedTranslationArgs = {
  translation: QuranEncTranslationMetadata;
  suraResponses: Array<{
    surahNumber: number;
    response: unknown;
  }>;
  downloadedAt: string;
  originalFileChecksums: Record<string, string>;
  expectedRecords?: number;
};

export function findQuranEncTranslation(
  listResponse: unknown,
  translationKey = QURANENC_TRANSLATION_KEY
): QuranEncTranslationMetadata {
  const list = quranEncTranslationsListSchema.parse(listResponse);
  const translation = list.translations.find((item) => item.key === translationKey);

  if (!translation) {
    throw new Error(`QuranEnc translation key not found: ${translationKey}`);
  }

  return translation;
}

export function parseQuranEncSuraResponse(
  input: unknown,
  expectedSurahNumber: number
): QuranEncParsedSuraResponse {
  const parsed = quranEncSuraResponseSchema.parse(input);
  const seen = new Set<string>();

  for (const row of parsed.result) {
    if (row.sura !== expectedSurahNumber) {
      throw new Error(
        `QuranEnc row expected surah ${expectedSurahNumber} but received ${row.sura}.`
      );
    }

    if (!isValidAyahReference(row.sura, row.aya)) {
      throw new Error(`Invalid QuranEnc reference ${row.sura}:${row.aya}.`);
    }

    const key = `${row.sura}:${row.aya}`;
    if (seen.has(key)) {
      throw new Error(`Duplicate QuranEnc row for ${key}.`);
    }

    seen.add(key);
  }

  return parsed;
}

export function buildQuranEncProcessedTranslationSourceFile({
  translation,
  suraResponses,
  downloadedAt,
  originalFileChecksums,
  expectedRecords = QURAN_TOTAL_AYAHS
}: QuranEncProcessedTranslationArgs): SourceFileInput {
  const rows = suraResponses
    .flatMap(({ surahNumber, response }) =>
      parseQuranEncSuraResponse(response, surahNumber).result.map((row) => ({
        surahNumber: row.sura,
        ayahNumber: row.aya,
        language: translation.language_iso_code,
        translatorName: translation.title,
        text: row.translation,
        footnotes: row.footnotes || undefined
      }))
    )
    .sort(
      (left, right) =>
        left.surahNumber - right.surahNumber || left.ayahNumber - right.ayahNumber
    );

  if (rows.length !== expectedRecords) {
    throw new Error(
      `Expected ${expectedRecords} QuranEnc rows but received ${rows.length}.`
    );
  }

  return {
    metadata: {
      sourceName: `QuranEnc ${translation.title}`,
      provider: QURANENC_PROVIDER,
      contentType: "translation",
      language: translation.language_iso_code,
      version: `${translation.version}; last_update=${translation.last_update}`,
      sourceKey: translation.key,
      title: translation.title,
      lastUpdate: translation.last_update,
      url: "https://quranenc.com/",
      downloadUrl: quranEncSuraUrl(translation.key, 1),
      apiDocsUrl: QURANENC_API_DOCS_URL,
      licenseName: "QuranEnc API terms not explicit for permanent redistribution",
      licenseUrl: QURANENC_API_DOCS_URL,
      termsUrl: "https://quranenc.com/",
      downloadedAt,
      originalFileName: "quranenc-english_saheeh-original-responses.json",
      originalFileChecksums,
      sourceDetails: {
        translationKey: translation.key,
        title: translation.title,
        description: translation.description ?? null,
        databaseUrl: translation.database_url ?? null,
        databaseUncompressedUrl: translation.database_uncompressed_url ?? null
      },
      trustStatus: "candidate",
      notes: [
        "Official QuranEnc API responses converted structurally without editing translation text.",
        "Footnotes are stored separately from translation text.",
        "The public API documents endpoints and response fields but does not provide explicit permanent redistribution terms in the checked documentation.",
        "Keep this source as candidate until license/terms review approves publication."
      ].join(" ")
    },
    expectedRecords,
    rows
  };
}
