import { AyahCard } from "@/components/quran/AyahCard";
import { ReaderControls } from "@/components/quran/ReaderControls";
import { SurahList } from "@/components/quran/SurahList";
import { EmptyVerifiedContentState } from "@/components/ui/EmptyVerifiedContentState";
import { GetSurahReader } from "@/modules/quran/application/use-cases/get-surah-reader";
import { ListPublicSurahs } from "@/modules/quran/application/use-cases/list-public-surahs";
import { PrismaPublicQuranRepository } from "@/modules/quran/infrastructure/repositories/prisma-public-quran-repository";
import type { PublicSurahReader } from "@/modules/quran/domain/repositories/public-quran-repository";

export const dynamic = "force-dynamic";

export default async function SurahReaderPage({
  params,
  searchParams
}: {
  params: Promise<{ surah: string }>;
  searchParams: Promise<{
    translationSource?: string;
    tafsirSource?: string;
  }>;
}) {
  const repository = new PrismaPublicQuranRepository();
  const [{ surah: surahParam }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams
  ]);
  const [surahs, surah] = await Promise.all([
    new ListPublicSurahs(repository).execute(),
    new GetSurahReader(repository).execute(surahParam)
  ]);

  if (!surah) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <EmptyVerifiedContentState
          detail="This surah is not available locally yet. Import and verify an approved source before publishing it."
          title="No local surah record is available."
        />
      </main>
    );
  }

  const selectedTranslationSource =
    resolvedSearchParams.translationSource ?? "all";
  const selectedTafsirSource = resolvedSearchParams.tafsirSource ?? "all";
  const translationOptions = sourceOptionsFromSurah(surah, "translations");
  const tafsirOptions = sourceOptionsFromSurah(surah, "tafsirs");
  const filteredSurah = filterSurahSources(
    surah,
    selectedTranslationSource,
    selectedTafsirSource
  );

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[280px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">
          Surahs
        </h2>
        <SurahList activeSurah={surah.number} surahs={surahs} />
      </aside>
      <section className="grid gap-5">
        <header className="rounded-lg border border-line bg-panel p-5 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-ink">
                {surah.nameTransliteration ?? `Surah ${surah.number}`}
              </h1>
              <p className="mt-1 text-muted">
                {surah.nameEnglish ?? "Metadata pending"} / {surah.ayahCount} ayahs /{" "}
                {surah.verifiedAyahCount} verified Arabic rows
              </p>
            </div>
            <ReaderControls
              selectedTafsirSource={selectedTafsirSource}
              selectedTranslationSource={selectedTranslationSource}
              tafsirOptions={tafsirOptions}
              translationOptions={translationOptions}
            />
          </div>
        </header>
        {filteredSurah.ayahs.length > 0 ? (
          filteredSurah.ayahs.map((ayah) => <AyahCard ayah={ayah} key={ayah.id} />)
        ) : (
          <EmptyVerifiedContentState />
        )}
      </section>
    </main>
  );
}

function sourceOptionsFromSurah(
  surah: PublicSurahReader,
  contentKey: "translations" | "tafsirs"
) {
  const sources = new Map<string, string>();

  for (const ayah of surah.ayahs) {
    for (const content of ayah[contentKey]) {
      sources.set(content.source.id, content.source.name);
    }
  }

  return Array.from(sources.entries()).map(([id, label]) => ({ id, label }));
}

function filterSurahSources(
  surah: PublicSurahReader,
  translationSource: string,
  tafsirSource: string
): PublicSurahReader {
  return {
    ...surah,
    ayahs: surah.ayahs.map((ayah) => ({
      ...ayah,
      translations:
        translationSource === "all"
          ? ayah.translations
          : ayah.translations.filter(
              (translation) => translation.source.id === translationSource
            ),
      tafsirs:
        tafsirSource === "all"
          ? ayah.tafsirs
          : ayah.tafsirs.filter((tafsir) => tafsir.source.id === tafsirSource)
    }))
  };
}
