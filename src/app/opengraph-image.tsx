import { ImageResponse } from 'next/og';

export const alt = 'Ashok Rimal — Product Engineer & Creative Technologist';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 64px',
          backgroundColor: '#f6f7f8',
          backgroundImage:
            'radial-gradient(circle at 88% 18%, rgba(13, 148, 136, 0.14), transparent 44%), radial-gradient(circle at 12% 86%, rgba(15, 23, 42, 0.06), transparent 42%)',
          color: '#0f172a',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '24px',
            border: '1px solid rgba(15, 23, 42, 0.1)',
            borderRadius: '20px',
            display: 'flex',
          }}
        />

        <div
          style={{
            position: 'absolute',
            right: '-60px',
            top: '90px',
            width: '440px',
            height: '440px',
            borderRadius: '9999px',
            border: '1px solid rgba(13, 148, 136, 0.24)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '300px',
              height: '300px',
              borderRadius: '9999px',
              border: '1px solid rgba(15, 23, 42, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '9999px',
                backgroundColor: '#0d9488',
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 2,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 700,
                letterSpacing: '0.1em',
              }}
            >
              AR
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.14em' }}>
                ASHOK RIMAL
              </span>
              <span
                style={{
                  fontSize: '12px',
                  color: '#475569',
                  letterSpacing: '0.16em',
                  marginTop: '2px',
                }}
              >
                PRODUCT ENGINEER // CREATIVE TECHNOLOGIST
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 16px',
              borderRadius: '9999px',
              border: '1px solid rgba(15, 23, 42, 0.12)',
              backgroundColor: 'rgba(255, 255, 255, 0.72)',
              fontSize: '13px',
              letterSpacing: '0.14em',
              color: '#0f766e',
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '9999px',
                backgroundColor: '#0d9488',
              }}
            />
            <span>SYSTEM ONLINE · KATHMANDU</span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '780px',
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontSize: '14px',
              letterSpacing: '0.22em',
              color: '#0f766e',
              fontWeight: 600,
              marginBottom: '18px',
            }}
          >
            EDITORIAL PORTFOLIO · CASE STUDIES · ARCHIVE
          </span>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: '68px',
              fontWeight: 800,
              lineHeight: 0.98,
              letterSpacing: '-0.03em',
              color: '#0f172a',
            }}
          >
            <span>Considered interfaces,</span>
            <span style={{ color: '#0d9488' }}>resilient systems.</span>
          </div>

          <p
            style={{
              marginTop: '24px',
              fontSize: '21px',
              lineHeight: 1.45,
              color: '#475569',
              maxWidth: '660px',
            }}
          >
            Selected engineering work, full-stack product architecture, interactive 3D web editions, and personal archive.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(15, 23, 42, 0.1)',
            paddingTop: '22px',
            fontSize: '13px',
            letterSpacing: '0.16em',
            color: '#64748b',
            fontWeight: 600,
            zIndex: 2,
          }}
        >
          <span>NEXT.JS · TYPESCRIPT · POSTGRESQL · WEBGL</span>
          <span style={{ color: '#0f172a' }}>ASHOKRIMAL.COM.NP</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
