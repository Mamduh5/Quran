import type { PublicSourceView } from "@/modules/quran/domain/repositories/public-quran-repository";

export function SourceBadge({ source }: { source: PublicSourceView }) {
  return (
    <span className="inline-flex items-center rounded border border-line bg-white px-2 py-1 text-xs font-medium text-muted">
      Source: {source.name}
      {source.version ? ` ${source.version}` : ""}
    </span>
  );
}
