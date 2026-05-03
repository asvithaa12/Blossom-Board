import { useRef, useEffect, useCallback, useState } from 'react';
import { useBoardStore, BoardElement, Point } from '../../store/boardStore';
import StickyNote from './StickyNote';
import GhostCursors from './GhostCursors';
import CursorGlitter from './CursorGlitter';

function uid() { return Math.random().toString(36).slice(2); }

interface InProgressStroke {
  id: string;
  type: BoardElement['type'];
  x: number; y: number; w: number; h: number;
  strokeColor: string; strokeWidth: number;
  points?: Point[];
}

export default function Canvas(_props: { onExport: (canvas: HTMLCanvasElement) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inProgress = useRef<InProgressStroke | null>(null);
  const isPenDrawing = useRef(false);
  const penPoints = useRef<Point[]>([]);
  const isMouseDown = useRef(false);
  const startWorld = useRef({ x: 0, y: 0 });
  const panLast = useRef<{ x: number; y: number } | null>(null);
  const spaceDown = useRef(false);

  const {
    elements, tool, color, strokeWidth, viewport, selectedIds,
    addElement, updateElement, deleteSelected, selectIds, setViewport,
    pushHistory, bringForward, sendBackward, bringToFront, sendToBack,
    duplicateSelected,
  } = useBoardStore();

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });

  // Resize observer on wrapper
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      const r = entries[0].contentRect;
      setSize({ w: r.width, h: r.height });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ─── DRAW ───────────────────────────────────────────────────────────────────
  const drawElement = useCallback((ctx: CanvasRenderingContext2D, el: BoardElement | InProgressStroke, alpha = 1) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = el.strokeColor;
    ctx.lineWidth = el.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

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
      ctx.fillStyle = 'transparent';
      ctx.beginPath();
      ctx.roundRect(el.x, el.y, el.w, el.h, 4);
      ctx.stroke();
    } else if (el.type === 'ellipse') {
      ctx.fillStyle = 'transparent';
      ctx.beginPath();
      ctx.ellipse(el.x + el.w / 2, el.y + el.h / 2, Math.abs(el.w / 2), Math.abs(el.h / 2), 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (el.type === 'line') {
      ctx.beginPath();
      ctx.moveTo(el.x, el.y);
      ctx.lineTo(el.x + el.w, el.y + el.h);
      ctx.stroke();
    } else if (el.type === 'arrow') {
      const ex = el.x + el.w, ey = el.y + el.h;
      const angle = Math.atan2(el.h, el.w);
      const headLen = Math.min(20, Math.sqrt(el.w ** 2 + el.h ** 2) * 0.3);
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
    } else if (el.type === 'text' && (el as BoardElement).content) {
      ctx.fillStyle = el.strokeColor;
      const fontSize = (el as BoardElement).fontSize || 18;
      ctx.font = `${fontSize}px Nunito, sans-serif`;
      ctx.fillText((el as BoardElement).content!, el.x, el.y + fontSize);
    }
    ctx.restore();
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // Always sync canvas pixel size to its CSS size
    const cssW = canvas.offsetWidth || size.w;
    const cssH = canvas.offsetHeight || size.h;
    if (canvas.width !== cssW || canvas.height !== cssH) {
      canvas.width = cssW;
      canvas.height = cssH;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(viewport.x, viewport.y);
    ctx.scale(viewport.scale, viewport.scale);

    // Committed elements
    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    for (const el of sorted) {
      if (el.type === 'sticky') continue;
      drawElement(ctx, el);

      // Selection outline
      if (selectedIds.includes(el.id)) {
        ctx.save();
        ctx.strokeStyle = '#E91E8C';
        ctx.lineWidth = 1.5 / viewport.scale;
        ctx.setLineDash([5, 4]);
        const pad = 8;
        let bx = el.x - pad, by = el.y - pad, bw = el.w + pad * 2, bh = el.h + pad * 2;
        if (el.type === 'stroke' && el.points) {
          const xs = el.points.map(p => p.x), ys = el.points.map(p => p.y);
          bx = Math.min(...xs) - pad; by = Math.min(...ys) - pad;
          bw = Math.max(...xs) - bx - pad; bh = Math.max(...ys) - by - pad;
        }
        if (el.type === 'line' || el.type === 'arrow') {
          bx = Math.min(el.x, el.x + el.w) - pad;
          by = Math.min(el.y, el.y + el.h) - pad;
          bw = Math.abs(el.w) + pad * 2; bh = Math.abs(el.h) + pad * 2;
        }
        ctx.strokeRect(bx, by, bw, bh);
        ctx.setLineDash([]);
        [[bx, by], [bx + bw / 2, by], [bx + bw, by],
          [bx, by + bh / 2], [bx + bw, by + bh / 2],
          [bx, by + bh], [bx + bw / 2, by + bh], [bx + bw, by + bh]].forEach(([hx, hy]) => {
            ctx.fillStyle = 'white';
            ctx.fillRect(hx - 5, hy - 5, 10, 10);
            ctx.strokeStyle = '#E91E8C';
            ctx.lineWidth = 1.5 / viewport.scale;
            ctx.strokeRect(hx - 5, hy - 5, 10, 10);
          });
        ctx.restore();
      }
    }

    // In-progress element
    if (inProgress.current) {
      ctx.setLineDash(tool === 'pen' ? [] : [5, 4]);
      drawElement(ctx, inProgress.current, 0.7);
      ctx.setLineDash([]);
    }

    ctx.restore();
  }, [elements, viewport, selectedIds, drawElement, tool, size]);

  useEffect(() => { redraw(); }, [redraw]);

  // ─── COORDINATE HELPERS ────────────────────────────────────────────────────
  const toWorld = useCallback((sx: number, sy: number) => ({
    x: (sx - viewport.x) / viewport.scale,
    y: (sy - viewport.y) / viewport.scale,
  }), [viewport]);

  const clientToCanvas = useCallback((e: MouseEvent | React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { sx: e.clientX - rect.left, sy: e.clientY - rect.top };
  }, []);

  const getHit = useCallback((wx: number, wy: number): BoardElement | null => {
    const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);
    for (const el of sorted) {
      if (el.type === 'sticky') continue;
      const pad = 10;
      if (el.type === 'stroke' && el.points) {
        if (el.points.some(p => Math.hypot(p.x - wx, p.y - wy) < 12)) return el;
      } else if (el.type === 'line' || el.type === 'arrow') {
        const x1 = Math.min(el.x, el.x + el.w) - pad, y1 = Math.min(el.y, el.y + el.h) - pad;
        const x2 = Math.max(el.x, el.x + el.w) + pad, y2 = Math.max(el.y, el.y + el.h) + pad;
        if (wx >= x1 && wx <= x2 && wy >= y1 && wy <= y2) return el;
      } else if (el.type !== 'text') {
        if (wx >= el.x - pad && wx <= el.x + el.w + pad && wy >= el.y - pad && wy <= el.y + el.h + pad) return el;
      } else {
        if (wx >= el.x && wx <= el.x + 200 && wy >= el.y && wy <= el.y + 30) return el;
      }
    }
    return null;
  }, [elements]);

  // ─── MOUSE EVENTS (on canvas element directly) ────────────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 2) return;
    setContextMenu(null);
    const { sx, sy } = clientToCanvas(e);
    const { x: wx, y: wy } = toWorld(sx, sy);

    if (tool === 'pan' || spaceDown.current) {
      panLast.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (tool === 'eraser') {
      const hit = getHit(wx, wy);
      if (hit) { selectIds([hit.id]); setTimeout(() => deleteSelected(), 0); }
      return;
    }

    if (tool === 'select') {
      const hit = getHit(wx, wy);
      if (hit) {
        selectIds([hit.id]);
        const ox = hit.x, oy = hit.y, mx0 = e.clientX, my0 = e.clientY;
        pushHistory();
        const onMove = (ev: MouseEvent) => {
          updateElement(hit.id, {
            x: ox + (ev.clientX - mx0) / viewport.scale,
            y: oy + (ev.clientY - my0) / viewport.scale,
          });
        };
        const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
      } else {
        selectIds([]);
      }
      return;
    }

    if (tool === 'text') {
      const content = prompt('Enter text:') || '';
      if (content) {
        addElement({ id: uid(), type: 'text', x: wx, y: wy, w: 200, h: 30, rotation: 0, zIndex: elements.length, strokeColor: color, fillColor: 'transparent', strokeWidth, content, fontSize: 18 });
      }
      return;
    }

    isMouseDown.current = true;
    startWorld.current = { x: wx, y: wy };

    if (tool === 'pen') {
      isPenDrawing.current = true;
      penPoints.current = [{ x: wx, y: wy }];
      inProgress.current = { id: uid(), type: 'stroke', x: wx, y: wy, w: 0, h: 0, strokeColor: color, strokeWidth, points: [{ x: wx, y: wy }] };
    } else {
      const typeMap: Record<string, BoardElement['type']> = { rect: 'rect', ellipse: 'ellipse', line: 'line', arrow: 'arrow' };
      if (typeMap[tool]) {
        inProgress.current = { id: uid(), type: typeMap[tool], x: wx, y: wy, w: 0, h: 0, strokeColor: color, strokeWidth };
      }
    }
  }, [tool, toWorld, clientToCanvas, viewport, elements, color, strokeWidth, addElement, updateElement, selectIds, deleteSelected, pushHistory, getHit]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (panLast.current) {
      const dx = e.clientX - panLast.current.x;
      const dy = e.clientY - panLast.current.y;
      panLast.current = { x: e.clientX, y: e.clientY };
      setViewport({ x: viewport.x + dx, y: viewport.y + dy });
      return;
    }
    if (!isMouseDown.current || !inProgress.current) return;

    const { sx, sy } = clientToCanvas(e);
    const { x: wx, y: wy } = toWorld(sx, sy);

    if (tool === 'pen') {
      penPoints.current.push({ x: wx, y: wy });
      inProgress.current = { ...inProgress.current, points: [...penPoints.current] };
    } else {
      const dw = e.shiftKey
        ? Math.sign(wx - startWorld.current.x) * Math.min(Math.abs(wx - startWorld.current.x), Math.abs(wy - startWorld.current.y))
        : wx - startWorld.current.x;
      const dh = e.shiftKey
        ? Math.sign(wy - startWorld.current.y) * Math.min(Math.abs(wx - startWorld.current.x), Math.abs(wy - startWorld.current.y))
        : wy - startWorld.current.y;
      inProgress.current = { ...inProgress.current, w: dw, h: dh };
    }
    redraw();
  }, [tool, toWorld, clientToCanvas, viewport, setViewport, redraw]);

  const handleMouseUp = useCallback(() => {
    panLast.current = null;
    if (!isMouseDown.current) return;
    isMouseDown.current = false;
    isPenDrawing.current = false;

    const ip = inProgress.current;
    inProgress.current = null;

    if (!ip) return;

    if (ip.type === 'stroke') {
      if (penPoints.current.length > 1) {
        addElement({ ...ip, points: [...penPoints.current], w: 0, h: 0, fillColor: 'transparent', rotation: 0, zIndex: elements.length } as BoardElement);
      }
    } else {
      if (Math.abs(ip.w) > 3 || Math.abs(ip.h) > 3) {
        addElement({ ...ip, fillColor: 'transparent', rotation: 0, zIndex: elements.length } as BoardElement);
      }
    }
    penPoints.current = [];
    redraw();
  }, [addElement, elements.length, redraw]);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const { sx, sy } = clientToCanvas(e as any);
    if (e.ctrlKey || e.metaKey) {
      const factor = e.deltaY < 0 ? 1.08 : 0.93;
      const newScale = Math.max(0.1, Math.min(4, viewport.scale * factor));
      const wx = (sx - viewport.x) / viewport.scale;
      const wy = (sy - viewport.y) / viewport.scale;
      setViewport({ scale: newScale, x: sx - wx * newScale, y: sy - wy * newScale });
    } else {
      setViewport({ x: viewport.x - e.deltaX, y: viewport.y - e.deltaY });
    }
  }, [clientToCanvas, viewport, setViewport]);

  // Space key for pan
  useEffect(() => {
    const dn = (e: KeyboardEvent) => { if (e.code === 'Space' && e.target === document.body) { e.preventDefault(); spaceDown.current = true; } };
    const up = (e: KeyboardEvent) => { if (e.code === 'Space') spaceDown.current = false; };
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up); };
  }, []);

  const getCursor = () => {
    if (tool === 'pan' || spaceDown.current) return 'grab';
    if (tool === 'pen') return 'crosshair';
    if (tool === 'eraser') return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ccircle cx='10' cy='10' r='8' fill='none' stroke='%23E91E8C' stroke-width='2'/%3E%3C/svg%3E") 10 10, cell`;
    return 'default';
  };

  return (
    <div ref={wrapRef} style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#FFF5F9', backgroundImage: 'radial-gradient(circle, #F48FB1 1.2px, transparent 1.2px)', backgroundSize: '24px 24px' }}>

      {/* Ruler — decorative, no pointer events */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 20, background: 'linear-gradient(180deg,#FFE0EE,#FFDDE9)', borderBottom: '1px solid #F48FB1', zIndex: 3, display: 'flex', alignItems: 'flex-end', paddingBottom: 2, pointerEvents: 'none', userSelect: 'none' }}>
        {Array.from({ length: 40 }, (_, i) => (
          <div key={i} style={{ flex: 1, borderLeft: '1px solid #F48FB144', height: i % 5 === 0 ? '60%' : '30%', display: 'flex', alignItems: 'flex-end', paddingLeft: 1 }}>
            {i % 5 === 0 && i > 0 && <span style={{ fontSize: '0.45rem', color: '#AD6590', fontWeight: 700 }}>{i * 10}</span>}
          </div>
        ))}
      </div>

      {/* Canvas — fills entire container, receives all mouse events */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: getCursor(), display: 'block' }}
        width={size.w}
        height={size.h}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={e => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY }); }}
        onClick={() => setContextMenu(null)}
      />

      {/* Sticky notes layer */}
      <div style={{ position: 'absolute', top: 20, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 10 }}>
        {elements.filter(e => e.type === 'sticky').map(el => (
          <div key={el.id} style={{ pointerEvents: 'all' }}>
            <StickyNote element={el} viewport={viewport} isSelected={selectedIds.includes(el.id)} />
          </div>
        ))}
      </div>

      {/* Ghost cursors layer */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 15 }}>
        <GhostCursors containerWidth={size.w} containerHeight={size.h} />
      </div>

      {/* Glitter layer */}
      <CursorGlitter containerRef={wrapRef} />

      {/* Bottom zoom bar */}
      <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', background: 'white', borderRadius: 50, border: '1.5px solid #FCE4EC', padding: '0.4rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.8rem', boxShadow: '0 4px 24px rgba(233,30,140,0.12)', zIndex: 20, fontFamily: 'Nunito, sans-serif' }}>
        <button onClick={() => setViewport({ scale: Math.max(0.1, viewport.scale - 0.1) })} style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #F48FB1', background: 'white', cursor: 'pointer', color: '#E91E8C', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7B3F6E', minWidth: 40, textAlign: 'center' }}>{Math.round(viewport.scale * 100)}%</span>
        <button onClick={() => setViewport({ scale: Math.min(4, viewport.scale + 0.1) })} style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #F48FB1', background: 'white', cursor: 'pointer', color: '#E91E8C', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
        <div style={{ width: 1, height: 18, background: '#FCE4EC' }} />
        <button onClick={() => setViewport({ x: 0, y: 0, scale: 1 })} title="Fit (F)" style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #F48FB1', background: 'white', cursor: 'pointer', color: '#E91E8C', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⊡</button>
        <div style={{ width: 1, height: 18, background: '#FCE4EC' }} />
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#AD6590' }}>{elements.length} obj</span>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div className="context-menu" style={{ position: 'fixed', left: contextMenu.x, top: contextMenu.y }} onClick={e => e.stopPropagation()}>
          {selectedIds.length > 0 ? (
            <>
              <div className="context-item" onClick={() => { duplicateSelected(); setContextMenu(null); }}>📋 Duplicate</div>
              <div className="context-item" onClick={() => { bringForward(); setContextMenu(null); }}>⬆️ Bring Forward</div>
              <div className="context-item" onClick={() => { sendBackward(); setContextMenu(null); }}>⬇️ Send Backward</div>
              <div className="context-item" onClick={() => { bringToFront(); setContextMenu(null); }}>⤴️ Bring to Front</div>
              <div className="context-item" onClick={() => { sendToBack(); setContextMenu(null); }}>⤵️ Send to Back</div>
              <div className="context-sep" />
              <div className="context-item danger" onClick={() => { deleteSelected(); setContextMenu(null); }}>🗑️ Delete</div>
            </>
          ) : (
            <div className="context-item" style={{ color: '#AD6590', cursor: 'default' }}>Right-click an object to edit</div>
          )}
        </div>
      )}
    </div>
  );
}
