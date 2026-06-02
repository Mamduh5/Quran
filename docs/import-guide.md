# Import Guide

This project imports production content from JSON files. Do not type Quran, translation, or tafsir text into code, UI files, seed files, or admin forms.

## Source File Format

```json
{
  "metadata": {
    "sourceName": "Reviewed Source Name",
    "provider": "Publisher or Provider",
    "contentType": "quran_text",
    "language": "ar",
    "version": "source version or date",
    "url": "https://example.com/source",
    "licenseName": "reviewed license or terms",
    "licenseUrl": "https://example.com/license",
    "trustStatus": "approved",
    "notes": "Attribution or handling notes"
  },
  "expectedRecords": 6236,
  "rows": [
    {
      "surahNumber": 1,
      "ayahNumber": 1,
      "scriptType": "uthmani",
      "text": "<exact source text>"
    }
  ]
}
```

For translations:

```json
{
  "metadata": {
    "sourceName": "Reviewed Translation Source",
    "provider": "Publisher or Provider",
    "contentType": "translation",
    "language": "en",
    "version": "source version or date",
    "trustStatus": "approved"
  },
  "rows": [
    {
      "surahNumber": 1,
      "ayahNumber": 1,
      "language": "en",
      "translatorName": "Translator name",
      "text": "<exact source translation>"
    }
  ]
}
```

For tafsir:

```json
{
  "metadata": {
    "sourceName": "Reviewed Tafsir Source",
    "provider": "Publisher or Provider",
    "contentType": "tafsir",
    "language": "en",
    "version": "source version or date",
    "trustStatus": "approved"
  },
  "rows": [
    {
      "surahNumber": 1,
      "ayahNumber": 1,
      "language": "en",
      "tafsirName": "Tafsir name",
      "authorName": "Author name",
      "text": "<exact source tafsir>"
    }
  ]
}
```

The examples above use placeholders, not production religious content.

## Commands

```bash
npm run content:import -- data/sources/quran/source.json
npm run content:verify -- <import-id>
npm run content:publish -- <import-id>
npm run content:audit
```

Type-specific aliases:

```bash
npm run content:import:quran -- data/sources/quran/source.json
npm run content:import:translations -- data/sources/translations/source.json
npm run content:import:tafsir -- data/sources/tafsir/source.json
npm run content:verify:quran -- <import-id> --publish
```

## Checksum Format

Row checksums use SHA-256 over this exact payload:

```txt
contentType|sourceId|importId|surahNumber|ayahNumber|scriptOrLanguage|text
```

Import summary checksums sort row checksums and hash them joined by newline.

## Verification and Publish Rules

- Import creates inactive staged rows.
- Verification recomputes checksums from stored rows.
- Failed verification marks the import failed and keeps rows inactive.
- Publish requires a verified import and an approved source.
- Publishing activates rows for the import and archives previous published imports from the same source.
- Public pages require active row, approved source, published import, and verified Quran text timestamp.

## Failure Behavior

The importer rejects malformed source metadata, invalid surah references, duplicate rows for the same reference/source key, and expected record count mismatches.

If `DATABASE_URL` is missing, scripts fail with a clear message telling you to configure `.env`.
