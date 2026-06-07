import type {
  SearchRepository,
  SearchResult
} from "@/modules/search/domain/repositories/search-repository";
import { prisma } from "@/modules/shared/database/prisma";

export class PrismaSearchRepository implements SearchRepository {
  async searchVerifiedContent(query: string): Promise<SearchResult[]> {
    const parsedNumber = /^\d+$/.test(query) ? Number.parseInt(query, 10) : null;
    const surahFilters = [
      ...(parsedNumber ? [{ number: parsedNumber }] : []),
      { nameTransliteration: { contains: query, mode: "insensitive" as const } },
      { nameEnglish: { contains: query, mode: "insensitive" as const } }
    ];

    const [surahs, quranTexts, translations, tafsirs] = await Promise.all([
      prisma.surah
        .findMany({
          where: {
            OR: surahFilters
          },
          take: 20
        })
        .catch(() => []),
      prisma.quranText
        .findMany({
          where: {
            text: { contains: query, mode: "insensitive" },
            active: true,
            verifiedAt: { not: null },
            source: { trustStatus: "approved" },
            import: { importStatus: "published" }
          },
          take: 20,
          include: { ayah: { include: { surah: true } }, source: true }
        })
        .catch(() => []),
      prisma.translation
        .findMany({
          where: {
            text: { contains: query, mode: "insensitive" },
            active: true,
            source: { trustStatus: "approved" },
            import: { importStatus: "published" }
          },
          take: 20,
          include: { ayah: { include: { surah: true } }, source: true }
        })
        .catch(() => []),
      prisma.tafsir
        .findMany({
          where: {
            text: { contains: query, mode: "insensitive" },
            active: true,
            source: { trustStatus: "approved" },
            import: { importStatus: "published" }
          },
          take: 20,
          include: { ayah: { include: { surah: true } }, source: true }
        })
        .catch(() => [])
    ]);

    return [
      ...surahs.map((row) => ({
        reference: `${row.number}:1`,
        surahNumber: row.number,
        ayahNumber: 1,
        contentType: "surah" as const,
        snippet: `${row.nameTransliteration ?? `Surah ${row.number}`} / ${
          row.nameEnglish ?? "Metadata pending"
        }`,
        sourceName: "Surah metadata"
      })),
      ...quranTexts.map((row) => ({
        reference: `${row.ayah.surah.number}:${row.ayah.ayahNumber}`,
        surahNumber: row.ayah.surah.number,
        ayahNumber: row.ayah.ayahNumber,
        contentType: "quran_text" as const,
        snippet: row.text,
        sourceName: row.source.name
      })),
      ...translations.map((row) => ({
        reference: `${row.ayah.surah.number}:${row.ayah.ayahNumber}`,
        surahNumber: row.ayah.surah.number,
        ayahNumber: row.ayah.ayahNumber,
        contentType: "translation" as const,
        snippet: row.text,
        sourceName: row.source.name
      })),
      ...tafsirs.map((row) => ({
        reference: `${row.ayah.surah.number}:${row.ayah.ayahNumber}`,
        surahNumber: row.ayah.surah.number,
        ayahNumber: row.ayah.ayahNumber,
        contentType: "tafsir" as const,
        snippet: row.text,
        sourceName: row.source.name
      }))
    ].slice(0, 30);
  }
}
