import Link from "next/link";

import { EmptyVerifiedContentState } from "@/components/ui/EmptyVerifiedContentState";
import { SearchContent } from "@/modules/search/application/use-cases/search-content";
import { PrismaSearchRepository } from "@/modules/search/infrastructure/repositories/prisma-search-repository";
import { PrismaPublicQuranRepository } from "@/modules/quran/infrastructure/repositories/prisma-public-quran-repository";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q ?? "";
  const results = query
    ? await new SearchContent(
        new PrismaSearchRepository(),
        new PrismaPublicQuranRepository()
      ).execute(query)
    : [];

  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:px-6">
      <header>
        <h1 className="text-3xl font-bold text-ink">Search</h1>
        <p className="mt-2 text-muted">
          Search accepts ayah references like 2:255 and verified indexed content
          where available.
        </p>
      </header>
      <form className="flex gap-2" action="/search">
        <input
          className="focus-ring min-w-0 flex-1 rounded border border-line bg-white px-4 py-3"
          defaultValue={query}
          name="q"
          placeholder="Search or enter reference"
        />
        <button className="focus-ring rounded bg-accent px-5 py-3 font-semibold text-white">
          Search
        </button>
      </form>
      {query && results.length === 0 ? (
        <EmptyVerifiedContentState
          detail="No verified indexed content matched this search."
          title="No search results"
        />
      ) : null}
      <div className="grid gap-3">
        {results.map((result) => (
          <Link
            className="focus-ring rounded-lg border border-line bg-panel p-4"
            href={
              result.contentType === "surah"
                ? `/quran/${result.surahNumber}`
                : `/quran/${result.surahNumber}/${result.ayahNumber}`
            }
            key={`${result.contentType}-${result.reference}-${result.sourceName}`}
          >
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <span className="font-semibold text-ink">{result.reference}</span>
              <span>{result.contentType}</span>
              <span>Source: {result.sourceName}</span>
            </div>
            <p className="mt-2 line-clamp-3 text-ink">{result.snippet}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
