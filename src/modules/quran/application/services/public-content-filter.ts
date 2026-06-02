export type PublicQuranTextFilterCandidate = {
  active: boolean;
  verifiedAt: Date | null;
  sourceTrustStatus: string;
  importStatus: string;
};

export type PublicSupplementFilterCandidate = {
  active: boolean;
  sourceTrustStatus: string;
  importStatus: string;
};

export function canShowPublicQuranText(
  row: PublicQuranTextFilterCandidate
): boolean {
  return (
    row.active &&
    row.verifiedAt !== null &&
    row.sourceTrustStatus === "approved" &&
    row.importStatus === "published"
  );
}

export function canShowPublicSupplement(
  row: PublicSupplementFilterCandidate
): boolean {
  return (
    row.active &&
    row.sourceTrustStatus === "approved" &&
    row.importStatus === "published"
  );
}
