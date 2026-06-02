import Link from "next/link";

import type { PublicSurahSummary } from "@/modules/quran/domain/repositories/public-quran-repository";

export function SurahList({
  surahs,
  activeSurah
}: {
  surahs: PublicSurahSummary[];
  activeSurah?: number;
}) {
  return (
    <div className="grid gap-2">
      {surahs.map((surah) => (
        <Link
          className={`focus-ring rounded-lg border p-3 transition ${
            activeSurah === surah.number
              ? "border-accent bg-accent-soft"
              : "border-line bg-panel hover:border-accent"
          }`}
          href={`/quran/${surah.number}`}
          key={surah.id}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold">
                {surah.number}. {surah.nameTransliteration ?? "Unnamed surah"}
              </div>
              <div className="text-sm text-muted">
                {surah.nameEnglish ?? "Metadata pending"} · {surah.ayahCount} ayahs
              </div>
            </div>
            <span className="text-xs text-muted">
              {surah.verifiedAyahCount}/{surah.ayahCount} verified
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
