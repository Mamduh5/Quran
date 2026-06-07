import { describe, expect, it } from "vitest";

import { validateImportSourceFile } from "@/modules/verification/application/services/import-validation";

const validInput = {
  metadata: {
    sourceName: "Fixture Source",
    provider: "Fixture Provider",
    contentType: "translation",
    language: "en",
    version: "test-only",
    trustStatus: "candidate"
  },
  expectedRecords: 1,
  rows: [
    {
      surahNumber: 1,
      ayahNumber: 1,
      language: "en",
      text: "test fixture content only"
    }
  ]
};

describe("import validation", () => {
  it("rejects missing source metadata", () => {
    const result = validateImportSourceFile({ rows: validInput.rows });
    expect(result.ok).toBe(false);
  });

  it("rejects invalid ayah references", () => {
    const result = validateImportSourceFile({
      ...validInput,
      rows: [{ ...validInput.rows[0], surahNumber: 115 }]
    });

    expect(result.ok).toBe(false);
  });

  it("rejects ayah numbers outside the known surah bounds", () => {
    const result = validateImportSourceFile({
      ...validInput,
      rows: [{ ...validInput.rows[0], surahNumber: 1, ayahNumber: 8 }]
    });

    expect(result.ok).toBe(false);
  });

  it("rejects translation rows without source or row language", () => {
    const result = validateImportSourceFile({
      ...validInput,
      metadata: {
        sourceName: "Fixture Source",
        provider: "Fixture Provider",
        contentType: "translation",
        version: "test-only",
        trustStatus: "candidate"
      },
      rows: [{ surahNumber: 1, ayahNumber: 1, text: "fixture translation" }]
    });

    expect(result.ok).toBe(false);
  });

  it("rejects duplicate rows for the same source reference", () => {
    const result = validateImportSourceFile({
      ...validInput,
      expectedRecords: 2,
      rows: [validInput.rows[0], validInput.rows[0]]
    });

    expect(result.ok).toBe(false);
  });
});
