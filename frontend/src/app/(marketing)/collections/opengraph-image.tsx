import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0E0D0B',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Georgia, serif',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', top: '0', left: '0', right: '0', height: '2px', background: '#C9A96E' }} />
        <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', height: '2px', background: '#C9A96E' }} />

        <div style={{ fontSize: '72px', fontWeight: '300', color: '#F5F0E8', letterSpacing: '-0.02em', lineHeight: '1', marginBottom: '16px' }}>
          ODSArts
        </div>

        <div style={{ width: '48px', height: '1px', background: '#C9A96E', marginBottom: '20px' }} />

        <div style={{ fontSize: '20px', fontWeight: '400', color: '#8B8680', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Premium Frame Collections
        </div>
      </div>
    ),
    { ...size }
  )
}
