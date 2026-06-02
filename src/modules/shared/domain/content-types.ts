export const CONTENT_TYPES = [
  "quran_text",
  "translation",
  "tafsir",
  "audio",
  "metadata",
  "source_metadata",
  "display",
  "other"
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

export const PUBLIC_AUTHORITATIVE_CONTENT_TYPES = [
  "quran_text",
  "translation",
  "tafsir"
] as const;

export type AuthoritativeContentType =
  (typeof PUBLIC_AUTHORITATIVE_CONTENT_TYPES)[number];

export type TrustStatus = "candidate" | "approved" | "deprecated" | "rejected";
export type ImportStatus =
  | "staged"
  | "verified"
  | "failed"
  | "published"
  | "archived";
export type VerificationStatus = "passed" | "failed" | "warning";
