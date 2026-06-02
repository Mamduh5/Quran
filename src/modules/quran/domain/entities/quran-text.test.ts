import { describe, expect, it } from "vitest";

import { QuranTextEntity } from "@/modules/quran/domain/entities/quran-text";

describe("QuranTextEntity", () => {
  it("requires source, import, checksum, and locked status", () => {
    expect(
      () =>
        new QuranTextEntity({
          id: "text-1",
          ayahId: "ayah-1",
          scriptType: "uthmani",
          text: "test fixture text only",
          sourceId: "source-1",
          importId: "import-1",
          checksum: "checksum",
          verifiedAt: null,
          locked: true,
          active: false
        })
    ).not.toThrow();

    expect(
      () =>
        new QuranTextEntity({
          id: "text-1",
          ayahId: "ayah-1",
          scriptType: "uthmani",
          text: "test fixture text only",
          sourceId: "source-1",
          importId: "import-1",
          checksum: "checksum",
          verifiedAt: null,
          locked: false,
          active: false
        })
    ).toThrow("locked");
  });

  it("does not expose text mutation methods", () => {
    const entity = new QuranTextEntity({
      id: "text-1",
      ayahId: "ayah-1",
      scriptType: "uthmani",
      text: "test fixture text only",
      sourceId: "source-1",
      importId: "import-1",
      checksum: "checksum",
      verifiedAt: null,
      locked: true,
      active: false
    });

    expect("setText" in entity).toBe(false);
    expect("updateText" in entity).toBe(false);
  });
});
