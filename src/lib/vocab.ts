/**
 * Closed vocabularies. Content files and component props are validated against these,
 * so a typo (or an invented category) fails the build instead of shipping.
 */
import type { L } from './i18n';

/** Kind of work → Tier 3 color. Hues and mood live in scripts/tokens.config.mjs. */
export const CATS = ['game', 'ai', 'dev', 'tool', 'sys', 'ui', 'hw'] as const;
export type Cat = (typeof CATS)[number];
/** Project themes: every work or event with pictures of its own (its hues live in scripts/tokens.config.mjs THEMES —
 *  keep the two lists the same). Its page and sections use the theme; lists keep its kind's color. */
export const THEMES = ['icpc24', 'icpc25', 'cesca20', 'cesca21', 'vaja', 'z80', 'yasm', 'msu', 'aise', 'drawing'] as const;
export type Theme = (typeof THEMES)[number];
/** `self` = the owner's own context (identity blue); used outside any single work. A theme is a work's own context. */
export type CatOrSelf = Cat | 'self' | Theme;

export const CAT_LABEL: Record<Cat, L> = {
  game: { en: 'Game', th: 'เกม', ja: 'ゲーム' },
  ai: { en: 'AI systems', th: 'ระบบ AI', ja: 'AIシステム' },
  dev: { en: 'Dev tools', th: 'เครื่องมือนักพัฒนา', ja: '開発ツール' },
  tool: { en: 'Agent tooling', th: 'เครื่องมือ agent', ja: 'エージェントの道具' },
  sys: { en: 'Systems & backend', th: 'ระบบและ backend', ja: 'システムとバックエンド' },
  ui: { en: 'Interfaces & motion', th: 'interface และ motion', ja: 'インターフェースとモーション' },
  hw: { en: 'Embedded', th: 'Embedded', ja: '組み込み' }
};

/** What an entry is. `work` and `art` (the owner's drawing) live under /work/; a competition or teaching role is an
 *  event and, with a page, lives under /timeline/. Events and art use the owner's own color (`cat: self`) unless one kind
 *  of work fits them better. */
export const KINDS = ['work', 'art', 'competition', 'teaching'] as const;
export type Kind = (typeof KINDS)[number];
export const EVENT_KINDS: Kind[] = ['competition', 'teaching'];
export const KIND_LABEL: Record<Kind, L> = {
  work: { en: 'Work', th: 'ผลงาน', ja: '作品' },
  art: { en: 'Drawing', th: 'วาดรูป', ja: '絵' },
  competition: { en: 'Competition', th: 'การแข่งขัน', ja: '大会' },
  teaching: { en: 'Teaching', th: 'สอน', ja: '指導' }
};

/** Work / experiment state. Rendered by <StatusTag>. */
export const STATUSES = ['ACTIVE', 'WIP', 'COMPLETED', 'VALIDATED', 'FAILED', 'RETIRED', 'ARCHIVED', 'REVISITING', 'NOT STARTED'] as const;
export type Status = (typeof STATUSES)[number];
export const STATUS_LABEL: Record<Status, L> = {
  ACTIVE: { en: 'ACTIVE', th: 'กำลังทำ', ja: 'ACTIVE' }, WIP: { en: 'WIP', th: 'ยังทำไม่เสร็จ', ja: 'WIP' }, COMPLETED: { en: 'COMPLETED', th: 'เสร็จแล้ว', ja: 'COMPLETED' },
  VALIDATED: { en: 'VALIDATED', th: 'ตรวจแล้ว', ja: 'VALIDATED' }, FAILED: { en: 'FAILED', th: 'ไม่สำเร็จ', ja: 'FAILED' }, RETIRED: { en: 'RETIRED', th: 'ปลดระวาง', ja: 'RETIRED' },
  ARCHIVED: { en: 'ARCHIVED', th: 'เก็บไว้', ja: 'ARCHIVED' }, REVISITING: { en: 'REVISITING', th: 'กลับมาดูอีกครั้ง', ja: 'REVISITING' },
  'NOT STARTED': { en: 'NOT STARTED', th: 'ยังไม่เริ่ม', ja: '未着手' }
};

/**
 * Plate shapes for <Stage>/<Plate>: three bars with parallel diagonal ends.
 * Pick by the object's main line — the bars step along it, the cut runs against it:
 *   step-right  object leans / flows down-right (a character facing right, a pipeline left→right)
 *   step-left   object leans / flows down-left
 *   center      compact, upright objects (a device, a board seen from above)
 *   wide        long flat objects (a UI screenshot, a timeline, a strip)
 */
export const PLATES = ['step-right', 'step-left', 'center', 'wide'] as const;
export type Plate = (typeof PLATES)[number];

/** Story recipes (docs/STORY-RECIPES.md). A story's frontmatter names the one it follows. */
export const RECIPES = ['art-led', 'build-log', 'assumption-broke', 'constraint-product', 'tool-in-use', 'scope-lesson', 'free'] as const;
export type Recipe = (typeof RECIPES)[number];

/** External link kinds for <LinkCard> and work `links`. */
export const LINK_KINDS = ['github', 'npm', 'marketplace', 'live', 'pixiv', 'video', 'paper', 'other'] as const;
export type LinkKind = (typeof LINK_KINDS)[number];

/** Labels for common `meta` keys in work files. Use the key (e.g. `k: role`); any other text is shown as written. */
export const META_LABELS: Record<string, L> = {
  type: { en: 'Type', th: 'ประเภท', ja: '種類' },
  role: { en: 'My part', th: 'ส่วนที่ทำ', ja: '担当' },
  engine: { en: 'Engine', th: 'Engine', ja: 'エンジン' },
  when: { en: 'When', th: 'ช่วงเวลา', ja: '時期' },
  result: { en: 'Result', th: 'ผลลัพธ์', ja: '結果' },
  team: { en: 'Team', th: 'ทีม', ja: 'チーム' },
  commits: { en: 'Commits', th: 'Commit', ja: 'コミット' },
  stack: { en: 'Stack', th: 'เทคโนโลยี', ja: '技術' },
  built: { en: 'Built', th: 'ทำเมื่อ', ja: '制作' },
  install: { en: 'Install', th: 'ติดตั้ง', ja: 'インストール' },
  hosts: { en: 'Hosts', th: 'ใช้ได้กับ', ja: '対応ホスト' },
  host: { en: 'First host', th: 'Host แรก', ja: '最初のホスト' },
  versions: { en: 'Versions', th: 'เวอร์ชัน', ja: 'バージョン' },
  origin: { en: 'Origin', th: 'ที่มา', ja: '出発点' },
  installs: { en: 'Installs', th: 'ยอดติดตั้ง', ja: 'インストール数' },
  status: { en: 'Status', th: 'สถานะ', ja: '状況' },
  topic: { en: 'Topic', th: 'หัวข้อ', ja: 'テーマ' },
  where: { en: 'Where', th: 'ที่', ja: '場所' },
  staff: { en: 'Staff', th: 'ทีมงาน', ja: 'スタッフ' }
};

/** Free tags on works, used by ArchiveFilter and for picking evidence. */
export const TAGS = ['coursework', 'team', 'solo', 'oss', 'hackathon', 'startup', 'lab'] as const;
export type Tag = (typeof TAGS)[number];

/** The recurring process (Implementation Context): IDEA / FRICTION → … → KEEP THE TRACE. Rendered by <ProcessLine>. */
export const PROCESS: { key: string; label: L }[] = [
  { key: 'idea', label: { en: 'Idea / friction', th: 'ไอเดีย / ความติดขัด', ja: 'アイデア / 不便' } },
  { key: 'question', label: { en: 'Would this work?', th: 'จะเวิร์กไหม?', ja: 'うまくいく?' } },
  { key: 'build', label: { en: 'Build', th: 'สร้าง', ja: '作る' } },
  { key: 'use', label: { en: 'Use / test', th: 'ใช้ / ทดสอบ', ja: '使う / 試す' } },
  { key: 'decide', label: { en: 'Keep / change / kill', th: 'คงไว้ / ปรับเปลี่ยน / ยุติ', ja: '残す / 変える / やめる' } },
  { key: 'trace', label: { en: 'Keep the trace', th: 'เก็บร่องรอย', ja: '跡を残す' } }
];
export const VERDICTS = ['keep', 'change', 'kill', 'open'] as const;
export type Verdict = (typeof VERDICTS)[number];
export const VERDICT_LABEL: Record<Verdict, L> = {
  keep: { en: 'KEEP', th: 'คงไว้', ja: '残す' },
  change: { en: 'CHANGE', th: 'ปรับเปลี่ยน', ja: '変える' },
  kill: { en: 'KILL', th: 'ยุติ', ja: 'やめる' },
  open: { en: 'OPEN', th: 'ยังไม่ตัดสิน', ja: '未決' }
};

/** Who did the work, for <AttributionBlock>. */
export const ACTORS = ['me', 'team', 'ai', 'upstream', 'course'] as const;
export type Actor = (typeof ACTORS)[number];
export const ACTOR_LABEL: Record<Actor, L> = {
  me: { en: 'Me', th: 'ผม', ja: '自分' },
  team: { en: 'Team', th: 'ทีม', ja: 'チーム' },
  ai: { en: 'AI', th: 'AI', ja: 'AI' },
  upstream: { en: 'Upstream', th: 'โปรเจกต์ต้นทาง', ja: 'アップストリーム' },
  course: { en: 'Course', th: 'วิชา', ja: '授業' }
};

/** Archive filter groups (Implementation Context: All · Game · AI · Tools · Systems · Embedded · Coursework · Archived/Failed). Edit freely. */
export const FILTERS: { key: string; label: L; cats?: Cat[]; tags?: Tag[]; statuses?: Status[] }[] = [
  { key: 'all', label: { en: 'All', th: 'ทั้งหมด', ja: 'すべて' } },
  { key: 'game', label: { en: 'Game', th: 'เกม', ja: 'ゲーム' }, cats: ['game'] },
  { key: 'ai', label: { en: 'AI', th: 'AI', ja: 'AI' }, cats: ['ai'] },
  { key: 'tools', label: { en: 'Tools', th: 'เครื่องมือ', ja: 'ツール' }, cats: ['dev', 'tool', 'ui'] },
  { key: 'systems', label: { en: 'Systems', th: 'ระบบ', ja: 'システム' }, cats: ['sys'] },
  { key: 'embedded', label: { en: 'Embedded', th: 'Embedded', ja: '組み込み' }, cats: ['hw'] },
  { key: 'coursework', label: { en: 'Coursework', th: 'งานวิชา', ja: '授業' }, tags: ['coursework'] },
  { key: 'closed', label: { en: 'Retired / failed', th: 'เลิกแล้ว / ไม่สำเร็จ', ja: '引退 / 失敗' }, statuses: ['ARCHIVED', 'RETIRED', 'FAILED'] }
];

/** The Timeline's chips: a row shows when its kind, category, tag or status is in the chip's lists. */
export const TIMELINE_FILTERS: { key: string; label: L; kinds?: Kind[]; cats?: Cat[]; tags?: Tag[]; statuses?: Status[] }[] = [
  { key: 'all', label: { en: 'All', th: 'ทั้งหมด', ja: 'すべて' } },
  { key: 'competitions', label: { en: 'Competitions', th: 'การแข่งขัน', ja: '大会' }, kinds: ['competition'], tags: ['hackathon'] },
  { key: 'teaching', label: { en: 'Teaching', th: 'สอน', ja: '指導' }, kinds: ['teaching'] },
  { key: 'drawing', label: { en: 'Drawing', th: 'วาดรูป', ja: '絵' }, kinds: ['art'] },
  { key: 'game', label: { en: 'Game', th: 'เกม', ja: 'ゲーム' }, cats: ['game'] },
  { key: 'ai', label: { en: 'AI', th: 'AI', ja: 'AI' }, cats: ['ai'] },
  { key: 'tools', label: { en: 'Tools', th: 'เครื่องมือ', ja: 'ツール' }, cats: ['dev', 'tool', 'ui'] },
  { key: 'systems', label: { en: 'Systems · embedded', th: 'ระบบ · embedded', ja: 'システム · 組み込み' }, cats: ['sys', 'hw'] },
  { key: 'coursework', label: { en: 'Coursework', th: 'งานวิชา', ja: '授業' }, tags: ['coursework'] },
  { key: 'closed', label: { en: 'Retired / archived', th: 'เลิกแล้ว / เก็บแล้ว', ja: '引退 / 保管' }, statuses: ['ARCHIVED', 'RETIRED', 'FAILED'] }
];
