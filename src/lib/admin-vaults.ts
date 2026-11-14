import { CMS_COLLECTIONS } from '@/lib/cms-schema'

export type VaultId =
  | 'music'
  | 'gallery'
  | 'media'
  | 'blogs'
  | 'projects'
  | 'career'
  | 'meta'

export type VaultIconName =
  | 'music'
  | 'image'
  | 'film'
  | 'file'
  | 'folder'
  | 'graduation'
  | 'globe'

export type VaultFieldType =
  | 'text'
  | 'textarea'
  | 'url'
  | 'image'
  | 'audio'
  | 'select'
  | 'tags'
  | 'boolean'
  | 'number'
  | 'date'
  | 'markdown'
  | 'json'
  | 'key'

export interface VaultField {
  key: string
  label: string
  type: VaultFieldType
  placeholder?: string
  help?: string
  required?: boolean
  options?: { label: string; value: string }[]
  span?: 'half' | 'full'
}

export interface VaultTab {
  id: string
  label: string
  collections: string[]
  fields?: VaultField[]
  keyed?: boolean
}

export interface VaultDefinition {
  id: VaultId
  eyebrow: string
  title: string
  description: string
  itemNoun: string
  addLabel: string
  icon: VaultIconName
  syncLabel: string
  storageSensitive?: boolean
  allowBulkUpload?: boolean
  filterKey?: string
  categories?: string[]
  tabs: VaultTab[]
  fields: VaultField[]
}

export interface VaultRecord {
  id: number
  collection: string
  title: string
  status: string
  payload: Record<string, unknown>
  createdAt?: Date | string
  updatedAt?: Date | string
}

const musicFields: VaultField[] = [
  { key: 'artist', label: 'Artist', type: 'text', placeholder: 'Artist or project name' },
  { key: 'subtitle', label: 'Album / EP', type: 'text', placeholder: 'Release name' },
  { key: 'coverUrl', label: 'Cover art', type: 'image', span: 'full' },
  {
    key: 'externalUrl',
    label: 'Audio file or stream URL',
    type: 'audio',
    span: 'full',
    help: 'Upload an MP3, WAV or M4A, or paste a streaming URL.',
  },
  {
    key: 'platform',
    label: 'Platform',
    type: 'select',
    options: [
      { label: 'Spotify', value: 'Spotify' },
      { label: 'YouTube', value: 'YouTube' },
      { label: 'SoundCloud', value: 'SoundCloud' },
      { label: 'Apple Music', value: 'Apple Music' },
      { label: 'Bandcamp', value: 'Bandcamp' },
      { label: 'Other', value: 'Other' },
    ],
  },
  { key: 'platformUrl', label: 'Platform URL', type: 'url', placeholder: 'https://open.spotify.com/…' },
  {
    key: 'playlist',
    label: 'Playlist',
    type: 'select',
    options: [
      { label: 'Singles', value: 'Singles' },
      { label: 'Album', value: 'Album' },
      { label: 'EP', value: 'EP' },
      { label: 'Playlist', value: 'Playlist' },
      { label: 'Live', value: 'Live' },
    ],
  },
  { key: 'lyrics', label: 'Lyrics / listening notes', type: 'textarea', span: 'full' },
  { key: 'featured', label: 'Feature in the music shelf', type: 'boolean', span: 'full' },
]

const galleryFields: VaultField[] = [
  { key: 'imageUrl', label: 'Image', type: 'image', span: 'full', required: true },
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    options: ['Road Running', 'Muzik', 'Travel', 'Setup', 'Portraits', 'Experiments'].map((value) => ({
      label: value,
      value,
    })),
  },
  {
    key: 'location',
    label: 'Publishes to',
    type: 'select',
    options: [
      { label: 'Gallery grid (/about/gallery)', value: 'Gallery grid' },
      { label: 'Home gallery', value: 'Home gallery' },
      { label: 'Collection cover', value: 'Collection cover' },
    ],
  },
  { key: 'altText', label: 'Alt text', type: 'text', span: 'full' },
  { key: 'description', label: 'Caption', type: 'textarea', span: 'full' },
  { key: 'featured', label: 'Feature this frame', type: 'boolean', span: 'full' },
]

const mediaFields: VaultField[] = [
  { key: 'coverUrl', label: 'Cover art', type: 'image', span: 'full' },
  { key: 'creator', label: 'Creator / studio', type: 'text' },
  { key: 'year', label: 'Year', type: 'text', placeholder: '2026' },
  {
    key: 'category',
    label: 'Watch status',
    type: 'select',
    options: [
      { label: 'Watching', value: 'Watching' },
      { label: 'Watchlist', value: 'Watchlist' },
      { label: 'Completed', value: 'Completed' },
      { label: 'Dropped', value: 'Dropped' },
    ],
  },
  { key: 'rating', label: 'Rating / 10', type: 'number', placeholder: '8.5' },
  { key: 'externalUrl', label: 'Reference URL', type: 'url', placeholder: 'https://…' },
  { key: 'review', label: 'Review / notes', type: 'textarea', span: 'full' },
  { key: 'featured', label: 'Feature in the media shelf', type: 'boolean', span: 'full' },
]

const blogFields: VaultField[] = [
  { key: 'coverUrl', label: 'Cover image', type: 'image', span: 'full' },
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    options: ['Essay', 'Note', 'Tutorial', 'Journal'].map((value) => ({ label: value, value })),
  },
  { key: 'publishAt', label: 'Publish schedule', type: 'date' },
  { key: 'excerpt', label: 'Excerpt', type: 'textarea', span: 'full' },
  { key: 'body', label: 'Article body', type: 'markdown', span: 'full' },
  { key: 'tags', label: 'Tags', type: 'tags', span: 'full' },
  { key: 'seoTitle', label: 'SEO title', type: 'text', span: 'full' },
  { key: 'seoDescription', label: 'SEO description', type: 'textarea', span: 'full' },
]

const projectFields: VaultField[] = [
  { key: 'imageUrl', label: 'Project image', type: 'image', span: 'full' },
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    options: ['Web App', 'Product', 'Experiment', 'Open Source'].map((value) => ({
      label: value,
      value,
    })),
  },
  { key: 'summary', label: 'Short summary', type: 'text', span: 'full' },
  { key: 'techStack', label: 'Tech stack', type: 'tags', span: 'full' },
  { key: 'liveUrl', label: 'Live URL', type: 'url' },
  { key: 'githubUrl', label: 'Repository URL', type: 'url' },
  { key: 'description', label: 'Case study', type: 'markdown', span: 'full' },
  { key: 'featured', label: 'Feature on /projects', type: 'boolean', span: 'full' },
]

const careerBaseFields: VaultField[] = [
  { key: 'organization', label: 'Organisation', type: 'text' },
  { key: 'period', label: 'Period', type: 'text', placeholder: '2024 — Present' },
  { key: 'location', label: 'Location', type: 'text' },
  { key: 'tags', label: 'Skills / focus', type: 'tags', span: 'full' },
  { key: 'description', label: 'Description', type: 'textarea', span: 'full' },
]

const metaProfileFields: VaultField[] = [
  { key: 'fullName', label: 'Full name', type: 'text' },
  { key: 'headline', label: 'Headline', type: 'text' },
  { key: 'avatarUrl', label: 'Portrait', type: 'image', span: 'full' },
  { key: 'summary', label: 'Short summary', type: 'textarea', span: 'full' },
  { key: 'bio', label: 'Long bio', type: 'markdown', span: 'full' },
  { key: 'location', label: 'Location', type: 'text' },
  { key: 'email', label: 'Public email', type: 'text' },
  { key: 'github', label: 'GitHub URL', type: 'url' },
  { key: 'linkedin', label: 'LinkedIn URL', type: 'url' },
  { key: 'website', label: 'Website', type: 'url' },
]

const metaSocialFields: VaultField[] = [
  { key: 'label', label: 'Label', type: 'text', placeholder: 'GitHub' },
  { key: 'href', label: 'URL', type: 'url', placeholder: 'https://github.com/…' },
  { key: 'kind', label: 'Icon key', type: 'text', placeholder: 'github' },
  { key: 'featured', label: 'Show in the footer / about page', type: 'boolean', span: 'full' },
]

const metaPageCopyFields: VaultField[] = [
  { key: 'key', label: 'Page key', type: 'key', help: 'Locked identifier used by the public page.' },
  { key: 'description', label: 'Intro / description', type: 'textarea', span: 'full' },
  { key: 'seoTitle', label: 'SEO title', type: 'text', span: 'full' },
  { key: 'seoDescription', label: 'SEO description', type: 'textarea', span: 'full' },
  { key: 'ogImage', label: 'Social share image', type: 'image', span: 'full' },
]

const metaSiteFields: VaultField[] = [
  { key: 'key', label: 'Setting key', type: 'key', help: 'Locked identifier used by the public layout.' },
  { key: 'json', label: 'Payload (JSON)', type: 'json', span: 'full' },
]

export const VAULTS: Record<VaultId, VaultDefinition> = {
  music: {
    id: 'music',
    eyebrow: 'Listening room',
    title: 'Music Vault',
    description: 'Tracks, playlists, stream links and the audio that powers the listening shelf.',
    itemNoun: 'tracks',
    addLabel: 'Add track',
    icon: 'music',
    syncLabel: 'Platform links tracked',
    storageSensitive: true,
    filterKey: 'playlist',
    categories: ['Singles', 'Album', 'EP', 'Playlist', 'Live'],
    tabs: [{ id: 'music', label: 'All tracks', collections: [CMS_COLLECTIONS.music], fields: musicFields }],
    fields: musicFields,
  },
  gallery: {
    id: 'gallery',
    eyebrow: 'Visual archive',
    title: 'Gallery Vault',
    description: 'Photographic frames, covers and experiments, grouped by the collection they belong to.',
    itemNoun: 'frames',
    addLabel: 'Add frame',
    icon: 'image',
    syncLabel: 'Blob storage',
    storageSensitive: true,
    allowBulkUpload: true,
    filterKey: 'category',
    categories: ['Road Running', 'Muzik', 'Travel', 'Setup', 'Portraits', 'Experiments'],
    tabs: [{ id: 'gallery', label: 'All frames', collections: [CMS_COLLECTIONS.gallery], fields: galleryFields }],
    fields: galleryFields,
  },
  media: {
    id: 'media',
    eyebrow: 'Screen shelf',
    title: 'Media Vault',
    description: 'Movies, anime and manga with watchlists, ratings, reviews and cover art.',
    itemNoun: 'titles',
    addLabel: 'Add title',
    icon: 'film',
    syncLabel: 'Watchlist data',
    storageSensitive: true,
    allowBulkUpload: true,
    filterKey: 'category',
    categories: ['Watching', 'Watchlist', 'Completed', 'Dropped'],
    tabs: [
      { id: 'movies', label: 'Movies', collections: [CMS_COLLECTIONS.movies], fields: mediaFields },
      { id: 'anime', label: 'Anime', collections: [CMS_COLLECTIONS.anime], fields: mediaFields },
      { id: 'manga', label: 'Manga', collections: [CMS_COLLECTIONS.manga], fields: mediaFields },
    ],
    fields: mediaFields,
  },
  blogs: {
    id: 'blogs',
    eyebrow: 'Writing desk',
    title: 'Blogs & Writing',
    description: 'Essays, notes and journals with Markdown drafts, tags and publishing schedules.',
    itemNoun: 'posts',
    addLabel: 'Write post',
    icon: 'file',
    syncLabel: 'Publishing queue',
    filterKey: 'category',
    categories: ['Essay', 'Note', 'Tutorial', 'Journal'],
    tabs: [{ id: 'blogs', label: 'All posts', collections: [CMS_COLLECTIONS.blogs], fields: blogFields }],
    fields: blogFields,
  },
  projects: {
    id: 'projects',
    eyebrow: 'Build log',
    title: 'Projects & Code',
    description: 'Case studies, product work and open-source experiments with repository links.',
    itemNoun: 'projects',
    addLabel: 'Add project',
    icon: 'folder',
    syncLabel: 'Repository data',
    filterKey: 'category',
    categories: ['Web App', 'Product', 'Experiment', 'Open Source'],
    tabs: [{ id: 'projects', label: 'All projects', collections: [CMS_COLLECTIONS.projects], fields: projectFields }],
    fields: projectFields,
  },
  career: {
    id: 'career',
    eyebrow: 'The path',
    title: 'Career Vault',
    description: 'The education, experience, skills and certificates timeline shown across the site.',
    itemNoun: 'entries',
    addLabel: 'Add entry',
    icon: 'graduation',
    syncLabel: 'Timeline data',
    tabs: [
      { id: 'experience', label: 'Experience', collections: [CMS_COLLECTIONS.experience], fields: careerBaseFields },
      {
        id: 'education',
        label: 'Education',
        collections: [CMS_COLLECTIONS.education],
        fields: [
          { key: 'organization', label: 'Institution', type: 'text' },
          { key: 'period', label: 'Period', type: 'text', placeholder: '2020 — 2024' },
          { key: 'location', label: 'Location', type: 'text' },
          { key: 'tags', label: 'Focus areas', type: 'tags', span: 'full' },
          { key: 'description', label: 'Description', type: 'textarea', span: 'full' },
        ],
      },
      {
        id: 'skills',
        label: 'Skills',
        collections: [CMS_COLLECTIONS.skills],
        fields: [
          { key: 'category', label: 'Skill group', type: 'text', placeholder: 'Engineering' },
          {
            key: 'level',
            label: 'Level',
            type: 'select',
            options: [
              { label: 'Learning', value: 'Learning' },
              { label: 'Comfortable', value: 'Comfortable' },
              { label: 'Advanced', value: 'Advanced' },
              { label: 'Expert', value: 'Expert' },
            ],
          },
          { key: 'description', label: 'Notes', type: 'textarea', span: 'full' },
        ],
      },
      {
        id: 'certificates',
        label: 'Certificates',
        collections: [CMS_COLLECTIONS.certificates],
        fields: [
          { key: 'organization', label: 'Issuer', type: 'text' },
          { key: 'period', label: 'Date', type: 'text', placeholder: '2025' },
          { key: 'credentialUrl', label: 'Credential URL', type: 'url', span: 'full' },
          { key: 'description', label: 'Description', type: 'textarea', span: 'full' },
        ],
      },
    ],
    fields: careerBaseFields,
  },
  meta: {
    id: 'meta',
    eyebrow: 'Identity & discovery',
    title: 'About & Meta',
    description: 'Profile details, social links, page copy and the global settings that shape the site.',
    itemNoun: 'settings',
    addLabel: 'Add record',
    icon: 'globe',
    syncLabel: 'Site settings connected',
    storageSensitive: true,
    tabs: [
      { id: 'profile', label: 'Profile', collections: [CMS_COLLECTIONS.profile], fields: metaProfileFields },
      {
        id: 'social',
        label: 'Social links',
        collections: [CMS_COLLECTIONS.socialLinks],
        fields: metaSocialFields,
      },
      {
        id: 'copy',
        label: 'Page copy & SEO',
        collections: [CMS_COLLECTIONS.pageCopy],
        fields: metaPageCopyFields,
        keyed: true,
      },
      {
        id: 'settings',
        label: 'Site settings',
        collections: [CMS_COLLECTIONS.siteSettings],
        fields: metaSiteFields,
        keyed: true,
      },
    ],
    fields: metaProfileFields,
  },
}

export const VAULT_ROUTES: Record<VaultId, string> = {
  music: '/admin/music',
  gallery: '/admin/gallery',
  media: '/admin/media',
  blogs: '/admin/blogs',
  projects: '/admin/projects',
  career: '/admin/career',
  meta: '/admin/meta',
}

export function isVaultId(value: string): value is VaultId {
  return value in VAULTS
}

export function recordsForVault(vault: VaultDefinition, records: VaultRecord[]) {
  const collections = new Set(vault.tabs.flatMap((tab) => tab.collections))
  return records.filter((record) => collections.has(record.collection))
}

export function fieldsForTab(vault: VaultDefinition, tabId: string) {
  return vault.tabs.find((tab) => tab.id === tabId)?.fields ?? vault.fields
}

export function tabForCollection(vault: VaultDefinition, collection: string) {
  return vault.tabs.find((tab) => tab.collections.includes(collection)) ?? vault.tabs[0]
}

export function publicPathForCollection(collection: string) {
  switch (collection) {
    case CMS_COLLECTIONS.music:
      return '/media/music'
    case CMS_COLLECTIONS.gallery:
      return '/about/gallery'
    case CMS_COLLECTIONS.movies:
      return '/media/movies'
    case CMS_COLLECTIONS.anime:
      return '/media/anime'
    case CMS_COLLECTIONS.manga:
      return '/media/manga'
    case CMS_COLLECTIONS.blogs:
      return '/blogs'
    case CMS_COLLECTIONS.projects:
      return '/projects'
    case CMS_COLLECTIONS.experience:
      return '/experience'
    case CMS_COLLECTIONS.education:
      return '/education'
    case CMS_COLLECTIONS.skills:
      return '/skills'
    case CMS_COLLECTIONS.certificates:
      return '/certificates'
    case CMS_COLLECTIONS.profile:
    case CMS_COLLECTIONS.socialLinks:
      return '/about'
    default:
      return '/'
  }
}
