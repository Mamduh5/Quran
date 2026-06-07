import type { SourceFileInput } from "@/modules/shared/validation/content";
import { sourceFileSchema } from "@/modules/shared/validation/content";
import { getAyahCountForSurah } from "@/modules/quran/domain/ayah-counts";

export type ImportValidationIssue = {
  code: string;
  message: string;
};

export type ImportValidationResult =
  | { ok: true; data: SourceFileInput }
  | { ok: false; issues: ImportValidationIssue[] };

export function validateImportSourceFile(input: unknown): ImportValidationResult {
  const parsed = sourceFileSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map((issue) => ({
        code: issue.code,
        message: issue.message
      }))
    };
  }

  const duplicateKeys = new Set<string>();
  const issues: ImportValidationIssue[] = [];

  for (const row of parsed.data.rows) {
    const ayahCount = getAyahCountForSurah(row.surahNumber);

    if (ayahCount === null || row.ayahNumber > ayahCount) {
      issues.push({
        code: "invalid_ayah_reference",
        message: `Invalid ayah reference ${row.surahNumber}:${row.ayahNumber}.`
      });
    }

    if (
      parsed.data.metadata.contentType === "translation" &&
      !row.language &&
      !parsed.data.metadata.language
    ) {
      issues.push({
        code: "missing_language",
        message: `Translation row ${row.surahNumber}:${row.ayahNumber} must include a row language or source language.`
      });
    }

    if (
      parsed.data.metadata.contentType === "tafsir" &&
      !row.language &&
      !parsed.data.metadata.language
    ) {
      issues.push({
        code: "missing_language",
        message: `Tafsir row ${row.surahNumber}:${row.ayahNumber} must include a row language or source language.`
      });
    }

    const sourceSpecificKey = [
      row.surahNumber,
      row.ayahNumber,
      row.scriptType ?? row.language ?? "default",
      row.tafsirName ?? row.translatorName ?? ""
    ].join(":");

    if (duplicateKeys.has(sourceSpecificKey)) {
      issues.push({
        code: "duplicate_reference",
        message: `Duplicate content row for ${row.surahNumber}:${row.ayahNumber}.`
      });
    }

    duplicateKeys.add(sourceSpecificKey);
  }

  if (
    parsed.data.expectedRecords !== undefined &&
    parsed.data.expectedRecords !== parsed.data.rows.length
  ) {
    issues.push({
      code: "record_count_mismatch",
      message: `Expected ${parsed.data.expectedRecords} rows but received ${parsed.data.rows.length}.`
    });
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return { ok: true, data: parsed.data };
}

export function assertApprovedForPublication(input: SourceFileInput): void {
  if (input.metadata.trustStatus !== "approved") {
    throw new Error("Source must be approved before publication.");
  }
}
