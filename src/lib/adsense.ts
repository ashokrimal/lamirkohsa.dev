/**
 * Google AdSense identifiers.
 *
 * The publisher ID is public by design — it appears in every page's markup and
 * in `public/ads.txt`. The slot is the 10-digit ID of one responsive ad unit
 * (AdSense → Ads → By ad unit); it is deployment configuration, so it comes
 * from the environment. Without a slot the manual placements render nothing,
 * and the loader alone still serves Auto ads if they are switched on in the
 * AdSense dashboard.
 */
export const ADSENSE_CLIENT = 'ca-pub-1138327552755079'

export const ADSENSE_SLOT = (process.env.NEXT_PUBLIC_ADSENSE_SLOT ?? '').trim()
