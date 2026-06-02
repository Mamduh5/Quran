import Link from "next/link";

export function EmptyVerifiedContentState({
  title = "No verified content is available yet.",
  detail = "Import and verify an approved source before publishing this view."
}: {
  title?: string;
  detail?: string;
}) {
  return (
    <section className="rounded-lg border border-dashed border-line bg-panel p-6 text-ink">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">{detail}</p>
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link
          className="focus-ring rounded bg-accent px-4 py-2 font-semibold text-white"
          href="/sources"
        >
          View sources
        </Link>
        <Link
          className="focus-ring rounded border border-line px-4 py-2 font-semibold text-accent"
          href="/admin/imports"
        >
          Import dashboard
        </Link>
      </div>
    </section>
  );
}
