import { useEffect, useState } from 'react';

const MOCK_USERS = [
  { name: 'Alice L.', color: '#E91E8C', initials: 'AL', typing: true },
  { name: 'Bob J.', color: '#9C27B0', initials: 'BJ', typing: false },
  { name: 'Maya K.', color: '#2196F3', initials: 'MK', typing: true },
  { name: 'Sam R.', color: '#4CAF50', initials: 'SR', typing: false },
];

interface CursorState {
  user: typeof MOCK_USERS[0];
  x: number; y: number;
  tx: number; ty: number;
  bobPhase: number;
}

// Cute SVG ghost icon
function GhostSVG({ color, size = 32 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 32 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <path d="M4 16C4 9 9.37 4 16 4C22.63 4 28 9 28 16V34C28 34 25 31.5 22 34C19 36.5 16 34 16 34C16 34 13 36.5 10 34C7 31.5 4 34 4 34V16Z"
        fill={color} opacity="0.92" />
      {/* Eyes */}
      <ellipse cx="12" cy="18" rx="2.5" ry="3" fill="white" />
      <ellipse cx="20" cy="18" rx="2.5" ry="3" fill="white" />
      <ellipse cx="12.8" cy="18.8" rx="1.2" ry="1.4" fill="#1a1a1a" />
      <ellipse cx="20.8" cy="18.8" rx="1.2" ry="1.4" fill="#1a1a1a" />
      {/* Highlight dots on eyes */}
      <circle cx="13.3" cy="17.8" r="0.5" fill="white" />
      <circle cx="21.3" cy="17.8" r="0.5" fill="white" />
      {/* Mouth (small smile) */}
      <path d="M13 23 Q16 25 19 23" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.8" />
    </svg>
  );
}

export default function GhostCursors({ containerWidth, containerHeight }: { containerWidth: number; containerHeight: number }) {
  const [cursors, setCursors] = useState<CursorState[]>(() =>
    MOCK_USERS.map((user, i) => ({
      user,
      x: 80 + i * 120, y: 80 + i * 60,
      tx: 100 + Math.random() * (containerWidth - 200),
      ty: 100 + Math.random() * (containerHeight - 200),
      bobPhase: i * Math.PI / 2,
    }))
  );

  useEffect(() => {
    let frame: number;
    let lastTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const dt = Math.min(now - lastTime, 50) / 1000;
      lastTime = now;

      setCursors(prev => prev.map(c => {
        const dx = c.tx - c.x;
        const dy = c.ty - c.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = 90;
        let nx = c.x, ny = c.y;
        if (dist > 2) {
          nx = c.x + (dx / dist) * Math.min(speed * dt, dist);
          ny = c.y + (dy / dist) * Math.min(speed * dt, dist);
        }
        // Bob up and down subtly
        const bobY = Math.sin(now / 800 + c.bobPhase) * 4;
        return { ...c, x: nx, y: ny + bobY - Math.sin((now - 16) / 800 + c.bobPhase) * 4 };
      }));

      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    // Update targets every 2-4 seconds per cursor
    const intervals = MOCK_USERS.map((_, i) => setInterval(() => {
      setCursors(prev => prev.map((c, ci) => ci !== i ? c : {
        ...c,
        tx: 80 + Math.random() * Math.max(100, containerWidth - 160),
        ty: 60 + Math.random() * Math.max(100, containerHeight - 120),
      }));
    }, 2000 + i * 700));

    return () => {
      cancelAnimationFrame(frame);
      intervals.forEach(clearInterval);
    };
  }, [containerWidth, containerHeight]);

  return (
    <>
      {cursors.map(c => (
        <div key={c.user.name} style={{ position: 'absolute', left: c.x, top: c.y, pointerEvents: 'none', zIndex: 100 }}>
          {/* Ghost icon */}
          <div style={{ position: 'relative', filter: `drop-shadow(0 2px 6px ${c.user.color}88)` }}>
            <GhostSVG color={c.user.color} size={28} />
          </div>
          {/* Name label */}
          <div style={{
            background: c.user.color,
            color: 'white',
            fontSize: '0.62rem',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: 20,
            marginTop: -4,
            marginLeft: 28,
            position: 'absolute',
            top: 0,
            whiteSpace: 'nowrap',
            fontFamily: 'Nunito, sans-serif',
            boxShadow: `0 2px 8px ${c.user.color}55`,
          }}>
            {c.user.name}
            {c.user.typing && <span style={{ marginLeft: 4, opacity: 0.8 }}>✏️</span>}
          </div>
        </div>
      ))}
    </>
  );
}
