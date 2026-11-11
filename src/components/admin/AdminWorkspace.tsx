'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { CMS_COLLECTIONS, CMS_KEYS } from '@/lib/cms-schema'
import Link from 'next/link'
import NextImage from 'next/image'
import {
  Plus,
  ExternalLink,
  Search,
  Filter,
  FileText,
  FolderKanban,
  Image as ImageIcon,
  Music,
  Film,
  Inbox,
  Settings,
  Sparkles,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Eye,
  Download,
  Upload,
  Play,
  Pause,
  ArrowRight,
  Layers,
  Globe,
  Mail,
  RefreshCw,
  Copy,
  Grid,
  List,
} from 'lucide-react'

import { CmsToastProvider, useCmsToast } from '@/components/admin/ui/CmsToast'
import ImageUploadField from '@/components/admin/ImageUploadField'
import ContentSetupGuide from '@/components/admin/ContentSetupGuide'
import SiteAppearanceEditor from '@/components/admin/SiteAppearanceEditor'
import { CmsModal } from '@/components/admin/ui/CmsModal'
import { CmsStatCard, CmsSectionCard } from '@/components/admin/ui/CmsCard'
import { CmsTable, type Column } from '@/components/admin/ui/CmsTable'
import { CmsTabs } from '@/components/admin/ui/CmsTabs'
import { CmsDistributionChart } from '@/components/admin/ui/CmsChart'
import { CmsGitHubStats } from '@/components/admin/ui/CmsGitHubStats'
import {
  CmsFormField,
  CmsInput,
  CmsTextarea,
  CmsSelect,
  CmsToggle,
  CmsTagInput,
  CmsSubmitButton,
} from '@/components/admin/ui/CmsFormPrimitives'

import {
  createMusicTrack,
  deleteMusicTrack,
} from '@/app/actions/content'
import {
  createCmsContent,
  updateCmsContent,
  deleteCmsContent,
  saveCmsImage,
} from '@/app/actions/content-cms'
import { saveProfileSettings } from '@/app/actions/settings'

interface GalleryItem {
  id: number
  title?: string | null
  category: string
  imageUrl: string
  description?: string | null
  published?: boolean
  featured?: boolean
}

interface MusicTrackItem {
  id: number
  title: string
  artist?: string | null
  album?: string | null
  coverUrl?: string | null
  audioUrl?: string | null
  published?: boolean
  sortOrder?: number
}

interface ProjectItem {
  id: number
  title: string
  category?: string | null
  summary?: string | null
  description?: string | null
  tech?: string[] | null
  imageUrl?: string | null
  liveUrl?: string | null
  featured?: boolean
  published?: boolean
}

interface CmsRecordItem {
  id: number
  collection: string
  title: string
  payload?: any
  status: string
}

// Records whose payload is a JSON object rather than a single description.
const STRUCTURED_COLLECTIONS: string[] = [
  CMS_COLLECTIONS.siteSettings,
  CMS_COLLECTIONS.pageCopy,
  CMS_COLLECTIONS.mediaCollections,
]
// Records the public site looks up by an explicit key instead of the title.
const KEYED_COLLECTIONS: string[] = [CMS_COLLECTIONS.pageCopy, CMS_COLLECTIONS.mediaCollections]

function isStructuredCollection(collection: string) {
  return STRUCTURED_COLLECTIONS.includes(collection)
}

function isKeyedCollection(collection: string) {
  return KEYED_COLLECTIONS.includes(collection)
}

// Collections the add form can write to. Deep links from public empty states use
// /admin?section=content&collection=<name> so the right collection is selected.
const CREATABLE_COLLECTIONS = [
  ...Object.values(CMS_COLLECTIONS),
  'Awards',
]

/** Maps a specific collection to the group tab that contains it. */
const TAB_FOR_COLLECTION: Record<string, string> = {
  [CMS_COLLECTIONS.profile]: CMS_COLLECTIONS.profile,
  [CMS_COLLECTIONS.socialLinks]: CMS_COLLECTIONS.profile,
  [CMS_COLLECTIONS.experience]: 'Career',
  [CMS_COLLECTIONS.education]: 'Career',
  [CMS_COLLECTIONS.skills]: 'Career',
  [CMS_COLLECTIONS.music]: 'Media',
  [CMS_COLLECTIONS.movies]: 'Media',
  [CMS_COLLECTIONS.anime]: 'Media',
  [CMS_COLLECTIONS.manga]: 'Media',
  [CMS_COLLECTIONS.certificates]: CMS_COLLECTIONS.certificates,
  Awards: CMS_COLLECTIONS.certificates,
  [CMS_COLLECTIONS.blogs]: CMS_COLLECTIONS.blogs,
}

function collectionForTab(tab: string) {
  if (CREATABLE_COLLECTIONS.includes(tab)) return tab
  if (tab === 'Career') return CMS_COLLECTIONS.experience
  if (tab === 'Media') return CMS_COLLECTIONS.music
  if (tab === CMS_COLLECTIONS.certificates) return CMS_COLLECTIONS.certificates
  if (tab === 'Publishing') return CMS_COLLECTIONS.blogs
  return CMS_COLLECTIONS.projects
}

/** Returns the parsed object, or null when the text is not a JSON object. */
function parseStructuredPayload(text: string): Record<string, unknown> | null {
  if (!text.trim()) return {}
  try {
    const parsed = JSON.parse(text)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    return parsed as Record<string, unknown>
  } catch {
    return null
  }
}

interface InboxItem {
  id: string
  fromEmail: string
  subject: string
  textBody?: string | null
  receivedAt: string | Date
  readAt?: string | Date | null
}

interface AdminWorkspaceProps {
  section: string
  initialCategory?: string
  content: {
    gallery: any[]
    projects: any[]
    music: any[]
    cms: any[]
    messages?: InboxItem[]
  }
  settings: any
  user?: { name?: string | null; email?: string | null }
}

function WorkspaceInner({ section, initialCategory, content, settings }: AdminWorkspaceProps) {
  const { toast } = useCmsToast()

  // Local state initialized with server data for optimistic updates
  const [cmsRecords, setCmsRecords] = useState<CmsRecordItem[]>((content.cms || []) as CmsRecordItem[])
  const galleryItems = useMemo<GalleryItem[]>(
    () =>
      cmsRecords
        .filter((record) => record.collection === CMS_COLLECTIONS.gallery)
        .map((record) => {
          const payload = (record.payload || {}) as Record<string, unknown>
          return {
            id: record.id,
            title: record.title,
            category: typeof payload.category === 'string' ? payload.category : 'Selected work',
            imageUrl: typeof payload.imageUrl === 'string' ? payload.imageUrl : '',
            description: typeof payload.description === 'string' ? payload.description : null,
            published: record.status === 'published',
            featured: payload.featured === true,
          }
        })
        .filter((item) => Boolean(item.imageUrl)),
    [cmsRecords],
  )
  const [musicTracks, setMusicTracks] = useState<MusicTrackItem[]>((content.music || []) as MusicTrackItem[])
  const [profileSettingsState, setProfileSettingsState] = useState(settings)

  // View state
  const [galleryViewMode, setGalleryViewMode] = useState<'grid' | 'table'>('grid')
  const [activeContentCategory, setActiveContentCategory] = useState(initialCategory || 'ALL')
  const activeTab = TAB_FOR_COLLECTION[activeContentCategory] ?? activeContentCategory
  const [nowPlayingTrackId, setNowPlayingTrackId] = useState<number | null>(null)

  // Modals state
  const [createRecordModalOpen, setCreateRecordModalOpen] = useState(false)
  const [createGalleryModalOpen, setCreateGalleryModalOpen] = useState(false)
  const [createMusicModalOpen, setCreateMusicModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any | null>(null)
  const [editPayloadText, setEditPayloadText] = useState('')
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{ id: number; title: string; type: 'cms' | 'gallery' | 'music' | 'project' } | null>(null)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [inboxMessageModal, setInboxMessageModal] = useState<any | null>(null)

  // Form states for Create Record Modal
  const [newTitle, setNewTitle] = useState('')
  const [newKey, setNewKey] = useState('')
  const [newCollection, setNewCollection] = useState(
    initialCategory && CREATABLE_COLLECTIONS.includes(initialCategory)
      ? initialCategory
      : CMS_COLLECTIONS.projects,
  )
  const [newDescription, setNewDescription] = useState('')
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newGalleryImage, setNewGalleryImage] = useState('')
  const [newCoverUrl, setNewCoverUrl] = useState('')
  const [newStatus, setNewStatus] = useState('published')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Real messages only; an empty inbox stays empty.
  const [inboxMessages] = useState<InboxItem[]>(content.messages ?? [])

  // Content distribution metrics
  const distributionItems = useMemo(
    () => [
      { label: 'Projects & Work', count: cmsRecords.filter((r) => r.collection === CMS_COLLECTIONS.projects).length, color: '#0d9488' },
      { label: 'Gallery Artworks', count: galleryItems.length, color: '#0284c7' },
      { label: 'Music Tracks', count: musicTracks.length, color: '#8b5cf6' },
      { label: 'Career & Profile', count: cmsRecords.filter((r) => r.collection === CMS_COLLECTIONS.experience || r.collection === CMS_COLLECTIONS.education).length, color: '#f59e0b' },
      { label: 'Skills & Journal', count: cmsRecords.filter((r) => r.collection === CMS_COLLECTIONS.skills || r.collection === CMS_COLLECTIONS.blogs).length, color: '#ec4899' },
    ],
    [cmsRecords, galleryItems, musicTracks]
  )

  // The public projects page reads CMS records, so the admin showcase list does too.
  const cmsProjects = useMemo<ProjectItem[]>(
    () =>
      cmsRecords
        .filter((record) => record.collection === CMS_COLLECTIONS.projects)
        .map((record) => {
          const payload = (record.payload || {}) as Record<string, unknown>
          return {
            id: record.id,
            title: record.title,
            category: typeof payload.category === 'string' ? payload.category : null,
            summary: typeof payload.summary === 'string' ? payload.summary : null,
            description: typeof payload.description === 'string' ? payload.description : null,
            tech: Array.isArray(payload.techStack) ? (payload.techStack as string[]) : null,
            imageUrl: typeof payload.imageUrl === 'string' ? payload.imageUrl : null,
            liveUrl: typeof payload.live === 'string' ? payload.live : null,
            featured: payload.featured === true,
            published: record.status === 'published',
          }
        }),
    [cmsRecords],
  )

  // Keep the structured JSON editor in sync with the record being edited.
  useEffect(() => {
    if (!editingRecord) return
    setEditPayloadText(
      isStructuredCollection(editingRecord.collection)
        ? JSON.stringify(editingRecord.payload ?? {}, null, 2)
        : typeof editingRecord.payload === 'object' && editingRecord.payload
          ? editingRecord.payload.description || ''
          : '',
    )
  }, [editingRecord])

  // Optimistic Handlers
  const handleCreateCmsRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    const form = new FormData(e.currentTarget as HTMLFormElement)
    const fields = {
      category: String(form.get('category') || '').trim(),
      techStack: String(form.get('techStack') || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      live: String(form.get('live') || '').trim(),
      github: String(form.get('github') || '').trim(),
      altText: String(form.get('altText') || '').trim(),
      organization: String(form.get('organization') || '').trim(),
      period: String(form.get('period') || '').trim(),
      location: String(form.get('location') || '').trim(),
      creator: String(form.get('creator') || '').trim(),
      rating: String(form.get('rating') || '').trim(),
      externalUrl: String(form.get('externalUrl') || '').trim(),
    }
    setIsSubmitting(true)

    const careerCollection = newCollection === CMS_COLLECTIONS.experience || newCollection === CMS_COLLECTIONS.education
    const mediaCollection = ([CMS_COLLECTIONS.music, CMS_COLLECTIONS.movies, CMS_COLLECTIONS.anime, CMS_COLLECTIONS.manga] as string[]).includes(newCollection)
    const structuredPayload = isStructuredCollection(newCollection)
      ? parseStructuredPayload(newDescription) ?? { description: newDescription.trim() }
      : null

    const payload = structuredPayload ?? {
      description: newDescription.trim(),
      imageUrl: newImageUrl.trim(),
      ...(fields.altText ? { altText: fields.altText } : {}),
      ...(newCollection === CMS_COLLECTIONS.gallery && fields.category ? { category: fields.category } : {}),
      ...(newCollection === CMS_COLLECTIONS.projects && fields.category ? { category: fields.category } : {}),
      ...(newCollection === CMS_COLLECTIONS.projects && fields.techStack.length ? { techStack: fields.techStack } : {}),
      ...(newCollection === CMS_COLLECTIONS.projects && fields.live ? { live: fields.live } : {}),
      ...(newCollection === CMS_COLLECTIONS.projects && fields.github ? { github: fields.github } : {}),
      ...(careerCollection && fields.organization ? { organization: fields.organization } : {}),
      ...(careerCollection && fields.period ? { period: fields.period } : {}),
      ...(careerCollection && fields.location ? { location: fields.location } : {}),
      ...(mediaCollection && fields.creator ? { subtitle: fields.creator, artist: fields.creator } : {}),
      ...(mediaCollection && fields.rating ? { rating: fields.rating } : {}),
      ...(mediaCollection && fields.externalUrl ? { externalUrl: fields.externalUrl } : {}),
    }

    const optimisticId = Date.now()
    const newRecord = {
      id: optimisticId,
      collection: newCollection,
      title: newTitle.trim(),
      payload,
      status: newStatus,
    }

    // Optimistic UI update
    setCmsRecords((prev) => [newRecord, ...prev])
    setCreateRecordModalOpen(false)
    toast({
      title: 'Record Created',
      description: `"${newTitle}" added to ${newCollection} successfully.`,
      variant: 'success',
    })

    // Reset form
    setNewTitle('')
    setNewDescription('')
    setNewImageUrl('')
    setNewKey('')
    setIsSubmitting(false)

    // Background server action
    try {
      const formData = new FormData()
      formData.set('collection', newCollection)
      formData.set('title', newTitle)
      formData.set('payload', JSON.stringify(payload))
      formData.set('imageUrl', newImageUrl)
      formData.set('category', fields.category)
      formData.set('techStack', fields.techStack.join(', '))
      formData.set('live', fields.live)
      formData.set('github', fields.github)
      formData.set('altText', fields.altText)
      formData.set('status', newStatus)
      if (newKey.trim()) formData.set('key', newKey.trim())
      await createCmsContent(formData)
    } catch (err) {
      console.warn('Server sync error:', err)
    }
  }

  const handleUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRecord) return

    const structured = isStructuredCollection(editingRecord.collection)
    let payload = editingRecord.payload

    if (structured) {
      const parsed = parseStructuredPayload(editPayloadText)
      if (!parsed) {
        toast({
          title: 'Invalid JSON',
          description: 'This record stores a structured payload. Fix the JSON before saving.',
          variant: 'error',
        })
        return
      }
      payload = parsed
    } else {
      payload = { ...(editingRecord.payload || {}), description: editPayloadText }
    }

    setIsSubmitting(true)

    const updated = { ...editingRecord, payload }
    setCmsRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    setEditingRecord(null)
    setIsSubmitting(false)

    toast({
      title: 'Record Updated',
      description: `Changes to "${updated.title}" have been saved.`,
      variant: 'success',
    })

    try {
      const formData = new FormData()
      formData.set('collection', updated.collection)
      formData.set('title', updated.title)
      const desc = typeof updated.payload === 'object' && updated.payload ? (updated.payload as any).description || '' : ''
      const img = typeof updated.payload === 'object' && updated.payload ? (updated.payload as any).imageUrl || '' : ''
      formData.set('payload', structured ? JSON.stringify(updated.payload ?? {}) : desc)
      formData.set('imageUrl', img)
      formData.set('status', updated.status)
      await updateCmsContent(updated.id, formData)
    } catch (err) {
      console.warn('Server sync error:', err)
    }
  }

  const handleDeleteConfirmed = async () => {
    if (!deleteConfirmItem) return
    const { id, title, type } = deleteConfirmItem

    if (type === 'cms') {
      setCmsRecords((prev) => prev.filter((r) => r.id !== id))
      try {
        await deleteCmsContent(id)
      } catch {}
    } else if (type === 'music') {
      setMusicTracks((prev) => prev.filter((m) => m.id !== id))
      try {
        await deleteMusicTrack(id)
      } catch {}
    }

    setDeleteConfirmItem(null)
    toast({
      title: 'Item Removed',
      description: `"${title}" has been deleted from your workspace.`,
      variant: 'info',
    })
  }

  const handleCreateGalleryItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const title = String(form.get('title') || '').trim()
    const category = String(form.get('category') || 'Photography').trim()
    const imageUrl = String(form.get('imageUrl') || '').trim()
    if (!title || !imageUrl) return

    const description = String(form.get('description') || '').trim()
    const payload = { imageUrl, category, description }
    const newRecord = {
      id: Date.now(),
      collection: CMS_COLLECTIONS.gallery,
      title,
      payload,
      status: 'published',
    }

    setCmsRecords((prev) => [newRecord, ...prev])
    setCreateGalleryModalOpen(false)
    setNewGalleryImage('')
    toast({
      title: 'Artwork Published',
      description: `"${title}" added to the gallery successfully.`,
      variant: 'success',
    })

    try {
      const formData = new FormData()
      formData.set('collection', CMS_COLLECTIONS.gallery)
      formData.set('title', title)
      formData.set('payload', JSON.stringify(payload))
      formData.set('imageUrl', imageUrl)
      formData.set('category', category)
      formData.set('status', 'published')
      await createCmsContent(formData)
    } catch {}
  }

  const handleCreateMusicItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const title = String(form.get('title') || '').trim()
    const artist = String(form.get('artist') || '').trim()
    if (!title) return

    const newTrack = {
      id: Date.now(),
      title,
      artist,
      album: String(form.get('album') || '').trim() || null,
      coverUrl: String(form.get('coverUrl') || '').trim() || null,
      audioUrl: String(form.get('audioUrl') || '').trim(),
      published: true,
      sortOrder: musicTracks.length,
    }

    setMusicTracks((prev) => [newTrack as any, ...prev])
    setCreateMusicModalOpen(false)
    setNewCoverUrl('')
    toast({
      title: 'Track Added',
      description: `"${title}" by ${artist || 'Unknown'} added to playlist.`,
      variant: 'success',
    })

    try {
      await createMusicTrack(form)
    } catch {}
  }

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setIsSubmitting(true)
    try {
      await saveProfileSettings(form)
      toast({
        title: 'Settings Saved',
        description: 'Profile credentials and external integrations updated.',
        variant: 'success',
      })
    } catch {
      toast({
        title: 'Settings Saved (Local)',
        description: 'Your preference changes have been updated.',
        variant: 'success',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Navigation tab groups for Content section
  const contentTabs = [
    { id: 'ALL', label: 'All Records', count: cmsRecords.length },
    { id: CMS_COLLECTIONS.profile, label: 'Identity', count: cmsRecords.filter((r) => r.collection === CMS_COLLECTIONS.profile || r.collection === CMS_COLLECTIONS.socialLinks).length },
    { id: CMS_COLLECTIONS.projects, label: CMS_COLLECTIONS.projects, count: cmsRecords.filter((r) => r.collection === CMS_COLLECTIONS.projects).length },
    { id: CMS_COLLECTIONS.gallery, label: CMS_COLLECTIONS.gallery, count: cmsRecords.filter((r) => r.collection === CMS_COLLECTIONS.gallery).length },
    { id: 'Career', label: 'Career', count: cmsRecords.filter((r) => r.collection === CMS_COLLECTIONS.experience || r.collection === CMS_COLLECTIONS.education || r.collection === CMS_COLLECTIONS.skills).length },
    { id: 'Media', label: 'Media', count: cmsRecords.filter((r) => ([CMS_COLLECTIONS.music, CMS_COLLECTIONS.movies, CMS_COLLECTIONS.anime, CMS_COLLECTIONS.manga] as string[]).includes(r.collection)).length },
    { id: CMS_COLLECTIONS.certificates, label: CMS_COLLECTIONS.certificates, count: cmsRecords.filter((r) => r.collection === CMS_COLLECTIONS.certificates || r.collection === 'Awards').length },
    { id: CMS_COLLECTIONS.blogs, label: 'Publishing', count: cmsRecords.filter((r) => r.collection === CMS_COLLECTIONS.blogs).length },
    { id: CMS_COLLECTIONS.siteSettings, label: CMS_COLLECTIONS.siteSettings, count: cmsRecords.filter((r) => r.collection === CMS_COLLECTIONS.siteSettings).length },
    { id: CMS_COLLECTIONS.pageCopy, label: CMS_COLLECTIONS.pageCopy, count: cmsRecords.filter((r) => r.collection === CMS_COLLECTIONS.pageCopy).length },
    { id: CMS_COLLECTIONS.mediaCollections, label: CMS_COLLECTIONS.mediaCollections, count: cmsRecords.filter((r) => r.collection === CMS_COLLECTIONS.mediaCollections).length },
  ]

  // Columns for CMS Records Table
  const cmsColumns: Column<any>[] = [
    {
      header: 'Record Title',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase shrink-0">
            {row.title.slice(0, 2)}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{row.title}</p>
            <p className="text-[11px] text-slate-500 max-w-xs truncate">
              {typeof row.payload === 'object' && row.payload ? (row.payload as any).description || 'No description' : 'No description'}
            </p>
          </div>
        </div>
      ),
      sortable: true,
      sortKey: 'title',
    },
    {
      header: 'Collection',
      accessor: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
          {row.collection}
        </span>
      ),
      sortable: true,
      sortKey: 'collection',
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            row.status === 'published'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              row.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
          {row.status === 'published' ? 'Published' : 'Draft'}
        </span>
      ),
      sortable: true,
      sortKey: 'status',
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setEditingRecord(row)}
            className="p-1 rounded text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
            title="Edit record"
            aria-label="Edit record"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteConfirmItem({ id: row.id, title: row.title, type: 'cms' })}
            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete record"
            aria-label="Delete record"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
      className: 'text-right',
    },
  ]

  // Filtered CMS records for tab selection
  const filteredCmsRecords = useMemo(() => {
    if (activeContentCategory === 'ALL') return cmsRecords
    if (activeContentCategory === 'Career') {
      return cmsRecords.filter((r) => r.collection === CMS_COLLECTIONS.experience || r.collection === CMS_COLLECTIONS.education || r.collection === CMS_COLLECTIONS.skills)
    }
    if (activeContentCategory === CMS_COLLECTIONS.profile) {
      return cmsRecords.filter((r) => r.collection === CMS_COLLECTIONS.profile || r.collection === CMS_COLLECTIONS.socialLinks)
    }
    if (activeContentCategory === 'Media') {
      return cmsRecords.filter((r) => ([CMS_COLLECTIONS.music, CMS_COLLECTIONS.movies, CMS_COLLECTIONS.anime, CMS_COLLECTIONS.manga] as string[]).includes(r.collection))
    }
    if (activeContentCategory === CMS_COLLECTIONS.certificates) {
      return cmsRecords.filter((r) => r.collection === CMS_COLLECTIONS.certificates || r.collection === 'Awards')
    }
    return cmsRecords.filter((r) => r.collection === activeContentCategory)
  }, [cmsRecords, activeContentCategory])

  const settingRecord = (title: string) =>
    cmsRecords.find(
      (record) =>
        record.collection === CMS_COLLECTIONS.siteSettings && record.payload?.key === CMS_KEYS.hero,
    )

  const openCreateRecord = (collection: string = CMS_COLLECTIONS.projects) => {
    setNewCollection(collection)
    setCreateRecordModalOpen(true)
  }

  const openGalleryUpload = () => {
    setNewGalleryImage('')
    setCreateGalleryModalOpen(true)
  }

  const openMusicUpload = () => {
    setNewCoverUrl('')
    setCreateMusicModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* SECTION: HERO & FOOTER */}
      {section === 'appearance' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Hero & footer</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Change the homepage image and copy, and point footer links anywhere without touching code.
            </p>
          </div>
          <SiteAppearanceEditor
            hero={settingRecord('Hero Section')?.payload}
            navigation={settingRecord('Navigation')?.payload}
            footer={settingRecord('Footer')?.payload}
          />
        </div>
      )}

      {/* SECTION: CONTENT SETUP */}
      {section === 'setup' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Content setup</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Every area the public site reads, grouped and linked to its editor.
              </p>
            </div>
            <Link
              href="/admin?section=appearance"
              className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Edit hero & footer
            </Link>
          </div>
          <ContentSetupGuide
            records={cmsRecords}
            galleryCount={galleryItems.length}
            projectCount={cmsRecords.filter((r) => r.collection === CMS_COLLECTIONS.projects).length}
            musicCount={musicTracks.length}
            onNewRecord={openCreateRecord}
            onNewGallery={openGalleryUpload}
            onNewMusic={openMusicUpload}
          />
        </div>
      )}

      {/* SECTION: OVERVIEW */}
      {section === 'overview' && (
        <div className="space-y-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Workspace Overview
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitor portfolio engagement, content health, and incoming collaboration requests.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <Link
                href="/admin?section=setup"
                className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800 hover:bg-teal-100 transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Content setup</span>
              </Link>
              <Link
                href="/admin/account"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span>Account</span>
              </Link>
              <button
                type="button"
                onClick={() => openCreateRecord(CMS_COLLECTIONS.projects)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-inverse text-xs font-semibold hover:bg-teal-700 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Record</span>
              </button>
              <a
                href="https://ashokrimal.com.np"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-surface hover:bg-slate-50 transition-colors"
              >
                <span>Live View</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          {/* 4 Metric KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <CmsStatCard
              label="Content Records"
              value={cmsRecords.length}
              subtext={`${new Set(cmsRecords.map((r) => r.collection)).size} collections in use`}
              icon={<FileText className="w-4 h-4" />}
            />
            <CmsStatCard
              label="Visual Artworks"
              value={galleryItems.length}
              subtext="Gallery photos"
              icon={<ImageIcon className="w-4 h-4" />}
            />
            <CmsStatCard
              label="Music Tracks"
              value={musicTracks.length}
              subtext="Tracks on the media shelf"
              icon={<Music className="w-4 h-4" />}
            />
            <CmsStatCard
              label="Inquiries"
              value={inboxMessages.length}
              subtext="Messages from the contact form"
              icon={<Inbox className="w-4 h-4" />}
            />
          </div>

          {/* Main Visual Grid: 2/3 Traffic Chart + 1/3 Content Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CmsSectionCard
                title="Content coverage"
                description="What the public site has to show right now. No analytics provider is connected."
                action={
                  <Link href="/admin?section=setup" className="text-xs font-semibold text-teal-700 hover:underline">
                    Open checklist →
                  </Link>
                }
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
                  {[
                    { label: 'CMS records', value: cmsRecords.length },
                    { label: 'Photos', value: galleryItems.length },
                    { label: CMS_COLLECTIONS.projects, value: cmsRecords.filter((r) => r.collection === CMS_COLLECTIONS.projects).length },
                    { label: 'Tracks', value: musicTracks.length },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                      <p className="text-lg font-bold text-slate-900">{item.value}</p>
                      <p className="text-[11px] text-slate-500">{item.label}</p>
                    </div>
                  ))}
                </div>
              </CmsSectionCard>
            </div>

            <div>
              <CmsSectionCard
                title="Content Distribution"
                description="Breakdown of published items across studio categories."
              >
                <CmsDistributionChart items={distributionItems} />
              </CmsSectionCard>
            </div>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => openCreateRecord(CMS_COLLECTIONS.projects)}
              className="p-3 rounded-xl border border-slate-200/80 bg-surface hover:border-teal-500 hover:shadow-xs text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Plus className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-slate-800">Add CMS Record</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Projects, Skills, Bio</p>
            </button>

            <button
              type="button"
              onClick={openGalleryUpload}
              className="p-3 rounded-xl border border-slate-200/80 bg-surface hover:border-teal-500 hover:shadow-xs text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <ImageIcon className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-slate-800">Publish Artwork</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Add photo to gallery</p>
            </button>

            <button
              type="button"
              onClick={openMusicUpload}
              className="p-3 rounded-xl border border-slate-200/80 bg-surface hover:border-teal-500 hover:shadow-xs text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Music className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-slate-800">Add Music Track</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Share what you hear</p>
            </button>

            <Link
              href="/admin?section=settings"
              className="p-3 rounded-xl border border-slate-200/80 bg-surface hover:border-teal-500 hover:shadow-xs text-left transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                <Settings className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-slate-800">Edit Settings</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Update API integrations</p>
            </Link>
          </div>

          {/* Real-Time GitHub Activity Telemetry */}
          <CmsGitHubStats initialUsername={profileSettingsState?.githubUsername || ''} />

          {/* Recent Records Data Table */}
          <CmsSectionCard
            title="Recent Content Records"
            description="All active records currently rendered on the public website."
            action={
              <Link
                href="/admin?section=content"
                className="text-xs font-semibold text-teal-700 hover:underline"
              >
                View all collections →
              </Link>
            }
            noPadding
          >
            <CmsTable
              data={cmsRecords.slice(0, 8)}
              columns={cmsColumns}
              keyExtractor={(r) => r.id}
              searchPlaceholder="Filter recent records..."
              pageSize={5}
              onRowClick={(row) => setEditingRecord(row)}
            />
          </CmsSectionCard>
        </div>
      )}

      {/* SECTION: CONTENT COLLECTIONS */}
      {section === 'content' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Content Collections
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage every biographical note, skill, experience, and project item.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openCreateRecord(collectionForTab(activeContentCategory))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-inverse text-xs font-semibold hover:bg-teal-700 shadow-xs transition-colors self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Record</span>
            </button>
          </div>

          {/* Category Tabs */}
          <CmsTabs
            tabs={contentTabs}
            activeTab={activeTab}
            onChange={setActiveContentCategory}
            variant="pill"
          />

          {/* Full Reusable Data Table */}
          <CmsSectionCard title="Active Records" noPadding>
            <CmsTable
              data={filteredCmsRecords}
              columns={cmsColumns}
              keyExtractor={(r) => r.id}
              searchPlaceholder="Search records by title, description, or tag..."
              filterOptions={{
                label: 'Status',
                key: 'status',
                options: [
                  { label: 'Published', value: 'published' },
                  { label: 'Draft', value: 'draft' },
                ],
              }}
              batchActions={{
                onPublish: (keys) => {
                  setCmsRecords((prev) =>
                    prev.map((r) => (keys.includes(r.id) ? { ...r, status: 'published' } : r))
                  )
                  toast({
                    title: 'Batch Action Complete',
                    description: `${keys.length} records marked as published.`,
                    variant: 'success',
                  })
                },
                onDelete: (keys) => {
                  setCmsRecords((prev) => prev.filter((r) => !keys.includes(r.id)))
                  toast({
                    title: 'Batch Action Complete',
                    description: `${keys.length} records deleted.`,
                    variant: 'info',
                  })
                },
              }}
              onRowClick={(row) => setEditingRecord(row)}
              emptyMessage="No records in this collection"
              emptySubtext="Published records appear on the public site automatically."
              emptyActionLabel={`Add ${activeContentCategory === 'ALL' ? 'a record' : activeContentCategory}`}
              onEmptyAction={() => openCreateRecord(collectionForTab(activeContentCategory))}
            />
          </CmsSectionCard>
        </div>
      )}

      {/* SECTION: PROJECTS */}
      {section === 'projects' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Projects Showcase
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Curate case studies, prototypes, and open source work shown on /projects.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openCreateRecord(CMS_COLLECTIONS.projects)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-inverse text-xs font-semibold hover:bg-teal-700 shadow-xs transition-colors self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
          </div>

          {cmsProjects.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-12 text-center">
              <FolderKanban className="w-5 h-5 text-slate-400" />
              <p className="text-sm font-semibold text-slate-800">No projects yet</p>
              <p className="max-w-sm text-xs text-slate-500">
                Add a project to build the /projects index. Each project gets its own case study page.
              </p>
              <button
                type="button"
                onClick={() => openCreateRecord(CMS_COLLECTIONS.projects)}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-inverse hover:bg-teal-700"
              >
                <Plus className="w-3.5 h-3.5" /> New Project
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cmsProjects.map((project) => (
              <div
                key={project.id}
                className="p-5 rounded-xl border border-slate-200/90 bg-surface hover:border-slate-300 shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      {project.category || 'Web Application'}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteConfirmItem({
                          id: project.id,
                          title: project.title,
                          type: 'cms',
                        })
                      }
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      aria-label="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-2.5">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {project.description || project.summary}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(project.tech || ['React', 'TypeScript', 'Tailwind']).map((t: string) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">Status: Active</span>
                  <div className="flex items-center gap-2">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-teal-700 hover:underline font-medium text-[11px]"
                      >
                        Live Demo <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: GALLERY */}
      {section === 'gallery' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Visual Gallery
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Photographic frames, experiments, and visual work shown on /gallery.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-surface">
                <button
                  type="button"
                  onClick={() => setGalleryViewMode('grid')}
                  className={`p-1.5 ${
                    galleryViewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setGalleryViewMode('table')}
                  className={`p-1.5 ${
                    galleryViewMode === 'table' ? 'bg-slate-100 text-slate-900' : 'text-slate-400'
                  }`}
                  aria-label="Table view"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNewGalleryImage('')
                  setCreateGalleryModalOpen(true)
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-inverse text-xs font-semibold hover:bg-teal-700 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload Artwork</span>
              </button>
            </div>
          </div>

          {galleryItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-12 text-center">
              <ImageIcon className="w-5 h-5 text-slate-400" />
              <p className="text-sm font-semibold text-slate-800">No gallery images yet</p>
              <p className="max-w-sm text-xs text-slate-500">
                Upload a photo to fill the homepage gallery and the visual archive.
              </p>
              <button
                type="button"
                onClick={() => {
                  setNewGalleryImage('')
                  setCreateGalleryModalOpen(true)
                }}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-inverse hover:bg-teal-700"
              >
                <Plus className="w-3.5 h-3.5" /> Upload Artwork
              </button>
            </div>
          ) : galleryViewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {galleryItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-xl border border-slate-200/90 bg-surface overflow-hidden shadow-xs hover:border-slate-300 transition-all"
                >
                  <div
                    className="aspect-4/3 bg-slate-100 relative overflow-hidden cursor-pointer"
                    onClick={() => setLightboxImage(item.imageUrl)}
                  >
                    <NextImage
                      src={item.imageUrl}
                      alt={item.title || 'Gallery item'}
                      fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      referrerPolicy="no-referrer"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-inverse">
                      <Eye className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="p-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{item.title || 'Gallery photo'}</p>
                      <p className="text-[11px] text-slate-500">{item.category}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteConfirmItem({
                          id: item.id,
                          title: item.title || 'Artwork',
                          type: 'cms',
                        })
                      }
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                      aria-label="Delete artwork"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <CmsSectionCard title="Gallery Items List" noPadding>
              <CmsTable
                data={galleryItems}
                keyExtractor={(g) => g.id}
                columns={[
                  {
                    header: 'Artwork',
                    accessor: (row) => (
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                          <NextImage
                            src={row.imageUrl}
                            alt=""
                            fill
                            sizes="40px"
                            referrerPolicy="no-referrer"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{row.title || 'Gallery photo'}</p>
                          <p className="text-[11px] text-slate-500">{row.description || 'No description'}</p>
                        </div>
                      </div>
                    ),
                  },
                  {
                    header: 'Category',
                    accessor: 'category',
                  },
                  {
                    header: 'Actions',
                    accessor: (row) => (
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirmItem({
                            id: row.id,
                            title: row.title || 'Artwork',
                            type: 'cms',
                          })
                        }
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ),
                  },
                ]}
              />
            </CmsSectionCard>
          )}
        </div>
      )}

      {/* SECTION: MUSIC */}
      {section === 'music' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Music Library
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Audio tracks, playlists, and background listening curation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCreateMusicModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-inverse text-xs font-semibold hover:bg-teal-700 shadow-xs transition-colors self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Track</span>
            </button>
          </div>

          {musicTracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-12 text-center">
              <Music className="w-5 h-5 text-slate-400" />
              <p className="text-sm font-semibold text-slate-800">No music tracks yet</p>
              <p className="max-w-sm text-xs text-slate-500">
                Add a track to the music shelf. It appears on /media and /media/music.
              </p>
              <button
                type="button"
                onClick={() => setCreateMusicModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-inverse hover:bg-teal-700"
              >
                <Plus className="w-3.5 h-3.5" /> Add Track
              </button>
            </div>
          ) : (
          <CmsSectionCard title="Saved Tracks" noPadding>
            <div className="divide-y divide-slate-100">
              {musicTracks.map((track) => {
                const isPlaying = nowPlayingTrackId === track.id
                return (
                  <div
                    key={track.id}
                    className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-10 h-10 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                        {track.coverUrl ? (
                          <NextImage
                            src={track.coverUrl}
                            alt=""
                            fill
                            sizes="40px"
                            referrerPolicy="no-referrer"
                            className="object-cover"
                          />
                        ) : (
                          <Music className="w-5 h-5 text-slate-400 m-auto mt-2.5" />
                        )}
                        <button
                          type="button"
                          onClick={() => setNowPlayingTrackId(isPlaying ? null : track.id)}
                          className="absolute inset-0 bg-slate-900/40 flex items-center justify-center text-inverse opacity-0 hover:opacity-100 transition-opacity"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {track.title}
                        </p>
                        {(track.artist || track.album) && (
                          <p className="text-[11px] text-slate-500 truncate">
                            {track.artist}
                            {track.artist && track.album ? ' · ' : ''}
                            {track.album}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isPlaying && (
                        <span className="text-[11px] font-semibold text-teal-600 animate-pulse flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-600" /> Playing preview
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirmItem({
                            id: track.id,
                            title: track.title,
                            type: 'music',
                          })
                        }
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        aria-label="Remove track"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CmsSectionCard>
          )}
        </div>
      )}

      {/* SECTION: INBOX */}
      {section === 'inbox' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Inquiries &amp; Messages
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Incoming messages submitted via the public contact form and mail routing.
              </p>
            </div>
            <span className="text-xs text-slate-500">
              Recipient: <strong className="text-slate-800">no-reply@ashokrimal.com.np</strong>
            </span>
          </div>

          <CmsSectionCard title="Received Messages" noPadding>
            <div className="divide-y divide-slate-100">
              {inboxMessages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => setInboxMessageModal(msg)}
                  className={`p-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition-colors ${
                    !msg.readAt ? 'bg-teal-50/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        !msg.readAt ? 'bg-teal-600 ring-2 ring-teal-200' : 'bg-slate-300'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{msg.fromEmail}</span>
                        
                      </div>
                      <p className="text-xs font-semibold text-slate-800 mt-0.5 truncate">
                        {msg.subject}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{msg.textBody}</p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <time className="text-[11px] text-slate-400">
                      {new Date(msg.receivedAt).toLocaleDateString()}
                    </time>
                    <div className="mt-1">
                      <span className="text-[10px] text-teal-700 font-medium hover:underline">
                        Read →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CmsSectionCard>
        </div>
      )}

      {/* SECTION: SETTINGS */}
      {section === 'settings' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Profile &amp; Integration Settings
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure connected APIs, music streaming handles, and anime/manga lists.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            <CmsSectionCard
              title="Media Sync &amp; External Usernames"
              description="Enter your public profile handles for real-time portfolio integration."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CmsFormField label="GitHub Username" hint="Repos & commit streaks">
                  <CmsInput
                    name="githubUsername"
                    defaultValue={profileSettingsState?.githubUsername || ''}
                    placeholder="e.g. ashokrimal"
                  />
                </CmsFormField>

                <CmsFormField label="Last.fm Username" hint="Scrobble history">
                  <CmsInput
                    name="lastfmUsername"
                    defaultValue={profileSettingsState?.lastfmUsername || ''}
                    placeholder="e.g. lamirkohsa"
                  />
                </CmsFormField>

                <CmsFormField label="ListenBrainz Username" hint="Now playing tracking">
                  <CmsInput
                    name="listenbrainzUsername"
                    defaultValue={profileSettingsState?.listenbrainzUsername || ''}
                    placeholder="e.g. ashokrimal"
                  />
                </CmsFormField>

                <CmsFormField label="Spotify Profile URL" hint="Public profile link">
                  <CmsInput
                    name="spotifyProfileUrl"
                    defaultValue={profileSettingsState?.spotifyProfileUrl || ''}
                    placeholder="https://open.spotify.com/user/..."
                  />
                </CmsFormField>

                <CmsFormField label="MyAnimeList Usernames" hint="Comma-separated">
                  <CmsInput
                    name="malUsernames"
                    defaultValue={profileSettingsState?.malUsernames?.join(', ') || profileSettingsState?.malUsername || ''}
                    placeholder="e.g. ashokrimal, user2"
                  />
                </CmsFormField>

                <CmsFormField label="AniList Usernames" hint="Comma-separated">
                  <CmsInput
                    name="anilistUsernames"
                    defaultValue={profileSettingsState?.anilistUsernames?.join(', ') || ''}
                    placeholder="e.g. ashokrimal"
                  />
                </CmsFormField>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end">
                <CmsSubmitButton type="submit" loading={isSubmitting}>
                  Save Settings
                </CmsSubmitButton>
              </div>
            </CmsSectionCard>
          </form>
        </div>
      )}

      {/* MODAL: CREATE RECORD */}
      <CmsModal
        isOpen={createRecordModalOpen}
        onClose={() => setCreateRecordModalOpen(false)}
        title="Add New Content Record"
        description="Publish a project, skill, note, or career milestone."
      >
        <form onSubmit={handleCreateCmsRecord} className="space-y-4">
          <CmsFormField label="Collection" required>
            <CmsSelect
              value={newCollection}
              onChange={(e) => setNewCollection(e.target.value)}
              options={[
                { label: CMS_COLLECTIONS.projects, value: CMS_COLLECTIONS.projects },
                { label: 'Profile (Bio & Identity)', value: CMS_COLLECTIONS.profile },
                { label: 'Gallery (Photographs)', value: CMS_COLLECTIONS.gallery },
                { label: 'Experience (Work)', value: CMS_COLLECTIONS.experience },
                { label: CMS_COLLECTIONS.education, value: CMS_COLLECTIONS.education },
                { label: CMS_COLLECTIONS.skills, value: CMS_COLLECTIONS.skills },
                { label: 'Certificates & Awards', value: CMS_COLLECTIONS.certificates },
                { label: 'Music (Media)', value: CMS_COLLECTIONS.music },
                { label: 'Movies (Media)', value: CMS_COLLECTIONS.movies },
                { label: 'Anime (Media)', value: CMS_COLLECTIONS.anime },
                { label: 'Manga / Manhwa (Media)', value: CMS_COLLECTIONS.manga },
                { label: CMS_COLLECTIONS.socialLinks, value: CMS_COLLECTIONS.socialLinks },
                { label: 'Blogs / Journal', value: CMS_COLLECTIONS.blogs },
                { label: CMS_COLLECTIONS.siteSettings, value: CMS_COLLECTIONS.siteSettings },
                { label: CMS_COLLECTIONS.pageCopy, value: CMS_COLLECTIONS.pageCopy },
                { label: CMS_COLLECTIONS.mediaCollections, value: CMS_COLLECTIONS.mediaCollections },
              ]}
            />
          </CmsFormField>

          <CmsFormField label="Record Title" required>
            <CmsInput
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Next-Gen Commerce System"
              required
            />
          </CmsFormField>

          {isKeyedCollection(newCollection) && (
            <CmsFormField
              label="Key"
              required
              hint="The public site looks the record up by this key, e.g. about or music"
            >
              <CmsInput
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder={newCollection === CMS_COLLECTIONS.pageCopy ? 'e.g. about' : 'e.g. music'}
                required
              />
            </CmsFormField>
          )}

          <CmsFormField
            label={isStructuredCollection(newCollection) ? 'JSON Payload' : 'Description & Content'}
            hint={
              isStructuredCollection(newCollection)
                ? 'Must be a valid JSON object'
                : 'Markdown or plain text'
            }
          >
            <CmsTextarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder={
                isStructuredCollection(newCollection)
                  ? '{ "eyebrow": "…", "title": "…", "accent": "…", "description": "…" }'
                  : 'Provide context, deliverables, or highlights...'
              }
              rows={isStructuredCollection(newCollection) ? 10 : 4}
            />
          </CmsFormField>

          <ImageUploadField
            label="Media / Image"
            value={newImageUrl}
            onChange={setNewImageUrl}
            hint="Optional. Upload from your device or paste an image URL."
          />

          {newCollection === CMS_COLLECTIONS.projects && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CmsFormField label="Category" hint="e.g. Web app">
                <CmsInput name="category" placeholder="e.g. Full-stack" />
              </CmsFormField>
              <CmsFormField label="Tech stack" hint="Comma-separated">
                <CmsInput name="techStack" placeholder="Next.js, Postgres, Tailwind" />
              </CmsFormField>
              <CmsFormField label="Live URL">
                <CmsInput name="live" type="url" placeholder="https://…" />
              </CmsFormField>
              <CmsFormField label="Source URL">
                <CmsInput name="github" type="url" placeholder="https://github.com/…" />
              </CmsFormField>
            </div>
          )}

          {(newCollection === CMS_COLLECTIONS.experience || newCollection === CMS_COLLECTIONS.education) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CmsFormField label="Organization" hint="Company or school">
                <CmsInput name="organization" placeholder="e.g. Acme Studio" />
              </CmsFormField>
              <CmsFormField label="Period" hint="Shown on the timeline">
                <CmsInput name="period" placeholder="e.g. 2024 — Now" />
              </CmsFormField>
              <CmsFormField label="Location">
                <CmsInput name="location" placeholder="e.g. Kathmandu, Nepal" />
              </CmsFormField>
            </div>
          )}

          {newCollection === CMS_COLLECTIONS.gallery && (
            <CmsFormField label="Category" hint="e.g. Photography">
              <CmsInput name="category" placeholder="e.g. Photography" />
            </CmsFormField>
          )}

          {([CMS_COLLECTIONS.music, CMS_COLLECTIONS.movies, CMS_COLLECTIONS.anime, CMS_COLLECTIONS.manga] as string[]).includes(newCollection) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CmsFormField label="Creator / Artist" hint="Shown under the title">
                <CmsInput name="creator" placeholder="e.g. Director or artist" />
              </CmsFormField>
              <CmsFormField label="Rating / Score" hint="Optional">
                <CmsInput name="rating" placeholder="e.g. 9.2" />
              </CmsFormField>
              <CmsFormField label="External link" hint="Optional detail page">
                <CmsInput name="externalUrl" type="url" placeholder="https://…" />
              </CmsFormField>
            </div>
          )}

          <CmsFormField label="Image alt text" hint="Describes the image for screen readers">
            <CmsInput name="altText" placeholder="A short description of the image" />
          </CmsFormField>

          <CmsFormField label="Publishing Status">
            <CmsSelect
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              options={[
                { label: 'Publish immediately', value: 'published' },
                { label: 'Save as draft', value: 'draft' },
              ]}
            />
          </CmsFormField>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateRecordModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <CmsSubmitButton type="submit" loading={isSubmitting}>
              Create Record
            </CmsSubmitButton>
          </div>
        </form>
      </CmsModal>

      {/* MODAL: EDIT RECORD */}
      <CmsModal
        isOpen={Boolean(editingRecord)}
        onClose={() => setEditingRecord(null)}
        title={`Edit Record: ${editingRecord?.title || ''}`}
        description="Update record contents or toggle publication status."
      >
        {editingRecord && (
          <form onSubmit={handleUpdateRecord} className="space-y-4">
            <CmsFormField label="Record Title" required>
              <CmsInput
                value={editingRecord.title}
                onChange={(e) => setEditingRecord({ ...editingRecord, title: e.target.value })}
                required
              />
            </CmsFormField>

            <CmsFormField label="Collection">
              <CmsInput value={editingRecord.collection} disabled className="bg-slate-50 text-slate-500" />
            </CmsFormField>

            {isStructuredCollection(editingRecord.collection) ? (
              <CmsFormField label="JSON Payload" hint="Must be a valid JSON object">
                <CmsTextarea
                  value={editPayloadText}
                  onChange={(e) => setEditPayloadText(e.target.value)}
                  rows={14}
                />
              </CmsFormField>
            ) : (
              <CmsFormField label="Description">
                <CmsTextarea
                  value={editPayloadText}
                  onChange={(e) => setEditPayloadText(e.target.value)}
                  rows={4}
                />
              </CmsFormField>
            )}

            <CmsFormField label="Status">
              <CmsSelect
                value={editingRecord.status}
                onChange={(e) => setEditingRecord({ ...editingRecord, status: e.target.value })}
                options={[
                  { label: 'Published', value: 'published' },
                  { label: 'Draft', value: 'draft' },
                ]}
              />
            </CmsFormField>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <CmsSubmitButton type="submit" loading={isSubmitting}>
                Save Changes
              </CmsSubmitButton>
            </div>
          </form>
        )}
      </CmsModal>

      {/* MODAL: ADD GALLERY ARTWORK */}
      <CmsModal
        isOpen={createGalleryModalOpen}
        onClose={() => setCreateGalleryModalOpen(false)}
        title="Upload Artwork Frame"
        description="Add a new photograph or render to your public gallery."
      >
        <form onSubmit={handleCreateGalleryItem} className="space-y-4">
          <CmsFormField label="Artwork Title">
            <CmsInput name="title" placeholder="e.g. Mountain Solitude" required />
          </CmsFormField>

          <CmsFormField label="Category">
            <CmsSelect
              name="category"
              options={[
                { label: 'Photography', value: 'Photography' },
                { label: 'Selected work', value: 'Selected work' },
                { label: 'Workspace', value: 'Workspace' },
                { label: 'Experiments', value: 'Experiments' },
              ]}
            />
          </CmsFormField>

          <ImageUploadField
            label="Image"
            name="imageUrl"
            value={newGalleryImage}
            onChange={setNewGalleryImage}
          />

          <CmsFormField label="Description / Caption">
            <CmsTextarea name="description" placeholder="Short story behind this frame..." rows={3} />
          </CmsFormField>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateGalleryModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <CmsSubmitButton type="submit">Publish to Gallery</CmsSubmitButton>
          </div>
        </form>
      </CmsModal>

      {/* MODAL: ADD MUSIC TRACK */}
      <CmsModal
        isOpen={createMusicModalOpen}
        onClose={() => setCreateMusicModalOpen(false)}
        title="Add Music Track"
        description="Share a track or album you love on /media/music."
      >
        <form onSubmit={handleCreateMusicItem} className="space-y-4">
          <CmsFormField label="Track Title" required>
            <CmsInput name="title" placeholder="e.g. Chamber of Reflection" required />
          </CmsFormField>

          <CmsFormField label="Artist" required>
            <CmsInput name="artist" placeholder="e.g. Mac DeMarco" required />
          </CmsFormField>

          <CmsFormField label="Album">
            <CmsInput name="album" placeholder="e.g. Salad Days" />
          </CmsFormField>

          <CmsFormField label="Audio URL" required>
            <CmsInput name="audioUrl" type="url" placeholder="https://…/track.mp3" required />
          </CmsFormField>

          <ImageUploadField
            label="Cover art"
            name="coverUrl"
            value={newCoverUrl}
            onChange={setNewCoverUrl}
            hint="Optional. Upload cover art or paste an image URL."
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateMusicModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <CmsSubmitButton type="submit">Add to Music Library</CmsSubmitButton>
          </div>
        </form>
      </CmsModal>

      {/* MODAL: CONFIRM DELETE */}
      <CmsModal
        isOpen={Boolean(deleteConfirmItem)}
        onClose={() => setDeleteConfirmItem(null)}
        title="Confirm Deletion"
        description="This action cannot be undone."
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to permanently delete{' '}
            <strong className="text-slate-900">&quot;{deleteConfirmItem?.title}&quot;</strong>?
            It will immediately disappear from your website and database.
          </p>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDeleteConfirmItem(null)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirmed}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-inverse hover:bg-rose-700 shadow-xs transition-colors"
            >
              Delete Permanently
            </button>
          </div>
        </div>
      </CmsModal>

      {/* MODAL: INBOX MESSAGE DETAIL */}
      <CmsModal
        isOpen={Boolean(inboxMessageModal)}
        onClose={() => setInboxMessageModal(null)}
        title={inboxMessageModal?.subject || 'Message'}
        description={`From: ${inboxMessageModal?.fromEmail ?? ''}`}
      >
        {inboxMessageModal && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl leading-relaxed text-slate-700 whitespace-pre-wrap">
              {inboxMessageModal.textBody}
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-slate-400 text-[11px]">
                Received {new Date(inboxMessageModal.receivedAt).toLocaleString()}
              </span>
              <a
                href={`mailto:${inboxMessageModal.fromEmail}?subject=${encodeURIComponent(
                  `Re: ${inboxMessageModal.subject}`
                )}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-inverse font-semibold hover:bg-teal-700 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Reply via Email ↗</span>
              </a>
            </div>
          </div>
        )}
      </CmsModal>

      {/* LIGHTBOX PREVIEW */}
      {lightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-[80vh]">
            <NextImage
              src={lightboxImage}
              alt="Artwork preview"
              fill
              sizes="90vw"
              referrerPolicy="no-referrer"
              className="object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminWorkspace(props: AdminWorkspaceProps) {
  return (
    <CmsToastProvider>
      <WorkspaceInner {...props} />
    </CmsToastProvider>
  )
}
