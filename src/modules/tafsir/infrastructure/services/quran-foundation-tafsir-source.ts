import { z } from "zod";

import {
  QURAN_TOTAL_AYAHS,
  isValidAyahReference
} from "@/modules/quran/domain/ayah-counts";
import type { SourceFileInput } from "@/modules/shared/validation/content";

export const QF_CONTENT_API_DOCS_URL =
  "https://api-docs.quran.com/docs/content_apis_versioned/4.0.0/content-apis/";
export const QF_TAFSIR_API_DOCS_URL =
  "https://api-docs.quran.com/docs/content_apis_versioned/4.0.0/tafsir/";
export const QF_DEVELOPER_TERMS_URL =
  "https://qf-api-docs.pages.dev/legal/developer-terms/";

export const qfTafsirResourceSchema = z
  .object({
    id: z.number(),
    name: z.string().min(1),
    author_name: z.string().nullable().optional(),
    slug: z.string().min(1).optional(),
    language_name: z.string().min(1).optional(),
    translated_name: z
      .object({
        name: z.string().min(1).optional(),
        language_name: z.string().min(1).optional()
      })
      .optional()
  })
  .passthrough();

export const qfTafsirsListSchema = z.object({
  tafsirs: z.array(qfTafsirResourceSchema)
});

const qfTafsirRowSchema = z
  .object({
    verse_key: z.string().regex(/^\d{1,3}:\d{1,3}$/),
    text: z.string().min(1),
    resource_name: z.string().min(1).optional(),
    language_name: z.string().min(1).optional()
  })
  .passthrough();

export const qfTafsirResponseSchema = z.object({
  tafsirs: z.array(qfTafsirRowSchema),
  meta: z.record(z.unknown()).optional()
});

export type QfTafsirResource = z.infer<typeof qfTafsirResourceSchema>;
export type QfTafsirResponse = z.input<typeof qfTafsirResponseSchema>;

export function findQuranFoundationTafsirResource(
  listResponse: unknown,
  tafsirId: number
): QfTafsirResource {
  const list = qfTafsirsListSchema.parse(listResponse);
  const resource = list.tafsirs.find((item) => item.id === tafsirId);

  if (!resource) {
    throw new Error(`Quran Foundation tafsir id not found: ${tafsirId}`);
  }

  return resource;
}

export function buildQuranFoundationTafsirSourceFile({
  resource,
  response,
  downloadedAt,
  originalFileChecksums,
  language,
  expectedRecords = QURAN_TOTAL_AYAHS
}: {
  resource: QfTafsirResource;
  response: unknown;
  downloadedAt: string;
  originalFileChecksums: Record<string, string>;
  language: string;
  expectedRecords?: number;
}): SourceFileInput {
  const parsed = qfTafsirResponseSchema.parse(response);
  const rows = parsed.tafsirs.map((row) => {
    const [surahNumber, ayahNumber] = row.verse_key.split(":").map(Number);

    if (!isValidAyahReference(surahNumber, ayahNumber)) {
      throw new Error(`Invalid Quran Foundation tafsir reference ${row.verse_key}.`);
    }

    return {
      surahNumber,
      ayahNumber,
      language,
      tafsirName: row.resource_name ?? resource.name,
      authorName: resource.author_name ?? undefined,
      text: row.text
    };
  });

  const seen = new Set<string>();
  for (const row of rows) {
    const key = `${row.surahNumber}:${row.ayahNumber}`;
    if (seen.has(key)) {
      throw new Error(`Duplicate Quran Foundation tafsir row for ${key}.`);
    }
    seen.add(key);
  }

  if (rows.length !== expectedRecords) {
    throw new Error(
      `Expected ${expectedRecords} Quran Foundation tafsir rows but received ${rows.length}.`
    );
  }

  return {
    metadata: {
      sourceName: resource.name,
      provider: "Quran Foundation Content API",
      contentType: "tafsir",
      language,
      version: `resource_id=${resource.id}; slug=${resource.slug ?? "unknown"}`,
      sourceKey: String(resource.id),
      title: resource.name,
      authorName: resource.author_name ?? undefined,
      url: QF_TAFSIR_API_DOCS_URL,
      downloadUrl: `/content/api/v4/tafsirs/${resource.id}`,
      apiDocsUrl: QF_TAFSIR_API_DOCS_URL,
      licenseName: "Quran Foundation Developer Terms require storage review",
      licenseUrl: QF_DEVELOPER_TERMS_URL,
      termsUrl: QF_DEVELOPER_TERMS_URL,
      downloadedAt,
      originalFileName: `quran-foundation-tafsir-${resource.id}-original-responses.json`,
      originalFileChecksums,
      sourceDetails: {
        resource,
        responseMeta: parsed.meta ?? null
      },
      trustStatus: "candidate",
      notes: [
        "Quran Foundation Content API tafsir response converted structurally without editing tafsir text.",
        "Developer Terms checked on 2026-06-07 allow display in an application but prohibit caching or storing QF Content longer than 1 week unless expressly permitted.",
        "Do not publish persistent tafsir rows from this source until access and storage terms are approved."
      ].join(" ")
    },
    expectedRecords,
    rows
  };
}
