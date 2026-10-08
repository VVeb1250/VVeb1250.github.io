# Story recipes — how to compose a work page without making it stiff

The v2 prototype told every project the same way (hero → question → figure → trace → outcome → lessons). Every page
felt like a form. The fix is not a better template; it is **choosing the shape from the story**.

A work page can answer *situation → idea / problem → contribution → AI / team → constraints → outcome* — but **not as the
same headings**, and only where there is real material. Pick the recipe whose *strongest evidence* matches the work, then
drop anything the work has no real material for.

**Voice (the owner, 2026-10-01 — `_note/portfolio-story.md` §0.3):** plain and short, the way he talks. No lesson, verdict
(keep / change / kill) or "what this proves" line unless the owner wrote it; the recipe names below describe the material,
they are not headings to write. Who did what goes in one AttributionBlock on the page, said plainly, never as a disclaimer.

A story lives in `src/content/stories/<lang>/<id>.mdx`. `WorkPage` already adds the nav at the top and Related + Next at
the bottom. Everything in between is yours. Components need no import (see `src/lib/story-components.ts`).

---

## 1. Pick by the strongest evidence

| The strongest thing you can show is… | Recipe | Example |
|---|---|---|
| The work's own art or look | **art-led** | Journey of Vaja |
| The interface / tool itself | **interface-led** (use `tool-in-use` or `scope-lesson`) | Z80 Workspace, YASM Helper |
| A sequence of steps and decisions, no strong visuals | **process-led** (`build-log`, OSS) | OSS Contributions |
| Beliefs that turned out wrong | **assumption-broke** | Memory Base |
| A hard rule the design had to obey | **constraint-product** | MSU Hackathon |
| It worked, but not how you expected (scope, use) | **scope-lesson** | Z80 Workspace |
| None of these fit | **free** — compose from the rules below | — |

Write the recipe in the story frontmatter (`recipe: art-led`). It is a label for humans and AI, not a template.

## 2. Recipes

Each recipe lists blocks that suit that kind of story, in the order one page happened to use them. Take any subset, in any
order, and add your own composition — a starting point, not a sequence. Blocks in *italics* need real material to exist.

### art-led — the art dominates
```
ProjectHeader layout="stack"                 short text, facts
MediaFrame width="full"                      the best scene, edge to edge
Trace  ART → SCENES → ANIMATION → CONTROL → DEMO    a build log; each chapter shows its artifact
                                              (image · sprite strip · clip · evidence)
## <section>  +  ScrubFrames                 ONE signature clip, scrubbed frame by frame
  (or ScrollStepper for 2–6 scenes of the same size, or FrameStepper when there is no room to pin)
*Inspector*                                  characters / parts, each with its own media (swap mode)
AttributionBlock                             team / concept / AI
OutcomeBlock
<Draft> Retrospective </Draft>               until the owner writes it
```
Keep text short. No plates or tints on top of art — the art is the color. (See `stories/en/vaja.mdx`.)

### interface-led · tool-in-use — the tool dominates
```
ProjectHeader layout="text" (or "split" with the screen)
Inspector image=… frame="screen"               the real screen; each part zooms in with its explanation
  (or MediaFrame frame="screen" marks when a numbered legend is enough)
ProjectContext lead="…friction…"               why it had to exist
SplitScroll                                    3–5 real screens, one step each      (tool-in-use)
Timeline                                       releases / versions
TrailRow / EvidenceLink                        where to get it, proof it is used
AttributionBlock                               especially what AI implemented vs. what you integrated
OutcomeBlock
```
(See `stories/en/z80.mdx`.)

### scope-lesson — it worked, but the scope was wrong
```
ProjectHeader
Inspector / MediaFrame (the thing)
ProjectContext
Trace  ASSUMPTION (FAILED, because=…) → BUILD → FEATURES → OBSERVATION     the failed assumption stays visible
  slot s2: FlowDiagram (the real toolchain)   slot s3: <div class="readouts"> Readout × 2–4 </div>
  last step: media = the usage evidence, caption carries the honesty note ("may include my own testing")
AttributionBlock
OutcomeBlock (+ verdict only if the owner stated it)
```
Use only when the facts say the scope was wrong. (Z80 Workspace is not one: it is complete and was built for convenience.)

### Trace chapters — how to make a trace worth scrolling
A Trace step is a chapter, not a bullet. Give most steps something to *see*: `media` (image, `frame: 'screen'`,
`video` + `poster`, or `strip` for a sprite that plays while the step is current), or any component through a named
slot (`<FlowDiagram slot="s2" …/>`, `<div slot="s3" class="readouts">…</div>` — slot numbers are 1-based step
numbers). Use `title` for the chapter heading, `date` when known, `because` for what changed the belief, `evidence`
for proof links. 3–7 steps. A step with only one line of text is fine *between* steps with artifacts, not as the norm.

### process-led · build-log — the path is the evidence
```
ProjectHeader layout="text"
RefBoard items=[…]                             the references themselves, very large, each jumping to its part (OSS)
ProcessLine steps=[custom] reached=… notes=…  the real sequence (e.g. usage → problem → investigation → constraints → merged)
per step: short prose + EvidenceLink (PR, issue, commit, review comment)
ConstraintBlock                                the maintainer / platform constraint that shaped the change
AttributionBlock  who: upstream                credit the maintainers
OutcomeBlock  evidence=[…]
```
No hero image needed. Never a trophy wall (stars, graphs, logos).

### assumption-broke — research / Lab
```
ProjectHeader  (status ACTIVE if still open)
Quote size="lg"  the question, if the owner wrote it
Trace  ASSUMPTION … (FAILED) → NEW MODEL (ACTIVE)
FlowDiagram  system sketch — note="System sketch — not the final architecture."  (see /work/memory/)
ClaimLedger  exists / useful / unproven / may become unnecessary     required for Lab work
OutcomeBlock  current = what is being tested now
```

### constraint-product — a rule shaped everything
```
ProjectHeader
ConstraintBlock  the rule, stated big
Figure  the flow that enforces the rule
ContributionBlock  your part inside the team
AttributionBlock
OutcomeBlock  result + evidence
```

## 3. Pacing rules (what makes a page feel designed, not filled in)

- **One visual hit per screen.** Never two full-width media or two Stages back to back. Alternate dense / sparse.
- **Lead with the evidence, not with a heading.** Start sections with the artifact or one sentence of intent.
- **Vary widths on purpose:** `full` for art that should dominate, `wide` for screens, `text` for small captures.
- **Headings are optional.** Markdown `## Heading` gives a small mono section label; use it only to name a real change of topic.
  A large display title is fine where the title itself is the content — not on every section.
- **Short paragraphs.** 1–3 sentences between blocks. If you need more, it probably belongs in ProjectContext.
- **End cleanly:** Outcome → (Retrospective) → the layout adds Related + Next. No "thanks for reading".
- **Each story takes its own shape.** If two stories end up with the same block order, check that the stories really have
  the same shape before keeping it.
- **Pinned blocks need a reason.** ScrollStepper, ScrubFrames and SplitScroll hold the screen while you scroll; two back to
  back feel like being held back, so put a normal block between them. A page built around scroll may use more than one.
  A Trace can sit beside one of them.
- **Numbers are Readouts.** `value / total`, unit, and `source` — so a reader can check them. No rounded or decorative stats.

## 4. Language

- Write the English story first. TH / JA stories are separate files with the same `work:`; missing ones fall back to English.
- Translate meaning, not words. Keep technical terms in English in TH.
- Localized strings in props: `{{ en: '…', th: '…', ja: '…' }}`.

## 5. Checklist before you call a story done

- [ ] Every fact is in the work's YAML `sources:` or the owner said it.
- [ ] Anything you proposed is inside `<Draft>`.
- [ ] AttributionBlock present if anyone besides the owner touched it.
- [ ] Media keys exist (`npm run build` passes).
- [ ] Its shape comes from its own story, not from another page or from the recipe list.

## A work's own theme

Every work or event with pictures of its own gets a **project theme**: its own color family (`theme:` in its YAML →
`scripts/tokens.config.mjs` THEMES, same recipe as the kinds of work, only the hue is measured from its material — note
the source beside the hues). A part of the page from another year or edition can switch theme (`data-cat="icpc25"` on
that part). Lists (Timeline, Work index) and CategoryTick keep the kind's color. A new theme also needs `npm run textures`
(the fog) and its name in `THEMES` in src/lib/vocab.ts.

No ornaments on a work or event page (owner, 2026-10-08, after two attempts looked stuck on): its character comes from
its own photos, layout and facts. Decoration is open only on the main pages (Home, Work, About, Timeline).
