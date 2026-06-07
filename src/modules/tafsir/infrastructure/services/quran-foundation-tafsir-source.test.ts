import { describe, expect, it } from "vitest";

import { buildQuranFoundationTafsirSourceFile } from "@/modules/tafsir/infrastructure/services/quran-foundation-tafsir-source";

const resource = {
  id: 169,
  name: "Fixture Tafsir",
  author_name: "Fixture Author",
  slug: "fixture-tafsir",
  language_name: "english"
};

describe("Quran Foundation tafsir source converter", () => {
  it("preserves tafsir text and source metadata", () => {
    const sourceFile = buildQuranFoundationTafsirSourceFile({
      resource,
      downloadedAt: "2026-06-07T00:00:00.000Z",
      originalFileChecksums: {
        "data/sources/original/quran-foundation/fixture.json":
          "b".repeat(64)
      },
      language: "en",
      expectedRecords: 1,
      response: {
        tafsirs: [
          {
            verse_key: "1:1",
            text: "TEST_ONLY_TAFSIR_TEXT",
            resource_name: "Fixture Tafsir",
            language_name: "english"
          }
        ]
      }
    });

    expect(sourceFile.metadata.contentType).toBe("tafsir");
    expect(sourceFile.metadata.trustStatus).toBe("candidate");
    expect(sourceFile.rows[0].tafsirName).toBe("Fixture Tafsir");
    expect(sourceFile.rows[0].authorName).toBe("Fixture Author");
    expect(sourceFile.rows[0].text).toBe("TEST_ONLY_TAFSIR_TEXT");
  });

  it("rejects malformed tafsir references", () => {
    expect(() =>
      buildQuranFoundationTafsirSourceFile({
        resource,
        downloadedAt: "2026-06-07T00:00:00.000Z",
        originalFileChecksums: {},
        language: "en",
        expectedRecords: 1,
        response: {
          tafsirs: [
            {
              verse_key: "1:8",
              text: "TEST_ONLY_TAFSIR_TEXT",
              resource_name: "Fixture Tafsir",
              language_name: "english"
            }
          ]
        }
      })
    ).toThrow("Invalid Quran Foundation tafsir reference");
  });
});
