import type {
  PublicAyahContent,
  PublicQuranRepository,
  PublicSourceView,
  PublicSurahReader,
  PublicSurahSummary
} from "@/modules/quran/domain/repositories/public-quran-repository";
import { prisma } from "@/modules/shared/database/prisma";

const publicQuranTextWhere = {
  active: true,
  verifiedAt: { not: null },
  source: { trustStatus: "approved" },
  import: { importStatus: "published" }
} as const;

const publicSupplementWhere = {
  active: true,
  source: { trustStatus: "approved" },
  import: { importStatus: "published" }
} as const;

function sourceView(source: {
  id: string;
  name: string;
  provider: string;
  version: string | null;
  licenseName: string | null;
  licenseUrl: string | null;
}): PublicSourceView {
  return {
    id: source.id,
    name: source.name,
    provider: source.provider,
    version: source.version,
    licenseName: source.licenseName,
    licenseUrl: source.licenseUrl
  };
}

function safeEmpty<T>(fallback: T): (error: unknown) => T {
  return () => fallback;
}

export class PrismaPublicQuranRepository implements PublicQuranRepository {
  async listSurahs(): Promise<PublicSurahSummary[]> {
    const surahs = await prisma.surah
      .findMany({
        orderBy: { number: "asc" },
        include: {
          ayahs: {
            select: {
              quranTexts: {
                where: publicQuranTextWhere,
                select: { id: true }
              }
            }
          }
        }
      })
      .catch(safeEmpty([]));

    return surahs.map((surah) => ({
      id: surah.id,
      number: surah.number,
      nameArabic: surah.nameArabic,
      nameTransliteration: surah.nameTransliteration,
      nameEnglish: surah.nameEnglish,
      revelationType: surah.revelationType,
      ayahCount: surah.ayahCount,
      verifiedAyahCount: surah.ayahs.filter(
        (ayah) => ayah.quranTexts.length > 0
      ).length
    }));
  }

  async getSurah(surahNumber: number): Promise<PublicSurahReader | null> {
    const surah = await prisma.surah
      .findUnique({
        where: { number: surahNumber },
        include: {
          ayahs: {
            orderBy: { ayahNumber: "asc" },
            include: ayahPublicIncludes()
          }
        }
      })
      .catch(safeEmpty(null));

    if (!surah) {
      return null;
    }

    const ayahs = surah.ayahs.map((ayah) =>
      mapPublicAyah(surah.number, ayah)
    );

    return {
      id: surah.id,
      number: surah.number,
      nameArabic: surah.nameArabic,
      nameTransliteration: surah.nameTransliteration,
      nameEnglish: surah.nameEnglish,
      revelationType: surah.revelationType,
      ayahCount: surah.ayahCount,
      verifiedAyahCount: ayahs.filter((ayah) => ayah.quranText).length,
      ayahs
    };
  }

  async getAyah(
    surahNumber: number,
    ayahNumber: number
  ): Promise<PublicAyahContent | null> {
    const ayah = await prisma.ayah
      .findFirst({
        where: {
          ayahNumber,
          surah: { number: surahNumber }
        },
        include: {
          surah: { select: { number: true } },
          ...ayahPublicIncludes()
        }
      })
      .catch(safeEmpty(null));

    if (!ayah) {
      return null;
    }

    return mapPublicAyah(ayah.surah.number, ayah);
  }
}

function ayahPublicIncludes() {
  return {
    quranTexts: {
      where: publicQuranTextWhere,
      take: 1,
      orderBy: { createdAt: "desc" as const },
      include: {
        source: true,
        import: true
      }
    },
    translations: {
      where: publicSupplementWhere,
      orderBy: [{ language: "asc" as const }, { createdAt: "desc" as const }],
      include: {
        source: true
      }
    },
    tafsirs: {
      where: publicSupplementWhere,
      orderBy: [{ language: "asc" as const }, { createdAt: "desc" as const }],
      include: {
        source: true
      }
    }
  };
}

function mapPublicAyah(
  surahNumber: number,
  ayah: Awaited<
    ReturnType<typeof prisma.ayah.findFirst>
  > extends infer _Unused
    ? {
        id: string;
        ayahNumber: number;
        quranTexts: Array<{
          id: string;
          scriptType: string;
          text: string;
          checksum: string;
          verifiedAt: Date | null;
          source: Parameters<typeof sourceView>[0];
          import: { importStatus: string };
        }>;
        translations: Array<{
          id: string;
          language: string;
          translatorName: string | null;
          text: string;
          checksum: string;
          source: Parameters<typeof sourceView>[0];
        }>;
        tafsirs: Array<{
          id: string;
          language: string;
          tafsirName: string;
          authorName: string | null;
          text: string;
          checksum: string;
          source: Parameters<typeof sourceView>[0];
        }>;
      }
    : never
): PublicAyahContent {
  const quranText = ayah.quranTexts[0] ?? null;

  return {
    id: ayah.id,
    reference: `${surahNumber}:${ayah.ayahNumber}`,
    surahNumber,
    ayahNumber: ayah.ayahNumber,
    quranText: quranText
      ? {
          id: quranText.id,
          scriptType: quranText.scriptType,
          text: quranText.text,
          source: sourceView(quranText.source),
          verification: {
            importStatus: "published",
            verifiedAt: quranText.verifiedAt,
            checksum: quranText.checksum
          }
        }
      : null,
    translations: ayah.translations.map((translation) => ({
      id: translation.id,
      language: translation.language,
      translatorName: translation.translatorName,
      text: translation.text,
      source: sourceView(translation.source),
      checksum: translation.checksum
    })),
    tafsirs: ayah.tafsirs.map((tafsir) => ({
      id: tafsir.id,
      language: tafsir.language,
      tafsirName: tafsir.tafsirName,
      authorName: tafsir.authorName,
      text: tafsir.text,
      source: sourceView(tafsir.source),
      checksum: tafsir.checksum
    }))
  };
}
