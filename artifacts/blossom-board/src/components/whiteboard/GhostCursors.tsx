import { useEffect, useRef, useState } from 'react';

const MOCK_USERS = [
  { name: 'Alice L.', color: '#E91E8C' },
  { name: 'Bob J.',   color: '#9C27B0' },
  { name: 'Maya K.', color: '#2196F3' },
];

interface Cursor {
  user: typeof MOCK_USERS[0];
  x: number; y: number;
  tx: number; ty: number;
}

function GhostSVG({ color }: { color: string }) {
  return (
    <svg width={24} height={28} viewBox="0 0 32 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 16C4 9 9.37 4 16 4C22.63 4 28 9 28 16V34C28 34 25 31.5 22 34C19 36.5 16 34 16 34C16 34 13 36.5 10 34C7 31.5 4 34 4 34V16Z"
        fill={color} opacity="0.85" />
      <ellipse cx="12" cy="18" rx="2.5" ry="3" fill="white" />
      <ellipse cx="20" cy="18" rx="2.5" ry="3" fill="white" />
      <ellipse cx="12.8" cy="18.8" rx="1.2" ry="1.4" fill="#1a1a1a" />
      <ellipse cx="20.8" cy="18.8" rx="1.2" ry="1.4" fill="#1a1a1a" />
      <path d="M13 23 Q16 25 19 23" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
    </svg>
  );
}

export default function GhostCursors({ containerWidth, containerHeight }: { containerWidth: number; containerHeight: number }) {
  const [cursors, setCursors] = useState<Cursor[]>(() =>
    MOCK_USERS.map((user, i) => ({
      user,
      x: 120 + i * 180, y: 100 + i * 80,
      tx: 120 + i * 180, ty: 100 + i * 80,
    }))
  );
  const frameRef = useRef<number>(0);

  useEffect(() => {
    // Move targets very infrequently — every 8–12 seconds per cursor
    const timers = MOCK_USERS.map((_, i) =>
      setInterval(() => {
        setCursors(prev => prev.map((c, ci) => ci !== i ? c : {
          ...c,
          tx: 80 + Math.random() * Math.max(100, containerWidth  - 160),
          ty: 80 + Math.random() * Math.max(100, containerHeight - 160),
        }));
      }, 8000 + i * 2000)
    );

    // Smooth interpolation — very slow (lerp factor 0.015 = gentle drift)
    const animate = () => {
      setCursors(prev => prev.map(c => {
        const dx = c.tx - c.x, dy = c.ty - c.y;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return c;
        return { ...c, x: c.x + dx * 0.015, y: c.y + dy * 0.015 };
      }));
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      timers.forEach(clearInterval);
    };
  }, [containerWidth, containerHeight]);

  return (
    <>
      {cursors.map(c => (
        <div key={c.user.name} style={{ position: 'absolute', left: Math.round(c.x), top: Math.round(c.y), pointerEvents: 'none' }}>
          <GhostSVG color={c.user.color} />
          <div style={{
            position: 'absolute', top: 0, left: 26,
            background: c.user.color, color: 'white',
            fontSize: '0.58rem', fontWeight: 800,
            padding: '2px 7px', borderRadius: 20,
            whiteSpace: 'nowrap', fontFamily: 'Nunito, sans-serif',
            opacity: 0.9,
          }}>
            {c.user.name}
          </div>
        </div>
      ))}
    </>
  );
}
