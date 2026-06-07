import { describe, expect, it } from "vitest";

import {
  buildQuranEncProcessedTranslationSourceFile,
  findQuranEncTranslation
} from "@/modules/translation/infrastructure/services/quranenc-source";

describe("QuranEnc translation source converter", () => {
  it("preserves translation text and footnotes separately", () => {
    const translation = findQuranEncTranslation(
      {
        translations: [
          {
            key: "english_saheeh",
            language_iso_code: "en",
            version: "test-only",
            last_update: 1,
            title: "Fixture Translation Title",
            description: "Fixture description"
          }
        ]
      },
      "english_saheeh"
    );

    const sourceFile = buildQuranEncProcessedTranslationSourceFile({
      translation,
      downloadedAt: "2026-06-07T00:00:00.000Z",
      originalFileChecksums: {
        "data/sources/original/quranenc/fixture.json":
          "a".repeat(64)
      },
      expectedRecords: 1,
      suraResponses: [
        {
          surahNumber: 1,
          response: {
            result: [
              {
                sura: "1",
                aya: "1",
                translation: "TEST_ONLY_TRANSLATION_TEXT",
                footnotes: "TEST_ONLY_TRANSLATION_FOOTNOTE"
              }
            ]
          }
        }
      ]
    });

    expect(sourceFile.metadata.contentType).toBe("translation");
    expect(sourceFile.metadata.trustStatus).toBe("candidate");
    expect(sourceFile.rows[0].text).toBe("TEST_ONLY_TRANSLATION_TEXT");
    expect(sourceFile.rows[0].footnotes).toBe("TEST_ONLY_TRANSLATION_FOOTNOTE");
  });

  it("rejects malformed ayah references", () => {
    const translation = findQuranEncTranslation(
      {
        translations: [
          {
            key: "english_saheeh",
            language_iso_code: "en",
            version: "test-only",
            last_update: 1,
            title: "Fixture Translation Title"
          }
        ]
      },
      "english_saheeh"
    );

    expect(() =>
      buildQuranEncProcessedTranslationSourceFile({
        translation,
        downloadedAt: "2026-06-07T00:00:00.000Z",
        originalFileChecksums: {},
        expectedRecords: 1,
        suraResponses: [
          {
            surahNumber: 1,
            response: {
              result: [
                {
                  sura: "1",
                  aya: "8",
                  translation: "TEST_ONLY_TRANSLATION_TEXT",
                  footnotes: ""
                }
              ]
            }
          }
        ]
      })
    ).toThrow("Invalid QuranEnc reference");
  });
});
