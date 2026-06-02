import { z } from "zod";

import type {
  PublicAyahContent,
  PublicQuranRepository
} from "@/modules/quran/domain/repositories/public-quran-repository";

const ayahReaderInputSchema = z.object({
  surah: z.coerce.number().int().min(1).max(114),
  ayah: z.coerce.number().int().min(1)
});

export class GetAyahReader {
  constructor(private readonly repository: PublicQuranRepository) {}

  async execute(input: unknown): Promise<PublicAyahContent | null> {
    const parsed = ayahReaderInputSchema.parse(input);
    return this.repository.getAyah(parsed.surah, parsed.ayah);
  }
}
