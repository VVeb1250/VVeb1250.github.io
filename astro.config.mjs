// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { fontsource } from './scripts/fontsource.mjs';

// Deployed as a GitHub user site: https://vveb1250.github.io (repo: VVeb1250.github.io), so there is no `base`.
// If this ever moves to a project repo, set `base: '/<repo>/'` and every link helper in src/lib/i18n.ts keeps working.
export default defineConfig({
  site: 'https://vveb1250.github.io',
  // v7 default is 'jsx' (strips spaces between inline elements). `true` keeps rendering identical to the source.
  compressHTML: true,
  trailingSlash: 'ignore',
  // Prefetch is done by src/scripts/prefetch-media.ts (the page AND its first pictures, one download each), not by
  // Astro's <link rel=prefetch>, whose copy a later fetch() cannot reuse — the HTML would be downloaded twice.
  prefetch: false,
  integrations: [mdx()],
  // Pre-bundle Lenis when the dev server starts, instead of discovering it on the first page load (a mid-session
  // re-optimize is what leaves an open tab with 504 "Outdated Optimize Dep" → no page script at all).
  vite: { optimizeDeps: { include: ['lenis'] } },
  // Self-hosted fonts (spec §9 families) from the Fontsource packages in package.json — see scripts/fontsource.mjs.
  // PageShell renders one <Font> per family and preloads only what the page's language shows first.
  // Each family carries only the script it is used for (unicode-range), so base.css can stack them:
  //   body:    Plex Sans Thai (Thai only) → IBM Plex Sans JP (Google, JA pages) → Plex Sans (Latin) + its metric-matched fallback
  //   display: Saira (Latin) → Bai Jamjuree (Thai only) → IBM Plex Sans JP → system
  // Only the LAST family of a stack may carry fallbacks (fallbacks end in a generic family, and a generic in the middle
  // of a stack would catch Thai / Japanese before the real font). Japanese is not self-hosted: its ~360 unicode-range
  // faces would be inlined into every page (~380 KB); Google's stylesheet is external and cached, and only JA pages load it.
  fonts: [
    { name: 'Saira', cssVariable: '--font-saira', provider: fontsource('@fontsource-variable/saira', { files: ['wdth.css'] }), weights: ['100 900'], styles: ['normal'], subsets: ['latin', 'latin-ext'], fallbacks: [], optimizedFallbacks: false },
    { name: 'Bai Jamjuree', cssVariable: '--font-bai', provider: fontsource('@fontsource/bai-jamjuree'), weights: [500, 600, 700], styles: ['normal'], subsets: ['thai'], fallbacks: [], optimizedFallbacks: false },
    { name: 'IBM Plex Sans Thai', cssVariable: '--font-plex-th', provider: fontsource('@fontsource/ibm-plex-sans-thai'), weights: [400, 500, 600], styles: ['normal'], subsets: ['thai'], fallbacks: [], optimizedFallbacks: false },
    { name: 'IBM Plex Sans', cssVariable: '--font-plex', provider: fontsource('@fontsource-variable/ibm-plex-sans', { files: ['wght.css'] }), weights: ['100 700'], styles: ['normal'], subsets: ['latin', 'latin-ext'], fallbacks: ['sans-serif'] },
    { name: 'IBM Plex Mono', cssVariable: '--font-mono', provider: fontsource('@fontsource/ibm-plex-mono'), weights: [400, 500, 600], styles: ['normal'], subsets: ['latin', 'latin-ext'], fallbacks: ['monospace'] }
  ],

  // Retired pages (static build → a meta-refresh page): /lab (Notes) went when Memory Base and WhipUI got their own work
  // pages; /archive became /timeline (everything by year, with competitions and teaching).
  redirects: {
    '/lab': '/work/', '/th/lab': '/th/work/', '/ja/lab': '/ja/work/',
    '/archive': '/timeline/', '/th/archive': '/th/timeline/', '/ja/archive': '/ja/timeline/'
  },

  devToolbar: { enabled: false }
});
