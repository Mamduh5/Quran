import { describe, expect, it } from "vitest";

import {
  buildRowChecksumPayload,
  rowChecksum,
  sha256,
  sha256Bytes,
  summaryChecksum
} from "@/modules/shared/crypto/checksum";

const row = {
  contentType: "quran_text" as const,
  sourceId: "source-1",
  importId: "import-1",
  surahNumber: 1,
  ayahNumber: 1,
  scriptOrLanguage: "uthmani",
  text: "test fixture text only"
};

describe("checksum service", () => {
  it("returns deterministic SHA-256 values", () => {
    expect(sha256("same input")).toBe(sha256("same input"));
    expect(sha256("same input")).not.toBe(sha256("different input"));
  });

  it("returns deterministic source file byte checksums", () => {
    const bytes = new TextEncoder().encode("fixture source file");

    expect(sha256Bytes(bytes)).toBe(sha256Bytes(bytes));
    expect(sha256Bytes(bytes)).toHaveLength(64);
  });

  it("uses a stable documented row payload", () => {
    expect(buildRowChecksumPayload(row)).toBe(
      "quran_text|source-1|import-1|1|1|uthmani|test fixture text only"
    );
    expect(rowChecksum(row)).toHaveLength(64);
  });

  it("summary checksums are independent of row order", () => {
    expect(summaryChecksum(["b", "a"])).toBe(summaryChecksum(["a", "b"]));
  });
});
