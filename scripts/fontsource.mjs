// A font provider for Astro's Fonts API that serves Fontsource packages straight from node_modules.
// Why: fonts are self-hosted (no Google request at runtime, no CDN at build — the build machine only needs npm),
// and Astro still does the useful part: hashed files, <link rel="preload"> per page, fallback metrics (less layout
// shift while a font arrives). Fontsource's own CSS is the source of truth for files, weights and unicode ranges.
//
//   fontsource('@fontsource/ibm-plex-mono')                          static: reads <weight>.css for each weight
//   fontsource('@fontsource-variable/saira', { files: ['wdth.css'] }) variable: reads the given axis file
//   fontsource('@fontsource/ibm-plex-sans-jp', { subset: /^\[\d+\]$/ }) keep subsets matching this instead of `subsets`
//
// Each face gets meta.subset (e.g. 'latin', 'thai', '[12]'), so <Font preload={[{ subset: 'thai' }]}> works.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const FACE = /\/\*\s*([^*]+?)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g;

/** @param {string} pkg @param {{ files?: string[], subset?: RegExp }} [o] */
export function fontsource(pkg, o = {}) {
  const dir = dirname(require.resolve(`${pkg}/package.json`));
  const slug = pkg.split('/').pop();
  return {
    name: 'fontsource-local',
    config: { pkg, files: o.files ?? null, subset: o.subset?.source ?? null },
    /** @param {{ weights: string[], styles: string[], subsets: string[] }} q */
    resolveFont(q) {
      const files = o.files ?? q.weights.map((w) => `${w}.css`);
      const fonts = [];
      for (const f of files) {
        const css = readFileSync(join(dir, f), 'utf8');
        for (const [, label, body] of css.matchAll(FACE)) {
          const get = (k) => body.match(new RegExp(`${k}:\\s*([^;]+);`))?.[1].trim();
          const woff2 = get('src')?.match(/url\(\.\/([^)]+\.woff2)\)/)?.[1];
          if (!woff2) continue;
          // label: "<slug>-<subset>-<weight|axis>-<style>", e.g. "saira-latin-ext-wdth-normal", "ibm-plex-sans-jp-[3]-400-normal"
          const subset = label.slice(slug.length + 1).replace(/-[^-]+-(normal|italic)$/, '');
          const style = get('font-style') ?? 'normal';
          if (o.subset ? !o.subset.test(subset) : !q.subsets.includes(subset)) continue;
          if (!q.styles.includes(style)) continue;
          fonts.push({
            src: [{ url: join(dir, woff2), format: 'woff2' }],
            weight: get('font-weight'),
            style,
            stretch: get('font-stretch'),
            unicodeRange: get('unicode-range')?.split(',').map((s) => s.trim()),
            meta: { subset }
          });
        }
      }
      return { fonts };
    }
  };
}
