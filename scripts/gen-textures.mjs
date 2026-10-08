// Bakes tileable cloud alpha and palette-colored tiles for <Atmosphere>.
// npm run textures refreshes the palette first. The browser moves these tiles without a full-screen CSS mask.
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// periodic value noise → fractal sum; tiles seamlessly because every octave wraps on its own lattice
function makeNoise(seed) {
  let s = seed >>> 0;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const tables = new Map();
  const lattice = (p) => { if (!tables.has(p)) tables.set(p, Float32Array.from({ length: p * p }, rnd)); return tables.get(p); };
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  return (x, y, period) => {
    const g = lattice(period), xi = Math.floor(x), yi = Math.floor(y), xf = fade(x - xi), yf = fade(y - yi);
    const at = (i, j) => g[((j % period) + period) % period * period + (((i % period) + period) % period)];
    const a = at(xi, yi), b = at(xi + 1, yi), c = at(xi, yi + 1), d = at(xi + 1, yi + 1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  };
}

async function bake(file, w, h, { seed, cells, octaves, gain, lift }) {
  const n = makeNoise(seed), px = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let v = 0, amp = 0.5, norm = 0;
    for (let o = 0; o < octaves; o++) {
      const p = cells * 2 ** o;
      v += amp * n((x / w) * p, (y / h) * p, p); norm += amp; amp *= 0.5;
    }
    v /= norm;
    const a = Math.max(0, Math.min(1, gain * v + lift));
    const i = (y * w + x) * 4;
    px[i] = px[i + 1] = px[i + 2] = 255; px[i + 3] = Math.round(a * 255);
  }
  const out = fileURLToPath(new URL(`../public/textures/${file}`, import.meta.url));
  await sharp(px, { raw: { width: w, height: h, channels: 4 } }).webp({ quality: 82, alphaQuality: 80 }).toFile(out);
  console.log('wrote', out);
}

await bake('cloud-a.webp', 320, 240, { seed: 7, cells: 3, octaves: 4, gain: 2.4, lift: -0.95 });
await bake('cloud-b.webp', 360, 270, { seed: 3, cells: 2, octaves: 3, gain: 2.1, lift: -0.8 });

const { modes, cats, themes = {} } = JSON.parse(readFileSync(fileURLToPath(new URL('../src/lib/tokens.json', import.meta.url)), 'utf8'));
async function tint(source, name, color) {
  const input = fileURLToPath(new URL(`../public/textures/${source}`, import.meta.url));
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const rgb = color.match(/[\da-f]{2}/gi).map((part) => parseInt(part, 16));
  for (let i = 0; i < data.length; i += 4) {
    data[i] = rgb[0]; data[i + 1] = rgb[1]; data[i + 2] = rgb[2];
  }
  const out = fileURLToPath(new URL(`../public/textures/${name}`, import.meta.url));
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).webp({ lossless: true }).toFile(out);
  console.log('wrote', out);
}
for (const mode of ['light', 'dark']) {
  await tint('cloud-a.webp', `cloud-a-${mode}.webp`, modes[mode].mist.hex);
  for (const cat of ['self', ...Object.keys(cats), ...Object.keys(themes)]) {
    await tint('cloud-b.webp', `cloud-b-${mode}-${cat}.webp`, modes[mode][cat === 'self' ? 'wash' : `${cat}-p`].hex);
  }
}
