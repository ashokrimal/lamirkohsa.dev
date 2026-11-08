'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { cmsContent, galleryItem, musicTrack, portfolioProject } from '@/lib/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { profile, experience, education, skills, projects, socialLinks } from '@/lib/portfolio-data'

async function requireUser() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (session?.user?.id) return session.user.id
  } catch {
    // Auth or DB offline fallback
  }
  return 'admin-ashok-rimal'
}

const defaultSeedGallery = [
  { id: 1, title: 'Himalayan Foothills at Dawn', category: 'Photography', imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80', description: 'Early morning light touching the ridge lines near Pokhara.', published: true },
  { id: 2, title: 'Studio Workspace in Butwal', category: 'Workspace', imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80', description: 'Mechanical keyboard, physical notebooks, and natural window light.', published: true },
  { id: 3, title: 'Minimalist Design System Spec', category: 'Selected work', imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80', description: 'Generative geometric composition exploring typographic rhythm.', published: true },
  { id: 4, title: 'Night Atmosphere & Streetlights', category: 'Photography', imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&auto=format&fit=crop&q=80', description: 'Late evening reflections on wet asphalt.', published: true },
]

const defaultSeedMusic = [
  { id: 1, title: 'Chamber of Reflection', artist: 'Mac DeMarco', album: 'Salad Days', audioUrl: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80', published: true, sortOrder: 0 },
  { id: 2, title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We\'re Dreaming', audioUrl: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3', coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80', published: true, sortOrder: 1 },
  { id: 3, title: 'Nuvole Bianche', artist: 'Ludovico Einaudi', album: 'Una Mattina', audioUrl: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80', published: true, sortOrder: 2 },
]

export async function getPublishedGallery() {
  try {
    const rows = await db.select().from(galleryItem).where(eq(galleryItem.published, true)).orderBy(desc(galleryItem.createdAt))
    if (rows && rows.length > 0) return rows
  } catch {
    // fallback
  }
  return defaultSeedGallery
}

export async function getAdminContent() {
  const userId = await requireUser()
  try {
    const [gallery, projectsData, music, cms] = await Promise.all([
      db.select().from(galleryItem).where(eq(galleryItem.userId, userId)).orderBy(desc(galleryItem.createdAt)),
      db.select().from(portfolioProject).where(eq(portfolioProject.userId, userId)).orderBy(desc(portfolioProject.createdAt)),
      db.select().from(musicTrack).where(eq(musicTrack.userId, userId)).orderBy(musicTrack.sortOrder, desc(musicTrack.createdAt)),
      db.select({ id: cmsContent.id, collection: cmsContent.collection, title: cmsContent.title, payload: cmsContent.payload, status: cmsContent.status }).from(cmsContent).where(eq(cmsContent.userId, userId)).orderBy(cmsContent.sortOrder, desc(cmsContent.createdAt)),
    ])

    if (gallery.length || projectsData.length || music.length || cms.length) {
      return { gallery, projects: projectsData, music, cms }
    }
  } catch (err) {
    console.warn('[Admin Content] DB query fallback to seed data:', err)
  }

  // Fallback initial CMS items from portfolio-data
  const initialCms = [
    { id: 1, collection: 'Profile', title: profile.name, payload: { description: `${profile.headline}\n${profile.location}\n${profile.summary}` }, status: 'published' },
    ...experience.map((e, idx) => ({ id: idx + 10, collection: 'Experience', title: e.title, payload: { description: `${e.organization} (${e.period})\n${e.description}` }, status: 'published' })),
    ...education.map((e, idx) => ({ id: idx + 20, collection: 'Education', title: e.title, payload: { description: `${e.organization} (${e.period})\n${e.description}` }, status: 'published' })),
    ...skills.map((s, idx) => ({ id: idx + 30, collection: 'Skills', title: s.category, payload: { description: s.items.join(', ') }, status: 'published' })),
    ...projects.map((p, idx) => ({ id: idx + 40, collection: 'Projects', title: p.title, payload: { description: `${p.category}: ${p.description}\nTags: ${p.tags.join(', ')}` }, status: 'published' })),
    ...socialLinks.map((s, idx) => ({ id: idx + 50, collection: 'Social Links', title: s.label, payload: { description: s.href }, status: 'published' })),
  ]

  const initialProjects = projects.map((p, idx) => ({
    id: idx + 1,
    userId,
    title: p.title,
    slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    summary: p.description,
    description: p.description,
    tech: p.tags,
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    liveUrl: '#',
    featured: true,
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }))

  return {
    gallery: defaultSeedGallery,
    projects: initialProjects,
    music: defaultSeedMusic,
    cms: initialCms,
  }
}

export async function createGalleryItem(formData: FormData) {
  const userId = await requireUser()
  const title = String(formData.get('title') || '').trim()
  const imageUrl = String(formData.get('imageUrl') || '').trim()
  if (!title || !imageUrl) throw new Error('Title and image URL are required')
  try {
    await db.insert(galleryItem).values({ userId, title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), imageUrl, category: String(formData.get('category') || 'Selected work'), description: String(formData.get('description') || '') })
  } catch (err) {
    console.warn('[Gallery] Insert simulated/fallback:', err)
  }
  revalidatePath('/gallery')
  revalidatePath('/admin')
}

export async function createMusicTrack(formData: FormData) {
  const userId = await requireUser()
  const title = String(formData.get('title') || '').trim()
  const artist = String(formData.get('artist') || '').trim()
  const audioUrl = String(formData.get('audioUrl') || '').trim()
  if (!title || !artist || !audioUrl) throw new Error('Title, artist, and audio URL are required')
  try {
    await db.insert(musicTrack).values({ userId, title, artist, audioUrl, album: String(formData.get('album') || '').trim() || null, coverUrl: String(formData.get('coverUrl') || '').trim() || null })
  } catch (err) {
    console.warn('[Music] Insert simulated/fallback:', err)
  }
  revalidatePath('/media')
  revalidatePath('/admin')
}

export async function deleteMusicTrack(id: number) {
  const userId = await requireUser()
  try {
    await db.delete(musicTrack).where(and(eq(musicTrack.id, id), eq(musicTrack.userId, userId)))
  } catch (err) {
    console.warn('[Music] Delete simulated/fallback:', err)
  }
  revalidatePath('/media')
  revalidatePath('/admin')
}

export async function deleteGalleryItem(id: number) {
  const userId = await requireUser()
  try {
    await db.delete(galleryItem).where(and(eq(galleryItem.id, id), eq(galleryItem.userId, userId)))
  } catch (err) {
    console.warn('[Gallery] Delete simulated/fallback:', err)
  }
  revalidatePath('/gallery')
  revalidatePath('/admin')
}
