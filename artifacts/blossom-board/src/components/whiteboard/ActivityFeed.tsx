import { useBoardStore } from '../../store/boardStore';

function timeAgo(ms: number) {
  const diff = Date.now() - ms;
  if (diff < 5000) return 'just now';
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

export default function ActivityFeed() {
  const activities = useBoardStore(s => s.activities);

  return (
    <div style={{ width: 220, background: 'white', borderLeft: '1.5px solid #FCE4EC', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ padding: '0.8rem 1rem', borderBottom: '1.5px solid #FCE4EC', fontSize: '0.8rem', fontWeight: 800, color: '#E91E8C', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        👥 Team Activity
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0.6rem' }}>
        {activities.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#AD6590', fontSize: '0.8rem', marginTop: '2rem', lineHeight: 1.6 }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🌸</div>
            Start drawing to see activity here!
          </div>
        ) : (
          activities.map(act => (
            <div key={act.id} style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', borderRadius: 10, marginBottom: '0.3rem', transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FFF0F5')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: act.userColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>
                {act.userInitials}
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#3D1A2E', lineHeight: 1.4 }}>
                  <strong>{act.user}</strong> {act.action}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#AD6590' }}>{timeAgo(act.time)}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ padding: '0.8rem', borderTop: '1.5px solid #FCE4EC' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#AD6590', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Online now</div>
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          {[
            { init: 'AL', color: '#E91E8C', name: 'Alice L.' },
            { init: 'BJ', color: '#9C27B0', name: 'Bob J.' },
            { init: 'MK', color: '#2196F3', name: 'Maya K.' },
            { init: 'SR', color: '#4CAF50', name: 'Sam R.' },
          ].map(av => (
            <div key={av.init} title={av.name} style={{ width: 32, height: 32, borderRadius: '50%', background: av.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: 'white', position: 'relative', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'default' }}>
              {av.init}
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 9, height: 9, background: '#4CAF50', borderRadius: '50%', border: '1.5px solid white' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
