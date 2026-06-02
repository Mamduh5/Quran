import Link from "next/link";

const features = [
  {
    title: "Read",
    body: "Server-rendered reader pages show only active verified source rows."
  },
  {
    title: "Translate",
    body: "Translation of meaning is stored separately and source-labeled."
  },
  {
    title: "Tafsir",
    body: "Explanation content has its own source, checksum, and display section."
  },
  {
    title: "Verify",
    body: "Import batches are tracked with SHA-256 row and summary checksums."
  }
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
      <section className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            Source-tracked reader
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-ink sm:text-5xl">
            Read Quran with verified sources
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Arabic Quran text, translation of meaning, and tafsir are separated,
            source-labeled, checksum-verified, and hidden from public reading
            pages until approved imports are published.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              className="focus-ring rounded bg-accent px-5 py-3 font-semibold text-white"
              href="/quran"
            >
              Start reading
            </Link>
            <Link
              className="focus-ring rounded border border-line bg-panel px-5 py-3 font-semibold text-accent"
              href="/sources"
            >
              View sources
            </Link>
          </div>
        </div>
        <aside className="rounded-lg border border-line bg-panel p-5 shadow-soft">
          <h2 className="font-semibold text-ink">Integrity baseline</h2>
          <ul className="mt-3 grid gap-2 text-sm text-muted">
            <li>Production content enters through import files only.</li>
            <li>Public pages require approved source and published import.</li>
            <li>Issue reports never mutate authoritative content.</li>
          </ul>
        </aside>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <article
            className="rounded-lg border border-line bg-panel p-5"
            key={feature.title}
          >
            <h2 className="text-lg font-semibold text-ink">{feature.title}</h2>
            <p className="mt-2 text-sm text-muted">{feature.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
