import { createHash } from "node:crypto";

import type { AuthoritativeContentType } from "@/modules/shared/domain/content-types";

export type RowChecksumInput = {
  contentType: AuthoritativeContentType;
  sourceId: string;
  importId: string;
  surahNumber: number;
  ayahNumber: number;
  scriptOrLanguage: string;
  text: string;
};

export function sha256(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

export function buildRowChecksumPayload(input: RowChecksumInput): string {
  return [
    input.contentType,
    input.sourceId,
    input.importId,
    input.surahNumber,
    input.ayahNumber,
    input.scriptOrLanguage,
    input.text
  ].join("|");
}

export function rowChecksum(input: RowChecksumInput): string {
  return sha256(buildRowChecksumPayload(input));
}

export function summaryChecksum(rowChecksums: string[]): string {
  return sha256([...rowChecksums].sort().join("\n"));
}
