/**
 * URLs that are safe to present as project links.
 *
 * A source link must point at a repository (owner/repo), not at a profile or an
 * organisation page. Anything else is treated as missing and hidden.
 */

const REPOSITORY_HOSTS = new Set([
  'github.com',
  'www.github.com',
  'gitlab.com',
  'www.gitlab.com',
  'bitbucket.org',
  'www.bitbucket.org',
  'codeberg.org',
  'www.codeberg.org',
])

export function isRepositoryUrl(value?: string): boolean {
  if (!value || !value.trim()) return false
  try {
    const url = new URL(value.trim())
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false
    if (!REPOSITORY_HOSTS.has(url.hostname.toLowerCase())) return false
    return url.pathname.split('/').filter(Boolean).length >= 2
  } catch {
    return false
  }
}
