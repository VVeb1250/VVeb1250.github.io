/**
 * Page lifecycle for scripts under Astro's <ClientRouter>.
 *
 * `onPage(init)` runs `init` once for every page the visitor sees (first load and every client-side navigation).
 * If `init` returns a function, it runs right before the page is swapped out — remove listeners/observers there.
 *
 * Runs on first parse (not on window `load`), so content never waits for images before it is revealed.
 */
type Cleanup = void | (() => void);
type Init = () => Cleanup;

const inits = new Set<Init>();
const cleanups = new Map<Init, () => void>();
const lastRun = new Map<Init, number>();
let generation = 0;

function runOne(init: Init) {
  if (lastRun.get(init) === generation) return;
  lastRun.set(init, generation);
  try {
    const c = init();
    if (typeof c === 'function') cleanups.set(init, c);
  } catch (err) {
    console.error('[onPage]', err);
  }
}

if (!(window as any).__lifecycle) {
  (window as any).__lifecycle = true;
  document.addEventListener('astro:before-swap', () => {
    for (const c of cleanups.values()) { try { c(); } catch {} }
    cleanups.clear();
  });
  document.addEventListener('astro:after-swap', () => { generation++; });
  document.addEventListener('astro:page-load', () => { for (const i of inits) runOne(i); });
}

export function onPage(init: Init): void {
  inits.add(init);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => runOne(init), { once: true });
  else runOne(init);
}

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Mouse / trackpad with hover: the only devices that get smooth scrolling, parallax and pinned sections. */
export const finePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

/** A motion token (`--t-*`) in milliseconds. The CSS minifier may write "300ms" as ".3s", so both units are read. */
export function cssMs(name: string): number {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const n = parseFloat(v);
  if (!Number.isFinite(n)) return 0;
  return /ms$/.test(v) ? n : /s$/.test(v) ? n * 1000 : n;
}
