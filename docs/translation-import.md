# Translation Import

The first implemented translation adapter is QuranEnc `english_saheeh`.

## Source Metadata

- provider: QuranEnc
- translation key: `english_saheeh`
- language: `en`
- title from API list: `English Translation - Noor International Center`
- API docs: `https://quranenc.com/en/home/api/`
- list endpoint: `https://quranenc.com/api/v1/translations/list`
- surah endpoint: `https://quranenc.com/api/v1/translation/sura/english_saheeh/{sura_number}`
- response fields used: `sura`, `aya`, `translation`, `footnotes`
- trust status: `candidate` until source terms are approved

## Commands

```bash
npm run content:download:quranenc:translation
npm run content:import:translation -- data/sources/processed/quranenc/translation/english_saheeh.json
npm run content:verify -- <translation-import-id>
npm run content:publish -- <translation-import-id>
npm run content:audit
```

Publication is expected to fail while the source is `candidate`. Review license and redistribution terms before changing source metadata to `approved`.

## Storage

Original API responses are stored under:

```txt
data/sources/original/quranenc/translation/english_saheeh/
```

Processed import JSON is stored at:

```txt
data/sources/processed/quranenc/translation/english_saheeh.json
```

Footnotes remain in `Translation.footnotes` and are rendered separately from the translation text.
