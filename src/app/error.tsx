"use client";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <section className="rounded-lg border border-line bg-panel p-6">
        <h1 className="text-2xl font-bold text-ink">Something went wrong</h1>
        <p className="mt-2 text-muted">{error.message}</p>
        <button
          className="focus-ring mt-4 rounded bg-accent px-4 py-2 font-semibold text-white"
          onClick={reset}
        >
          Try again
        </button>
      </section>
    </main>
  );
}
