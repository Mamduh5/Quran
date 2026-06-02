# Agent Tasks

Use this file as a scoped task breakdown. The main one-prompt Codex task may execute all tasks in sequence.

## Task 1: Repository inspection

- Identify framework and package manager.
- Identify ORM/database setup.
- Identify existing app route structure.
- Identify lint/test/build commands.
- Report assumptions in final summary.

## Task 2: Architecture scaffold

- Create or adapt module directories.
- Add domain/application/infrastructure boundaries.
- Add repository interfaces and use-case skeletons.
- Keep domain independent of Next.js and ORM.

## Task 3: Data model

- Add/update ORM schema for Quran content, sources, imports, verification, reports.
- Add unique constraints.
- Add `.env.example` if missing.
- Add migration if normal for the repo.

## Task 4: Content services

- Add checksum service.
- Add import validation services.
- Add verification service.
- Add source metadata service.
- Add scripts for import/verify/audit.

## Task 5: Public reader UI

- Build routes for Quran index, surah page, ayah page, search, sources.
- Build reusable components: AyahCard, ArabicTextBlock, TranslationBlock, TafsirBlock, SourceBadge, VerificationBadge.
- Use safe empty states when no verified content exists.

## Task 6: Admin/review UI

- Add import dashboard and verification dashboard.
- Protect or disable admin mutations if auth is absent.
- Do not add manual edit forms for authoritative content.

## Task 7: Issue reporting

- Add report form/action.
- Validate inputs.
- Store report without mutating content.
- Add basic admin list if practical.

## Task 8: Tests

- Add checksum tests.
- Add import validation tests.
- Add verification mismatch tests.
- Add public read filter tests.
- Run existing tests/lint/build.

## Task 9: Documentation

- Update docs to match implementation.
- Add getting-started notes.
- Document source import steps.
- Document limitations and next steps.

## Task 10: Final response

- Summarize implementation.
- List files changed.
- List commands run and results.
- List blockers.
- Explain how to import verified content.
