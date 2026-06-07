# Test Plan

## Unit tests

### Checksum service

- Same input returns same SHA-256 checksum.
- Different text returns different checksum.
- Empty text is handled according to validation policy.
- Row checksum format is stable and documented.

### Import validation

- Rejects missing source metadata.
- Rejects missing content type.
- Rejects invalid surah numbers.
- Rejects invalid ayah numbers, including ayah numbers outside each surah's known range.
- Rejects duplicate rows for the same source/import/reference.
- Rejects production import when source is not approved for publication.
- Rejects translation and tafsir rows without a row or source language.

### Verification service

- Passes when stored row checksum equals recomputed checksum.
- Fails when text changes after import.
- Records a verification report.
- Does not publish failed imports.

### Domain rules

- Quran text entity is constructed with source and checksum.
- Quran text does not expose direct mutation methods for text.
- Translation and tafsir are separate entities/content types.

## Application/use-case tests

- `GetSurah` returns only active verified Quran text.
- `GetAyahWithTafsir` separates Quran text, translation, and tafsir.
- `SearchQuran` handles ayah references like `2:255`.
- Public reads do not return staged or failed imports.
- Issue report use case creates a report without mutating content.

## UI tests or component smoke tests

If frontend test tooling exists:

- Ayah card renders Arabic section, translation section, tafsir section separately.
- Source badge appears when source metadata exists.
- Empty verified content state appears when no public content is available.
- Report issue form validates message and content type.

## E2E tests, if Playwright exists

- Visit `/quran` and see surah index or empty state.
- Visit `/sources` and see source registry or empty state.
- Submit a content issue report with valid data.
- Admin pages redirect to `/admin/login` when auth is absent.
- Authenticated admin pages render when admin credentials are configured.
- Admin mutation actions require auth plus `ADMIN_IMPORTS_ENABLED=true`.

## Manual QA checklist

- Arabic text areas use RTL direction.
- Translation is never labeled as Quran.
- Tafsir is never labeled as Quran.
- Verification/source metadata is visible.
- No UI allows direct editing of authoritative content.
- Long tafsir text does not break layout.
- Mobile reader layout is usable.

## Required commands

Run the repo's equivalents of:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

If a command is missing or fails because of environment setup, document the exact reason and next step.

## Implemented coverage

Current unit and smoke tests cover:

- checksum determinism and checksum payload stability
- source file byte checksum determinism
- summary checksum order independence
- import validation rejecting missing metadata
- import validation rejecting invalid ayah references
- import validation rejecting duplicate rows
- verification passing when row checksums match
- verification failing when stored text differs
- public-read filters hiding unapproved sources
- public-read filters hiding unpublished imports
- public-read filters hiding inactive rows
- public-read filters hiding unverified Quran text
- public-read filters allowing verified approved published active rows
- Quran text entity requiring source/import/checksum and locked status
- Quran text entity exposing no text mutation methods
- Ayah card rendering Arabic, translation, tafsir, and source detail sections separately
- admin UI source files containing no direct authoritative text edit fields
- DB-backed workflow integration using `TEST_DATABASE_URL`: malformed import rejection, valid import staging, verification, publish, verification mismatch failure, publish blocked for unapproved sources, publish blocked before verification, and public repository filtering before and after publication
- HTTP route checker script: all public/admin routes return 200, imported content appears on `/quran/1`, `/quran/1/1`, and `/search`, and issue report submission creates one report without mutating Quran rows
- admin password hash and signed-session unit tests
- QuranEnc converter tests preserving translation text and separate footnotes
- Quran Foundation tafsir converter tests preserving tafsir text
- HTTP route checker script: public routes return 200, unauthenticated admin routes redirect to login, optional authenticated admin route proof runs when `ADMIN_ROUTE_CHECK_PASSWORD` is set, published Arabic/translation/tafsir content is checked where present, and issue report submission creates one report without mutating Quran, translation, or tafsir rows

Run:

```bash
npm test
npm run app:check:routes -- http://localhost:3000
```

Database-backed workflow integration tests are enabled explicitly:

```bash
set RUN_DATABASE_TESTS=true
npm test
```

They require `TEST_DATABASE_URL`, a reachable test database, and a local environment that can spawn Prisma engines.
