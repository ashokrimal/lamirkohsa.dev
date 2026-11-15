import { ImageResponse } from 'next/og';

export const alt = 'Ashok Rimal — Interactive 3D Creative Technologist Portfolio';
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
          backgroundColor: '#04070a',
          backgroundImage:
            'radial-gradient(circle at 82% 28%, rgba(94, 234, 212, 0.18), transparent 44%), radial-gradient(circle at 18% 82%, rgba(200, 255, 114, 0.12), transparent 42%)',
          color: '#f3f6f8',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '24px',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            display: 'flex',
          }}
        />

        <div
          style={{
            position: 'absolute',
            right: '-80px',
            top: '75px',
            width: '480px',
            height: '480px',
            borderRadius: '9999px',
            border: '1px solid rgba(94, 234, 212, 0.32)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '340px',
              height: '340px',
              borderRadius: '9999px',
              border: '1px solid rgba(200, 255, 114, 0.28)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '9999px',
                background: '#c8ff72',
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
                width: '44px',
                height: '44px',
                border: '1px solid rgba(94, 234, 212, 0.5)',
                color: '#5eead4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 700,
                letterSpacing: '0.12em',
              }}
            >
              AR
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.16em' }}>
                ASHOK RIMAL
              </span>
              <span
                style={{
                  fontSize: '12px',
                  color: '#8d9ba5',
                  letterSpacing: '0.18em',
                  marginTop: '2px',
                }}
              >
                CREATIVE TECHNOLOGIST // EDITION A2
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              letterSpacing: '0.18em',
              color: '#5eead4',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '9999px',
                background: '#c8ff72',
              }}
            />
            <span>27.7172° N / 85.3240° E</span>
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
              letterSpacing: '0.24em',
              color: '#5eead4',
              marginBottom: '20px',
            }}
          >
            INTERACTIVE 3D PORTFOLIO · KATHMANDU
          </span>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: '74px',
              fontWeight: 800,
              lineHeight: 0.96,
              letterSpacing: '-0.03em',
            }}
          >
            <span>I BUILD</span>
            <span style={{ color: '#c8ff72', fontStyle: 'italic' }}>WORLDS</span>
            <span>THAT MOVE.</span>
          </div>

          <p
            style={{
              marginTop: '26px',
              fontSize: '21px',
              lineHeight: 1.45,
              color: '#b4c0c9',
              maxWidth: '660px',
            }}
          >
            Considered interfaces, real-time WebGL space, and resilient full-stack systems.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '22px',
            fontSize: '13px',
            letterSpacing: '0.18em',
            color: '#8d9ba5',
            zIndex: 2,
          }}
        >
          <span>THREE.JS · R3F · GSAP · FRAMER MOTION · NEXT.JS</span>
          <span style={{ color: '#f3f6f8' }}>ASHOKRIMAL.COM.NP/A2</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
