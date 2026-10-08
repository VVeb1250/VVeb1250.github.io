# AGENTS.md — read this first

Personal portfolio of **Teethawat “Web” Kumying** (Computer Engineering, Khon Kaen University). Astro 7, static, deployed to
https://vveb1250.github.io. Three languages: EN (root), TH (`/th/`), JA (`/ja/`). Light + dark.

**What it is for** (Story §0 in `_note/portfolio-story.md`, the owner's own words): open it and see the care — that time and
effort went into making these things. The work, its making material and the finish show that; sentences do not argue it.
A hiring reader must still find the plain facts at once (study, the internship wanted, contact). Credible before impressive.

If `_note/` exists (owner's private notes, not in git), read `_note/README.md` before changing anything about content
or structure — it says which note answers which question; status and open exceptions are in `_note/ISSUES.md`.
The notes outrank this file on *what to say*; this file and the component headers cover *how the code works*.

---

## Hard rules (never break)

1. **Facts only.** Every name, number, date, status, label and result must come from the owner or a linked source.
   Never invent metrics, testimonials, roles, statuses or "lessons". No lorem ipsum.
2. **Unconfirmed wording goes in `<Draft>`.** A question you propose, a retrospective line, a caption you guessed →
   wrap it. It shows (dashed) in `npm run dev` and is stripped from production. Numbers are never drafts: if you do not
   have the real number, leave the thing out.
3. **Say who did what.** Use `<AttributionBlock>` wherever teammates, AI, upstream code or course tools touched the result.
   State plainly what AI implemented and what the owner directed, judged and integrated — once, on the work's page.
   Never hide AI's part; never inflate it into a disclaimer.
7. **The owner's voice** (Story §0.3): plain and short. No taglines, slogans or manifestos; no sentences about what a work
   proves; nothing from `_note/portfolio-story.md` pasted onto the site.
4. **Structure stable, composition flexible.** Do not build a universal project card or one case-study template.
   Each work gets the composition its story needs (see `docs/STORY-RECIPES.md`). Reuse primitives, not layouts.
5. **No prototype tools in production** (mood panels, hue sliders, debug overlays).
6. **Everything has a reason.** If you cannot say what an element is for, remove it. Every technical-looking element
   (node, line, graph, number, label) must encode something real.

## Default-deny list (allowed only with a written reason + owner approval)

Glassmorphism, glow, grain (one owner-approved exception: the LabItem object column's texture; the image-sweep edge uses the
baked cloud noise, not grain — scripts/sweep.ts), 3D blobs, fake terminals / HUDs, AI-style multi-hue gradients, card grids everywhere,
giant generic section headlines, loaders, full-page WebGL, whole-site horizontal scroll, parallax on content,
animating every text block, automatic category-colored backgrounds, decorative stat widgets, GitHub trophy walls.

---

## Map

```
src/
  content/works/<id>.yaml         facts about one work (shared by all languages) — schema in src/content.config.ts
  content/stories/<lang>/<id>.mdx the story of a work page, composed from components (no imports needed)
  assets/works/<id>/…             media; referenced as "<id>/<file>" (missing file = build error)
  components/
    shell/       PageShell parts: SiteNav, Section, SectionHeader, SectionMarker, Atmosphere, Footer, toggles,
                 ReadingProgress (work pages), LoadLine (slow navigations)
    primitives/  StatusTag, CategoryTick, Signature (the owner's handwriting, public/hand/), MetaLine, RoleTag, EvidenceLink, ExternalLink, Quote, Callout, Draft,
                 Readout (a real number with its source), FallbackNotice (TH/JA page showing English) …
    media/       MediaFrame, VideoEmbed, Figure, FlowDiagram (figure from nodes/edges data), FrameStepper,
                 ScrubFrames (scroll-scrubbed sprite), PhotoCard (hobby art as a photo card),
                 IsoObject (isometric sketch from data, for abstract work), SketchReveal (sketch → the real photo on hover),
                 Pictogram (minimal pixel glyph of an object; can trace a cutout), Stage, Plate, BeforeAfter, ImageCaption,
                 PortraitSwap (the About picture: GitHub → Instagram → photo, pressed to switch)
    blocks/      AttributionBlock, ContributionBlock, ConstraintBlock, OutcomeBlock, ProcessLine, Timeline,
                 Trace (chaptered, with media + slots), Inspector (list | subject | detail), ScrollStepper,
                 ClaimLedger, Retrospective, SplitScroll, CodeExcerpt, HorizontalStrip, WorkReel (the Work page track; group showcase)
    lists/       TimelineList + TimelineRow (the Timeline page), EvidenceRow, TrailRow, ArchiveRow (RelatedWork's rows; ArchiveList is
                 kit-only now), MilestoneItem, LabItem, RelatedWork
    project/     ProjectHeader, ProjectContext, WorkNav, NextWork, PRCard (one OSS contribution, from the real PR),
                 RefBoard (the references, very large, opening a contribution page)
    showcase/    ReelPanel (the frame every Work panel shares) + one Reel* panel per work (ReelVaja, ReelZ80 … ReelDrawing); order = SHOWCASE in lib/site
    home/        HomeCover, SelectedWork, VajaFeature, Z80Feature, OSSFeature, ContactCard (work-specific compositions);
                 IntroHero, NowBar, PatternLines (kit only now)
  layouts/       PageShell.astro (every page), WorkPage.astro (frame around a work story)
  pages/[...locale]/  one file renders EN/TH/JA: index (Home), work/index (Work showcase), work/[slug], timeline/index (everything
                      by year), timeline/[slug] (competition / teaching pages), about, kit
                      (retired: /lab → /work/, /archive → /timeline/ — astro.config `redirects`)
  lib/           i18n (tx, t, href), vocab (closed lists: kinds, statuses, plates, recipes…), site (name, nav, SHOWCASE, WORK_ORDER),
                 facts (facts shown on more than one page: OSS refs, the Memory Base sketch, MSU — edit once),
                 works (collection helpers), media (key → asset), story-components (what MDX can use)
  scripts/       lifecycle (onPage), scroll loop, reveal, smooth (Lenis), transitions (page transitions),
                 lq (image loading + HUD), wipe (blockSwap), sweep (the shared sweep edge), theme (light ↔ dark switch),
                 pixels (Pictogram cells break away / reassemble), mosaic (an element at a lower resolution, SVG filter),
                 prefetch-media (next page + its pictures)
  styles/        tokens.css (GENERATED), base.css, transitions.css
scripts/         gen-tokens.mjs + tokens.config.mjs (colors), gen-docs.mjs + docparse.mjs (docs), gen-textures.mjs,
                 fontsource.mjs (font provider for astro.config fonts)
docs/            COMPONENTS.md (GENERATED), components.json (GENERATED), STORY-RECIPES.md, CONTENT-MODEL.md, DESIGN-RULES.md,
                 OBJECTS.md (how to craft isometric objects)
```

Live component gallery: `/kit/` (also `/th/kit/`, `/ja/kit/`).

## Commands

```
npm install
npm run dev        # http://localhost:4321 — drafts visible
npm run build      # production build → dist/ (fails on schema errors, missing media, bad props)
npm run check      # TypeScript / Astro diagnostics — must be 0 errors
npm run docs       # regenerate docs/COMPONENTS.md + components.json after editing any component header
npm run tokens     # regenerate colors after editing scripts/tokens.config.mjs (fails if contrast drops)
```

---

## Common tasks

**Add something to the Timeline** → create `src/content/works/<id>.yaml` (see `docs/CONTENT-MODEL.md`). It appears on
`/timeline/` in its year (and month, with `date`). A competition or teaching role is `kind: competition | teaching`,
usually `cat: self`. Without a page, its row opens in place (type, when, team / solo, `meta`, `more`, links); with
`opens`, it links to part of another page.

**Give a competition or teaching role its own page** → `page: true`, `src/content/stories/en/<id>.mdx`, and the id in
`EVENT_ORDER` (src/lib/works.ts). It renders at `/timeline/<id>/` in the work-page frame, back goes to the Timeline, and
its header carries the year. Two years of one thing (ICPC 2024 + 2025, CESCa #20 + #21) are one page; the second year's
row `opens` its part (`#y2025`, `#n21`).

**Show a work on the Work page** → add its id to `SHOWCASE` in `src/lib/site.ts` (the order there is the reel order; Home
counts it), write `src/components/showcase/Reel<Name>.astro` on `<ReelPanel work="<id>">` with the work's own visual in the
slot, and add it to `PANELS` in `src/pages/[...locale]/work/index.astro`. Text (type, year, title, fact, line, links) comes
from the YAML; a fact shown on more than one page goes in `src/lib/facts.ts`. Pinned visuals size themselves with
`var(--rp-vh)` (the height WorkReel gives them).

**Give a work its own page** → set `page: true`, add `src/content/stories/en/<id>.mdx` (TH/JA optional; English is the
fallback), add the id to `WORK_ORDER` in `src/lib/site.ts`. Pick a recipe from `docs/STORY-RECIPES.md`, then compose.

**Add media** → put files in `src/assets/works/<id>/`, reference `"<id>/<file>"`. Pictures made from the owner's originals
(people in them, his drawings) are listed in `scripts/media-map.json`: he edits the original in `_note/media-candidates/`
(blurs a face), `npm run media` makes the site picture again. Real artifacts only: the work itself,
screenshots, captures, diagrams of the real system. Transparent cutouts for objects that stand on a `<Stage>`.
One owner-approved exception: an **abstract** work (a memory layer, a skill compiler — no photo can exist) may show an
AI-made or 3D **render** of its IsoObject sketch, only through `<SketchReveal kind="render">` (tagged RENDER, never REAL),
with AI named in its AttributionBlock; the real results stay on the work page. Never a render for a work that has real
pictures, never a render presented as evidence.

**Change a component** → edit it, keep its doc header truthful (`@summary @use @avoid @behavior @example` + Props JSDoc),
run `npm run docs`, check it on `/kit/`.

**Add a component** → only when the information or behavior truly repeats (not because two mockups look alike).
Put it in the right group folder, write the doc header, add a specimen to `src/pages/[...locale]/kit/index.astro`,
and add it to `src/lib/story-components.ts` if stories may use it. Run `npm run docs`.

## Conventions

- Localized text is `L` = `"same in all languages"` or `{ en, th?, ja? }`. English required. Technical terms stay English in TH.
- Components never take a `lang` prop — they read it from the URL. Links go through `href(path, lang)` / `workHref(id, lang)`.
- Context color: an element with `data-cat="<kind>"` makes everything inside use that kind's colors (`--ctx*`).
  Identity blue (`--acc`) is for site chrome only (nav cursor, focus ring, selection bar, strip progress).
- Motion: use the tokens in `src/styles/base.css` (`--t-*`, `--e-*`). Animate transform/opacity/clip-path only.
  Reduced motion must still show every state. Heavy behavior (pin, parallax, Lenis) only on mouse devices.
- Scroll cost: the page scrolls over a fixed atmosphere, so every extra full-screen layer that moves with scroll is
  drawn again every frame — don't add one (the clouds' scroll drift was the main cause of dropped frames on large
  screens; they hold still now), and never put a CSS mask on a layer that moves (an extra offscreen pass per frame —
  the clouds are precolored tiles for that reason).
  While the page scrolls, hover is off (`html.scrolling`, scripts/scroll.ts): reveals never start mid-scroll.
- Scripts in components use `onPage()` from `src/scripts/lifecycle.ts` (runs on every client-side navigation; return a cleanup).
- Page transitions are chosen with `data-vt` on links: `deeper` (card → work), `push-next` / `push-prev`, `back`.
  During a push, `data-vt-keep` elements (WorkNav) hold still and the content moves inside `data-vt-stage` (WorkPage).
  Push and the sideways move between nav pages skip Astro's View Transition: transitions.ts wraps
  `document.startViewTransition`, which Astro's router calls once per navigation. After upgrading Astro, check that ↓ on
  a work page still moves the content at once with no frozen frame (if Astro stops calling it, the capture comes back).
- Scroll-driven blocks (ScrollStepper / ScrubFrames / SplitScroll) pin the screen while you scroll: each needs a reason, and
  never two back to back (put a normal block between them). A page built around scroll may use more than one — each
  instance runs on its own. Trace may sit next to one of them. Numbers go through `Readout` with a `source` — never a bare stat.
- Swapping one image for another inside a frame uses `blockSwap()` from `src/scripts/wipe.ts` (block → image sweep).
  Any other sweep over a picture uses `sweep()` from `src/scripts/sweep.ts` (slanted, feathered, streaked edge) — never a
  bare clip-path line; a hard edge read as stiff next to the LabItem column.
  Motion tokens in JS come from `cssMs('--t-…')` (lifecycle.ts) — the built CSS may write 300ms as .3s.
- HorizontalStrip bleeds to the screen's right edge by default. Inside anything narrower than the page column
  (or any box with overflow hidden/clip) pass `bleed={false}`, or the last cards get clipped and can't be reached.
- Every image gets a loading preview: `<Image … style={await lqStyle(meta)} data-lq />` (`lqStyle` in lib/media.ts,
  build-time blurred 20px preview; `scripts/lq.ts` develops the real picture in and drops the preview). New components
  with images must do the same. Stacked layers (only one shown at a time): switch them with `blockSwap()`, or call
  `lqSync(root)` after switching — a HUD must never sit on a hidden layer. Anything else that waits (a dialog picture,
  a sprite, a stalled video) uses `hud(el)` from `scripts/lq.ts`, not a spinner. Test with the kit's
  "Replay image loading" button or DevTools → Slow 3G (Playwright: `route()` disables the HTTP cache).
- Fonts are self-hosted through Astro's Fonts API (`astro.config.mjs` → `fonts`, provider `scripts/fontsource.mjs`,
  files from the `@fontsource*` packages). Never add a Google Fonts link — except the one Japanese stylesheet in
  PageShell (self-hosting its ~360 faces would inline ~380 KB into every page). Font stacks live in base.css (`--f-*`):
  only the last family of a stack may carry fallbacks.
- Prefetch is `scripts/prefetch-media.ts` (the page + its first two pictures, on hover / focus / touch); Astro's own
  prefetch is off on purpose (its copy is not reused by the page transition's fetch, so the HTML would load twice).
- No picture for an abstract topic → build it as an object with IsoObject — **read `docs/OBJECTS.md` first** (coordinates,
  materials, vocabulary, recipe, worked example). Real parts, real names; say "sketch" in `note`. A real rectangular
  picture goes ON a face (`screens`, reveal on hover via SketchReveal), never flat over the sketch. Never invent parts.
- A control that picks one of many (tabs, filters, a toggle, the current language) gets `class="sel"` and marks its
  state with `aria-selected` / `aria-pressed` / `aria-current` — the hover plate, press and block sweep come from
  base.css. Don't give it its own selected background.
- `.tone-light` (tokens.css) keeps the light palette inside a subtree in dark mode — only for the LabItem object tag. Put `data-cat` on the same element so the work's colors follow.
- IsoObject colors come from `--iso-*` tokens (lit from above in both modes: top brightest, left mid, right darkest).
  Never color an object face with --surface / --sunk directly — in dark mode that inverts the light.
- `--hdr-h` is the real header height (SiteNav keeps it in sync): use it for every sticky offset.

## Definition of done (any change)

- `npm run build` and `npm run check` pass with 0 errors.
- No horizontal scroll at 390px wide. Works in light and dark, EN/TH/JA.
- Nothing from the hard-ban list; anything from the default-deny list has an owner-approved reason.
- Every new claim is traceable to the owner or a source (add it to the work's `sources:`).
