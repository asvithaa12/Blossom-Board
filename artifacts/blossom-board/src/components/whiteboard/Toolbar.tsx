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
  { id: 'ellipse', label: 'Ellipse', icon: '◯', key: 'O' },
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

export default function Toolbar({ onAddSticky, onExport, onShare }: Props) {
  const { tool, color, strokeWidth, setTool, setColor, setStrokeWidth, undo, redo, clearBoard } = useBoardStore();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [hexInput, setHexInput] = useState(color);

  const handleTool = (id: ToolDef['id']) => {
    if (id === 'addSticky') { onAddSticky(); return; }
    setTool(id as Tool);
  };

  const renderBtn = (t: ToolDef) => {
    const isActive = t.id !== 'addSticky' && tool === t.id;
    return (
      <div key={t.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <button
          onClick={() => handleTool(t.id)}
          title={`${t.label} (${t.key})`}
          style={{
            width: 44, height: 44, borderRadius: 14, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: t.icon === 'T' ? '1rem' : '1.2rem',
            fontWeight: t.icon === 'T' ? 800 : undefined,
            transition: 'all 0.2s',
            background: isActive ? '#E91E8C' : 'transparent',
            color: isActive ? 'white' : '#7B3F6E',
            boxShadow: isActive ? '0 2px 12px rgba(233,30,140,0.3)' : undefined,
          }}
          onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = '#FCE4EC'; (e.currentTarget as HTMLElement).style.color = '#E91E8C'; } }}
          onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#7B3F6E'; } }}
        >
          {t.icon}
        </button>
        <div style={{ fontSize: '0.52rem', fontWeight: 700, color: '#AD6590', marginTop: -3, textAlign: 'center', lineHeight: 1 }}>{t.label}</div>
      </div>
    );
  };

  const sep = () => <div style={{ width: 32, height: 1, background: '#FCE4EC', margin: '0.2rem 0' }} />;

  return (
    <div style={{
      width: 68, background: 'white', borderRight: '1.5px solid #FCE4EC',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '0.6rem 0', gap: '0.2rem', overflowY: 'auto',
      flexShrink: 0, zIndex: 10, position: 'relative',
    }}>
      <div style={{ fontSize: '0.55rem', fontWeight: 800, color: '#E91E8C', marginBottom: '0.2rem', textAlign: 'center' }}>TOOLS</div>

      {TOOLS.map(renderBtn)}
      {sep()}
      {SHAPE_TOOLS.map(renderBtn)}
      {sep()}
      {EXTRA_TOOLS.map(renderBtn)}
      {sep()}

      {/* Color */}
      <div style={{ fontSize: '0.52rem', fontWeight: 700, color: '#AD6590', marginTop: '0.3rem' }}>COLOR</div>
      <div
        onClick={() => setShowColorPicker(!showColorPicker)}
        style={{
          width: 30, height: 30, borderRadius: '50%',
          background: color, cursor: 'pointer',
          border: '2.5px solid #F48FB1',
          boxShadow: '0 2px 8px rgba(233,30,140,0.2)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.15)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
      />

      {/* Stroke */}
      <div style={{ fontSize: '0.52rem', fontWeight: 700, color: '#AD6590', marginTop: '0.2rem' }}>STROKE</div>
      <input
        type="range" min={1} max={20} value={strokeWidth}
        onChange={e => setStrokeWidth(Number(e.target.value))}
        className="stroke-slider"
        style={{ width: 48, margin: '0.2rem 0' }}
      />
      {sep()}

      {/* Undo/Redo */}
      {[
        { icon: '↩', label: 'Undo', action: undo, tip: 'Ctrl+Z' },
        { icon: '↪', label: 'Redo', action: redo, tip: 'Ctrl+Y' },
      ].map(b => (
        <div key={b.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button onClick={b.action} title={`${b.label} (${b.tip})`} style={{
            width: 44, height: 44, borderRadius: 14, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', background: 'transparent', color: '#7B3F6E', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FCE4EC'; (e.currentTarget as HTMLElement).style.color = '#E91E8C'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#7B3F6E'; }}>
            {b.icon}
          </button>
          <div style={{ fontSize: '0.52rem', fontWeight: 700, color: '#AD6590', marginTop: -3, textAlign: 'center' }}>{b.label}</div>
        </div>
      ))}

      {sep()}

      {/* Export/Share/Clear */}
      {[
        { icon: '💾', label: 'Export', action: onExport, tip: 'Ctrl+Shift+E' },
        { icon: '📤', label: 'Share', action: onShare, tip: '' },
        { icon: '🗑️', label: 'Clear', action: clearBoard, tip: '' },
      ].map(b => (
        <div key={b.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button onClick={b.action} title={b.label} style={{
            width: 44, height: 44, borderRadius: 14, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', background: 'transparent', color: '#7B3F6E', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FCE4EC'; (e.currentTarget as HTMLElement).style.color = '#E91E8C'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#7B3F6E'; }}>
            {b.icon}
          </button>
          <div style={{ fontSize: '0.52rem', fontWeight: 700, color: '#AD6590', marginTop: -3, textAlign: 'center' }}>{b.label}</div>
        </div>
      ))}

      {/* Color Picker Popup */}
      {showColorPicker && (
        <div style={{
          position: 'absolute', left: 74, top: 120,
          background: 'white', border: '1.5px solid #FCE4EC',
          borderRadius: 16, padding: '1rem',
          boxShadow: '0 4px 24px rgba(233,30,140,0.15)',
          zIndex: 100, width: 180,
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#AD6590', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Colour</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginBottom: '0.7rem' }}>
            {COLORS.map(c => (
              <div key={c} onClick={() => { setColor(c); setHexInput(c); setShowColorPicker(false); }}
                style={{
                  width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
                  background: c, border: c === color ? '2.5px solid #3D1A2E' : '2px solid transparent',
                  transition: 'all 0.15s',
                  boxShadow: c === '#ffffff' ? '0 0 0 1px #FCE4EC' : undefined,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.15)'; }}
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
