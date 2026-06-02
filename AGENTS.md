# AGENTS.md

Repository guidance for Codex and other coding agents.

## Project purpose

This repository is for a reliable Quran reader web app with Arabic Quran text, translations, tafsir, source transparency, import verification, and checksum-based content integrity.

## Core rule

Never manually create, edit, paraphrase, or modify production Quran text, translation text, or tafsir text in application code, UI files, seed files, or admin screens. Authoritative content must come through approved import sources with source metadata, version/license information, and checksums.

## Architecture expectations

Use practical Clean Architecture:

- Domain: entities, value objects, repository interfaces, domain rules.
- Application: use cases and service interfaces.
- Infrastructure: ORM repositories, source importers, checksum service, search adapters.
- Presentation: Next.js pages/routes/components/server actions.

Preferred module names:

- `quran`
- `translation`
- `tafsir`
- `content-source`
- `verification`
- `search`
- `shared`

## Coding expectations

- Follow the repository's existing package manager and style.
- Use TypeScript strictly where the repo supports it.
- Validate external input with Zod or the existing validation library.
- Keep UI components separate from import/verification logic.
- Keep import scripts out of request-time rendering paths.
- Avoid direct database calls in UI components when a use case/repository boundary is practical.
- Prefer small, testable services for checksum, validation, source metadata, and search normalization.

## Content integrity expectations

- Quran text is immutable after verified import.
- Translation and tafsir are stored separately from Quran text.
- Every content row points to a `ContentSource` and `ContentImport` where possible.
- Every content row has a SHA-256 checksum.
- Unverified imports must not be displayed in public reading pages.
- Admin pages must not offer direct edit forms for authoritative text.
- Issue reports can flag problems but must not mutate content automatically.

## UI expectations

- Reading experience should be calm, clear, and text-first.
- Arabic Quran text must be visually and semantically separate from translation and tafsir.
- Use `dir="rtl"` and suitable language attributes for Arabic text.
- Source and verification details should be visible or one click away.
- Mobile reading must be usable.

## Testing expectations

Run the repository's normal checks before finishing if available:

- lint
- typecheck
- tests
- build

Add or update tests for:

- checksum determinism
- import validation
- verification mismatch failure
- public reads returning only active verified content
- input validation for route params/forms

## Documentation expectations

When changing behavior, update relevant docs in `docs/`:

- project structure
- content reliability policy
- import/verification pipeline
- data model
- test plan

## Completion report

When done, summarize:

- files changed
- commands run
- tests/build results
- known blockers
- exact next steps for importing real verified content
