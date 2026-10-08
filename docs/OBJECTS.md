# Crafting objects — IsoObject + SketchReveal

Some work has no picture: a memory layer, a pipeline, an algorithm, a rule. Instead of a stock image or a generic
diagram, **build the thing as a small isometric object** out of blocks — the way the Memory Base sketch is built.
It reads as "a thing that exists", matches the Endfield / blueprint look of the site, and costs no image weight.

Components: `IsoObject` (draws the object from data) · `SketchReveal` (switches the sketch to the real picture on hover).
Live examples: `/kit/` → IsoObject (Memory Base) and SketchReveal (Z80 Workspace). Source of those examples:
`src/pages/[...locale]/kit/index.astro`.

---

## 1. When (and when not)

| Situation | Use |
|---|---|
| Abstract / behind-the-scenes work, no screenshot says anything | IsoObject |
| A sketch helps, AND a real photo / screen of the same thing exists | IsoObject inside SketchReveal |
| Abstract work with no possible photo, and the owner has a render of it (AI-made / 3D) | IsoObject inside `SketchReveal kind="render" plate="…"` — tagged RENDER |
| Several works side by side (the Lab row in a HorizontalStrip) | LabItem cards with `glyph` (a minimal Pictogram) + a `real` slot: point at a card and the detailed object (or the real picture) opens inside the card — oversized is fine, the card crops it |
| The real screenshot alone explains it | MediaFrame / Inspector — no object needed |
| You would have to invent parts to fill the object | Don't. Use text or a FlowDiagram |

Hard rules:
- **Every block is a real part with its real name.** No decorative cubes. If you cannot name what a block is, delete it.
- Say it is a sketch: `note={{ en: 'System sketch — not the final architecture.' }}` whenever the design is not final.
- **Rectangular pictures without transparency never lie flat over the sketch.** Put them ON a face of the object
  (`screens`) so they read as a screen with depth. Only a cutout (transparent PNG / WebP of the object itself) may be
  shown whole over the sketch (`SketchReveal real`).
- **A render is a render.** For abstract work the owner may reveal an AI-made / 3D render instead of a photo:
  `<SketchReveal kind="render" plate="center" real={{ src }}>` — the tag says RENDER, the AttributionBlock says AI made
  it, and the real results (output, logs, numbers) stay on the work page. Make the render from the sketch's own
  parts and angle (same object, same framing), with a transparent background so it stands on the plate.

### Three levels of the same object

| Level | Component | Detail | Where |
|---|---|---|---|
| glyph | `Pictogram` | a few grey pixel cells (+ one accent group) — the silhouette only | resting face of a LabItem card or a home feature (`SketchReveal glyph=… plate=…`); `from` traces a real cutout's silhouette |
| system | `IsoObject` | real parts, names, links — the abstract work's "real" | opens from the glyph inside a card (`realKind="system"`) or a home feature (`SketchReveal kind="system"`, iso in the `real` slot), or stands alone |
| real / render | picture / `SketchReveal` | the photo, the screen, or a labelled RENDER | the concrete thing, when it exists |

Each level draws the SAME object. Going down a level may only remove detail, never add a part that is not in the level above.

## 2. The coordinate system

```
            z (up)
            │
            │
            ●──────── world origin (0,0,0) lands at `origin` in the SVG (default [300, 84])
          ╱   ╲
        ╱       ╲
   y ↙           ↘ x
 (lower left)   (lower right)
```

Projection (k = `scale`, default 1):

```
X = ox + (x − y) · 0.866 · k
Y = oy + ((x + y) · 0.5 − z) · k
```

The SVG is 600 × 440 by default (`size`). Keep the object inside roughly X 40…560, Y 20…400 and leave room for callouts.
To centre an object whose footprint is W (along x) × D (along y) and height H:
`ox ≈ 300 − (W − D) · 0.433`, `oy ≈ (440 − (W + D) · 0.5 − H) / 2 + H`.

## 3. Building blocks

| Prop | What it is | Notes |
|---|---|---|
| `parts: { box: [x, y, z, w, d, h], mat }` | a block | **List back to front** (painter's order): things further back / lower first. |
| `grids: { z, x, y, cols, rows, size, gap }` | a cell grid lying on a plane | e.g. storage slots on the top of a block |
| `flows: { z, d, read? }` | direction dashes on a plane, as an SVG path in world x/y | `M16 190 H106`; `read` = thinner, one-way. They run only on hover. |
| `screens: { src, face, x, y, z, w, h, reveal? }` | a real rectangular picture mapped onto a face | `face`: `top` (lying), `left` (front-left side), `right` (front-right side). Picture is cropped to fill (slice). |
| `callouts: { at, label, sub?, x, y, minor? }` | a label with a leader line | `at` = world point; `x`/`y` = where the label sits in SVG units. `minor` hides it on phones. |

Materials (`mat`):

| mat | looks | means |
|---|---|---|
| `n` (default) | paper faces | ordinary parts, clients, hosts |
| `c` | the work's color | the subject of the story — **one main block**, plus its own links |
| `a` | the signal color | what is lit / active / selected — at most 3 small blocks |
| `k` | dark | a device body, a screen bezel, hardware |
| `w` | dashed outline | a boundary, a group, something planned / virtual |

Colors come from the `--iso-*` tokens (tokens.css): every material is lit from above in both modes — top face
brightest, left mid, right darkest; edges darker than the faces. Don't hand-color faces with `--surface` / `--sunk`:
in dark mode those invert the light (the dark surface is darker than sunk) and the object reads as a wireframe.

## 4. A vocabulary that already works

| To show… | Build |
|---|---|
| a store / memory / database | a wide `c` slab with a `grids` top; `a` blocks on a few cells for "what is held" |
| layers, versions, arms of an experiment | thin plates stacked on each other (`n`), a `w` box around them for the group |
| a writer / reader talking to the store | an `n` block + a thin `c` bar (conveyor) between them + a `flows` line; a read-only link is a thinner bar with `read: true` |
| a device, a board, a screen | a `k` slab; its UI as thin `n`/`c` panels on top; the real screenshot as a `screens` face with `reveal: true` |
| a status | a `minor` callout ("Status · M1 · M2A CLOSED") |

## 5. Recipe

1. **List the real parts and how they connect** (from the work's facts — `src/content/works/<id>.yaml`, the owner's notes).
2. **Pick a block for each** from the vocabulary above. One main subject in `c`.
3. **Lay it out top-down first** on paper: x/y positions only, parts not overlapping. Then give heights (z, h).
4. **Order back to front** (larger x + y = closer to the viewer = later in the list).
5. **Add links** (thin `c` bars at the height of the parts they join) and `flows` on top of them.
6. **Callouts:** one per named part, labels outside the object, leader lines short and not crossing each other.
7. **Real picture?** Rectangular → `screens` on the face where it lives, `reveal: true`, wrap in `SketchReveal`.
   Cutout photo → `SketchReveal real={{ src }}`.
8. **Check:** `/kit/`-style preview in light and dark, at 390 px (sub-labels hide, labels must not collide),
   and that every label is a real name.

## 6. Worked example — Z80 Workspace (from the kit)

The screenshot is 1600 × 1000: toolbar 0–42 px high, explorer 0–257 px wide, console from y 778. The object is a dark
slab 300 × 190 with the screen area 288 × 178 at (6, 6). Each panel is the screenshot region scaled into that area
(×0.18 across, ×0.178 down), so when the real screen switches on, the callouts still point at the right things:

```astro
<SketchReveal tag={{ en: 'SCREEN' }} realAlt={{ en: 'The real Z80 Workspace screen' }}>
  <IsoObject label={{ en: 'Z80 Workspace sketched as a screen lying on the desk' }} origin={[262, 120]}
    parts={[
      { box: [0, 0, 0, 300, 190, 12], mat: 'k' },        // device body
      { box: [6, 6, 12, 288, 7, 2] },                     // toolbar
      { box: [6, 14, 12, 45, 170, 3] },                   // explorer
      { box: [53, 14, 12, 241, 130, 3], mat: 'c' },       // editor (the subject)
      { box: [53, 145, 12, 241, 39, 3] },                 // console
      { box: [61, 7, 14, 17, 5, 3], mat: 'a' }            // Run Z80sim button (lit)
    ]}
    screens={[{ src: 'z80/workspace.webp', face: 'top', x: 6, y: 6, z: 15.5, w: 288, h: 178, reveal: true }]}
    callouts={[
      { at: [28, 60, 15], label: 'Explorer', sub: 'FILES', x: 24, y: 300 },
      { at: [69, 9, 17], label: 'Run Z80sim', sub: 'ET-BOARD', x: 330, y: 60 },
      { at: [170, 165, 15], label: 'Console', sub: 'C16.EXE · DOSBOX → WASM', x: 330, y: 400 }
    ]} />
</SketchReveal>
```

## 7. Mistakes to avoid

- Global class names in SVG. IsoObject prefixes its own (`iso-…`); if you add markup, prefix it too — a global `.co`
  rule elsewhere once shifted every callout.
- A flat rectangle photo shown over the sketch (`SketchReveal real` with a screenshot) — use `screens`.
- Parts listed front to back — the back part paints over the front one.
- Too many `a` blocks — the signal stops meaning "this one".
- Callouts inside the object or crossing each other.
