import { describe, expect, it } from "vitest";

import {
  canShowPublicQuranText,
  canShowPublicSupplement
} from "@/modules/quran/application/services/public-content-filter";

const verifiedRow = {
  active: true,
  verifiedAt: new Date("2026-01-01T00:00:00Z"),
  sourceTrustStatus: "approved",
  importStatus: "published"
};

describe("public content filters", () => {
  it("hides unapproved Quran text", () => {
    expect(
      canShowPublicQuranText({ ...verifiedRow, sourceTrustStatus: "candidate" })
    ).toBe(false);
  });

  it("hides unpublished Quran text", () => {
    expect(
      canShowPublicQuranText({ ...verifiedRow, importStatus: "verified" })
    ).toBe(false);
  });

  it("hides inactive Quran text", () => {
    expect(canShowPublicQuranText({ ...verifiedRow, active: false })).toBe(
      false
    );
  });

  it("hides unverified Quran text", () => {
    expect(canShowPublicQuranText({ ...verifiedRow, verifiedAt: null })).toBe(
      false
    );
  });

  it("shows verified approved published active Quran text", () => {
    expect(canShowPublicQuranText(verifiedRow)).toBe(true);
  });

  it("filters translation and tafsir by active approved published import", () => {
    expect(
      canShowPublicSupplement({
        active: true,
        sourceTrustStatus: "approved",
        importStatus: "published"
      })
    ).toBe(true);
    expect(
      canShowPublicSupplement({
        active: true,
        sourceTrustStatus: "approved",
        importStatus: "staged"
      })
    ).toBe(false);
  });
});
