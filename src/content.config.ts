/**
 * Content model (docs/CONTENT-MODEL.md).
 *
 *   works    src/content/works/<id>.yaml     facts about one work, shared by all languages
 *   stories  src/content/stories/<lang>/<id>.mdx   the narrative for a work page, composed from story blocks
 *
 * The schema is strict on purpose: unknown categories/statuses, missing English text, or image paths that do not
 * exist fail `npm run build` — the build is the fact-checker's first line.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATS, STATUSES, PLATES, RECIPES, LINK_KINDS, TAGS, KINDS, THEMES } from './lib/vocab';

const L = z.union([z.string(), z.object({ en: z.string(), th: z.string().optional(), ja: z.string().optional() })]);

const works = defineCollection({
  loader: glob({ pattern: '*.{yaml,yml}', base: './src/content/works' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** work (default) · art (drawing) · competition · teaching. Events with a page live under /timeline/<id>/, works and art under /work/<id>/. */
      kind: z.enum(KINDS).default('work'),
      /** Color context. `self` (the owner's own blue) is for events that are not one kind of work. */
      cat: z.enum([...CATS, 'self']),
      /** The work's own color family (scripts/tokens.config.mjs THEMES), when it has an identity of its own: its page and
       *  the way into it use it; lists keep `cat`. */
      theme: z.enum(THEMES).optional(),
      year: z.number().int(),
      /** Where it sits on the Timeline: 'YYYY-MM' or 'YYYY-MM-DD' when Facts give it (its year must equal `year`). */
      date: z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/).optional(),
      /** A row with no page of its own can open a part of another page instead (locale-free, e.g. '/timeline/icpc/#y2025'). */
      opens: z.string().startsWith('/').optional(),
      /** Shown when a Timeline row without a page is opened: a little more than `line`, plain. */
      more: L.optional(),
      /** Short mono type line, e.g. "GAME · UNITY 6". */
      type: z.string(),
      /** One sentence: what it is and what you did. */
      line: L,
      /** The single strongest fact, shown on cards (e.g. "Winner · AI track"). */
      fact: L.optional(),
      status: z.enum(STATUSES).optional(),
      /** Two-digit index shown on plates when the work is featured. */
      idx: z.string().optional(),
      /** A short quote from the work itself (its tagline, a rule it follows). */
      quote: L.optional(),
      meta: z.array(z.object({ k: z.string().or(L), v: L })).default([]),
      cover: z
        .object({
          src: image(),
          alt: L,
          plate: z.enum(PLATES).default('step-right'),
          frame: z.enum(['cutout', 'screen']).default('cutout'),
          cut: z.number().optional(),
          note: L.optional(),
          callouts: z
            .array(z.object({ x: z.number(), y: z.number(), label: L, sub: L.optional(), side: z.enum(['left', 'right']).optional(), key: z.boolean().optional() }))
            .default([])
        })
        .optional(),
      links: z.array(z.object({ kind: z.enum(LINK_KINDS), url: z.url(), label: z.string(), note: L.optional() })).default([]),
      tags: z.array(z.enum(TAGS)).default([]),
      /** Has its own page (needs stories/<lang>/<id>.mdx). */
      page: z.boolean().default(false),
      related: z.array(z.string()).default([]),
      /** Where the facts come from: a section of _note/portfolio-facts.md (e.g. `portfolio-facts §2.2`), a repo, a marketplace page… Not shown on the site. */
      sources: z.array(z.string()).default([])
    }).refine((d) => !d.date || d.date.startsWith(String(d.year)), { message: '`date` must be in `year`', path: ['date'] })
      .refine((d) => d.kind !== 'work' || d.cat !== 'self', { message: 'a work needs a kind of work as `cat` (drawing is `kind: art`)', path: ['cat'] })
});

const stories = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/stories' }),
  schema: z.object({
    /** id of the work in src/content/works */
    work: z.string(),
    /** which recipe from docs/STORY-RECIPES.md this story follows */
    recipe: z.enum(RECIPES),
    /** <title> / description for the page */
    summary: z.string().optional()
  })
});

export const collections = { works, stories };
