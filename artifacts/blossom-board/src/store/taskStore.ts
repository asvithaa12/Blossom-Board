import { create } from 'zustand';

export type Priority = 'high' | 'med' | 'low';
export type Column = 'backlog' | 'inprogress' | 'review' | 'done';
export type TaskView = 'kanban' | 'calendar' | 'list';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  assignee: string;
  assigneeColor: string;
  dueDate?: string;
  column: Column;
  tags?: string[];
  createdAt: number;
}

interface TaskState {
  tasks: Task[];
  view: TaskView;
  search: string;
  filters: Priority[];
  setView: (v: TaskView) => void;
  setSearch: (s: string) => void;
  toggleFilter: (p: Priority) => void;
  addTask: (t: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, col: Column) => void;
}

const ASSIGNEE_COLORS: Record<string, string> = {
  'AL': '#E91E8C',
  'BJ': '#9C27B0',
  'MK': '#2196F3',
  'SR': '#4CAF50',
};

const initTasks: Task[] = [
  { id: '1', title: 'Design hero section animation', priority: 'high', assignee: 'AL', assigneeColor: '#E91E8C', dueDate: '2026-05-10', column: 'inprogress', createdAt: Date.now() - 86400000 * 3 },
  { id: '2', title: 'Implement freehand drawing tool', priority: 'high', assignee: 'BJ', assigneeColor: '#9C27B0', dueDate: '2026-05-08', column: 'review', createdAt: Date.now() - 86400000 * 2 },
  { id: '3', title: 'Add sticky note emoji picker', priority: 'med', assignee: 'MK', assigneeColor: '#2196F3', dueDate: '2026-05-12', column: 'backlog', createdAt: Date.now() - 86400000 },
  { id: '4', title: 'Export PNG functionality', priority: 'med', assignee: 'SR', assigneeColor: '#4CAF50', dueDate: '2026-05-09', column: 'done', createdAt: Date.now() - 86400000 * 4 },
  { id: '5', title: 'Mock cursor animations', priority: 'low', assignee: 'AL', assigneeColor: '#E91E8C', dueDate: '2026-05-15', column: 'backlog', createdAt: Date.now() - 86400000 * 2 },
  { id: '6', title: 'Kanban drag & drop', priority: 'high', assignee: 'BJ', assigneeColor: '#9C27B0', dueDate: '2026-05-07', column: 'done', createdAt: Date.now() - 86400000 * 5 },
  { id: '7', title: 'Calendar view integration', priority: 'med', assignee: 'MK', assigneeColor: '#2196F3', dueDate: '2026-05-14', column: 'inprogress', createdAt: Date.now() - 86400000 },
  { id: '8', title: 'Undo/redo history stack', priority: 'high', assignee: 'SR', assigneeColor: '#4CAF50', dueDate: '2026-05-11', column: 'review', createdAt: Date.now() - 86400000 * 3 },
];

export const useTaskStore = create<TaskState>((set) => ({
  tasks: initTasks,
  view: 'kanban',
  search: '',
  filters: [],

  setView: (v) => set({ view: v }),
  setSearch: (s) => set({ search: s }),
  toggleFilter: (p) => set(s => ({
    filters: s.filters.includes(p) ? s.filters.filter(f => f !== p) : [...s.filters, p]
  })),

  addTask: (t) => set(s => ({
    tasks: [...s.tasks, { ...t, id: Math.random().toString(36).slice(2), createdAt: Date.now(), assigneeColor: ASSIGNEE_COLORS[t.assignee] || '#E91E8C' }]
  })),

  updateTask: (id, patch) => set(s => ({
    tasks: s.tasks.map(t => t.id === id ? { ...t, ...patch } : t)
  })),

  deleteTask: (id) => set(s => ({ tasks: s.tasks.filter(t => t.id !== id) })),

  moveTask: (id, col) => set(s => ({
    tasks: s.tasks.map(t => t.id === id ? { ...t, column: col } : t)
  })),
}));
