import { useEffect, useState } from 'react';

const MOCK_USERS = [
  { name: 'Alice L.', color: '#E91E8C', initials: 'AL' },
  { name: 'Bob J.', color: '#9C27B0', initials: 'BJ' },
  { name: 'Maya K.', color: '#2196F3', initials: 'MK' },
  { name: 'Sam R.', color: '#4CAF50', initials: 'SR' },
];

interface Cursor {
  user: typeof MOCK_USERS[0];
  x: number; y: number;
  targetX: number; targetY: number;
}

interface Props {
  containerWidth: number;
  containerHeight: number;
}

export default function GhostCursors({ containerWidth, containerHeight }: Props) {
  const [cursors, setCursors] = useState<Cursor[]>(() =>
    MOCK_USERS.map(u => ({
      user: u,
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      targetX: Math.random() * 600 + 100,
      targetY: Math.random() * 400 + 100,
    }))
  );

  useEffect(() => {
    // Move cursors toward targets
    const moveInterval = setInterval(() => {
      setCursors(prev => prev.map(c => {
        const dx = c.targetX - c.x;
        const dy = c.targetY - c.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 5) return c;
        const speed = Math.min(dist * 0.08, 12);
        return { ...c, x: c.x + dx * speed / dist, y: c.y + dy * speed / dist };
      }));
    }, 16);

    // Set new targets periodically
    const targetInterval = setInterval(() => {
      setCursors(prev => prev.map(c => ({
        ...c,
        targetX: Math.random() * (containerWidth - 100) + 50,
        targetY: Math.random() * (containerHeight - 100) + 50,
      })));
    }, 2000 + Math.random() * 2000);

    return () => { clearInterval(moveInterval); clearInterval(targetInterval); };
  }, [containerWidth, containerHeight]);

  return (
    <>
      {cursors.map(c => (
        <div key={c.user.name} style={{
          position: 'absolute',
          left: c.x, top: c.y,
          pointerEvents: 'none',
          zIndex: 200,
          transition: 'left 0.1s linear, top 0.1s linear',
        }}>
          {/* Cursor arrow */}
          <svg width="20" height="20" viewBox="0 0 20 20" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))' }}>
            <path d="M2 2 L14 8 L8 10 L6 16 Z" fill={c.user.color} stroke="white" strokeWidth="1.5" />
          </svg>
          {/* Name tag */}
          <div style={{
            background: c.user.color, color: 'white',
            fontSize: '0.65rem', fontWeight: 700,
            padding: '2px 7px', borderRadius: 6,
            marginLeft: 14, marginTop: -6,
            whiteSpace: 'nowrap',
            fontFamily: 'Nunito, sans-serif',
          }}>
            {c.user.name}
          </div>
        </div>
      ))}
    </>
  );
}
