import { useState } from 'react';
import { useBoardStore } from '../../store/boardStore';
import { useTheme } from '../../context/ThemeContext';
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
  const { theme } = useTheme();
  const activities = useBoardStore(s => s.activities);
  const [open, setOpen] = useState(true);

  return (
    <div style={{
      display: 'flex', flexDirection: 'row', flexShrink: 0,
      transition: 'width 0.25s ease', width: open ? 224 : 42,
      borderLeft: `1.5px solid ${theme.border}`, overflow: 'hidden',
      background: theme.surface, position: 'relative',
    }}>
      {/* Toggle tab */}
      <button
        onClick={() => setOpen(o => !o)}
        title={open ? 'Hide activity' : 'Show team activity'}
        style={{
          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
          width: 22, height: 56, borderRadius: '8px 0 0 8px',
          background: theme.primaryLight,
          border: 'none', borderRight: `1.5px solid ${theme.borderStrong}`,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: theme.primary, fontSize: '0.75rem', fontWeight: 900, zIndex: 5, flexShrink: 0,
          boxShadow: theme.shadow,
        }}
      >
        {open ? '›' : '‹'}
      </button>

      {/* Panel */}
      <div style={{ marginLeft: 22, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minWidth: 0 }}>
        {/* Header */}
        <div style={{
          padding: '0.7rem 0.8rem', borderBottom: `1.5px solid ${theme.border}`,
          fontSize: '0.8rem', fontWeight: theme.labelWeight, color: theme.primary,
          display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap',
        }}>
          {theme.kawaii ? '🌸' : '◈'} Team Activity
        </div>

        {/* Activity list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
          {activities.length === 0 ? (
            <div style={{ textAlign: 'center', color: theme.textSubtle, fontSize: '0.78rem', marginTop: '1.5rem', lineHeight: 1.6 }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>{theme.kawaii ? '🌸' : '○'}</div>
              Start drawing to see activity!
            </div>
          ) : (
            activities.map(act => (
              <div key={act.id}
                style={{ display: 'flex', gap: '0.45rem', padding: '0.4rem', borderRadius: theme.radiusSm, marginBottom: '0.25rem', transition: 'background 0.2s', alignItems: 'flex-start' }}
                onMouseEnter={e => (e.currentTarget.style.background = theme.surfaceHover)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <KawaiiAvatar initials={act.userInitials} name={act.user} size={26} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.72rem', color: theme.text, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <strong>{act.user}</strong> {act.action}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: theme.textSubtle }}>{timeAgo(act.time)}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Online now */}
        <div style={{ padding: '0.6rem 0.8rem', borderTop: `1.5px solid ${theme.border}` }}>
          <div style={{ fontSize: '0.62rem', fontWeight: theme.labelWeight, color: theme.textSubtle, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
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
