import { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { useBoardStore, BoardElement, Point } from '../../store/boardStore';
import StickyNote from './StickyNote';
import GhostCursors from './GhostCursors';
import CursorGlitter from './CursorGlitter';

function uid() { return Math.random().toString(36).slice(2, 10); }

// ─── Everything the handlers need, kept in a single mutable ref ─────────────
interface State {
  elements: BoardElement[];
  tool: string;
  color: string;
  strokeWidth: number;
  viewport: { x: number; y: number; scale: number };
  selectedIds: string[];
  // store actions
  addElement: (el: BoardElement) => void;
  updateElement: (id: string, p: Partial<BoardElement>) => void;
  deleteSelected: () => void;
  selectIds: (ids: string[]) => void;
  setViewport: (v: Partial<{ x: number; y: number; scale: number }>) => void;
  pushHistory: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  duplicateSelected: () => void;
}

// ─── In-progress drawing state ───────────────────────────────────────────────
interface InProg {
  id: string;
  type: BoardElement['type'];
  x: number; y: number; w: number; h: number;
  strokeColor: string; strokeWidth: number;
  points?: Point[];
}

export default function Canvas(_: { onExport: (c: HTMLCanvasElement) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);

  // Mutable state ref — always current, never stale
  const S = useRef<State>({} as State);

  // Drawing-phase refs
  const inProg   = useRef<InProg | null>(null);
  const penPts   = useRef<Point[]>([]);
  const isDown   = useRef(false);
  const startW   = useRef({ x: 0, y: 0 });
  const panLast  = useRef<{ x: number; y: number } | null>(null);
  const spaceOn  = useRef(false);
  const redrawFn = useRef<() => void>(() => {});

  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);
  const [size, setSize]       = useState({ w: 800, h: 600 });

  // ── Mirror zustand state into S.current every render ──────────────────────
  const store = useBoardStore();
  S.current = {
    elements:         store.elements,
    tool:             store.tool,
    color:            store.color,
    strokeWidth:      store.strokeWidth,
    viewport:         store.viewport,
    selectedIds:      store.selectedIds,
    addElement:       store.addElement,
    updateElement:    store.updateElement,
    deleteSelected:   store.deleteSelected,
    selectIds:        store.selectIds,
    setViewport:      store.setViewport,
    pushHistory:      store.pushHistory,
    bringForward:     store.bringForward,
    sendBackward:     store.sendBackward,
    bringToFront:     store.bringToFront,
    sendToBack:       store.sendToBack,
    duplicateSelected:store.duplicateSelected,
  };

  // ── Canvas pixel size synced to CSS size via ResizeObserver ───────────────
  useLayoutEffect(() => {
    const canvas = canvasRef.current!;
    const wrap   = wrapRef.current!;
    const sync = () => {
      const w = wrap.offsetWidth, h = wrap.offsetHeight;
      canvas.width  = w;
      canvas.height = h;
      setSize({ w, h });
      redrawFn.current();
    };
    sync();
    const obs = new ResizeObserver(sync);
    obs.observe(wrap);
    return () => obs.disconnect();
  }, []);

  // ── Draw one element ───────────────────────────────────────────────────────
  const drawEl = (ctx: CanvasRenderingContext2D, el: InProg | BoardElement, dashed = false) => {
    ctx.save();
    ctx.strokeStyle = el.strokeColor;
    ctx.lineWidth   = el.strokeWidth;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    if (dashed) ctx.setLineDash([6, 4]);

    if (el.type === 'stroke' && el.points && el.points.length > 1) {
      ctx.beginPath();
      ctx.moveTo(el.points[0].x, el.points[0].y);
      for (let i = 1; i < el.points.length - 1; i++) {
        const mx = (el.points[i].x + el.points[i + 1].x) / 2;
        const my = (el.points[i].y + el.points[i + 1].y) / 2;
        ctx.quadraticCurveTo(el.points[i].x, el.points[i].y, mx, my);
      }
      ctx.lineTo(el.points[el.points.length - 1].x, el.points[el.points.length - 1].y);
      ctx.stroke();
    } else if (el.type === 'rect') {
      ctx.beginPath(); ctx.roundRect(el.x, el.y, el.w, el.h, 4); ctx.stroke();
    } else if (el.type === 'ellipse') {
      ctx.beginPath();
      ctx.ellipse(el.x + el.w / 2, el.y + el.h / 2, Math.abs(el.w / 2), Math.abs(el.h / 2), 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (el.type === 'line') {
      ctx.beginPath(); ctx.moveTo(el.x, el.y); ctx.lineTo(el.x + el.w, el.y + el.h); ctx.stroke();
    } else if (el.type === 'arrow') {
      const ex = el.x + el.w, ey = el.y + el.h;
      const ang = Math.atan2(el.h, el.w), hLen = Math.min(22, Math.hypot(el.w, el.h) * 0.3);
      ctx.beginPath(); ctx.moveTo(el.x, el.y); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ex, ey); ctx.lineTo(ex - hLen * Math.cos(ang - Math.PI/6), ey - hLen * Math.sin(ang - Math.PI/6));
      ctx.moveTo(ex, ey); ctx.lineTo(ex - hLen * Math.cos(ang + Math.PI/6), ey - hLen * Math.sin(ang + Math.PI/6));
      ctx.stroke();
    } else if (el.type === 'text') {
      const fs = (el as BoardElement).fontSize || 18;
      ctx.fillStyle = el.strokeColor;
      ctx.font = `700 ${fs}px Nunito, sans-serif`;
      ctx.fillText((el as BoardElement).content || '', el.x, el.y + fs);
    }
    ctx.restore();
  };

  // ── Master redraw ──────────────────────────────────────────────────────────
  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { elements, viewport, selectedIds } = S.current;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(viewport.x, viewport.y);
    ctx.scale(viewport.scale, viewport.scale);

    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    for (const el of sorted) {
      if (el.type === 'sticky') continue;
      drawEl(ctx, el);

      if (selectedIds.includes(el.id)) {
        ctx.save();
        ctx.strokeStyle = '#E91E8C';
        ctx.lineWidth   = 1.5 / viewport.scale;
        ctx.setLineDash([5, 4]);
        const pad = 8;
        let bx = el.x - pad, by = el.y - pad, bw = el.w + pad*2, bh = el.h + pad*2;
        if (el.type === 'stroke' && el.points?.length) {
          const xs = el.points.map(p => p.x), ys = el.points.map(p => p.y);
          bx = Math.min(...xs) - pad; by = Math.min(...ys) - pad;
          bw = Math.max(...xs) - Math.min(...xs) + pad*2; bh = Math.max(...ys) - Math.min(...ys) + pad*2;
        }
        if (el.type === 'line' || el.type === 'arrow') {
          bx = Math.min(el.x, el.x+el.w)-pad; by = Math.min(el.y, el.y+el.h)-pad;
          bw = Math.abs(el.w)+pad*2; bh = Math.abs(el.h)+pad*2;
        }
        ctx.strokeRect(bx, by, bw, bh);
        ctx.setLineDash([]);
        [[bx,by],[bx+bw/2,by],[bx+bw,by],[bx,by+bh/2],[bx+bw,by+bh/2],
          [bx,by+bh],[bx+bw/2,by+bh],[bx+bw,by+bh]].forEach(([hx,hy]) => {
          ctx.fillStyle = 'white'; ctx.fillRect(hx-5,hy-5,10,10);
          ctx.strokeStyle='#E91E8C'; ctx.lineWidth=1.5/viewport.scale; ctx.strokeRect(hx-5,hy-5,10,10);
        });
        ctx.restore();
      }
    }

    // Draw in-progress element
    if (inProg.current) {
      drawEl(ctx, inProg.current, inProg.current.type !== 'stroke');
    }
    ctx.restore();
  };

  // Keep redrawFn ref current
  useEffect(() => { redrawFn.current = redraw; });
  // Redraw on every store change
  useEffect(() => { redraw(); });

  // ── Coords ────────────────────────────────────────────────────────────────
  const clientToWorld = (e: { clientX: number; clientY: number }) => {
    const canvas = canvasRef.current!;
    const rect   = canvas.getBoundingClientRect();
    // Scale: canvas attr may differ from CSS size if browser zoomed, etc.
    const sx = (e.clientX - rect.left) * (canvas.width  / rect.width);
    const sy = (e.clientY - rect.top)  * (canvas.height / rect.height);
    const { viewport } = S.current;
    return {
      x: (sx - viewport.x) / viewport.scale,
      y: (sy - viewport.y) / viewport.scale,
    };
  };

  // ── Hit test ──────────────────────────────────────────────────────────────
  const hitEl = (wx: number, wy: number): BoardElement | null => {
    const { elements, viewport } = S.current;
    const pad = 10 / viewport.scale;
    const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);
    for (const el of sorted) {
      if (el.type === 'sticky') continue;
      if (el.type === 'stroke' && el.points) {
        if (el.points.some(p => Math.hypot(p.x - wx, p.y - wy) < 14 / viewport.scale)) return el;
      } else if (el.type === 'line' || el.type === 'arrow') {
        if (wx >= Math.min(el.x,el.x+el.w)-pad && wx <= Math.max(el.x,el.x+el.w)+pad &&
            wy >= Math.min(el.y,el.y+el.h)-pad && wy <= Math.max(el.y,el.y+el.h)+pad) return el;
      } else {
        if (wx >= el.x-pad && wx <= el.x+el.w+pad && wy >= el.y-pad && wy <= el.y+el.h+pad) return el;
      }
    }
    return null;
  };

  // ── Mouse handlers (defined once, always read from S.current) ─────────────
  useEffect(() => {
    const canvas = canvasRef.current!;

    const down = (e: MouseEvent) => {
      if (e.button === 2) return;
      setCtxMenu(null);

      const { tool, color, strokeWidth, viewport, elements,
              selectIds, deleteSelected, updateElement, addElement, pushHistory } = S.current;
      const { x: wx, y: wy } = clientToWorld(e);

      if (tool === 'pan' || spaceOn.current) {
        panLast.current = { x: e.clientX, y: e.clientY };
        return;
      }

      if (tool === 'eraser') {
        const hit = hitEl(wx, wy);
        if (hit) { selectIds([hit.id]); setTimeout(() => deleteSelected(), 0); }
        return;
      }

      if (tool === 'select') {
        const hit = hitEl(wx, wy);
        if (hit) {
          selectIds([hit.id]);
          const ox = hit.x, oy = hit.y, mx0 = e.clientX, my0 = e.clientY;
          pushHistory();
          const mv = (ev: MouseEvent) => {
            updateElement(hit.id, {
              x: ox + (ev.clientX - mx0) / viewport.scale,
              y: oy + (ev.clientY - my0) / viewport.scale,
            });
          };
          const up2 = () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up2); };
          window.addEventListener('mousemove', mv);
          window.addEventListener('mouseup', up2);
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

      isDown.current = true;
      startW.current = { x: wx, y: wy };

      if (tool === 'pen') {
        penPts.current = [{ x: wx, y: wy }];
        inProg.current = { id: uid(), type: 'stroke', x: wx, y: wy, w: 0, h: 0, strokeColor: color, strokeWidth, points: [{ x: wx, y: wy }] };
      } else {
        const map: Record<string, BoardElement['type']> = { rect: 'rect', ellipse: 'ellipse', line: 'line', arrow: 'arrow' };
        if (map[tool]) {
          inProg.current = { id: uid(), type: map[tool], x: wx, y: wy, w: 0, h: 0, strokeColor: color, strokeWidth };
        }
      }
      redrawFn.current();
    };

    const move = (e: MouseEvent) => {
      if (panLast.current) {
        const dx = e.clientX - panLast.current.x, dy = e.clientY - panLast.current.y;
        panLast.current = { x: e.clientX, y: e.clientY };
        S.current.setViewport({ x: S.current.viewport.x + dx, y: S.current.viewport.y + dy });
        return;
      }
      if (!isDown.current || !inProg.current) return;

      const { x: wx, y: wy } = clientToWorld(e);

      if (inProg.current.type === 'stroke') {
        penPts.current.push({ x: wx, y: wy });
        inProg.current = { ...inProg.current, points: [...penPts.current] };
      } else {
        const dw = e.shiftKey
          ? Math.sign(wx-startW.current.x)*Math.min(Math.abs(wx-startW.current.x), Math.abs(wy-startW.current.y))
          : wx - startW.current.x;
        const dh = e.shiftKey
          ? Math.sign(wy-startW.current.y)*Math.min(Math.abs(wx-startW.current.x), Math.abs(wy-startW.current.y))
          : wy - startW.current.y;
        inProg.current = { ...inProg.current, w: dw, h: dh };
      }
      redrawFn.current();
    };

    const up = () => {
      panLast.current = null;
      if (!isDown.current) return;
      isDown.current = false;

      const ip = inProg.current;
      inProg.current = null;

      if (ip) {
        const { addElement, elements } = S.current;
        if (ip.type === 'stroke') {
          if (penPts.current.length > 1) {
            addElement({ ...ip, fillColor: 'transparent', rotation: 0, zIndex: elements.length, points: [...penPts.current] } as BoardElement);
          }
        } else if (Math.abs(ip.w) > 3 || Math.abs(ip.h) > 3) {
          addElement({ ...ip, fillColor: 'transparent', rotation: 0, zIndex: elements.length } as BoardElement);
        }
        penPts.current = [];
      }
      redrawFn.current();
    };

    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect   = canvas.getBoundingClientRect();
      const sx = (e.clientX - rect.left) * (canvas.width  / rect.width);
      const sy = (e.clientY - rect.top)  * (canvas.height / rect.height);
      const { viewport, setViewport } = S.current;

      if (e.ctrlKey || e.metaKey) {
        const factor   = e.deltaY < 0 ? 1.08 : 0.93;
        const newScale = Math.max(0.08, Math.min(5, viewport.scale * factor));
        const wx = (sx - viewport.x) / viewport.scale;
        const wy = (sy - viewport.y) / viewport.scale;
        setViewport({ scale: newScale, x: sx - wx * newScale, y: sy - wy * newScale });
      } else {
        setViewport({ x: viewport.x - e.deltaX, y: viewport.y - e.deltaY });
      }
    };

    const ctx = (e: MouseEvent) => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY }); };
    const click = () => setCtxMenu(null);

    canvas.addEventListener('mousedown',   down);
    canvas.addEventListener('mousemove',   move);
    canvas.addEventListener('mouseup',     up);
    canvas.addEventListener('mouseleave',  up);
    canvas.addEventListener('wheel',       wheel, { passive: false });
    canvas.addEventListener('contextmenu', ctx);
    canvas.addEventListener('click',       click);

    return () => {
      canvas.removeEventListener('mousedown',   down);
      canvas.removeEventListener('mousemove',   move);
      canvas.removeEventListener('mouseup',     up);
      canvas.removeEventListener('mouseleave',  up);
      canvas.removeEventListener('wheel',       wheel);
      canvas.removeEventListener('contextmenu', ctx);
      canvas.removeEventListener('click',       click);
    };
  }, []); // ← runs ONCE; always reads fresh state from S.current

  // Space key
  useEffect(() => {
    const kd = (e: KeyboardEvent) => { if (e.code==='Space' && e.target===document.body) { e.preventDefault(); spaceOn.current=true; } };
    const ku = (e: KeyboardEvent) => { if (e.code==='Space') spaceOn.current=false; };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup',   ku);
    return () => { window.removeEventListener('keydown',kd); window.removeEventListener('keyup',ku); };
  }, []);

  const getCursor = () => {
    const t = store.tool;
    if (t === 'pan' || spaceOn.current) return 'grab';
    if (t === 'pen')    return 'crosshair';
    if (t === 'eraser') return 'cell';
    return 'default';
  };

  const { elements, viewport, selectedIds } = store;

  return (
    <div
      ref={wrapRef}
      style={{ position:'absolute', inset: 0,
        background:'#FFF5F9',
        backgroundImage:'radial-gradient(circle, #F8BBD9 1.5px, transparent 1.5px)',
        backgroundSize:'24px 24px' }}
    >
      {/* Decorative ruler — no pointer events */}
      <div style={{ position:'absolute',top:0,left:0,right:0,height:20,
        background:'linear-gradient(180deg,#FFE0EE,#FFDDE9)',
        borderBottom:'1px solid #F48FB155', zIndex:4,
        display:'flex', alignItems:'flex-end',
        pointerEvents:'none', userSelect:'none' }}>
        {Array.from({length:40},(_,i) => (
          <div key={i} style={{ flex:1, borderLeft:'1px solid #F48FB133',
            height: i%5===0 ? '55%':'22%',
            display:'flex', alignItems:'flex-end', paddingLeft:1 }}>
            {i%10===0 && i>0 && <span style={{fontSize:'0.4rem',color:'#AD6590',fontWeight:700}}>{i*10}</span>}
          </div>
        ))}
      </div>

      {/* Canvas — fills full container; all events via addEventListener */}
      <canvas
        ref={canvasRef}
        style={{ position:'absolute',top:0,left:0,width:'100%',height:'100%',
          cursor:getCursor(), display:'block', touchAction:'none' }}
      />

      {/* Sticky notes — same coordinate space as canvas (top:0) */}
      <div style={{ position:'absolute',top:0,left:0,right:0,bottom:0,
        pointerEvents:'none', zIndex:10 }}>
        {elements.filter(e => e.type==='sticky').map(el => (
          <div key={el.id} style={{ pointerEvents:'all' }}>
            <StickyNote element={el} viewport={viewport} isSelected={selectedIds.includes(el.id)} />
          </div>
        ))}
      </div>

      {/* Ghost cursors */}
      <div style={{ position:'absolute',top:0,left:0,right:0,bottom:0,pointerEvents:'none',zIndex:15 }}>
        <GhostCursors containerWidth={size.w} containerHeight={size.h} />
      </div>

      {/* Glitter */}
      <CursorGlitter containerRef={wrapRef as React.RefObject<HTMLElement>} />

      {/* Zoom HUD */}
      <div style={{ position:'absolute',bottom:'1rem',left:'50%',transform:'translateX(-50%)',
        background:'white', borderRadius:50, border:'1.5px solid #FCE4EC',
        padding:'0.4rem 0.9rem', display:'flex', alignItems:'center', gap:'0.7rem',
        boxShadow:'0 4px 24px rgba(233,30,140,0.12)', zIndex:20,
        fontFamily:'Nunito, sans-serif' }}>
        <button onClick={() => store.setViewport({ scale: Math.max(0.08, viewport.scale-0.1) })}
          style={{ width:26,height:26,borderRadius:'50%',border:'1.5px solid #F48FB1',background:'white',cursor:'pointer',color:'#E91E8C',fontWeight:900,fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center' }}>−</button>
        <span style={{ fontSize:'0.78rem',fontWeight:800,color:'#7B3F6E',minWidth:40,textAlign:'center' }}>
          {Math.round(viewport.scale*100)}%
        </span>
        <button onClick={() => store.setViewport({ scale: Math.min(5, viewport.scale+0.1) })}
          style={{ width:26,height:26,borderRadius:'50%',border:'1.5px solid #F48FB1',background:'white',cursor:'pointer',color:'#E91E8C',fontWeight:900,fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center' }}>+</button>
        <div style={{ width:1,height:16,background:'#FCE4EC' }} />
        <button onClick={() => store.setViewport({ x:0,y:0,scale:1 })} title="Fit [F]"
          style={{ width:26,height:26,borderRadius:'50%',border:'1.5px solid #F48FB1',background:'white',cursor:'pointer',color:'#E91E8C',fontSize:'0.8rem',display:'flex',alignItems:'center',justifyContent:'center' }}>⊡</button>
        <div style={{ width:1,height:16,background:'#FCE4EC' }} />
        <span style={{ fontSize:'0.7rem',fontWeight:700,color:'#AD6590' }}>{elements.length} obj</span>
      </div>

      {/* Context menu */}
      {ctxMenu && (
        <div className="context-menu"
          style={{ position:'fixed',left:ctxMenu.x,top:ctxMenu.y,zIndex:300 }}
          onClick={e => e.stopPropagation()}>
          {selectedIds.length > 0 ? (
            <>
              <div className="context-item" onClick={() => { store.duplicateSelected(); setCtxMenu(null); }}>📋 Duplicate</div>
              <div className="context-item" onClick={() => { store.bringForward();     setCtxMenu(null); }}>⬆️ Bring Forward</div>
              <div className="context-item" onClick={() => { store.sendBackward();     setCtxMenu(null); }}>⬇️ Send Backward</div>
              <div className="context-item" onClick={() => { store.bringToFront();     setCtxMenu(null); }}>⤴️ Bring to Front</div>
              <div className="context-item" onClick={() => { store.sendToBack();       setCtxMenu(null); }}>⤵️ Send to Back</div>
              <div className="context-sep" />
              <div className="context-item danger" onClick={() => { store.deleteSelected(); setCtxMenu(null); }}>🗑️ Delete</div>
            </>
          ) : (
            <div className="context-item" style={{ color:'#AD6590',cursor:'default',fontSize:'0.78rem' }}>Right-click a shape to edit</div>
          )}
        </div>
      )}
    </div>
  );
}
