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
```

Edit `.env` and set `DATABASE_URL` to a PostgreSQL database.

```bash
npm run db:generate
npm run db:migrate
npm run dev
```

Open `http://localhost:3000`.

Admin pages are protected by default. To enable admin actions in a trusted environment:

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

1. Place reviewed source JSON files under `data/sources/`.
2. Run `npm run content:import -- data/sources/<type>/<file>.json`.
3. Run `npm run content:verify -- <import-id>`.
4. Approve source metadata before publishing.
5. Run `npm run content:publish -- <import-id>`.
6. Run `npm run content:audit`.

See [docs/import-guide.md](docs/import-guide.md) and [docs/content-sources.md](docs/content-sources.md).

## Deployment

```bash
npm ci
npm run db:generate
npm run db:deploy
npm run build
npm run start
```

Set `ADMIN_IMPORTS_ENABLED=false` for public deployments unless the environment is protected by infrastructure-level access control.
