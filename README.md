# Kira Serasi 💕

The childhood name-compatibility game ("Serasi" = *compatible* in Malay), redrawn in colored pencil on an exercise-book page.

Write two names → count the letters → add the outer pairs row by row → get a percentage. Calculated entirely in your browser, shareable on WhatsApp / IG / TikTok.

> Previously a Streamlit app. The original code is preserved in [`/legacy`](./legacy) and at the `legacy-streamlit` git tag.

## The rules

1. Combine both names. Keep **A–Z only** (case-insensitive, accents stripped, spaces/symbols ignored).
2. Count each letter in order of first appearance. Counts ≥ 10 are split into digits.
3. Repeat until two numbers remain: add the outermost pair, then the next pair inwards, and so on. Sums ≥ 10 are split into digits. With an odd count, the **middle number moves to the end** of the next row.
4. The two remaining digits are your percentage.

```
[1,2,3,4,5,6,7] → [8,8,8,4] → [1,2,1,6] → [7,3]  = 73%
```

Fewer than two numbers? The app asks for longer names instead of crashing.

The engine lives in [`src/engine`](./src/engine/index.ts): pure TypeScript, no dependencies, and returns every step so the UI can animate the working.

## Stack

- Next.js (App Router) · TypeScript · Tailwind CSS v4 · Motion
- Share cards: `next/og` (`/api/og`, 1200×630 link preview and `&f=story` for 1080×1920 Stories)
- Vitest for the engine and share-link logic
- Vercel Web Analytics (cookie-free, events only: never names)

## Privacy

- No database. Names exist only in the URL the user chooses to share.
- **"Sorokkan nama"** makes the link carry only initials and the score (e.g. `/?a=A.S.&b=N.H.&s=73&h=1`). Full names never appear in the link, the preview card or the page metadata. This is covered by tests.
- Analytics events are `calculate`, `share`, `copy_link`, `story_download`, `lang_toggle`, with no user input attached.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # engine + share-link tests
npm run lint     # type-check
npm run build
```

## Deploy (Vercel)

1. Import the repo at <https://vercel.com/new> (framework: Next.js, no config needed).
2. *Optional:* set `NEXT_PUBLIC_SITE_URL` (e.g. `https://kiraserasi.my`) once you have a custom domain. Until then the Vercel production URL is used for preview images.
3. Enable **Web Analytics** in the project's *Analytics* tab to see page views. Custom events (`calculate`, `share`, …) require a plan that supports them; the game works the same without.

## Credits

Made by Hadi Hafiz. Handwriting font: [Gaegu](https://fonts.google.com/specimen/Gaegu) (SIL OFL 1.1).
