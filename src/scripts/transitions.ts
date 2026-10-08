/**
 * Page transitions on top of Astro's <ClientRouter> (spec §25). Pick the grammar with `data-vt` on the link:
 *
 *   data-vt="deeper"     card → work page: exit 60ms → a line grows from the point you clicked (keyboard: the title)
 *                        → 40px label bar at that height → plane opens in the work's color → swap under the plane →
 *                        plane fades while the content cascades in (~0.6s before the swap).
 *                        Also set data-vt-cat, data-vt-label="[01]|Title|TYPE · YEAR", data-work, and mark the
 *                        title element with data-vt-title.
 *   data-vt="push-next"  work → next work. Header, fog and the WorkNav strip (↑ ↓ and the counter) hold still; only
 *   data-vt="push-prev"  the content moves, and the counter rolls to the new number. Nothing is captured while it
 *                        moves: the old content leaves before the swap (while the next page loads), the new content
 *                        arrives after it — so the fog never slides and two skies never meet in a seam. No View
 *                        Transition runs for a push (no capture, no frozen frame); the content is cut off just under
 *                        WorkNav (WorkPage's data-vt-stage) so it never slides over the strip.
 *                        The old content slides 30% of the screen's height up (next) / down (prev) and is gone by 60%
 *                        of the way (150ms, --e-exit); the new content arrives as one piece from 30% below / above, fully
 *                        there by 60% of the way, and settles (--t-push 460ms, --e-enter).
 *   data-vt="back"       back to where you came from: quick exit, content comes back in a quicker cascade, then the
 *                        origin card locks on for 1.4s.
 *   external link        a same-tab link to another site (GitHub, Pixiv …): LoadLine runs at once (no 150ms wait), the page
 *                        dims to 40% and the "deeper" line grows from the click into a bar that names the host — no plane —
 *                        and ~0.35s later the browser leaves. Without it nothing on screen says the click did anything
 *                        until the other site arrives. The bar stays until the page unloads; a bfcache return (pageshow)
 *                        or a 6s timeout clears it (and finishes LoadLine).
 *                        New-tab links, modifier clicks and downloads are left alone. Reduced motion: a 150ms fade.
 *   (none)               between the nav's pages (Work · Lab · About · Archive; a work page counts as Work): a push
 *                        sideways in the nav's order, like the nav cursor — to a page further right the content leaves
 *                        to the left and the new one comes in from the right, as one piece. The travel follows the
 *                        screen: 15% of its width, never more than the push (30% of its height), at least 48px.
 *                        Same timing and machinery as the push: no capture, header and fog still. Browser
 *                        back/forward between nav pages slides the same way.
 *                        Any other plain link (the language switch, the kit): the cascade below.
 *
 * Content cascade (other links, back, deeper): the new page is never animated as one full-screen picture. The blocks
 * that are on screen (the page's own sections, one level down when a block is taller than the screen) come in top to
 * bottom — opacity + 12px rise, 35ms apart (the 8th and later together) — while the header and the fog hold still. The View Transition itself
 * only fades the old page out (60ms), so it ends almost at once instead of moving the whole new page for 500ms.
 *
 * Browser back/forward uses "back"/"tab" (or sideways between nav pages).
 * Focus: a full page load would start at the top of the page; here focus lands on <main> after every change, except a
 * keyboard press on WorkNav's ↑ / ↓, which stays on that arrow in the new page (so ↓ ↓ ↓ keeps working).
 * While content leaves it can no longer be clicked (a quick second click never lands on something already fading).
 * Reduced motion: nothing moves — every kind becomes a 150ms fade of the old page (opacity is not motion, WCAG 2.3.3).
 * Push and sideways skip Astro's View Transition by wrapping document.startViewTransition (see below): after upgrading
 * Astro, check that a push still shows no capture freeze (AGENTS.md).
 * The CSS half lives in src/styles/transitions.css (keys off html[data-vt]).
 */
import { reducedMotion, cssMs } from './lifecycle';

type Kind = 'deeper' | 'push-next' | 'push-prev' | 'side-next' | 'side-prev' | 'back' | 'tab' | 'none';
type Moving = 'push-next' | 'push-prev' | 'side-next' | 'side-prev';
const moving = (k: Kind): k is Moving => k.startsWith('push') || k.startsWith('side');
let kind: Kind = 'tab';
const ORIGIN = 'vt-origin';
type Origin = { path: string; work: string; index: number | null; doc: string };
// One id per full page load. History indexes from Astro's router only line up inside one document session:
// after a reload or a fresh visit they restart at 0, so an origin saved in another session must not be trusted.
const DOC: string = (window as any).__vtDoc ?? ((window as any).__vtDoc = Math.random().toString(36).slice(2));
function readOrigin(): Origin | null {
  let o: Origin | null = null;
  try { o = JSON.parse(sessionStorage.getItem(ORIGIN) || 'null'); } catch {}
  if (o && o.doc !== DOC) { dropOrigin(); return null; }
  return o;
}
function dropOrigin() { try { sessionStorage.removeItem(ORIGIN); } catch {} }

const E = { exit: 'cubic-bezier(0.4,0,1,1)', enter: 'cubic-bezier(0.22,1,0.36,1)', open: 'cubic-bezier(0.87,0,0.13,1)' };
const T = { exit: 60, line: 200, thicken: 110, hold: 0, open: 210, planeOut: 320 };
const BAR_H = 40;

const run = (el: Element | null, frames: Keyframe[], o: KeyframeAnimationOptions) =>
  el ? el.animate(frames, { fill: 'both', ...o }).finished.catch(() => undefined) : Promise.resolve();

function overlay() {
  return {
    bar: document.querySelector<HTMLElement>('.vt-bar'),
    label: document.querySelector<HTMLElement>('.vt-bar-t'),
    plane: document.querySelector<HTMLElement>('.vt-plane')
  };
}

// A navigation can start while the "deeper" overlay is still running (double click, a nav link during the ~0.8s).
// Every navigation gets an id; a stale overlay run notices it was superseded and stops instead of freezing the plane.
let navId = 0;
function resetOverlay() {
  const { bar, label, plane } = overlay();
  [bar, label, plane, document.querySelector('main')].forEach((el) => el?.getAnimations().forEach((a) => { if (a instanceof CSSAnimation || a instanceof CSSTransition) return; a.cancel(); }));
  if (bar) bar.style.visibility = 'hidden';
  if (plane) { plane.style.visibility = 'hidden'; plane.style.clipPath = ''; }
}

async function playDeeper(link: HTMLElement, id: number, info?: { cat: string; label: string; stay?: boolean }) {
  const { bar, label, plane } = overlay();
  if (!bar || !label || !plane) return;
  // the line starts where you clicked (a keyboard press: at the title), not at the title's text
  const title = link.querySelector('[data-vt-title]') ?? link;
  const r = title.getBoundingClientRect();
  const p = press && performance.now() - press.t < 1500 ? press : null;
  const vh = innerHeight;
  const y = Math.round(Math.min(vh - BAR_H, Math.max(BAR_H, p ? p.y : r.top + r.height / 2)));
  const cat = info?.cat ?? (link.dataset.vtCat || 'self');
  const [idx = '', name = '', meta = ''] = (info?.label ?? link.dataset.vtLabel ?? '').split('|');

  bar.dataset.cat = cat; plane.dataset.cat = cat;
  label.style.paddingLeft = '0px';
  label.replaceChildren(...[idx, name, meta].filter(Boolean).map((s, i) => { const e = document.createElement(i === 1 ? 'b' : 'span'); e.textContent = s; return e; }));
  // the label starts at the same point, pulled back just enough to fit on screen
  const x = Math.round(Math.max(16, Math.min(p ? p.x : r.left, innerWidth - label.scrollWidth - 24)));
  bar.style.top = `${y - BAR_H / 2}px`;
  bar.style.transformOrigin = `${Math.round(p ? p.x : x)}px 50%`;
  label.style.paddingLeft = `${x}px`;

  const main = document.querySelector('main');
  // leaving the site (`stay`): the page dims instead of leaving, and the bar stays — no plane
  if (info?.stay) run(main, [{ opacity: 1 }, { opacity: 0.4 }], { duration: 200, easing: E.exit });
  else await run(main, [{ opacity: 1 }, { opacity: 0 }], { duration: T.exit, easing: E.exit });
  if (id !== navId) return;
  const total = T.line + T.thicken;
  bar.style.visibility = 'visible';
  run(bar, [
    { transform: `scaleX(0) scaleY(${2 / BAR_H})`, easing: E.enter },
    { transform: `scaleX(1) scaleY(${2 / BAR_H})`, offset: T.line / total, easing: E.enter },
    { transform: 'scaleX(1) scaleY(1)' }
  ], { duration: total });
  run(label, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], { duration: 200, delay: T.line + 20, easing: E.enter });
  if (info?.stay) { await new Promise((r) => setTimeout(r, total + 40)); return; }
  const openAt = total + T.hold;
  plane.style.visibility = 'visible';
  run(bar, [{ opacity: 1 }, { opacity: 0 }], { duration: 120, delay: openAt + 90, easing: E.exit });
  await run(plane, [{ clipPath: `inset(${y}px 0px ${vh - y}px 0px)` }, { clipPath: 'inset(0px 0px 0px 0px)' }], { duration: T.open, delay: openAt, easing: E.open });
  // freeze the end state in inline styles: the overlay is moved into the new document on swap
  if (id !== navId) return;
  plane.style.clipPath = 'inset(0px)';
  bar.style.visibility = 'hidden';
  [bar, label, plane].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
}

async function finishDeeper() {
  const { plane } = overlay();
  if (!plane || plane.style.visibility !== 'visible') return;
  await run(plane, [{ opacity: 1 }, { opacity: 0 }], { duration: T.planeOut, easing: E.enter });
  plane.getAnimations().forEach((a) => a.cancel());
  plane.style.visibility = 'hidden';
  plane.style.clipPath = '';
}

/** After returning: bring the origin card into view (if it isn't) and lock the cursor onto it. */
function lockOn() {
  const origin = readOrigin();
  if (!origin || origin.path !== location.pathname) return;
  const el = document.querySelector<HTMLElement>(`[data-work="${CSS.escape(origin.work)}"]`);
  if (!el) return;
  const r = el.getBoundingClientRect();
  if (r.bottom < 0 || r.top > innerHeight) window.scrollTo(0, window.scrollY + r.top - innerHeight * 0.16);
  el.classList.add('is-locked');
  // a feature block is not focusable itself: its "Open project" link takes the focus
  const f = el.matches('a[href], button, [tabindex]') ? el : el.querySelector<HTMLElement>('a[data-skr-go], a[href]') ?? el;
  f.focus({ preventScroll: true });
  setTimeout(() => el.classList.remove('is-locked'), reducedMotion() ? 0 : 1400);
  dropOrigin();
}

/**
 * The blocks of the page that are on screen, top to bottom (a block taller than the screen is opened one level).
 * `keep`: elements marked data-vt-keep (WorkNav) hold still — they are left out, and a block holding one is opened.
 */
function blocks(keep = false): HTMLElement[] {
  const main = document.querySelector<HTMLElement>('main');
  if (!main) return [];
  const vh = innerHeight, out: HTMLElement[] = [];
  const walk = (el: Element, depth: number) => {
    for (const c of el.children) {
      if (!(c instanceof HTMLElement) || c.tagName === 'SCRIPT' || c.tagName === 'STYLE' || c.tagName === 'TEMPLATE') continue;
      if (keep && c.hasAttribute('data-vt-keep')) continue;
      const r = c.getBoundingClientRect();
      if (!r.height || r.top >= vh || r.bottom <= 0) continue;
      const open = (r.height > vh * 0.9 && c.children.length > 1) || (keep && !!c.querySelector('[data-vt-keep]'));
      if (open && depth < 3) walk(c, depth + 1);
      else out.push(c);
    }
  };
  walk(main, 0);
  return out;
}
const settleReveals = (list: HTMLElement[]) =>
  list.forEach((b) => b.querySelectorAll<HTMLElement>('[data-reveal]').forEach((r) => r.classList.add('is-in')));

/** Bring the new page in block by block. Runs inside the swap, before the new page is first painted. */
function cascade(k: Kind) {
  const list = blocks();
  // reveals inside these blocks are part of the cascade: settle them at once (no second entrance on top of it)
  settleReveals(list);
  const quick = k === 'back';
  const start = k === 'deeper' ? 90 : T.exit, gap = quick ? 25 : 35, dur = quick ? 300 : 420;
  list.forEach((b, i) => {
    b.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: dur, delay: start + Math.min(i, 7) * gap, easing: E.enter, fill: 'backwards' });
  });
}

// ---- push between neighbouring works, and sideways between the nav's pages ----
// how far the content travels: 30% of the screen's height; sideways 15% of its width, never farther than the push,
// at least 48px. Speed, not time, is what makes large motion uncomfortable: shorter times come with shorter travel.
const pushDist = () => Math.round(innerHeight * 0.3);
const sideDist = () => Math.round(Math.max(48, Math.min(innerWidth * 0.15, innerHeight * 0.3)));
const OUT = 150; // the old content leaves (ms, --e-exit); the new one settles in --t-push (--e-enter)
// how far along the way the content is gone (leaving) / fully there (arriving): the fastest part of each move is faint
const FADE = 0.6;

/** Which nav item a page belongs to (-1: none). A work page belongs to Work. Paths in another language never match. */
function tabOf(path: string): number {
  const links = [...document.querySelectorAll<HTMLAnchorElement>('.site-hdr .nav a[data-nav]')];
  const i = links.findIndex((a) => new URL(a.href).pathname === path);
  if (i >= 0) return i;
  // a work page: /work/<id>/ under the Work item's own path (so /th/work/… only matches while the nav is Thai).
  // Work is /work/ itself; an older nav that pointed Work at Home keeps its pages under <home>work/.
  const work = links.findIndex((a) => a.dataset.nav === 'work');
  const base = work >= 0 ? new URL(links[work].href).pathname.replace(/\/?$/, '/') : null;
  const pages = base && (base.endsWith('/work/') ? base : `${base}work/`);
  return pages && path.startsWith(pages) ? work : -1;
}

// a work's content moves inside its stage (WorkPage's data-vt-stage), cut off at the stage's top — just under WorkNav —
// so it never slides over the strip that holds still; the sides stay open for pictures that bleed to the screen edge
const stage = () => document.querySelector<HTMLElement>('[data-vt-stage]');
const cut = (el: HTMLElement | null, on: boolean) => { if (el) el.style.clipPath = on ? 'inset(0 -100vmax -100vmax -100vmax)' : ''; };
// sideways, the content would widen the page while it is off to one side (the page could be scrolled sideways)
const hold = (on: boolean) => { const m = document.querySelector<HTMLElement>('main'); if (m) m.style.overflowX = on ? 'clip' : ''; };

function plan(k: Moving) {
  const side = k.startsWith('side');
  return { side, fwd: k.endsWith('next'), d: side ? sideDist() : pushDist(), axis: side ? 'X' : 'Y' };
}

/** The old content leaves (header, fog and WorkNav stay). Runs while the next page loads; resolves when it is gone. */
async function moveOut(k: Moving): Promise<void> {
  const { side, fwd, d, axis } = plan(k);
  if (side) hold(true); else cut(stage(), true);
  // no offset-0 keyframe: a second click continues from wherever the content is now
  const to = `translate${axis}(${(fwd ? -1 : 1) * d}px)`;
  const anims = blocks(true).map((b) => {
    b.style.pointerEvents = 'none';
    return b.animate([{ opacity: 0, offset: FADE }, { opacity: 0, transform: to }], { duration: OUT, easing: E.exit, fill: 'forwards' });
  });
  await Promise.all(anims.map((a) => a.finished.catch(() => undefined)));
}

/** The new content arrives from the side it lies on: below / right for what comes next, above / left for before. */
function moveIn(k: Moving) {
  const { side, fwd, d, axis } = plan(k);
  const from = `translate${axis}(${(fwd ? 1 : -1) * d}px)`, dur = cssMs('--t-push');
  const list = blocks(true), st = side ? null : stage();
  settleReveals(list);
  cut(st, true);
  if (side) hold(true);
  // one piece: every block with the same timing; fully there at 60% of the way, then it only settles
  const frames: Keyframe[] = [{ opacity: 0, transform: from }, { opacity: 1, offset: FADE }, { opacity: 1, transform: 'none' }];
  const anims = list.map((b) => b.animate(frames, { duration: dur, easing: E.enter, fill: 'backwards' }));
  Promise.all(anims.map((a) => a.finished.catch(() => undefined))).then(() => { cut(st, false); if (side) hold(false); });
  if (!side) roll(k);
}

// the WorkNav counter's first number rolls to the new one (the strip itself does not move)
let rollFrom: string | null = null;
function roll(k: Kind) {
  const el = document.querySelector<HTMLElement>('[data-vt-keep] .wn-i');
  const to = el?.textContent ?? '';
  if (!el || !rollFrom || rollFrom === to) return;
  const next = k === 'push-next';
  const reel = document.createElement('span');
  reel.className = 'wn-reel';
  (next ? [rollFrom, to] : [to, rollFrom]).forEach((t) => { const d = document.createElement('span'); d.textContent = t; reel.append(d); });
  el.replaceChildren(reel);
  const a = reel.animate([{ transform: `translateY(${next ? 0 : -50}%)` }, { transform: `translateY(${next ? -50 : 0}%)` }], { duration: 420, delay: 40, easing: E.enter, fill: 'both' });
  a.finished.then(() => { el.textContent = to; }, () => { el.textContent = to; });
}

// where the last press happened (the deeper line starts there)
let press: { x: number; y: number; t: number } | null = null;
// where focus goes once the new page is in: a selector in the new page, or 'main'
let refocus: string | null = null;

if (!(window as any).__vt) {
  (window as any).__vt = true;

  document.addEventListener('pointerdown', (e) => { press = { x: e.clientX, y: e.clientY, t: performance.now() }; }, true);

  // push / sideways: no View Transition at all. The old content has already left before the swap, so there is nothing
  // worth capturing — and the capture froze the screen for ~80–100ms between the leaving and the arriving content.
  // Astro's router calls document.startViewTransition for every navigation; for these it gets a plain swap instead.
  const startVT = document.startViewTransition?.bind(document);
  if (startVT) {
    (document as any).startViewTransition = (arg: any) => {
      if (!moving(kind)) return startVT(arg);
      const update = typeof arg === 'function' ? arg : arg?.update;
      const done = Promise.resolve().then(() => update?.());
      const settled = done.then(() => undefined, () => undefined);
      return { updateCallbackDone: done, ready: settled, finished: settled, skipTransition() {}, types: new Set() };
    };
  }

  // A same-tab link to another site: show that we are leaving (overlay), then go. See the header.
  let leaving = false;
  const LEAVE_MS = 6000;
  const clearLeave = () => { leaving = false; ++navId; resetOverlay(); document.dispatchEvent(new Event('vt:load-end')); };
  document.addEventListener('click', (ev) => {
    if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    const a = (ev.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download') || !/^https?:$/.test(a.protocol) || a.origin === location.origin) return;
    ev.preventDefault();
    if (leaving) return;
    leaving = true;
    const id = ++navId;
    document.dispatchEvent(new Event('vt:leave'));
    // another navigation (a nav link pressed during the ~0.6s) took over: stay on the site
    const go = () => { if (id !== navId) { leaving = false; return; } location.href = a.href; setTimeout(() => { if (leaving && id === navId) clearLeave(); }, LEAVE_MS); };
    // animations stand still in a hidden tab: never wait on them for more than 1.2s
    const played = (p: Promise<unknown>) => Promise.race([p, new Promise((r) => setTimeout(r, 1200))]).then(go);
    if (reducedMotion()) { played(run(document.querySelector('main'), [{ opacity: 1 }, { opacity: 0 }], { duration: 150, easing: 'linear' })); return; }
    const cat = a.closest<HTMLElement>('[data-cat]')?.dataset.cat || 'self';
    played(playDeeper(a, id, { cat, label: `↗|${a.hostname.replace(/^www\./, '')}`, stay: true }));
  });
  // Back from the other site can restore this page from the bfcache with the bar still showing
  window.addEventListener('pageshow', (e) => { if (e.persisted && leaving) clearLeave(); });

  // The click is shown at once: a nav or language link becomes the current one in the frame of the click, before the
  // browser captures the old page (~70–100ms), so the page never looks like it ignored the press.
  document.addEventListener('click', (ev) => {
    if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    const a = (ev.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!a || a.target === '_blank' || a.hasAttribute('download') || a.origin !== location.origin || a.hasAttribute('aria-current')) return;
    const group = a.closest('.site-hdr .nav, .lang');
    if (!group) return;
    group.querySelectorAll('a[aria-current]').forEach((x) => x.removeAttribute('aria-current'));
    a.setAttribute('aria-current', group.classList.contains('lang') ? 'true' : 'page');
  }, true);

  // "back" links jump through history to the exact page they came from (restoring its scroll position),
  // even after pushing through several works; otherwise they navigate normally and lockOn() finds the work.
  document.addEventListener('click', (ev) => {
    const a = (ev.target as Element | null)?.closest?.('a[data-vt="back"]') as HTMLAnchorElement | null;
    if (!a || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    const origin = readOrigin();
    const target = new URL(a.href, location.href);
    const here = history.state?.index;
    if (origin && origin.path === target.pathname && typeof origin.index === 'number' && typeof here === 'number' && here > origin.index) {
      ev.preventDefault();
      history.go(origin.index - here);
    }
  }, true);

  document.addEventListener('astro:before-preparation', (ev: any) => {
    // The clicked link itself — never an ancestor: <html> carries data-vt of the previous navigation (for the CSS),
    // so closest('[data-vt]') would make every plain link repeat the last grammar (e.g. nav → "deeper" overlay).
    const link = (ev.sourceElement as Element | undefined)?.closest?.('a') as HTMLElement | null;
    if (ev.navigationType === 'traverse') kind = ev.direction === 'back' ? 'back' : 'tab';
    else kind = (link?.dataset.vt as Kind) || 'tab';
    // between the nav's pages: sideways, in the nav's order (a work page counts as Work; "← All work" stays "back")
    if (kind === 'tab' || (kind === 'back' && ev.navigationType === 'traverse')) {
      const a = tabOf(ev.from.pathname), b = tabOf(ev.to.pathname);
      if (a >= 0 && b >= 0 && a !== b) kind = b > a ? 'side-next' : 'side-prev';
    }
    if (reducedMotion()) kind = 'none';
    // a keyboard press on ↑ / ↓ keeps its place: the same arrow in the new page (else <main>)
    refocus = link?.matches('.wn-b') && link.matches(':focus-visible') ? `a.wn-b[data-vt="${link.dataset.vt}"]` : 'main';
    const id = ++navId;
    resetOverlay();

    if (link?.dataset.work && (kind === 'deeper' || link.dataset.vt === 'deeper')) {
      const o: Origin = { path: location.pathname, work: link.dataset.work, index: history.state?.index ?? null, doc: DOC };
      try { sessionStorage.setItem(ORIGIN, JSON.stringify(o)); } catch {}
    }
    // LoadLine listens to vt:load-start / vt:load-end, so it measures only the network load — never the deeper overlay.
    const load = ev.loader;
    const real = async () => {
      document.dispatchEvent(new Event('vt:load-start'));
      try { await load(); } finally { document.dispatchEvent(new Event('vt:load-end')); }
    };
    ev.loader = kind === 'deeper' && link ? async () => { await Promise.all([real(), playDeeper(link, id)]); }
      : moving(kind) ? ((k: Moving) => async () => { await Promise.all([real(), moveOut(k)]); })(kind)
      : real;
  });

  document.addEventListener('astro:before-swap', (ev: any) => {
    ev.newDocument.documentElement.dataset.vt = kind;
    rollFrom = document.querySelector('[data-vt-keep] .wn-i')?.textContent ?? null;
    const h = document.documentElement.style.getPropertyValue('--hdr-h');
    if (h) ev.newDocument.documentElement.style.setProperty('--hdr-h', h);
  });

  document.addEventListener('astro:after-swap', () => {
    if (kind === 'deeper') finishDeeper();
    if (kind === 'tab' || kind === 'back' || kind === 'deeper') cascade(kind);
    if (moving(kind)) moveIn(kind);
  });

  document.addEventListener('astro:page-load', () => {
    const o = readOrigin(), i = history.state?.index;
    if (o && typeof o.index === 'number' && typeof i === 'number' && (i < o.index || (i === o.index && location.pathname !== o.path))) dropOrigin();
    if (refocus) {
      // the last work has no ↓: the other arrow, so the keyboard can still go back
      const el = (refocus !== 'main' && (document.querySelector<HTMLElement>(refocus) ?? document.querySelector<HTMLElement>('a.wn-b')))
        || document.querySelector<HTMLElement>('main');
      el?.focus({ preventScroll: true });
      refocus = null;
    }
    // after focus: returning to the origin card focuses the card
    if (kind === 'back' || kind === 'tab' || kind === 'none' || kind.startsWith('side')) lockOn();
  });
}
