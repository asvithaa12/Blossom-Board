import { useEffect, useCallback, useRef } from 'react';
import { useBoardStore } from '../store/boardStore';
import { useTheme } from '../context/ThemeContext';
import Toolbar from '../components/whiteboard/Toolbar';
import Canvas from '../components/whiteboard/Canvas';
import ActivityFeed from '../components/whiteboard/ActivityFeed';
import { showToast } from '../components/Toast';

interface Props { onNavigate: (page: string) => void; }

export default function WhiteboardPage({ onNavigate: _onNavigate }: Props) {
  const { theme } = useTheme();
  const { setTool, tool: _tool, undo, redo, copySelected, paste, duplicateSelected, deleteSelected, addElement, elements, viewport, setViewport, selectedIds } = useBoardStore();
  const elementsRef = useRef(elements);
  elementsRef.current = elements;

  useEffect(() => {
    try {
      const saved = localStorage.getItem('blossom-board-state');
      if (saved) {
        const els = JSON.parse(saved);
        if (Array.isArray(els) && els.length > 0) {
          const seen = new Set<string>();
          const unique = els.filter((el: any) => { if (seen.has(el.id)) return false; seen.add(el.id); return true; });
          useBoardStore.setState({ elements: unique, history: [unique], historyIndex: 0 });
          showToast(theme.kawaii ? 'Board restored from last session 🌸' : 'Board restored', theme.kawaii ? '🌸' : '✓');
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    return () => {
      try {
        const current = useBoardStore.getState().elements;
        localStorage.setItem('blossom-board-state', JSON.stringify(current));
      } catch {}
    };
  }, []);

  const addSticky = useCallback(() => {
    const colors = ['#FFDDE9', '#FFF9C4', '#C8F7C5', '#E8D5FF', '#FFE0CC', '#C5E8FF'];
    const col = colors[Math.floor(Math.random() * colors.length)];
    const state = useBoardStore.getState();
    addElement({
      id: Math.random().toString(36).slice(2),
      type: 'sticky',
      x: (200 - state.viewport.x) / state.viewport.scale + Math.random() * 200,
      y: (200 - state.viewport.y) / state.viewport.scale + Math.random() * 100,
      w: 180, h: 140, rotation: 0,
      zIndex: state.elements.length + 50,
      strokeColor: '#3D1A2E', fillColor: col, strokeWidth: 1,
      stickyColor: col, content: '', emoji: '📌',
    });
    showToast('Sticky note added!', '📌');
  }, [addElement]);

  const captureBoard = async () => {
    const html2canvas = (await import('html2canvas')).default;
    const boardEl = document.querySelector('.board-canvas-area') as HTMLElement;
    if (!boardEl) throw new Error('Board not found');
    return html2canvas(boardEl, {
      backgroundColor: '#FFF5F9', scale: 1.5,
      ignoreElements: (el) => el.classList.contains('ghost-cursors-layer') || el.classList.contains('cursor-glitter-layer'),
    });
  };

  const handleExport = useCallback(async () => {
    try {
      showToast('Capturing board...', '📸');
      const canvas = await captureBoard();
      const link = document.createElement('a');
      link.download = 'blossom-board.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('Exported as PNG!', '💾');
    } catch { showToast('Export failed', '❌', 'error'); }
  }, []);

  const handleShare = useCallback(async () => {
    try {
      showToast('Taking screenshot...', '📸');
      const canvas = await captureBoard();
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        if (navigator.share) {
          try {
            await navigator.share({ title: 'My Blossom Board 🌸', text: 'Check out my board!', files: [new File([blob], 'blossom-board.png', { type: 'image/png' })] });
            showToast('Shared!', '🌸'); return;
          } catch {}
        }
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          showToast('Copied to clipboard — paste to share!', '📋');
        } catch {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = 'blossom-board-share.png'; a.click();
          URL.revokeObjectURL(url);
          showToast('Screenshot saved!', '📤');
        }
      });
    } catch { showToast('Share failed', '❌', 'error'); }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag)) return;
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) {
        const toolMap: Record<string, string> = { v: 'select', p: 'pen', b: 'pen', e: 'eraser', r: 'rect', o: 'ellipse', l: 'line', a: 'arrow', t: 'text', h: 'pan' };
        if (e.key.toLowerCase() === 's') { e.preventDefault(); addSticky(); return; }
        if (e.key.toLowerCase() === 'f') { e.preventDefault(); setViewport({ x: 0, y: 0, scale: 1 }); return; }
        if (toolMap[e.key.toLowerCase()]) { setTool(toolMap[e.key.toLowerCase()] as any); return; }
        if (e.key === 'Delete' || e.key === 'Backspace') { if (selectedIds.length) { deleteSelected(); showToast('Deleted', '🗑️'); } return; }
        if (e.key === 'Escape') { useBoardStore.getState().selectIds([]); return; }
      }
      if (ctrl) {
        if (e.key === 'z') { e.preventDefault(); undo(); showToast('Undo ↩', ''); return; }
        if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); redo(); showToast('Redo ↪', ''); return; }
        if (e.key === 'c') { e.preventDefault(); copySelected(); showToast('Copied', '📋'); return; }
        if (e.key === 'v') { e.preventDefault(); paste(); showToast('Pasted', '📋'); return; }
        if (e.key === 'd') { e.preventDefault(); duplicateSelected(); showToast('Duplicated', '📋'); return; }
        if (e.key === 'a') { e.preventDefault(); useBoardStore.getState().selectIds(elementsRef.current.map(e => e.id)); return; }
        if (e.key === '=') { e.preventDefault(); setViewport({ scale: Math.min(4, viewport.scale + 0.15) }); return; }
        if (e.key === '-') { e.preventDefault(); setViewport({ scale: Math.max(0.1, viewport.scale - 0.15) }); return; }
        if (e.key === 'E' && e.shiftKey) { e.preventDefault(); handleExport(); return; }
        if (e.key === ']') { e.preventDefault(); useBoardStore.getState().bringForward(); return; }
        if (e.key === '[') { e.preventDefault(); useBoardStore.getState().sendBackward(); return; }
      }
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedIds.length) {
        e.preventDefault();
        const amt = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -amt : e.key === 'ArrowRight' ? amt : 0;
        const dy = e.key === 'ArrowUp' ? -amt : e.key === 'ArrowDown' ? amt : 0;
        selectedIds.forEach(id => {
          const el = elementsRef.current.find(el => el.id === id);
          if (el) useBoardStore.getState().updateElement(id, { x: el.x + dx, y: el.y + dy });
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setTool, undo, redo, copySelected, paste, duplicateSelected, deleteSelected, addSticky, viewport, selectedIds, setViewport, handleExport]);

  // ── Kawaii toolbar styles ────────────────────────────────────────────────
  const toolbarBg       = theme.kawaii ? 'white' : theme.surface;
  const toolbarBorder   = theme.kawaii ? '#FCE4EC' : theme.border;
  const toolbarText     = theme.kawaii ? '#3D1A2E' : theme.text;
  const toolbarMuted    = theme.kawaii ? '#7B3F6E' : theme.textMuted;
  const toolbarSubtle   = theme.kawaii ? '#AD6590' : theme.textSubtle;
  const btnActive       = theme.primary;
  const zoomBtnStyle: React.CSSProperties = {
    padding: '2px 8px',
    background: theme.surface, border: `1px solid ${theme.borderStrong}`,
    borderRadius: theme.radiusSm,
    cursor: 'pointer', fontSize: '0.85rem', color: theme.primary, fontWeight: 800,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', paddingTop: 60 }}>

      {/* ── Top toolbar ──────────────────────────────────────────────────── */}
      <div style={{
        padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 8,
        flexWrap: 'nowrap', zIndex: 50, minHeight: 44,
        background: toolbarBg,
        borderBottom: `1.5px solid ${toolbarBorder}`,
        boxShadow: theme.kawaii ? 'none' : theme.shadow,
      }}>

        {/* File actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingRight: 8, borderRight: `1px solid ${toolbarBorder}` }}>
          {[
            { icon: theme.kawaii ? '💾' : '↓', label: 'Save', action: () => { try { localStorage.setItem('blossom-board-state', JSON.stringify(elements)); showToast('Saved!', '💾'); } catch {} } },
            { icon: theme.kawaii ? '🖨️' : '⎙', label: 'Print', action: () => window.print() },
          ].map(b => (
            <button key={b.label} title={b.label} onClick={b.action}
              style={{
                padding: '3px 8px', background: 'transparent', border: 'none', cursor: 'pointer',
                borderRadius: theme.radiusSm, transition: 'background 0.15s',
                fontFamily: 'Nunito, sans-serif', color: toolbarText,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = theme.primaryLight)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <span style={{ fontSize: '0.95rem' }}>{b.icon}</span>
              <span style={{ fontSize: '0.52rem', color: toolbarSubtle, fontWeight: 700 }}>{b.label}</span>
            </button>
          ))}
        </div>

        {/* Zoom controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingRight: 8, borderRight: `1px solid ${toolbarBorder}` }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: toolbarSubtle }}>Zoom</span>
          <button onClick={() => setViewport({ scale: Math.max(0.1, viewport.scale - 0.1) })} style={zoomBtnStyle}>−</button>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: toolbarText, minWidth: 40, textAlign: 'center' }}>{Math.round(viewport.scale * 100)}%</span>
          <button onClick={() => setViewport({ scale: Math.min(4, viewport.scale + 0.1) })} style={zoomBtnStyle}>+</button>
          <button onClick={() => setViewport({ x: 0, y: 0, scale: 1 })} style={zoomBtnStyle}>Fit</button>
        </div>

        {/* Share/Export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={handleShare} style={{
            padding: '4px 14px', background: btnActive, border: 'none',
            borderRadius: theme.radiusMd, cursor: 'pointer',
            fontSize: '0.78rem', fontWeight: theme.labelWeight, color: 'white',
            fontFamily: 'Nunito, sans-serif',
          }}>{theme.kawaii ? '📤 Share' : '↑ Share'}</button>
          <button onClick={handleExport} style={{
            padding: '4px 14px', background: theme.surface,
            border: `1px solid ${theme.borderStrong}`,
            borderRadius: theme.radiusMd, cursor: 'pointer',
            fontSize: '0.78rem', fontWeight: theme.labelWeight, color: theme.primary,
            fontFamily: 'Nunito, sans-serif',
          }}>{theme.kawaii ? '💾 Export PNG' : '↓ Export PNG'}</button>
        </div>

        {/* Shortcut hint */}
        <div style={{ marginLeft: 'auto', fontSize: '0.62rem', color: toolbarSubtle, fontWeight: 600, whiteSpace: 'nowrap' }}>
          {theme.kawaii ? 'P=Pen · E=Erase · Ctrl+Z=Undo · F=Fit · Del=Delete' : 'P Pen · E Erase · Ctrl+Z Undo · F Fit · Del Delete'}
        </div>
      </div>

      {/* ── Board layout ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Toolbar onAddSticky={addSticky} onExport={handleExport} onShare={handleShare} />
        <div className="board-canvas-area" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <Canvas onExport={() => {}} />
        </div>
        <ActivityFeed />
      </div>
    </div>
  );
}
