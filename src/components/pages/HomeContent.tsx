import Link from 'next/link'
import { ArrowUpRight, Compass, Sparkles } from 'lucide-react'
import { getHeroSectionConfigResult, getProfileContentResult } from '@/app/actions/content-cms'
import { getPageWithSections, getSiteSettings } from '@/lib/studio/data'
import { SectionRenderer } from '@/components/studio/SectionRenderer'
import { EMPTY_SITE_CONFIG, getSiteConfig } from '@/lib/site-content'
import { CMS_SETTINGS_RECORDS } from '@/lib/cms-schema'
import { EmptyState } from '@/components/ui/EmptyState'
import { CmsErrorState } from '@/components/ui/CmsState'
import { MetaChip, PageHero, PageShell } from '@/components/ui/PageChrome'
import { getUiCopy } from '@/lib/ui-copy'
import { getCurrentlyEntries } from '@/lib/currently'
import { CurrentlyStrip } from '@/components/home/CurrentlyStrip'

/**
 * The homepage.
 *
 * The hero is chrome-like and reads the Hero Section record; the body is a list
 * of studio-managed `page_sections` for the `/` page, rendered by
 * `SectionRenderer` in the owner's order. Copy, CTAs, ordering and visibility
 * all come from the database — nothing below the hero is hardcoded.
 */
export default async function HomeContent() {
  const [pageResult, heroResult, profileResult, siteResult, settings, currently] = await Promise.all([
    getPageWithSections('/'),
    getHeroSectionConfigResult(),
    getProfileContentResult(),
    getSiteConfig(),
    getSiteSettings(),
    getCurrentlyEntries(),
  ])

  const heroData = heroResult.status === 'ok' ? heroResult.data : {}
  const site = siteResult.status === 'ok' ? siteResult.data : EMPTY_SITE_CONFIG
  const profile = (profileResult.status === 'ok' ? profileResult.data : {}) as Record<string, unknown>
  const profileText = (key: string) => {
    const raw = profile[key]
    return typeof raw === 'string' && raw.trim() ? raw : undefined
  }

  const uiStrings = await getUiCopy()

  const displayName = profileText('fullName') || site.brand.name || ''
  const heroHeading = heroData.heading?.trim() || displayName
  const heroSummary = heroData.subtitle?.trim()
  const heroSpecialization = uiStrings.hero.specialization.en
  // The hero always states the specialization; existing CMS copy follows it.
  const heroSubtitle = !heroSummary
    ? heroSpecialization
    : heroSummary.includes(heroSpecialization)
      ? heroSummary
      : `${heroSpecialization} — ${heroSummary}`
  const heroEyebrow = profileText('headline') || site.brand.role || 'Portfolio'
  const heroLocation =
    heroData.location?.trim() || profileText('location') || site.contact.location || ''
  const availability =
    settings.availabilityStatus ||
    profileText('availability') ||
    site.contact.availability ||
    site.footer.availabilityText

  return (
    <PageShell>
      {heroResult.status === 'error' ? (
        <CmsErrorState message={heroResult.message} />
      ) : !heroHeading && !heroSubtitle ? (
        <div className="pt-8 md:pt-12">
          <EmptyState
            eyebrow="Hero"
            icon={Compass}
            message={CMS_SETTINGS_RECORDS.hero.emptyState.message}
            hint={CMS_SETTINGS_RECORDS.hero.emptyState.hint}
          />
        </div>
      ) : (
        <PageHero
          eyebrow={heroEyebrow}
          title={heroHeading.replace(/\.$/, '')}
          description={heroSubtitle}
          meta={
            heroLocation || availability ? (
              <>
                {heroLocation && <MetaChip icon={Compass}>{heroLocation}</MetaChip>}
                {availability && <MetaChip icon={Sparkles}>{availability}</MetaChip>}
              </>
            ) : undefined
          }
          actions={
            <>
              <Link href="/projects" className="apple-btn-primary">
                <span>View projects</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <Link href="/contact" className="apple-btn-secondary">
                <span>Get in touch</span>
              </Link>
            </>
          }
        />
      )}

      <CurrentlyStrip entries={currently} label={uiStrings.home.currently.en} />

      <SectionRenderer sections={pageResult.sections} />
    </PageShell>
  )
}
