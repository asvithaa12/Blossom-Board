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

interface Props {
  element: BoardElement;
  viewport: { x: number; y: number; scale: number };
  isSelected: boolean;
}

export default function StickyNote({ element, viewport, isSelected }: Props) {
  const updateElement = useBoardStore(s => s.updateElement);
  const selectIds = useBoardStore(s => s.selectIds);
  const deleteSelected = useBoardStore(s => s.deleteSelected);
  const [showEmojis, setShowEmojis] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const dragStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

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
  const darkened = stickyColor + 'CC';

  return (
    <motion.div
      initial={{ scale: 0.7, rotate: -5, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
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
          ? `0 8px 28px rgba(0,0,0,0.18), 0 0 0 2px #E91E8C`
          : '0 4px 20px rgba(0,0,0,0.12)',
        zIndex: element.zIndex + 100,
        transform: `rotate(${(element.id.charCodeAt(0) % 7) - 3}deg)`,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={() => { setIsEditing(true); setTimeout(() => bodyRef.current?.focus(), 50); }}
    >
      {/* Fold corner */}
      <div style={{
        position: 'absolute', bottom: 0, right: 0,
        width: 22, height: 22,
        background: `linear-gradient(225deg, ${darkened} 50%, transparent 50%)`,
        borderRadius: '14px 0 14px 0',
      }} />

      {/* Top row: emoji + delete */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div
          style={{ cursor: 'pointer', fontSize: '1rem', userSelect: 'none' }}
          onClick={(e) => { e.stopPropagation(); setShowEmojis(!showEmojis); }}
        >
          {element.emoji || '📌'}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Use getState() so selectIds + deleteSelected execute on the same tick
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
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
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
