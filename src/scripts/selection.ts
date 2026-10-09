/**
 * Selection on the big display words (h1, Home's doors, the About door, timeline years, the reference numbers).
 *
 * Native ::selection paints a block as tall as the font (Saira: ~1.57em), but these lines are set at 0.82–0.92em, so a
 * dragged block covers the line above. There the native highlight is made clear (base.css, html.js) and this draws a
 * thick band over the lower ~half of the letters instead — from 0.36em above the baseline to 0.07em below it.
 *
 * Two layers make the band, one under the letters and one over them:
 *   under  (inside <main>, z-index −1)         the band in the opposite of the signal color, 255 − S per channel
 *   over   (fixed, mix-blend-mode: difference)  white over the same rectangles
 * Difference with white is a plain inversion (255 − pixel). The band comes out as S exactly, and a letter that crosses
 * it is inverted too: white text turns black, dark text turns white. Nothing outside the rectangles changes.
 *
 * Body text keeps the native solid block. Reduced motion: no sweep. Phones: the native handles stay, the band follows.
 */
const BIG = 'h1, .dr-t, .pd-t, .tl-yn, .rb-ref';
// the small [09] counters inside those words keep the native block (base.css)
const SMALL = '.wk-count, .cnt, .tl-yc, .pd-n, .dr-n';
const KEY = '__selBand';

type Row = { top: number; left: number; right: number; bottom: number; fs: number; desc: number };
type Rgb = [number, number, number];

const rgb = (c: string): Rgb => (c.match(/[\d.]+/g) ?? ['0', '0', '0']).slice(0, 3).map(Number) as Rgb;
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let ctx2d: CanvasRenderingContext2D | null = null;

/** The color of `var(name)` as seen from `el` (the signal color depends on the page's data-cat). */
function colorOf(el: Element, v: string): Rgb {
  const p = document.createElement('i');
  p.style.cssText = `position:absolute;visibility:hidden;color:var(${v})`;
  el.append(p);
  const c = rgb(getComputedStyle(p).color);
  p.remove();
  return c;
}

/** How far the font's descent reaches below the baseline, in px (the Range rect covers ascent + descent). */
function descent(cs: CSSStyleDeclaration, fs: number): number {
  ctx2d ??= document.createElement('canvas').getContext('2d');
  if (!ctx2d) return fs * 0.3;
  ctx2d.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  return ctx2d.measureText('x').fontBoundingBoxDescent || fs * 0.3;
}

/** The layer over the letters: fixed to the viewport, redrawn on scroll. */
function over(): HTMLElement {
  let l = (window as any)[KEY] as HTMLElement | undefined;
  if (!l || !l.isConnected) {
    l = document.createElement('div');
    l.setAttribute('aria-hidden', 'true');
    l.style.cssText = 'position:fixed;inset:0;z-index:30;pointer-events:none;mix-blend-mode:difference;';
    document.body.append(l);
    (window as any)[KEY] = l;
  }
  return l;
}

/** The layer under the letters: inside <main> (a stacking context), below its content. */
function under(main: HTMLElement): HTMLElement {
  let l = main.querySelector<HTMLElement>(':scope > .sel-under');
  if (!l) {
    l = document.createElement('div');
    l.className = 'sel-under';
    l.setAttribute('aria-hidden', 'true');
    l.style.cssText = 'position:absolute;inset:0;z-index:-1;pointer-events:none;';
    main.prepend(l);
  }
  return l;
}

function rows(range: Range): { rows: Row[]; host: Element | null } {
  const out: Row[] = [];
  let host: Element | null = null;
  const root = range.commonAncestorContainer.nodeType === 1 ? (range.commonAncestorContainer as Element) : range.commonAncestorContainer.parentElement;
  if (!root) return { rows: out, host };
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    const el = n.parentElement?.closest(BIG);
    if (!el || n.parentElement?.closest(SMALL) || !n.textContent?.trim() || !range.intersectsNode(n)) continue;
    host ??= el;
    const cs = getComputedStyle(n.parentElement!);
    const fs = parseFloat(cs.fontSize), desc = descent(cs, fs);
    const part = document.createRange();
    part.selectNodeContents(n);
    if (n === range.startContainer) part.setStart(n, range.startOffset);
    if (n === range.endContainer) part.setEnd(n, range.endOffset);
    for (const r of part.getClientRects()) {
      if (r.width < 1 || r.height < 1) continue;
      const row = out.find((w) => Math.abs(w.bottom - r.bottom) < fs * 0.2 && w.fs === fs);
      if (row) { row.left = Math.min(row.left, r.left); row.right = Math.max(row.right, r.right); }
      else out.push({ top: r.top, left: r.left, right: r.right, bottom: r.bottom, fs, desc });
    }
  }
  return { rows: out, host };
}

let frame = 0;
const clearAll = () => {
  (window as any)[KEY]?.replaceChildren();
  document.querySelector('main > .sel-under')?.replaceChildren();
};

function draw() {
  frame = 0;
  const sel = getSelection();
  if (!sel || !sel.rangeCount || sel.isCollapsed) return clearAll();
  const { rows: rs, host } = rows(sel.getRangeAt(0));
  const main = document.querySelector<HTMLElement>('main');
  if (!rs.length || !host || !main) return clearAll();
  const S = colorOf(host, '--ctxs');
  const lays: [HTMLElement, string, number, number][] = [
    [under(main), `rgb(${S.map((v) => 255 - v).join(',')})`, main.getBoundingClientRect().left, main.getBoundingClientRect().top],
    [over(), '#fff', 0, 0]
  ];
  const anim = !reduced();
  for (const [lay, color, ox, oy] of lays) {
    while (lay.children.length > rs.length) lay.lastElementChild!.remove();
    while (lay.children.length < rs.length) {
      const b = document.createElement('i');
      b.style.cssText = 'position:absolute;display:block;';
      if (anim) b.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 150, easing: 'cubic-bezier(0.22,1,0.36,1)' });
      lay.append(b);
    }
    rs.forEach((r, i) => {
      const base = r.bottom - r.desc; // the baseline
      const top = base - r.fs * 0.36, bottom = base + r.fs * 0.07, pad = r.fs * 0.03;
      const b = lay.children[i] as HTMLElement;
      b.style.left = `${r.left - pad - ox}px`;
      b.style.top = `${top - oy}px`;
      b.style.width = `${r.right - r.left + pad * 2}px`;
      b.style.height = `${bottom - top}px`;
      b.style.background = color;
    });
  }
}

const soon = () => { if (!frame) frame = requestAnimationFrame(draw); };

if (!(window as any).__selBandOn) {
  (window as any).__selBandOn = true;
  document.addEventListener('selectionchange', soon);
  addEventListener('scroll', soon, { passive: true });
  addEventListener('resize', soon);
}
