import type { SourceFileInput } from "@/modules/shared/validation/content";
import { sourceFileSchema } from "@/modules/shared/validation/content";

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
  const duplicateIssues: ImportValidationIssue[] = [];

  for (const row of parsed.data.rows) {
    const sourceSpecificKey = [
      row.surahNumber,
      row.ayahNumber,
      row.scriptType ?? row.language ?? "default",
      row.tafsirName ?? row.translatorName ?? ""
    ].join(":");

    if (duplicateKeys.has(sourceSpecificKey)) {
      duplicateIssues.push({
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
    duplicateIssues.push({
      code: "record_count_mismatch",
      message: `Expected ${parsed.data.expectedRecords} rows but received ${parsed.data.rows.length}.`
    });
  }

  if (duplicateIssues.length > 0) {
    return { ok: false, issues: duplicateIssues };
  }

  return { ok: true, data: parsed.data };
}

export function assertApprovedForPublication(input: SourceFileInput): void {
  if (input.metadata.trustStatus !== "approved") {
    throw new Error("Source must be approved before publication.");
  }
}
