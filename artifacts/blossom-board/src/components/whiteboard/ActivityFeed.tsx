import { useState } from 'react';
import { useBoardStore } from '../../store/boardStore';

function timeAgo(ms: number) {
  const diff = Date.now() - ms;
  if (diff < 5000) return 'just now';
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

function AliceAvatar() {
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {/* Pink background */}
      <circle cx="20" cy="20" r="20" fill="#F48FB1" />
      {/* Cat ears */}
      <polygon points="8,10 13,20 4,20" fill="#E91E8C" />
      <polygon points="32,10 36,20 27,20" fill="#E91E8C" />
      <polygon points="8.5,11 12,18 5.5,18" fill="#FFB6C1" />
      <polygon points="31.5,11 35,18 28,18" fill="#FFB6C1" />
      {/* Face */}
      <circle cx="20" cy="23" r="13" fill="#FCE4EC" />
      {/* Eyes */}
      <ellipse cx="15" cy="21" rx="2.5" ry="2.8" fill="#3D1A2E" />
      <ellipse cx="25" cy="21" rx="2.5" ry="2.8" fill="#3D1A2E" />
      <circle cx="15.8" cy="20.2" r="0.9" fill="white" />
      <circle cx="25.8" cy="20.2" r="0.9" fill="white" />
      {/* Blush */}
      <ellipse cx="12" cy="25" rx="3" ry="1.8" fill="#E91E8C" opacity="0.3" />
      <ellipse cx="28" cy="25" rx="3" ry="1.8" fill="#E91E8C" opacity="0.3" />
      {/* Nose */}
      <ellipse cx="20" cy="25" rx="1.2" ry="0.8" fill="#E91E8C" />
      {/* Whiskers */}
      <line x1="7" y1="24" x2="16" y2="25.5" stroke="#AD6590" strokeWidth="0.7" />
      <line x1="7" y1="26" x2="16" y2="26" stroke="#AD6590" strokeWidth="0.7" />
      <line x1="24" y1="25.5" x2="33" y2="24" stroke="#AD6590" strokeWidth="0.7" />
      <line x1="24" y1="26" x2="33" y2="26" stroke="#AD6590" strokeWidth="0.7" />
      {/* Smile */}
      <path d="M17 27.5 Q20 30 23 27.5" stroke="#AD6590" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* Bow */}
      <polygon points="17,8 20,11 17,14" fill="#E91E8C" />
      <polygon points="23,8 20,11 23,14" fill="#E91E8C" />
      <circle cx="20" cy="11" r="2" fill="#FF4081" />
    </svg>
  );
}

function BobAvatar() {
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {/* Purple background */}
      <circle cx="20" cy="20" r="20" fill="#CE93D8" />
      {/* Bunny ears */}
      <ellipse cx="13" cy="8" rx="4" ry="9" fill="#9C27B0" />
      <ellipse cx="27" cy="8" rx="4" ry="9" fill="#9C27B0" />
      <ellipse cx="13" cy="8" rx="2.2" ry="6.5" fill="#F8BBD9" />
      <ellipse cx="27" cy="8" rx="2.2" ry="6.5" fill="#F8BBD9" />
      {/* Face */}
      <circle cx="20" cy="24" r="13" fill="#EDE7F6" />
      {/* Eyes — big round */}
      <circle cx="15.5" cy="22" r="3" fill="#4A148C" />
      <circle cx="24.5" cy="22" r="3" fill="#4A148C" />
      <circle cx="16.3" cy="21.1" r="1" fill="white" />
      <circle cx="25.3" cy="21.1" r="1" fill="white" />
      {/* Blush */}
      <ellipse cx="12" cy="26" rx="3" ry="1.8" fill="#CE93D8" opacity="0.5" />
      <ellipse cx="28" cy="26" rx="3" ry="1.8" fill="#CE93D8" opacity="0.5" />
      {/* Tiny nose */}
      <ellipse cx="20" cy="26" rx="1.5" ry="1" fill="#9C27B0" />
      {/* Smile */}
      <path d="M16.5 28.5 Q20 31.5 23.5 28.5" stroke="#7B1FA2" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Bowtie */}
      <polygon points="16,35 20,32 16,29" fill="#7B1FA2" />
      <polygon points="24,35 20,32 24,29" fill="#7B1FA2" />
      <circle cx="20" cy="32" r="1.5" fill="#9C27B0" />
    </svg>
  );
}

function MayaAvatar() {
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {/* Blue background */}
      <circle cx="20" cy="20" r="20" fill="#64B5F6" />
      {/* Hair top */}
      <ellipse cx="20" cy="12" rx="13" ry="8" fill="#1565C0" />
      {/* Hair sides */}
      <ellipse cx="7" cy="22" rx="5" ry="9" fill="#1565C0" />
      <ellipse cx="33" cy="22" rx="5" ry="9" fill="#1565C0" />
      {/* Face */}
      <circle cx="20" cy="24" r="12" fill="#FFECB3" />
      {/* Eyes — star-shaped pupils */}
      <circle cx="15" cy="22" r="3" fill="white" />
      <circle cx="25" cy="22" r="3" fill="white" />
      {/* Star eyes */}
      <text x="15" y="25" textAnchor="middle" fontSize="5" fill="#1565C0">★</text>
      <text x="25" y="25" textAnchor="middle" fontSize="5" fill="#1565C0">★</text>
      {/* Blush */}
      <ellipse cx="11.5" cy="26" rx="3" ry="1.8" fill="#F48FB1" opacity="0.5" />
      <ellipse cx="28.5" cy="26" rx="3" ry="1.8" fill="#F48FB1" opacity="0.5" />
      {/* Smile */}
      <path d="M16 28.5 Q20 32 24 28.5" stroke="#E91E8C" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* Hair highlight */}
      <ellipse cx="14" cy="10" rx="3" ry="4" fill="#42A5F5" opacity="0.6" />
      {/* Sparkle */}
      <text x="30" y="13" fontSize="7" fill="#FFD700">✦</text>
    </svg>
  );
}

function SamAvatar() {
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      {/* Green background */}
      <circle cx="20" cy="20" r="20" fill="#81C784" />
      {/* Bear ears */}
      <circle cx="10" cy="11" r="6" fill="#388E3C" />
      <circle cx="30" cy="11" r="6" fill="#388E3C" />
      <circle cx="10" cy="11" r="3.5" fill="#A5D6A7" />
      <circle cx="30" cy="11" r="3.5" fill="#A5D6A7" />
      {/* Face */}
      <circle cx="20" cy="24" r="13" fill="#FFF8E1" />
      {/* Snout */}
      <ellipse cx="20" cy="27" rx="5" ry="3.5" fill="#FFCC80" />
      {/* Eyes */}
      <circle cx="15" cy="21" r="2.8" fill="#2E7D32" />
      <circle cx="25" cy="21" r="2.8" fill="#2E7D32" />
      <circle cx="15.8" cy="20.2" r="1" fill="white" />
      <circle cx="25.8" cy="20.2" r="1" fill="white" />
      {/* Blush */}
      <ellipse cx="11" cy="25.5" rx="3" ry="1.8" fill="#EF9A9A" opacity="0.45" />
      <ellipse cx="29" cy="25.5" rx="3" ry="1.8" fill="#EF9A9A" opacity="0.45" />
      {/* Nose */}
      <ellipse cx="20" cy="25.5" rx="1.8" ry="1.2" fill="#388E3C" />
      {/* Smile */}
      <path d="M17 28.5 Q20 31 23 28.5" stroke="#388E3C" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* Tiny leaf accessory */}
      <ellipse cx="33" cy="12" rx="3" ry="4.5" fill="#66BB6A" transform="rotate(30 33 12)" />
      <line x1="33" y1="12" x2="30" y2="16" stroke="#388E3C" strokeWidth="0.8" />
    </svg>
  );
}

const AVATAR_MAP: Record<string, () => JSX.Element> = {
  AL: AliceAvatar,
  BJ: BobAvatar,
  MK: MayaAvatar,
  SR: SamAvatar,
};

function Avatar({ initials, name, size = 32 }: { initials: string; name: string; size?: number }) {
  const Comp = AVATAR_MAP[initials];
  return (
    <div title={name} style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', flexShrink: 0, cursor: 'default' }}>
      {Comp ? <Comp /> : (
        <div style={{ width: '100%', height: '100%', background: '#E91E8C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.28, fontWeight: 800, color: 'white' }}>{initials}</div>
      )}
    </div>
  );
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
                <Avatar initials={act.userInitials} name={act.user} size={26} />
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
              <div key={av.init} style={{ position: 'relative' }}>
                <Avatar initials={av.init} name={av.name} size={32} />
                {/* Green online dot */}
                <div style={{ position: 'absolute', bottom: 1, right: 1, width: 9, height: 9, background: '#4CAF50', borderRadius: '50%', border: '2px solid white' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
