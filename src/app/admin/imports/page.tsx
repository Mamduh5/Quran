import { publishImportAction, verifyImportAction } from "@/app/admin/actions";
import { AdminDisabledNotice } from "@/components/ui/AdminDisabledNotice";
import { getAdminAccess } from "@/modules/admin/application/admin-guard";
import { listImportDashboardItems } from "@/modules/verification/infrastructure/repositories/prisma-verification-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminImportsPage() {
  const access = getAdminAccess();

  if (!access.enabled) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <AdminDisabledNotice reason={access.reason} />
      </main>
    );
  }

  const imports = await listImportDashboardItems();

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6">
      <header>
        <h1 className="text-3xl font-bold text-ink">Import dashboard</h1>
        <p className="mt-2 text-muted">
          Import batches can be verified and published. No form here edits
          Quran text, translation, or tafsir content directly.
        </p>
      </header>
      <div className="overflow-x-auto rounded-lg border border-line bg-panel">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-4 py-3">Import</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Rows</th>
              <th className="px-4 py-3">Checksum summary</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {imports.map((item) => (
              <tr className="border-b border-line last:border-b-0" key={item.id}>
                <td className="px-4 py-3">
                  <div className="font-mono text-xs">{item.id}</div>
                  <div className="text-muted">{item.importedAt.toLocaleString()}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-ink">{item.source.name}</div>
                  <div className="text-muted">
                    {item.contentType} · {item.source.trustStatus}
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold text-ink">
                  {item.importStatus}
                </td>
                <td className="px-4 py-3 text-muted">{item.totalRecords}</td>
                <td className="max-w-xs break-all px-4 py-3 font-mono text-xs text-muted">
                  {item.checksumSummary ?? "Pending"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <form action={verifyImportAction}>
                      <input name="importId" type="hidden" value={item.id} />
                      <button className="focus-ring rounded border border-line bg-white px-3 py-2 font-semibold text-accent">
                        Verify
                      </button>
                    </form>
                    <form action={publishImportAction}>
                      <input name="importId" type="hidden" value={item.id} />
                      <button className="focus-ring rounded bg-accent px-3 py-2 font-semibold text-white">
                        Publish
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {imports.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-muted" colSpan={6}>
                  No import batches found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}
