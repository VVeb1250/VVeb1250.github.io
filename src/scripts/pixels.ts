/**
 * Pictogram cells as the transition itself: when the real thing opens, the glyph's pixels break away cell by cell
 * (left → right, following the plate / column sweep, with a little jitter) instead of a plain fade — the glyph and the
 * object read as the same thing. When it closes, the cells settle back in from the other side.
 * Used by SketchReveal (glyph mode) and LabItem cards. Reduced motion: nothing moves (callers hide the glyph with CSS).
 */
import { cssMs, reducedMotion } from './lifecycle';

const EXIT = 'cubic-bezier(0.4, 0, 1, 1)', ENTER = 'cubic-bezier(0.22, 1, 0.36, 1)';

// every animation this file starts, per cell: getAnimations() on an SVG rect can miss a finished animation that still
// fills forwards (seen in Chrome after a quick show → hide → show), and a missed dissolve kept the cell hidden for good
const live = new WeakMap<Element, Animation[]>();
function track(c: Element, a: Animation) { const l = live.get(c); if (l) l.push(a); else live.set(c, [a]); }

function cells(svg: SVGSVGElement) {
  const W = svg.viewBox.baseVal?.width || 1, H = svg.viewBox.baseVal?.height || 1;
  return [...svg.querySelectorAll<SVGRectElement>('rect')].map((c) => {
    c.style.transformBox = 'fill-box';
    c.style.transformOrigin = 'center';
    live.get(c)?.forEach((a) => a.cancel());
    live.set(c, []);
    c.getAnimations().forEach((a) => a.cancel());
    return { c, kx: +(c.getAttribute('x') || 0) / W, ky: +(c.getAttribute('y') || 0) / H };
  });
}

/** Break the glyph apart (it stays gone until `assemble`). `t` ≈ the sweep's duration. */
export function dissolve(svg: SVGSVGElement | null | undefined, t = cssMs('--t-open')) {
  if (!svg || reducedMotion() || !t) return;
  for (const { c, kx } of cells(svg)) {
    const j = Math.random();
    const dx = (0.4 + j) * 6, dy = (Math.random() - 0.5) * 9, r = (Math.random() - 0.5) * 50;
    track(c, c.animate(
      [{ opacity: 1, transform: 'none' }, { opacity: 0.9, offset: 0.35 }, { opacity: 0, transform: `translate(${dx}px, ${dy}px) rotate(${r}deg) scale(0.25)` }],
      { duration: t * 0.9, delay: (kx * 0.7 + j * 0.25) * t, easing: EXIT, fill: 'forwards' }
    ));
  }
}

/** Put the glyph back, cells landing right → left (the reverse of the sweep). */
export function assemble(svg: SVGSVGElement | null | undefined, t = cssMs('--t-exit') * 4) {
  if (!svg) return;
  const list = cells(svg);
  if (reducedMotion() || !t) return;
  for (const { c, kx } of list) {
    track(c, c.animate(
      [{ opacity: 0, transform: 'scale(0.4)' }, { opacity: 1, transform: 'none' }],
      { duration: t, delay: ((1 - kx) * 0.6 + Math.random() * 0.3) * t, easing: ENTER, fill: 'backwards' }
    ));
  }
}
