export function VerificationBadge({
  verifiedAt
}: {
  verifiedAt: Date | null;
}) {
  return (
    <span className="inline-flex items-center rounded bg-accent-soft px-2 py-1 text-xs font-semibold text-accent">
      {verifiedAt ? `Verified ${verifiedAt.toLocaleDateString()}` : "Verified"}
    </span>
  );
}
