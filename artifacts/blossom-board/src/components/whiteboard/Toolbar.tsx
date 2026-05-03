import { useState } from 'react';
import { useBoardStore, Tool } from '../../store/boardStore';

const COLORS = [
  '#E91E8C', '#FF80AB', '#9C27B0', '#2196F3', '#4CAF50',
  '#FF5722', '#FF9800', '#FFEB3B', '#00BCD4', '#795548',
  '#3D1A2E', '#ffffff', '#F48FB1', '#CE93D8', '#90CAF9', '#A5D6A7',
];

interface ToolDef { id: Tool | 'addSticky'; label: string; icon: string; key: string; }

const TOOLS: ToolDef[] = [
  { id: 'select', label: 'Select', icon: '🖱️', key: 'V' },
  { id: 'pen', label: 'Pen', icon: '✏️', key: 'P' },
  { id: 'eraser', label: 'Erase', icon: '🧹', key: 'E' },
];
const SHAPE_TOOLS: ToolDef[] = [
  { id: 'rect', label: 'Rect', icon: '▭', key: 'R' },
  { id: 'ellipse', label: 'Circle', icon: '◯', key: 'O' },
  { id: 'line', label: 'Line', icon: '╱', key: 'L' },
  { id: 'arrow', label: 'Arrow', icon: '→', key: 'A' },
];
const EXTRA_TOOLS: ToolDef[] = [
  { id: 'text', label: 'Text', icon: 'T', key: 'T' },
  { id: 'addSticky', label: 'Note', icon: '📌', key: 'S' },
  { id: 'pan', label: 'Pan', icon: '✋', key: 'H' },
];

interface Props {
  onAddSticky: () => void;
  onExport: () => void;
  onShare: () => void;
}

function ToolBtn({ t, isActive, onClick }: { t: ToolDef; isActive: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <button
        onClick={onClick}
        title={`${t.label} (${t.key})`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 42, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: t.icon === 'T' ? '0.95rem' : '1.05rem',
          fontWeight: t.icon === 'T' ? 800 : undefined,
          transition: 'all 0.18s',
          background: isActive ? '#E91E8C' : hovered ? '#FCE4EC' : 'transparent',
          color: isActive ? 'white' : hovered ? '#E91E8C' : '#7B3F6E',
          boxShadow: isActive ? '0 2px 10px rgba(233,30,140,0.35)' : undefined,
          transform: isActive ? 'scale(1.08)' : 'scale(1)',
        }}
      >
        {t.icon}
      </button>
      <div style={{
        fontSize: '0.48rem', fontWeight: 800, lineHeight: 1.1, textAlign: 'center',
        color: isActive ? '#E91E8C' : '#AD6590',
        letterSpacing: '0.01em',
        minHeight: '0.6rem',
      }}>
        {t.label}
      </div>
    </div>
  );
}

function ActionBtn({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <button
        onClick={onClick}
        title={label}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 42, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem',
          transition: 'all 0.18s',
          background: hovered ? '#FCE4EC' : 'transparent',
          color: hovered ? '#E91E8C' : '#7B3F6E',
        }}
      >
        {icon}
      </button>
      <div style={{ fontSize: '0.48rem', fontWeight: 800, lineHeight: 1.1, textAlign: 'center', color: '#AD6590', minHeight: '0.6rem' }}>{label}</div>
    </div>
  );
}

const sep = () => <div style={{ width: 34, height: 1, background: '#FCE4EC', margin: '2px 0' }} />;

export default function Toolbar({ onAddSticky, onExport, onShare }: Props) {
  const { tool, color, strokeWidth, setTool, setColor, setStrokeWidth, undo, redo, clearBoard } = useBoardStore();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [hexInput, setHexInput] = useState(color);

  const handleTool = (id: ToolDef['id']) => {
    if (id === 'addSticky') { onAddSticky(); return; }
    setTool(id as Tool);
  };

  return (
    <div style={{
      width: 64, background: 'white', borderRight: '1.5px solid #FCE4EC',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '6px 0', gap: '2px', overflowY: 'auto', overflowX: 'visible',
      flexShrink: 0, zIndex: 10, position: 'relative',
    }}>
      <div style={{ fontSize: '0.5rem', fontWeight: 800, color: '#E91E8C', letterSpacing: '0.08em', marginBottom: 2 }}>TOOLS</div>

      {TOOLS.map(t => (
        <ToolBtn key={t.id} t={t} isActive={t.id !== 'addSticky' && tool === t.id} onClick={() => handleTool(t.id)} />
      ))}
      {sep()}
      {SHAPE_TOOLS.map(t => (
        <ToolBtn key={t.id} t={t} isActive={tool === t.id} onClick={() => handleTool(t.id)} />
      ))}
      {sep()}
      {EXTRA_TOOLS.map(t => (
        <ToolBtn key={t.id} t={t} isActive={t.id !== 'addSticky' && tool === t.id} onClick={() => handleTool(t.id)} />
      ))}
      {sep()}

      {/* Color swatch */}
      <div style={{ fontSize: '0.48rem', fontWeight: 800, color: '#AD6590', letterSpacing: '0.06em' }}>COLOR</div>
      <div
        onClick={() => setShowColorPicker(!showColorPicker)}
        style={{
          width: 28, height: 28, borderRadius: '50%',
          background: color, cursor: 'pointer',
          border: '2.5px solid #F48FB1',
          boxShadow: '0 2px 8px rgba(233,30,140,0.2)',
          transition: 'transform 0.15s',
          margin: '2px 0',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.18)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
      />

      {/* Stroke */}
      <div style={{ fontSize: '0.48rem', fontWeight: 800, color: '#AD6590', letterSpacing: '0.06em' }}>STROKE</div>
      <input
        type="range" min={1} max={20} value={strokeWidth}
        onChange={e => setStrokeWidth(Number(e.target.value))}
        className="stroke-slider"
        style={{ width: 46, margin: '2px 0 4px' }}
      />
      {sep()}

      <ActionBtn icon="↩" label="Undo" onClick={undo} />
      <ActionBtn icon="↪" label="Redo" onClick={redo} />
      {sep()}
      <ActionBtn icon="💾" label="Export" onClick={onExport} />
      <ActionBtn icon="📤" label="Share" onClick={onShare} />
      <ActionBtn icon="🗑️" label="Clear" onClick={clearBoard} />

      {/* Color Picker Popup */}
      {showColorPicker && (
        <div style={{
          position: 'absolute', left: 70, top: 100,
          background: 'white', border: '1.5px solid #FCE4EC',
          borderRadius: 16, padding: '1rem',
          boxShadow: '0 4px 24px rgba(233,30,140,0.18)',
          zIndex: 200, width: 176,
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#AD6590', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Choose Colour</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem', marginBottom: '0.7rem' }}>
            {COLORS.map(c => (
              <div key={c} onClick={() => { setColor(c); setHexInput(c); setShowColorPicker(false); }}
                style={{
                  width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
                  background: c,
                  border: c === color ? '2.5px solid #3D1A2E' : c === '#ffffff' ? '1.5px solid #FCE4EC' : '2px solid transparent',
                  transition: 'transform 0.12s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.18)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <input type="color" value={color} onChange={e => { setColor(e.target.value); setHexInput(e.target.value); }}
              style={{ width: 36, height: 28, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
            <input value={hexInput} onChange={e => { setHexInput(e.target.value); if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) { setColor(e.target.value); } }}
              style={{ border: '1.5px solid #F48FB1', borderRadius: 8, padding: '0.3rem 0.5rem', fontSize: '0.8rem', fontFamily: 'Nunito, sans-serif', color: '#3D1A2E', width: 80 }} />
          </div>
        </div>
      )}
    </div>
  );
}
