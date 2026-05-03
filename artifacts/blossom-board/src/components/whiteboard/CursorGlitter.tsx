import { useEffect, useRef, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

const GLITTER_COLORS = ['#E91E8C', '#FF80AB', '#F48FB1', '#FFD700', '#CE93D8', '#fff', '#FFB7D5'];

let particleId = 0;

export default function CursorGlitter({ containerRef }: { containerRef: React.RefObject<HTMLElement> }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animRef = useRef<number>();
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const throttle = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - throttle.current < 30) return; // throttle to ~33fps
      throttle.current = now;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (lastPos.current) {
        const dx = x - lastPos.current.x;
        const dy = y - lastPos.current.y;
        const speed = Math.sqrt(dx * dx + dy * dy);
        if (speed < 2) return; // only emit when actually moving

        const count = Math.min(3, Math.floor(speed / 8) + 1);
        const newParticles: Particle[] = Array.from({ length: count }, () => ({
          id: particleId++,
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          size: 2 + Math.random() * 3,
          color: GLITTER_COLORS[Math.floor(Math.random() * GLITTER_COLORS.length)],
          vx: (Math.random() - 0.5) * 1.2,
          vy: -Math.random() * 1.5 - 0.5,
          life: 1,
          maxLife: 0.6 + Math.random() * 0.4,
        }));

        setParticles(prev => [...prev.slice(-40), ...newParticles]);
      }
      lastPos.current = { x, y };
    };

    container.addEventListener('mousemove', onMove);
    return () => container.removeEventListener('mousemove', onMove);
  }, [containerRef]);

  // Animation loop to tick particle life
  useEffect(() => {
    const tick = () => {
      setParticles(prev => {
        if (prev.length === 0) return prev;
        const updated = prev
          .map(p => ({ ...p, life: p.life - 0.035, x: p.x + p.vx, y: p.y + p.vy }))
          .filter(p => p.life > 0);
        return updated.length === prev.length && updated.every((p, i) => p.life === prev[i].life) ? prev : updated;
      });
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  if (particles.length === 0) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 50, overflow: 'hidden' }}>
      {particles.map(p => {
        const opacity = p.life;
        const scale = 0.4 + p.life * 0.6;
        return (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: p.x - p.size / 2,
              top: p.y - p.size / 2,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: p.color,
              opacity,
              transform: `scale(${scale})`,
              pointerEvents: 'none',
              boxShadow: `0 0 ${p.size * 1.5}px ${p.color}`,
            }}
          />
        );
      })}
    </div>
  );
}
