# Content Reliability Policy

This project must protect Quran content integrity. This policy applies to Arabic Quran text, translations, tafsir, source metadata, and import pipelines.

## Terms

- Quran text: Arabic Quran text in a defined script/reading/source.
- Translation: translation of meaning. It is not the Quran itself.
- Tafsir: explanation/interpretation from a named source.
- Source: the provider or publication from which content was imported.
- Import batch: one versioned ingestion of content from a source.
- Checksum: SHA-256 hash used to detect accidental or unauthorized change.

## Core principles

1. Traceability: every content row must trace back to a source.
2. Separation: Quran text, translation, and tafsir must be separate content types.
3. Immutability: verified Quran text must not be edited manually.
4. Verification: public pages should display only active verified content.
5. Transparency: users should see source and verification metadata.
6. No invention: the app must not invent Quran text, translations, or tafsir.

## Rules for Arabic Quran text

- Import only from an approved source.
- Record source name, provider, source version, license, import batch, checksum, and verification timestamp.
- Preserve source text exactly according to the selected script/source policy.
- Any normalization must be documented and must not change wording.
- Do not allow manual editing in admin UI.
- Do not seed production Arabic Quran text through hand-written code.

## Rules for translations

- Store translations as translation of meaning.
- Always display translator/source name.
- Preserve source text according to the source license and format policy.
- Do not label translation as Quran.
- Do not silently combine translations.

## Rules for tafsir

- Store tafsir separately from Quran and translation.
- Always show tafsir name, author if known, language, source, and version.
- Do not allow AI-generated explanation to be stored/displayed as tafsir.
- If AI summaries are added later, label them as generated summaries and cite source tafsir/ayah references.

## Source approval checklist

Before importing a source, record:

- source name
- provider/publisher
- content type
- language
- URL
- license and license URL
- allowed use notes
- version/date
- file checksum if available
- expected record count if available
- reviewer/admin approval status

## Publication rule

Content can be shown on public reading pages only when:

- it belongs to an approved `ContentSource`
- it belongs to a `ContentImport`
- it has a checksum
- it has passed verification
- it is marked active/published

## Admin rule

Admin tools may:

- upload/register source files
- run imports
- run verification
- publish/activate verified imports
- archive old imports
- review issue reports

Admin tools must not:

- directly edit Quran text
- directly edit translation text
- directly edit tafsir text
- auto-fix content based on a user report
- silently replace an active source without an import and verification record

## Issue reports

Issue reports are signals, not edits. A report should create a review item with:

- content type
- ayah reference if applicable
- source/content id if applicable
- user message
- status
- timestamps

Resolution must happen through source review and a new verified import when content changes are required.

## Implemented safeguards

- Public repository queries filter Quran text by active row, approved source, published import, and non-null verification timestamp.
- Public translation and tafsir queries filter by active row, approved source, and published import.
- Admin pages do not include direct edit forms for Quran text, translation text, or tafsir text.
- Admin dashboards are readable, but verify/publish mutations are hidden and server-guarded unless `ADMIN_IMPORTS_ENABLED=true`.
- Import scripts stage inactive rows and generate per-row SHA-256 checksums.
- Verification scripts recompute row checksums and record `VerificationReport` rows.
- Publish requires a verified import and an approved source.
- Issue reports create review records and do not mutate authoritative content.
- Tanzil downloading is explicit (`npm run content:download:tanzil`), uses the official Tanzil endpoint, preserves the original file separately, records file checksums, and converts only row structure into the documented import JSON shape.
