# Admin Auth

Admin pages are protected by a signed HTTP-only session cookie. Passwords are verified with a `scrypt` hash stored in `ADMIN_PASSWORD_HASH`; no plaintext password is stored by the app.

## Setup

```bash
npm run admin:hash-password -- "replace-with-a-long-password"
```

Set:

```env
AUTH_SECRET="<random-long-secret>"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD_HASH="<generated-hash>"
ADMIN_IMPORTS_ENABLED="false"
```

`/admin/*` pages redirect to `/admin/login` unless a valid session is present.

## Mutation Rule

Admin mutation server actions require both:

- a valid admin session
- `ADMIN_IMPORTS_ENABLED="true"`

This two-step guard prevents a leaked password or a mistakenly exposed admin route from immediately enabling verify/publish actions.

## Local Route Check

For `npm run app:check:routes` authenticated-admin proof only:

```env
ADMIN_ROUTE_CHECK_PASSWORD="<local plaintext admin password>"
```

Do not set `ADMIN_ROUTE_CHECK_PASSWORD` in production.

## Production Checklist

- Use a long random `AUTH_SECRET`.
- Use a unique admin password and generated hash.
- Keep `ADMIN_IMPORTS_ENABLED=false` except during import maintenance.
- Serve over HTTPS so the secure cookie flag is active.
- Do not expose `ADMIN_ROUTE_CHECK_PASSWORD`.
- Rotate admin credentials when an operator leaves.
