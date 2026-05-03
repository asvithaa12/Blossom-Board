import { useRef, useEffect, useCallback, useState } from 'react';
import { useBoardStore, BoardElement, Point } from '../../store/boardStore';
import StickyNote from './StickyNote';
import GhostCursors from './GhostCursors';

function uid() { return Math.random().toString(36).slice(2); }

interface DrawState {
  isDrawing: boolean;
  startX: number; startY: number;
  currentEl: BoardElement | null;
  penPoints: Point[];
}

interface Props {
  onExport: (canvas: HTMLCanvasElement) => void;
}

export default function Canvas({ onExport }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const {
    elements, tool, color, strokeWidth, viewport, selectedIds,
    addElement, updateElement, deleteSelected, selectIds, setViewport,
    pushHistory, bringForward, sendBackward, bringToFront, sendToBack,
    duplicateSelected,
  } = useBoardStore();

  const drawState = useRef<DrawState>({ isDrawing: false, startX: 0, startY: 0, currentEl: null, penPoints: [] });
  const panState = useRef<{ isPanning: boolean; lastX: number; lastY: number } | null>(null);
  const spaceDown = useRef(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // Resize observer
  useEffect(() => {
    if (!wrapRef.current) return;
    const obs = new ResizeObserver(entries => {
      const e = entries[0];
      setSize({ w: e.contentRect.width, h: e.contentRect.height });
    });
    obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  // Canvas draw
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = size.w || canvas.offsetWidth;
    canvas.height = size.h || canvas.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(viewport.x, viewport.y);
    ctx.scale(viewport.scale, viewport.scale);

    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    for (const el of sorted) {
      if (el.type === 'sticky') continue; // rendered as DOM

      ctx.save();
      ctx.strokeStyle = el.strokeColor;
      ctx.lineWidth = el.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.fillStyle = el.fillColor || 'transparent';

      if (el.type === 'stroke' && el.points && el.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(el.points[0].x, el.points[0].y);
        for (let i = 1; i < el.points.length - 1; i++) {
          const cx = (el.points[i].x + el.points[i + 1].x) / 2;
          const cy = (el.points[i].y + el.points[i + 1].y) / 2;
          ctx.quadraticCurveTo(el.points[i].x, el.points[i].y, cx, cy);
        }
        ctx.lineTo(el.points[el.points.length - 1].x, el.points[el.points.length - 1].y);
        ctx.stroke();
      } else if (el.type === 'rect') {
        ctx.beginPath();
        ctx.roundRect(el.x, el.y, el.w, el.h, 4);
        if (el.fillColor && el.fillColor !== 'transparent') ctx.fill();
        ctx.stroke();
      } else if (el.type === 'ellipse') {
        ctx.beginPath();
        ctx.ellipse(el.x + el.w / 2, el.y + el.h / 2, Math.abs(el.w) / 2, Math.abs(el.h) / 2, 0, 0, Math.PI * 2);
        if (el.fillColor && el.fillColor !== 'transparent') ctx.fill();
        ctx.stroke();
      } else if (el.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(el.x, el.y);
        ctx.lineTo(el.x + el.w, el.y + el.h);
        ctx.stroke();
      } else if (el.type === 'arrow') {
        const ex = el.x + el.w;
        const ey = el.y + el.h;
        const angle = Math.atan2(el.h, el.w);
        const headLen = Math.min(20, Math.sqrt(el.w ** 2 + el.h ** 2) / 3);
        ctx.beginPath();
        ctx.moveTo(el.x, el.y);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - headLen * Math.cos(angle - Math.PI / 6), ey - headLen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex - headLen * Math.cos(angle + Math.PI / 6), ey - headLen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      } else if (el.type === 'text' && el.content) {
        ctx.fillStyle = el.strokeColor;
        ctx.font = `${el.fontSize || 18}px Nunito, sans-serif`;
        ctx.fillText(el.content, el.x, el.y + (el.fontSize || 18));
      }

      // Selection handles
      if (selectedIds.includes(el.id) && el.type !== 'sticky') {
        ctx.strokeStyle = '#E91E8C';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        const pad = 6;
        let bx = el.x - pad, by = el.y - pad, bw = el.w + pad * 2, bh = el.h + pad * 2;
        if (el.type === 'stroke' && el.points) {
          const xs = el.points.map(p => p.x);
          const ys = el.points.map(p => p.y);
          bx = Math.min(...xs) - pad; by = Math.min(...ys) - pad;
          bw = Math.max(...xs) - Math.min(...xs) + pad * 2;
          bh = Math.max(...ys) - Math.min(...ys) + pad * 2;
        }
        if (el.type === 'line' || el.type === 'arrow') {
          const x1 = Math.min(el.x, el.x + el.w) - pad;
          const y1 = Math.min(el.y, el.y + el.h) - pad;
          bw = Math.abs(el.w) + pad * 2; bh = Math.abs(el.h) + pad * 2;
          bx = x1; by = y1;
        }
        ctx.strokeRect(bx, by, bw, bh);
        ctx.setLineDash([]);
        // Handles
        [[bx, by], [bx + bw / 2, by], [bx + bw, by],
          [bx, by + bh / 2], [bx + bw, by + bh / 2],
          [bx, by + bh], [bx + bw / 2, by + bh], [bx + bw, by + bh]].forEach(([hx, hy]) => {
            ctx.fillStyle = 'white';
            ctx.fillRect(hx - 5, hy - 5, 10, 10);
            ctx.strokeStyle = '#E91E8C';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(hx - 5, hy - 5, 10, 10);
          });
      }
      ctx.restore();
    }
  }, [elements, viewport, selectedIds, size]);

  useEffect(() => { draw(); }, [draw]);

  // Convert screen to world coords
  const toWorld = useCallback((sx: number, sy: number) => ({
    x: (sx - viewport.x) / viewport.scale,
    y: (sy - viewport.y) / viewport.scale,
  }), [viewport]);

  const getHitElement = useCallback((wx: number, wy: number): BoardElement | null => {
    const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);
    for (const el of sorted) {
      if (el.type === 'sticky') continue;
      const pad = 8;
      if (el.type === 'stroke' && el.points) {
        for (const p of el.points) {
          if (Math.abs(p.x - wx) < 12 && Math.abs(p.y - wy) < 12) return el;
        }
      } else if (el.type === 'line' || el.type === 'arrow') {
        const x1 = Math.min(el.x, el.x + el.w) - pad;
        const y1 = Math.min(el.y, el.y + el.h) - pad;
        const x2 = Math.max(el.x, el.x + el.w) + pad;
        const y2 = Math.max(el.y, el.y + el.h) + pad;
        if (wx >= x1 && wx <= x2 && wy >= y1 && wy <= y2) return el;
      } else {
        if (wx >= el.x - pad && wx <= el.x + el.w + pad && wy >= el.y - pad && wy <= el.y + el.h + pad) return el;
      }
    }
    return null;
  }, [elements]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 2) return;
    setContextMenu(null);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const { x: wx, y: wy } = toWorld(sx, sy);

    if (tool === 'pan' || spaceDown.current) {
      panState.current = { isPanning: true, lastX: e.clientX, lastY: e.clientY };
      return;
    }

    if (tool === 'eraser') {
      const hit = getHitElement(wx, wy);
      if (hit) { selectIds([hit.id]); deleteSelected(); }
      return;
    }

    if (tool === 'select') {
      const hit = getHitElement(wx, wy);
      if (hit) {
        selectIds([hit.id]);
        // Drag to move
        const startX = hit.x, startY = hit.y;
        const startMx = e.clientX, startMy = e.clientY;
        pushHistory();
        const onMove = (ev: MouseEvent) => {
          const dx = (ev.clientX - startMx) / viewport.scale;
          const dy = (ev.clientY - startMy) / viewport.scale;
          updateElement(hit.id, { x: startX + dx, y: startY + dy });
        };
        const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
      } else {
        selectIds([]);
      }
      return;
    }

    const ds = drawState.current;
    ds.isDrawing = true;
    ds.startX = wx; ds.startY = wy;
    ds.penPoints = [{ x: wx, y: wy }];

    if (tool === 'text') {
      const content = prompt('Enter text:') || '';
      if (content) {
        const el: BoardElement = {
          id: uid(), type: 'text', x: wx, y: wy, w: 200, h: 30,
          rotation: 0, zIndex: elements.length,
          strokeColor: color, fillColor: 'transparent',
          strokeWidth, content, fontSize: 18,
        };
        addElement(el);
      }
      ds.isDrawing = false;
      return;
    }

    if (tool === 'pen') {
      ds.currentEl = {
        id: uid(), type: 'stroke', x: wx, y: wy, w: 0, h: 0,
        rotation: 0, zIndex: elements.length,
        strokeColor: color, fillColor: 'transparent',
        strokeWidth, points: [{ x: wx, y: wy }],
      };
    } else {
      const typeMap: Record<string, BoardElement['type']> = { rect: 'rect', ellipse: 'ellipse', line: 'line', arrow: 'arrow' };
      if (typeMap[tool]) {
        ds.currentEl = {
          id: uid(), type: typeMap[tool] as BoardElement['type'], x: wx, y: wy, w: 0, h: 0,
          rotation: 0, zIndex: elements.length,
          strokeColor: color, fillColor: 'transparent', strokeWidth,
        };
      }
    }
  }, [tool, toWorld, viewport, elements, color, strokeWidth, addElement, updateElement, selectIds, deleteSelected, pushHistory, getHitElement]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (panState.current?.isPanning) {
      const dx = e.clientX - panState.current.lastX;
      const dy = e.clientY - panState.current.lastY;
      panState.current.lastX = e.clientX;
      panState.current.lastY = e.clientY;
      setViewport({ x: viewport.x + dx, y: viewport.y + dy });
      return;
    }

    const ds = drawState.current;
    if (!ds.isDrawing || !ds.currentEl) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const { x: wx, y: wy } = toWorld(sx, sy);

    if (tool === 'pen') {
      ds.penPoints.push({ x: wx, y: wy });
      ds.currentEl = { ...ds.currentEl, points: [...ds.penPoints] };
      // Live preview: add temp element
      const tmpEls = [...elements.filter(el => el.id !== '__tmp__'), { ...ds.currentEl, id: '__tmp__' }];
      // Draw directly on canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d')!;
        ctx.save();
        ctx.translate(viewport.x, viewport.y);
        ctx.scale(viewport.scale, viewport.scale);
        ctx.strokeStyle = ds.currentEl.strokeColor;
        ctx.lineWidth = ds.currentEl.strokeWidth;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        const pts = ds.penPoints;
        if (pts.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
          ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
          ctx.stroke();
        }
        ctx.restore();
      }
    } else {
      const dw = e.shiftKey
        ? Math.sign(wx - ds.startX) * Math.min(Math.abs(wx - ds.startX), Math.abs(wy - ds.startY))
        : wx - ds.startX;
      const dh = e.shiftKey
        ? Math.sign(wy - ds.startY) * Math.min(Math.abs(wx - ds.startX), Math.abs(wy - ds.startY))
        : wy - ds.startY;
      ds.currentEl = { ...ds.currentEl, w: dw, h: dh };
      draw();
      // Draw live preview
      const canvas = canvasRef.current;
      if (canvas && ds.currentEl) {
        const ctx = canvas.getContext('2d')!;
        ctx.save();
        ctx.translate(viewport.x, viewport.y);
        ctx.scale(viewport.scale, viewport.scale);
        ctx.strokeStyle = ds.currentEl.strokeColor;
        ctx.lineWidth = ds.currentEl.strokeWidth;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.setLineDash([4, 3]);
        const el = ds.currentEl;
        if (el.type === 'rect') { ctx.strokeRect(el.x, el.y, el.w, el.h); }
        else if (el.type === 'ellipse') { ctx.beginPath(); ctx.ellipse(el.x + el.w / 2, el.y + el.h / 2, Math.abs(el.w) / 2, Math.abs(el.h) / 2, 0, 0, Math.PI * 2); ctx.stroke(); }
        else if (el.type === 'line' || el.type === 'arrow') { ctx.beginPath(); ctx.moveTo(el.x, el.y); ctx.lineTo(el.x + el.w, el.y + el.h); ctx.stroke(); }
        ctx.setLineDash([]);
        ctx.restore();
      }
    }
  }, [tool, toWorld, viewport, elements, draw]);

  const onMouseUp = useCallback(() => {
    if (panState.current) { panState.current = null; return; }
    const ds = drawState.current;
    if (!ds.isDrawing) return;
    ds.isDrawing = false;
    if (ds.currentEl) {
      if (tool === 'pen') {
        if (ds.penPoints.length > 1) {
          addElement({ ...ds.currentEl, points: ds.penPoints });
        }
      } else {
        if (Math.abs(ds.currentEl.w) > 3 || Math.abs(ds.currentEl.h) > 3) {
          addElement(ds.currentEl);
        }
      }
      ds.currentEl = null;
    }
  }, [tool, addElement]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const delta = -e.deltaY / 500;
      const newScale = Math.max(0.1, Math.min(4, viewport.scale + delta));
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const wx = (px - viewport.x) / viewport.scale;
      const wy = (py - viewport.y) / viewport.scale;
      setViewport({ scale: newScale, x: px - wx * newScale, y: py - wy * newScale });
    } else {
      setViewport({ x: viewport.x - e.deltaX, y: viewport.y - e.deltaY });
    }
  }, [viewport, setViewport]);

  const onContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) { e.preventDefault(); spaceDown.current = true; }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') spaceDown.current = false;
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKeyUp); };
  }, []);

  const getCursor = () => {
    if (tool === 'pan' || spaceDown.current) return 'grab';
    if (tool === 'pen') return 'crosshair';
    if (tool === 'eraser') return 'cell';
    if (tool === 'select') return 'default';
    return 'crosshair';
  };

  return (
    <div
      ref={wrapRef}
      style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#FFF5F9', backgroundImage: 'radial-gradient(circle, #F48FB1 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
      onContextMenu={onContextMenu}
      onClick={() => setContextMenu(null)}
    >
      {/* Word-style ruler */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 22, background: 'linear-gradient(180deg, #FFE0EE 0%, #FFDDE9 100%)', borderBottom: '1px solid #F48FB1', zIndex: 5, display: 'flex', alignItems: 'center', paddingLeft: 8, fontSize: '0.6rem', fontWeight: 700, color: '#AD6590', userSelect: 'none', pointerEvents: 'none' }}>
        {Array.from({ length: 30 }, (_, i) => (
          <div key={i} style={{ width: `${(size.w || 800) / 30}px`, textAlign: 'center', borderLeft: '1px solid #F48FB1', height: '100%', display: 'flex', alignItems: 'flex-end', paddingBottom: 2, paddingLeft: 2, flexShrink: 0 }}>
            {i > 0 && i % 3 === 0 ? i : ''}
          </div>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 22, left: 0, width: '100%', height: 'calc(100% - 22px)', cursor: getCursor(), touchAction: 'none' }}
        width={size.w}
        height={(size.h || 600) - 22}
      />

      {/* Sticky notes layer */}
      <div style={{ position: 'absolute', top: 22, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none' }}>
          {elements.filter(e => e.type === 'sticky').map(el => (
            <div key={el.id} style={{ pointerEvents: 'all' }}>
              <StickyNote element={el} viewport={{ ...viewport, y: viewport.y + 22 }} isSelected={selectedIds.includes(el.id)} />
            </div>
          ))}
        </div>
      </div>

      {/* Ghost cursors */}
      <div style={{ position: 'absolute', top: 22, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
        <GhostCursors containerWidth={size.w} containerHeight={(size.h || 600) - 22} />
      </div>

      {/* Bottom bar */}
      <div style={{
        position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)',
        background: 'white', borderRadius: 50, border: '1.5px solid #FCE4EC',
        padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem',
        boxShadow: '0 4px 24px rgba(233,30,140,0.12)', zIndex: 20,
        fontFamily: 'Nunito, sans-serif',
      }}>
        <button onClick={() => setViewport({ scale: Math.max(0.1, viewport.scale - 0.1) })}
          style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #F48FB1', background: 'white', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E91E8C', fontWeight: 800 }}>−</button>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7B3F6E', minWidth: 40, textAlign: 'center' }}>
          {Math.round(viewport.scale * 100)}%
        </span>
        <button onClick={() => setViewport({ scale: Math.min(4, viewport.scale + 0.1) })}
          style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #F48FB1', background: 'white', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E91E8C', fontWeight: 800 }}>+</button>
        <div style={{ width: 1, height: 20, background: '#FCE4EC' }} />
        <button onClick={() => setViewport({ x: 0, y: 0, scale: 1 })}
          title="Fit to screen (F)"
          style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #F48FB1', background: 'white', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E91E8C' }}>⊡</button>
        <div style={{ width: 1, height: 20, background: '#FCE4EC' }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7B3F6E' }}>
          {elements.length} elements
        </span>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div className="context-menu" style={{ position: 'fixed', left: contextMenu.x, top: contextMenu.y }}
          onClick={e => e.stopPropagation()}>
          {selectedIds.length > 0 && (
            <>
              <div className="context-item" onClick={() => { duplicateSelected(); setContextMenu(null); }}>📋 Duplicate</div>
              <div className="context-item" onClick={() => { bringForward(); setContextMenu(null); }}>⬆️ Bring Forward</div>
              <div className="context-item" onClick={() => { sendBackward(); setContextMenu(null); }}>⬇️ Send Backward</div>
              <div className="context-item" onClick={() => { bringToFront(); setContextMenu(null); }}>⤴️ Bring to Front</div>
              <div className="context-item" onClick={() => { sendToBack(); setContextMenu(null); }}>⤵️ Send to Back</div>
              <div className="context-sep" />
              <div className="context-item danger" onClick={() => { deleteSelected(); setContextMenu(null); }}>🗑️ Delete</div>
            </>
          )}
          {selectedIds.length === 0 && (
            <div className="context-item" style={{ color: '#AD6590', cursor: 'default' }}>No selection</div>
          )}
        </div>
      )}
    </div>
  );
}
