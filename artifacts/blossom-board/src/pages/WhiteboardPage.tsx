import { useEffect, useCallback, useRef } from 'react';
import { useBoardStore } from '../store/boardStore';
import Toolbar from '../components/whiteboard/Toolbar';
import Canvas from '../components/whiteboard/Canvas';
import ActivityFeed from '../components/whiteboard/ActivityFeed';
import { showToast } from '../components/Toast';

interface Props { onNavigate: (page: string) => void; }

export default function WhiteboardPage({ onNavigate }: Props) {
  const { setTool, tool, undo, redo, copySelected, paste, duplicateSelected, deleteSelected, addElement, elements, viewport, setViewport, selectedIds } = useBoardStore();

  // Auto-save
  useEffect(() => {
    const timer = setInterval(() => {
      try {
        localStorage.setItem('blossom-board-state', JSON.stringify(elements));
        showToast('Board auto-saved', '💾');
      } catch {}
    }, 10000);
    return () => clearInterval(timer);
  }, [elements]);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('blossom-board-state');
      if (saved) {
        const els = JSON.parse(saved);
        if (Array.isArray(els) && els.length > 0) {
          // Restore
          els.forEach((el: any) => useBoardStore.getState().addElement(el));
          showToast('Board restored from last session', '🌸');
        }
      }
    } catch {}
  }, []);

  const addSticky = useCallback(() => {
    const colors = ['#FFDDE9', '#FFF9C4', '#C8F7C5', '#E8D5FF', '#FFE0CC', '#C5E8FF'];
    const col = colors[Math.floor(Math.random() * colors.length)];
    addElement({
      id: Math.random().toString(36).slice(2),
      type: 'sticky',
      x: (200 - viewport.x) / viewport.scale + Math.random() * 200,
      y: (200 - viewport.y) / viewport.scale + Math.random() * 100,
      w: 180, h: 140,
      rotation: 0,
      zIndex: elements.length + 50,
      strokeColor: '#3D1A2E',
      fillColor: col,
      strokeWidth: 1,
      stickyColor: col,
      content: '',
      emoji: '📌',
    });
    showToast('Sticky note added!', '📌');
  }, [addElement, elements.length, viewport]);

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
      showToast('Board exported as PNG!', '💾');
    } catch (err) {
      showToast('Export failed. Try again.', '❌', 'error');
    }
  }, []);

  const handleShare = useCallback(async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const boardEl = document.querySelector('.board-canvas-area') as HTMLElement;
      if (!boardEl) return;
      showToast('Taking screenshot...', '📸');
      const canvas = await html2canvas(boardEl, { backgroundColor: '#FFF5F9', scale: 1.5 });

      // Try Web Share API
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        if (navigator.share) {
          const file = new File([blob], 'blossom-board.png', { type: 'image/png' });
          try {
            await navigator.share({ title: 'My Blossom Board', text: 'Check out my Blossom Board! 🌸', files: [file] });
            showToast('Shared successfully!', '🌸');
            return;
          } catch {}
        }
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          showToast('Screenshot copied to clipboard! Paste to share 🌸', '📋');
        } catch {
          // Final fallback: download
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = 'blossom-board-share.png';
          a.click();
          URL.revokeObjectURL(url);
          showToast('Screenshot saved! Share with friends 🌸', '📤');
        }
      });
    } catch {
      showToast('Screenshot failed. Try again.', '❌', 'error');
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag)) return;

      const ctrl = e.ctrlKey || e.metaKey;

      // Tool shortcuts
      if (!ctrl) {
        const toolMap: Record<string, string> = { v: 'select', p: 'pen', b: 'pen', e: 'eraser', r: 'rect', o: 'ellipse', l: 'line', a: 'arrow', t: 'text', h: 'pan' };
        if (e.key.toLowerCase() === 's' && !ctrl) { e.preventDefault(); addSticky(); return; }
        if (e.key.toLowerCase() === 'f') { e.preventDefault(); setViewport({ x: 0, y: 0, scale: 1 }); showToast('Fit to screen', '⊡'); return; }
        if (toolMap[e.key.toLowerCase()]) { setTool(toolMap[e.key.toLowerCase()] as any); return; }
        if (e.key === 'Delete' || e.key === 'Backspace') { if (selectedIds.length) { deleteSelected(); showToast('Deleted', '🗑️'); } return; }
        if (e.key === 'Escape') { useBoardStore.getState().selectIds([]); return; }
      }

      if (ctrl) {
        if (e.key === 'z') { e.preventDefault(); undo(); showToast('Undo', '↩'); return; }
        if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); redo(); showToast('Redo', '↪'); return; }
        if (e.key === 'c') { e.preventDefault(); copySelected(); showToast('Copied', '📋'); return; }
        if (e.key === 'v') { e.preventDefault(); paste(); showToast('Pasted', '📋'); return; }
        if (e.key === 'd') { e.preventDefault(); duplicateSelected(); showToast('Duplicated', '📋'); return; }
        if (e.key === 'a') { e.preventDefault(); useBoardStore.getState().selectIds(elements.map(e => e.id)); return; }
        if (e.key === '0') { e.preventDefault(); setViewport({ scale: 1 }); return; }
        if (e.key === '=' || e.key === '+') { e.preventDefault(); setViewport({ scale: Math.min(4, viewport.scale + 0.1) }); return; }
        if (e.key === '-') { e.preventDefault(); setViewport({ scale: Math.max(0.1, viewport.scale - 0.1) }); return; }
        if (e.key === 'E' && e.shiftKey) { e.preventDefault(); handleExport(); return; }
        if (e.key === ']') { e.preventDefault(); useBoardStore.getState().bringForward(); return; }
        if (e.key === '[') { e.preventDefault(); useBoardStore.getState().sendBackward(); return; }
      }

      // Arrow key nudge
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedIds.length) {
        e.preventDefault();
        const amt = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -amt : e.key === 'ArrowRight' ? amt : 0;
        const dy = e.key === 'ArrowUp' ? -amt : e.key === 'ArrowDown' ? amt : 0;
        selectedIds.forEach(id => {
          const el = elements.find(el => el.id === id);
          if (el) useBoardStore.getState().updateElement(id, { x: el.x + dx, y: el.y + dy });
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setTool, undo, redo, copySelected, paste, duplicateSelected, deleteSelected, addSticky, elements, viewport, selectedIds, setViewport, handleExport]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', paddingTop: 60 }}>
      {/* Word-style top toolbar */}
      <div className="word-toolbar" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', zIndex: 50 }}>
        {/* File group */}
        <div className="word-toolbar-group">
          {[
            { icon: '💾', label: 'Save', action: () => { try { localStorage.setItem('blossom-board-state', JSON.stringify(elements)); showToast('Saved!', '💾'); } catch {} } },
            { icon: '📁', label: 'Open', action: () => showToast('Auto-loads from last session', '📁') },
            { icon: '🖨️', label: 'Print', action: () => window.print() },
          ].map(b => (
            <button key={b.label} title={b.label} onClick={b.action} style={{ padding: '3px 7px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.85rem', borderRadius: 4, transition: 'background 0.15s', fontFamily: 'Nunito, sans-serif', fontWeight: 700, color: '#3D1A2E', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FFC8DE')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <span style={{ fontSize: '1rem' }}>{b.icon}</span>
              <span style={{ fontSize: '0.55rem', color: '#7B3F6E' }}>{b.label}</span>
            </button>
          ))}
        </div>

        {/* View group */}
        <div className="word-toolbar-group">
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#AD6590', marginRight: 4 }}>Zoom:</span>
          <button onClick={() => setViewport({ scale: Math.max(0.1, viewport.scale - 0.1) })} style={{ padding: '2px 6px', background: 'white', border: '1px solid #F48FB1', borderRadius: 4, cursor: 'pointer', fontSize: '0.85rem', color: '#E91E8C', fontWeight: 800 }}>−</button>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#3D1A2E', minWidth: 42, textAlign: 'center' }}>{Math.round(viewport.scale * 100)}%</span>
          <button onClick={() => setViewport({ scale: Math.min(4, viewport.scale + 0.1) })} style={{ padding: '2px 6px', background: 'white', border: '1px solid #F48FB1', borderRadius: 4, cursor: 'pointer', fontSize: '0.85rem', color: '#E91E8C', fontWeight: 800 }}>+</button>
        </div>

        {/* Share/Export group */}
        <div className="word-toolbar-group">
          <button onClick={handleShare} style={{ padding: '3px 10px', background: '#E91E8C', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 800, color: 'white', fontFamily: 'Nunito, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
            📤 Share
          </button>
          <button onClick={handleExport} style={{ padding: '3px 10px', background: 'white', border: '1px solid #F48FB1', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 800, color: '#E91E8C', fontFamily: 'Nunito, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
            💾 Export
          </button>
        </div>

        {/* Shortcuts reminder */}
        <div style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#AD6590', fontWeight: 700 }}>
          V=Select · P=Pen · R=Rect · O=Ellipse · L=Line · S=Sticky · Ctrl+Z=Undo · F=Fit
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
