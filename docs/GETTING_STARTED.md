# Getting Started

## Requirements

- Node.js compatible with Next.js 16.
- PostgreSQL.
- A reviewed source file before importing production Quran, translation, or tafsir content.

## Local Setup

```bash
npm install
copy .env.example .env
npm run db:generate
npm run db:migrate
npm run dev
```

Configure `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/quran_reader?schema=public"
ADMIN_IMPORTS_ENABLED="false"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

The app starts with safe empty states if no verified content has been imported.

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
```

## Deploy

```bash
npm ci
npm run db:generate
npm run db:deploy
npm run build
npm run start
```

Keep `data/sources/` out of Git unless a source license explicitly permits committing the files.
