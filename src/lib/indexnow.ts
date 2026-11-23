/**
 * IndexNow: how Bing, Yandex, Seznam and Naver are told about a page the moment
 * it changes.
 *
 * Google finds new URLs through the sitemap and internal links, but Bing — whose
 * index DuckDuckGo, Ecosia and Yahoo serve — historically waited for a crawl.
 * IndexNow is the shared push protocol: one POST with the URLs, and every
 * participating engine re-crawls them. The key is public by design; it only
 * proves the sender controls the domain, which the key file does.
 *
 * Publishing is fire-and-forget: a failed ping never fails a save, and the next
 * sitemap crawl still finds the page.
 */

/** The default key. Its key file lives at `public/<key>.txt`. */
export const DEFAULT_INDEXNOW_KEY = '4f2a9c7e1b6d4358a0c9e7f2b1d64a83'

const ENDPOINT = 'https://api.indexnow.org/indexnow'

/** Keys are alphanumeric with dashes, 8–128 characters. */
const KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/

export function indexNowKey(): string {
  const configured = process.env.INDEXNOW_KEY?.trim()
  return configured && KEY_PATTERN.test(configured) ? configured : DEFAULT_INDEXNOW_KEY
}

/** The key file served from `public/`, which engines fetch to verify the key. */
export function indexNowKeyLocation(key = indexNowKey()): string {
  return `/${key}.txt`
}

/** `https://www.example.com/path` → `www.example.com`. */
export function canonicalHost(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return ''
  }
}

/** Absolute http(s) URLs only, de-duplicated, in the order given. */
export function normalizeIndexNowUrls(input: string | string[]): string[] {
  const list = Array.isArray(input) ? input : [input]
  const seen = new Set<string>()
  const urls: string[] = []

  for (const value of list) {
    if (typeof value !== 'string' || !value.trim()) continue
    try {
      const url = new URL(value.trim())
      if (url.protocol !== 'https:' && url.protocol !== 'http:') continue
      url.hash = ''
      if (seen.has(url.toString())) continue
      seen.add(url.toString())
      urls.push(url.toString())
    } catch {
      // A malformed URL is skipped rather than failing the whole batch.
    }
  }

  return urls
}

export type IndexNowPayload = {
  host: string
  key: string
  keyLocation: string
  urlList: string[]
}

/**
 * The request body. Every URL must share one host, which is the site's own host:
 * the key authorises submissions for that host only.
 */
export function indexNowPayload(urls: string[], key = indexNowKey()): IndexNowPayload | null {
  const normalized = normalizeIndexNowUrls(urls)
  const host = canonicalHost(normalized[0] ?? '')
  if (!host) return null

  const sameHost = normalized.filter((url) => canonicalHost(url) === host)
  return {
    host,
    key,
    keyLocation: `https://${host}${indexNowKeyLocation(key)}`,
    urlList: sameHost,
  }
}

/** IndexNow accepts up to 10,000 URLs per request; batches stay far smaller. */
export function chunkUrls(urls: string[], size = 1_000): string[][] {
  if (size <= 0) return [urls]
  const chunks: string[][] = []
  for (let index = 0; index < urls.length; index += size) {
    chunks.push(urls.slice(index, index + size))
  }
  return chunks
}

export type IndexNowResult = {
  ok: boolean
  submitted: number
  status?: number
}

/**
 * Submits URLs, ignoring preview deployments and local development where the
 * public host is not the one in the sitemap.
 */
export async function submitToIndexNow(
  input: string | string[],
  { fetchImpl = fetch }: { fetchImpl?: typeof fetch } = {},
): Promise<IndexNowResult> {
  const payload = indexNowPayload(Array.isArray(input) ? input : [input])
  if (!payload) return { ok: false, submitted: 0 }

  let submitted = 0
  let ok = true
  let status: number | undefined

  for (const batch of chunkUrls(payload.urlList)) {
    try {
      const response = await fetchImpl(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ ...payload, urlList: batch }),
        signal: AbortSignal.timeout(8_000),
      })
      status = response.status
      // 200 and 202 both mean "accepted"; 4xx means the key or host was refused.
      if (response.ok) submitted += batch.length
      else ok = false
    } catch (error) {
      ok = false
      console.warn('[indexnow] Submission failed:', (error as Error).message)
    }
  }

  return { ok, submitted, status }
}
