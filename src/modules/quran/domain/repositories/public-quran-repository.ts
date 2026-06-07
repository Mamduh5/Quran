export type PublicSourceView = {
  id: string;
  name: string;
  provider: string;
  version: string | null;
  licenseName: string | null;
  licenseUrl: string | null;
};

export type PublicVerificationView = {
  importStatus: "published";
  verifiedAt: Date | null;
  checksum: string;
};

export type PublicAyahContent = {
  id: string;
  reference: string;
  surahNumber: number;
  ayahNumber: number;
  quranText: {
    id: string;
    scriptType: string;
    text: string;
    source: PublicSourceView;
    verification: PublicVerificationView;
  } | null;
  translations: Array<{
    id: string;
    language: string;
    translatorName: string | null;
    text: string;
    footnotes: string | null;
    source: PublicSourceView;
    checksum: string;
  }>;
  tafsirs: Array<{
    id: string;
    language: string;
    tafsirName: string;
    authorName: string | null;
    text: string;
    source: PublicSourceView;
    checksum: string;
  }>;
};

export type PublicSurahSummary = {
  id: string;
  number: number;
  nameArabic: string | null;
  nameTransliteration: string | null;
  nameEnglish: string | null;
  revelationType: string | null;
  ayahCount: number;
  verifiedAyahCount: number;
};

export type PublicSurahReader = PublicSurahSummary & {
  ayahs: PublicAyahContent[];
};

export interface PublicQuranRepository {
  listSurahs(): Promise<PublicSurahSummary[]>;
  getSurah(surahNumber: number): Promise<PublicSurahReader | null>;
  getAyah(
    surahNumber: number,
    ayahNumber: number
  ): Promise<PublicAyahContent | null>;
}
