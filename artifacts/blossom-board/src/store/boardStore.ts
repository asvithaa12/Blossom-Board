import { create } from 'zustand';

export type Tool = 'select' | 'pen' | 'eraser' | 'rect' | 'ellipse' | 'line' | 'arrow' | 'text' | 'sticky' | 'pan';

export interface Point { x: number; y: number; pressure?: number; }

export interface BoardElement {
  id: string;
  type: 'stroke' | 'rect' | 'ellipse' | 'line' | 'arrow' | 'text' | 'sticky';
  x: number; y: number; w: number; h: number;
  rotation: number;
  zIndex: number;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  points?: Point[];
  content?: string;
  stickyColor?: string;
  fontSize?: number;
  emoji?: string;
}

export interface Viewport { x: number; y: number; scale: number; }

export interface ActivityItem {
  id: string;
  user: string;
  userColor: string;
  userInitials: string;
  action: string;
  time: number;
}

interface BoardState {
  elements: BoardElement[];
  history: BoardElement[][];
  historyIndex: number;
  tool: Tool;
  color: string;
  strokeWidth: number;
  viewport: Viewport;
  selectedIds: string[];
  clipboard: BoardElement[];
  activities: ActivityItem[];
  setTool: (t: Tool) => void;
  setColor: (c: string) => void;
  setStrokeWidth: (w: number) => void;
  addElement: (el: BoardElement) => void;
  updateElement: (id: string, patch: Partial<BoardElement>) => void;
  deleteSelected: () => void;
  selectIds: (ids: string[]) => void;
  setViewport: (v: Partial<Viewport>) => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  copySelected: () => void;
  paste: () => void;
  duplicateSelected: () => void;
  clearBoard: () => void;
  addActivity: (user: string, userColor: string, userInitials: string, action: string) => void;
  bringForward: () => void;
  sendBackward: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
}

const MOCK_USERS = [
  { name: 'Alice L.', color: '#E91E8C', initials: 'AL' },
  { name: 'Bob J.', color: '#9C27B0', initials: 'BJ' },
  { name: 'Maya K.', color: '#2196F3', initials: 'MK' },
  { name: 'Sam R.', color: '#4CAF50', initials: 'SR' },
];

let actIdCounter = 0;

// On startup, wipe any duplicates from localStorage so we start clean
try {
  const raw = localStorage.getItem('blossom-board-state');
  if (raw) {
    const els = JSON.parse(raw) as { id: string }[];
    if (Array.isArray(els)) {
      const seen = new Set<string>();
      const unique = els.filter(e => { if (seen.has(e.id)) return false; seen.add(e.id); return true; });
      if (unique.length !== els.length) {
        localStorage.setItem('blossom-board-state', JSON.stringify(unique));
      }
    }
  }
} catch {}

export const useBoardStore = create<BoardState>((set, get) => ({
  elements: [],
  history: [[]],
  historyIndex: 0,
  tool: 'select',
  color: '#E91E8C',
  strokeWidth: 3,
  viewport: { x: 0, y: 0, scale: 1 },
  selectedIds: [],
  clipboard: [],
  activities: [],

  setTool: (t) => set({ tool: t, selectedIds: [] }),
  setColor: (c) => set({ color: c }),
  setStrokeWidth: (w) => set({ strokeWidth: w }),

  addElement: (el) => {
    const state = get();
    const newElements = [...state.elements, el];
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newElements);
    set({ elements: newElements, history: newHistory, historyIndex: newHistory.length - 1 });
    const u = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
    get().addActivity(u.name, u.color, u.initials, `added a ${el.type}`);
    try { localStorage.setItem('blossom-board-state', JSON.stringify(newElements)); } catch {}
  },

  updateElement: (id, patch) => {
    set(s => {
      const elements = s.elements.map(e => e.id === id ? { ...e, ...patch } : e);
      try { localStorage.setItem('blossom-board-state', JSON.stringify(elements)); } catch {}
      return { elements };
    });
  },

  deleteSelected: () => {
    const state = get();
    const newElements = state.elements.filter(e => !state.selectedIds.includes(e.id));
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newElements);
    set({ elements: newElements, history: newHistory, historyIndex: newHistory.length - 1, selectedIds: [] });
    try { localStorage.setItem('blossom-board-state', JSON.stringify(newElements)); } catch {}
  },

  selectIds: (ids) => set({ selectedIds: ids }),

  setViewport: (v) => set(s => ({ viewport: { ...s.viewport, ...v } })),

  pushHistory: () => {
    const state = get();
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push([...state.elements]);
    if (newHistory.length > 51) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex <= 0) return;
    const newIndex = state.historyIndex - 1;
    const elements = state.history[newIndex];
    set({ elements: [...elements], historyIndex: newIndex, selectedIds: [] });
    try { localStorage.setItem('blossom-board-state', JSON.stringify(elements)); } catch {}
  },

  redo: () => {
    const state = get();
    if (state.historyIndex >= state.history.length - 1) return;
    const newIndex = state.historyIndex + 1;
    const elements = state.history[newIndex];
    set({ elements: [...elements], historyIndex: newIndex, selectedIds: [] });
    try { localStorage.setItem('blossom-board-state', JSON.stringify(elements)); } catch {}
  },

  copySelected: () => {
    const state = get();
    const clipboard = state.elements.filter(e => state.selectedIds.includes(e.id));
    set({ clipboard });
  },

  paste: () => {
    const state = get();
    if (!state.clipboard.length) return;
    const newEls = state.clipboard.map(e => ({
      ...e,
      id: Math.random().toString(36).slice(2),
      x: e.x + 10, y: e.y + 10,
      zIndex: Math.max(...state.elements.map(el => el.zIndex), 0) + 1,
    }));
    const newElements = [...state.elements, ...newEls];
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newElements);
    set({ elements: newElements, history: newHistory, historyIndex: newHistory.length - 1, selectedIds: newEls.map(e => e.id) });
  },

  duplicateSelected: () => {
    const state = get();
    const toDup = state.elements.filter(e => state.selectedIds.includes(e.id));
    const newEls = toDup.map(e => ({
      ...e,
      id: Math.random().toString(36).slice(2),
      x: e.x + 10, y: e.y + 10,
      zIndex: Math.max(...state.elements.map(el => el.zIndex), 0) + 1,
    }));
    const newElements = [...state.elements, ...newEls];
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(newElements);
    set({ elements: newElements, history: newHistory, historyIndex: newHistory.length - 1, selectedIds: newEls.map(e => e.id) });
  },

  clearBoard: () => {
    const newHistory = get().history.slice(0, get().historyIndex + 1);
    newHistory.push([]);
    set({ elements: [], history: newHistory, historyIndex: newHistory.length - 1, selectedIds: [] });
    try { localStorage.removeItem('blossom-board-state'); } catch {}
  },

  addActivity: (user, userColor, userInitials, action) => {
    const item: ActivityItem = { id: String(actIdCounter++), user, userColor, userInitials, action, time: Date.now() };
    set(s => ({ activities: [item, ...s.activities].slice(0, 20) }));
  },

  bringForward: () => {
    const state = get();
    const ids = new Set(state.selectedIds);
    const maxZ = Math.max(...state.elements.map(e => e.zIndex));
    set({ elements: state.elements.map(e => ids.has(e.id) ? { ...e, zIndex: Math.min(e.zIndex + 1, maxZ + 1) } : e) });
  },
  sendBackward: () => {
    const state = get();
    const ids = new Set(state.selectedIds);
    set({ elements: state.elements.map(e => ids.has(e.id) ? { ...e, zIndex: Math.max(e.zIndex - 1, 0) } : e) });
  },
  bringToFront: () => {
    const state = get();
    const ids = new Set(state.selectedIds);
    const maxZ = Math.max(...state.elements.map(e => e.zIndex), 0);
    set({ elements: state.elements.map(e => ids.has(e.id) ? { ...e, zIndex: maxZ + 1 } : e) });
  },
  sendToBack: () => {
    const state = get();
    const ids = new Set(state.selectedIds);
    set({ elements: state.elements.map(e => ids.has(e.id) ? { ...e, zIndex: 0 } : e) });
  },
}));
