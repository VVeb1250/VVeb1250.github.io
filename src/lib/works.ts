/** Helpers over the `works` collection used by showcase and story components. */
import { getEntry, getCollection, type CollectionEntry } from 'astro:content';
import { href, tx, type Lang, type L } from './i18n';
import { META_LABELS, EVENT_KINDS } from './vocab';

export type Work = CollectionEntry<'works'>;

export async function work(id: string): Promise<Work> {
  const w = await getEntry('works', id);
  if (!w) throw new Error(`[works] no work "${id}" in src/content/works/`);
  return w;
}

export async function allWorks(): Promise<Work[]> {
  const list = await getCollection('works');
  return list.sort((a, b) => b.data.year - a.data.year || a.data.title.localeCompare(b.data.title));
}

/** Where a work's page lives. `base` lets demo pages use their own route (default '/work/'). */
export function workHref(id: string, lang: Lang, base = '/work/'): string {
  return href(`${base.replace(/\/?$/, '/')}${id}/`, lang);
}

/** The color context of an entry's own page: its theme when it has one, else its kind of work. */
export const ctxOf = (w: Work) => w.data.theme ?? w.data.cat;

/** The route an entry's page lives under: works and drawing under /work/, competitions and teaching under /timeline/. */
export const isEvent = (w: Work): boolean => EVENT_KINDS.includes(w.data.kind);
export const baseOf = (w: Work): string => (isEvent(w) ? '/timeline/' : '/work/');

/** Event pages (kind ≠ work, `page: true`) in reading order — ↑ ↓ and Next on /timeline/<id>/. */
export const EVENT_ORDER = ['icpc', 'cesca', 'aise'];

/** Where a Timeline row goes: its own page, or the part of another page it `opens`; undefined = it opens in place. */
export function entryHref(w: Work, lang: Lang): string | undefined {
  if (w.data.page) return workHref(w.id, lang, baseOf(w));
  return w.data.opens ? href(w.data.opens, lang) : undefined;
}

/** Sort key and label parts of an entry's place in time (`date` when known, else just the year). */
export function when(w: Work): { y: number; m: number | null; key: string } {
  const [y, m] = (w.data.date ?? String(w.data.year)).split('-').map(Number);
  return { y, m: m ?? null, key: w.data.date ?? `${w.data.year}` };
}

/** Every entry, newest first: by year, then by month when known (an entry with only a year sits after the dated
 *  ones of that year — it could be any time in it), then by title. */
export async function timeline(): Promise<Work[]> {
  const list = await getCollection('works');
  return list.sort((a, b) => {
    const A = when(a), B = when(b);
    return B.y - A.y || (B.m ?? 0) - (A.m ?? 0) || a.data.title.localeCompare(b.data.title);
  });
}

export function metaLabel(k: string | L, lang: Lang): string {
  return typeof k === 'string' && META_LABELS[k] ? tx(META_LABELS[k], lang) : tx(k as L, lang);
}

/** "[01]|Journey of Vaja|GAME · UNITY 6 · 2025" for the deeper-transition label bar. */
export function vtLabel(w: Work): string {
  return [w.data.idx ? `[${w.data.idx}]` : '', w.data.title, `${w.data.type} · ${w.data.year}`].join('|');
}
