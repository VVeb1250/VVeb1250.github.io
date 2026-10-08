/**
 * Media lookup by short key. Put files in src/assets/works/<work-id>/ and refer to them as "<work-id>/<file>"
 * (e.g. "vaja/object.webp"). A missing file fails the build with the path it expected — no broken images ship.
 * Images go through astro:assets (resized, modern formats, lazy); videos get a hashed URL.
 */
import type { ImageMetadata } from 'astro';
import tokens from './tokens.json';

const images = import.meta.glob<{ default: ImageMetadata }>('/src/assets/**/*.{png,jpg,jpeg,webp,avif,gif,svg}', { eager: true });
const videos = import.meta.glob<string>('/src/assets/**/*.{mp4,webm}', { eager: true, query: '?url', import: 'default' });

function candidates(key: string) {
  const k = key.replace(/^\/+/, '').replace(/^src\/assets\//, '');
  return [`/src/assets/${k}`, `/src/assets/works/${k}`];
}

export function img(key: string): ImageMetadata {
  for (const c of candidates(key)) if (images[c]) return images[c].default;
  throw new Error(`[media] image "${key}" not found. Expected src/assets/works/${key.replace(/^works\//, '')}`);
}

export function vid(key: string): string {
  for (const c of candidates(key)) if (videos[c]) return videos[c];
  throw new Error(`[media] video "${key}" not found. Expected src/assets/works/${key.replace(/^works\//, '')}`);
}

/** Accepts a key or an already-imported image (from a content collection's image() field). */
export function toImage(src: string | ImageMetadata): ImageMetadata {
  return typeof src === 'string' ? img(src) : src;
}

/* ---------- loading previews (LQIP) ----------
 * Every image gets a tiny blurred preview (~20px, inlined as a data: URI at build time) painted as its own CSS
 * background. On a slow connection you see the picture's colors and shapes at once; src/scripts/lq.ts sharpens the
 * real image in when it arrives and then drops the preview (so transparent cutouts don't keep a rectangle behind them).
 * Build-time only (sharp); nothing extra is downloaded.
 */
const lqCache = new Map<string, Promise<string>>();
function pathOf(meta: ImageMetadata): string | null {
  const fs = (meta as any).fsPath as string | undefined;
  if (fs) return fs;
  for (const [p, m] of Object.entries(images)) if (m.default === meta || m.default.src === meta.src) return p;
  return null;
}
async function lqData(meta: ImageMetadata): Promise<string> {
  const p = pathOf(meta);
  if (!p || /\.svg$/i.test(p)) return '';
  if (!lqCache.has(p)) {
    lqCache.set(p, (async () => {
      const { default: sharp } = await import('sharp');
      // glob keys are project-relative ('/src/…'); fsPath (when Astro provides it) is already absolute
      const file = p.startsWith('/src/') ? `${(globalThis as any).process.cwd()}${p}` : p;
      const buf = await sharp(file).resize(20, 20, { fit: 'inside' }).blur(0.6).webp({ quality: 40, alphaQuality: 40 }).toBuffer();
      return `data:image/webp;base64,${buf.toString('base64')}`;
    })().catch((e) => { console.warn('[media] loading preview skipped for', p, String(e).slice(0, 160)); return ''; }));
  }
  return lqCache.get(p)!;
}
/**
 * Style for an <img>/<Image>/<video> that shows the blurred preview until the real picture loads.
 * `fit` must match the element's object-fit ('cover' fills the box, 'contain' keeps the picture's shape inside it).
 * Use together with the `data-lq` attribute:  <Image … style={await lqStyle(meta)} data-lq />
 */
export async function lqStyle(meta: ImageMetadata, fit: 'cover' | 'contain' = 'cover'): Promise<string> {
  const d = await lqData(meta);
  return d ? `background-image:url(${d});background-size:${fit};background-position:center;background-repeat:no-repeat` : '';
}

/**
 * Ink colors for the owner's signature on a picture's paper card: the picture's own accent (its most saturated pixels),
 * set to a lightness that reads on the card's paper in each theme. Build-time only (sharp).
 * Returns null when the file can't be read — the signature is then left out.
 */
const inkCache = new Map<string, Promise<{ light: string; dark: string } | null>>();
export function signInk(meta: ImageMetadata) {
  const p = pathOf(meta);
  if (!p || /\.svg$/i.test(p)) return Promise.resolve(null);
  if (!inkCache.has(p)) {
    inkCache.set(p, (async () => {
      const { default: sharp } = await import('sharp');
      const file = p.startsWith('/src/') ? `${(globalThis as any).process.cwd()}${p}` : p;
      const N = 48;
      const { data } = await sharp(file).flatten({ background: '#ffffff' }).resize(N, N, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
      const ch = data.length / (N * N);
      const lin = (v: number) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      const lum = (r: number, g: number, b: number) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      let wr = 0, wg = 0, wb = 0, ws = 0;
      for (let i = 0; i < N * N; i++) {
        const r = data[i * ch], g = data[i * ch + 1], b = data[i * ch + 2];
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b), s = mx ? (mx - mn) / mx : 0, w = s * s * (0.3 + mx / 255);
        wr += r * w; wg += g * w; wb += b * w; ws += w;
      }
      const [r, g, b] = ws > 0 ? [wr / ws, wg / ws, wb / ws] : [128, 128, 128];
      // hue + saturation of the accent as HSL; lightness is searched away from the paper's until contrast >= 4.5
      const mx = Math.max(r, g, b) / 255, mn = Math.min(r, g, b) / 255, d = mx - mn, l0 = (mx + mn) / 2;
      let h = 0;
      if (d) h = mx === r / 255 ? ((g - b) / 255 / d + (g < b ? 6 : 0)) : mx === g / 255 ? ((b - r) / 255 / d + 2) : ((r - g) / 255 / d + 4);
      const sat = d ? Math.max(0.3, Math.min(0.85, d / (1 - Math.abs(2 * l0 - 1)))) : 0;
      const hsl = (L: number) => {
        const a = sat * Math.min(L, 1 - L), f = (n: number) => { const k = (n + h * 2) % 12; return L - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
        return [f(0) * 255, f(8) * 255, f(4) * 255].map(Math.round) as [number, number, number];
      };
      const on = (paper: string, dir: 1 | -1) => {
        const [pr, pg, pb] = [1, 3, 5].map((i) => parseInt(paper.slice(i, i + 2), 16));
        const bg = lum(pr, pg, pb);
        let rgb = hsl(dir < 0 ? 0.2 : 0.85);
        for (let L = 0.5; L >= 0.08 && L <= 0.92; L += dir * 0.02) {
          const c = hsl(L), y = lum(...c);
          if ((Math.max(y, bg) + 0.05) / (Math.min(y, bg) + 0.05) >= 4.5) { rgb = c; break; }
        }
        return '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('');
      };
      return { light: on(tokens.modes.light.surface.hex, -1), dark: on(tokens.modes.dark.surface.hex, 1) };
    })().catch((e) => { console.warn('[media] signature ink skipped for', p, String(e).slice(0, 160)); return null; }));
  }
  return inkCache.get(p)!;
}

/**
 * Trace a transparent cutout into a pixel grid (rows of '#' and '.') — the silhouette of a real artifact, for
 * <Pictogram from="…">. Build-time only (sharp). `cols` cells across; rows follow the picture's shape.
 */
export async function traceAlpha(meta: ImageMetadata, cols: number, threshold = 110): Promise<string[]> {
  const p = pathOf(meta);
  if (!p) return [];
  const { default: sharp } = await import('sharp');
  const file = p.startsWith('/src/') ? `${(globalThis as any).process.cwd()}${p}` : p;
  const rows = Math.max(1, Math.round((cols * meta.height) / meta.width));
  const { data } = await sharp(file).ensureAlpha().resize(cols, rows, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
  const out: string[] = [];
  for (let r = 0; r < rows; r++) {
    let line = '';
    for (let c = 0; c < cols; c++) line += data[(r * cols + c) * 4 + 3] >= threshold ? '#' : '.';
    out.push(line);
  }
  // drop empty rows at the top and bottom
  while (out.length && !out[0].includes('#')) out.shift();
  while (out.length && !out[out.length - 1].includes('#')) out.pop();
  return out;
}
