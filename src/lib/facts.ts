/**
 * Facts that appear on more than one page — edit them here once.
 * Every value comes from _note/portfolio-facts.md (section in each comment) or the linked source.
 * Wording follows the owner's voice (Story §0.3): plain, short, no claims about what it proves.
 */
import type { L } from './i18n';

/** OSS contributions (Facts §5). `short` is the one-liner used on Home and the Work reel; the work page tells the full story. */
/** `diff`: the merged PR's size as GitHub reports it (the whole PR, maintainer corrections included) — checked 2026-10-08. */
export type OssRef = { ref: string; repo: string; kind: 'issue' | 'pr'; url: string; merged: boolean; state: L; short: L; diff?: { add: number; del: number; files: number } };
export const OSS_REFS: OssRef[] = [
  { ref: '#98', repo: 'AgentsMesh', kind: 'issue', merged: false, url: 'https://github.com/sampleXbro/agentsmesh/issues/98', state: { en: 'closed · completed', th: 'ปิดแล้ว · สำเร็จ', ja: 'クローズ · 完了' },
    short: { en: 'An edit to generated AGENTS.md still passed check. I reproduced it step by step.', th: 'ผมแก้ไข AGENTS.md ที่ generate แล้ว แต่ check ยังผ่านอยู่ และผมทำซ้ำขั้นตอนนี้ได้', ja: 'AGENTS.md の生成ファイルを編集しても、check は引き続き通過しました。手順を追って再現しました。' } },
  { ref: '#99', repo: 'AgentsMesh', kind: 'pr', merged: false, url: 'https://github.com/sampleXbro/agentsmesh/pull/99', state: { en: 'closed · not merged', th: 'ปิดแล้ว · ไม่ได้ merge', ja: 'クローズ · 未マージ' },
    short: { en: 'The maintainer kept their own design for check and asked for one part of mine as a follow-up.', th: 'maintainer คงดีไซน์ของตัวเองไว้สำหรับ check และขอให้แยกส่วนหนึ่งของผมไปทำเป็น follow-up', ja: 'メンテナーは check に独自の設計を残し、私の提案の一部を今後の作業として依頼しました。' } },
  { ref: '#102', repo: 'AgentsMesh', kind: 'pr', merged: true, url: 'https://github.com/sampleXbro/agentsmesh/pull/102', state: { en: 'merged · 21 Jul 2026', th: 'merged · 21 ก.ค. 2026', ja: 'マージ済み · 2026年7月21日' }, diff: { add: 666, del: 543, files: 57 },
    short: { en: 'The follow-up the maintainer asked for: a read-only check that finds generated files gone stale.', th: 'follow-up ที่ maintainer ขอให้ทำ คือ check แบบอ่านอย่างเดียวที่ตรวจหาไฟล์ generate ที่ค้างอยู่', ja: 'メンテナーが依頼したフォローアップ：生成ファイルの古さを検出する読み取り専用の check。' } },
  { ref: '#28', repo: 'ai-config-sync-manager', kind: 'pr', merged: true, url: 'https://github.com/slash9494/ai-config-sync-manager/pull/28', state: { en: 'merged · 9 Jul 2026', th: 'merged · 9 ก.ค. 2026', ja: 'マージ済み · 2026年7月9日' }, diff: { add: 68, del: 19, files: 5 },
    short: { en: 'On Windows, backups went to the wrong place. Fixed, with regression tests.', th: 'บน Windows backup ถูกเก็บผิดที่ ผมแก้ไขแล้วและเพิ่ม regression test', ja: 'Windows でバックアップが誤った場所に保存されていました。修正し、回帰テストを追加しました。' } },
  { ref: '#878', repo: 'context-mode', kind: 'issue', merged: false, url: 'https://github.com/mksglu/context-mode/issues/878', state: { en: 'open · root cause found', th: 'เปิดอยู่ · เจอสาเหตุแล้ว', ja: '未解決 · 根本原因を特定' },
    short: { en: 'Oversized Markdown paragraphs slipped past the chunk cap. I traced why; other users reproduced it later.', th: 'paragraph Markdown ที่ยาวเกินไปหลุดผ่าน chunk cap ผมตามหาสาเหตุไว้ ต่อมาผู้ใช้คนอื่นก็ทำซ้ำได้', ja: '長すぎる Markdown の段落が chunk 上限を通過していました。原因を追い、後に他のユーザーも再現しました。' } }
];
export const oss = (ref: string): OssRef => {
  const r = OSS_REFS.find((x) => x.ref === ref);
  if (!r) throw new Error(`[facts] no OSS ref ${ref}`);
  return r;
};

/** Memory Base system sketch (Facts §4.1) — a sketch, not the final architecture. Used by the Work reel and the notes page. */
export const MEMORY_SKETCH = {
  caption: { en: 'Memory Base and its harness', th: 'Memory Base กับ harness', ja: 'Memory Baseとハーネス' } as L,
  note: { en: 'System sketch — not the final architecture.', th: 'ภาพร่างของระบบ — ยังไม่ใช่ architecture สุดท้าย', ja: 'システムのスケッチ — 最終的な構成ではない。' } as L,
  nodes: [
    { id: 'cc', col: 0, label: 'Claude Code', sub: { en: 'HOST', th: 'HOST', ja: 'ホスト' } as L },
    { id: 'cx', col: 0, label: 'Codex', sub: { en: 'READ CLIENT', th: 'READ CLIENT', ja: '読み取りクライアント' } as L },
    { id: 'mb', col: 1, label: 'Memory Base', sub: { en: 'RELEVANCE · BELIEF', th: 'RELEVANCE · BELIEF', ja: '関連性 · 信念' } as L, core: true },
    { id: 'pm', col: 1, label: 'projectmem', sub: { en: 'BASELINE ARM', th: 'BASELINE ARM', ja: 'ベースライン' } as L },
    { id: 'cm', col: 1, label: 'claude-mem', sub: { en: 'BASELINE ARM', th: 'BASELINE ARM', ja: 'ベースライン' } as L },
    { id: 'am', col: 1, label: 'Auto Memory', sub: { en: 'BASELINE ARM', th: 'BASELINE ARM', ja: 'ベースライン' } as L },
    { id: 'hn', col: 2, label: 'Harness', sub: { en: 'COUNTERFACTUAL', th: 'COUNTERFACTUAL', ja: '反実仮想' } as L }
  ],
  edges: [
    { from: 'cc', to: 'mb', active: true, label: { en: 'write · read', th: 'write · read', ja: '書く · 読む' } as L },
    { from: 'cx', to: 'mb', dashed: true, label: { en: 'read', th: 'read', ja: '読む' } as L },
    { from: 'mb', to: 'hn' },
    { from: 'pm', to: 'hn', dashed: true },
    { from: 'cm', to: 'hn', dashed: true },
    { from: 'am', to: 'hn', dashed: true }
  ]
};

/** MSU Informatics Hackathon 2026 (Facts §2.3, §6.1): the result and the parts that were the owner's. */
export const MSU = {
  when: { en: '13–14 Aug 2026 · team of 3', th: '13–14 ส.ค. 2026 · ทีม 3 คน', ja: '2026年8月13〜14日 · チーム3人' } as L,
  track: { en: 'AI track · Higher Education', th: 'สาย AI · ระดับอุดมศึกษา', ja: 'AIトラック · 高等教育' } as L,
  parts: [{ en: 'Order OCR workflow', th: 'flow OCR ใบสั่ง', ja: '注文 OCR のワークフロー' }, { en: 'Chatbot UI', th: 'Chatbot UI', ja: 'Chatbot UI' }, { en: 'Ingredient & stock forecasting', th: 'พยากรณ์วัตถุดิบและสต็อก', ja: '食材と在庫の予測' }, { en: 'Kitchen dashboard integration', th: 'เชื่อม kitchen dashboard', ja: 'キッチンダッシュボードの連携' }] as L[]
};

/** ICPC Thailand 2024 (Facts §6.4, the final standings): what the scoreboard shows for team Eeg E Eeg Eeg. */
export const ICPC_2024 = {
  team: 'Eeg E Eeg Eeg',
  rank: 19,
  of: 56,
  solved: [{ p: 'B' }, { p: 'G', first: true, min: 12 }, { p: 'K' }] as { p: string; first?: boolean; min?: number }[]
};

/** WhipUI on npm (Facts §2.4; the npm registry, checked 2026-10-08): every published version and its day. */
export const WHIPUI_RELEASES: { v: string; d: string }[] = [
  { v: '0.1.0', d: '2026-08-11' }, { v: '0.2.0', d: '2026-08-12' }, { v: '0.2.1', d: '2026-08-12' },
  { v: '0.3.0', d: '2026-08-29' }, { v: '1.1.0', d: '2026-09-11' }, { v: '1.2.0', d: '2026-09-14' }
];

