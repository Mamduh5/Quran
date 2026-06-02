# UI Mockup Base

This is a design reference for Codex. It is a base direction, not a strict pixel-perfect requirement.

## Design goal

A calm, trustworthy Quran reading interface that separates:

1. Arabic Quran text
2. Translation of meaning
3. Tafsir/explanation
4. Source and verification metadata

The user should never confuse translation or tafsir with the Quran text itself.

## Visual direction

- Tone: calm, scholarly, modern, minimal.
- Layout: generous spacing, readable typography, no clutter around sacred text.
- Colors: warm neutral background, dark readable text, restrained accent color.
- Avoid: ads, flashy gradients, unnecessary animation, dark patterns, fake badges.
- Mobile: reading page must work well on small screens.

## Main routes

### `/`

Landing page sections:

- Header with app name, Quran, Search, Sources.
- Hero: "Read Quran with verified sources".
- Short trust statement: Arabic text, translation, and tafsir are source-labeled and verified.
- Primary CTA: Start reading.
- Secondary CTA: View sources.
- Feature cards: Read, Translate, Tafsir, Verification.

### `/quran`

Surah index:

- Search/filter by surah name or number.
- Grid/list of 114 surahs.
- Each row/card: number, transliterated name, English name, revelation type, ayah count.

### `/quran/[surah]`

Surah reader:

Desktop layout:

```txt
┌──────────────────────────────────────────────────────────────┐
│ Top nav: App name | Quran | Search | Sources                 │
├───────────────┬──────────────────────────────────────────────┤
│ Surah sidebar │ Surah title, controls                        │
│               │ Translation select | Tafsir select | Font    │
│               │                                              │
│               │ Ayah card                                    │
│               │ Ayah card                                    │
│               │ Ayah card                                    │
└───────────────┴──────────────────────────────────────────────┘
```

Mobile layout:

```txt
┌──────────────────────────────┐
│ Header / menu / search       │
├──────────────────────────────┤
│ Surah title                  │
│ Reader controls              │
│ Ayah card                    │
│ Ayah card                    │
│ Ayah card                    │
├──────────────────────────────┤
│ Previous / Next sticky bar   │
└──────────────────────────────┘
```

### Ayah card structure

```txt
┌──────────────────────────────────────────────────────────────┐
│ Ayah marker: 2:255                           Source: verified │
│                                                              │
│ Arabic Quran text                                             │
│ - Large font                                                  │
│ - RTL                                                         │
│ - Distinct from translation/tafsir                            │
│                                                              │
│ Translation of meaning                                        │
│ Source label                                                  │
│                                                              │
│ Tafsir / explanation                                          │
│ Collapsible if long                                           │
│ Source label                                                  │
│                                                              │
│ Details: Arabic source, translation source, tafsir source,    │
│ checksum, last verified                                       │
│ Report issue                                                  │
└──────────────────────────────────────────────────────────────┘
```

### `/quran/[surah]/[ayah]`

Focused ayah page:

- One ayah in focus.
- Previous/next ayah controls.
- Full source and verification details.
- Related tafsir panel.
- Report issue CTA.

### `/search`

Search layout:

- Search box accepts keywords and references like `2:255`.
- Filters: Quran text, translation, tafsir if supported.
- Results show exact ayah reference, snippet, content type, source label.
- Empty state must not invent content.

### `/sources`

Source registry:

- Cards/table of content sources.
- Source name, provider, type, language, license, version, last import, last verified, active status.
- Link to source/license where available.

### `/admin/imports`

Admin import dashboard:

- Import batches.
- Status: staged, verified, failed, published, archived.
- Source type and version.
- Total records.
- Checksum summary.
- Action buttons should be safe and explicit.
- No direct text edit forms.

### `/admin/verification`

Verification dashboard:

- Verification reports.
- Differences found.
- Failed rows count.
- Report JSON viewer or summary.
- Safe re-run verification action if implemented.

## Components to create

- `AppShell`
- `TopNav`
- `SurahList`
- `ReaderControls`
- `AyahCard`
- `ArabicTextBlock`
- `TranslationBlock`
- `TafsirBlock`
- `SourceBadge`
- `VerificationBadge`
- `SourceDetailsPanel`
- `IssueReportForm`
- `EmptyVerifiedContentState`

## Important UI copy examples

- "Arabic Quran text"
- "Translation of meaning"
- "Tafsir / explanation"
- "Source"
- "Last verified"
- "Report possible issue"
- "No verified content is available yet. Import and verify an approved source before publishing this view."

## Flexibility

Codex may improve the design if it preserves the reliability principles:

- clear separation of content types
- source visibility
- no manual authoritative text editing
- mobile readability
- accessible semantic markup
