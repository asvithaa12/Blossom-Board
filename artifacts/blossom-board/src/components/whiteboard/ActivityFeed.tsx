import { useState } from 'react';
import { useBoardStore } from '../../store/boardStore';
import KawaiiAvatar from '../KawaiiAvatar';

function timeAgo(ms: number) {
  const diff = Date.now() - ms;
  if (diff < 5000) return 'just now';
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

const ONLINE = [
  { init: 'AL', name: 'Alice L.' },
  { init: 'BJ', name: 'Bob J.' },
  { init: 'MK', name: 'Maya K.' },
  { init: 'SR', name: 'Sam R.' },
];

export default function ActivityFeed() {
  const activities = useBoardStore(s => s.activities);
  const [open, setOpen] = useState(true);

  return (
    <div style={{
      display: 'flex', flexDirection: 'row', flexShrink: 0,
      transition: 'width 0.25s ease', width: open ? 224 : 42,
      borderLeft: '1.5px solid #FCE4EC', overflow: 'hidden',
      background: 'white', position: 'relative',
    }}>
      {/* Toggle tab */}
      <button
        onClick={() => setOpen(o => !o)}
        title={open ? 'Hide activity' : 'Show team activity'}
        style={{
          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
          width: 22, height: 56, borderRadius: '8px 0 0 8px',
          background: '#FCE4EC', border: 'none', borderRight: '1.5px solid #F48FB1',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#E91E8C', fontSize: '0.75rem', fontWeight: 900, zIndex: 5, flexShrink: 0,
          boxShadow: '-2px 0 8px rgba(233,30,140,0.08)',
        }}
      >
        {open ? '›' : '‹'}
      </button>

      {/* Panel */}
      <div style={{ marginLeft: 22, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minWidth: 0 }}>
        {/* Header */}
        <div style={{
          padding: '0.7rem 0.8rem', borderBottom: '1.5px solid #FCE4EC',
          fontSize: '0.8rem', fontWeight: 800, color: '#E91E8C',
          display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap',
        }}>
          🌸 Team Activity
        </div>

        {/* Activity list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
          {activities.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#AD6590', fontSize: '0.78rem', marginTop: '1.5rem', lineHeight: 1.6 }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>🌸</div>
              Start drawing to see activity!
            </div>
          ) : (
            activities.map(act => (
              <div key={act.id}
                style={{ display: 'flex', gap: '0.45rem', padding: '0.4rem', borderRadius: 10, marginBottom: '0.25rem', transition: 'background 0.2s', alignItems: 'flex-start' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#FFF0F5')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <KawaiiAvatar initials={act.userInitials} name={act.user} size={26} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.72rem', color: '#3D1A2E', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
          <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#AD6590', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
            Online now
          </div>
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            {ONLINE.map(av => (
              <KawaiiAvatar key={av.init} initials={av.init} name={av.name} size={32} showOnlineDot />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
