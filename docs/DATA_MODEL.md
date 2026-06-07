# Data Model

This file describes the recommended schema. Codex should adapt to the existing ORM and naming conventions.

## Entity overview

```txt
Surah 1--many Ayah
Ayah 1--many QuranText
Ayah 1--many Translation
Ayah 1--many Tafsir
ContentSource 1--many ContentImport
ContentImport 1--many QuranText
ContentImport 1--many Translation
ContentImport 1--many Tafsir
ContentImport 1--many VerificationReport
Ayah 0..1--many ContentIssueReport
```

## Suggested fields

### Surah

- id
- number unique
- nameArabic optional until source metadata imported
- nameTransliteration
- nameEnglish
- revelationType
- ayahCount
- createdAt
- updatedAt

### Ayah

- id
- surahId
- ayahNumber
- juz optional
- hizb optional
- page optional
- createdAt
- updatedAt

Unique: `surahId + ayahNumber`.

### ContentSource

- id
- name
- provider
- contentType: `quran_text`, `translation`, `tafsir`, `audio`, `metadata`
- language optional
- url optional
- licenseName optional
- licenseUrl optional
- version optional
- trustStatus: `candidate`, `approved`, `deprecated`, `rejected`
- notes optional
- createdAt
- updatedAt

### ContentImport

- id
- sourceId
- contentType
- sourceVersion optional
- importStatus: `staged`, `verified`, `failed`, `published`, `archived`
- importedAt
- importedBy optional
- totalRecords
- checksumSummary optional
- manifestJson optional; importer stores parsed metadata, expected record count, and source-file details such as Tanzil download URL, downloaded timestamp, and original file checksum when present
- notes optional
- createdAt
- updatedAt

### QuranText

- id
- ayahId
- scriptType: `uthmani`, `imlaei`, or source-defined string
- text
- sourceId
- importId
- checksum
- verifiedAt optional
- locked boolean default true
- active boolean default false
- createdAt
- updatedAt

Important: do not expose an app/admin mutation path that edits `text` directly.

### Translation

- id
- ayahId
- language
- translatorName optional
- text
- sourceId
- importId
- checksum
- active boolean default false
- createdAt
- updatedAt

### Tafsir

- id
- ayahId
- language
- tafsirName
- authorName optional
- text
- sourceId
- importId
- checksum
- active boolean default false
- createdAt
- updatedAt

### VerificationReport

- id
- importId
- status: `passed`, `failed`, `warning`
- differencesFound integer
- checkedRecords integer
- reportJson optional
- createdAt

### ContentIssueReport

- id
- ayahId optional
- contentType: `quran_text`, `translation`, `tafsir`, `source_metadata`, `display`, `other`
- contentId optional
- message
- status: `open`, `reviewing`, `resolved`, `rejected`
- createdAt
- updatedAt

## Prisma shape example

This is a reference only. Codex should integrate it into the real schema style.

```prisma
model Surah {
  id                  String   @id @default(cuid())
  number              Int      @unique
  nameArabic          String?
  nameTransliteration String?
  nameEnglish         String?
  revelationType      String?
  ayahCount           Int
  ayahs               Ayah[]
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

model Ayah {
  id           String   @id @default(cuid())
  surahId      String
  ayahNumber   Int
  juz          Int?
  hizb         Int?
  page         Int?
  surah        Surah    @relation(fields: [surahId], references: [id])
  quranTexts   QuranText[]
  translations Translation[]
  tafsirs      Tafsir[]
  issueReports ContentIssueReport[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([surahId, ayahNumber])
}
```

Add the remaining models in the repo's schema style.

## Query behavior

Public reads should filter to:

- active content
- verified import status when content type requires verification
- approved source where required

Do not show staged/failed imports on public pages.

## Implemented schema

The implemented Prisma schema is in `prisma/schema.prisma` with an initial PostgreSQL migration in `prisma/migrations/20260602000000_initial/migration.sql`.

Implemented models:

- `Surah`
- `Ayah`
- `ContentSource`
- `ContentImport`
- `QuranText`
- `Translation`
- `Tafsir`
- `VerificationReport`
- `ContentIssueReport`

Implemented enums:

- `ContentType`
- `TrustStatus`
- `ImportStatus`
- `VerificationStatus`
- `IssueStatus`

Important implemented constraints:

- `Surah.number` unique.
- `Ayah.surahId + Ayah.ayahNumber` unique.
- `ContentSource.name + provider + contentType + version` unique.
- Quran text unique by `ayahId + scriptType + sourceId + importId`.
- Translation unique by `ayahId + language + sourceId + importId`.
- Tafsir unique by `ayahId + language + tafsirName + sourceId + importId`.

The schema does not add a direct manual edit path for authoritative text. Content changes should be represented by a new `ContentImport` and verified rows.

Tanzil source metadata that does not have dedicated columns, such as `downloadUrl`, `downloadedAt`, `originalFileName`, and `originalFileSha256`, is validated in the source file and stored in `ContentImport.manifestJson`. Source attribution, license, URL, version, approval status, and notes are also stored on `ContentSource`.
