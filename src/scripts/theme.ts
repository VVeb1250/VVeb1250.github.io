/**
 * Switching light ↔ dark: blockSwap's grammar (cover → swap → uncover) over the whole screen.
 *
 *   1. a plane in the NEW mode's ground (`.theme-plane` in base.css, with .tone-light / .tone-dark) slides in from the
 *      right — the toggle's side — on the very frame of the click: its soft leading ramp (30% of the screen, leaning
 *      10° like every sweep) is already a third on screen                                        (--t-enter × 0.76, --e-glide)
 *   2. once it covers the page, the theme switches underneath it; the page repaints out of sight
 *   3. the plane slides on out to the left and the page shows in the new theme                  (--t-enter × 0.76, --e-glide)
 *
 * Why not a View Transition: it has to capture the page before anything moves, so the click froze for a moment, and a
 * full-screen change of brightness moved by a clipped edge read as stiff. The plane only moves by transform (the GPU
 * moves it, whatever the page is doing) and needs no capture, so it also runs where View Transitions are missing.
 * While the page switches, CSS transitions are off (`html.theme-switch`): no element fades from the old colors and the
 * fog does not drift on afterwards. Reduced motion: instant. A switch that does not change what shows (Auto → Light on
 * a light device) just changes the setting.
 */
import { reducedMotion, cssMs } from './lifecycle';

export type Theme = 'auto' | 'light' | 'dark';

// the setting a switch in progress is heading to (the flip waits for the plane to cover): a second click meanwhile
// continues from it, not from the old setting
let want: Theme | null = null;

export function storedTheme(): Theme {
  if (want) return want;
  try { const m = localStorage.getItem('theme'); return m === 'light' || m === 'dark' ? m : 'auto'; } catch { return 'auto'; }
}

/** What actually shows for a setting. */
export function shownTheme(m: Theme = storedTheme()): 'light' | 'dark' {
  return m === 'auto' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : m;
}

export async function setTheme(next: Theme): Promise<void> {
  const from = shownTheme();
  want = next;
  const flip = () => {
    if (want === next) want = null;
    try { next === 'auto' ? localStorage.removeItem('theme') : localStorage.setItem('theme', next); } catch {}
    (window as any).__applyTheme?.();
    document.dispatchEvent(new CustomEvent('themechange', { detail: next }));
  };
  if (reducedMotion() || shownTheme(next) === from) {
    // nothing to show moving; a plane still on its way would otherwise land on its own (older) setting later
    planes++;
    document.querySelectorAll('.theme-plane').forEach((p) => p.remove());
    document.documentElement.classList.remove('theme-switch');
    flip();
    return;
  }
  return plane(flip, shownTheme(next));
}

let planes = 0;

async function plane(flip: () => void, to: 'light' | 'dark') {
  const id = ++planes, html = document.documentElement;
  document.querySelectorAll('.theme-plane').forEach((p) => p.remove()); // a newer switch cuts the last one short
  // wider than the screen: soft ramps (30% of the screen) on both sides, leaning 10° (skewed about its middle)
  const vw = innerWidth, vh = innerHeight, R = Math.round(vw * 0.3), s = Math.ceil(vh * Math.tan(Math.PI / 18)), W = vw + 2 * R + s;
  const el = document.createElement('div');
  el.className = `theme-plane tone-${to}`;
  el.setAttribute('aria-hidden', 'true');
  el.style.width = `${W}px`;
  el.style.setProperty('--r', `${R}px`);
  const at = (x: number) => `translateX(${x}px) skewX(-10deg)`;
  // starts with its leading ramp a third on screen (the click shows at once), covers exactly, leaves fully
  const x0 = vw - R * 0.35 + s / 2, xc = -R - s / 2, x1 = -W - s / 2;
  el.style.transform = at(x0);
  document.body.append(el);
  const t = cssMs('--t-enter') * 0.76;
  const ease = getComputedStyle(html).getPropertyValue('--e-glide').trim() || 'ease-in-out';
  await el.animate([{ transform: at(x0) }, { transform: at(xc) }], { duration: t, easing: ease, fill: 'forwards' }).finished.catch(() => {});
  if (id !== planes) return;
  html.classList.add('theme-switch'); // no CSS transitions while the page switches under the plane
  flip();
  // the page repaints in the new theme before this starts moving (the animation starts with the next frame)
  await el.animate([{ transform: at(xc) }, { transform: at(x1) }], { duration: t, easing: ease, fill: 'forwards' }).finished.catch(() => {});
  if (id !== planes) return;
  el.remove();
  html.classList.remove('theme-switch');
}
