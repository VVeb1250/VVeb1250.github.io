# vveb1250.github.io

Portfolio of Teethawat “Web” Kumying — Astro 7, EN / TH / JA, light + dark. Component gallery at `/kit/` (not indexed by search engines).

For AI assistants: start with [`AGENTS.md`](AGENTS.md).

## Run it

Needs Node 22.12+ (Node 24 recommended).

```bash
npm install
npm run dev      # http://localhost:4321  (drafts visible)
npm run build    # production build into dist/
npm run preview  # serve dist/
npm run check    # type check
```

## Deploy to GitHub Pages (free)

1. Create a **public** repository named exactly **`VVeb1250.github.io`** on GitHub.
2. From this folder, commit and push to its `main` branch:
   ```bash
   git init -b main
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/VVeb1250/VVeb1250.github.io.git
   git push -u origin main
   ```
   (`_note/`, `_source/`, `node_modules/` and `dist/` are git-ignored and never uploaded.)
3. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Every push to `main` now builds and publishes to **https://vveb1250.github.io** (workflow: `.github/workflows/deploy.yml`).
   The first run takes ~1–2 minutes; watch it in the **Actions** tab.

## Where things are

| | |
|---|---|
| Facts about each work | `src/content/works/*.yaml` |
| Work page stories | `src/content/stories/<lang>/*.mdx` |
| Media | `src/assets/works/<work>/` |
| Components | `src/components/` → reference in `docs/COMPONENTS.md`, live at `/kit/` |
| How to compose a page | `docs/STORY-RECIPES.md` |
| Colors | `scripts/tokens.config.mjs` → `npm run tokens` |
| Private notes (not published) | `_note/`, `_source/` (git-ignored) |

## Pages

`/` home · `/work/` showcase · `/work/<id>/` work pages · `/about/` · `/timeline/` (+ `/timeline/<id>/` competition and teaching pages) ·
`/kit/` component gallery — each also under `/th/…` and `/ja/…`. `/lab` and `/archive` redirect to `/work/` and `/timeline/`.

## License

Code and components: MIT. Content, pictures and text: all rights reserved. See [`LICENSE`](LICENSE).
