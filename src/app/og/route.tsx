import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'
import { SITE_NAME } from '@/lib/seo'

/**
 * Generated social cards.
 *
 * A CMS record without its own image used to share the site-wide fallback. This
 * route draws a real card from the title, an optional eyebrow and up to four
 * tags, so every unset record still produces a distinct preview. The URL carries
 * every input, so the response is immutable and safe to cache for a year.
 */

export const runtime = 'nodejs'

const MAX_TITLE = 140
const MAX_TAGS = 4

function clamp(value: string | null, max: number): string {
  return (value ?? '').replace(/\s+/g, ' ').trim().slice(0, max)
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const title = clamp(params.get('title'), MAX_TITLE) || SITE_NAME
  const eyebrow = clamp(params.get('eyebrow'), 60)
  const tags = clamp(params.get('tags'), 200)
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, MAX_TAGS)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#f4f1eb',
          padding: '64px 72px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#161618',
              color: '#f4f1eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            AR
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 20, fontWeight: 600, color: '#161618' }}>{SITE_NAME}</span>
            {eyebrow ? (
              <span
                style={{
                  fontSize: 14,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#7a756c',
                }}
              >
                {eyebrow}
              </span>
            ) : null}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: title.length > 70 ? 58 : 72,
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: '-0.035em',
            color: '#161618',
            maxWidth: 1000,
          }}
        >
          {title}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  display: 'flex',
                  borderRadius: 999,
                  border: '1px solid #d8d2c6',
                  background: '#fffdf8',
                  padding: '8px 16px',
                  fontSize: 18,
                  color: '#3f3a33',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          <span style={{ fontSize: 16, color: '#7a756c', letterSpacing: '0.08em' }}>
            ashokrimal.com.np
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
  )
}
