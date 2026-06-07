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
AUTH_SECRET=""
ADMIN_EMAIL=""
ADMIN_PASSWORD_HASH=""
ADMIN_IMPORTS_ENABLED="false"
ADMIN_ROUTE_CHECK_PASSWORD=""
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

Generate a password hash:

```bash
npm run admin:hash-password -- "replace-with-a-long-password"
```

Set:

```env
AUTH_SECRET="<random-long-secret>"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD_HASH="<generated-scrypt-hash>"
```

Admin pages under `/admin/*` redirect to `/admin/login` until a valid admin session cookie exists. Admin mutation actions are disabled unless the user is authenticated and:

```env
ADMIN_IMPORTS_ENABLED="true"
```

Keep `ADMIN_IMPORTS_ENABLED=false` except during a trusted import maintenance window.

For the HTTP route checker authenticated-admin proof, set `ADMIN_ROUTE_CHECK_PASSWORD` locally to the plaintext password. Do not set this variable in production.

See [admin-auth.md](admin-auth.md).

## Translation Import

QuranEnc `english_saheeh` download/conversion is implemented:

```bash
npm run content:download:quranenc:translation
npm run content:import:translation -- data/sources/processed/quranenc/translation/english_saheeh.json
npm run content:verify -- <translation-import-id>
npm run content:publish -- <translation-import-id>
npm run content:audit
```

The processed file defaults to `trustStatus: "candidate"` because permanent redistribution terms were not explicit in the checked QuranEnc API page. Publication will fail until source review approves the source.

See [translation-import.md](translation-import.md).

## Tafsir Import

Quran Foundation Content APIs require credentials and their terms require storage review before persistent local import. Configure only after access and storage permission are approved:

```env
QF_CLIENT_ID=""
QF_CLIENT_SECRET=""
QF_ENV="prelive"
QF_TAFSIR_ID="169"
QF_TAFSIR_LANGUAGE="en"
QF_TAFSIR_PERSISTENCE_REVIEWED="true"
```

Then:

```bash
npm run content:download:tafsir
npm run content:import:tafsir -- data/sources/processed/quran-foundation/tafsir/tafsir-169.json
npm run content:verify -- <tafsir-import-id>
npm run content:publish -- <tafsir-import-id>
npm run content:audit
```

The generated source remains `candidate` unless a reviewed source file is changed to approved by policy.

See [tafsir-import.md](tafsir-import.md).

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

For the authenticated admin route proof:

```env
ADMIN_ROUTE_CHECK_PASSWORD="<local admin password>"
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
npm run content:download:quranenc:translation
npm run content:import:translation -- data/sources/processed/quranenc/translation/english_saheeh.json
npm run content:verify -- <translation-import-id>
# Publish translation only after source terms are approved.
npm run content:audit
npm run build
npm run start
```

Keep `data/sources/` out of Git unless a source license explicitly permits committing the files.
