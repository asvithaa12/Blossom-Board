import { useState } from 'react';
import { useBoardStore } from '../../store/boardStore';

function timeAgo(ms: number) {
  const diff = Date.now() - ms;
  if (diff < 5000) return 'just now';
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

const ONLINE = [
  { init: 'AL', color: '#E91E8C', name: 'Alice L.' },
  { init: 'BJ', color: '#9C27B0', name: 'Bob J.' },
  { init: 'MK', color: '#2196F3', name: 'Maya K.' },
  { init: 'SR', color: '#4CAF50', name: 'Sam R.' },
];

export default function ActivityFeed() {
  const activities = useBoardStore(s => s.activities);
  const [open, setOpen] = useState(true);

  return (
    <div style={{
      display: 'flex', flexDirection: 'row', flexShrink: 0,
      transition: 'width 0.25s ease', width: open ? 220 : 42,
      borderLeft: '1.5px solid #FCE4EC', overflow: 'hidden',
      background: 'white', position: 'relative',
    }}>
      {/* Toggle tab — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        title={open ? 'Hide activity' : 'Show team activity'}
        style={{
          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
          width: 22, height: 56, borderRadius: '8px 0 0 8px',
          background: '#FCE4EC', border: 'none', borderRight: '1.5px solid #F48FB1',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#E91E8C', fontSize: '0.75rem', fontWeight: 900, zIndex: 5,
          flexShrink: 0,
          boxShadow: '-2px 0 8px rgba(233,30,140,0.08)',
        }}
      >
        {open ? '›' : '‹'}
      </button>

      {/* Panel — collapses */}
      <div style={{ marginLeft: 22, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minWidth: 0 }}>
        {/* Header */}
        <div style={{
          padding: '0.75rem 0.8rem', borderBottom: '1.5px solid #FCE4EC',
          fontSize: '0.8rem', fontWeight: 800, color: '#E91E8C',
          display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap',
        }}>
          👥 Team Activity
        </div>

        {/* Activity list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
          {activities.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#AD6590', fontSize: '0.78rem', marginTop: '1.5rem', lineHeight: 1.6 }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>🌸</div>
              Start drawing to see activity!
            </div>
          ) : (
            activities.map(act => (
              <div key={act.id}
                style={{ display: 'flex', gap: '0.4rem', padding: '0.4rem', borderRadius: 10, marginBottom: '0.25rem', transition: 'background 0.2s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#FFF0F5')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: act.userColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>
                  {act.userInitials}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.72rem', color: '#3D1A2E', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <strong>{act.user}</strong> {act.action}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: '#AD6590' }}>{timeAgo(act.time)}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Online now */}
        <div style={{ padding: '0.6rem 0.8rem', borderTop: '1.5px solid #FCE4EC' }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#AD6590', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
            Online now
          </div>
          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
            {ONLINE.map(av => (
              <div key={av.init} title={av.name}
                style={{ width: 30, height: 30, borderRadius: '50%', background: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: 'white', position: 'relative', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'default', flexShrink: 0 }}>
                {av.init}
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, background: '#4CAF50', borderRadius: '50%', border: '1.5px solid white' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
