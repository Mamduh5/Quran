# Import and Verification Pipeline

This project should use an explicit pipeline for Quran text, translations, and tafsir. The pipeline should be implemented as scripts and services, not manual admin text editing.

## Source file location

Recommended local structure:

```txt
data/
├── sources/
│   ├── quran/
│   ├── translations/
│   └── tafsir/
└── manifests/
```

Do not commit restricted content unless the license allows it. Use `.gitignore` if source files must be kept local.

Implemented downloaders use `data/sources/original/<provider>/...` for preserved source responses and `data/sources/processed/<provider>/...` for converted import JSON. Current providers are Tanzil, QuranEnc, and Quran Foundation.

## Source manifest

Every import source should have metadata like:

```json
{
  "sourceName": "Example Source",
  "provider": "Example Provider",
  "contentType": "quran_text",
  "language": "ar",
  "version": "YYYY-MM-DD or source version",
  "url": "https://example.com",
  "licenseName": "verify before use",
  "licenseUrl": "https://example.com/license",
  "notes": "Do not publish until license and checksum are reviewed"
}
```

## Pipeline stages

### 1. Register source

- Upsert `ContentSource`.
- Store license/version metadata.
- Mark as `candidate` until approved.

### 2. Stage import

- Create `ContentImport` with status `staged`.
- Parse source file.
- Validate required fields.
- Generate per-row checksums.
- Store content rows as inactive.

### 3. Validate structure

For Quran text imports:

- Verify surah and ayah references are valid.
- Verify expected surah count is 114 when full Quran is expected.
- Verify expected ayah counts when metadata is available.
- Reject duplicate ayah rows for same script/source/import.

For translation/tafsir imports:

- Verify ayah references exist.
- Verify language/source fields exist.
- Reject duplicate content rows unless explicitly versioned.

### 4. Verify checksums

- Recompute row checksums from stored rows.
- Compare against staged/import manifest checksums.
- Create `VerificationReport`.
- If mismatch, set import status `failed` and keep inactive.

### 5. Publish

- Only publish if source is approved and verification passed.
- Mark previous active import inactive/archived if replacing the same source/language/script.
- Mark new rows active.
- Set import status `published`.

## Suggested commands

```json
{
  "content:import": "tsx scripts/import-content.ts",
  "content:download:tanzil": "tsx scripts/download-tanzil-quran.ts",
  "content:download:quranenc:translation": "tsx scripts/download-quranenc-translation.ts",
  "content:download:tafsir": "tsx scripts/download-tafsir.ts",
  "content:import:quran": "tsx scripts/import-quran.ts",
  "content:import:translation": "tsx scripts/import-translations.ts",
  "content:import:translations": "tsx scripts/import-translations.ts",
  "content:import:tafsir": "tsx scripts/import-tafsir.ts",
  "content:verify": "tsx scripts/verify-content.ts",
  "content:verify:quran": "tsx scripts/verify-quran-text.ts",
  "content:verify:all": "tsx scripts/verify-all-content.ts",
  "content:publish": "tsx scripts/publish-content.ts",
  "content:audit": "tsx scripts/audit-content.ts"
}
```

Adapt commands to the repository's tooling.

## Checksum policy

Use SHA-256.

Recommended row checksum input:

```txt
contentType|sourceId|importId|surahNumber|ayahNumber|scriptOrLanguage|text
```

For source-independent comparison, a second canonical text checksum can be useful:

```txt
surahNumber|ayahNumber|scriptOrLanguage|text
```

Be consistent and document the exact format in code.

## Failure behavior

Import/verification must fail loudly if:

- source metadata is missing
- license/status is not approved for publication
- expected records are missing
- duplicate references exist unexpectedly
- checksums mismatch
- unverified content is requested for public display

## No-runtime-fetch rule

Do not fetch random Quran/translation/tafsir content at page-render time. Runtime pages should read from verified local database content. Source download/import should be an explicit admin/script operation.

## Implemented pipeline

Implemented scripts:

```bash
npm run content:download:tanzil
npm run content:import -- data/sources/<type>/source.json
npm run content:download:quranenc:translation
npm run content:download:tafsir
npm run content:verify -- <import-id>
npm run content:publish -- <import-id>
npm run content:audit
```

For Tanzil, use:

```bash
npm run content:download:tanzil
npm run content:import -- data/sources/processed/tanzil/quran-uthmani-v1.1.json
```

The downloader stores the original Tanzil file in `data/sources/original/tanzil/`, stores converted JSON in `data/sources/processed/tanzil/`, and writes a local manifest with original and processed file SHA-256 checksums. The converter parses `surah|ayah|text` rows and skips only Tanzil copyright/comment lines from the processed row list; the original file is preserved separately.

The QuranEnc translation downloader stores translation list and per-surah API responses under `data/sources/original/quranenc/translation/english_saheeh/`, writes processed JSON under `data/sources/processed/quranenc/translation/`, and records original/processed checksums. The source remains `candidate` until terms are reviewed.

The Quran Foundation tafsir downloader is implemented but blocks unless credentials and `QF_TAFSIR_PERSISTENCE_REVIEWED=true` are provided after storage terms are reviewed. It writes original responses and processed JSON using the same original/processed directory pattern.

The importer validates source metadata and row shape with Zod, stages inactive rows, and records row and summary checksums. Verification recomputes stored row checksums and records a `VerificationReport`. Publish requires `trustStatus: "approved"` and a verified import.

Full source file examples and command usage are documented in `docs/import-guide.md`.
