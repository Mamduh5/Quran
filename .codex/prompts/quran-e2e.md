# Full E2E Codex Prompt: Reliable Quran Reader Web App

You are Codex acting as a senior full-stack engineer, application architect, and careful implementation agent. Build or refactor this repository into a reliable Quran reader web application with Arabic Quran text, translations, tafsir/explanation, source transparency, and a strict content-verification pipeline.

This is a religious-text reliability project. Treat content integrity as a first-class product requirement. Do not invent, manually type, paraphrase, summarize, or modify Quran text, translation text, or tafsir text as seed production data. Software code may include schemas, importers, fixtures clearly marked as test-only, UI placeholders, and validation logic. Production content must come only from approved import sources with source metadata and checksums.

## 0. First actions

1. Inspect the repository before editing:
   - package manager and framework
   - existing app routes
   - database/ORM setup
   - lint/test/build commands
   - current folder conventions
2. If the repo is empty or unsuitable, scaffold a practical Next.js App Router app with TypeScript.
3. Prefer the existing stack if it already exists. If there is no stack, use:
   - Next.js App Router
   - TypeScript
   - Tailwind CSS
   - PostgreSQL
   - Prisma ORM unless the repo already uses Drizzle or another ORM
   - Zod for input validation
   - Vitest or Jest for unit tests, according to repo conventions
   - Playwright only if the repo already has it or if adding it is lightweight
4. Read these docs if present:
   - `AGENTS.md`
   - `docs/PROJECT_STRUCTURE.md`
   - `docs/UI_MOCKUP_BASE.md`
   - `docs/CONTENT_RELIABILITY_POLICY.md`
   - `docs/DATA_MODEL.md`
   - `docs/IMPORT_AND_VERIFICATION_PIPELINE.md`
   - `docs/TEST_PLAN.md`
5. Work end-to-end in one pass. Do not ask the user clarifying questions unless there is a destructive decision. Make reasonable defaults and document them.

## 1. Product goal

Create a clean, reliable web app where users can:

- Read Quran by surah and ayah.
- View Arabic Quran text separately from translation and tafsir.
- Choose a translation source when multiple are available.
- Choose a tafsir source when multiple are available.
- Search Quran text and translation where indexed data exists.
- See source, version, license, checksum/verification status, and last verification date.
- Report possible content/display issues without directly editing authoritative content.
- Use a clean, calm, responsive UI suitable for reading.

Admin/editor capabilities must be limited to import management, verification reports, and issue review. Admins must not be able to manually edit Quran text, translation text, or tafsir text through the UI.

## 2. Core architectural requirement

Use practical Clean Architecture with module boundaries:

- Domain layer: entities, value objects, domain rules, repository interfaces.
- Application layer: use cases and service interfaces.
- Infrastructure layer: database repositories, importers, checksum implementation, search implementation.
- Presentation layer: Next.js routes, components, server actions/route handlers.

Do not over-engineer. Keep the first implementation readable and maintainable.

Recommended modules:

- `quran`
- `translation`
- `tafsir`
- `content-source`
- `verification`
- `search`
- `user-library` if bookmarks/reading progress are included
- `shared`

## 3. Non-negotiable content integrity rules

Implement or prepare the codebase so these rules are enforced:

1. Arabic Quran text is immutable after verified import.
2. Translation and tafsir are separate from Quran text.
3. Every content row has a source reference.
4. Every content row has source version metadata or import batch metadata.
5. Every content row has a checksum.
6. Import batches are recorded.
7. Verification reports are recorded.
8. Unverified imports are not visible in normal public reading pages.
9. Admin UI must not include direct edit forms for authoritative Quran, translation, or tafsir text.
10. Test fixtures must be obviously marked as fixtures and must not be used as production content.
11. AI-generated summaries, if later added, must never be stored or displayed as tafsir. They must be labeled separately as generated summaries and must cite source material.

## 4. Data model

Create or update the ORM schema to support at least:

- `Surah`
- `Ayah`
- `ContentSource`
- `ContentImport`
- `QuranText`
- `Translation`
- `Tafsir`
- `VerificationReport`
- `ContentIssueReport`

Optional but useful:

- `Reciter`
- `AudioFile`
- `Bookmark`
- `ReadingProgress`
- `UserPreference`

Required modeling details:

- `Surah` has number, names, revelation type, ayah count.
- `Ayah` has surah, ayah number, juz/page/hizb metadata if available.
- `QuranText` has ayah, script type, text, source, import, checksum, verified timestamp, locked flag, active flag.
- `Translation` has ayah, language, translator/source label, text, source, import, checksum, active flag.
- `Tafsir` has ayah, language, tafsir name, author if known, text, source, import, checksum, active flag.
- `ContentSource` has name, provider, URL, license, license URL, version, notes, and trust status.
- `ContentImport` has source, content type, source version, imported at, status, total records, checksum summary, notes.
- `VerificationReport` has import, status, differences found, report JSON, created at.
- `ContentIssueReport` has ayah optional, content type, content id optional, message, status, created at.

Add unique constraints where appropriate:

- `Surah.number`
- `Ayah.surahId + Ayah.ayahNumber`
- active Quran text uniqueness for ayah + script type where feasible
- translations by ayah + source/import/language
- tafsir by ayah + source/import/language/name

## 5. Import and verification pipeline

Create scripts or application services for import and verification. If actual source files are not present, create script skeletons and test fixtures only.

Required commands should be added to `package.json` when possible:

- `content:import:quran`
- `content:import:translations`
- `content:import:tafsir`
- `content:verify:quran`
- `content:verify:all`
- `content:audit`

If naming conflicts with repo conventions, adapt names but document them.

Expected behavior:

1. Read source file(s) from a configured data directory such as `data/sources/`.
2. Validate format and required metadata.
3. Validate Quran structure when importing Quran text: 114 surahs and expected ayah counts when metadata is available.
4. Normalize only technical formatting needed by the chosen source policy. Do not alter meaning or wording.
5. Generate SHA-256 checksums per row and summary checksum per import.
6. Save import as draft/staged/unpublished until verification passes.
7. Verify stored content against the source file/checksum manifest.
8. Publish only verified imports.
9. Fail loudly on mismatches.

Do not fetch random Quran content from the internet at runtime. If using APIs/sources, add a source adapter only for approved sources and require explicit source metadata.

## 6. Public routes and pages

Implement core routes using the existing routing style. For Next.js App Router, use these routes or close equivalents:

- `/` landing page with reader entry and source-transparency summary.
- `/quran` surah index.
- `/quran/[surah]` surah reading page.
- `/quran/[surah]/[ayah]` focused ayah page with translation and tafsir.
- `/search` search page.
- `/sources` source registry page.
- `/reports/new` issue report page or inline report modal.
- `/admin/imports` import status dashboard.
- `/admin/verification` verification reports dashboard.

If auth is already present, protect admin pages. If auth is absent, implement admin pages as disabled/protected placeholders or server-side guards with clear TODO notes, not open write dashboards.

## 7. UI/UX requirements

Use `docs/UI_MOCKUP_BASE.md` and `docs/ui-mockup-base.html` as directional references, not strict pixel-perfect requirements.

Design principles:

- Calm, readable, text-first.
- Arabic text receives visual priority.
- Translation and tafsir are clearly separated from Arabic Quran text.
- Source labels are always visible or one click away.
- Verification status is visible but not noisy.
- Mobile reading experience is first class.
- Avoid clutter around sacred text.
- No ads, dark patterns, popups, or manipulative UI.

Reader page layout:

- Top navigation with app name, search, sources.
- Surah/ayah selector.
- Reading controls: translation source, tafsir source, font size, theme toggle if easy.
- Ayah cards:
  - Arabic text area
  - ayah number marker
  - translation panel
  - tafsir panel/collapsible
  - source/verification metadata
  - report issue link
- Sidebar on desktop for surah list and reading navigation.
- Bottom/mobile sticky nav for previous/next ayah or surah.

## 8. Source transparency

Build a source page or component showing:

- Content source name
- Provider
- URL/license URL if available
- License summary field
- Source version
- Last import date
- Last verification date
- Active/inactive status
- Notes

For every displayed ayah, make it possible for the user to know:

- Arabic source
- Translation source
- Tafsir source
- Verification status

## 9. Search

Implement a practical first version:

- Search by surah name, surah number, ayah reference like `2:255`, and translation keywords if content exists.
- Keep Quran Arabic search optional if the repo cannot support Arabic normalization yet.
- Put normalization logic in a service, not in UI components.
- Do not invent results when the database lacks content.
- Empty state must clearly say no indexed verified content is available yet.

## 10. Issue reporting

Implement content issue reports without allowing direct edits:

- User can report a possible issue for an ayah/content item.
- Store message, content type, content id if available, ayah ref if available, status `open`.
- Admin can review reports if admin area exists.
- Do not auto-change content from reports.

## 11. Testing requirements

Add tests where practical. Minimum desired tests:

- Checksum generation is deterministic.
- Import validation rejects missing source metadata.
- Import validation rejects malformed ayah references.
- Verification fails when stored text checksum differs from source checksum.
- Public query/use case returns only active verified content.
- Quran text entity/repository does not expose manual mutation paths.
- UI component smoke test for ayah card separation of Quran/translation/tafsir if frontend test setup exists.

Also run existing tests/lint/build.

## 12. Documentation to add/update

Update or create docs:

- `docs/PROJECT_STRUCTURE.md`
- `docs/CONTENT_RELIABILITY_POLICY.md`
- `docs/IMPORT_AND_VERIFICATION_PIPELINE.md`
- `docs/DATA_MODEL.md`
- `docs/TEST_PLAN.md`

Add a brief `docs/GETTING_STARTED.md` if it helps run the project.

## 13. Security and safety

- Validate all route params and form inputs with Zod or equivalent.
- Sanitize or safely render tafsir/translation text. Do not dangerously set inner HTML unless content is sanitized and trusted.
- Keep admin mutation routes protected or disabled if auth is not implemented.
- Do not include API keys or secrets.
- Add `.env.example` for required environment variables.
- Do not add unlicensed content.

## 14. Accessibility

- Use semantic HTML.
- Ensure keyboard navigation for controls.
- Ensure good contrast in light/dark modes.
- Use logical headings.
- Arabic text should have `dir="rtl"` and language attributes where appropriate.
- Translation/tafsir should have their correct language attributes if known.

## 15. Performance

- Server-render public reading pages where practical.
- Paginate or virtualize long lists if needed.
- Avoid shipping huge tafsir payloads for entire Quran at once.
- Cache source metadata and surah indexes where appropriate.
- Keep import scripts separate from runtime page rendering.

## 16. Acceptance criteria

The work is done when:

1. The app has a clear module structure with domain/application/infrastructure/presentation separation where practical.
2. The public Quran reader route exists and renders from database/repository data or safe empty states.
3. Arabic Quran, translation, and tafsir are represented as separate content types.
4. Source metadata and verification status are modeled and displayed.
5. Import and verification scripts/services exist.
6. Checksums are generated and tested.
7. Manual editing of authoritative content is not implemented.
8. Admin pages, if present, focus on import/verification/report review only.
9. Tests/lint/build are run or documented if blocked by environment.
10. A concise implementation summary is provided with changed files, commands run, and any limitations.

## 17. When blocked

If something cannot be completed due to missing dependencies, missing database, or missing source content:

- Implement the clean interface and skeleton.
- Add tests for the pure parts.
- Add clear TODOs in docs, not scattered vague comments.
- Do not fake production content.
- Report the blocker and the exact next command or file needed.

## 18. Final response expected from Codex

At the end, provide:

- Summary of implementation.
- Important files changed/created.
- Commands run and results.
- Any skipped items and why.
- How to import verified content.
- How to run the app.

Do not provide a long philosophical explanation. Focus on what changed and how to verify it.
