# YOUnfollowed

**Find out who doesn't follow you back. No login required.**

YOUnfollowed is a privacy-first Instagram followers analyzer that runs entirely in
your browser. You upload the official data export ZIP that Instagram emails you,
and the app computes who doesn't follow you back, who you don't follow back, ghost
followers, and engagement insights — without ever sending your data anywhere.

## Privacy model

- **No backend, no database, no API.** Everything runs client-side.
- Your ZIP is parsed in-browser with [JSZip](https://stuk.github.io/jszip/). The
  file never leaves your device and is never uploaded.
- No accounts, no login, no tracking of your data.

## What it computes

- **Don't Follow Back** — accounts you follow that don't follow you.
- **You Don't Follow** — accounts following you that you haven't followed back.
- **Ghost Followers** — followers who never liked or commented on your posts
  (requires Likes/Comments data in the export; otherwise this tab is disabled).
- **Engagement** — your most active followers, ranked by likes + comments.

## Getting your Instagram data

Request your data from Instagram (Settings → Your Activity → Download Your
Information). **Choose JSON format, not HTML.** Instagram takes 24–48h to prepare
the file, then emails you a `.zip`. Upload that ZIP here.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build
npm start        # serve the production build
```

## Testing

Unit tests (Vitest) cover the relationship math (analyzer), the in-browser
ZIP/JSON parsing (parser, using in-memory JSZip archives), and the formatting
helpers. The `@/*` path alias is wired up in `vitest.config.ts`.

```bash
npm test          # run once (vitest run)
npm run test:watch # watch mode
```

Tests live in `tests/` (`analyzer.test.ts`, `parser.test.ts`, `format.test.ts`).

## Production checklist

Done:

- SEO metadata, Open Graph / Twitter card, theme color, accessible viewport,
  apple-web-app meta, and an auto-detected SVG favicon (`app/icon.svg`).
- Robust parser edge cases: oversized-file rejection (>1GB), empty ZIP,
  HTML-only export, non-Instagram ZIP, malformed-JSON skipping, split
  `followers_1/2.json` merge, nested `connections/followers_and_following/`
  layout, and href-derived usernames.
- UI polish: capped lists with a "Show all N" toggle, truncated long usernames,
  clear "Unfollowed (~90 days)" expectation-setting copy, accessible labels,
  `prefers-reduced-motion` support, and >=40px tap targets.
- Thousands-separator number formatting (`formatCount`) for large accounts.
- Unit tests (Vitest).
- Standard Next.js production build.

Remaining before launch:

- Validate against a real, recent Instagram data export end-to-end.
- Deployment (hosting, domain, real `metadataBase`, optional OG share image).

## Deploy to Vercel

This is a standard Next.js (App Router) app and deploys to Vercel with zero
configuration:

1. Push this repo to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Vercel auto-detects Next.js — just click **Deploy**.

Because all processing is client-side, no environment variables or serverless
functions are required.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- JSZip for in-browser ZIP parsing

## Project structure

```
app/                 Next.js App Router (layout, page, global styles)
components/App.tsx    All 5 screens + client-side state machine
lib/parser.ts         Defensive JSZip parser for Instagram exports
lib/analyzer.ts       Set-based relationship + engagement analysis
lib/sampleData.ts     Built-in demo data (same shape as the parser output)
lib/format.ts         Date / avatar formatting helpers
types/instagram.ts    Shared TypeScript interfaces
```

## Notes on Instagram export format

Instagram's export layout varies between versions. The parser matches files by
**filename pattern** (case-insensitive) anywhere in the ZIP rather than by exact
path, and recursively extracts `string_list_data` entries so it handles both the
array shape (`followers_N.json`) and the object shape
(`following.json` → `relationships_following`). If a future export changes these
conventions, `lib/parser.ts` is the single place to adjust.
