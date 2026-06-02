import Link from "next/link";

import { AyahCard } from "@/components/quran/AyahCard";
import { EmptyVerifiedContentState } from "@/components/ui/EmptyVerifiedContentState";
import { GetAyahReader } from "@/modules/quran/application/use-cases/get-ayah-reader";
import { PrismaPublicQuranRepository } from "@/modules/quran/infrastructure/repositories/prisma-public-quran-repository";

export const dynamic = "force-dynamic";

export default async function FocusedAyahPage({
  params
}: {
  params: { surah: string; ayah: string };
}) {
  const ayah = await new GetAyahReader(
    new PrismaPublicQuranRepository()
  ).execute(params);

  if (!ayah) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <EmptyVerifiedContentState
          detail="This ayah is not available locally yet or has no published verified content."
          title="No verified ayah content is available."
        />
      </main>
    );
  }

  const previousAyah = Math.max(1, ayah.ayahNumber - 1);
  const nextAyah = ayah.ayahNumber + 1;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link className="focus-ring rounded text-sm font-semibold text-accent" href={`/quran/${ayah.surahNumber}`}>
          Back to surah
        </Link>
        <div className="flex gap-2 text-sm">
          <Link
            className="focus-ring rounded border border-line bg-panel px-3 py-2"
            href={`/quran/${ayah.surahNumber}/${previousAyah}`}
          >
            Previous
          </Link>
          <Link
            className="focus-ring rounded border border-line bg-panel px-3 py-2"
            href={`/quran/${ayah.surahNumber}/${nextAyah}`}
          >
            Next
          </Link>
        </div>
      </div>
      <AyahCard ayah={ayah} />
    </main>
  );
}
