# Content model

Two collections, defined and validated in `src/content.config.ts`. The schema is strict: an unknown kind, status or plate,
missing English text, or an image path that does not exist **fails the build**.

## Works — `src/content/works/<id>.yaml`

Facts about one entry — a work, a competition or a teaching role — shared by every language. The file name is the id
(`vaja.yaml` → `vaja`). Every entry is a row on the Timeline (`/timeline/`), ordered by `date` (or `year`).

| field | required | what |
|---|---|---|
| `title` | ✔ | Name as the owner writes it. Not translated. Quote it if it contains ` #` (YAML reads the rest as a comment). |
| `kind` |  | `work` (default) · `art` (the owner's drawing) · `competition` · `teaching`. A work's or art's page is `/work/<id>/`; an event's page is `/timeline/<id>/`. |
| `cat` | ✔ | Kind of work: `game` `ai` `dev` `tool` `sys` `ui` `hw` → its color family. An event or drawing that is not one kind of work: `self` (the owner's own blue). |
| `year` | ✔ | Year it happened (number). |
| `date` |  | `"YYYY-MM"` or `"YYYY-MM-DD"` when Facts give it; places the row within its year (must be in `year`). |
| `opens` |  | A row with no page of its own can open part of another page instead (locale-free, e.g. `/timeline/icpc/#y2025`). |
| `more` |  | A little more than `line`, shown when a Timeline row without a page is opened. `L`. |
| `type` | ✔ | Mono type line, e.g. `GAME · UNITY 6`. |
| `line` | ✔ | One sentence: what it is and what the owner did. `L` (en required). |
| `fact` |  | The single strongest fact for cards (`Winner · AI track`). |
| `status` |  | `ACTIVE` `WIP` `VALIDATED` `FAILED` `ARCHIVED` `REVISITING` `NOT STARTED`. |
| `idx` |  | Two-digit index for featured works (`"01"`). |
| `quote` |  | The work's own tagline or rule. |
| `meta` |  | `[{ k, v }]` — `k` is a known key (`type role engine when result team commits stack built install hosts host versions origin installs status topic staff where`) or any `L`. |
| `cover` |  | `{ src, alt, plate, frame, cut?, note?, callouts[] }` — `src` is a path relative to the YAML: `../../assets/works/<id>/<file>`. |
| `links` |  | `[{ kind, url, label, note? }]` — kind: `github npm marketplace live pixiv video paper other`. |
| `tags` |  | `coursework team solo oss hackathon startup lab` — used by the Timeline's chips (`hackathon` counts as a competition) and evidence picking. |
| `page` |  | `true` if it has a story page: a work → add it to `WORK_ORDER` in `src/lib/site.ts`; an event → to `EVENT_ORDER` in `src/lib/works.ts`. |
| `related` |  | Ids of related works (for RelatedWork). |
| `sources` |  | Where the facts come from. Not shown; required habit. |

`L` = a plain string (same in every language) or `{ en: '…', th: '…', ja: '…' }`.

```yaml
title: Z80 Workspace
cat: dev
year: 2026
type: DEV TOOL · BROWSER IDE
idx: "02"
page: true
line:
  en: A browser IDE for Z80 assembly that runs the course's real assembler and board simulator …
  th: IDE บนเบราว์เซอร์สำหรับ Z80 assembly …
fact: { en: Built in 9 days · used in 2 labs, th: ทำใน 9 วัน · ใช้จริง 2 แลป }
meta:
  - { k: built, v: 9 days · 2026-07-22 → 07-30 }
tags: [solo]
sources: [portfolio-facts §2.2, GoatCounter 2026-07-20 → 09-26]
```

## Stories — `src/content/stories/<lang>/<id>.mdx`

The narrative of a work page. Frontmatter:

```yaml
---
work: z80            # id of the work
recipe: scope-lesson # see docs/STORY-RECIPES.md
summary: One line for <meta description>.
---
```

Body: Markdown + components (no imports). Markdown paragraphs become the text column; `##` makes a small section label;
lists are allowed. Wrap side-by-side blocks in `<div class="pair">…</div>`.

## Media — `src/assets/works/<id>/`

Referenced everywhere as `"<id>/<file>"`. Images are resized and converted automatically (astro:assets); videos get a
hashed URL. Guidelines: WebP/PNG for images (transparent PNG/WebP for cutouts on a Stage), MP4 (H.264) under ~5 MB for clips,
always a poster image for videos, sprite strips as one horizontal image with equal-width frames.

## Where other text lives

- Site identity, nav, the list of work pages → `src/lib/site.ts`
- Fixed interface words (buttons, labels) → `UI` in `src/lib/i18n.ts`
- Closed vocabularies (kinds, statuses, filters, process steps, verdicts, actors) → `src/lib/vocab.ts`
- Page-level copy (home intro, about bio) → the page files in `src/pages/[...locale]/` (move to content when it grows)

## Drafts

Anything not stated by the owner → `<Draft>…</Draft>` in a story, visible only in `npm run dev`. Numbers, names and dates
are never drafted: without the real value, leave it out.
