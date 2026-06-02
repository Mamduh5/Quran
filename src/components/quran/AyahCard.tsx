import Link from "next/link";

import { SourceBadge } from "@/components/source/SourceBadge";
import { SourceDetailsPanel } from "@/components/source/SourceDetailsPanel";
import { VerificationBadge } from "@/components/source/VerificationBadge";
import { ArabicTextBlock } from "@/components/quran/ArabicTextBlock";
import { TafsirBlock } from "@/components/quran/TafsirBlock";
import { TranslationBlock } from "@/components/quran/TranslationBlock";
import type { PublicAyahContent } from "@/modules/quran/domain/repositories/public-quran-repository";

export function AyahCard({ ayah }: { ayah: PublicAyahContent }) {
  return (
    <article className="rounded-lg border border-line bg-panel p-4 shadow-soft sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <Link
          className="focus-ring rounded px-1 font-semibold text-ink"
          href={`/quran/${ayah.surahNumber}/${ayah.ayahNumber}`}
        >
          Ayah {ayah.reference}
        </Link>
        {ayah.quranText ? (
          <VerificationBadge verifiedAt={ayah.quranText.verification.verifiedAt} />
        ) : null}
      </div>

      {ayah.quranText ? (
        <div className="space-y-4">
          <ArabicTextBlock text={ayah.quranText.text} />
          <div className="flex flex-wrap gap-2">
            <SourceBadge source={ayah.quranText.source} />
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-line bg-white p-5 text-sm text-muted">
          Arabic Quran text is not available for this ayah because no active
          verified source row is published.
        </div>
      )}

      <div className="mt-5 grid gap-4">
        {ayah.translations.length > 0 ? (
          ayah.translations.map((translation) => (
            <div className="grid gap-2" key={translation.id}>
              <TranslationBlock
                language={translation.language}
                text={translation.text}
              />
              <SourceBadge source={translation.source} />
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-line bg-white p-4 text-sm text-muted">
            No verified translation of meaning is published for this ayah.
          </div>
        )}

        {ayah.tafsirs.length > 0 ? (
          ayah.tafsirs.map((tafsir) => (
            <div className="grid gap-2" key={tafsir.id}>
              <TafsirBlock
                language={tafsir.language}
                text={tafsir.text}
                title={tafsir.tafsirName}
              />
              <SourceBadge source={tafsir.source} />
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-line bg-white p-4 text-sm text-muted">
            No verified tafsir / explanation is published for this ayah.
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-3">
        {ayah.quranText ? (
          <SourceDetailsPanel
            checksum={ayah.quranText.verification.checksum}
            label="Arabic Quran text source details"
            source={ayah.quranText.source}
          />
        ) : null}
        {ayah.translations.map((translation) => (
          <SourceDetailsPanel
            checksum={translation.checksum}
            key={translation.id}
            label="Translation source details"
            source={translation.source}
          />
        ))}
        {ayah.tafsirs.map((tafsir) => (
          <SourceDetailsPanel
            checksum={tafsir.checksum}
            key={tafsir.id}
            label="Tafsir source details"
            source={tafsir.source}
          />
        ))}
      </div>

      <Link
        className="focus-ring mt-5 inline-flex rounded border border-line px-3 py-2 text-sm font-semibold text-accent"
        href={`/reports/new?ayah=${ayah.reference}`}
      >
        Report possible issue
      </Link>
    </article>
  );
}
