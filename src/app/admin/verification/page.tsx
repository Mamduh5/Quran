import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { AdminDisabledNotice } from "@/components/ui/AdminDisabledNotice";
import { getAdminMutationAccess } from "@/modules/admin/application/admin-guard";
import { requireAdminSession } from "@/modules/admin/infrastructure/next-admin-session";
import { listVerificationDashboardItems } from "@/modules/verification/infrastructure/repositories/prisma-verification-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminVerificationPage() {
  const session = await requireAdminSession();
  const access = getAdminMutationAccess();
  const reports = await listVerificationDashboardItems();

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6">
      <AdminToolbar access={access} session={session} />
      {!access.enabled ? <AdminDisabledNotice reason={access.reason} /> : null}
      <header>
        <h1 className="text-3xl font-bold text-ink">Verification reports</h1>
        <p className="mt-2 text-muted">
          Reports record checksum comparison results for import batches.
        </p>
      </header>
      <div className="grid gap-4">
        {reports.map((report) => (
          <article className="rounded-lg border border-line bg-panel p-5" key={report.id}>
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <h2 className="font-semibold text-ink">
                  {report.import.source.name} / {report.import.contentType}
                </h2>
                <p className="text-sm text-muted">{report.createdAt.toLocaleString()}</p>
              </div>
              <span className="rounded bg-accent-soft px-3 py-1 text-sm font-semibold text-accent">
                {report.status}
              </span>
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="font-semibold text-ink">Checked records</dt>
                <dd className="text-muted">{report.checkedRecords}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Differences found</dt>
                <dd className="text-muted">{report.differencesFound}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Import id</dt>
                <dd className="break-all font-mono text-xs text-muted">
                  {report.importId}
                </dd>
              </div>
            </dl>
            <details className="mt-4 rounded border border-line bg-white p-3">
              <summary className="cursor-pointer font-semibold text-ink">
                Report JSON
              </summary>
              <pre className="mt-3 overflow-auto text-xs text-muted">
                {JSON.stringify(report.reportJson, null, 2)}
              </pre>
            </details>
          </article>
        ))}
        {reports.length === 0 ? (
          <p className="rounded-lg border border-line bg-panel p-5 text-muted">
            No verification reports found.
          </p>
        ) : null}
      </div>
    </main>
  );
}
