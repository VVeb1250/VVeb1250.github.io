/**
 * Block → image sweep: the shared grammar for swapping one image for another inside a frame (owner's direction).
 *
 *   1. a block in the context signal (--ctxs) sweeps across the OLD image — exactly its box, not the whole frame   (--t-thicken)
 *   2. if the new image has a different size, the block reshapes to the new image's box                          (--t-exit × 2)
 *   3. the new image sweeps in from the same side while the block leaves along the same edge                     (--t-cursor)
 *   4. the caller runs its accent (counter roll, brackets) after the promise resolves
 *
 * Waiting: while the block holds for the new picture (up to 600ms for `ready`, then up to 600ms more to decode), a
 * LOADING tag appears on the block after 150ms. If the picture is still not there when it sweeps in, it comes in as its
 * blurred preview and gets the loading HUD (lqSync: hidden layers lose theirs) — so a slow network never shows a blank or a stuck block.
 *
 * The edges are the shared sweep material (scripts/sweep.ts): slanted, feathered, frayed into streaks along the travel —
 * not a hard clip line. The block's box itself (the image's edges) stays a clip.
 *
 * `dir` 1 sweeps left → right (forward / next / scrolling down), -1 right → left (back / previous / up).
 * The stage must be a positioned box that clips (overflow: hidden/clip). Reduced motion: an instant swap.
 * If a new sweep starts on the same stage before the last one ends, the old one is cut short cleanly.
 */
import { cssMs, reducedMotion } from './lifecycle';
import { lqSync, LOADING } from './lq';
import { sweep, hold, clearSweep, sweepable } from './sweep';

const OPEN = 'cubic-bezier(0.87, 0, 0.13, 1)';
const ENTER = 'cubic-bezier(0.22, 1, 0.36, 1)';
const run = new WeakMap<HTMLElement, { id: number; el: HTMLElement | null }>();
type R = { x: number; y: number; w: number; h: number };

function block(stage: HTMLElement): HTMLElement {
  let b = stage.querySelector<HTMLElement>(':scope > .wipe-block');
  if (!b) {
    b = document.createElement('div');
    b.className = 'wipe-block';
    b.setAttribute('aria-hidden', 'true');
    Object.assign(b.style, { position: 'absolute', inset: '0', pointerEvents: 'none', clipPath: 'inset(0 100% 0 0)', zIndex: '3' }); // material: base.css .wipe-block
    stage.append(b);
  }
  return b;
}

/** The box an element actually paints inside the stage (for <img> with object-fit: contain, the picture itself). */
export function paintedRect(el: HTMLElement | null, stage: HTMLElement): R {
  const s = stage.getBoundingClientRect();
  if (!el) return { x: 0, y: 0, w: s.width, h: s.height };
  const target = el instanceof HTMLImageElement ? el : el.querySelector('img') ?? el;
  const r = target.getBoundingClientRect();
  let x = r.left - s.left, y = r.top - s.top, w = r.width, h = r.height;
  if (target instanceof HTMLImageElement && getComputedStyle(target).objectFit === 'contain' && target.naturalWidth) {
    const k = Math.min(w / target.naturalWidth, h / target.naturalHeight);
    const cw = target.naturalWidth * k, ch = target.naturalHeight * k;
    x += (w - cw) / 2; y += (h - ch) / 2; w = cw; h = ch;
  }
  // clamp to the stage (the stage clips anyway)
  const x0 = Math.max(0, x), y0 = Math.max(0, y);
  return { x: x0, y: y0, w: Math.min(s.width, x + w) - x0, h: Math.min(s.height, y + h) - y0 };
}

export interface SwapOptions {
  /** The element showing now (its box is what the block covers). Omit to cover the whole stage. */
  from?: HTMLElement | null;
  /** Wait for this before the sweep (e.g. the new image decoding), at most 600ms. */
  ready?: Promise<unknown>;
}

/**
 * @param show  called while the block covers the old image: make the new one visible (swap src, toggle classes…) and
 *              return the element that sweeps in (drawn above the block).
 */
export async function blockSwap(stage: HTMLElement, dir: 1 | -1, show: () => HTMLElement, o: SwapOptions = {}): Promise<boolean> {
  const prev = run.get(stage);
  // cut a running swap short: its image becomes a plain layer again (the caller's classes decide if it shows)
  if (prev?.el) { prev.el.getAnimations().forEach((a) => a.cancel()); prev.el.style.clipPath = ''; prev.el.style.zIndex = ''; clearSweep(prev.el); }
  const id = (prev?.id ?? 0) + 1;
  run.set(stage, { id, el: null });
  const live = () => run.get(stage)?.id === id;
  const b = block(stage);
  b.getAnimations().forEach((a) => a.cancel());
  clearSweep(b);
  const tIn = reducedMotion() ? 0 : cssMs('--t-thicken');
  const tMorph = reducedMotion() ? 0 : cssMs('--t-exit') * 2;
  const tOut = reducedMotion() ? 0 : cssMs('--t-cursor');
  if (!tIn && !tOut) { const el = show(); el.style.clipPath = ''; clearSweep(el); b.style.clipPath = 'inset(0 100% 0 0)'; lqSync(stage); return true; }
  const soft = sweepable(), way = dir === 1 ? 'r' : 'l';

  const W = stage.clientWidth, H = stage.clientHeight;
  const ins = (r: R) => `inset(${r.y}px ${W - r.x - r.w}px ${H - r.y - r.h}px ${r.x}px)`;
  // a zero-width slice of rect r at its left or right edge
  const edge = (r: R, side: 'l' | 'r') => ins({ x: side === 'l' ? r.x : r.x + r.w, y: r.y, w: 0, h: r.h });
  const lead: 'l' | 'r' = dir === 1 ? 'l' : 'r', trail: 'l' | 'r' = dir === 1 ? 'r' : 'l';

  // 1 · the block covers the old image's own box
  const a = paintedRect(o.from ?? null, stage);
  // (end values go in the inline style and the animations do not fill: in Chrome, a finished filling animation that
  //  gets replaced can keep overriding the inline style even after cancel(), which left the block stuck on screen)
  b.style.clipPath = ins(a);
  const cover = soft ? sweep(b, way, 'in', { duration: tIn, easing: OPEN, box: a }) : b.animate([{ clipPath: edge(a, lead) }, { clipPath: ins(a) }], { duration: tIn, easing: OPEN });
  await cover?.finished.catch(() => {});
  if (!live()) return false;

  // 2 · swap under the block; reshape the block to the new image's box if it differs
  const el = show();
  run.set(stage, { id, el });
  el.style.zIndex = '4';
  if (soft) hold(el, way, 'in'); else el.style.clipPath = dir === 1 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)';
  const cap = (p?: Promise<unknown>) => (p ? Promise.race([p.catch(() => {}), new Promise((r) => setTimeout(r, 600))]) : null);
  const im = el instanceof HTMLImageElement ? el : el.querySelector('img');
  // still waiting after 150ms: say so on the block (explicit state), in the old box's lower-left corner
  let tag: HTMLElement | null = null;
  const tagT = window.setTimeout(() => {
    if (!live()) return;
    tag = document.createElement('b');
    tag.className = 'lq-tag';
    tag.setAttribute('aria-hidden', 'true');
    tag.textContent = LOADING();
    Object.assign(tag.style, { position: 'absolute', left: `${a.x + 10}px`, bottom: `${H - a.y - a.h + 10}px`, zIndex: '3', pointerEvents: 'none' });
    b.after(tag);
    tag.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: tOut, easing: ENTER });
  }, 150);
  await cap(o.ready);
  // measure the new box only once the element shows the new picture (a changed src keeps the old one until then)
  if (im && !im.complete) await cap(im.decode());
  clearTimeout(tagT);
  (tag as HTMLElement | null)?.remove();
  if (!live()) return false;
  const z = paintedRect(el, stage);
  if (Math.abs(z.x - a.x) + Math.abs(z.y - a.y) + Math.abs(z.w - a.w) + Math.abs(z.h - a.h) > 2) {
    b.style.clipPath = ins(z);
    await b.animate([{ clipPath: ins(a) }, { clipPath: ins(z) }], { duration: tMorph, easing: ENTER }).finished.catch(() => {});
    if (!live()) return false;
  }

  // 3 · the new image sweeps in as the block leaves along the same edge
  //   (the leaving block trails the picture's edge a little, so the feathered edge shows picture over block, not the
  //    stage behind them)
  let enter: Animation | null;
  if (soft) {
    b.style.clipPath = ins(z);
    sweep(b, way, 'out', { duration: tOut, easing: OPEN, box: z, shift: -6 });
    enter = sweep(el, way, 'in', { duration: tOut, easing: OPEN, clear: false });
  } else {
    b.style.clipPath = edge(z, trail);
    b.animate([{ clipPath: ins(z) }, { clipPath: edge(z, trail) }], { duration: tOut, easing: OPEN });
    enter = el.animate([{ clipPath: el.style.clipPath }, { clipPath: 'inset(0 0 0 0)' }], { duration: tOut, easing: OPEN });
  }
  await enter?.finished.catch(() => {});
  if (!live()) return false;

  el.style.clipPath = '';
  el.style.zIndex = '';
  clearSweep(el);
  b.getAnimations().forEach((x) => x.cancel());
  clearSweep(b);
  b.style.clipPath = 'inset(0 100% 0 0)';
  lqSync(stage);
  return true;
}

/** Preload + decode an image URL (so the sweep never uncovers a blank). */
export function decoded(src: string): Promise<unknown> {
  const i = new Image();
  i.src = src;
  return i.decode();
}
