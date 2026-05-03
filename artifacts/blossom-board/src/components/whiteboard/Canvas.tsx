import { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { useBoardStore, BoardElement, Point } from '../../store/boardStore';
import { useTheme } from '../../context/ThemeContext';
import StickyNote from './StickyNote';
import GhostCursors from './GhostCursors';
import CursorGlitter from './CursorGlitter';

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

interface InProg {
  id: string; type: BoardElement['type'];
  x: number; y: number; w: number; h: number;
  strokeColor: string; strokeWidth: number;
  points?: Point[];
}

// ── Variable-width pressure stroke ───────────────────────────────────────────
function drawPressureStroke(ctx: CanvasRenderingContext2D, points: Point[], color: string, baseWidth: number) {
  if (points.length === 0) return;
  ctx.fillStyle = color;
  if (points.length === 1) {
    const r = Math.max((baseWidth * (points[0].pressure ?? 0.5)) / 2, 0.5);
    ctx.beginPath(); ctx.arc(points[0].x, points[0].y, r, 0, Math.PI * 2); ctx.fill(); return;
  }
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i], p1 = points[i + 1];
    const r0 = Math.max((baseWidth * (p0.pressure ?? 0.5)) / 2, 0.5);
    const r1 = Math.max((baseWidth * (p1.pressure ?? 0.5)) / 2, 0.5);
    const dx = p1.x - p0.x, dy = p1.y - p0.y;
    const len = Math.hypot(dx, dy);
    if (len < 0.1) continue;
    const nx = -dy / len, ny = dx / len;
    ctx.beginPath();
    ctx.moveTo(p0.x + nx * r0, p0.y + ny * r0); ctx.lineTo(p1.x + nx * r1, p1.y + ny * r1);
    ctx.lineTo(p1.x - nx * r1, p1.y - ny * r1); ctx.lineTo(p0.x - nx * r0, p0.y - ny * r0);
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(p0.x, p0.y, r0, 0, Math.PI * 2); ctx.fill();
  }
  const last = points[points.length - 1];
  ctx.beginPath();
  ctx.arc(last.x, last.y, Math.max((baseWidth * (last.pressure ?? 0.5)) / 2, 0.5), 0, Math.PI * 2);
  ctx.fill();
}

function applyTaper(points: Point[], taperLen = 10): Point[] {
  if (points.length <= 2) return points;
  const half = Math.min(taperLen, Math.floor(points.length / 2));
  return points.map((p, i) => {
    let pressure = p.pressure ?? 0.5;
    if (i < half) pressure *= (i + 1) / half;
    if (i >= points.length - half) pressure *= (points.length - i) / half;
    return { ...p, pressure: Math.max(pressure, 0.05) };
  });
}

function drawBezierStroke(ctx: CanvasRenderingContext2D, points: Point[], color: string, width: number) {
  if (points.length < 2) return;
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length - 1; i++) {
    const mx = (points[i].x + points[i + 1].x) / 2, my = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, mx, my);
  }
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  ctx.stroke();
}

export default function Canvas(_: { onExport: (c: HTMLCanvasElement) => void }) {
  const { theme } = useTheme();
  // Keep a ref so canvas drawing callbacks always see current theme
  const themeRef = useRef(theme);
  themeRef.current = theme;

  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const liveCanvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef       = useRef<HTMLDivElement>(null);

  const inProg  = useRef<InProg | null>(null);
  const rawPts  = useRef<Array<{ x: number; y: number; t: number }>>([]);
  const isDown  = useRef(false);
  const startW  = useRef({ x: 0, y: 0 });
  const panLast = useRef<{ x: number; y: number } | null>(null);
  const spaceOn = useRef(false);

  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });

  const store = useBoardStore();

  useLayoutEffect(() => {
    const canvas = canvasRef.current!, liveCanvas = liveCanvasRef.current!, wrap = wrapRef.current!;
    const sync = () => {
      const w = wrap.offsetWidth, h = wrap.offsetHeight;
      if (w > 0 && h > 0) {
        canvas.width = w; canvas.height = h; liveCanvas.width = w; liveCanvas.height = h;
        setSize({ w, h });
      }
    };
    sync();
    const obs = new ResizeObserver(sync);
    obs.observe(wrap);
    return () => obs.disconnect();
  }, []);

  const drawEl = (ctx: CanvasRenderingContext2D, el: BoardElement | InProg, dashed = false) => {
    ctx.save();
    if (dashed) ctx.setLineDash([6, 4]);
    if (el.type === 'stroke' && el.points && el.points.length > 0) {
      ctx.setLineDash([]);
      const hasPressure = el.points.some(p => p.pressure !== undefined);
      if (hasPressure) drawPressureStroke(ctx, el.points, el.strokeColor, el.strokeWidth);
      else drawBezierStroke(ctx, el.points, el.strokeColor, el.strokeWidth);
    } else if (el.type === 'rect') {
      ctx.strokeStyle = el.strokeColor; ctx.lineWidth = el.strokeWidth; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.roundRect(el.x, el.y, el.w, el.h, 4); ctx.stroke();
    } else if (el.type === 'ellipse') {
      ctx.strokeStyle = el.strokeColor; ctx.lineWidth = el.strokeWidth;
      ctx.beginPath();
      ctx.ellipse(el.x + el.w / 2, el.y + el.h / 2, Math.abs(el.w / 2), Math.abs(el.h / 2), 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (el.type === 'line') {
      ctx.strokeStyle = el.strokeColor; ctx.lineWidth = el.strokeWidth; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(el.x, el.y); ctx.lineTo(el.x + el.w, el.y + el.h); ctx.stroke();
    } else if (el.type === 'arrow') {
      ctx.strokeStyle = el.strokeColor; ctx.lineWidth = el.strokeWidth; ctx.lineCap = 'round';
      const ex = el.x + el.w, ey = el.y + el.h;
      const ang = Math.atan2(el.h, el.w), hLen = Math.min(22, Math.hypot(el.w, el.h) * 0.3);
      ctx.beginPath(); ctx.moveTo(el.x, el.y); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ex, ey); ctx.lineTo(ex - hLen * Math.cos(ang - Math.PI / 6), ey - hLen * Math.sin(ang - Math.PI / 6));
      ctx.moveTo(ex, ey); ctx.lineTo(ex - hLen * Math.cos(ang + Math.PI / 6), ey - hLen * Math.sin(ang + Math.PI / 6));
      ctx.stroke();
    } else if (el.type === 'text') {
      const fs = (el as BoardElement).fontSize || 18;
      ctx.fillStyle = el.strokeColor;
      ctx.font = `700 ${fs}px Nunito, sans-serif`;
      ctx.fillText((el as BoardElement).content || '', el.x, el.y + fs);
    }
    ctx.restore();
  };

  const redraw = () => {
    const canvas = canvasRef.current, liveCanvas = liveCanvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) return;
    const ctx = canvas.getContext('2d')!;
    const { elements, viewport, selectedIds } = store;
    const selColor = themeRef.current.primary;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (liveCanvas && !inProg.current) {
      liveCanvas.getContext('2d')!.clearRect(0, 0, liveCanvas.width, liveCanvas.height);
    }

    ctx.save();
    ctx.translate(viewport.x, viewport.y);
    ctx.scale(viewport.scale, viewport.scale);

    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    for (const el of sorted) {
      if (el.type === 'sticky') continue;
      drawEl(ctx, el);

      if (selectedIds.includes(el.id)) {
        ctx.save();
        ctx.strokeStyle = selColor;
        ctx.lineWidth = 1.5 / viewport.scale;
        ctx.setLineDash([5, 4]);
        const pad = 8;
        let bx = el.x - pad, by = el.y - pad, bw = el.w + pad * 2, bh = el.h + pad * 2;
        if (el.type === 'stroke' && el.points?.length) {
          const xs = el.points.map(p => p.x), ys = el.points.map(p => p.y);
          bx = Math.min(...xs) - pad; by = Math.min(...ys) - pad;
          bw = Math.max(...xs) - Math.min(...xs) + pad * 2;
          bh = Math.max(...ys) - Math.min(...ys) + pad * 2;
        }
        if (el.type === 'line' || el.type === 'arrow') {
          bx = Math.min(el.x, el.x + el.w) - pad; by = Math.min(el.y, el.y + el.h) - pad;
          bw = Math.abs(el.w) + pad * 2; bh = Math.abs(el.h) + pad * 2;
        }
        ctx.strokeRect(bx, by, bw, bh);
        ctx.setLineDash([]);
        [[bx, by], [bx + bw / 2, by], [bx + bw, by], [bx, by + bh / 2],
          [bx + bw, by + bh / 2], [bx, by + bh], [bx + bw / 2, by + bh], [bx + bw, by + bh]
        ].forEach(([hx, hy]) => {
          ctx.fillStyle = 'white'; ctx.fillRect(hx - 5, hy - 5, 10, 10);
          ctx.strokeStyle = selColor; ctx.lineWidth = 1.5 / viewport.scale; ctx.strokeRect(hx - 5, hy - 5, 10, 10);
        });
        ctx.restore();
      }
    }
    ctx.restore();
  };

  const drawLive = () => {
    const liveCanvas = liveCanvasRef.current;
    if (!liveCanvas || !inProg.current) return;
    const ctx = liveCanvas.getContext('2d')!;
    const { viewport } = store;
    ctx.clearRect(0, 0, liveCanvas.width, liveCanvas.height);
    ctx.save();
    ctx.translate(viewport.x, viewport.y);
    ctx.scale(viewport.scale, viewport.scale);
    const ip = inProg.current;
    if (ip.type === 'stroke' && ip.points && ip.points.length > 0) {
      drawPressureStroke(ctx, ip.points, ip.strokeColor, ip.strokeWidth);
    } else {
      drawEl(ctx, ip, ip.type !== 'stroke');
    }
    ctx.restore();
  };

  useEffect(() => { redraw(); });

  const toWorld = (e: { clientX: number; clientY: number }) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const rw = Math.round(rect.width), rh = Math.round(rect.height);
      if (canvas.width !== rw) canvas.width = rw;
      if (canvas.height !== rh) canvas.height = rh;
    }
    const vp = store.viewport;
    return { x: (e.clientX - rect.left - vp.x) / vp.scale, y: (e.clientY - rect.top - vp.y) / vp.scale };
  };

  const hitEl = (wx: number, wy: number) => {
    const { elements, viewport } = store;
    const pad = 10 / viewport.scale;
    const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);
    for (const el of sorted) {
      if (el.type === 'sticky') continue;
      if (el.type === 'stroke' && el.points) {
        if (el.points.some(p => Math.hypot(p.x - wx, p.y - wy) < 14 / viewport.scale)) return el;
      } else if (el.type === 'line' || el.type === 'arrow') {
        if (wx >= Math.min(el.x, el.x + el.w) - pad && wx <= Math.max(el.x, el.x + el.w) + pad &&
          wy >= Math.min(el.y, el.y + el.h) - pad && wy <= Math.max(el.y, el.y + el.h) + pad) return el;
      } else {
        if (wx >= el.x - pad && wx <= el.x + el.w + pad && wy >= el.y - pad && wy <= el.y + el.h + pad) return el;
      }
    }
    return null;
  };

  const handleDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 2) return;
    setCtxMenu(null);
    const { tool, color, strokeWidth, viewport, elements, selectIds, updateElement, addElement, pushHistory } = store;
    const { x: wx, y: wy } = toWorld(e);

    if (tool === 'pan' || spaceOn.current) { panLast.current = { x: e.clientX, y: e.clientY }; return; }
    if (tool === 'eraser') {
      const hit = hitEl(wx, wy);
      if (hit) { useBoardStore.getState().selectIds([hit.id]); useBoardStore.getState().deleteSelected(); }
      return;
    }
    if (tool === 'select') {
      const hit = hitEl(wx, wy);
      if (hit) {
        selectIds([hit.id]); pushHistory();
        const ox = hit.x, oy = hit.y, mx0 = e.clientX, my0 = e.clientY;
        const mv = (ev: MouseEvent) => updateElement(hit.id, { x: ox + (ev.clientX - mx0) / viewport.scale, y: oy + (ev.clientY - my0) / viewport.scale });
        const up = () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
        window.addEventListener('mousemove', mv); window.addEventListener('mouseup', up);
      } else selectIds([]);
      return;
    }
    if (tool === 'text') {
      const content = prompt('Enter text:') || '';
      if (content) addElement({ id: uid(), type: 'text', x: wx, y: wy, w: 200, h: 30, rotation: 0, zIndex: elements.length, strokeColor: color, fillColor: 'transparent', strokeWidth, content, fontSize: 18 });
      return;
    }

    isDown.current = true;
    startW.current = { x: wx, y: wy };

    if (tool === 'pen') {
      const now = performance.now();
      rawPts.current = [{ x: wx, y: wy, t: now }];
      inProg.current = { id: uid(), type: 'stroke', x: wx, y: wy, w: 0, h: 0, strokeColor: color, strokeWidth, points: [{ x: wx, y: wy, pressure: 0.3 }] };
      drawLive();
    } else {
      const map: Record<string, BoardElement['type']> = { rect: 'rect', ellipse: 'ellipse', line: 'line', arrow: 'arrow' };
      if (map[tool]) inProg.current = { id: uid(), type: map[tool], x: wx, y: wy, w: 0, h: 0, strokeColor: color, strokeWidth };
    }
  };

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (panLast.current) {
      const dx = e.clientX - panLast.current.x, dy = e.clientY - panLast.current.y;
      panLast.current = { x: e.clientX, y: e.clientY };
      store.setViewport({ x: store.viewport.x + dx, y: store.viewport.y + dy }); return;
    }
    if (!isDown.current || !inProg.current) return;
    const { x: wx, y: wy } = toWorld(e);

    if (inProg.current.type === 'stroke') {
      const now = performance.now(), raw = rawPts.current, last = raw[raw.length - 1];
      const dist = Math.hypot(wx - last.x, wy - last.y);
      if (dist < 1.2) return;
      const dt = Math.max(now - last.t, 1), speed = dist / dt;
      const SPEED_MAX = 1.8;
      const rawPressure = Math.max(0.15, 1 - Math.min(speed / SPEED_MAX, 1) * 0.78);
      const prevPts = inProg.current.points || [];
      const prevPressure = prevPts.length > 0 ? (prevPts[prevPts.length - 1].pressure ?? 0.5) : 0.5;
      const smoothed = prevPressure * 0.55 + rawPressure * 0.45;
      raw.push({ x: wx, y: wy, t: now });
      inProg.current = { ...inProg.current, points: [...prevPts, { x: wx, y: wy, pressure: smoothed }] };
      drawLive();
    } else {
      const dw = e.shiftKey
        ? Math.sign(wx - startW.current.x) * Math.min(Math.abs(wx - startW.current.x), Math.abs(wy - startW.current.y))
        : wx - startW.current.x;
      const dh = e.shiftKey
        ? Math.sign(wy - startW.current.y) * Math.min(Math.abs(wx - startW.current.x), Math.abs(wy - startW.current.y))
        : wy - startW.current.y;
      inProg.current = { ...inProg.current, w: dw, h: dh };
      drawLive();
    }
  };

  const handleUp = () => {
    panLast.current = null;
    if (!isDown.current) return;
    isDown.current = false;
    const ip = inProg.current;
    inProg.current = null;
    const liveCanvas = liveCanvasRef.current;
    if (liveCanvas) liveCanvas.getContext('2d')!.clearRect(0, 0, liveCanvas.width, liveCanvas.height);

    if (ip) {
      const { addElement, elements } = store;
      if (ip.type === 'stroke') {
        let pts = ip.points || [];
        if (pts.length > 1) { pts = applyTaper(pts); addElement({ ...ip, fillColor: 'transparent', rotation: 0, zIndex: elements.length, points: pts } as BoardElement); }
        else if (pts.length === 1) addElement({ ...ip, fillColor: 'transparent', rotation: 0, zIndex: elements.length, points: pts } as BoardElement);
        rawPts.current = [];
      } else if (Math.abs(ip.w) > 3 || Math.abs(ip.h) > 3) {
        addElement({ ...ip, fillColor: 'transparent', rotation: 0, zIndex: elements.length } as BoardElement);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current!, rect = canvas.getBoundingClientRect();
    const sx = (e.clientX - rect.left) * (canvas.width / Math.max(rect.width, 1));
    const sy = (e.clientY - rect.top) * (canvas.height / Math.max(rect.height, 1));
    const vp = store.viewport;
    if (e.ctrlKey || e.metaKey) {
      const factor = e.deltaY < 0 ? 1.08 : 0.93;
      const ns = Math.max(0.08, Math.min(5, vp.scale * factor));
      const wx = (sx - vp.x) / vp.scale, wy = (sy - vp.y) / vp.scale;
      store.setViewport({ scale: ns, x: sx - wx * ns, y: sy - wy * ns });
    } else {
      store.setViewport({ x: vp.x - e.deltaX, y: vp.y - e.deltaY });
    }
  };

  useEffect(() => {
    const kd = (e: KeyboardEvent) => { if (e.code === 'Space' && e.target === document.body) { e.preventDefault(); spaceOn.current = true; } };
    const ku = (e: KeyboardEvent) => { if (e.code === 'Space') spaceOn.current = false; };
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); };
  }, []);

  const { elements, viewport, selectedIds } = store;
  const cursor = store.tool === 'pan' || spaceOn.current ? 'grab'
    : store.tool === 'pen' ? 'crosshair'
    : store.tool === 'eraser' ? 'cell' : 'default';

  // ── Theme-derived canvas visuals ─────────────────────────────────────────
  const isKawaii = theme.kawaii;
  const canvasBg       = isKawaii ? '#FFF5F9'  : '#f8fafc';
  const dotColor       = isKawaii ? '#F8BBD9'  : '#cbd5e1';
  const rulerBg        = isKawaii
    ? 'linear-gradient(180deg,#FFE0EE,#FFDDE9)'
    : 'linear-gradient(180deg,#f1f5f9,#e2e8f0)';
  const rulerBorder    = isKawaii ? '#F48FB155' : '#cbd5e155';
  const rulerTickColor = isKawaii ? '#AD6590'   : '#94a3b8';
  const hudBg          = theme.surface;
  const hudBorder      = theme.border;
  const hudBtnBorder   = theme.borderStrong;
  const hudText        = theme.textMuted;
  const hudPrimary     = theme.primary;

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'absolute', inset: 0,
        background: canvasBg,
        backgroundImage: `radial-gradient(circle, ${dotColor} 1.5px, transparent 1.5px)`,
        backgroundSize: '24px 24px',
        transition: 'background-color 0.35s',
      }}
    >
      {/* Ruler */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 20, zIndex: 4,
        background: rulerBg,
        borderBottom: `1px solid ${rulerBorder}`,
        display: 'flex', alignItems: 'flex-end', pointerEvents: 'none', userSelect: 'none',
        transition: 'background 0.35s',
      }}>
        {Array.from({ length: 40 }, (_, i) => (
          <div key={i} style={{
            flex: 1, borderLeft: `1px solid ${rulerTickColor}33`,
            height: i % 5 === 0 ? '55%' : '22%',
            display: 'flex', alignItems: 'flex-end', paddingLeft: 1,
          }}>
            {i % 10 === 0 && i > 0 && <span style={{ fontSize: '0.4rem', color: rulerTickColor, fontWeight: 700 }}>{i * 10}</span>}
          </div>
        ))}
      </div>

      {/* Base canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor, display: 'block', touchAction: 'none' }}
        onMouseDown={handleDown} onMouseMove={handleMove} onMouseUp={handleUp}
        onMouseLeave={handleUp} onWheel={handleWheel}
        onContextMenu={e => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY }); }}
      />

      {/* Live canvas */}
      <canvas
        ref={liveCanvasRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', display: 'block' }}
      />

      {/* Sticky notes */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 10 }}>
        {elements.filter(e => e.type === 'sticky').map(el => (
          <div key={el.id} style={{ pointerEvents: 'all' }}>
            <StickyNote element={el} viewport={viewport} isSelected={selectedIds.includes(el.id)} />
          </div>
        ))}
      </div>

      {/* Ghost cursors — kawaii only */}
      {isKawaii && (
        <div className="ghost-cursors-layer" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 15 }}>
          <GhostCursors containerWidth={size.w} containerHeight={size.h} />
        </div>
      )}

      {/* Glitter trail — kawaii only */}
      {isKawaii && <CursorGlitter containerRef={wrapRef as React.RefObject<HTMLElement>} />}

      {/* Zoom HUD */}
      <div style={{
        position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)',
        background: hudBg, borderRadius: isKawaii ? 50 : 10,
        border: `1.5px solid ${hudBorder}`,
        padding: '0.4rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.7rem',
        boxShadow: theme.shadowMd, zIndex: 20, fontFamily: 'Nunito,sans-serif',
        transition: 'background 0.35s, border-color 0.35s',
      }}>
        <button onClick={() => store.setViewport({ scale: Math.max(0.08, viewport.scale - 0.1) })}
          style={{ width: 26, height: 26, borderRadius: isKawaii ? '50%' : 6, border: `1.5px solid ${hudBtnBorder}`, background: hudBg, cursor: 'pointer', color: hudPrimary, fontWeight: 900, fontSize: '1rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: hudText, minWidth: 40, textAlign: 'center' }}>{Math.round(viewport.scale * 100)}%</span>
        <button onClick={() => store.setViewport({ scale: Math.min(5, viewport.scale + 0.1) })}
          style={{ width: 26, height: 26, borderRadius: isKawaii ? '50%' : 6, border: `1.5px solid ${hudBtnBorder}`, background: hudBg, cursor: 'pointer', color: hudPrimary, fontWeight: 900, fontSize: '1rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
        <div style={{ width: 1, height: 16, background: hudBorder }} />
        <button onClick={() => store.setViewport({ x: 0, y: 0, scale: 1 })} title="Fit [F]"
          style={{ width: 26, height: 26, borderRadius: isKawaii ? '50%' : 6, border: `1.5px solid ${hudBtnBorder}`, background: hudBg, cursor: 'pointer', color: hudPrimary, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⊡</button>
        <div style={{ width: 1, height: 16, background: hudBorder }} />
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: hudText }}>{elements.length} obj</span>
      </div>

      {/* Context menu */}
      {ctxMenu && (
        <div className="context-menu" style={{ position: 'fixed', left: ctxMenu.x, top: ctxMenu.y, zIndex: 300 }} onClick={() => setCtxMenu(null)}>
          {selectedIds.length > 0 ? (
            <>
              <div className="context-item" onClick={() => { store.duplicateSelected(); setCtxMenu(null); }}>📋 Duplicate</div>
              <div className="context-item" onClick={() => { store.bringForward(); setCtxMenu(null); }}>⬆️ Bring Forward</div>
              <div className="context-item" onClick={() => { store.sendBackward(); setCtxMenu(null); }}>⬇️ Send Backward</div>
              <div className="context-item" onClick={() => { store.bringToFront(); setCtxMenu(null); }}>⤴️ Bring to Front</div>
              <div className="context-item" onClick={() => { store.sendToBack(); setCtxMenu(null); }}>⤵️ Send to Back</div>
              <div className="context-sep" />
              <div className="context-item danger" onClick={() => { store.deleteSelected(); setCtxMenu(null); }}>🗑️ Delete</div>
            </>
          ) : (
            <div className="context-item" style={{ color: theme.textSubtle, cursor: 'default', fontSize: '0.78rem' }}>Right-click a shape to edit</div>
          )}
        </div>
      )}
    </div>
  );
}
