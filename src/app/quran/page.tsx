import { EmptyVerifiedContentState } from "@/components/ui/EmptyVerifiedContentState";
import { SurahList } from "@/components/quran/SurahList";
import { ListPublicSurahs } from "@/modules/quran/application/use-cases/list-public-surahs";
import { PrismaPublicQuranRepository } from "@/modules/quran/infrastructure/repositories/prisma-public-quran-repository";

export const dynamic = "force-dynamic";

export default async function QuranIndexPage() {
  const surahs = await new ListPublicSurahs(
    new PrismaPublicQuranRepository()
  ).execute();

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6">
      <header>
        <h1 className="text-3xl font-bold text-ink">Quran</h1>
        <p className="mt-2 max-w-3xl text-muted">
          Surah metadata appears after imports create local records. Public
          reading counts include only active verified Arabic Quran text.
        </p>
      </header>
      {surahs.length > 0 ? (
        <SurahList surahs={surahs} />
      ) : (
        <EmptyVerifiedContentState />
      )}
    </main>
  );
}
