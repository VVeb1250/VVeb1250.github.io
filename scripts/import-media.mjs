/**
 * npm run media — rebuild site pictures from the owner's originals (scripts/media-map.json).
 * Blur a face or crop in the original under _note/media-candidates/, run this, check the page: the site picture
 * (src/assets/works/<out>) is made again from it. Only listed pictures are touched; a missing original is reported
 * and its site picture is left as it is.
 *   node scripts/import-media.mjs                 originals relative to the repo root
 *   node scripts/import-media.mjs --from <dir>    originals relative to <dir> (a copy of the repo's _note elsewhere)
 *   node scripts/import-media.mjs cesca/          only the outputs that start with this
 */
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const args = process.argv.slice(2);
const fi = args.indexOf('--from');
const root = fi >= 0 ? args.splice(fi, 2)[1] : process.cwd();
const only = args[0] ?? '';
const { items } = JSON.parse(readFileSync(new URL('./media-map.json', import.meta.url), 'utf8'));
let done = 0, missing = 0;
for (const it of items.filter((x) => x.out.startsWith(only))) {
  const src = join(root, it.from);
  if (!existsSync(src)) { console.warn(`missing original: ${it.from} (kept src/assets/works/${it.out})`); missing++; continue; }
  const out = join(process.cwd(), 'src/assets/works', it.out);
  mkdirSync(dirname(out), { recursive: true });
  let img = sharp(src).rotate();
  if (it.crop) { const [left, top, width, height] = it.crop; img = img.extract({ left, top, width, height }); }
  await img.resize({ width: it.width ?? 2000, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out);
  console.log(`${it.out} ← ${it.from}`); done++;
}
console.log(`${done} made, ${missing} missing`);
