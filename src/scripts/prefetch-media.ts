/**
 * Prefetch: land on the next page with its HTML and its first pictures already here.
 *
 * This replaces Astro's prefetch (astro.config: prefetch false). When a link to another page of the site is pointed
 * at for 90ms (mouse), focused (keyboard) or touched, the page's HTML is fetched at low priority into the normal HTTP
 * cache — the page transition's own fetch then reuses it — and the first two pictures of its <main> start downloading
 * with the same srcset/sizes the page will use. So the transition ends on loaded pictures instead of the loading HUD.
 * Once per URL. Skipped offline, with Save-Data or on a 2G connection.
 */
const warmed = new Set<string>();
const slow = () => { const c = (navigator as any).connection; return !!c && (c.saveData || /(^|-)2g$/.test(c.effectiveType ?? '')); };

function target(e: Event): URL | null {
  const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
  if (!a || a.target === '_blank' || a.hasAttribute('download') || a.dataset.astroPrefetch === 'false') return null;
  const u = new URL(a.href, location.href);
  if (u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search)) return null;
  u.hash = '';
  return warmed.has(u.href) ? null : u;
}

async function warm(u: URL) {
  if (warmed.has(u.href) || slow() || !navigator.onLine) return;
  warmed.add(u.href);
  try {
    const res = await fetch(u.href, { priority: 'low' } as RequestInit);
    if (!res.ok || !(res.headers.get('content-type') ?? '').includes('html')) return;
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    [...doc.querySelectorAll<HTMLImageElement>('main img[src]')].slice(0, 2).forEach((src) => {
      const i = new Image();
      i.decoding = 'async';
      (i as any).fetchPriority = 'low';
      const set = src.getAttribute('srcset');
      if (set) { i.sizes = src.getAttribute('sizes') ?? ''; i.srcset = set; }
      i.src = new URL(src.getAttribute('src')!, u).href;
    });
  } catch { /* offline or blocked: the page will simply load its pictures itself */ }
}

let t = 0;
document.addEventListener('pointerover', (e) => {
  if ((e as PointerEvent).pointerType !== 'mouse') return;
  const u = target(e);
  if (!u) return;
  clearTimeout(t);
  t = window.setTimeout(() => warm(u), 90);
});
document.addEventListener('pointerout', () => clearTimeout(t));
document.addEventListener('touchstart', (e) => { const u = target(e); if (u) warm(u); }, { passive: true });
document.addEventListener('focusin', (e) => { const u = target(e); if (u) warm(u); });
