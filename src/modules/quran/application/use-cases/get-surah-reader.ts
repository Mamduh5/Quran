import { z } from "zod";

import type {
  PublicQuranRepository,
  PublicSurahReader
} from "@/modules/quran/domain/repositories/public-quran-repository";

const surahParamSchema = z.coerce.number().int().min(1).max(114);

export class GetSurahReader {
  constructor(private readonly repository: PublicQuranRepository) {}

  async execute(input: unknown): Promise<PublicSurahReader | null> {
    const surahNumber = surahParamSchema.parse(input);
    return this.repository.getSurah(surahNumber);
  }
}
