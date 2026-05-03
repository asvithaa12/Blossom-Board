import { useState } from 'react';
import { useTaskStore, Task, Column, Priority } from '../store/taskStore';
import { motion, AnimatePresence } from 'framer-motion';
import KawaiiAvatar from '../components/KawaiiAvatar';

const COL_META: Record<Column, { label: string; color: string; dotColor: string; emoji: string }> = {
  backlog: { label: 'Backlog', color: '#F3E5F5', dotColor: '#9C27B0', emoji: '📋' },
  inprogress: { label: 'In Progress', color: '#E3F2FD', dotColor: '#2196F3', emoji: '⚡' },
  review: { label: 'Review', color: '#FFF3E0', dotColor: '#FF9800', emoji: '🔍' },
  done: { label: 'Done', color: '#E8F5E9', dotColor: '#4CAF50', emoji: '✅' },
};

const PRIORITY_META: Record<Priority, { label: string; bg: string; color: string; emoji: string }> = {
  high: { label: 'High', bg: '#FFDDE9', color: '#C2185B', emoji: '🌹' },
  med: { label: 'Medium', bg: '#FFF9C4', color: '#F57F17', emoji: '🌺' },
  low: { label: 'Low', bg: '#E8F5E9', color: '#2E7D32', emoji: '🌸' },
};

const COLS: Column[] = ['backlog', 'inprogress', 'review', 'done'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ASSIGNEE_NAMES: Record<string, string> = {
  AL: 'Alice L.',
  BJ: 'Bob J.',
  MK: 'Maya K.',
  SR: 'Sam R.',
};

function TaskCard({ task }: { task: Task }) {
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const deleteTask = useTaskStore(s => s.deleteTask);
  const pm = PRIORITY_META[task.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      draggable
      onDragStart={e => { setDragging(true); e.dataTransfer.setData('taskId', task.id); }}
      onDragEnd={() => setDragging(false)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFF0F5', border: '1.5px solid #FCE4EC', borderRadius: 14,
        padding: '0.9rem', cursor: 'grab', opacity: dragging ? 0.5 : 1,
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: dragging ? '0 8px 24px rgba(233,30,140,0.2)' : undefined,
      }}
      whileHover={{ y: -2, boxShadow: '0 4px 16px rgba(233,30,140,0.12)', borderColor: '#F48FB1' }}
    >
      {/* Delete button */}
      <AnimatePresence>
        {hovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            onClick={e => { e.stopPropagation(); deleteTask(task.id); }}
            style={{
              position: 'absolute', top: 8, right: 8,
              width: 22, height: 22, borderRadius: '50%',
              background: '#FFE0EC', border: '1.5px solid #F48FB1',
              color: '#C2185B', fontSize: '0.75rem', fontWeight: 900,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1, zIndex: 2,
            }}
            title="Delete task"
          >
            ×
          </motion.button>
        )}
      </AnimatePresence>

      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#3D1A2E', marginBottom: '0.5rem', lineHeight: 1.3, paddingRight: hovered ? 24 : 0 }}>{task.title}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 50, background: pm.bg, color: pm.color }}>
          {pm.emoji} {pm.label}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {task.dueDate && <span style={{ fontSize: '0.68rem', color: '#AD6590', fontWeight: 600 }}>📅 {task.dueDate}</span>}
          <KawaiiAvatar initials={task.assignee} name={ASSIGNEE_NAMES[task.assignee]} size={26} />
        </div>
      </div>
    </motion.div>
  );
}

function KanbanView({ tasks }: { tasks: Task[] }) {
  const moveTask = useTaskStore(s => s.moveTask);

  const onDrop = (e: React.DragEvent, col: Column) => {
    const id = e.dataTransfer.getData('taskId');
    if (id) moveTask(id, col);
    (e.currentTarget as HTMLElement).style.background = 'white';
  };

  return (
    <div style={{ display: 'flex', gap: '1.2rem', padding: '1.5rem', overflowX: 'auto', alignItems: 'flex-start', minHeight: 'calc(100vh - 130px)' }}>
      {COLS.map(col => {
        const meta = COL_META[col];
        const colTasks = tasks.filter(t => t.column === col);
        return (
          <div key={col} style={{ background: 'white', borderRadius: 20, border: '1.5px solid #FCE4EC', minWidth: 250, maxWidth: 270, flexShrink: 0, overflow: 'hidden' }}
            onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLElement).style.background = '#FFF0F5'; }}
            onDragLeave={e => (e.currentTarget as HTMLElement).style.background = 'white'}
            onDrop={e => onDrop(e, col)}>
            <div style={{ padding: '1rem', borderBottom: '1.5px solid #FCE4EC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 800, color: '#3D1A2E' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: meta.dotColor }} />
                {meta.emoji} {meta.label}
              </div>
              <div style={{ background: '#FFF0F5', borderRadius: 50, padding: '0.15rem 0.5rem', fontSize: '0.72rem', fontWeight: 700, color: '#AD6590' }}>
                {colTasks.length}
              </div>
            </div>
            <div style={{ padding: '0.7rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', minHeight: 80 }}>
              <AnimatePresence>
                {colTasks.map(t => <TaskCard key={t.id} task={t} />)}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface CalendarNote {
  text: string;
}

function CalendarView({ tasks }: { tasks: Task[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [notes, setNotes] = useState<Record<string, CalendarNote>>({});
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [draftText, setDraftText] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const cells: Array<number | null> = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const dateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getTasksForDay = (day: number) => tasks.filter(t => t.dueDate === dateStr(day));

  const openDay = (day: number) => {
    const ds = dateStr(day);
    setSelectedDay(ds);
    setDraftText(notes[ds]?.text || '');
  };

  const saveNote = () => {
    if (!selectedDay) return;
    if (draftText.trim()) {
      setNotes(n => ({ ...n, [selectedDay]: { text: draftText.trim() } }));
    } else {
      setNotes(n => { const copy = { ...n }; delete copy[selectedDay]; return copy; });
    }
    setSelectedDay(null);
  };

  const selectedDateLabel = selectedDay
    ? new Date(selectedDay + 'T00:00:00').toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#3D1A2E' }}>
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setCurrentDate(new Date(year, month - 1))} style={{ background: '#FCE4EC', border: 'none', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', color: '#E91E8C' }}>‹</button>
          <button onClick={() => setCurrentDate(new Date(year, month + 1))} style={{ background: '#FCE4EC', border: 'none', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: '1rem', color: '#E91E8C' }}>›</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.4rem' }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#AD6590', padding: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d}</div>
        ))}
        {cells.map((day, i) => {
          const isToday = day !== null && today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
          const dayTasks = day ? getTasksForDay(day) : [];
          const ds = day ? dateStr(day) : '';
          const hasNote = ds && notes[ds]?.text;
          return (
            <div key={i}
              onClick={() => day && openDay(day)}
              style={{
                background: day ? 'white' : 'transparent', borderRadius: 12,
                border: day ? `1.5px solid ${isToday ? '#E91E8C' : '#FCE4EC'}` : 'none',
                minHeight: 90, padding: '0.4rem 0.5rem',
                cursor: day ? 'pointer' : 'default',
                transition: 'background 0.15s, box-shadow 0.15s',
                boxShadow: isToday ? '0 0 0 2px #E91E8C33' : undefined,
              }}
              onMouseEnter={e => { if (day) (e.currentTarget as HTMLElement).style.background = '#FFF0F5'; }}
              onMouseLeave={e => { if (day) (e.currentTarget as HTMLElement).style.background = 'white'; }}
            >
              {day && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: isToday ? 800 : 700, color: isToday ? '#E91E8C' : '#7B3F6E' }}>{day}</div>
                    {hasNote && <div style={{ fontSize: '0.6rem' }} title={notes[ds]!.text}>📝</div>}
                  </div>
                  {dayTasks.slice(0, 2).map(t => (
                    <div key={t.id} style={{ background: PRIORITY_META[t.priority].bg, color: PRIORITY_META[t.priority].color, borderRadius: 50, padding: '0.1rem 0.4rem', fontSize: '0.62rem', fontWeight: 700, marginBottom: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && <div style={{ fontSize: '0.6rem', color: '#AD6590', fontWeight: 700 }}>+{dayTasks.length - 2}</div>}
                  {hasNote && (
                    <div style={{ fontSize: '0.6rem', color: '#AD6590', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3, marginTop: '0.1rem' }}>
                      {notes[ds]!.text}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Day note modal */}
      <AnimatePresence>
        {selectedDay && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(61,26,46,0.4)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={() => setSelectedDay(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'white', borderRadius: 24, padding: '1.6rem', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(233,30,140,0.25)' }}
            >
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#E91E8C', marginBottom: '0.25rem' }}>📝 {selectedDateLabel}</div>
              <div style={{ fontSize: '0.78rem', color: '#AD6590', marginBottom: '1rem' }}>Write anything — a note, reminder, idea…</div>
              <textarea
                autoFocus
                value={draftText}
                onChange={e => setDraftText(e.target.value)}
                placeholder="What's on your mind for this day? 🌸"
                rows={5}
                style={{
                  width: '100%', padding: '0.7rem 0.9rem', border: '1.5px solid #F48FB1',
                  borderRadius: 14, fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem',
                  color: '#3D1A2E', background: '#FFF0F5', outline: 'none', resize: 'vertical',
                  lineHeight: 1.6, boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: '0.7rem', marginTop: '1rem' }}>
                <button onClick={() => setSelectedDay(null)} style={{ flex: 1, padding: '0.65rem', borderRadius: 12, border: '2px solid #FCE4EC', background: 'white', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: 700, color: '#7B3F6E' }}>Cancel</button>
                <button onClick={saveNote} style={{ flex: 1, padding: '0.65rem', borderRadius: 12, border: 'none', background: '#E91E8C', color: 'white', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: 800 }}>Save Note ♡</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ListView({ tasks }: { tasks: Task[] }) {
  const deleteTask = useTaskStore(s => s.deleteTask);
  const [sortBy, setSortBy] = useState<'title' | 'priority' | 'dueDate' | 'assignee'>('priority');
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  const sorted = [...tasks].sort((a, b) => {
    const va = a[sortBy] || '';
    const vb = b[sortBy] || '';
    return String(va).localeCompare(String(vb)) * sortDir;
  });

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === 1 ? -1 : 1);
    else { setSortBy(col); setSortDir(1); }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: 960, margin: '0 auto' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.4rem' }}>
        <thead>
          <tr>
            {[['title', 'Title'], ['assignee', 'Assignee'], ['column', 'Status'], ['priority', 'Priority'], ['dueDate', 'Due Date']].map(([key, label]) => (
              <th key={key} onClick={() => toggleSort(key as any)} style={{ fontSize: '0.75rem', fontWeight: 800, color: '#AD6590', padding: '0.5rem 1rem', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', userSelect: 'none' }}>
                {label} {sortBy === key ? (sortDir === 1 ? '↑' : '↓') : ''}
              </th>
            ))}
            <th style={{ width: 48 }} />
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {sorted.map(t => {
              const pm = PRIORITY_META[t.priority];
              const cm = COL_META[t.column];
              return (
                <motion.tr
                  key={t.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  style={{ background: 'white', borderRadius: 12, cursor: 'default' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(233,30,140,0.12)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}
                >
                  <td style={{ padding: '0.8rem 1rem', fontSize: '0.85rem', fontWeight: 600, color: '#3D1A2E', borderTop: '1.5px solid #FCE4EC', borderBottom: '1.5px solid #FCE4EC', borderLeft: '1.5px solid #FCE4EC', borderRadius: '12px 0 0 12px' }}>{t.title}</td>
                  <td style={{ padding: '0.8rem 1rem', borderTop: '1.5px solid #FCE4EC', borderBottom: '1.5px solid #FCE4EC' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <KawaiiAvatar initials={t.assignee} name={ASSIGNEE_NAMES[t.assignee]} size={28} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#7B3F6E' }}>{ASSIGNEE_NAMES[t.assignee] || t.assignee}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.8rem 1rem', borderTop: '1.5px solid #FCE4EC', borderBottom: '1.5px solid #FCE4EC' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 50, background: cm.color + '22', color: cm.dotColor }}>{cm.emoji} {cm.label}</span>
                  </td>
                  <td style={{ padding: '0.8rem 1rem', borderTop: '1.5px solid #FCE4EC', borderBottom: '1.5px solid #FCE4EC' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 50, background: pm.bg, color: pm.color }}>{pm.emoji} {pm.label}</span>
                  </td>
                  <td style={{ padding: '0.8rem 1rem', fontSize: '0.8rem', fontWeight: 600, color: '#AD6590', borderTop: '1.5px solid #FCE4EC', borderBottom: '1.5px solid #FCE4EC' }}>{t.dueDate || '—'}</td>
                  <td style={{ padding: '0.4rem 0.6rem', borderTop: '1.5px solid #FCE4EC', borderBottom: '1.5px solid #FCE4EC', borderRight: '1.5px solid #FCE4EC', borderRadius: '0 12px 12px 0' }}>
                    <button
                      onClick={() => deleteTask(t.id)}
                      title="Delete task"
                      style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: '#FFF0F5', border: '1.5px solid #F48FB1',
                        color: '#C2185B', fontSize: '0.85rem', fontWeight: 900,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FFDDE9'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#FFF0F5'}
                    >
                      ×
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
      {sorted.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#AD6590', fontSize: '0.9rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌸</div>
          No tasks found.
        </div>
      )}
    </div>
  );
}

export default function TasksPage() {
  const { tasks, view, search, filters, setView, setSearch, toggleFilter, addTask } = useTaskStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', priority: 'med' as Priority, assignee: 'AL', dueDate: '', column: 'backlog' as Column });

  const filtered = tasks.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.length && !filters.includes(t.priority)) return false;
    return true;
  });

  const submit = () => {
    if (!form.title.trim()) return;
    addTask(form);
    setShowModal(false);
    setForm({ title: '', priority: 'med', assignee: 'AL', dueDate: '', column: 'backlog' });
  };

  return (
    <div style={{ paddingTop: 60, minHeight: '100vh', background: '#FFF0F5' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1.5px solid #FCE4EC', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem' }}>
        <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#3D1A2E', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📋 Task Board</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#FFF0F5', border: '1.5px solid #FCE4EC', borderRadius: 50, padding: '0.35rem 0.8rem', fontSize: '0.85rem' }}>
            <span>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…" style={{ background: 'transparent', border: 'none', outline: 'none', fontFamily: 'Nunito, sans-serif', color: '#3D1A2E', fontSize: '0.85rem', width: 140 }} />
          </div>
          {(['high', 'med', 'low'] as Priority[]).map(p => (
            <button key={p} onClick={() => toggleFilter(p)} style={{
              background: filters.includes(p) ? PRIORITY_META[p].bg : 'white',
              color: filters.includes(p) ? PRIORITY_META[p].color : '#7B3F6E',
              border: `1.5px solid ${filters.includes(p) ? PRIORITY_META[p].color : '#FCE4EC'}`,
              borderRadius: 50, padding: '0.25rem 0.7rem', fontSize: '0.75rem', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Nunito, sans-serif',
            }}>{PRIORITY_META[p].emoji} {PRIORITY_META[p].label}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: '#FFF0F5', borderRadius: 50, padding: '0.25rem', gap: '0.2rem', border: '1.5px solid #FCE4EC' }}>
            {['kanban', 'calendar', 'list'].map(v => (
              <button key={v} onClick={() => setView(v as any)} style={{
                padding: '0.35rem 0.9rem', borderRadius: 50, border: 'none', cursor: 'pointer',
                fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.8rem',
                background: view === v ? '#E91E8C' : 'transparent',
                color: view === v ? 'white' : '#7B3F6E', transition: 'all 0.2s',
              }}>
                {v === 'kanban' ? '📌 Kanban' : v === 'calendar' ? '📅 Calendar' : '☰ List'}
              </button>
            ))}
          </div>
          <button onClick={() => setShowModal(true)} style={{
            background: '#E91E8C', color: 'white', border: 'none', borderRadius: 50,
            padding: '0.45rem 1.1rem', cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
            fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem',
            transition: 'all 0.2s',
          }}>＋ Add Task</button>
        </div>
      </div>

      {/* Content */}
      {view === 'kanban' && <KanbanView tasks={filtered} />}
      {view === 'calendar' && <CalendarView tasks={filtered} />}
      {view === 'list' && <ListView tasks={filtered} />}

      {/* Add Task Modal */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(61,26,46,0.45)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'white', borderRadius: 24, padding: '1.8rem', width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(233,30,140,0.25)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#3D1A2E', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📌 Add New Task</h3>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#7B3F6E', marginBottom: '0.35rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Task Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="What needs to be done?"
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  style={{ width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid #F48FB1', borderRadius: 12, fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem', color: '#3D1A2E', background: '#FFF0F5', outline: 'none', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#7B3F6E', marginBottom: '0.35rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}
                    style={{ width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid #F48FB1', borderRadius: 12, fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem', color: '#3D1A2E', background: '#FFF0F5', outline: 'none', cursor: 'pointer' }}>
                    <option value="high">🌹 High</option>
                    <option value="med">🌺 Medium</option>
                    <option value="low">🌸 Low</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#7B3F6E', marginBottom: '0.35rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assignee</label>
                  <select value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))}
                    style={{ width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid #F48FB1', borderRadius: 12, fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem', color: '#3D1A2E', background: '#FFF0F5', outline: 'none', cursor: 'pointer' }}>
                    <option value="AL">Alice L.</option>
                    <option value="BJ">Bob J.</option>
                    <option value="MK">Maya K.</option>
                    <option value="SR">Sam R.</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#7B3F6E', marginBottom: '0.35rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Due Date</label>
                <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid #F48FB1', borderRadius: 12, fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem', color: '#3D1A2E', background: '#FFF0F5', outline: 'none' }} />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#7B3F6E', marginBottom: '0.35rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Column</label>
                <select value={form.column} onChange={e => setForm(f => ({ ...f, column: e.target.value as Column }))}
                  style={{ width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid #F48FB1', borderRadius: 12, fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem', color: '#3D1A2E', background: '#FFF0F5', outline: 'none', cursor: 'pointer' }}>
                  <option value="backlog">📋 Backlog</option>
                  <option value="inprogress">⚡ In Progress</option>
                  <option value="review">🔍 Review</option>
                  <option value="done">✅ Done</option>
                </select>
              </div>

              {/* Assignee preview */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', background: '#FFF0F5', padding: '0.6rem 0.9rem', borderRadius: 12, marginBottom: '1rem' }}>
                <KawaiiAvatar initials={form.assignee} name={ASSIGNEE_NAMES[form.assignee]} size={36} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#7B3F6E' }}>Assigned to <strong style={{ color: '#E91E8C' }}>{ASSIGNEE_NAMES[form.assignee]}</strong></span>
              </div>

              <div style={{ display: 'flex', gap: '0.7rem', marginTop: '0.5rem' }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.7rem', borderRadius: 12, border: '2px solid #FCE4EC', background: 'white', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: 700, color: '#7B3F6E', transition: 'all 0.2s' }}>Cancel</button>
                <button onClick={submit} style={{ flex: 1, padding: '0.7rem', borderRadius: 12, border: 'none', background: '#E91E8C', color: 'white', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: 800, transition: 'all 0.2s' }}>Add Task ♡</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
