import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface LandingPageProps { onNavigate: (page: string) => void; }

const FEATURES = [
  { icon: '✏️', title: 'Freehand Drawing', desc: 'Smooth bezier-curved strokes with variable width, colour picker, and pressure simulation. Like drawing on real paper.', page: 'board' },
  { icon: '📌', title: 'Cute Sticky Notes', desc: 'Pop in pastel notes with emoji, auto-resize text, spring animations, and a folded-corner style. 6 adorable colours.', page: 'board' },
  { icon: '🔷', title: 'Shapes & Connectors', desc: 'Rectangle, ellipse, line, and arrow tools. Shift-lock to perfect squares and circles. Layer and group elements freely.', page: 'board' },
  { icon: '🔍', title: 'Zoom & Pan', desc: 'Mouse wheel zoom from 10% to 400%. Space-drag to pan. Fit-to-screen in one click. Canvas is infinite.', page: 'board' },
  { icon: '🌸', title: 'Meet Blossom — Your AI Guide', desc: 'Blossom is your built-in AI chatbot. Ask her anything about the whiteboard — tools, shortcuts, tips — and she\'ll guide you step by step.', page: 'board' },
  { icon: '📅', title: 'Notion-style Task Board', desc: 'Kanban, Calendar, and List views. Drag-and-drop cards. Priority badges, due dates, assignees, and filters.', page: 'tasks' },
  { icon: '↩️', title: 'Undo / Redo', desc: 'Full 50-step history stack. Ctrl+Z your mistakes away. Every action is tracked with a friendly toast notification.', page: 'board' },
  { icon: '🖼️', title: 'Export & Share', desc: 'Screenshot your board and share it with friends in one click. Pure client-side, no upload needed.', page: 'board' },
  { icon: '💾', title: 'Auto-Save', desc: 'Your board saves to localStorage every 10 seconds. Come back tomorrow — your work will still be there.', page: 'board' },
];


function AnimatedCounter({ target, suffix = '' }: { target: number | string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView || typeof target !== 'number') return;
    let start = 0;
    const step = target / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 30);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <div ref={ref}>{typeof target === 'number' ? count + suffix : target}</div>;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const [hearts, setHearts] = useState<Array<{ id: number; left: number; delay: number; size: number }>>([]);

  useEffect(() => {
    const h = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      size: 1 + Math.random() * 1.2,
    }));
    setHearts(h);
  }, []);

  return (
    <div style={{ paddingTop: 60 }}>
      {/* HERO */}
      <section style={{ minHeight: '92vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', textAlign: 'center', padding: '2rem' }}>
        {/* Blobs */}
        {[
          { w: 420, h: 380, top: -80, left: -100, g: '#FFB7D5,#FFDDE9', d: 0 },
          { w: 350, h: 320, top: -60, right: -80, g: '#FFD6E8,#FFE8F2', d: -3 },
          { w: 300, h: 280, bottom: 20, left: '10%', g: '#FFC8DE,#FFD6E8', d: -5 },
          { w: 260, h: 240, bottom: -20, right: '5%', g: '#FFE0EE,#FFF0F5', d: -2 },
        ].map((b, i) => (
          <div key={i} style={{
            position: 'absolute', width: b.w, height: b.h, borderRadius: '50%',
            background: `radial-gradient(circle, ${b.g})`,
            top: (b as any).top, bottom: (b as any).bottom,
            left: (b as any).left, right: (b as any).right,
            opacity: 0.6, filter: 'blur(1px)',
            animation: `blobFloat 8s ease-in-out ${b.d}s infinite`,
          }} />
        ))}

        {/* Floating hearts */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {hearts.map(h => (
            <div key={h.id} style={{
              position: 'absolute', left: `${h.left}%`, bottom: 0,
              fontSize: `${h.size}rem`, opacity: 0.5,
              animation: `floatUp 6s linear ${h.delay}s infinite`,
            }}>♡</div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#FCE4EC', border: '1.5px solid #F48FB1', borderRadius: 50, padding: '0.35rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: '#7B3F6E', marginBottom: '1.2rem', position: 'relative', zIndex: 2 }}>
          ✨ HackStreet 2K26 · Problem Statement 4
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ fontSize: 'clamp(2.8rem, 7vw, 5rem)', fontWeight: 900, color: '#3D1A2E', lineHeight: 1.1, marginBottom: '1rem', position: 'relative', zIndex: 2 }}>
          Your ideas, <em style={{ fontStyle: 'normal', color: '#E91E8C' }}>in full bloom</em> 🌸
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ fontSize: '1.1rem', color: '#7B3F6E', maxWidth: 540, lineHeight: 1.6, marginBottom: '2rem', position: 'relative', zIndex: 2 }}>
          A collaborative whiteboard that's as cute as it is powerful. Draw, organise, and brainstorm — all in one delightful pink space.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          <button onClick={() => onNavigate('board')} style={{
            background: '#E91E8C', color: 'white', padding: '0.85rem 2.2rem',
            borderRadius: 50, border: 'none', cursor: 'pointer',
            fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '1rem',
            transition: 'all 0.25s', boxShadow: '0 4px 20px rgba(233,30,140,0.35)',
          }}
            onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'translateY(0)'; }}>
            Open the Board ✏️
          </button>
          <button onClick={() => onNavigate('tasks')} style={{
            background: 'white', color: '#E91E8C', padding: '0.85rem 2.2rem',
            borderRadius: 50, border: '2px solid #E91E8C', cursor: 'pointer',
            fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '1rem',
            transition: 'all 0.25s',
          }}
            onMouseEnter={e => { const el = e.target as HTMLElement; el.style.background = '#FCE4EC'; el.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { const el = e.target as HTMLElement; el.style.background = 'white'; el.style.transform = 'translateY(0)'; }}>
            View Tasks 📋
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 2, marginTop: '2.5rem' }}>
          {['🎨 Freehand Drawing', '📌 Sticky Notes', '🔍 Zoom & Pan', '👥 Collab Mode', '📅 Task Board', '💾 Export PNG'].map(chip => (
            <div key={chip} style={{
              background: 'white', border: '1.5px solid #F48FB1',
              borderRadius: 50, padding: '0.4rem 1.1rem',
              fontSize: '0.8rem', fontWeight: 700, color: '#7B3F6E',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}>{chip}</div>
          ))}
        </motion.div>
      </section>

      {/* STATS */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap',
        padding: '3rem 2rem', background: 'white',
        borderTop: '1.5px solid #FCE4EC', borderBottom: '1.5px solid #FCE4EC',
      }}>
        {[
          { val: '∞', label: 'Ideas Possible' },
          { val: 12, label: 'Drawing Tools', suffix: '+' },
          { val: 1, label: 'Cute Theme', suffix: '' },
          { val: 0, label: 'Servers Needed', suffix: '' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#E91E8C' }}>
              <AnimatedCounter target={s.val as any} suffix={s.suffix} />
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#AD6590', marginTop: '0.1rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* FEATURES */}
      <section style={{ padding: '5rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.12em', color: '#E91E8C', textTransform: 'uppercase', marginBottom: '0.6rem' }}>✦ Everything you need</div>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: '#3D1A2E', marginBottom: '0.5rem' }}>Features that spark joy ✨</h2>
        <p style={{ textAlign: 'center', color: '#AD6590', fontSize: '1rem', marginBottom: '3rem', maxWidth: 520, margin: '0 auto 3rem' }}>Everything you'd expect from a pro whiteboard, wrapped in the cutest pink UI you've ever seen.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {FEATURES.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              onClick={() => onNavigate(f.page)}
              style={{
                background: 'white', borderRadius: 24, padding: '1.8rem',
                border: '1.5px solid #FCE4EC', transition: 'all 0.3s',
                cursor: 'pointer', position: 'relative', overflow: 'hidden',
              }}
              whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(233,30,140,0.2)', borderColor: '#F48FB1' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: '#FCE4EC', opacity: 0.5 }} />
              <span style={{ fontSize: '2.2rem', marginBottom: '1rem', display: 'block' }}>{f.icon}</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#3D1A2E', marginBottom: '0.4rem' }}>{f.title}</div>
              <div style={{ fontSize: '0.88rem', color: '#7B3F6E', lineHeight: 1.6 }}>{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* COLLAB SECTION */}
      <section style={{ background: 'linear-gradient(135deg, #FCE4EC, white, #FFF0F5)', padding: '5rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.12em', color: '#E91E8C', textTransform: 'uppercase', marginBottom: '0.6rem' }}>✦ Real-time vibes</div>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, color: '#3D1A2E', marginBottom: '1.5rem' }}>Collaborate with your team 💕</h2>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '0 auto 1rem', maxWidth: 200 }}>
          {[
            { init: 'AL', bg: '#E91E8C' }, { init: 'BJ', bg: '#9C27B0' },
            { init: 'MK', bg: '#2196F3' }, { init: 'SR', bg: '#4CAF50' },
          ].map((av, i) => (
            <div key={i} style={{
              width: 52, height: 52, borderRadius: '50%',
              border: '3px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '0.85rem', color: 'white',
              marginLeft: i === 0 ? 0 : -10,
              background: av.bg, boxShadow: '0 2px 12px rgba(233,30,140,0.2)',
            }}>{av.init}</div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.9rem', color: '#7B3F6E', fontWeight: 600, marginBottom: '0.5rem' }}>
          <div style={{ width: 8, height: 8, background: '#4CAF50', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
          4 collaborators online right now
        </div>
        <p style={{ color: '#AD6590', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Watch live cursors glide, see who's typing, and follow the activity feed — all mock, all delightful.</p>

        <button onClick={() => onNavigate('board')} style={{
          background: '#E91E8C', color: 'white', padding: '0.85rem 2.2rem',
          borderRadius: 50, border: 'none', cursor: 'pointer',
          fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '1rem',
          boxShadow: '0 4px 20px rgba(233,30,140,0.35)', transition: 'all 0.25s',
        }}>
          Try the Board Together ♡
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#E91E8C', padding: '2rem', textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: '1.3rem', marginBottom: '0.5rem', letterSpacing: '0.3rem' }}>♡ ♡ ♡ ♡ ♡</div>
        <p style={{ opacity: 0.85, fontSize: '0.9rem' }}>Made with ♡ for HackStreet 2K26 · Problem Statement 4 · Blossom Board v1.0</p>
      </footer>
    </div>
  );
}
