# Quran Reader Foundation

Reliable Quran reader web app foundation built with Next.js App Router, TypeScript, Prisma, Zod, and Vitest.

The app intentionally ships with no production Quran, translation, or tafsir text. Authoritative content must be imported from reviewed source files, tracked to source metadata and import batches, checksum-verified, then published.

## What Works

- Public routes: `/`, `/quran`, `/quran/[surah]`, `/quran/[surah]/[ayah]`, `/search`, `/sources`, `/reports/new`.
- Guarded admin routes: `/admin/imports`, `/admin/verification`, `/admin/sources`, `/admin/reports`.
- Prisma schema and initial PostgreSQL migration for sources, imports, Quran text, translations, tafsir, verification reports, and issue reports.
- Import, verify, publish, and audit scripts.
- Safe empty states when no database/content is available.
- Tests for checksums, import validation, verification mismatch, public-read filtering, content immutability shape, UI separation, and admin edit-form safety.

## Setup

```bash
npm install
copy .env.example .env
docker compose up -d postgres
```

The default `.env.example` points at the local Docker Postgres service:

```env
DATABASE_URL="postgresql://quran:change-me@localhost:5432/quran_reader?schema=public"
TEST_DATABASE_URL="postgresql://quran:change-me@localhost:5432/quran_reader_test?schema=public"
ADMIN_IMPORTS_ENABLED="false"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

```bash
npm run db:generate
npm run db:migrate
npm run dev
```

Open `http://localhost:3000`.

Admin dashboards are readable by default, but mutation actions are disabled. To enable admin actions in a trusted local or protected environment:

```env
ADMIN_IMPORTS_ENABLED="true"
```

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Content Workflow

Tanzil Arabic Quran text is supported as the first production source.

1. Download from the official Tanzil endpoint and convert to the import JSON shape:
   `npm run content:download:tanzil`.
2. Import the processed file:
   `npm run content:import -- data/sources/processed/tanzil/quran-uthmani-v1.1.json`.
3. Verify the printed import id:
   `npm run content:verify -- <import-id>`.
4. Publish the verified import:
   `npm run content:publish -- <import-id>`.
5. Audit public content safety:
   `npm run content:audit`.

The downloader stores the original file under `data/sources/original/tanzil/`, the processed import file under `data/sources/processed/tanzil/`, and a local manifest with file checksums. `data/sources/` is ignored by Git.

See [docs/import-guide.md](docs/import-guide.md) and [docs/content-sources.md](docs/content-sources.md).

## HTTP Workflow Check

With the dev server running, verify the public/admin pages and report flow:

```bash
npm run app:check:routes -- http://localhost:3000
```

If a published ayah exists, this check confirms `/quran/1`, `/quran/1/1`, and `/search` show the imported content. It also submits one display issue report and verifies Quran rows are not mutated.

## Deployment

```bash
npm ci
npm run db:generate
npm run db:deploy
npm run content:download:tanzil
npm run content:import -- data/sources/processed/tanzil/quran-uthmani-v1.1.json
npm run content:verify -- <import-id>
npm run content:publish -- <import-id>
npm run content:audit
npm run build
npm run start
```

Set `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, and any platform secrets before deployment. Keep `ADMIN_IMPORTS_ENABLED=false` for public deployments unless the admin routes are protected by infrastructure-level access control.
