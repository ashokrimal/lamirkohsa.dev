import {
  getHeroSectionConfigResult,
  getProfileContentResult,
  getPublishedCmsContentResult,
} from '@/app/actions/content-cms'
import { EMPTY_SITE_CONFIG, getSiteConfig } from '@/lib/site-content'
import { getGalleryResult } from '@/lib/gallery'
import { getProjectsResult } from '@/lib/projects'
import { CMS_COLLECTIONS } from '@/lib/cms-schema'
import type { ContactDetails, SiteBrand, SiteSocial } from '@/lib/site-content'
import type { ProjectEntry } from '@/lib/projects'

/**
 * Everything the 3D edition renders, read from the CMS in one pass.
 *
 * The immersive page owns its layout and motion; the words, projects, skills,
 * timeline entries, photographs and contact channels all come from the same
 * collections the classic site and the studio edit.
 */
export interface A2Profile {
  fullName?: string
  headline?: string
  summary?: string
  bio?: string
  location?: string
  availability?: string
  avatarUrl?: string
  email?: string
}

export interface A2Hero {
  heading?: string
  subtitle?: string
  location?: string
  imageUrl?: string
  imageAlt?: string
}

export interface A2SkillGroup {
  id: number
  category: string
  items: string[]
}

export interface A2TimelineEntry {
  id: number
  title: string
  organization: string
  period: string
  location?: string
  description: string
}

export interface A2Photo {
  id: number
  title: string
  imageUrl: string
  altText?: string
  category?: string
}

export interface A2Content {
  brand: SiteBrand
  contact: ContactDetails
  socials: SiteSocial[]
  profile: A2Profile
  hero: A2Hero
  projects: ProjectEntry[]
  skills: A2SkillGroup[]
  experience: A2TimelineEntry[]
  education: A2TimelineEntry[]
  photos: A2Photo[]
}

function text(payload: Record<string, unknown> | undefined, key: string) {
  const value = payload?.[key]
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function timeline(records: { id: number; title: string; payload?: Record<string, unknown> }[]) {
  return records.map((record) => ({
    id: record.id,
    title: record.title,
    organization: text(record.payload, 'organization') || '',
    period: text(record.payload, 'period') || '',
    location: text(record.payload, 'location'),
    description: text(record.payload, 'description') || '',
  }))
}

export async function getA2Content(): Promise<A2Content> {
  const [
    siteResult,
    heroResult,
    profileResult,
    projectsResult,
    skillsResult,
    experienceResult,
    educationResult,
    socialResult,
    galleryResult,
  ] = await Promise.all([
    getSiteConfig(),
    getHeroSectionConfigResult(),
    getProfileContentResult(),
    getProjectsResult(),
    getPublishedCmsContentResult(CMS_COLLECTIONS.skills),
    getPublishedCmsContentResult(CMS_COLLECTIONS.experience),
    getPublishedCmsContentResult(CMS_COLLECTIONS.education),
    getPublishedCmsContentResult(CMS_COLLECTIONS.socialLinks),
    getGalleryResult(),
  ])

  const site = siteResult.status === 'ok' ? siteResult.data : EMPTY_SITE_CONFIG
  const hero = heroResult.status === 'ok' ? heroResult.data : {}
  const profile = (profileResult.status === 'ok' ? profileResult.data : {}) as Record<string, unknown>

  const skills =
    skillsResult.status === 'ok'
      ? skillsResult.data
          .map((record) => ({
            id: record.id,
            category: text(record.payload, 'category') || record.title,
            items: Array.isArray(record.payload?.items)
              ? (record.payload.items as unknown[]).filter(
                  (item): item is string => typeof item === 'string' && item.trim().length > 0,
                )
              : [],
          }))
          .filter((group) => group.items.length > 0)
      : []

  const socials =
    socialResult.status === 'ok'
      ? socialResult.data
          .map((record) => ({
            label: text(record.payload, 'label') || record.title,
            href: text(record.payload, 'href') || '',
            kind: text(record.payload, 'kind'),
          }))
          .filter((link) => Boolean(link.href))
      : []

  const photos =
    galleryResult.status === 'ok'
      ? galleryResult.data
          .filter((photo) => Boolean(photo.imageUrl))
          .slice(0, 10)
          .map((photo) => ({
            id: photo.id,
            title: photo.title,
            imageUrl: photo.imageUrl,
            altText: photo.altText,
            category: photo.category,
          }))
      : []

  return {
    brand: site.brand,
    contact: site.contact,
    socials,
    profile: {
      fullName: text(profile, 'fullName'),
      headline: text(profile, 'headline'),
      summary: text(profile, 'summary'),
      bio: text(profile, 'bio'),
      location: text(profile, 'location'),
      availability: text(profile, 'availability'),
      avatarUrl: text(profile, 'avatarUrl') || text(profile, 'imageUrl'),
      email: text(profile, 'email'),
    },
    hero: {
      heading: hero.heading,
      subtitle: hero.subtitle,
      location: hero.location,
      imageUrl: hero.imageUrl,
      imageAlt: hero.imageAlt,
    },
    projects: projectsResult.status === 'ok' ? projectsResult.data : [],
    skills,
    experience: experienceResult.status === 'ok' ? timeline(experienceResult.data) : [],
    education: educationResult.status === 'ok' ? timeline(educationResult.data) : [],
    photos,
  }
}
