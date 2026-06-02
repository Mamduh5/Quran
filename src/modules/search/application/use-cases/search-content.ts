import type {
  SearchRepository,
  SearchResult
} from "@/modules/search/domain/repositories/search-repository";
import { normalizeSearchQuery } from "@/modules/search/application/services/search-normalization";
import type { PublicQuranRepository } from "@/modules/quran/domain/repositories/public-quran-repository";

export class SearchContent {
  constructor(
    private readonly searchRepository: SearchRepository,
    private readonly quranRepository: PublicQuranRepository
  ) {}

  async execute(rawQuery: string): Promise<SearchResult[]> {
    const normalized = normalizeSearchQuery(rawQuery);

    if (normalized.kind === "empty") {
      return [];
    }

    if (normalized.kind === "ayah_reference") {
      const ayah = await this.quranRepository.getAyah(
        normalized.surahNumber,
        normalized.ayahNumber
      );

      if (!ayah?.quranText) {
        return [];
      }

      return [
        {
          reference: ayah.reference,
          surahNumber: ayah.surahNumber,
          ayahNumber: ayah.ayahNumber,
          contentType: "quran_text",
          snippet: ayah.quranText.text,
          sourceName: ayah.quranText.source.name
        }
      ];
    }

    return this.searchRepository.searchVerifiedContent(normalized.query);
  }
}
