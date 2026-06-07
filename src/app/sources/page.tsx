import { EmptyVerifiedContentState } from "@/components/ui/EmptyVerifiedContentState";
import { listSourceRegistry } from "@/modules/content-source/infrastructure/repositories/prisma-source-registry";

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const sources = await listSourceRegistry();

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6">
      <header>
        <h1 className="text-3xl font-bold text-ink">Sources</h1>
        <p className="mt-2 max-w-3xl text-muted">
          Source transparency shows provider, license, approval status, import
          date, verification date, and whether published imports exist.
        </p>
      </header>
      {sources.length === 0 ? (
        <EmptyVerifiedContentState
          detail="No content sources are registered yet. Register a reviewed source by running an import script with source metadata."
          title="No sources registered"
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-panel">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">License</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last verified</th>
                <th className="px-4 py-3">Published</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((source) => (
                <tr className="border-b border-line last:border-b-0" key={source.id}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-ink">{source.name}</div>
                    <div className="text-muted">{source.provider}</div>
                    {source.url ? (
                      <a className="text-accent" href={source.url}>
                        Source link
                      </a>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {source.contentType}
                    {source.language ? ` / ${source.language}` : ""}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {source.licenseUrl ? (
                      <a className="text-accent" href={source.licenseUrl}>
                        {source.licenseName ?? "License"}
                      </a>
                    ) : (
                      source.licenseName ?? "Not provided"
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-ink">
                    {source.trustStatus}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {source.lastVerificationAt?.toLocaleString() ?? "None"}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {source.activePublishedImports}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
