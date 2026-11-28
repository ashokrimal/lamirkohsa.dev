'use client'

import Script from 'next/script'
import { ADSENSE_CLIENT } from '@/lib/adsense'
import { useAdConsent } from '@/components/ads/useAdConsent'

/**
 * The AdSense loader, mounted only after the visitor allows ads.
 *
 * Nothing from Google is fetched before that decision, which is why this is a
 * client component: the server cannot know the stored choice. The same loader
 * serves both the manual units below and Auto ads, so it is mounted once from
 * the root layout and never per page.
 */
export default function AdSenseScript() {
  const consent = useAdConsent()

  if (consent !== 'granted') return null

  return (
    <Script
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
    />
  )
}
