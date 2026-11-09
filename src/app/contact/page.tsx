import type { Metadata } from 'next'
import ContactContent from '@/components/pages/ContactContent'
import { getProfileContent, getSocialLinks } from '@/app/actions/content-cms'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Contact - Ashok Rimal',
  description: 'Reach out to Ashok Rimal for software engineering roles, technical contracting, or open-source collaborations.',
}

export default async function ContactPage() {
  const [profile, socialLinksRaw] = await Promise.all([
    getProfileContent(),
    getSocialLinks(),
  ])

  const socialLinks = socialLinksRaw.map((s) => ({
    label: typeof s.payload?.label === 'string' ? s.payload.label : s.title,
    href: typeof s.payload?.href === 'string' ? s.payload.href : '#',
    handle: typeof s.payload?.handle === 'string' ? s.payload.handle : undefined,
  }))

  return (
    <ContactContent
      profile={profile}
      socialLinks={socialLinks}
    />
  )
}
