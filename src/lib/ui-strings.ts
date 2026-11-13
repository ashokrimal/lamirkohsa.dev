/**
 * Interface strings.
 *
 * These are part of the page structure, not CMS content: field labels, button
 * labels, aria labels and system messages. Each string carries an English and,
 * where the interface already shows one, a Korean variant. Render both when the
 * design shows a Korean pair; otherwise use `.en`.
 */

export interface UiText {
  en: string
  kr?: string
}

const text = (en: string, kr?: string): UiText => (kr ? { en, kr } : { en })

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
    basedIn: text('Based in'),
    scrollHint: text('Scroll to explore ↓'),
    metaRight: (current: number, total: number) =>
      `Selected work · ${String(current).padStart(2, '0')} / ${String(total).padStart(2, '0')}`,
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
    previewAlt: (title: string) => `${title} preview`,
    openCaseStudy: (title: string) => `Open the ${title} case study`,
    sourceTitle: text('View source code'),
    executionPhases: (count: number) =>
      `${count} Execution ${count === 1 ? 'Phase' : 'Phases'}`,
  },
  contact: {
    formTitle: text('Send a direct message', '문의하기'),
    name: text('Full Name'),
    namePlaceholder: 'e.g. Maya Sharma',
    email: text('Email Address'),
    emailPlaceholder: 'e.g. maya@example.com',
    subject: text('Topic or Project'),
    subjectPlaceholder: 'e.g. Full-stack engineering / Project collaboration',
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
    photographs: (count: number) => `${count} ${count === 1 ? 'photograph' : 'photographs'}`,
    collectionAria: text('Photography collection'),
  },
  media: {
    previewAria: text('Media preview'),
    entries: (count: number) => `${count} ${count === 1 ? 'entry' : 'entries'}`,
    viewAllCategory: (label: string) => `View all ${label.toLowerCase()}`,
    collectionAria: (label: string) => `${label} collection`,
  },
  journal: {
    label: text('Journal'),
    krEyebrow: text('글'),
    eyebrow: (category: string) => `Journal / ${category}`,
    allNotes: text('All notes'),
    startConversation: text('Start a conversation'),
    readNote: text('Read note'),
    publishedNotes: (count: number) =>
      `${count} published ${count === 1 ? 'note' : 'notes'}`,
    minRead: (minutes: number) => `${minutes} min read`,
    words: (count: number) => `~${count} words`,
    readingTimeTitle: (words: number) =>
      `Estimated reading time: ~${words} words at 200 WPM`,
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
    showingCount: (visible: number, total: number) =>
      visible === total
        ? `${total} ${total === 1 ? 'project' : 'projects'}`
        : `${visible} of ${total} ${total === 1 ? 'project' : 'projects'}`,
    noMatchesTitle: text('No projects match your current filters.'),
    noMatchesHint: text('Try adjusting your search query, category, or technology filters.'),
    showMoreTech: (count: number) => `+${count} more`,
    showLessTech: text('Show less'),
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

/** The filename-safe Korean/English pair, for content rendered in a `<span lang="ko">`. */
export function korean(value: UiText): string | undefined {
  return value.kr
}
