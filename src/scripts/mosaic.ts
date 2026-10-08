/**
 * Mosaic: an element shown at a lower resolution — square cells `c` px wide, each the colour at its centre — through
 * an SVG filter referenced from CSS (`filter: url(#…)`). No canvas, no copy of the picture; works on an <img> and on
 * inline SVG (IsoObject) alike. The grid can be aligned to another grid (`ox`, `oy`: where a cell corner falls, in the
 * element's own px). SketchReveal's "resolve" reveal steps it from the glyph's cell size down to the real picture.
 */
const NS = 'http://www.w3.org/2000/svg';
let defs: SVGSVGElement | null = null, n = 0;

export interface Mosaic { set(c: number, ox?: number, oy?: number): void; clear(): void }

export function mosaic(el: HTMLElement): Mosaic {
  if (!defs || !defs.isConnected) {
    defs = document.createElementNS(NS, 'svg');
    defs.setAttribute('aria-hidden', 'true');
    defs.setAttribute('width', '0');
    defs.setAttribute('height', '0');
    defs.style.position = 'absolute';
    document.body.append(defs);
  }
  const id = `mz-${++n}`;
  const f = document.createElementNS(NS, 'filter');
  f.id = id;
  for (const [k, v] of [['x', '0'], ['y', '0'], ['width', '1'], ['height', '1'], ['color-interpolation-filters', 'sRGB']]) f.setAttribute(k, v);
  defs.append(f);
  return {
    // one 2px sample at each cell's centre (a flood dot tiled on the grid, kept where the picture is), then each sample
    // grown to fill its cell (dilate: the only non-empty pixel in its reach is its own sample)
    set(c, ox = 0, oy = 0) {
      const x = ((ox % c) + c) % c, y = ((oy % c) + c) % c, h = c / 2;
      f.innerHTML = `<feFlood x="${x + h - 1}" y="${y + h - 1}" width="2" height="2" flood-color="#000" result="d"/>`
        + `<feComposite in="d" in2="d" operator="over" x="${x}" y="${y}" width="${c}" height="${c}" result="t"/>`
        + `<feTile in="t" result="g"/><feComposite in="SourceGraphic" in2="g" operator="in" result="s"/>`
        + `<feMorphology in="s" operator="dilate" radius="${Math.max(0.5, h - 1)}"/>`;
      el.style.filter = `url(#${id})`;
    },
    clear() { el.style.removeProperty('filter'); f.remove(); }
  };
}
