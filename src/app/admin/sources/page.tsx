import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { AdminDisabledNotice } from "@/components/ui/AdminDisabledNotice";
import { getAdminMutationAccess } from "@/modules/admin/application/admin-guard";
import { requireAdminSession } from "@/modules/admin/infrastructure/next-admin-session";
import { listSourceRegistry } from "@/modules/content-source/infrastructure/repositories/prisma-source-registry";

export const dynamic = "force-dynamic";

export default async function AdminSourcesPage() {
  const session = await requireAdminSession();
  const access = getAdminMutationAccess();
  const sources = await listSourceRegistry();

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6">
      <AdminToolbar access={access} session={session} />
      {!access.enabled ? <AdminDisabledNotice reason={access.reason} /> : null}
      <header>
        <h1 className="text-3xl font-bold text-ink">Content sources</h1>
        <p className="mt-2 text-muted">
          Sources are registered by import metadata. Approval is represented by
          trust status and must be set before publish.
        </p>
      </header>
      <div className="grid gap-3">
        {sources.map((source) => (
          <article className="rounded-lg border border-line bg-panel p-5" key={source.id}>
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <h2 className="font-semibold text-ink">{source.name}</h2>
                <p className="text-sm text-muted">{source.provider}</p>
              </div>
              <span className="rounded border border-line bg-white px-3 py-1 text-sm font-semibold text-ink">
                {source.trustStatus}
              </span>
            </div>
            <p className="mt-3 text-sm text-muted">
              {source.contentType} / version {source.version || "not provided"} /{" "}
              {source.licenseName ?? "license not provided"}
            </p>
          </article>
        ))}
        {sources.length === 0 ? (
          <p className="rounded-lg border border-line bg-panel p-5 text-muted">
            No sources found.
          </p>
        ) : null}
      </div>
    </main>
  );
}
