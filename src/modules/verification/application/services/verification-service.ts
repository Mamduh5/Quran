import { rowChecksum } from "@/modules/shared/crypto/checksum";
import type { AuthoritativeContentType } from "@/modules/shared/domain/content-types";

export type StoredContentForVerification = {
  contentType: AuthoritativeContentType;
  sourceId: string;
  importId: string;
  surahNumber: number;
  ayahNumber: number;
  scriptOrLanguage: string;
  text: string;
  checksum: string;
};

export type VerificationResult = {
  status: "passed" | "failed";
  checkedRecords: number;
  differencesFound: number;
  differences: Array<{
    reference: string;
    expectedChecksum: string;
    actualChecksum: string;
  }>;
};

export function verifyStoredContentRows(
  rows: StoredContentForVerification[]
): VerificationResult {
  const differences = rows.flatMap((row) => {
    const actualChecksum = rowChecksum(row);

    if (actualChecksum === row.checksum) {
      return [];
    }

    return [
      {
        reference: `${row.surahNumber}:${row.ayahNumber}`,
        expectedChecksum: row.checksum,
        actualChecksum
      }
    ];
  });

  return {
    status: differences.length === 0 ? "passed" : "failed",
    checkedRecords: rows.length,
    differencesFound: differences.length,
    differences
  };
}
