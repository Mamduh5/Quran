export function AdminDisabledNotice({ reason }: { reason: string }) {
  return (
    <section className="rounded-lg border border-line bg-panel p-6">
      <h1 className="text-2xl font-bold text-ink">Admin mutations disabled</h1>
      <p className="mt-2 max-w-2xl text-muted">{reason}</p>
      <p className="mt-4 text-sm text-muted">
        Public routes remain available. Import, verification, and publish
        actions can also be run through the documented scripts.
      </p>
    </section>
  );
}
