import { ayahReferenceSchema } from "@/modules/shared/validation/content";

export type NormalizedSearchQuery =
  | { kind: "empty" }
  | { kind: "ayah_reference"; surahNumber: number; ayahNumber: number }
  | { kind: "text"; query: string };

export function normalizeSearchQuery(input: string): NormalizedSearchQuery {
  const query = input.trim();

  if (!query) {
    return { kind: "empty" };
  }

  const reference = ayahReferenceSchema.safeParse(query);
  if (reference.success) {
    return { kind: "ayah_reference", ...reference.data };
  }

  return { kind: "text", query: query.toLocaleLowerCase() };
}
