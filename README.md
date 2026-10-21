# Kira Serasi 💕

The childhood name-compatibility game ("Serasi" = *compatible* in Malay), redrawn in colored pencil on an exercise-book page.

Write two names → count the letters → add the outer pairs row by row → get a percentage. Calculated entirely in your browser, installable as a Progressive Web App (PWA), and shareable on WhatsApp / Instagram / TikTok.

> Previously a Streamlit app. The original code is preserved in [`/legacy`](./legacy) and at the `legacy-streamlit` git tag.

---

## The Rules

1. Combine both names. Keep **A–Z only** (case-insensitive, accents stripped, spaces/symbols ignored).
2. Count each letter in order of first appearance. Counts ≥ 10 are split into digits.
3. Repeat until two numbers remain: add the outermost pair, then the next pair inwards, and so on. Sums ≥ 10 are split into digits. With an odd count, the **middle number moves to the end** of the next row.
4. The two remaining digits form your percentage.

```text
[1,2,3,4,5,6,7] → [8,8,8,4] → [1,2,1,6] → [7,3]  = 73%
```

Fewer than two numbers? The app prompts for longer names instead of crashing.

The engine lives in [`src/engine`](./src/engine/index.ts): pure TypeScript, zero runtime dependencies, returning each intermediate step so the UI can animate the working.

---

## Tech Stack & Features

- **Frontend & Framework**: Next.js (App Router) · TypeScript · Tailwind CSS v4 · Motion
- **Design Aesthetic ("Buku Latihan")**: Authentic school lined-paper background, colored-pencil strokes, and hand-drawn SVG doodles with pencil-grain filters.
- **Synthesized Audio**: WebAudio sound effects (page flip, pencil scratch, and ending chime) synchronized with visual step-by-step reduction animations, with iOS Safari audio context unlocking.
- **Progressive Web App (PWA)**: Web App Manifest (`manifest.webmanifest`), Apple Touch Icons, and Service Worker (`sw.js`) for standalone home-screen experience and offline reliability.
- **Dynamic Viral Sharing**: Edge OpenGraph generation (`/api/og`) producing 1200×630 WhatsApp social preview cards and 1080×1920 (9:16) downloadable Story images with immutable edge CDN caching.
- **Testing & Quality**: Vitest (engine unit & fuzz tests) + Playwright (cross-browser E2E testing for desktop and mobile).
- **Security & Analytics**: Hardened HTTP security headers (`Content-Security-Policy`, `X-Frame-Options`, `nosniff`), Dependabot vulnerability scanning, and privacy-friendly, cookie-free Vercel Web Analytics.

---

## Privacy First

- **No database**: Names are never saved to a database or server logs.
- **"Sorokkan nama" (Hide names)**: Generates links containing only initials and the calculated score (e.g. `/?a=A.S.&b=N.H.&s=73&h=1`). Full names are never leaked in the link, preview card, or HTML metadata.
- **Zero personal tracking**: Analytics events only record anonymous actions (`calculate`, `share`, `story_download`), never user names or inputs.

---

## Development

```bash
# Install dependencies
npm install

# Run local development server (http://localhost:3000)
npm run dev

# Run unit and fuzz tests
npm test

# Run Playwright end-to-end tests
npx playwright test

# Type-check and lint
npm run lint

# Production build
npm run build
```

---

## Deployment (Vercel)

1. Import the repository at [vercel.com/new](https://vercel.com/new) (Framework: **Next.js**).
2. *(Optional)* Set `NEXT_PUBLIC_SITE_URL` (e.g., `https://kiraserasi.my`) if using a custom domain.
3. Enable **Web Analytics** in the Vercel project settings under the **Analytics** tab.

---

## Releases & Versioning

Kira Serasi follows [Semantic Versioning (SemVer)](https://semver.org/). Releases are automatically drafted and published on GitHub via GitHub Actions ([`.github/workflows/release.yml`](./.github/workflows/release.yml)).

### How to Publish a New Release:

1. Ensure all PRs are merged into `main` and your local repository is up to date:
   ```bash
   git checkout main
   git pull origin main
   ```

2. Bump the version according to your changes:
   ```bash
   # For bug fixes / patches:
   npm version patch   # e.g., 1.0.0 -> 1.0.1

   # For new features / enhancements:
   npm version minor   # e.g., 1.0.0 -> 1.1.0

   # For major rewrites / breaking changes:
   npm version major   # e.g., 1.0.0 -> 2.0.0
   ```
   *(This automatically updates `package.json` and creates a signed git commit & tag).*

3. Push the new commit and tag to GitHub:
   ```bash
   git push origin main --tags
   ```

4. The GitHub Action will automatically trigger, generate the changelog from merged PRs, and publish the release on [GitHub Releases](https://github.com/hadihafiz/kira-serasi/releases).

---

## Credits

Created by **Hadi Hafiz**.  
Handwriting font: [Gaegu](https://fonts.google.com/specimen/Gaegu) (SIL Open Font License 1.1).
