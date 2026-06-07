import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { AyahCard } from "@/components/quran/AyahCard";
import type { PublicAyahContent } from "@/modules/quran/domain/repositories/public-quran-repository";

const ayah: PublicAyahContent = {
  id: "ayah-1",
  reference: "1:1",
  surahNumber: 1,
  ayahNumber: 1,
  quranText: {
    id: "quran-text-1",
    scriptType: "fixture",
    text: "test fixture Arabic section only",
    source: {
      id: "source-1",
      name: "Fixture Arabic Source",
      provider: "Fixture Provider",
      version: "test",
      licenseName: "test-only",
      licenseUrl: null
    },
    verification: {
      importStatus: "published",
      verifiedAt: new Date("2026-01-01T00:00:00Z"),
      checksum: "abc123"
    }
  },
  translations: [
    {
      id: "translation-1",
      language: "en",
      translatorName: "Fixture Translator",
      text: "test fixture translation section only",
      footnotes: "test fixture footnote section only",
      source: {
        id: "source-2",
        name: "Fixture Translation Source",
        provider: "Fixture Provider",
        version: "test",
        licenseName: "test-only",
        licenseUrl: null
      },
      checksum: "def456"
    }
  ],
  tafsirs: [
    {
      id: "tafsir-1",
      language: "en",
      tafsirName: "Fixture Tafsir",
      authorName: null,
      text: "test fixture tafsir section only",
      source: {
        id: "source-3",
        name: "Fixture Tafsir Source",
        provider: "Fixture Provider",
        version: "test",
        licenseName: "test-only",
        licenseUrl: null
      },
      checksum: "ghi789"
    }
  ]
};

describe("AyahCard", () => {
  it("renders Quran text, translation, tafsir, and source sections separately", () => {
    const html = renderToStaticMarkup(
      React.createElement(AyahCard, { ayah })
    );

    expect(html).toContain('dir="rtl"');
    expect(html).toContain("Translation of meaning");
    expect(html).toContain("Translation footnotes");
    expect(html).toContain("Tafsir / Explanation");
    expect(html).toContain("Arabic Quran text source details");
    expect(html).toContain("Translation source details");
    expect(html).toContain("Tafsir source details");
  });
});
