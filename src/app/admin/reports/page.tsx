import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { AdminDisabledNotice } from "@/components/ui/AdminDisabledNotice";
import { getAdminMutationAccess } from "@/modules/admin/application/admin-guard";
import { requireAdminSession } from "@/modules/admin/infrastructure/next-admin-session";
import { listIssueReports } from "@/modules/reports/infrastructure/repositories/prisma-issue-reports";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const session = await requireAdminSession();
  const access = getAdminMutationAccess();
  const reports = await listIssueReports();

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6">
      <AdminToolbar access={access} session={session} />
      {!access.enabled ? <AdminDisabledNotice reason={access.reason} /> : null}
      <header>
        <h1 className="text-3xl font-bold text-ink">Issue reports</h1>
        <p className="mt-2 text-muted">
          Reports are review signals only and do not mutate authoritative
          content.
        </p>
      </header>
      <div className="grid gap-3">
        {reports.map((report) => (
          <article className="rounded-lg border border-line bg-panel p-5" key={report.id}>
            <div className="flex flex-wrap justify-between gap-3">
              <h2 className="font-semibold text-ink">
                {report.ayah
                  ? `${report.ayah.surah.number}:${report.ayah.ayahNumber}`
                  : "General report"}
              </h2>
              <span className="text-sm font-semibold text-accent">
                {report.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">
              {report.contentType} / {report.createdAt.toLocaleString()}
            </p>
            <p className="mt-3 text-ink">{report.message}</p>
          </article>
        ))}
        {reports.length === 0 ? (
          <p className="rounded-lg border border-line bg-panel p-5 text-muted">
            No issue reports found.
          </p>
        ) : null}
      </div>
    </main>
  );
}
