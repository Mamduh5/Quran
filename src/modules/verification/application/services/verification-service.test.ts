import { describe, expect, it } from "vitest";

import { rowChecksum } from "@/modules/shared/crypto/checksum";
import { verifyStoredContentRows } from "@/modules/verification/application/services/verification-service";

const validRow = {
  contentType: "translation" as const,
  sourceId: "source-1",
  importId: "import-1",
  surahNumber: 2,
  ayahNumber: 3,
  scriptOrLanguage: "en",
  text: "test fixture translation only"
};

describe("verification service", () => {
  it("passes when stored checksum matches recomputed checksum", () => {
    const result = verifyStoredContentRows([
      { ...validRow, checksum: rowChecksum(validRow) }
    ]);

    expect(result.status).toBe("passed");
    expect(result.checkedRecords).toBe(1);
    expect(result.differencesFound).toBe(0);
  });

  it("fails when text changes after import", () => {
    const result = verifyStoredContentRows([
      {
        ...validRow,
        text: "changed fixture text",
        checksum: rowChecksum(validRow)
      }
    ]);

    expect(result.status).toBe("failed");
    expect(result.differencesFound).toBe(1);
  });
});
