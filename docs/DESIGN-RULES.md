# Design rules (condensed)

Foundation: **Personal Editorial Archive** — clean, breathable, refined, personal, precise, exploratory, slightly unusual.
Game-informed (Arknights: Endfield for UI principles and measured motion, Chaos Zero Nightmare for art direction), never
game-themed. The principles, and where each one came from, are in `_note/portfolio-design-system.md` (private); settled
behaviour is recorded here and in each component's header.

## Principles

1. Understand first, discover later. 2. Game-informed, not game-themed. 3. Beautiful enough to invite exploration.
4. Subject first, interface second. 5. Everything has a reason. 6. Project > template. 7. Same mind, different worlds.
8. Personal, not performative.

## Color

- **Identity blue** (Azure, H = 248) in roles: `--acc` signal · `--band` / `--wash` large low-contrast · `--spark` object lights.
  Signal is for **site chrome only**: nav cursor, focus ring, selection bar, strip progress.
- **Kinds of work** each have a family: deep → mid → pale (plate gradient) + signal `-s` (state inside that work's area).
  Inside a work's area (`data-cat`), every state color comes from its kind — never identity blue.
- **Project themes** (owner, 2026-10-08): every work or event with pictures of its own gets its own family — same
  recipe, the hue measured from its material (a poster, its screens, its art) — in `scripts/tokens.config.mjs` THEMES,
  set by `theme:` in its YAML. Its page, its parts, its Work panel, its Home block and the way into it use it. Lists
  (Timeline, Work index) and every CategoryTick keep the **kind's** color — the tick names the kind, so it never takes the
  project's color. No picture of its own (WhipUI, Memory Base, OSS for now) → the kind's color.
- **Ornaments** (owner, 2026-10-08): none on work / event pages — two attempts there (data marks beside titles; poster /
  camp motifs) looked stuck on and were removed, and the owner let the idea go. Decoration or a partial redesign is open
  only on the four main pages (Home, Work, About, Timeline) and the header; show the owner one before it spreads. The
  owner's own handwriting (public/hand/, traced from his writing; Signature) is the first: the header name mark, and his
  nickname “WeB” (quote marks drawn by us to match his pen, owner's request) raised after his name on the Home cover and
  the About title. (A portrait glyph on the Home cover and a signed, bracketed About picture were tried 2026-10-09 and
  taken back by the owner: only the quoted “WeB” stays.)
- **Plates and fog tints are opt-in.** A composition chooses to put a Plate behind a subject, or to tint the fog;
  nothing colors itself automatically. Art-led works get no plate — the art is the color.
- Gradients: only low-chroma, ≤ 3 stops, hue range ≤ ~40°, on a bounded plate behind a subject.
- Contrast is enforced by `npm run tokens` (text ≥ 4.5:1, ink ≥ 7:1).

## Type

Saira (78% width, display) + Bai Jamjuree (Thai display) · IBM Plex Sans / Thai / JP (body) · IBM Plex Mono (labels).
One big statement per screen (IntroHero, ProjectHeader). Section titles default to small mono labels; a section may take a large
display title when the title itself is the content (editorial type) — not every section, never a generic sans headline.
Thai gets more line height; Japanese uses strict line breaking.

## Imagery priority (to prove a work)

1 actual artifact · 2 screenshot · 3 prototype · 4 diagram · 5 experiment result · 6 sketch / note · 7 contextual photo ·
8 generated decoration (last resort). This ranks evidence, not visual ideas: a drawing, glyph or object may lead a
composition when the proof is one step away, and the owner's own drawings are real artifacts. Never generate fake technical imagery. Callouts and marks name real parts only.

## Motion

Tokens (measured from Endfield at 30 fps): exit 60ms `(.4,0,1,1)` · enter 500ms `(.22,1,.36,1)` · line 300 · thicken 140 ·
hold 60 · open 250 `(.87,0,.13,1)` · stagger 35 · cursor 240 · push 460 (the old content leaves in 150) · roll 500.

Motion communicates **state, selection, navigation, expansion, process, response** — "the interface responds precisely".
Content holds still at rest; a faint atmosphere and a rich reveal the viewer asks for (pointing at something) are welcome.

| where | what |
|---|---|
| card → work page | line from the click point (pointer; keyboard: the title) → 40px label bar with the title starting at the click → plane in the work's color → the page's blocks come in one after another (~0.6s in all, runs while the page loads) |
| work ↔ neighbour (↑ ↓, Next project) | header, fog and the WorkNav strip hold still — only the content moves, cut off just under WorkNav; the counter's number rolls. No View Transition (no capture, no frozen frame); the fog glides to the new scroll position instead of jumping. (Pushing whole-page snapshots moved the fog too: two skies met in a seam, ~90px jumps a frame.) The old content slides 30% of the screen's height up (next) / down (prev), gone by 60% of the way (150ms); the new content arrives as one piece from 30% below / above, fully there by 60% of the way, and settles (`--t-push` 460ms). Travel and time shrink together: faster over the same distance is what makes large motion uncomfortable |
| back | quicker (blocks 300ms, 25ms apart); lands on the origin work and the selection bar locks on for 1.4s |
| tabs (Work / About / Archive; a work page counts as Work; Home is the name mark) | the clicked item becomes current on the click frame (the nav cursor slides to it) · the content pushes sideways in the nav's order, the same way as the cursor: to an item further right the old content leaves to the left (150ms), the new page comes in from the right as one piece and settles (460ms) — travel 15% of the screen's width, never more than the push (30% of its height), at least 48px. Header and fog still, no View Transition. Browser back / forward between tabs slides the same way. The language switch and other plain links: the page's blocks come in one after another (12px rise, 35ms apart) |
| header on phones (≤760px) | one thin row: name + MENU (a text button, never an icon-only hamburger) → a panel drops under the header (clip reveal, `--t-open`), rows come in one after another; closed by the button, Esc, a tap outside or choosing a page; the page does not scroll while it is open |
| hover / focus | underline or bar extends, small positional shift, fill inversion — no glow |
| one of many (`.sel` in base.css: Inspector rail, Archive chips, FrameStepper Play, LanguageToggle) | hover: a light plate sweeps in from the left · press: it snaps back at once (the click is acknowledged first) · select: a charcoal block (ink 78% into the page in light, 66% in dark — monochrome, softer than a full inversion; text ≥ 7:1) sweeps in left → right (~140ms) with a slanted edge and a bar in the context color (`--ctx`) on its left, text turns as it passes; the old one retracts right → left at the same time. A leading cell (Inspector's number) fills first. Any new "pick one of these" control uses `.sel` |
| card object (LabItem `glyph` + `real`) | layout: the glyph and the opened object sit on the left third (⅓ across, ½ down), the index number bottom-right; the header keeps the normal card height. At rest a grey pixel glyph (Pictogram); point at the card (~90ms) → a textured charcoal column (gradient, fine hatch, grain, dark halo behind the object — owner-approved, Endfield's database column) sweeps in with a soft slanted edge while it darkens from grey, the glyph's cells break away left → right with the sweep (scripts/pixels.ts), the detailed object (IsoObject = the abstract work's "real", or a real picture) opens out, oversized and cropped by the card → SYSTEM / REAL / RENDER tag last; on leave the cells settle back right → left (other open cards in the strip close the same way). The column is `--obj-col`: charcoal in light mode, near-black in dark (Endfield's column); the object follows the mode — IsoObject materials are lit from above in both (`--iso-*` tokens), so nothing looks inverted. Never while the strip moves; touch: first tap opens, second follows the link |
| home feature (SketchReveal glyph mode) | at rest a Pictogram with a big outlined index behind it (Endfield's database numbers); point → the Plate opens as the ground (left → right, under the glyph, 450ms — slower than other plates: it is the ground the object stands on) while the glyph's cells break away with it → the object comes up in the glyph's own grid and its resolution doubles twice — cuts, 70ms each, never a fade (glyph → pixels → real; `scripts/mosaic.ts`) → the real cutout stands on the plate, overflowing it but never the box (REAL), or the work's IsoObject (SYSTEM) → brackets + tag last. (Opening at low opacity and a washed-out picture that cleared read as mushy.) One focus point for glyph and object (`focus`: centre or ⅓); the glyph is sized like the real picture (`glyphScale`) so the switch reads as one thing; box `size` sm 260 · md 340 · lg 440 · xl 640px · fill (the column); leave → back down the steps (45ms each) while the cells settle back and the plate slides away (~320ms). Every home feature has one, hosted (`host`, with `data-skr-host` on the feature root): resting the mouse anywhere on the project block, or keyboard focus on one of its links, opens it; leaving closes it. Touch: it opens while it sits in the middle band of the screen, and a tap on the open picture opens the project. The fog takes a faint tint of the project in view and the selection bar follows the current project. (The v50 code still opens the middle project on scroll through `data-skr-managed` — not the owner's rule; to be removed, `_note/ISSUES.md` I-54.) Each feature splits into the project block (`data-pj`: picture, title, one line, role, Open project — a click anywhere on it follows `data-skr-go`) and, when there is more to tell, a separate block with its own links that is not clickable as a whole (Z80's state rail, OSS's issue → PR threads, Vaja's build frame + run cycle). `lead` gives a glyph a prelude before the reveal (Z80: the three separate tool windows slide together into one layout). A scene with its own colour (Vaja) takes no plate. Reduced motion: glyph and object just swap |
| work reel (Work page, WorkReel) | desktop (hover + fine pointer, ≥1024px, no reduced motion): the track holds under the header and the scroll carries it sideways, by transform only — sen's sideways travel; the panel that reaches the column becomes current: its outlined number fills with the work's pale color, the counter follows, the fog takes its color. Touch, narrow and reduced motion: the panels stack, nothing is pinned. Nothing inside a panel moves with the scroll |
| light ↔ dark | blockSwap's grammar over the whole screen (`scripts/theme.ts`): a plane in the new mode's ground slides in from the right (the toggle's side) on the click frame — its soft leading ramp (30% of the screen, leaning 10°) is already a third on screen — covers the page (380ms), the theme switches underneath (the repaint happens out of sight), the plane slides on out to the left (380ms, `--e-glide`). Transform only: no page capture, so the click never freezes and it runs without View Transitions. (A View Transition sweep had to capture the page first and its clipped edge read as stiff.) CSS transitions are off while it switches; a step that changes nothing on screen (Auto → Light on a light device) just changes the setting. Reduced motion: instant |
| image sweep (every one: image swap, SketchReveal's plate and picture, the loading veil) | never a bare clip-path line: the edge is the shared sweep material — `src/scripts/sweep.ts`. Slanted 10° like the plates, feathered, and frayed into short streaks along the travel (motion blur, Endfield's swept bands) by the atmosphere's own baked cloud noise stretched along the sweep; the swap block carries the plate's lean of light (one hue, a touch lighter at the top). An opening from the middle (SketchReveal's picture) is feathered only — side-by-side streaks read as a barcode. Owner-approved texture exception: no grain, no live noise (bake once, let `mask` scale it). Reduced motion: no sweep |
| image swap (ScrollStepper, SplitScroll, Inspector) | block in the work's signal sweeps over the old image's own box (140ms) → reshapes to the new image's box if it differs (120ms) → new image sweeps in as the block leaves (240ms; the block trails the picture's edge a little, so the feathered edge shows picture over block), in the direction of travel — `src/scripts/wipe.ts`. Images show at their own size (no letterbox panels). Next picture not there yet: the block holds (≤1.2s) with a LOADING tag after 150ms, then the picture sweeps in as its preview with the loading HUD |
| image loading | blurred 20px preview painted at once; still coming after 150ms on screen (and shown — never on a hidden layer) → HUD on the preview: brackets close in once (240ms), a soft page-color scan band is the one moving part, LOADING tag. Arrives: one motion — the veil wipes away top → bottom with the sweep edge (400ms) and the brackets fade with it; no accent after (several pictures often arrive at once). Fails: preview + brackets stay, tag says it did not load. No colored line across the picture, no pulsing, no spinners, no percentages. Cached images just appear — `src/scripts/lq.ts` (`hud()` for anything else that waits) |
| other waits | PhotoCard viewer: the card's own picture at once, the large one replaces it when decoded (HUD if > 150ms). ScrubFrames: the bar under the counter shows the real download progress, then becomes the scroll position. Looping video that stalls > 150ms: HUD over its last frame. Navigation: LoadLine; hovering / focusing / touching a link prefetches the page and its first two pictures (`src/scripts/prefetch-media.ts`) so the transition lands loaded |
| fonts | self-hosted, preloaded per language (display face + that language's body face), metric-matched fallback for body text — no flash of a different width on first visit. Japanese from Google on /ja/ only |
| sketch → real / render (SketchReveal) | [plate opens left → right as the plane] → the picture opens out from the middle (a screen on the object powers on like a display), the sketch steps back → brackets lock + REAL or RENDER tag (accent last); leaving folds it back, faster. Mouse: hover only (no pinning); touch / keyboard: toggle. No colored line across the sketch. A render is never tagged REAL |
| scroll | reveal once for key blocks only; pinned blocks (ScrollStepper / ScrubFrames / SplitScroll) each need a reason and never sit back to back — a page built around scroll may have more than one |
| sideways rows (HorizontalStrip) | move sideways with every input: swipe on touch, wheel while the mouse rests on it (never a page scrolling under a still cursor; the wheel goes back to the page at either end), drag, ← → buttons |

Avoid: floating decoration, parallax on content, animating every text block, simultaneous hero motions, slow transitions
that delay content. Reduced motion: nothing moves and every state stays visible; a page change is a 150ms fade of the old
page (opacity is not motion, WCAG 2.3.3), everything else is instant. After a page change focus lands on `<main>`
(a keyboard press on WorkNav's ↑ / ↓ stays on that arrow).

## State

Default · hover/focus · selected/active · disabled (where relevant) must all be visible. Signals: underline, bar, fill
inversion, small shift, real progress. Status vocabulary is closed (StatusTag).

## Smooth on every device

Static HTML; JS only where there is behavior (~20 KB gz total). Lenis and cloud drift only with a fine pointer;
touch devices keep native scrolling; sideways rows swipe sideways (never a vertical swipe that moves things sideways). Images are resized per viewport and lazy-loaded; videos load
only near the viewport. Animate transform / opacity / clip-path only.

## Hard bans (no exceptions)

Invented facts, metrics, statuses, labels or testimonials · lorem ipsum on shipped pages · prototype tools in production.
