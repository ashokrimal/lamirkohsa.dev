/** @type {import('next').NextConfig} */
const isVercel = Boolean(process.env.VERCEL)
const isDev = process.env.NODE_ENV === 'development' && !isVercel

// The site ships no third-party scripts or fonts: everything is served from
// this origin, images come through next/image, GitHub activity is read from the
// public API in the browser, and the one embed is a SnapWidget iframe. Inline
// scripts and styles stay allowed because the theme bootstrap, JSON-LD and
// Next's hydration payload are all inline; the dev server also needs eval and
// its HMR websocket.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  // Pretendard's stylesheet and font files come from jsDelivr (globals.css).
  "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
  // Every public image is served through next/image from this origin. The only
  // external images the site can render directly are CMS records whose URL is
  // the seed media host (images.unsplash.com) and owner uploads in Vercel Blob.
  "img-src 'self' data: blob: https://images.unsplash.com https://*.public.blob.vercel-storage.com",
  "font-src 'self' data: https://cdn.jsdelivr.net",
  "media-src 'self' blob: https:",
  "worker-src 'self' blob:",
  `connect-src 'self' https://api.github.com${isDev ? ' ws: wss:' : ''}`,
  "frame-src https://snapwidget.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  'upgrade-insecure-requests',
].join('; ')

const nextConfig = {
  ...(isVercel ? {} : { output: 'standalone' }),
  // node-postgres loads pg-cloudflare lazily for Workers TCP sockets. Next's
  // output tracing only keeps the `default` export (dist/empty.js) because the
  // dependency is optional, so the workerd build needs these files explicitly.
  outputFileTracingIncludes: {
    '/**/*': [
      './node_modules/pg-cloudflare/dist/**',
      './node_modules/.pnpm/pg-cloudflare@*/node_modules/pg-cloudflare/dist/**',
    ],
  },
  ...(isDev ? { distDir: '.next-dev' } : {}),
  async redirects() {
    return [
      { source: '/classic', destination: '/', permanent: true },
      { source: '/anime', destination: '/media/anime', permanent: true },
      { source: '/music', destination: '/media/music', permanent: true },
      { source: '/movies', destination: '/media/movies', permanent: true },
      { source: '/gallery', destination: '/about/gallery', permanent: true },
      { source: '/github', destination: '/about/github', permanent: true },
    ]
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
        // Nothing on this site is meant to be framed by another origin; the
        // legacy header and the CSP directive cover old and new browsers.
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Content-Security-Policy', value: contentSecurityPolicy },
        // The site asks for no device permissions, so deny them outright.
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(), payment=()',
        },
      ],
    }];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'www.udemy.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net',
      },
      {
        protocol: 'https',
        hostname: 's4.anilist.co',
      },
      {
        protocol: 'https',
        hostname: 'lastfm.freetls.fastly.net',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'd3njjcbhbojbot.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
    ],
  },
};

export default nextConfig;
