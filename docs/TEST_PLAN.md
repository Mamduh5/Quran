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
- Rejects invalid ayah numbers.
- Rejects duplicate rows for the same source/import/reference.
- Rejects production import when source is not approved for publication.

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
- Admin pages are protected or clearly disabled when auth is absent.

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

Run:

```bash
npm test
```
