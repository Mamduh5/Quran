# Tafsir Import

The tafsir pipeline targets Quran Foundation Content APIs but is blocked by default until API access and persistent storage terms are reviewed.

## Source Metadata

- provider: Quran Foundation Content API
- default tafsir id: `169`
- default docs example resource: Tafsir Ibn Kathir
- auth docs: `https://api-docs.quran.com/docs/quickstart/manual-authentication/`
- tafsir docs: `https://api-docs.quran.com/docs/content_apis_versioned/4.0.0/tafsir/`
- resource list docs: `https://api-docs.quran.com/docs/content_apis_versioned/4.0.0/tafsirs/`
- developer terms: `https://qf-api-docs.pages.dev/legal/developer-terms/`
- trust status: `candidate` until storage and publication terms are approved

Quran Foundation terms checked on June 7, 2026 allow display in an application but prohibit caching or storing QF Content longer than 1 week unless expressly permitted. Persistent import therefore requires explicit review/permission.

## Commands

```bash
set QF_CLIENT_ID=<client-id>
set QF_CLIENT_SECRET=<client-secret>
set QF_ENV=prelive
set QF_TAFSIR_ID=169
set QF_TAFSIR_LANGUAGE=en
set QF_TAFSIR_PERSISTENCE_REVIEWED=true
npm run content:download:tafsir
npm run content:import:tafsir -- data/sources/processed/quran-foundation/tafsir/tafsir-169.json
npm run content:verify -- <tafsir-import-id>
npm run content:publish -- <tafsir-import-id>
npm run content:audit
```

Publication remains blocked while the processed source is `candidate`.

## Safe Empty State

If no approved, verified, published tafsir exists, public reader pages render a safe empty tafsir state. No AI-generated tafsir or unverified mirror content is used.
