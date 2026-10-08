/** Site-wide identity and navigation. Facts only — every value here was stated by the owner. */
import type { L } from './i18n';

export const SITE = {
  name: { en: 'Teethawat Kumying', th: 'ธีร์ธวัช คำยิ่ง', ja: 'ティータワット・カムイン' } as L,
  /** The header's name mark (owner, 2026-10-08): the first name; pointed at, it turns into his handwriting (public/hand/). */
  first: { en: 'Teethawat', th: 'ธีร์ธวัช', ja: 'ティータワット' } as L,
  handle: 'Web',
  /** Meta description for pages that give none (facts as on the CV). TH / JA fall back to EN (I-51). */
  description: 'Teethawat Kumying, Computer Engineering student at Khon Kaen University, looking for an AI engineering internship from April 2027. Selected work, timeline and contact.',
  email: 'supimol.web@gmail.com',
  updated: '2026-09',
  /** When he can start an internship (Facts: availability, owner 2026-10-08). JA still falls back to EN (I-51). */
  available: { en: 'From 10 April 2027 until the Khon Kaen University semester starts (dates estimated) · on-site or remote', th: 'ตั้งแต่ 10 เม.ย. 2027 จนถึงวันเปิดภาคเรียนของ มข. (วันที่เป็นการประมาณ) · on-site หรือ remote', ja: '2027年4月10日から、Khon Kaen University の学期開始まで（日付は予定）· オンサイトまたはリモート' } as L,
  /** The CV on the site: the AI engineering one-pager (owner's choice, 2026-10-08), copied from cv/cv-ai-1page.pdf. Path under public/. */
  cv: 'cv/Teethawat-Kumying-CV.pdf',
  links: [
    { kind: 'github', label: 'GitHub', url: 'https://github.com/VVeb1250', note: 'github.com/VVeb1250' },
    { kind: 'pixiv', label: 'Pixiv', url: 'https://www.pixiv.net/en/users/116719673', note: 'WhipForAWeeb' }
  ],
  /** Shown with its picture on About (PortraitSwap); not in the contact list. */
  instagram: { label: 'Instagram', url: 'https://www.instagram.com/web_1250/', note: 'web_1250' }
} as const;

/** Main navigation: WORK · ABOUT · TIMELINE. The name mark goes Home. `href` is locale-free; components add the /th or /ja prefix. */
export const NAV: { key: string; label: L; href: string }[] = [
  { key: 'work', label: { en: 'Work', th: 'ผลงาน', ja: '作品' }, href: '/work/' },
  { key: 'about', label: { en: 'About', th: 'เกี่ยวกับ', ja: '概要' }, href: '/about/' },
  { key: 'timeline', label: { en: 'Timeline', th: 'ไทม์ไลน์', ja: '年表' }, href: '/timeline/' }
];

/** The Work page's showcase, in reel order. Home counts it; each id needs a panel in src/components/showcase/ (PANELS in the Work page). */
export const SHOWCASE = ['vaja', 'z80', 'oss', 'msu', 'memory', 'whipui', 'yasm', 'z80prep', 'drawing'] as const;
export type ShowcaseId = (typeof SHOWCASE)[number];

/** Works that have their own page, in reading order (↑ ↓, Next project). Must match `page: true` in their YAML. */
export const WORK_ORDER = ['vaja', 'z80', 'oss', 'msu', 'memory', 'whipui', 'yasm', 'drawing'];
