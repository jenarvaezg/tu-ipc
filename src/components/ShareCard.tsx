import { forwardRef } from 'react'

interface ShareCardProps {
  personalIPC: number
  officialIPC: number
  difference: number
  startMonth: string
  endMonth: string
  region: string
  url: string
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ personalIPC, officialIPC, difference, startMonth, endMonth, region, url }, ref) => {
    const personalColor = personalIPC >= 0 ? '#f43f5e' : '#10b981'
    const officialColor = officialIPC >= 0 ? '#f43f5e' : '#10b981'
    const diffColor = difference >= 0 ? '#f43f5e' : '#10b981'

    return (
      <div
        ref={ref}
        style={{
          width: 1200,
          height: 630,
          padding: 60,
          background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#1a1a2e',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div>
          <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>
            Tu IPC Personal
          </h1>
          <p style={{ fontSize: 20, color: '#64748b', marginBottom: 0 }}>
            {startMonth} a {endMonth}{region !== 'nacional' ? ` · ${region}` : ''}
          </p>
        </div>

        {/* KPIs */}
        <div style={{ display: 'flex', gap: 40, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 16, color: '#64748b', marginBottom: 8, fontWeight: 500 }}>Tu IPC personal</p>
            <p style={{ fontSize: 72, fontWeight: 800, color: personalColor, lineHeight: 1 }}>
              {personalIPC >= 0 ? '+' : ''}{personalIPC.toFixed(2)}%
            </p>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 16, color: '#64748b', marginBottom: 8, fontWeight: 500 }}>IPC oficial</p>
            <p style={{ fontSize: 72, fontWeight: 800, color: officialColor, lineHeight: 1 }}>
              {officialIPC >= 0 ? '+' : ''}{officialIPC.toFixed(2)}%
            </p>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 16, color: '#64748b', marginBottom: 8, fontWeight: 500 }}>Diferencia</p>
            <p style={{ fontSize: 72, fontWeight: 800, color: diffColor, lineHeight: 1 }}>
              {difference >= 0 ? '+' : ''}{difference.toFixed(2)}pp
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <p style={{ fontSize: 18, color: '#94a3b8' }}>
            Calcula el tuyo en tu-ipc.vercel.app
          </p>
          <p style={{ fontSize: 14, color: '#cbd5e1', maxWidth: 500, textAlign: 'right', wordBreak: 'break-all' }}>
            {url.length > 80 ? url.slice(0, 80) + '...' : url}
          </p>
        </div>
      </div>
    )
  }
)

ShareCard.displayName = 'ShareCard'
export default ShareCard
