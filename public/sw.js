/*
 * Offline shell for the portfolio.
 *
 * Installability needs a service worker with a fetch handler. Navigations are
 * network-first so a fresh deployment is never hidden behind a stale page; the
 * last good copy is only used when the network is unavailable. Static assets
 * are cache-first because Next fingerprints them.
 */
const CACHE = 'lamirkohsa-shell-v2'
const PRECACHE = [
  '/',
  '/offline',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]
const OFFLINE_FALLBACK = '/offline'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

const isStaticAsset = (url) =>
  url.pathname.startsWith('/_next/static/') ||
  url.pathname.startsWith('/icons/') ||
  url.pathname.startsWith('/fonts/') ||
  url.pathname.startsWith('/images/') ||
  /\.(?:css|js|png|jpe?g|webp|avif|svg|gif|woff2?|ttf)$/i.test(url.pathname)

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  // Never cache API, auth or admin responses.
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin')) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined)
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          return cached || caches.match(OFFLINE_FALLBACK) || Response.error()
        }),
    )
    return
  }

  if (!isStaticAsset(url)) return

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined)
        }
        return response
      })
    }),
  )
})
