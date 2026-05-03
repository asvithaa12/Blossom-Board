import { useEffect, useCallback, useRef } from 'react';
import { useBoardStore } from '../store/boardStore';
import Toolbar from '../components/whiteboard/Toolbar';
import Canvas from '../components/whiteboard/Canvas';
import ActivityFeed from '../components/whiteboard/ActivityFeed';
import { showToast } from '../components/Toast';

interface Props { onNavigate: (page: string) => void; }

export default function WhiteboardPage({ onNavigate }: Props) {
  const { setTool, tool, undo, redo, copySelected, paste, duplicateSelected, deleteSelected, addElement, elements, viewport, setViewport, selectedIds } = useBoardStore();
  const elementsRef = useRef(elements);
  elementsRef.current = elements;

  // Load from localStorage once on mount — use setState directly to avoid duplicate keys
  useEffect(() => {
    try {
      const saved = localStorage.getItem('blossom-board-state');
      if (saved) {
        const els = JSON.parse(saved);
        if (Array.isArray(els) && els.length > 0) {
          // Deduplicate by id before restoring
          const seen = new Set<string>();
          const unique = els.filter((el: any) => {
            if (seen.has(el.id)) return false;
            seen.add(el.id);
            return true;
          });
          useBoardStore.setState({ elements: unique, history: [unique], historyIndex: 0 });
          showToast('Board restored from last session 🌸', '🌸');
        }
      }
    } catch {}
  }, []);

  // Auto-save ONLY when leaving the board page (cleanup)
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
      w: 180, h: 140,
      rotation: 0,
      zIndex: state.elements.length + 50,
      strokeColor: '#3D1A2E',
      fillColor: col,
      strokeWidth: 1,
      stickyColor: col,
      content: '',
      emoji: '📌',
    });
    showToast('Sticky note added!', '📌');
  }, [addElement]);

  const handleExport = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const boardEl = document.querySelector('.board-canvas-area') as HTMLElement;
      if (!boardEl) return;
      showToast('Capturing board...', '📸');
      const canvas = await html2canvas(boardEl, { backgroundColor: '#FFF5F9', scale: 1.5 });
      const link = document.createElement('a');
      link.download = 'blossom-board.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('Exported as PNG!', '💾');
    } catch {
      showToast('Export failed', '❌', 'error');
    }
  }, []);

  const handleShare = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const boardEl = document.querySelector('.board-canvas-area') as HTMLElement;
      if (!boardEl) return;
      showToast('Taking screenshot...', '📸');
      const canvas = await html2canvas(boardEl, { backgroundColor: '#FFF5F9', scale: 1.5 });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        if (navigator.share) {
          try {
            await navigator.share({ title: 'My Blossom Board 🌸', text: 'Check out my board!', files: [new File([blob], 'blossom-board.png', { type: 'image/png' })] });
            showToast('Shared!', '🌸');
            return;
          } catch {}
        }
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          showToast('Copied to clipboard — paste to share! 🌸', '📋');
        } catch {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = 'blossom-board-share.png'; a.click();
          URL.revokeObjectURL(url);
          showToast('Screenshot saved!', '📤');
        }
      });
    } catch {
      showToast('Share failed', '❌', 'error');
    }
  }, []);

  // Keyboard shortcuts
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', paddingTop: 60 }}>
      {/* Word-style top toolbar */}
      <div className="word-toolbar" style={{ padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'nowrap', zIndex: 50, minHeight: 44 }}>
        <div className="word-toolbar-group">
          {[
            { icon: '💾', label: 'Save', action: () => { try { localStorage.setItem('blossom-board-state', JSON.stringify(elements)); showToast('Saved!', '💾'); } catch {} } },
            { icon: '🖨️', label: 'Print', action: () => window.print() },
          ].map(b => (
            <button key={b.label} title={b.label} onClick={b.action}
              style={{ padding: '3px 7px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 5, transition: 'background 0.15s', fontFamily: 'Nunito, sans-serif', color: '#3D1A2E', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FFC8DE')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <span style={{ fontSize: '0.95rem' }}>{b.icon}</span>
              <span style={{ fontSize: '0.52rem', color: '#7B3F6E', fontWeight: 700 }}>{b.label}</span>
            </button>
          ))}
        </div>

        <div className="word-toolbar-group">
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#AD6590' }}>Zoom:</span>
          <button onClick={() => setViewport({ scale: Math.max(0.1, viewport.scale - 0.1) })} style={{ padding: '2px 6px', background: 'white', border: '1px solid #F48FB1', borderRadius: 4, cursor: 'pointer', fontSize: '0.85rem', color: '#E91E8C', fontWeight: 800 }}>−</button>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#3D1A2E', minWidth: 40, textAlign: 'center' }}>{Math.round(viewport.scale * 100)}%</span>
          <button onClick={() => setViewport({ scale: Math.min(4, viewport.scale + 0.1) })} style={{ padding: '2px 6px', background: 'white', border: '1px solid #F48FB1', borderRadius: 4, cursor: 'pointer', fontSize: '0.85rem', color: '#E91E8C', fontWeight: 800 }}>+</button>
          <button onClick={() => setViewport({ x: 0, y: 0, scale: 1 })} title="Fit (F)" style={{ padding: '2px 8px', background: 'white', border: '1px solid #F48FB1', borderRadius: 4, cursor: 'pointer', fontSize: '0.72rem', color: '#E91E8C', fontWeight: 800 }}>Fit</button>
        </div>

        <div className="word-toolbar-group">
          <button onClick={handleShare} style={{ padding: '4px 12px', background: '#E91E8C', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 800, color: 'white', fontFamily: 'Nunito, sans-serif' }}>📤 Share</button>
          <button onClick={handleExport} style={{ padding: '4px 12px', background: 'white', border: '1px solid #F48FB1', borderRadius: 7, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 800, color: '#E91E8C', fontFamily: 'Nunito, sans-serif' }}>💾 Export PNG</button>
        </div>

        <div style={{ marginLeft: 'auto', fontSize: '0.65rem', color: '#AD6590', fontWeight: 700, whiteSpace: 'nowrap' }}>
          V·P·R·O·L·A·S·H=Tools · Ctrl+Z=Undo · F=Fit · Del=Delete
        </div>
      </div>

      {/* Board layout */}
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
