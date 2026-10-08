// Color system source of truth. Edit here, then run `npm run tokens` → writes src/styles/tokens.css.
// Values are OKLCH: [L, C, hueOffset] relative to the identity hue H, or [L, C, hue, 1] for an absolute hue.
//
// Tier 1  neutrals, faintly tinted with H
// Tier 2  identity blue (H) in roles: acc = signal for site chrome, band/wash = large low-contrast areas, spark = object lights, scroll-cursor = page scrollbar handle
// Tier 3  one color family per kind of work (absolute hues; they come from the work, not from the owner)

export const H = 248; // identity hue — locked to Azure by the owner

export const BASE = {
  light: {
    bg: [0.94, 0.006, 0], surface: [0.975, 0.004, 0], sunk: [0.905, 0.01, 0],
    ink: [0.22, 0.025, 0], ink2: [0.46, 0.03, 0], ink3: [0.6, 0.025, 0], rule: [0.86, 0.012, 0],
    acc: [0.47, 0.21, 0], 'acc-ink': [0.985, 0.005, 0],
    band: [0.72, 0.11, 0], 'band-m': [0.8, 0.08, -8], wash: [0.89, 0.05, 10], spark: [0.8, 0.14, -55], 'scroll-cursor': [0.557055, 0.095319, -41.923],
    atmo1: [0.91, 0.012, 8], atmo2: [0.945, 0.007, 0], atmo3: [0.972, 0.004, -10], mist: [0.99, 0.004, 0],
    shade: [0.25, 0.03, 0], chip: [0.24, 0.015, 0]
  },
  dark: {
    bg: [0.19, 0.014, 0], surface: [0.225, 0.016, 0], sunk: [0.26, 0.018, 0],
    ink: [0.94, 0.008, 0], ink2: [0.74, 0.018, 0], ink3: [0.56, 0.018, 0], rule: [0.32, 0.018, 0],
    acc: [0.72, 0.15, 0], 'acc-ink': [0.16, 0.02, 0],
    band: [0.44, 0.11, 0], 'band-m': [0.36, 0.08, -8], wash: [0.27, 0.05, 10], spark: [0.84, 0.13, -55], 'scroll-cursor': [0.84, 0.13, -55],
    atmo1: [0.16, 0.014, 8], atmo2: [0.19, 0.014, 0], atmo3: [0.23, 0.02, -10], mist: [0.42, 0.03, 0],
    shade: [0.1, 0.02, 0], chip: [0.17, 0.012, 0]
  }
};

// Tier 3 recipe shared by every kind: deep → mid → pale make the plate gradient; s = the kind's signal (state, dots, hover).
export const RECIPE = {
  light: { d: [0.73, 0.1], m: [0.8, 0.08], p: [0.89, 0.04], s: [0.5, 0.15] },
  dark: { d: [0.44, 0.1], m: [0.36, 0.08], p: [0.27, 0.04], s: [0.76, 0.12] }
};

// [deep, mid, pale] hues per kind of work + the mood it should carry (used by docs/DESIGN-RULES.md).
export const CATS = {
  game: { hues: [339, 318, 350], mood: 'rose: play, character, hand-drawn warmth' },
  ai: { hues: [290, 270, 298], mood: 'muted violet: thinking, memory, quiet depth' },
  dev: { hues: [112, 130, 104], mood: 'olive: workshop tools, precise and plain' },
  tool: { hues: [72, 50, 82], mood: 'amber: everyday tools, craft, warm' },
  sys: { hues: [152, 178, 140], mood: 'sage: flow, routes, calm' },
  ui: { hues: [28, 6, 40], mood: 'coral: looking, feeling, alive' },
  hw: { hues: [220, 256, 238], mood: 'teal: signals, circuits, exact' }
};

// Project themes (owner, 2026-10-08): every work or event with pictures of its own gets its own family — the same
// recipe as a kind of work (deep → mid → pale + signal), only the hue comes from the work's own material (a poster, its
// screens, its art). Its page, sections, Work panel and Home block use it through data-cat="<theme>"; lists and the
// CategoryTick keep the kind's color. Add the name to THEMES in src/lib/vocab.ts too, then `npm run textures`.
export const THEMES = {
  icpc24: { hues: [22, 12, 30], mood: 'crimson: the 2024 poster’s panel', source: 'ICPC Thailand National Competition 2024 poster' },
  icpc25: { hues: [46, 36, 60], mood: 'flame orange: the 2025 poster', source: 'ICPC Thailand National Contest 2025 poster and badge' },
  cesca20: { hues: [305, 292, 318], mood: 'purple: the #20 camp', source: 'CESCa #20 poster and slides' },
  cesca21: { hues: [148, 160, 136], mood: 'forest green: the #21 camp', source: 'CESCa #21 poster and slides' },
  // works (2026-10-08, owner: every work in its own color). Hue measured from the work's own pictures (OKLCH, the
  // strongest colored hue); WhipUI, Memory Base and OSS have no picture of their own yet → they keep their kind's color.
  vaja: { hues: [222, 232, 214], mood: 'crystal light: the Celestia cave', source: 'scene-celestia (the header and Home picture); not 257, the staff crystal — that is the identity blue' },
  z80: { hues: [192, 200, 186], mood: 'simulator cyan: the Z80sim display', source: 'Z80 Workspace screens; z80-exam-prep uses it too (same course, its own teal is close)' },
  yasm: { hues: [137, 128, 146], mood: 'terminal green: the extension icon', source: 'assembly-yasm-helper icon.png' },
  msu: { hues: [92, 84, 100], mood: 'BEAT yellow: the prototype', source: 'BEAT prototype screens (dashboard, review)' },
  aise: { hues: [105, 98, 112], mood: 'AiSE yellow: the camp wordmark', source: 'AiSE CAMP #2 sign in the group photo (its blue is the identity blue)' },
  drawing: { hues: [8, 358, 14], mood: 'pink: the drawings', source: 'the four drawings (pink.webp the strongest)' }
};

// Pairs that must pass WCAG contrast. [fg, bg, min]. The generator fails if any pair drops below.
export const CHECKS = [
  ['ink', 'bg', 7], ['ink2', 'bg', 4.5], ['ink', 'surface', 7], ['ink2', 'surface', 4.5],
  ['acc', 'bg', 4.5], ['acc-ink', 'acc', 4.5], ['scroll-cursor', 'bg', 3], ['scroll-cursor', 'surface', 3],
  ...[...Object.keys(CATS), ...Object.keys(THEMES)].flatMap((c) => [[`${c}-s`, 'bg', 4.5], [`${c}-s`, 'surface', 4.5], ['acc-ink', `${c}-s`, 4.5], ['ink', c, 4.5]])
];
