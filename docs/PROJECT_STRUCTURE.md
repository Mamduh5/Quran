# Project Structure

This file defines the target structure for the Quran reader web app. Codex should adapt it to the existing repo if the project already has conventions.

## Recommended root layout

```txt
.
├── AGENTS.md
├── README.md
├── .env.example
├── package.json
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── data/
│   ├── README.md
│   ├── sources/
│   │   └── .gitkeep
│   └── fixtures/
│       └── README.md
├── scripts/
│   ├── import-quran.ts
│   ├── import-translations.ts
│   ├── import-tafsir.ts
│   ├── verify-quran-text.ts
│   └── audit-content.ts
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── quran/
│   │   │   ├── page.tsx
│   │   │   └── [surah]/
│   │   │       ├── page.tsx
│   │   │       └── [ayah]/
│   │   │           └── page.tsx
│   │   ├── search/
│   │   │   └── page.tsx
│   │   ├── sources/
│   │   │   └── page.tsx
│   │   ├── reports/
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   └── admin/
│   │       ├── imports/
│   │       │   └── page.tsx
│   │       └── verification/
│   │           └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   ├── quran/
│   │   ├── source/
│   │   └── ui/
│   ├── modules/
│   │   ├── quran/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   └── infrastructure/
│   │   ├── translation/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   └── infrastructure/
│   │   ├── tafsir/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   └── infrastructure/
│   │   ├── content-source/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   └── infrastructure/
│   │   ├── verification/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   └── infrastructure/
│   │   ├── search/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   └── infrastructure/
│   │   └── shared/
│   │       ├── database/
│   │       ├── errors/
│   │       ├── result/
│   │       ├── validation/
│   │       └── crypto/
│   └── test/
│       ├── fixtures/
│       └── helpers/
└── docs/
    ├── PROJECT_STRUCTURE.md
    ├── UI_MOCKUP_BASE.md
    ├── CONTENT_RELIABILITY_POLICY.md
    ├── DATA_MODEL.md
    ├── IMPORT_AND_VERIFICATION_PIPELINE.md
    ├── AGENT_TASKS.md
    └── TEST_PLAN.md
```

## Module pattern

Use this shape where practical:

```txt
modules/<module>/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── repositories/
│   └── services/
├── application/
│   ├── use-cases/
│   └── dto/
└── infrastructure/
    ├── repositories/
    ├── mappers/
    └── services/
```

## Boundary rules

- Domain must not import Next.js, Prisma, React, or filesystem libraries.
- Application may depend on domain interfaces and DTOs.
- Infrastructure may depend on Prisma, filesystem, network clients, and checksum libraries.
- Presentation may call application use cases or server services, not random SQL spread across components.
- Import scripts may use infrastructure services but must not be required for normal page rendering.

## Implemented structure

The repository now uses the recommended shape with these concrete additions:

- `src/app/` contains Next.js App Router public pages, report actions, guarded admin pages, and an error boundary.
- `src/components/` contains reader, source, report, layout, and shared UI components.
- `src/modules/quran`, `translation`, `tafsir`, `content-source`, `verification`, `search`, `reports`, `admin`, and `shared` contain domain/application/infrastructure code.
- `prisma/schema.prisma` and `prisma/migrations/20260602000000_initial/migration.sql` define the PostgreSQL schema.
- `scripts/` contains import, verify, publish, and audit entrypoints.
- `data/sources/` is ignored by Git and reserved for reviewed source files.
- `data/fixtures/` is reserved for test-only fixtures.

The implemented public pages catch missing database/content as safe empty states. Database scripts still require `DATABASE_URL` and fail with an explicit configuration message when it is absent.

## Data directories

`data/sources/` is for manually provided approved source files. Do not commit copyrighted or restricted data unless the license permits it.

`data/fixtures/` is for tiny test fixtures only. Fixtures must be labeled test-only and must not be treated as production Quran content.
