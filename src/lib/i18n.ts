/**
 * Languages, localized strings and locale-aware paths.
 *
 * Routing: English lives at the root (/kit/), Thai and Japanese under a prefix (/th/kit/, /ja/kit/).
 * Every page file sits in src/pages/[...locale]/ and calls `localePaths()` in getStaticPaths,
 * so one file renders all three languages.
 *
 * Components never take a `lang` prop: they read it from the URL with `langOf(Astro.url)`.
 */
export const LOCALES = ['en', 'th', 'ja'] as const;
export type Lang = (typeof LOCALES)[number];

/** A string that may differ per language. A plain string means "same in every language". */
export type L = string | ({ en: string } & Partial<Record<'th' | 'ja', string>>);

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function langOf(url: URL): Lang {
  const seg = url.pathname.slice(BASE.length).split('/')[1];
  return seg === 'th' || seg === 'ja' ? seg : 'en';
}

/** Resolve a localized value; falls back to English. */
export function tx(v: L | undefined | null, lang: Lang): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  return v[lang] ?? v.en;
}

/** True when `v` has no text of its own for `lang` (the English fallback is shown). */
export function isFallback(v: L | undefined | null, lang: Lang): boolean {
  return v != null && typeof v === 'object' && lang !== 'en' && !v[lang];
}

/** getStaticPaths helper for src/pages/[...locale]/ pages. */
export function localePaths<P extends Record<string, string | undefined>>(extra: P[] = [{} as P]) {
  return LOCALES.flatMap((lang) => extra.map((p) => ({ params: { ...p, locale: lang === 'en' ? undefined : lang } })));
}

/** '/kit/' + 'th' → '/th/kit/' (respects `base`). */
export function href(path: string, lang: Lang): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${lang === 'en' ? '' : `/${lang}`}${clean}`;
}

/** The same page in another language. */
export function swapLang(url: URL, to: Lang): string {
  const from = langOf(url);
  let rest = url.pathname.slice(BASE.length);
  if (from !== 'en') rest = rest.slice(from.length + 1) || '/';
  return href(rest, to) + url.hash;
}

/** Fixed interface words. Content never goes here — it belongs in src/content. */
export const UI = {
  en: {
    skip: 'Skip to content', menu: 'Main', menuOpen: 'Menu', menuClose: 'Close', work: 'Work', experiments: 'Experiments', about: 'About', archive: 'Archive',
    language: 'Language', theme: 'Theme', light: 'Light', dark: 'Dark', system: 'Auto',
    open: 'Open project', next: 'Next project', prev: 'Previous project', all: 'All', allWork: 'All work',
    scroll: 'Scroll', related: 'Related work', outcome: 'Outcome', current: 'Current state', learned: 'What I learned',
    question: 'Question', now: 'Now', lookingFor: 'Looking for', copy: 'Copy', copied: 'Copied', play: 'Play', pause: 'Pause',
    frame: 'Frame', before: 'Before', after: 'After', source: 'Source', draft: 'Draft · owner must confirm',
    fig: 'FIG.', rule: 'Rule', note: 'Note', filter: 'Filter', step: 'Step', contact: 'Contact', updated: 'Last updated'
  },
  th: {
    skip: 'ข้ามไปที่เนื้อหา', menu: 'เมนูหลัก', menuOpen: 'เมนู', menuClose: 'ปิด', work: 'ผลงาน', experiments: 'การทดลอง', about: 'เกี่ยวกับ', archive: 'คลังงาน',
    language: 'ภาษา', theme: 'ธีม', light: 'สว่าง', dark: 'มืด', system: 'อัตโนมัติ',
    open: 'เปิดดูงาน', next: 'งานถัดไป', prev: 'งานก่อนหน้า', all: 'ทั้งหมด', allWork: 'ผลงานทั้งหมด',
    scroll: 'เลื่อน', related: 'งานที่เกี่ยวข้อง', outcome: 'ผลลัพธ์', current: 'สถานะตอนนี้', learned: 'สิ่งที่ได้เรียนรู้',
    question: 'คำถาม', now: 'ตอนนี้', lookingFor: 'กำลังหา', copy: 'คัดลอก', copied: 'คัดลอกแล้ว', play: 'เล่น', pause: 'หยุด',
    frame: 'เฟรม', before: 'ก่อน', after: 'หลัง', source: 'ที่มา', draft: 'ร่าง · เจ้าของต้องยืนยัน',
    fig: 'FIG.', rule: 'กฎ', note: 'โน้ต', filter: 'กรอง', step: 'ขั้น', contact: 'ติดต่อ', updated: 'อัปเดตล่าสุด'
  },
  ja: {
    skip: '本文へスキップ', menu: 'メイン', menuOpen: 'メニュー', menuClose: '閉じる', work: '作品', experiments: '実験', about: '概要', archive: 'アーカイブ',
    language: '言語', theme: 'テーマ', light: 'ライト', dark: 'ダーク', system: '自動',
    open: 'プロジェクトを見る', next: '次のプロジェクト', prev: '前のプロジェクト', all: 'すべて', allWork: 'すべての作品',
    scroll: 'スクロール', related: '関連作品', outcome: '結果', current: '現在の状況', learned: '学んだこと',
    question: '問い', now: 'いま', lookingFor: '募集', copy: 'コピー', copied: 'コピーしました', play: '再生', pause: '停止',
    frame: 'フレーム', before: '前', after: '後', source: '出典', draft: '下書き · 本人の確認が必要',
    fig: 'FIG.', rule: 'ルール', note: 'メモ', filter: '絞り込み', step: 'ステップ', contact: '連絡先', updated: '最終更新'
  }
} as const;
export type UIKey = keyof (typeof UI)['en'];
export const t = (k: UIKey, lang: Lang): string => UI[lang][k] ?? UI.en[k];
