/**
 * The sweep material — one edge for every image sweep (blockSwap, SketchReveal's plate and picture, the loading veil).
 *
 * A clip-path edge is a hard, perfectly straight line; next to the LabItem column (a textured sweep) every other sweep
 * read as stiff. So a sweep is a mask instead: a slanted, feathered edge (the same 10° lean as the plates and the
 * LabItem column) that is frayed into short streaks along the direction of travel — motion blur, like Endfield's swept
 * bands. The streaks are the atmosphere's own baked cloud noise (public/textures/cloud-a.webp, already loaded by
 * <Atmosphere>) stretched along the sweep: no grain, no live feTurbulence (spec 20.1: bake noise once, let `mask` scale it).
 * Owner-approved texture exception (docs/DESIGN-RULES.md, "image sweep").
 *
 *   sweep(el, 'r', 'in',  { duration })   el appears, its edge travelling left → right
 *   sweep(el, 'r', 'out', { duration })   el goes, its trailing edge travelling left → right (the rest stays until it passes)
 *   sweep(el, 'mid', 'in', { duration })  el opens from the middle to the top and bottom edges (feathered, no streaks)
 *   hold(el, …)                           the start state without moving (a layer waiting to sweep in stays hidden)
 *   clearSweep(el)                        back to a plain element
 *
 * `box` puts the edge on a part of the element (blockSwap's block is the stage, the edge runs over one image's box).
 * The end state is written inline and the animation does not fill (same reason as wipe.ts), so a cancel() leaves the
 * element at its end state: visible after 'in', hidden after 'out'. Reduced motion: callers skip the sweep.
 */
export type Way = 'r' | 'l' | 'd' | 'u' | 'mid';
export type Mode = 'in' | 'out';
export interface Box { x: number; y: number; w: number; h: number }
export interface SweepOptions {
  duration: number;
  easing?: string;
  delay?: number;
  /** The edge runs over this box (px, in the element's own coordinates) instead of the whole element. */
  box?: Box;
  /** Shift the edge back (−) or ahead (+), in % of the box — blockSwap's leaving block trails the incoming picture. */
  shift?: number;
  /** Play it backwards (a 'mid' opening folding back to the middle). */
  reverse?: boolean;
  /** Remove the mask when an 'in' sweep ends (default true). */
  clear?: boolean;
}

const TEX = `url(${import.meta.env.BASE_URL}textures/cloud-a.webp)`;
const ANGLE: Record<Exclude<Way, 'mid'>, number> = { r: 100, l: 280, d: 190, u: 10 };
// the streak tile: the cloud noise stretched ~3× along the sweep and squashed across it → soft streaks ~8–10px thick
const STREAK = { h: '900px 26px', v: '26px 900px' };
// where the edge starts and ends (%): 'in' starts with nothing showing and ends fully shown, 'out' the reverse
const RANGE: Record<Mode, [number, number]> = { in: [-10, 124], out: [-4, 130] };
const PROPS = ['mask-image', 'mask-size', 'mask-position', 'mask-repeat', 'mask-composite', '--sw'];

let ok: boolean | null = null;
/** --sw must be a registered <percentage> so it interpolates (Chrome 85, Safari 16.4, Firefox 128). */
export function sweepable(): boolean {
  if (ok !== null) return ok;
  try { CSS.registerProperty({ name: '--sw', syntax: '<percentage>', inherits: false, initialValue: '0%' }); ok = true; }
  catch (e) { ok = (e as Error)?.name === 'InvalidModificationError'; } // already registered (another bundle) is fine
  return ok;
}

// one ramp ('base') and one streak band for an edge running along `a` degrees; e = the edge position
function ramp(a: number, mode: Mode, s: number) {
  const e = (d: number) => `calc(var(--sw) + ${d + s}%)`;
  return mode === 'in'
    ? { base: `linear-gradient(${a}deg, #000 ${e(-20)}, transparent ${e(-4)})`, band: `linear-gradient(${a}deg, transparent ${e(-24)}, #000 ${e(-10)}, transparent ${e(10)})` }
    : { base: `linear-gradient(${a}deg, transparent ${e(-16)}, #000 ${e(0)})`, band: `linear-gradient(${a}deg, transparent ${e(-30)}, #000 ${e(-10)}, transparent ${e(4)})` };
}

function apply(el: HTMLElement | SVGElement, way: Way, mode: Mode, o: { box?: Box; shift?: number }) {
  const s = o.shift ?? 0;
  const b = o.box;
  // where a ramp layer sits: 0 the whole box, 1 its top half, 2 its bottom half
  const lay = (half: 0 | 1 | 2) => b
    ? { size: `${b.w}px ${half ? b.h / 2 : b.h}px`, pos: `${b.x}px ${b.y + (half === 2 ? b.h / 2 : 0)}px` }
    : { size: half ? '100% 50%' : '100% 100%', pos: half === 2 ? '0 100%' : '0 0' };
  // 'mid': two halves, each opening outward from the middle
  const parts = way === 'mid'
    ? [{ ...ramp(0, mode, s), ...lay(1) }, { ...ramp(180, mode, s), ...lay(2) }]
    : [{ ...ramp(ANGLE[way], mode, s), ...lay(0) }];
  const streak = way === 'r' || way === 'l' ? STREAK.h : STREAK.v;
  // layers, top → bottom: the ramps (added), the noise (intersected with the bands below it), the bands (added together).
  // 'mid' keeps only the feathered ramps: across a short opening the streaks stood side by side and read as a barcode
  // (the plane in front of it already carries the streaked edge)
  const streaked = way !== 'mid';
  const images = [...parts.map((p) => p.base), ...(streaked ? [TEX, ...parts.map((p) => p.band)] : [])];
  const sizes = [...parts.map((p) => p.size), ...(streaked ? [streak, ...parts.map((p) => p.size)] : [])];
  const poss = [...parts.map((p) => p.pos), ...(streaked ? ['0 0', ...parts.map((p) => p.pos)] : [])];
  const reps = [...parts.map(() => 'no-repeat'), ...(streaked ? ['repeat', ...parts.map(() => 'no-repeat')] : [])];
  const comp = [...parts.map(() => 'add'), ...(streaked ? ['intersect', ...parts.map(() => 'add')] : [])];
  const st = el.style;
  st.setProperty('mask-image', images.join(', '));
  st.setProperty('mask-size', sizes.join(', '));
  st.setProperty('mask-position', poss.join(', '));
  st.setProperty('mask-repeat', reps.join(', '));
  st.setProperty('mask-composite', comp.join(', '));
}

/** Put the element in the sweep's start state (an 'in' layer waiting is hidden, an 'out' layer is whole). */
export function hold(el: HTMLElement | SVGElement, way: Way, mode: Mode, o: { box?: Box; shift?: number } = {}) {
  if (!sweepable()) return;
  apply(el, way, mode, o);
  el.style.setProperty('--sw', `${RANGE[mode][0]}%`);
}

export function clearSweep(el: HTMLElement | SVGElement | null | undefined) {
  if (!el) return;
  PROPS.forEach((p) => el.style.removeProperty(p));
}

/** Run a sweep. Returns null when --sw cannot animate (the caller shows the end state at once). */
export function sweep(el: HTMLElement | SVGElement | null | undefined, way: Way, mode: Mode, o: SweepOptions): Animation | null {
  if (!el || !sweepable()) return null;
  apply(el, way, mode, o);
  let [from, to] = RANGE[mode].map((v) => `${v}%`);
  if (o.reverse) [from, to] = [to, from];
  el.style.setProperty('--sw', to);
  const a = el.animate([{ '--sw': from } as Keyframe, { '--sw': to } as Keyframe], { duration: o.duration, delay: o.delay ?? 0, easing: o.easing ?? 'linear', fill: 'backwards' });
  if (mode === 'in' && !o.reverse && o.clear !== false) a.finished.then(() => clearSweep(el), () => {});
  return a;
}
