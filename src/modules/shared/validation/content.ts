import { z } from "zod";

import { CONTENT_TYPES } from "@/modules/shared/domain/content-types";

export const contentTypeSchema = z.enum(CONTENT_TYPES);

export const ayahReferenceSchema = z
  .string()
  .trim()
  .regex(/^\d{1,3}:\d{1,3}$/, "Expected an ayah reference like 2:255")
  .transform((value) => {
    const [surah, ayah] = value.split(":").map(Number);
    return { surahNumber: surah, ayahNumber: ayah };
  })
  .pipe(
    z.object({
      surahNumber: z.number().int().min(1).max(114),
      ayahNumber: z.number().int().min(1)
    })
  );

export const sourceMetadataSchema = z.object({
  sourceName: z.string().trim().min(1),
  provider: z.string().trim().min(1),
  contentType: z.enum(["quran_text", "translation", "tafsir"]),
  language: z.string().trim().min(2).optional(),
  version: z.string().trim().min(1).optional(),
  sourceKey: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1).optional(),
  authorName: z.string().trim().min(1).optional(),
  lastUpdate: z.union([z.string().trim().min(1), z.number()]).optional(),
  url: z.string().url().optional(),
  downloadUrl: z.string().url().optional(),
  apiDocsUrl: z.string().url().optional(),
  licenseName: z.string().trim().min(1).optional(),
  licenseUrl: z.string().url().optional(),
  termsUrl: z.string().url().optional(),
  downloadedAt: z.string().datetime().optional(),
  originalFileName: z.string().trim().min(1).optional(),
  originalFileSha256: z.string().regex(/^[a-f0-9]{64}$/).optional(),
  originalFileChecksums: z.record(z.string().regex(/^[a-f0-9]{64}$/)).optional(),
  sourceDetails: z.record(z.unknown()).optional(),
  notes: z.string().trim().optional(),
  trustStatus: z
    .enum(["candidate", "approved", "deprecated", "rejected"])
    .default("candidate")
});

export const importedContentRowSchema = z.object({
  surahNumber: z.number().int().min(1).max(114),
  ayahNumber: z.number().int().min(1),
  scriptType: z.string().trim().min(1).optional(),
  language: z.string().trim().min(2).optional(),
  translatorName: z.string().trim().min(1).optional(),
  tafsirName: z.string().trim().min(1).optional(),
  authorName: z.string().trim().min(1).optional(),
  footnotes: z.string().optional(),
  text: z.string().min(1)
});

export const sourceFileSchema = z.object({
  metadata: sourceMetadataSchema,
  expectedRecords: z.number().int().positive().optional(),
  rows: z.array(importedContentRowSchema).min(1)
});

export const issueReportInputSchema = z.object({
  ayahReference: z.string().trim().optional(),
  contentType: contentTypeSchema.default("other"),
  contentId: z.string().trim().optional(),
  message: z.string().trim().min(10).max(2000)
});

export type SourceFileInput = z.infer<typeof sourceFileSchema>;
