import { useState } from 'react';
import { useBoardStore, Tool } from '../../store/boardStore';

const COLORS = [
  '#E91E8C', '#FF4081', '#9C27B0', '#673AB7',
  '#2196F3', '#00BCD4', '#4CAF50', '#8BC34A',
  '#FF9800', '#FF5722', '#FFEB3B', '#795548',
  '#3D1A2E', '#F48FB1', '#CE93D8', '#90CAF9',
  '#ffffff', '#bdbdbd', '#616161', '#000000',
];

interface ToolDef { id: Tool | 'addSticky'; label: string; icon: string; key: string; }

// Draw is FIRST and most prominent
const TOOLS: ToolDef[] = [
  { id: 'pen',    label: 'Draw',   icon: '✏️', key: 'P' },
  { id: 'select', label: 'Select', icon: '↖',  key: 'V' },
  { id: 'eraser', label: 'Erase',  icon: '🧹', key: 'E' },
  { id: 'pan',    label: 'Pan',    icon: '✋', key: 'H' },
];
const SHAPE_TOOLS: ToolDef[] = [
  { id: 'rect',    label: 'Rect',   icon: '▭', key: 'R' },
  { id: 'ellipse', label: 'Circle', icon: '◯', key: 'O' },
  { id: 'line',    label: 'Line',   icon: '╱', key: 'L' },
  { id: 'arrow',   label: 'Arrow',  icon: '→', key: 'A' },
  { id: 'text',    label: 'Text',   icon: 'T', key: 'T' },
];

interface Props { onAddSticky: () => void; onExport: () => void; onShare: () => void; }

function ToolBtn({ t, active, onClick }: { t: ToolDef; active: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, width: '100%' }}>
      <button
        onClick={onClick}
        title={`${t.label} [${t.key}]`}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          width: 46, height: 36, borderRadius: 10, border: active ? '2px solid #E91E8C' : '2px solid transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: t.icon === 'T' || t.icon === '↖' ? '1rem' : '1.1rem',
          fontWeight: t.icon === 'T' ? 900 : undefined,
          transition: 'all 0.15s',
          background: active ? '#E91E8C' : hov ? '#FFF0F5' : 'transparent',
          color: active ? 'white' : hov ? '#E91E8C' : '#7B3F6E',
          boxShadow: active ? '0 2px 10px rgba(233,30,140,0.35)' : 'none',
          transform: active ? 'scale(1.06)' : 'scale(1)',
        }}
      >{t.icon}</button>
      <span style={{ fontSize: '0.44rem', fontWeight: 800, color: active ? '#E91E8C' : '#AD6590', lineHeight: 1 }}>{t.label}</span>
    </div>
  );
}

function ActBtn({ icon, label, onClick, danger, small }: { icon: string; label: string; onClick: () => void; danger?: boolean; small?: boolean }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, width: '100%' }}>
      <button
        onClick={onClick} title={label}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          width: small ? 40 : 46, height: small ? 30 : 36, borderRadius: 10, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: small ? '0.9rem' : '1rem', transition: 'all 0.15s',
          background: hov ? (danger ? '#FFE0E0' : '#FFF0F5') : 'transparent',
          color: hov ? (danger ? '#d32f2f' : '#E91E8C') : '#7B3F6E',
        }}
      >{icon}</button>
      <span style={{ fontSize: '0.44rem', fontWeight: 800, color: '#AD6590', lineHeight: 1 }}>{label}</span>
    </div>
  );
}

const Sep = () => <div style={{ width: 42, height: 1, background: '#FCE4EC', margin: '3px 0', flexShrink: 0 }} />;
const Label = ({ text }: { text: string }) => (
  <span style={{ fontSize: '0.44rem', fontWeight: 800, color: '#AD6590', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{text}</span>
);

export default function Toolbar({ onAddSticky, onExport, onShare }: Props) {
  const { tool, color, strokeWidth, setTool, setColor, setStrokeWidth, undo, redo, clearBoard } = useBoardStore();
  const [showPicker, setShowPicker] = useState(false);
  const [hexVal, setHexVal] = useState(color);

  return (
    <div style={{
      width: 62, background: 'white', borderRight: '1.5px solid #FCE4EC',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '6px 0', gap: '3px', overflowY: 'auto', overflowX: 'visible',
      flexShrink: 0, zIndex: 10, position: 'relative',
    }}>

      {/* HISTORY — Undo on top, Redo below */}
      <Label text="History" />
      <ActBtn icon="↩" label="Undo" onClick={undo} />
      <ActBtn icon="↪" label="Redo" onClick={redo} />

      <Sep />

      {/* TOOLS — Draw is first */}
      <Label text="Tools" />
      {TOOLS.map(t => (
        <ToolBtn key={t.id} t={t} active={tool === t.id} onClick={() => setTool(t.id as Tool)} />
      ))}

      <Sep />

      {/* SHAPES */}
      <Label text="Shapes" />
      {SHAPE_TOOLS.map(t => (
        <ToolBtn key={t.id} t={t} active={tool === t.id} onClick={() => setTool(t.id as Tool)} />
      ))}

      <Sep />

      {/* STICKY */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <button
          onClick={onAddSticky} title="Sticky Note [S]"
          style={{ width: 46, height: 36, borderRadius: 10, border: '2px solid transparent', cursor: 'pointer', fontSize: '1.1rem', background: 'transparent', color: '#7B3F6E', transition: 'all 0.15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FFF0F5'; (e.currentTarget as HTMLElement).style.color = '#E91E8C'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#7B3F6E'; }}
        >📌</button>
        <span style={{ fontSize: '0.44rem', fontWeight: 800, color: '#AD6590' }}>Sticky</span>
      </div>

      <Sep />

      {/* COLOR */}
      <Label text="Color" />
      {/* Quick 8-color grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, padding: '1px 4px' }}>
        {COLORS.slice(0, 8).map(c => (
          <div key={c} onClick={() => { setColor(c); setHexVal(c); }} title={c}
            style={{
              width: 18, height: 18, borderRadius: 5, background: c, cursor: 'pointer',
              border: color === c ? '2.5px solid #3D1A2E' : c === '#ffffff' ? '1.5px solid #E0E0E0' : '1.5px solid transparent',
              transition: 'transform 0.12s', boxSizing: 'border-box',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.25)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
          />
        ))}
      </div>

      {/* More colours toggle */}
      <button onClick={() => setShowPicker(p => !p)}
        style={{ padding: '2px 7px', fontSize: '0.5rem', fontWeight: 800, color: '#E91E8C', background: showPicker ? '#FCE4EC' : 'transparent', border: '1.5px solid #F48FB1', borderRadius: 50, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', marginTop: 2 }}>
        {showPicker ? '▲ less' : '▼ more'}
      </button>

      {/* Active colour swatch */}
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: color, border: '2.5px solid #F48FB1', marginTop: 2, boxShadow: '0 2px 8px rgba(233,30,140,0.25)', cursor: 'pointer' }}
        title="Active colour" onClick={() => setShowPicker(p => !p)} />

      <Sep />

      {/* STROKE SIZE */}
      <Label text="Size" />
      <input type="range" min={1} max={24} value={strokeWidth}
        onChange={e => setStrokeWidth(Number(e.target.value))}
        className="stroke-slider" style={{ width: 44, margin: '2px 0' }} />
      <span style={{ fontSize: '0.5rem', fontWeight: 700, color: '#AD6590' }}>{strokeWidth}px</span>

      <Sep />

      {/* ACTIONS */}
      <ActBtn icon="💾" label="Export" onClick={onExport} />
      <ActBtn icon="📤" label="Share"  onClick={onShare} />
      <ActBtn icon="🗑️" label="Clear"  onClick={clearBoard} danger />

      {/* Colour picker popup */}
      {showPicker && (
        <div style={{
          position: 'absolute', left: 66, top: 130,
          background: 'white', border: '1.5px solid #FCE4EC', borderRadius: 18,
          padding: '1rem', boxShadow: '0 8px 32px rgba(233,30,140,0.2)',
          zIndex: 300, width: 210,
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 900, color: '#3D1A2E', marginBottom: '0.6rem' }}>🎨 Pick a colour</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.35rem', marginBottom: '0.8rem' }}>
            {COLORS.map(c => (
              <div key={c} onClick={() => { setColor(c); setHexVal(c); setShowPicker(false); }}
                style={{ width: 28, height: 28, borderRadius: 7, background: c, cursor: 'pointer', border: color === c ? '2.5px solid #3D1A2E' : c === '#ffffff' ? '1.5px solid #E0E0E0' : '1.5px solid transparent', transition: 'transform 0.12s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <input type="color" value={color} onChange={e => { setColor(e.target.value); setHexVal(e.target.value); }}
              style={{ width: 38, height: 30, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
            <input value={hexVal}
              onChange={e => { setHexVal(e.target.value); if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) setColor(e.target.value); }}
              placeholder="#E91E8C"
              style={{ flex: 1, border: '1.5px solid #F48FB1', borderRadius: 8, padding: '0.28rem 0.5rem', fontSize: '0.78rem', fontFamily: 'Nunito, sans-serif', color: '#3D1A2E', minWidth: 0 }} />
          </div>
          <button onClick={() => setShowPicker(false)}
            style={{ width: '100%', padding: '0.4rem', background: '#E91E8C', border: 'none', borderRadius: 8, color: 'white', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer' }}>
            ✓ Done
          </button>
        </div>
      )}
    </div>
  );
}
