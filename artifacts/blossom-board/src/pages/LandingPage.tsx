import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

interface LandingPageProps { onNavigate: (page: string) => void; }

const CYCLING_WORDS = [
  'freehand drawing', 'sticky notes', 'zoom & pan',
  'collab mode', 'taskboard', 'export png', 'chatbot',
];

function TypewriterCycler({ small = false }: { small?: boolean }) {
  const { theme } = useTheme();
  const [displayed, setDisplayed] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'hold' | 'deleting' | 'pause'>('typing');
  const [cursorVisible, setCursorVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const id = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(id);
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(fn, ms);
  }, []);

  useEffect(() => {
    const word = CYCLING_WORDS[wordIdx];
    if (phase === 'typing') {
      if (displayed.length < word.length) schedule(() => setDisplayed(word.slice(0, displayed.length + 1)), 55);
      else schedule(() => setPhase('hold'), 1600);
    } else if (phase === 'hold') {
      schedule(() => setPhase('deleting'), 0);
    } else if (phase === 'deleting') {
      if (displayed.length > 0) schedule(() => setDisplayed(d => d.slice(0, -1)), 32);
      else schedule(() => setPhase('pause'), 280);
    } else if (phase === 'pause') {
      setWordIdx(i => (i + 1) % CYCLING_WORDS.length);
      setPhase('typing');
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [displayed, phase, wordIdx, schedule]);

  const cursorStyle: React.CSSProperties = {
    opacity: cursorVisible ? 1 : 0,
    color: theme.primary,
    fontWeight: 300,
    marginLeft: 2,
    transition: 'opacity 0.1s',
  };

  if (small) {
    return (
      <div style={{
        fontFamily: theme.kawaii ? "'Comfortaa', cursive" : 'Nunito, sans-serif',
        fontSize: '1.15rem', fontWeight: 600, textAlign: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap',
        color: theme.textMuted,
      }}>
        <span>{theme.kawaii ? 'Blossom your ideas with' : 'Packed with'}</span>
        <span style={{ color: theme.primary, fontWeight: 700, minWidth: 140, display: 'inline-flex', alignItems: 'center' }}>
          {displayed}<span style={cursorStyle}>|</span>
        </span>
      </div>
    );
  }

  return (
    <h1 style={{
      fontFamily: theme.kawaii ? "'Comfortaa', cursive" : 'Nunito, sans-serif',
      fontSize: 'clamp(2rem, 5.5vw, 3.8rem)',
      fontWeight: theme.headingWeight, lineHeight: 1.25,
      marginBottom: '1.2rem', textAlign: 'center',
    }}>
      <span style={{ color: theme.kawaii ? '#c9607a' : theme.textMuted, display: 'block', marginBottom: '0.1em' }}>
        {theme.kawaii ? 'Blossom your ideas with' : 'Your ideas, powered by'}
      </span>
      <span style={{ color: theme.primary, fontWeight: theme.headingWeight, display: 'inline-block', minHeight: '1.35em' }}>
        {displayed}<span style={cursorStyle}>|</span>
      </span>
    </h1>
  );
}

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

const FEATURES = [
  { icon: '✏️', title: 'Freehand Drawing', desc: 'Smooth pressure-sensitive strokes with variable width, colour picker, and calligraphic taper. Like drawing on real paper.', page: 'board' },
  { icon: '📌', title: 'Sticky Notes', desc: 'Pop in pastel notes with emoji, auto-resize text, spring animations. 6 colour options.', page: 'board' },
  { icon: '🔷', title: 'Shapes & Connectors', desc: 'Rectangle, ellipse, line, and arrow tools. Shift-lock for perfect squares and circles.', page: 'board' },
  { icon: '🔍', title: 'Zoom & Pan', desc: 'Mouse wheel zoom from 10% to 400%. Space-drag to pan. Fit-to-screen in one click.', page: 'board' },
  { icon: '🤖', title: 'AI Chatbot', desc: 'Your built-in AI guide. Ask anything about the whiteboard — tools, shortcuts, tips — step by step.', page: 'board' },
  { icon: '📅', title: 'Task Board', desc: 'Kanban, Calendar, and List views. Drag-and-drop cards. Priority badges, due dates, assignees.', page: 'tasks' },
  { icon: '↩️', title: 'Undo / Redo', desc: 'Full 50-step history stack. Ctrl+Z your mistakes away. Every action tracked.', page: 'board' },
  { icon: '🖼️', title: 'Export & Share', desc: 'Screenshot your board instantly — pure client-side, no upload needed.', page: 'board' },
  { icon: '💾', title: 'Auto-Save', desc: 'Your board saves automatically whenever you leave the page. Everything exactly as you left it.', page: 'board' },
];

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const { theme } = useTheme();
  const [hearts, setHearts] = useState<Array<{ id: number; left: number; delay: number; size: number }>>([]);

  useEffect(() => {
    if (!theme.kawaii) return;
    setHearts(Array.from({ length: 12 }, (_, i) => ({
      id: i, left: Math.random() * 100, delay: Math.random() * 5, size: 1 + Math.random() * 1.2,
    })));
  }, [theme.kawaii]);

  const btnPrimary: React.CSSProperties = {
    background: theme.primary, color: 'white',
    padding: '0.85rem 2.2rem',
    borderRadius: theme.radiusPill,
    border: 'none', cursor: 'pointer',
    fontFamily: 'Nunito, sans-serif', fontWeight: theme.labelWeight, fontSize: '1rem',
    transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
    boxShadow: theme.shadowMd,
  };
  const btnOutline: React.CSSProperties = {
    background: theme.surface, color: theme.primary,
    padding: '0.85rem 2.2rem',
    borderRadius: theme.radiusPill,
    border: `2px solid ${theme.primary}`, cursor: 'pointer',
    fontFamily: 'Nunito, sans-serif', fontWeight: theme.labelWeight, fontSize: '1rem',
    transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
    boxShadow: theme.shadow,
  };

  return (
    <div style={{ paddingTop: 60 }}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '92vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden', textAlign: 'center', padding: '2rem',
        background: theme.kawaii
          ? 'transparent'
          : `linear-gradient(145deg, ${theme.primarySoft} 0%, ${theme.surface} 60%)`,
      }}>

        {/* Kawaii blobs */}
        {theme.kawaii && [
          { w: 420, h: 380, top: -80, left: -100, g: '#FFB7D5,#FFDDE9', d: 0 },
          { w: 350, h: 320, top: -60, right: -80, g: '#FFD6E8,#FFE8F2', d: -3 },
          { w: 300, h: 280, bottom: 20, left: '10%', g: '#FFC8DE,#FFD6E8', d: -5 },
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

        {/* Normal mode geometric accent */}
        {!theme.kawaii && (
          <>
            <div style={{ position: 'absolute', top: -120, right: -120, width: 480, height: 480, borderRadius: '50%', background: 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)', opacity: 0.6 }} />
            <div style={{ position: 'absolute', bottom: -80, left: -80, width: 320, height: 320, borderRadius: '50%', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', opacity: 0.5 }} />
          </>
        )}

        {/* Floating hearts — kawaii only */}
        {theme.kawaii && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            {hearts.map(h => (
              <div key={h.id} style={{ position: 'absolute', left: `${h.left}%`, bottom: 0, fontSize: `${h.size}rem`, opacity: 0.5, animation: `floatUp 6s linear ${h.delay}s infinite` }}>♡</div>
            ))}
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: theme.primaryLight, border: `1.5px solid ${theme.borderStrong}`,
            borderRadius: theme.radiusPill,
            padding: '0.35rem 1rem', fontSize: '0.8rem', fontWeight: theme.labelWeight,
            color: theme.kawaii ? '#7B3F6E' : theme.primary,
            marginBottom: '1.2rem', position: 'relative', zIndex: 2,
          }}>
          {theme.kawaii ? '✨' : '◆'} HackStreet 2K26 · Problem Statement 4
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{
            fontSize: 'clamp(2.8rem, 7vw, 5rem)', fontWeight: theme.headingWeight,
            color: theme.text, lineHeight: 1.1, marginBottom: '1rem',
            position: 'relative', zIndex: 2,
          }}>
          Your ideas,{' '}
          <em style={{ fontStyle: 'normal', color: theme.primary }}>
            {theme.kawaii ? 'in full bloom 🌸' : 'in full flow'}
          </em>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{
            fontSize: '1.1rem', color: theme.textMuted,
            maxWidth: 540, lineHeight: 1.7, marginBottom: '2rem',
            position: 'relative', zIndex: 2,
          }}>
          {theme.kawaii
            ? "A collaborative whiteboard that's as cute as it is powerful. Draw, organise, and brainstorm — all in one delightful pink space."
            : 'A collaborative whiteboard built for teams. Draw, organise, and brainstorm — all in one clean, focused workspace.'}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          <button onClick={() => onNavigate('board')} style={btnPrimary}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px) scale(1.05)'; (e.currentTarget as HTMLElement).style.background = theme.primaryHover; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.background = theme.primary; }}>
            {theme.kawaii ? 'Open the Board ✏️' : 'Open the Board →'}
          </button>
          <button onClick={() => onNavigate('tasks')} style={btnOutline}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = theme.primaryLight; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px) scale(1.05)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = theme.surface; (e.currentTarget as HTMLElement).style.transform = ''; }}>
            {theme.kawaii ? 'View Tasks 📋' : 'View Tasks'}
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
          style={{ position: 'relative', zIndex: 2, marginTop: '2rem' }}>
          <TypewriterCycler small />
        </motion.div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap',
        padding: '3rem 2rem', background: theme.surface,
        borderTop: `1.5px solid ${theme.border}`, borderBottom: `1.5px solid ${theme.border}`,
      }}>
        {[
          { val: '∞', label: 'Ideas Possible' },
          { val: 12,  label: 'Drawing Tools', suffix: '+' },
          { val: 9,   label: 'Features', suffix: '' },
          { val: 0,   label: 'Servers Needed', suffix: '' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: theme.headingWeight, color: theme.primary }}>
              <AnimatedCounter target={s.val as any} suffix={s.suffix} />
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: theme.textSubtle, marginTop: '0.1rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', fontSize: '0.78rem', fontWeight: theme.labelWeight, letterSpacing: '0.12em', color: theme.primary, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
          {theme.kawaii ? '✦ Everything you need' : '◆ Feature Set'}
        </div>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: theme.headingWeight, color: theme.text, marginBottom: '0.5rem' }}>
          {theme.kawaii ? 'Features that spark joy ✨' : 'Everything you need to collaborate'}
        </h2>
        <p style={{ textAlign: 'center', color: theme.textMuted, fontSize: '1rem', maxWidth: 520, margin: '0 auto 3rem' }}>
          {theme.kawaii
            ? "Everything you'd expect from a pro whiteboard, wrapped in the cutest pink UI you've ever seen."
            : "A complete set of tools for modern teams — drawing, task management, real-time collaboration."}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
          {FEATURES.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              onClick={() => onNavigate(f.page)}
              style={{
                background: theme.surface, borderRadius: theme.radiusCard,
                padding: '1.6rem', border: `1.5px solid ${theme.border}`,
                transition: 'all 0.25s', cursor: 'pointer', position: 'relative', overflow: 'hidden',
              }}
              whileHover={{ y: -4, boxShadow: theme.shadowMd, borderColor: theme.borderStrong }}>
              {theme.kawaii && (
                <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: theme.primaryLight, opacity: 0.5 }} />
              )}
              {!theme.kawaii && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: theme.primaryLight, borderRadius: '3px 0 0 3px' }} />
              )}
              <span style={{ fontSize: '2rem', marginBottom: '0.9rem', display: 'block' }}>{f.icon}</span>
              <div style={{ fontSize: '1rem', fontWeight: theme.labelWeight, color: theme.text, marginBottom: '0.4rem' }}>{f.title}</div>
              <div style={{ fontSize: '0.87rem', color: theme.textMuted, lineHeight: 1.6 }}>{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── COLLAB SECTION ───────────────────────────────────────────────── */}
      <section style={{
        background: theme.kawaii
          ? 'linear-gradient(135deg, #FCE4EC, white, #FFF0F5)'
          : `linear-gradient(135deg, ${theme.primarySoft}, ${theme.surface})`,
        padding: '5rem 2rem', textAlign: 'center',
      }}>
        <div style={{ fontSize: '0.78rem', fontWeight: theme.labelWeight, letterSpacing: '0.12em', color: theme.primary, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
          {theme.kawaii ? '✦ Real-time vibes' : '◆ Collaboration'}
        </div>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: theme.headingWeight, color: theme.text, marginBottom: '1.5rem' }}>
          {theme.kawaii ? 'Collaborate with your team 💕' : 'Collaborate with your team'}
        </h2>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '0 auto 1rem', maxWidth: 200 }}>
          {[
            { init: 'AL', bg: '#E91E8C' }, { init: 'BJ', bg: '#9C27B0' },
            { init: 'MK', bg: '#2196F3' }, { init: 'SR', bg: '#4CAF50' },
          ].map((av, i) => (
            <div key={i} style={{
              width: 48, height: 48, borderRadius: '50%',
              border: `3px solid ${theme.surface}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '0.8rem', color: 'white',
              marginLeft: i === 0 ? 0 : -10, background: av.bg,
              boxShadow: theme.shadow,
            }}>{av.init}</div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.9rem', color: theme.textMuted, fontWeight: 600, marginBottom: '0.5rem' }}>
          <div style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
          4 collaborators online right now
        </div>
        <p style={{ color: theme.textSubtle, fontSize: '0.9rem', marginBottom: '1.8rem', maxWidth: 460, margin: '0 auto 1.8rem' }}>
          {theme.kawaii
            ? 'Watch live cursors glide, see who\'s typing, and follow the activity feed — all mock, all delightful.'
            : 'Live cursor tracking, activity feed, and real-time updates — everything you need to work together.'}
        </p>

        <button onClick={() => onNavigate('board')} style={btnPrimary}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = theme.primaryHover; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = theme.primary; }}>
          {theme.kawaii ? 'Try the Board Together ♡' : 'Start Collaborating →'}
        </button>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{
        background: theme.kawaii ? '#E91E8C' : theme.text,
        padding: '2rem', textAlign: 'center', color: 'white',
      }}>
        {theme.kawaii && <div style={{ fontSize: '1.3rem', marginBottom: '0.5rem', letterSpacing: '0.3rem' }}>♡ ♡ ♡ ♡ ♡</div>}
        <p style={{ opacity: 0.8, fontSize: '0.88rem' }}>
          {theme.kawaii
            ? 'Made with ♡ for HackStreet 2K26 · Problem Statement 4 · Blossom Board v1.0'
            : 'Blossom Board · HackStreet 2K26 · Problem Statement 4'}
        </p>
      </footer>
    </div>
  );
}
