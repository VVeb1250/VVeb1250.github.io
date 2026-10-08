// Parses the doc header + Props interface at the top of each component (.astro frontmatter).
// Used by scripts/gen-docs.mjs (→ docs/COMPONENTS.md, docs/components.json) and by the /kit page.
//
// Doc header format (first /** … */ block in the frontmatter):
//   @component Name        @group shell|primitives|media|blocks|lists|project|home
//   @summary …  @use …  @avoid …  @behavior …  @states …  @props-note …
//   @example   (everything after it, until the end of the block, is the example code)

const TAGS = ['component', 'group', 'summary', 'use', 'avoid', 'behavior', 'states', 'props-note', 'a11y', 'example'];

export function parseDoc(src, file = '') {
  const fm = src.startsWith('---') ? src.slice(3, src.indexOf('\n---', 3)) : src;
  const block = fm.match(/\/\*\*([\s\S]*?)\*\//);
  if (!block) return null;
  const doc = {};
  let cur = null;
  for (const raw of block[1].split('\n')) {
    const line = raw.replace(/^\s*\* ?/, '');
    const m = line.match(/^@([\w-]+)\s*(.*)$/);
    if (m && TAGS.includes(m[1])) { cur = m[1]; doc[cur] = m[2]; continue; }
    if (cur) doc[cur] += (cur === 'example' ? '\n' : ' ') + (cur === 'example' ? line : line.trim());
  }
  if (!doc.component) return null;
  for (const k of Object.keys(doc)) doc[k] = k === 'example' ? doc[k].replace(/^\n+|\s+$/g, '') : doc[k].replace(/\s+/g, ' ').trim();
  return { name: doc.component, group: doc.group ?? 'misc', file, ...doc, props: parseProps(fm) };
}

// Reads `export interface Props { … }` (and any `export interface X` it references by name for nested docs).
export function parseProps(fm) {
  const start = fm.search(/export interface Props\s*{/);
  if (start < 0) return [];
  let i = fm.indexOf('{', start) + 1, depth = 1;
  const body0 = i;
  while (i < fm.length && depth > 0) { const c = fm[i]; if (c === '{') depth++; else if (c === '}') depth--; i++; }
  const body = fm.slice(body0, i - 1);
  const props = [];
  let comment = '', buf = '', d = 0;
  const flush = () => {
    const s = buf.trim();
    if (s) {
      const m = s.match(/^([\w$]+)(\?)?\s*:\s*([\s\S]+?);?$/);
      if (m) props.push({ name: m[1], optional: !!m[2], type: m[3].replace(/\s+/g, ' ').trim(), doc: comment.trim() });
    }
    buf = ''; comment = '';
  };
  for (let k = 0; k < body.length; k++) {
    const c = body[k];
    if (d === 0 && body.startsWith('/**', k)) { const e = body.indexOf('*/', k); comment = body.slice(k + 3, e).split('\n').map((l) => l.replace(/^\s*\* ?/, '')).join(' ').replace(/\s+/g, ' ').trim(); k = e + 1; continue; }
    if (d === 0 && body.startsWith('//', k)) { k = body.indexOf('\n', k); if (k < 0) break; continue; }
    if ('{[(<'.includes(c)) d++;
    if ('}])>'.includes(c) && body[k - 1] !== '=') d--;
    if (d === 0 && (c === ';' || (c === '\n' && /[\w\]}')"]\s*$/.test(buf) && !/[|&,:=]\s*$/.test(buf) && /^\s*[\w$]+\??\s*:/.test(buf)))) { if (c !== '\n') buf += c; flush(); continue; }
    buf += c;
  }
  flush();
  return props;
}

export const GROUPS = [
  { key: 'shell', title: 'Shell', note: 'Page frame: header, nav, section wrappers, marker, fog, footer. Most are placed once by PageShell.' },
  { key: 'primitives', title: 'Primitives', note: 'Small, reused everywhere: tags, labels, links, captions of facts.' },
  { key: 'media', title: 'Media', note: 'Showing real artifacts: images, video, frames, figures, the plate.' },
  { key: 'blocks', title: 'Blocks', note: 'Content blocks with meaning: who did what, constraints, outcomes, process, traces.' },
  { key: 'lists', title: 'Lists', note: 'Rows for the Timeline, evidence, trail, related work, milestones, lab, visual notes.' },
  { key: 'project', title: 'Project page', note: 'Top and bottom of a work page. The middle is free composition.' },
  { key: 'home', title: 'Home compositions', note: 'Composition-level pieces for specific works. Not templates — do not reuse for other works.' },
  { key: 'showcase', title: 'Work showcase', note: 'The Work page reel: ReelPanel is the frame every work shares (number, text, click); each Reel* panel is one work\'s own composition. Not templates for other pages.' }
];
