import { z } from 'zod'
import { PLAIN_SECTION_COPY } from '@/lib/plain-copy'

/**
 * The typed section registry for studio-managed pages.
 *
 * Every section the CMS can place on a page has one key here. The key is what
 * `page_sections.section_key` stores and what `SectionRenderer` maps to a React
 * component; anything else is ignored at render time. `content_json` is
 * validated against that key's schema on write *and* on read, so a malformed
 * payload degrades to defaults instead of crashing the page.
 */

export const SECTION_KEYS = [
  'introduction',
  'projects',
  'media',
  'github',
  'education',
  'experience',
  'skills',
  'interests',
  'socials',
  'contact',
  'instagram',
] as const
export type SectionKey = (typeof SECTION_KEYS)[number]

export const sectionAnimationSchema = z
  .object({
    enabled: z.boolean().optional(),
    intensity: z.number().min(0).max(1).optional(),
  })
  .strict()

const optionalText = (max: number) => z.string().trim().max(max).optional()

const baseSectionSchema = z.object({
  eyebrow: optionalText(120),
  krEyebrow: optionalText(120),
  title: optionalText(200),
  accent: optionalText(200),
  description: optionalText(2000),
  body: optionalText(8000),
  ctaLabel: optionalText(80),
  ctaHref: optionalText(500),
  imageUrl: optionalText(1000),
  imageAlt: optionalText(300),
  previewCount: z.number().int().min(1).max(24).optional(),
  layout: z.enum(['shelf', 'index']).optional(),
  animation: sectionAnimationSchema.optional(),
})

const introductionSchema = baseSectionSchema
const projectsSchema = baseSectionSchema
const mediaSchema = baseSectionSchema
const githubSchema = baseSectionSchema.extend({
  username: optionalText(100),
})
const instagramSchema = baseSectionSchema.extend({
  widgetId: optionalText(200),
})

export const SECTION_CONTENT_SCHEMAS = {
  introduction: introductionSchema,
  projects: projectsSchema,
  media: mediaSchema,
  github: githubSchema,
  education: baseSectionSchema,
  experience: baseSectionSchema,
  skills: baseSectionSchema,
  interests: baseSectionSchema,
  socials: baseSectionSchema,
  contact: baseSectionSchema,
  instagram: instagramSchema,
} satisfies Record<SectionKey, z.ZodType>

export type SectionContent = z.infer<typeof baseSectionSchema> & {
  username?: string
  widgetId?: string
}

export type SectionFieldType = 'text' | 'textarea' | 'url' | 'number' | 'checkbox' | 'select'

export interface SectionFieldDefinition {
  key: keyof SectionContent | `animation.${'enabled' | 'intensity'}` | 'layout'
  label: string
  type: SectionFieldType
  hint?: string
  placeholder?: string
  options?: readonly string[]
}

export interface SectionDefinition {
  key: SectionKey
  label: string
  /** What this section reads from besides its own copy. */
  source: string
  schema: z.ZodType
  fields: readonly SectionFieldDefinition[]
  defaults: SectionContent
}

const baseFields: readonly SectionFieldDefinition[] = [
  { key: 'eyebrow', label: 'Eyebrow', type: 'text', placeholder: '01 / Introduction' },
  { key: 'krEyebrow', label: 'Korean eyebrow', type: 'text' },
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'accent', label: 'Accent line', type: 'text' },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'body', label: 'Body copy', type: 'textarea' },
  { key: 'ctaLabel', label: 'CTA label', type: 'text', placeholder: 'Read more' },
  { key: 'ctaHref', label: 'CTA link', type: 'url', placeholder: '/about' },
  { key: 'imageUrl', label: 'Image URL', type: 'url' },
  { key: 'imageAlt', label: 'Image alt text', type: 'text' },
  { key: 'animation.enabled', label: '3D / motion enabled', type: 'checkbox' },
  { key: 'animation.intensity', label: 'Motion intensity (0–1)', type: 'number' },
]

export const SECTION_DEFINITIONS: Record<SectionKey, SectionDefinition> = {
  introduction: {
    key: 'introduction',
    label: 'Introduction',
    source: 'Profile biography, plus the copy written here.',
    schema: SECTION_CONTENT_SCHEMAS.introduction,
    fields: baseFields,
    defaults: {
      ...PLAIN_SECTION_COPY.introduction,
      ctaLabel: 'Read the full story',
      ctaHref: '/about',
      animation: { enabled: true, intensity: 0.5 },
    },
  },
  projects: {
    key: 'projects',
    label: 'Selected projects',
    source: 'Published projects from the Projects manager.',
    schema: SECTION_CONTENT_SCHEMAS.projects,
    fields: [
      ...baseFields,
      { key: 'previewCount', label: 'Cards to show', type: 'number' },
    ],
    defaults: {
      ...PLAIN_SECTION_COPY.projects,
      ctaLabel: 'All projects',
      ctaHref: '/projects',
      previewCount: 3,
      animation: { enabled: true, intensity: 0.4 },
    },
  },
  media: {
    key: 'media',
    label: 'Media shelf',
    source: 'The media collections published in the studio.',
    schema: SECTION_CONTENT_SCHEMAS.media,
    fields: [
      ...baseFields.filter((field) => field.key !== 'body'),
      {
        key: 'layout',
        label: 'Layout',
        type: 'select',
        options: ['shelf', 'index'],
        hint: 'shelf shows one horizontal row; index shows every collection with its own heading.',
      },
    ],
    defaults: {
      ...PLAIN_SECTION_COPY.media,
      ctaLabel: 'Open media',
      ctaHref: '/media',
      layout: 'shelf',
      animation: { enabled: false, intensity: 0.3 },
    },
  },
  github: {
    key: 'github',
    label: 'GitHub activity',
    source: 'The GitHub username saved in profile settings.',
    schema: SECTION_CONTENT_SCHEMAS.github,
    fields: [
      ...baseFields.filter((field) => field.key !== 'body'),
      { key: 'username', label: 'GitHub username override', type: 'text' },
    ],
    defaults: {
      ...PLAIN_SECTION_COPY.github,
      ctaLabel: 'GitHub activity',
      ctaHref: '/about/github',
      animation: { enabled: false, intensity: 0.2 },
    },
  },
  education: {
    key: 'education',
    label: 'Education',
    source: 'Education records from the studio.',
    schema: SECTION_CONTENT_SCHEMAS.education,
    fields: baseFields.filter((field) => field.key !== 'body'),
    defaults: {
      ...PLAIN_SECTION_COPY.education,
      animation: { enabled: false, intensity: 0.2 },
    },
  },
  experience: {
    key: 'experience',
    label: 'Experience',
    source: 'Experience records from the studio.',
    schema: SECTION_CONTENT_SCHEMAS.experience,
    fields: baseFields.filter((field) => field.key !== 'body'),
    defaults: {
      ...PLAIN_SECTION_COPY.experience,
      animation: { enabled: false, intensity: 0.2 },
    },
  },
  skills: {
    key: 'skills',
    label: 'Skills',
    source: 'Skill groups from the studio.',
    schema: SECTION_CONTENT_SCHEMAS.skills,
    fields: baseFields.filter((field) => field.key !== 'body'),
    defaults: {
      ...PLAIN_SECTION_COPY.skills,
      animation: { enabled: false, intensity: 0.2 },
    },
  },
  interests: {
    key: 'interests',
    label: 'Interests',
    source: 'The interests list on the profile record.',
    schema: SECTION_CONTENT_SCHEMAS.interests,
    fields: baseFields.filter((field) => field.key !== 'body'),
    defaults: {
      ...PLAIN_SECTION_COPY.interests,
      animation: { enabled: false, intensity: 0.2 },
    },
  },
  socials: {
    key: 'socials',
    label: 'Social links',
    source: 'Social Links records from the studio.',
    schema: SECTION_CONTENT_SCHEMAS.socials,
    fields: baseFields.filter((field) => field.key !== 'body'),
    defaults: {
      ...PLAIN_SECTION_COPY.socials,
      animation: { enabled: false, intensity: 0.2 },
    },
  },
  instagram: {
    key: 'instagram',
    label: 'Instagram feed',
    source: 'The SnapWidget id written here; posts come from the linked Instagram account.',
    schema: SECTION_CONTENT_SCHEMAS.instagram,
    fields: [
      ...baseFields.filter(
        (field) => field.key !== 'body' && field.key !== 'imageUrl' && field.key !== 'imageAlt',
      ),
      {
        key: 'widgetId',
        label: 'SnapWidget id',
        type: 'text',
        hint: 'Leave empty to use the default feed id from UI copy.',
      },
    ],
    defaults: {
      ...PLAIN_SECTION_COPY.instagram,
      ctaLabel: 'Follow on Instagram',
      animation: { enabled: false, intensity: 0.2 },
    },
  },
  contact: {
    key: 'contact',
    label: 'Contact channels',
    source: 'Contact details and social links from site settings.',
    schema: SECTION_CONTENT_SCHEMAS.contact,
    fields: baseFields.filter((field) => field.key !== 'body'),
    defaults: {
      ...PLAIN_SECTION_COPY.contact,
      animation: { enabled: false, intensity: 0.2 },
    },
  },
}

export const SECTION_KEY_LIST: readonly SectionKey[] = SECTION_KEYS

export function isSectionKey(value: unknown): value is SectionKey {
  return typeof value === 'string' && (SECTION_KEYS as readonly string[]).includes(value)
}

/**
 * Validates a stored `content_json` payload. An unknown key or invalid payload
 * yields the section's defaults (never a thrown error), and the section's
 * animation config is normalised so the renderer always has booleans.
 */
export function parseSectionContent(
  key: string,
  raw: unknown,
): SectionContent {
  const definition = isSectionKey(key) ? SECTION_DEFINITIONS[key] : undefined
  const defaults = definition?.defaults ?? {}
  if (!definition) return defaults

  const parsed = definition.schema.safeParse(raw ?? {})
  const value = parsed.success ? (parsed.data as SectionContent) : {}

  return {
    ...defaults,
    ...value,
    animation: {
      enabled: value.animation?.enabled ?? defaults.animation?.enabled ?? false,
      intensity:
        typeof value.animation?.intensity === 'number'
          ? Math.min(1, Math.max(0, value.animation.intensity))
          : defaults.animation?.intensity ?? 0.4,
    },
  }
}

/** CMS writes reject malformed payloads instead of silently dropping fields. */
export function validateSectionContent(key: string, raw: unknown) {
  const definition = isSectionKey(key) ? SECTION_DEFINITIONS[key] : undefined
  if (!definition) return { ok: false as const, error: `Unknown section key: ${key}` }
  const parsed = definition.schema.safeParse(raw ?? {})
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; '),
    }
  }
  return { ok: true as const, data: parsed.data as SectionContent }
}

/* ------------------------------------------------------------------ */
/* Site settings                                                       */
/* ------------------------------------------------------------------ */

export const socialLinkSchema = z.object({
  id: z.string().trim().min(1).max(80),
  platform: z.string().trim().min(1).max(60),
  label: z.string().trim().min(1).max(80),
  url: z.string().trim().min(1).max(500),
  is_visible: z.boolean(),
  sort_order: z.number().int().min(0).max(999),
})

export const socialLinksSchema = z.array(socialLinkSchema).max(30)

export type SocialLink = z.infer<typeof socialLinkSchema>

export function parseSocialLinks(raw: unknown): SocialLink[] {
  const parsed = socialLinksSchema.safeParse(raw ?? [])
  if (!parsed.success) return []
  return parsed.data
}

/** Visible links only, in the owner's order. Invalid entries are dropped. */
export function visibleSocialLinks(links: SocialLink[]): SocialLink[] {
  return [...links]
    .filter((link) => link.is_visible && link.url.trim().length > 0)
    .sort((a, b) => a.sort_order - b.sort_order)
}
