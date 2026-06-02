import type { PublicSourceView } from "@/modules/quran/domain/repositories/public-quran-repository";

export function SourceDetailsPanel({
  label,
  source,
  checksum
}: {
  label: string;
  source: PublicSourceView;
  checksum: string;
}) {
  return (
    <details className="rounded border border-line bg-white p-3 text-sm">
      <summary className="cursor-pointer font-semibold text-ink">{label}</summary>
      <dl className="mt-3 grid gap-2 text-muted sm:grid-cols-2">
        <div>
          <dt className="font-medium text-ink">Provider</dt>
          <dd>{source.provider}</dd>
        </div>
        <div>
          <dt className="font-medium text-ink">Version</dt>
          <dd>{source.version ?? "Not provided"}</dd>
        </div>
        <div>
          <dt className="font-medium text-ink">License</dt>
          <dd>{source.licenseName ?? "Not provided"}</dd>
        </div>
        <div>
          <dt className="font-medium text-ink">Checksum</dt>
          <dd className="break-all font-mono text-xs">{checksum}</dd>
        </div>
      </dl>
    </details>
  );
}
