import type {
  PublicQuranRepository,
  PublicSurahSummary
} from "@/modules/quran/domain/repositories/public-quran-repository";

export class ListPublicSurahs {
  constructor(private readonly repository: PublicQuranRepository) {}

  execute(): Promise<PublicSurahSummary[]> {
    return this.repository.listSurahs();
  }
}
