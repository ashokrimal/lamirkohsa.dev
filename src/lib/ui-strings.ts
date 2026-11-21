/**
 * Interface strings.
 *
 * Field labels, button labels, aria labels and system messages, plus the
 * sentence templates behind counts and interpolated headings. Everything here
 * is a built-in default: each entry can be overridden from the `UI Copy` CMS
 * collection (see `ui-copy.ts`), and an entry without an override renders the
 * literal below. Static entries carry an English text and, where the interface
 * already shows one, a Korean variant; templates use `{name}` and
 * `{name:one|many}` placeholders and always render English.
 */

export interface UiText {
  en: string
  kr?: string
}

const text = (en: string, kr?: string): UiText => (kr ? { en, kr } : { en })

type TemplateArgs = Record<string, string | number>

/**
 * Fills `{name}` placeholders and `{name:one|many}` plural choices. A name the
 * template does not receive is left untouched so a mistake is visible, not silent.
 */
function fillTemplate(template: string, args: TemplateArgs): string {
  return template.replace(/\{(\w+)(?::([^{}]*))?\}/g, (match, name: string, variants?: string) => {
    const value = args[name]
    if (value === undefined) return match
    if (!variants) return String(value)
    const [one, many] = variants.split('|')
    return Number(value) === 1 ? one : many ?? one
  })
}

interface GeneratedVariant {
  key: string
  template: string
  when?: (args: TemplateArgs) => boolean
}

interface GeneratedCopySpec {
  /** Names of the function arguments, in call order. */
  args: string[]
  variants: GeneratedVariant[]
  /** Placeholders rendered as two-digit counters. */
  pad?: string[]
  /** Placeholders lowercased before they are inserted. */
  lower?: string[]
}

/**
 * Sentence builders stay code, but their wording is a template the CMS can
 * replace. Every variant is its own editable key.
 */
const GENERATED_COPY: Record<string, GeneratedCopySpec> = {
  'hero.metaRight': {
    args: ['current', 'total'],
    pad: ['current', 'total'],
    variants: [{ key: 'hero.metaRight', template: 'Selected work · {current} / {total}' }],
  },
  'project.previewAlt': {
    args: ['title'],
    variants: [{ key: 'project.previewAlt', template: '{title} preview' }],
  },
  'project.openCaseStudy': {
    args: ['title'],
    variants: [{ key: 'project.openCaseStudy', template: 'Open the {title} case study' }],
  },
  'project.quickViewAria': {
    args: ['title'],
    variants: [{ key: 'project.quickViewAria', template: 'Quick look at {title} details' }],
  },
  'project.shareAria': {
    args: ['title'],
    variants: [{ key: 'project.shareAria', template: 'Copy link to {title}' }],
  },
  'project.executionPhases': {
    args: ['count'],
    variants: [
      { key: 'project.executionPhases', template: '{count} Execution {count:Phase|Phases}' },
    ],
  },
  'gallery.photographs': {
    args: ['count'],
    variants: [{ key: 'gallery.photographs', template: '{count} {count:photograph|photographs}' }],
  },
  'media.entries': {
    args: ['count'],
    variants: [{ key: 'media.entries', template: '{count} {count:entry|entries}' }],
  },
  'media.viewAllCategory': {
    args: ['label'],
    lower: ['label'],
    variants: [{ key: 'media.viewAllCategory', template: 'View all {label}' }],
  },
  'media.collectionAria': {
    args: ['label'],
    variants: [{ key: 'media.collectionAria', template: '{label} collection' }],
  },
  'journal.eyebrow': {
    args: ['category'],
    variants: [{ key: 'journal.eyebrow', template: 'Journal / {category}' }],
  },
  'journal.publishedNotes': {
    args: ['count'],
    variants: [
      { key: 'journal.publishedNotes', template: '{count} published {count:note|notes}' },
    ],
  },
  'journal.minRead': {
    args: ['minutes'],
    variants: [{ key: 'journal.minRead', template: '{minutes} min read' }],
  },
  'journal.words': {
    args: ['count'],
    variants: [{ key: 'journal.words', template: '~{count} words' }],
  },
  'journal.readingTimeTitle': {
    args: ['words'],
    variants: [
      {
        key: 'journal.readingTimeTitle',
        template: 'Estimated reading time: ~{words} words at 200 WPM',
      },
    ],
  },
  'projects.showingCount': {
    args: ['visible', 'total'],
    variants: [
      {
        key: 'projects.showingCount',
        template: '{total} {total:project|projects}',
        when: (args) => args.visible === args.total,
      },
      {
        key: 'projects.showingCountFiltered',
        template: '{visible} of {total} {total:project|projects}',
      },
    ],
  },
  'projects.showMoreTech': {
    args: ['count'],
    variants: [{ key: 'projects.showMoreTech', template: '+{count} more' }],
  },
  'projects.distribution.projectsCount': {
    args: ['count'],
    variants: [
      { key: 'projects.distribution.projectsCount', template: '{count} {count:project|projects}' },
    ],
  },
}

function buildGenerated(
  spec: GeneratedCopySpec,
  templateFor: (variant: GeneratedVariant) => string,
) {
  return (...values: unknown[]) => {
    const args: TemplateArgs = {}
    spec.args.forEach((name, index) => {
      const value = values[index]
      args[name] = typeof value === 'number' ? value : String(value ?? '')
    })
    const variant = spec.variants.find((item) => !item.when || item.when(args)) ?? spec.variants[0]
    const filled: TemplateArgs = {}
    for (const [name, value] of Object.entries(args)) {
      const lowered = spec.lower?.includes(name) ? String(value).toLowerCase() : String(value)
      filled[name] =
        spec.pad?.includes(name) && /^\d+$/.test(lowered)
          ? lowered.padStart(2, '0')
          : lowered
    }
    return fillTemplate(templateFor(variant), filled)
  }
}

function generated(key: keyof typeof GENERATED_COPY | string) {
  return buildGenerated(GENERATED_COPY[key as string], (variant) => variant.template)
}

export const uiStrings = {
  nav: {
    primary: text('Primary'),
    openMenu: text('Open menu'),
    closeMenu: text('Close menu'),
    toggleSound: text('Toggle sensory sound effects'),
    toggleAudio: text('Toggle audio'),
    muteSound: text('Mute sensory UI audio'),
    unmuteSound: text('Unmute sensory UI audio'),
    localTime: text('Local time'),
    location: text('Location'),
    availability: text('Availability'),
  },
  footer: {
    navigate: text('Navigate'),
    collections: text('Collections'),
    elsewhere: text('Elsewhere'),
    footerNavigation: text('Footer navigation'),
    footerCollections: text('Footer collections'),
  },
  pageNav: {
    back: text('Return home'),
  },
  collection: {
    viewAll: text('View all'),
  },
  hero: {
    ariaLabel: text('At a glance'),
    specialization: text('Full-Stack Software Engineer & Product Designer'),
    basedIn: text('Based in'),
    scrollHint: text('Scroll to explore ↓'),
    metaRight: generated('hero.metaRight'),
    selectedProjects: text('Selected projects'),
    disciplines: text('Creative disciplines'),
  },
  project: {
    liveDemo: text('Live Demo'),
    code: text('Code'),
    github: text('GitHub'),
    live: text('Live'),
    viewCaseStudy: text('View case study'),
    openProject: text('Open project'),
    previewAlt: generated('project.previewAlt'),
    openCaseStudy: generated('project.openCaseStudy'),
    quickView: text('Quick look'),
    quickViewAria: generated('project.quickViewAria'),
    closeQuickView: text('Close quick look'),
    share: text('Share'),
    shareAria: generated('project.shareAria'),
    copiedToast: text('Copied!'),
    copiedSubtitle: text('Project URL copied to clipboard.'),
    sourceTitle: text('View source code'),
    executionPhases: generated('project.executionPhases'),
  },
  contact: {
    formTitle: text('Send a direct message', '문의하기'),
    name: text('Full Name'),
    namePlaceholder: 'Ashok Rimal',
    email: text('Email Address'),
    emailPlaceholder: 'info@ashokrimal.com.np',
    subject: text('Topic or Project'),
    subjectPlaceholder: 'Full Stack Web Application',
    message: text('Message Details'),
    messagePlaceholder: "Tell me about what you're building, timelines, or thoughts...",
    submit: text('Transmit Message', '전송'),
    sending: text('Sending Message…'),
    success: text(
      "Thank you for reaching out. Your note has been received and I'll respond as soon as possible.",
    ),
    genericError: text('Something went wrong.'),
    sendFailed: text('Failed to send message.'),
    noMethod: text('No contact method has been set up yet'),
    emailLabel: text('Email'),
    phoneLabel: text('Phone'),
    locationLabel: text('Location'),
    timezoneLabel: text('Timezone'),
    availabilityLabel: text('Availability'),
  },
  about: {
    fullName: text('Full name'),
    professionalTitle: text('Professional title'),
    location: text('Location'),
    availability: text('Availability'),
    focus: text('Focus'),
    email: text('Email'),
  },
  gallery: {
    photographs: generated('gallery.photographs'),
    /** SnapWidget id; clear it to hide the Instagram feed entirely. */
    instagramWidgetId: text('af4c3d7e-f2b1-4586-9195-259b504fef68'),
    instagramTitle: text('Latest from Instagram'),
    instagramDescription: text('New frames and outtakes, posted between gallery updates.'),
    collectionAria: text('Photography collection'),
  },
  media: {
    previewAria: text('Media preview'),
    entries: generated('media.entries'),
    viewAllCategory: generated('media.viewAllCategory'),
    collectionAria: generated('media.collectionAria'),
  },
  journal: {
    label: text('Journal'),
    krEyebrow: text('글'),
    eyebrow: generated('journal.eyebrow'),
    allNotes: text('All notes'),
    startConversation: text('Start a conversation'),
    readNote: text('Read note'),
    publishedNotes: generated('journal.publishedNotes'),
    minRead: generated('journal.minRead'),
    words: generated('journal.words'),
    readingTimeTitle: generated('journal.readingTimeTitle'),
    newsletterEyebrow: text('Dispatch', '뉴스레터'),
    newsletterTitle: text('New notes, delivered quietly.'),
    newsletterDescription: text(
      'Occasional writing on engineering, design systems, and software craft. No noise.',
    ),
    newsletterEmailLabel: text('Email address'),
    newsletterPlaceholder: 'you@example.com',
    newsletterSubmit: text('Subscribe'),
    newsletterSubscribing: text('Subscribing…'),
    newsletterSuccess: text("You're on the list. Thanks for reading along."),
    newsletterAlreadySubscribed: text("You're already subscribed—good to have you here."),
    newsletterInvalidEmail: text('Please enter a valid email address.'),
    newsletterFailed: text('Could not complete subscription. Please try again.'),
  },
  projects: {
    featuredAria: text('Featured projects'),
    viewAll: text('View all projects'),
    worksHeading: text('Projects'),
    searchPlaceholder: text('Search'),
    clearSearch: text('Clear search'),
    filtersLabel: text('Filters'),
    allCategories: text('All', '전체'),
    categoryLabel: text('Category', '카테고리'),
    techStackLabel: text('Technology', '기술 스택'),
    clearFilters: text('Reset', '초기화'),
    clearAll: text('Clear All'),
    showingCount: generated('projects.showingCount'),
    noMatchesTitle: text('No projects match your current filters.'),
    noMatchesHint: text('Try adjusting your search query, category, or technology filters.'),
    showMoreTech: generated('projects.showMoreTech'),
    showLessTech: text('Show less'),
    industryTrends: {
      eyebrow: text('Live Search Grounded', '기술 동향'),
      title: text('Industry Trends'),
      refreshAria: text('Refresh industry trends'),
      loading: text('Scanning ecosystem shifts via Google Search…'),
      sourcesLabel: text('Grounded sources'),
      queriesLabel: text('Search queries'),
      retryLabel: text('Retry lookup'),
      emptyHint: text('Add project technologies to surface relevant industry trends.'),
    },
    distribution: {
      eyebrow: text('Stack Telemetry', '기술 분포'),
      title: text('Technology Distribution'),
      description: text(
        'Proportional breakdown of frameworks, runtimes, and tools across published projects. Select any slice to filter.',
      ),
      totalLabel: text('Technologies'),
      otherLabel: text('Other tools'),
      projectsCount: generated('projects.distribution.projectsCount'),
    },
  },
  home: {
    viewAllPhotographs: text('View all photographs'),
    viewAllMedia: text('View all media'),
  },
  cmsState: {
    defaultMessage: text('This content is temporarily unavailable.'),
    hint: text(
      'The content service did not respond. Nothing has been removed; try again shortly.',
    ),
  },
} as const

/** One label the CMS can override: a static text, or a sentence template. */
export interface UiCopyEntry {
  key: string
  en: string
  kr?: string
  /** True for generated sentences; `en` is then the placeholder template. */
  template?: boolean
}

/** CMS overrides, keyed by the dotted path of the label (`nav.openMenu`). */
export type UiCopyOverrides = Record<string, { en?: string; kr?: string }>

/** Placeholders a template may use, or null when the key is a plain label. */
export function getTemplateArgs(key: string): string[] | null {
  const spec = GENERATED_COPY[key]
  return spec ? [...spec.args] : null
}

/** Every placeholder a template text references, including plural forms. */
export function readTemplatePlaceholders(value: string): string[] {
  const names: string[] = []
  for (const match of value.matchAll(/\{(\w+)(?::[^{}]*)?\}/g)) {
    if (!names.includes(match[1])) names.push(match[1])
  }
  return names
}

/**
 * Rejects a template that references placeholders its sentence builder never
 * passes, which would otherwise render literally on the public site.
 */
export function validateTemplate(key: string, value: string): string | null {
  const args = getTemplateArgs(key)
  if (!args || !value) return null
  const unknown = readTemplatePlaceholders(value).filter((name) => !args.includes(name))
  if (unknown.length === 0) return null
  const available = args.map((name) => `{${name}}`).join(', ')
  return `Unknown placeholder ${unknown.map((name) => `{${name}}`).join(', ')} in "${key}". Use ${available}.`
}

function walkCopy(
  node: unknown,
  prefix: string,
  visit: (entry: UiCopyEntry) => void,
): void {
  if (!node || typeof node !== 'object') return
  const candidate = node as UiText
  if (typeof candidate.en === 'string') {
    visit({
      key: prefix,
      en: candidate.en,
      ...(candidate.kr ? { kr: candidate.kr } : {}),
    })
    return
  }
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    walkCopy(value, prefix ? `${prefix}.${key}` : key, visit)
  }
}

function mergeCopy(
  node: unknown,
  prefix: string,
  overrides: UiCopyOverrides,
): unknown {
  if (typeof node === 'function') {
    const spec = GENERATED_COPY[prefix]
    if (!spec) return node
    return buildGenerated(
      spec,
      (variant) => overrides[variant.key]?.en?.trim() || variant.template,
    )
  }
  if (!node || typeof node !== 'object') return node
  const candidate = node as UiText
  if (typeof candidate.en === 'string') {
    const override = overrides[prefix]
    if (!override) return node
    const en = override.en?.trim() || candidate.en
    const kr = override.kr?.trim() || candidate.kr
    return kr ? { en, kr } : { en }
  }
  const merged: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    merged[key] = mergeCopy(value, prefix ? `${prefix}.${key}` : key, overrides)
  }
  return merged
}

/** Every editable label with its built-in fallback, for the admin editor. */
export function flattenUiStrings(): UiCopyEntry[] {
  const entries: UiCopyEntry[] = []
  walkCopy(uiStrings, '', (entry) => entries.push(entry))
  // Generated sentences are editable too, as placeholder templates.
  for (const spec of Object.values(GENERATED_COPY)) {
    for (const variant of spec.variants) {
      entries.push({ key: variant.key, en: variant.template, template: true })
    }
  }
  return entries
}

/**
 * Applies CMS overrides on top of the built-in labels. A missing or empty
 * override keeps the literal from this file, so the interface never shows a
 * blank label.
 */
export function resolveUiStrings(overrides: UiCopyOverrides): typeof uiStrings {
  if (Object.keys(overrides).length === 0) return uiStrings
  return mergeCopy(uiStrings, '', overrides) as unknown as typeof uiStrings
}

/** The filename-safe Korean/English pair, for content rendered in a `<span lang="ko">`. */
export function korean(value: UiText): string | undefined {
  return value.kr
}
