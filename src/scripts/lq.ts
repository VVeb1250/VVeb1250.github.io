/**
 * Image loading, the visible half (the blurred preview itself comes from lqStyle() in src/lib/media.ts).
 *
 *  - arrives fast (cache, < 150ms): the preview is dropped at once — nothing moves, content is never delayed
 *  - still coming after 150ms while on screen AND shown: a HUD sits on the preview. Spec §14/§15: one moving part
 *    (a soft scan band in the page color), an explicit state (LOADING tag), brackets in the work's signal that close in
 *    once when the HUD appears — no pulsing, no colored line across the picture
 *  - arrives: one motion — the veil wipes away top → bottom (--t-enter × 0.8, the shared sweep edge) while the brackets fade with it; the real
 *    picture is there. No accent after it: several pictures often arrive together, and a lock-on on each would be
 *    many things moving at once (spec §14)
 *  - fails: the preview stays, brackets stay, the tag says the picture did not load; the element gets .lq-err
 *  - reduced motion: the same states, shown and removed without movement
 *
 * Hidden layers (opacity 0 / visibility hidden — the next image in ScrollStepper, SplitScroll, Inspector, SketchReveal)
 * never get a HUD: a HUD on a hidden image would sit over the visible one. When such a layer becomes visible while its
 * picture is still coming, the component calls `lqWatch(img)`, or `lqSync(stage)` after switching layers (blockSwap
 * does this for you: hidden layers lose their HUD, the shown one gets it).
 *
 * `hud(target)` is the same HUD for anything else that waits: the PhotoCard viewer, ScrubFrames, a stalled video.
 * It is a short-lived sibling of the target, placed on the target's own box (offsetLeft/Top), so it follows rotated
 * cards, sticky stages and zoomed views. `window.__lqReplay()` puts on-screen images back into the loading state and
 * lets them arrive one by one — the kit uses it, because a local machine never shows loading.
 */
import { onPage, reducedMotion, cssMs } from './lifecycle';
import { sweep } from './sweep';

const OPEN = 'cubic-bezier(0.87, 0, 0.13, 1)', ENTER = 'cubic-bezier(0.22, 1, 0.36, 1)', EXIT = 'cubic-bezier(0.4, 0, 1, 1)';
const huds = new WeakMap<HTMLElement, Hud>();
const settle = (el: HTMLElement) => el.classList.add('lq-done');
const onScreen = (el: Element) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 40 && r.height > 40; };
const pending = (el: HTMLImageElement) => !el.classList.contains('lq-done') && !(el.complete && el.naturalWidth > 0);
const say = (m: Record<string, string>) => m[document.documentElement.lang] ?? m.en;
export const LOADING = () => say({ en: 'LOADING', th: 'กำลังโหลด', ja: '読み込み中' });
const FAILED = () => say({ en: 'NOT LOADED', th: 'โหลดไม่สำเร็จ', ja: '読み込み失敗' });

/** Shown = laid out, not transparent, not visibility-hidden (a hidden layer must not get a HUD). */
export function shown(el: HTMLElement): boolean {
  if (!el.offsetParent || getComputedStyle(el).visibility === 'hidden') return false;
  // opacity is not inherited: a hidden pane / layer / not-yet-revealed section hides the image inside it
  for (let n: HTMLElement | null = el; n && n !== document.body; n = n.parentElement) if (parseFloat(getComputedStyle(n).opacity) <= 0.05) return false;
  return true;
}

export interface Hud {
  el: HTMLElement;
  /** The thing arrived: the veil wipes away and the brackets fade with it, then the HUD removes itself. */
  done(): Promise<void>;
  /** It did not arrive: the preview and brackets stay, the tag says so. */
  fail(): void;
}

/** Put the loading HUD on any element's box. `preview` copies the element's inline blurred preview onto the veil. */
export function hud(t: HTMLElement, o: { preview?: boolean } = {}): Hud {
  const rm = reducedMotion();
  const h = document.createElement('span');
  h.className = 'lq-hud wait';
  h.setAttribute('aria-hidden', 'true');
  const z = parseInt(getComputedStyle(t).zIndex, 10);
  Object.assign(h.style, { left: `${t.offsetLeft}px`, top: `${t.offsetTop}px`, width: `${t.offsetWidth}px`, height: `${t.offsetHeight}px`, zIndex: Number.isFinite(z) ? String(z + 1) : '' });
  h.innerHTML = `<i class="lq-veil"><i class="lq-scan"></i></i><i class="c c1"></i><i class="c c2"></i><i class="c c3"></i><i class="c c4"></i><b class="lq-tag">${LOADING()}</b>`;
  const veil = h.querySelector<HTMLElement>('.lq-veil')!, tag = h.querySelector<HTMLElement>('.lq-tag')!;
  const corners = [...h.querySelectorAll<HTMLElement>('.c')];
  if (o.preview !== false && t.style.backgroundImage) Object.assign(veil.style, { backgroundImage: t.style.backgroundImage, backgroundSize: t.style.backgroundSize || 'cover', backgroundPosition: t.style.backgroundPosition || 'center' });
  t.after(h);
  const tCur = cssMs('--t-cursor');
  const out = (k: number, d: number) => `translate(${k === 0 || k === 3 ? -d : d}px, ${k < 2 ? -d : d}px)`;
  if (!rm) {
    // appear once, precisely: the brackets close in on the box, then the tag types in
    corners.forEach((c, k) => c.animate([{ transform: out(k, 8), opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: tCur, easing: ENTER }));
    tag.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: tCur, delay: tCur * 0.5, easing: ENTER, fill: 'backwards' });
  }
  let over = false;
  return {
    el: h,
    async done() {
      if (over) return; over = true;
      h.classList.remove('wait');
      if (rm) { h.remove(); return; }
      h.getAnimations({ subtree: true }).forEach((a) => a.cancel());
      const t = cssMs('--t-enter') * 0.8;
      corners.forEach((c) => c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: t * 0.6, easing: EXIT, fill: 'forwards' }));
      // the veil leaves with the shared sweep edge (scripts/sweep.ts), top → bottom
      const wipe = sweep(veil, 'd', 'out', { duration: t, easing: OPEN }) ?? veil.animate([{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(100% 0 0 0)' }], { duration: t, easing: OPEN, fill: 'forwards' });
      await wipe.finished.catch(() => {});
      h.remove();
    },
    fail() { h.classList.add('err'); tag.textContent = FAILED(); }
  };
}

function showHud(el: HTMLImageElement) {
  if (huds.has(el) || !shown(el) || !pending(el)) return;
  huds.set(el, hud(el));
}

async function resolve(el: HTMLImageElement) {
  settle(el);
  const h = huds.get(el);
  if (!h) return;
  huds.delete(el);
  await h.done();
}

/** A layer that just became visible (blockSwap, SketchReveal): give it the HUD if its picture is still coming after 150ms. */
export function lqWatch(el: HTMLImageElement | null | undefined) {
  if (!el || !el.hasAttribute('data-lq') || !pending(el)) return;
  setTimeout(() => { if (pending(el) && onScreen(el)) showHud(el); }, 150);
}

/** After layers were switched inside `root` (blockSwap does this): an image that is hidden now loses its HUD (it would
 *  sit over the visible one), a shown one that is still coming gets it. */
export function lqSync(root: ParentNode) {
  root.querySelectorAll<HTMLImageElement>('img[data-lq]').forEach((im) => {
    const h = huds.get(im);
    if (h && !shown(im)) { huds.delete(im); h.el.remove(); }
    else if (!h) lqWatch(im);
  });
}

function watch(el: HTMLImageElement, io: IntersectionObserver) {
  if (el.complete && el.naturalWidth > 0) { settle(el); return; }
  el.classList.remove('lq-done');
  el.addEventListener('load', () => resolve(el), { once: true });
  el.addEventListener('error', () => { el.classList.add('lq-err'); huds.get(el)?.fail(); }, { once: true });
  io.observe(el);
}

onPage(() => {
  const timers = new Map<Element, number>();
  // only images that stay pending for 150ms while on screen (and shown) get the HUD; a hidden one (next layer, a
  // section not revealed yet) is asked again every 250ms while it is on screen and still coming
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    const el = e.target as HTMLImageElement;
    clearTimeout(timers.get(el));
    if (!e.isIntersecting) return;
    const ask = () => {
      if (!pending(el)) { io.unobserve(el); return; }
      if (shown(el)) { showHud(el); io.unobserve(el); return; }
      timers.set(el, window.setTimeout(ask, 250));
    };
    timers.set(el, window.setTimeout(ask, 150));
  }));
  document.querySelectorAll<HTMLImageElement>('img[data-lq]').forEach((el) => watch(el, io));
  // a <video> keeps its preview until the poster is there
  document.querySelectorAll<HTMLVideoElement>('video[data-lq]').forEach((v) => {
    const p = new Image(); p.src = v.poster;
    if (!v.poster || p.complete) settle(v); else p.addEventListener('load', () => settle(v), { once: true });
  });
  return () => { io.disconnect(); timers.forEach((t) => clearTimeout(t)); };
});

(window as any).__lqReplay = () => {
  const imgs = [...document.querySelectorAll<HTMLImageElement>('img[data-lq]')].filter((im) => onScreen(im) && shown(im));
  imgs.forEach((im, i) => {
    const src = im.getAttribute('src')!, srcset = im.getAttribute('srcset');
    // hold the box at its real shape: the 1px stand-in would otherwise turn a height:auto image square for a moment
    im.style.aspectRatio = `${im.offsetWidth} / ${im.offsetHeight}`;
    im.classList.remove('lq-done');
    if (!huds.has(im)) huds.set(im, hud(im));
    im.removeAttribute('srcset');
    im.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    setTimeout(() => {
      im.addEventListener('load', () => { im.style.removeProperty('aspect-ratio'); resolve(im); }, { once: true });
      if (srcset) im.setAttribute('srcset', srcset);
      im.src = src;
    }, 1400 + i * 260);
  });
  return imgs.length;
};
