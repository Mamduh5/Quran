export type SearchResult = {
  reference: string;
  surahNumber: number;
  ayahNumber: number;
  contentType: "surah" | "quran_text" | "translation" | "tafsir";
  snippet: string;
  sourceName: string;
};

export interface SearchRepository {
  searchVerifiedContent(query: string): Promise<SearchResult[]>;
}
