import type { Metadata } from 'next'
import A2Experience from '@/components/a2/A2Experience'
import { getA2Content } from '@/lib/a2-content'
import { SITE_URL } from '@/lib/seo'
import './a2.css'

export const revalidate = 300

const PAGE_URL = `${SITE_URL}/a2`

export async function generateMetadata(): Promise<Metadata> {
  const content = await getA2Content()
  const name = content.profile.fullName || content.brand.name || 'Portfolio'
  const role = content.profile.headline || content.brand.role || 'Creative technologist'
  const description =
    content.hero.subtitle ||
    content.profile.summary ||
    `${name} — an interactive 3D portfolio of ${role.toLowerCase()} work, built with WebGL, motion and a live CMS.`
  const title = `${name} — Interactive 3D Portfolio`

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: '/a2' },
    openGraph: {
      type: 'website',
      title,
      description,
      url: PAGE_URL,
      siteName: name,
      images: [
        {
          url: '/a2/opengraph-image',
          width: 1200,
          height: 630,
          alt: `${name} — Interactive 3D Portfolio`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/a2/opengraph-image'],
    },
  }
}

export default async function A2Page() {
  const content = await getA2Content()
  const name = content.profile.fullName || content.brand.name || ''
  const role = content.profile.headline || content.brand.role || ''
  const email = content.profile.email || content.contact.email || ''
  const location = content.profile.location || content.contact.location || ''
  const knownAbout = content.skills.flatMap((group) => group.items).slice(0, 14)

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        name,
        url: SITE_URL,
        mainEntityOfPage: PAGE_URL,
        jobTitle: role,
        ...(content.profile.summary ? { description: content.profile.summary } : {}),
        ...(email ? { email: `mailto:${email}` } : {}),
        ...(location
          ? { address: { '@type': 'PostalAddress', addressLocality: location, addressCountry: 'NP' } }
          : {}),
        sameAs: content.socials.map((social) => social.href),
        ...(knownAbout.length ? { knowsAbout: knownAbout } : {}),
      },
      {
        '@type': 'WebPage',
        '@id': `${PAGE_URL}#page`,
        url: PAGE_URL,
        name: `${name} — Interactive 3D Portfolio`,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#person` },
        inLanguage: 'en-US',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <A2Experience content={content} />
    </>
  )
}
