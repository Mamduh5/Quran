# Getting Started

## Requirements

- Node.js compatible with Next.js 16.
- PostgreSQL, or Docker Desktop for the local Compose Postgres service.
- A reviewed source file before importing production Quran, translation, or tafsir content.

## Local Setup

```bash
npm install
copy .env.example .env
docker compose up -d postgres
npm run db:generate
npm run db:migrate
npm run dev
```

Configure `.env`:

```env
DATABASE_URL="postgresql://quran:change-me@localhost:5432/quran_reader?schema=public"
TEST_DATABASE_URL="postgresql://quran:change-me@localhost:5432/quran_reader_test?schema=public"
ADMIN_IMPORTS_ENABLED="false"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

The app starts with safe empty states if no verified content has been imported.

## Docker Database

`docker-compose.yml` starts PostgreSQL 16 on `localhost:5432` with:

- database: `quran_reader`
- test database: `quran_reader_test`
- user: `quran`
- password: `change-me`

If Docker Desktop is installed but not running, start it first, then run:

```bash
docker info
docker compose up -d postgres
```

The test database is created by `prisma/docker/init-test-db.sql` on a fresh Docker volume.

## Tanzil Content Import

The first supported production source is Tanzil Arabic Quran text.

```bash
npm run content:download:tanzil
npm run content:import -- data/sources/processed/tanzil/quran-uthmani-v1.1.json
npm run content:verify -- <import-id>
npm run content:publish -- <import-id>
npm run content:audit
```

The downloader uses the official Tanzil download page and endpoint, keeps the original source file under `data/sources/original/tanzil/`, writes processed JSON under `data/sources/processed/tanzil/`, and records file checksums in a local manifest.

## Admin Access

Admin mutation pages are disabled unless:

```env
ADMIN_IMPORTS_ENABLED="true"
```

This is an environment guard, not full authentication. For production admin access, put these routes behind platform auth, VPN, or a reverse proxy allowlist before enabling mutations.

## Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx prisma validate
```

With `npm run dev` running:

```bash
npm run app:check:routes -- http://localhost:3000
```

## Deploy

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

Keep `data/sources/` out of Git unless a source license explicitly permits committing the files.
