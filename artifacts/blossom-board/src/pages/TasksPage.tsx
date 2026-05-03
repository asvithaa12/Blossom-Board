import { useState } from 'react';
import { useTaskStore, Task, Column, Priority } from '../store/taskStore';
import { motion, AnimatePresence } from 'framer-motion';
import KawaiiAvatar from '../components/KawaiiAvatar';
import { useTheme } from '../context/ThemeContext';

const COL_META: Record<Column, { label: string; color: string; dotColor: string; emoji: string; normalBg: string }> = {
  backlog:    { label: 'Backlog',     color: '#F3E5F5', dotColor: '#9C27B0', emoji: '📋', normalBg: '#f5f3ff' },
  inprogress: { label: 'In Progress', color: '#E3F2FD', dotColor: '#2196F3', emoji: '⚡', normalBg: '#eff6ff' },
  review:     { label: 'Review',      color: '#FFF3E0', dotColor: '#FF9800', emoji: '🔍', normalBg: '#fff7ed' },
  done:       { label: 'Done',        color: '#E8F5E9', dotColor: '#4CAF50', emoji: '✅', normalBg: '#f0fdf4' },
};

const PRIORITY_META: Record<Priority, { label: string; bg: string; color: string; emoji: string; normalBg: string; normalColor: string }> = {
  high: { label: 'High',   bg: '#FFDDE9', color: '#C2185B', emoji: '🌹', normalBg: '#fee2e2', normalColor: '#dc2626' },
  med:  { label: 'Medium', bg: '#FFF9C4', color: '#F57F17', emoji: '🌺', normalBg: '#fef3c7', normalColor: '#d97706' },
  low:  { label: 'Low',    bg: '#E8F5E9', color: '#2E7D32', emoji: '🌸', normalBg: '#dcfce7', normalColor: '#16a34a' },
};

const COLS: Column[] = ['backlog', 'inprogress', 'review', 'done'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ASSIGNEE_NAMES: Record<string, string> = { AL: 'Alice L.', BJ: 'Bob J.', MK: 'Maya K.', SR: 'Sam R.' };

function TaskCard({ task }: { task: Task }) {
  const { theme } = useTheme();
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const deleteTask = useTaskStore(s => s.deleteTask);
  const pm = PRIORITY_META[task.priority];

  const cardBg     = theme.kawaii ? '#FFF0F5' : theme.surface;
  const cardBorder = theme.kawaii ? '#FCE4EC' : theme.border;
  const titleColor = theme.kawaii ? '#3D1A2E' : theme.text;
  const pBg        = theme.kawaii ? pm.bg        : pm.normalBg;
  const pColor     = theme.kawaii ? pm.color      : pm.normalColor;
  const pLabel     = theme.kawaii ? `${pm.emoji} ${pm.label}` : pm.label;
  const dueDateColor = theme.kawaii ? '#AD6590' : theme.textSubtle;

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
        background: cardBg, border: `1.5px solid ${cardBorder}`,
        borderRadius: theme.radiusCard,
        padding: '0.9rem', cursor: 'grab', opacity: dragging ? 0.5 : 1,
        position: 'relative', transition: 'box-shadow 0.2s',
        boxShadow: dragging ? theme.shadowMd : 'none',
      }}
      whileHover={{ y: -2, boxShadow: theme.shadowMd, borderColor: theme.borderStrong }}
    >
      <AnimatePresence>
        {hovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
            onClick={e => { e.stopPropagation(); deleteTask(task.id); }}
            style={{
              position: 'absolute', top: 8, right: 8,
              width: 22, height: 22, borderRadius: theme.radiusSm,
              background: theme.kawaii ? '#FFE0EC' : '#fee2e2',
              border: `1.5px solid ${theme.kawaii ? '#F48FB1' : '#fca5a5'}`,
              color: theme.kawaii ? '#C2185B' : '#dc2626',
              fontSize: '0.75rem', fontWeight: 900,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1, zIndex: 2,
            }}
          >×</motion.button>
        )}
      </AnimatePresence>

      <div style={{ fontSize: '0.88rem', fontWeight: theme.labelWeight, color: titleColor, marginBottom: '0.5rem', lineHeight: 1.3, paddingRight: hovered ? 24 : 0 }}>
        {task.title}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: theme.radiusPill, background: pBg, color: pColor }}>
          {pLabel}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {task.dueDate && <span style={{ fontSize: '0.68rem', color: dueDateColor, fontWeight: 600 }}>{theme.kawaii ? '📅 ' : ''}{task.dueDate}</span>}
          <KawaiiAvatar initials={task.assignee} name={ASSIGNEE_NAMES[task.assignee]} size={26} />
        </div>
      </div>
    </motion.div>
  );
}

function KanbanView({ tasks }: { tasks: Task[] }) {
  const { theme } = useTheme();
  const moveTask = useTaskStore(s => s.moveTask);

  const onDrop = (e: React.DragEvent, col: Column) => {
    const id = e.dataTransfer.getData('taskId');
    if (id) moveTask(id, col);
    (e.currentTarget as HTMLElement).style.background = theme.surface;
  };

  return (
    <div style={{ display: 'flex', gap: '1.2rem', padding: '1.5rem', overflowX: 'auto', alignItems: 'flex-start', minHeight: 'calc(100vh - 130px)' }}>
      {COLS.map(col => {
        const meta = COL_META[col];
        const colTasks = tasks.filter(t => t.column === col);
        const headerBg = theme.kawaii ? meta.color : meta.normalBg;
        return (
          <div key={col}
            style={{ background: theme.surface, borderRadius: theme.radiusCard, border: `1.5px solid ${theme.border}`, minWidth: 250, maxWidth: 270, flexShrink: 0, overflow: 'hidden' }}
            onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLElement).style.background = theme.primarySoft; }}
            onDragLeave={e => (e.currentTarget as HTMLElement).style.background = theme.surface}
            onDrop={e => onDrop(e, col)}>
            <div style={{ padding: '0.85rem 1rem', borderBottom: `1.5px solid ${theme.border}`, background: headerBg, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: theme.labelWeight, color: theme.text }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: meta.dotColor }} />
                {theme.kawaii ? `${meta.emoji} ` : ''}{meta.label}
              </div>
              <div style={{ background: theme.kawaii ? '#FFF0F5' : theme.surface, borderRadius: theme.radiusPill, padding: '0.15rem 0.5rem', fontSize: '0.72rem', fontWeight: 700, color: theme.textSubtle }}>
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

interface CalendarNote { text: string; }

function CalendarView({ tasks }: { tasks: Task[] }) {
  const { theme } = useTheme();
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

  const dateStr = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const getTasksForDay = (day: number) => tasks.filter(t => t.dueDate === dateStr(day));
  const openDay = (day: number) => { const ds = dateStr(day); setSelectedDay(ds); setDraftText(notes[ds]?.text || ''); };
  const saveNote = () => {
    if (!selectedDay) return;
    if (draftText.trim()) setNotes(n => ({ ...n, [selectedDay]: { text: draftText.trim() } }));
    else setNotes(n => { const copy = { ...n }; delete copy[selectedDay]; return copy; });
    setSelectedDay(null);
  };
  const selectedDateLabel = selectedDay
    ? new Date(selectedDay + 'T00:00:00').toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: theme.headingWeight, color: theme.text }}>
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {['‹', '›'].map((ch, i) => (
            <button key={ch} onClick={() => setCurrentDate(new Date(year, month + (i === 0 ? -1 : 1)))}
              style={{ background: theme.primaryLight, border: 'none', width: 36, height: 36, borderRadius: theme.radiusPill, cursor: 'pointer', fontSize: '1rem', color: theme.primary }}>
              {ch}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.4rem' }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: theme.labelWeight, color: theme.textSubtle, padding: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d}</div>
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
                background: day ? theme.surface : 'transparent',
                borderRadius: theme.radiusMd,
                border: day ? `1.5px solid ${isToday ? theme.primary : theme.border}` : 'none',
                minHeight: 90, padding: '0.4rem 0.5rem',
                cursor: day ? 'pointer' : 'default',
                transition: 'background 0.15s, box-shadow 0.15s',
                boxShadow: isToday ? `0 0 0 2px ${theme.primary}33` : undefined,
              }}
              onMouseEnter={e => { if (day) (e.currentTarget as HTMLElement).style.background = theme.surfaceHover; }}
              onMouseLeave={e => { if (day) (e.currentTarget as HTMLElement).style.background = theme.surface; }}
            >
              {day && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: isToday ? theme.headingWeight : 700, color: isToday ? theme.primary : theme.textMuted }}>{day}</div>
                    {hasNote && <div style={{ fontSize: '0.6rem' }} title={notes[ds]!.text}>📝</div>}
                  </div>
                  {dayTasks.slice(0, 2).map(t => {
                    const pm = PRIORITY_META[t.priority];
                    return (
                      <div key={t.id} style={{ background: theme.kawaii ? pm.bg : pm.normalBg, color: theme.kawaii ? pm.color : pm.normalColor, borderRadius: theme.radiusPill, padding: '0.1rem 0.4rem', fontSize: '0.62rem', fontWeight: 700, marginBottom: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t.title}
                      </div>
                    );
                  })}
                  {dayTasks.length > 2 && <div style={{ fontSize: '0.6rem', color: theme.textSubtle, fontWeight: 700 }}>+{dayTasks.length - 2}</div>}
                  {hasNote && (
                    <div style={{ fontSize: '0.6rem', color: theme.textSubtle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3, marginTop: '0.1rem' }}>
                      {notes[ds]!.text}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedDay && (
          <div style={{ position: 'fixed', inset: 0, background: theme.kawaii ? 'rgba(61,26,46,0.4)' : 'rgba(0,0,0,0.4)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={() => setSelectedDay(null)}>
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              style={{ background: theme.surface, borderRadius: theme.radiusCard, padding: '1.6rem', width: '100%', maxWidth: 420, boxShadow: theme.shadowLg }}>
              <div style={{ fontSize: '1.1rem', fontWeight: theme.headingWeight, color: theme.primary, marginBottom: '0.25rem' }}>
                {theme.kawaii ? '📝 ' : ''}{selectedDateLabel}
              </div>
              <div style={{ fontSize: '0.78rem', color: theme.textMuted, marginBottom: '1rem' }}>Write a note or reminder for this day</div>
              <textarea
                autoFocus value={draftText} onChange={e => setDraftText(e.target.value)}
                placeholder={theme.kawaii ? "What's on your mind for this day? 🌸" : "Add a note for this day…"}
                rows={5}
                style={{
                  width: '100%', padding: '0.7rem 0.9rem',
                  border: `1.5px solid ${theme.borderStrong}`,
                  borderRadius: theme.radiusMd, fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem',
                  color: theme.text, background: theme.surfaceAlt, outline: 'none',
                  resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: '0.7rem', marginTop: '1rem' }}>
                <button onClick={() => setSelectedDay(null)} style={{ flex: 1, padding: '0.65rem', borderRadius: theme.radiusMd, border: `2px solid ${theme.border}`, background: theme.surface, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: 700, color: theme.textMuted }}>Cancel</button>
                <button onClick={saveNote} style={{ flex: 1, padding: '0.65rem', borderRadius: theme.radiusMd, border: 'none', background: theme.primary, color: 'white', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: theme.labelWeight }}>
                  {theme.kawaii ? 'Save Note ♡' : 'Save Note'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ListView({ tasks }: { tasks: Task[] }) {
  const { theme } = useTheme();
  const deleteTask = useTaskStore(s => s.deleteTask);
  const [sortBy, setSortBy] = useState<'title' | 'priority' | 'dueDate' | 'assignee'>('priority');
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  const sorted = [...tasks].sort((a, b) => {
    const va = a[sortBy] || '', vb = b[sortBy] || '';
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
              <th key={key} onClick={() => toggleSort(key as any)}
                style={{ fontSize: '0.73rem', fontWeight: theme.labelWeight, color: theme.textSubtle, padding: '0.5rem 1rem', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', userSelect: 'none' }}>
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
              const pBg    = theme.kawaii ? pm.bg        : pm.normalBg;
              const pColor  = theme.kawaii ? pm.color     : pm.normalColor;
              const pLabel  = theme.kawaii ? `${pm.emoji} ${pm.label}` : pm.label;
              const cColor  = cm.dotColor;
              const cLabel  = theme.kawaii ? `${cm.emoji} ${cm.label}` : cm.label;
              return (
                <motion.tr key={t.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  style={{ background: theme.surface, borderRadius: theme.radiusCard }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = theme.shadowMd}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}>
                  <td style={{ padding: '0.8rem 1rem', fontSize: '0.85rem', fontWeight: 600, color: theme.text, borderTop: `1.5px solid ${theme.border}`, borderBottom: `1.5px solid ${theme.border}`, borderLeft: `1.5px solid ${theme.border}`, borderRadius: `${theme.radiusMd}px 0 0 ${theme.radiusMd}px` }}>{t.title}</td>
                  <td style={{ padding: '0.8rem 1rem', borderTop: `1.5px solid ${theme.border}`, borderBottom: `1.5px solid ${theme.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <KawaiiAvatar initials={t.assignee} name={ASSIGNEE_NAMES[t.assignee]} size={28} />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: theme.textMuted }}>{ASSIGNEE_NAMES[t.assignee] || t.assignee}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.8rem 1rem', borderTop: `1.5px solid ${theme.border}`, borderBottom: `1.5px solid ${theme.border}` }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: theme.radiusPill, background: cColor + '18', color: cColor }}>{cLabel}</span>
                  </td>
                  <td style={{ padding: '0.8rem 1rem', borderTop: `1.5px solid ${theme.border}`, borderBottom: `1.5px solid ${theme.border}` }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: theme.radiusPill, background: pBg, color: pColor }}>{pLabel}</span>
                  </td>
                  <td style={{ padding: '0.8rem 1rem', fontSize: '0.8rem', fontWeight: 600, color: theme.textSubtle, borderTop: `1.5px solid ${theme.border}`, borderBottom: `1.5px solid ${theme.border}` }}>{t.dueDate || '—'}</td>
                  <td style={{ padding: '0.4rem 0.6rem', borderTop: `1.5px solid ${theme.border}`, borderBottom: `1.5px solid ${theme.border}`, borderRight: `1.5px solid ${theme.border}`, borderRadius: `0 ${theme.radiusMd}px ${theme.radiusMd}px 0` }}>
                    <button onClick={() => deleteTask(t.id)} title="Delete"
                      style={{ width: 28, height: 28, borderRadius: theme.radiusSm, background: theme.surfaceAlt, border: `1.5px solid ${theme.border}`, color: theme.kawaii ? '#C2185B' : '#dc2626', fontSize: '0.85rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#fee2e2'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = theme.surfaceAlt}>
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
        <div style={{ textAlign: 'center', padding: '3rem', color: theme.textSubtle, fontSize: '0.9rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{theme.kawaii ? '🌸' : '○'}</div>
          No tasks found.
        </div>
      )}
    </div>
  );
}

export default function TasksPage() {
  const { theme } = useTheme();
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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.9rem',
    border: `1.5px solid ${theme.borderStrong}`,
    borderRadius: theme.radiusMd, fontFamily: 'Nunito, sans-serif', fontSize: '0.9rem',
    color: theme.text, background: theme.surfaceAlt, outline: 'none',
    boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '0.78rem', fontWeight: theme.labelWeight, color: theme.textMuted,
    marginBottom: '0.35rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em',
  };

  return (
    <div style={{ paddingTop: 60, minHeight: '100vh', background: theme.bg }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{
        background: theme.surface, borderBottom: `1.5px solid ${theme.border}`,
        padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem',
        boxShadow: theme.kawaii ? 'none' : theme.shadow,
      }}>
        <div style={{ fontSize: '1.3rem', fontWeight: theme.headingWeight, color: theme.text, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {theme.kawaii ? '📋' : '▤'} Task Board
        </div>

        {/* Search + filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: theme.surfaceAlt, border: `1.5px solid ${theme.border}`, borderRadius: theme.radiusPill, padding: '0.35rem 0.8rem', fontSize: '0.85rem' }}>
            <span style={{ color: theme.textSubtle }}>⌕</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks…"
              style={{ background: 'transparent', border: 'none', outline: 'none', fontFamily: 'Nunito, sans-serif', color: theme.text, fontSize: '0.85rem', width: 140 }} />
          </div>
          {(['high', 'med', 'low'] as Priority[]).map(p => {
            const pm = PRIORITY_META[p];
            const active = filters.includes(p);
            return (
              <button key={p} onClick={() => toggleFilter(p)} style={{
                background: active ? (theme.kawaii ? pm.bg : pm.normalBg) : theme.surface,
                color: active ? (theme.kawaii ? pm.color : pm.normalColor) : theme.textMuted,
                border: `1.5px solid ${active ? (theme.kawaii ? pm.color : pm.normalColor) : theme.border}`,
                borderRadius: theme.radiusPill, padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Nunito, sans-serif',
              }}>
                {theme.kawaii ? `${pm.emoji} ${pm.label}` : pm.label}
              </button>
            );
          })}
        </div>

        {/* View toggle + add */}
        <div style={{ display: 'flex', gap: '0.7rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', background: theme.surfaceAlt, borderRadius: theme.radiusPill, padding: '0.25rem', gap: '0.2rem', border: `1.5px solid ${theme.border}` }}>
            {['kanban', 'calendar', 'list'].map(v => (
              <button key={v} onClick={() => setView(v as any)} style={{
                padding: '0.35rem 0.9rem', borderRadius: theme.radiusPill, border: 'none', cursor: 'pointer',
                fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.8rem',
                background: view === v ? theme.primary : 'transparent',
                color: view === v ? 'white' : theme.textMuted, transition: 'all 0.2s',
              }}>
                {theme.kawaii
                  ? (v === 'kanban' ? '📌 Kanban' : v === 'calendar' ? '📅 Calendar' : '☰ List')
                  : (v === 'kanban' ? 'Kanban' : v === 'calendar' ? 'Calendar' : 'List')}
              </button>
            ))}
          </div>
          <button onClick={() => setShowModal(true)} style={{
            background: theme.primary, color: 'white', border: 'none',
            borderRadius: theme.radiusPill, padding: '0.45rem 1.1rem', cursor: 'pointer',
            fontFamily: 'Nunito, sans-serif', fontWeight: theme.labelWeight, fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', gap: '0.3rem', transition: 'all 0.2s',
            boxShadow: theme.shadow,
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = theme.primaryHover}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = theme.primary}
          >+ Add Task</button>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {view === 'kanban'   && <KanbanView tasks={filtered} />}
      {view === 'calendar' && <CalendarView tasks={filtered} />}
      {view === 'list'     && <ListView tasks={filtered} />}

      {/* ── Add Task Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, background: theme.kawaii ? 'rgba(61,26,46,0.45)' : 'rgba(0,0,0,0.45)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              style={{ background: theme.surface, borderRadius: theme.radiusCard, padding: '1.8rem', width: '100%', maxWidth: 480, boxShadow: theme.shadowLg }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: theme.headingWeight, color: theme.text, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {theme.kawaii ? '📌 Add New Task' : '+ New Task'}
              </h3>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Task Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder={theme.kawaii ? "What needs doing? 🌸" : "What needs doing?"}
                  style={inputStyle}
                  onKeyDown={e => e.key === 'Enter' && submit()} autoFocus />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))} style={inputStyle}>
                    <option value="high">{theme.kawaii ? '🌹 High' : 'High'}</option>
                    <option value="med">{theme.kawaii ? '🌺 Medium' : 'Medium'}</option>
                    <option value="low">{theme.kawaii ? '🌸 Low' : 'Low'}</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Column</label>
                  <select value={form.column} onChange={e => setForm(f => ({ ...f, column: e.target.value as Column }))} style={inputStyle}>
                    {COLS.map(c => <option key={c} value={c}>{COL_META[c].label}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '1.4rem' }}>
                <div>
                  <label style={labelStyle}>Assignee</label>
                  <select value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))} style={inputStyle}>
                    {Object.entries(ASSIGNEE_NAMES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} style={inputStyle} />
                </div>
              </div>

              {/* Assignee preview */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.4rem', padding: '0.8rem', background: theme.surfaceAlt, borderRadius: theme.radiusMd, border: `1px solid ${theme.border}` }}>
                <KawaiiAvatar initials={form.assignee} name={ASSIGNEE_NAMES[form.assignee]} size={36} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: theme.labelWeight, color: theme.text }}>{ASSIGNEE_NAMES[form.assignee]}</div>
                  <div style={{ fontSize: '0.72rem', color: theme.textSubtle }}>Assignee</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.7rem' }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.65rem', borderRadius: theme.radiusMd, border: `2px solid ${theme.border}`, background: theme.surface, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: 700, color: theme.textMuted, transition: 'border-color 0.2s' }}>
                  Cancel
                </button>
                <button onClick={submit} style={{ flex: 1, padding: '0.65rem', borderRadius: theme.radiusMd, border: 'none', background: theme.primary, color: 'white', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: theme.labelWeight, transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = theme.primaryHover}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = theme.primary}>
                  {theme.kawaii ? 'Add Task ♡' : 'Add Task'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
