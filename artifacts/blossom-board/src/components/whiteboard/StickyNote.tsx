import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useBoardStore, BoardElement } from '../../store/boardStore';

const STICKY_COLORS = [
  { bg: '#FFDDE9', label: 'Pink' },
  { bg: '#FFF9C4', label: 'Yellow' },
  { bg: '#C8F7C5', label: 'Mint' },
  { bg: '#E8D5FF', label: 'Lavender' },
  { bg: '#FFE0CC', label: 'Peach' },
  { bg: '#C5E8FF', label: 'Sky' },
];

const EMOJIS = ['😊', '🌸', '💕', '✨', '🔥', '💡', '⭐', '🎉', '👍', '❤️', '🌈', '🦋', '🍀', '🌻', '💫', '🎀'];

/* Slightly darken a hex color — used for crease shadow */
function darkenHex(hex: string, amount = 40): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (n >> 16) - amount);
  const g = Math.max(0, ((n >> 8) & 0xff) - amount);
  const b = Math.max(0, (n & 0xff) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

interface Props {
  element: BoardElement;
  viewport: { x: number; y: number; scale: number };
  isSelected: boolean;
}

export default function StickyNote({ element, viewport, isSelected }: Props) {
  const updateElement = useBoardStore(s => s.updateElement);
  const selectIds    = useBoardStore(s => s.selectIds);
  const [showEmojis, setShowEmojis] = useState(false);
  const [isEditing,  setIsEditing]  = useState(false);
  const [hovered,    setHovered]    = useState(false);
  const dragStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null);
  const bodyRef   = useRef<HTMLTextAreaElement>(null);

  const screenX = element.x * viewport.scale + viewport.x;
  const screenY = element.y * viewport.scale + viewport.y;
  const w = Math.max(element.w, 160);
  const h = Math.max(element.h, 120);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isEditing) return;
    e.stopPropagation();
    selectIds([element.id]);
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: element.x, oy: element.y };

    const onMove = (ev: MouseEvent) => {
      if (!dragStart.current) return;
      const dx = (ev.clientX - dragStart.current.mx) / viewport.scale;
      const dy = (ev.clientY - dragStart.current.my) / viewport.scale;
      updateElement(element.id, { x: dragStart.current.ox + dx, y: dragStart.current.oy + dy });
    };
    const onUp = () => {
      dragStart.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [isEditing, element, viewport.scale, updateElement, selectIds]);

  const stickyColor = element.stickyColor || '#FFDDE9';

  // Peel corner sizes
  const peelBase   = Math.round(22 * viewport.scale);
  const peelHover  = Math.round(46 * viewport.scale);
  const peel = hovered ? peelHover : peelBase;

  // Colors for the three-layer peel
  const peelShadowColor  = 'rgba(0,0,0,0.15)';            // shadow cast on card surface
  const peelFaceColor    = darkenHex(stickyColor, 28);     // the fold face (darker shade of note)
  const peelBackColor    = '#f5f0eb';                      // paper back of the folded corner

  // Natural slight rotation per note id
  const rotation = (element.id.charCodeAt(0) % 7) - 3;

  return (
    <motion.div
      initial={{ scale: 0.7, rotate: -5, opacity: 0 }}
      animate={{
        scale: hovered ? 1.04 : 1,
        rotate: hovered ? rotation * 0.5 : rotation,
        opacity: 1,
      }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      style={{
        position: 'absolute',
        left: screenX, top: screenY,
        width: w * viewport.scale,
        minHeight: h * viewport.scale,
        background: stickyColor,
        borderRadius: 16,
        padding: '12px 14px',
        cursor: isEditing ? 'text' : 'move',
        userSelect: isEditing ? 'text' : 'none',
        boxShadow: isSelected
          ? `0 12px 36px rgba(0,0,0,0.22), 0 0 0 2px #E91E8C`
          : hovered
            ? '0 16px 48px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.10)'
            : '0 4px 20px rgba(0,0,0,0.12)',
        zIndex: hovered ? element.zIndex + 200 : element.zIndex + 100,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        transition: 'box-shadow 0.25s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={handleMouseDown}
      onDoubleClick={() => { setIsEditing(true); setTimeout(() => bodyRef.current?.focus(), 50); }}
    >
      {/* ── PEEL CORNER — three-layer CSS triangle stack ───────────────── */}

      {/* Layer 1: shadow cast on the card surface by the curled corner */}
      <div style={{
        position: 'absolute', bottom: 0, right: 0,
        width: 0, height: 0,
        borderStyle: 'solid',
        borderWidth: `0 0 ${peel + 8}px ${peel + 8}px`,
        borderColor: `transparent transparent ${peelShadowColor} transparent`,
        transition: 'border-width 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        pointerEvents: 'none',
        zIndex: 10,
      }} />

      {/* Layer 2: the fold face — same color family as the note but darker */}
      <div style={{
        position: 'absolute', bottom: 0, right: 0,
        width: 0, height: 0,
        borderStyle: 'solid',
        borderWidth: `0 0 ${peel}px ${peel}px`,
        borderColor: `transparent transparent ${peelFaceColor} transparent`,
        transition: 'border-width 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        pointerEvents: 'none',
        zIndex: 11,
      }} />

      {/* Layer 3: paper back — off-white face of the physically peeled corner */}
      <div style={{
        position: 'absolute', bottom: 0, right: 0,
        width: 0, height: 0,
        borderStyle: 'solid',
        borderWidth: `0 0 ${peel - 4}px ${peel - 4}px`,
        borderColor: `transparent transparent ${peelBackColor} transparent`,
        transition: 'border-width 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        pointerEvents: 'none',
        zIndex: 12,
        filter: hovered ? 'drop-shadow(-3px -3px 5px rgba(0,0,0,0.18))' : 'none',
      }} />

      {/* ── NOTE CONTENT ──────────────────────────────────────────────── */}

      {/* Top row: emoji + delete */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, position: 'relative', zIndex: 20 }}>
        <div
          style={{ cursor: 'pointer', fontSize: '1rem', userSelect: 'none' }}
          onClick={(e) => { e.stopPropagation(); setShowEmojis(!showEmojis); }}
        >
          {element.emoji || '📌'}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            const s = useBoardStore.getState();
            s.selectIds([element.id]);
            s.deleteSelected();
          }}
          style={{
            background: 'rgba(0,0,0,0.15)', border: 'none', borderRadius: '50%',
            width: 20, height: 20, cursor: 'pointer', fontSize: '0.65rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3D1A2E',
          }}
        >✕</button>
      </div>

      {/* Color row */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8, position: 'relative', zIndex: 20 }}>
        {STICKY_COLORS.map(c => (
          <div key={c.bg} onClick={(e) => { e.stopPropagation(); updateElement(element.id, { stickyColor: c.bg }); }}
            style={{ width: 14, height: 14, borderRadius: '50%', background: c.bg, border: `2px solid ${stickyColor === c.bg ? '#3D1A2E' : 'transparent'}`, cursor: 'pointer', flexShrink: 0 }} />
        ))}
      </div>

      {/* Body text */}
      <textarea
        ref={bodyRef}
        value={element.content || ''}
        onChange={e => updateElement(element.id, { content: e.target.value })}
        onFocus={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
        placeholder="Click to type..."
        style={{
          flex: 1, background: 'transparent', border: 'none', outline: 'none',
          resize: 'none', fontFamily: 'Nunito, sans-serif',
          fontSize: `${14 * viewport.scale}px`, fontWeight: 600,
          color: 'rgba(0,0,0,0.75)', lineHeight: 1.5,
          cursor: isEditing ? 'text' : 'inherit',
          minHeight: 60 * viewport.scale,
          width: '100%',
          position: 'relative', zIndex: 20,
        }}
      />

      {/* Emoji picker */}
      {showEmojis && (
        <div
          style={{
            position: 'absolute', top: 36, left: 8, background: 'white',
            border: '1.5px solid #FCE4EC', borderRadius: 12,
            padding: 8, zIndex: 1000,
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {EMOJIS.map(em => (
            <div key={em} onClick={() => { updateElement(element.id, { emoji: em }); setShowEmojis(false); }}
              style={{ cursor: 'pointer', fontSize: '1.2rem', textAlign: 'center', padding: 2, borderRadius: 6, transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FCE4EC')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              {em}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
