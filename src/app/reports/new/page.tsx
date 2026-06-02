import { IssueReportForm } from "@/components/reports/IssueReportForm";

export default function NewReportPage({
  searchParams
}: {
  searchParams: { ayah?: string; status?: string };
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <section className="rounded-lg border border-line bg-panel p-6 shadow-soft">
        <h1 className="text-3xl font-bold text-ink">Report possible issue</h1>
        <p className="mt-2 text-muted">
          Reports create review records for source/content investigation. They
          never change Quran text, translation, or tafsir automatically.
        </p>
        {searchParams.status ? (
          <StatusMessage status={searchParams.status} />
        ) : null}
        <div className="mt-6">
          <IssueReportForm ayahReference={searchParams.ayah} />
        </div>
      </section>
    </main>
  );
}

function StatusMessage({ status }: { status: string }) {
  const messages: Record<string, string> = {
    created: "Report submitted.",
    invalid: "Please check the form values.",
    "invalid-reference": "Use an ayah reference like 2:255.",
    "database-unavailable":
      "The database is not reachable. Configure DATABASE_URL and run migrations."
  };

  return (
    <p className="mt-4 rounded border border-line bg-white px-4 py-3 text-sm text-muted">
      {messages[status] ?? "Report status updated."}
    </p>
  );
}
