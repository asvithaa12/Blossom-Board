import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: number;
  role: 'bot' | 'user';
  text: string;
}

const BOT_RESPONSES: Array<{ patterns: string[]; answer: string }> = [
  { patterns: ['draw', 'pen', 'sketch', 'freehand'], answer: 'Select the ✏️ Pen tool (P key) and start drawing on the board! You can change colour and stroke width in the left toolbar 🌸' },
  { patterns: ['shape', 'rect', 'rectangle', 'circle', 'ellipse'], answer: 'Use the shape tools: ▭ Rect (R), ◯ Ellipse (O), ╱ Line (L), or → Arrow (A). Click and drag to draw. Hold Shift for perfect squares & circles! ✨' },
  { patterns: ['sticky', 'note', 'post', 'pin'], answer: 'Press S on your keyboard or click the 📌 sticky note button to pop a cute sticky note onto the board! You can pick colours and add emojis 🌸' },
  { patterns: ['undo', 'redo', 'mistake'], answer: 'Press Ctrl+Z to undo and Ctrl+Y to redo. You have a full 50-step history — no mistake is permanent! ↩️' },
  { patterns: ['save', 'export', 'download', 'screenshot'], answer: 'Click 💾 Export in the toolbar or press Ctrl+Shift+E to download your board as a PNG. Use 📤 Share to copy it to clipboard! 🌸' },
  { patterns: ['zoom', 'pan', 'move', 'navigate', 'scroll'], answer: 'Scroll to pan, Ctrl+Scroll to zoom, or press H to grab the pan tool. Press F to fit everything on screen! 🔍' },
  { patterns: ['task', 'kanban', 'calendar', 'todo', 'list'], answer: 'Click Tasks in the navbar to open the full task manager! You get Kanban, Calendar, and List views with drag-and-drop 📋' },
  { patterns: ['colour', 'color', 'theme', 'pink'], answer: 'Click the colour circle in the left toolbar to open the colour picker. 16 presets + any custom hex or colour wheel! 🎨' },
  { patterns: ['shortcut', 'keyboard', 'hotkey', 'key'], answer: 'V=Select, P=Pen, R=Rect, O=Ellipse, L=Line, A=Arrow, S=Sticky, H=Pan, T=Text, F=Fit, Ctrl+Z=Undo, Delete=Remove 🌸' },
  { patterns: ['delete', 'remove', 'erase', 'clear'], answer: 'Select an element and press Delete/Backspace. Use the 🧹 Eraser tool to erase by clicking. Or 🗑️ in toolbar to clear everything!' },
  { patterns: ['collab', 'cursor', 'ghost', 'friend', 'team'], answer: 'The cute ghost cursors roaming the board are Alice, Bob, Maya, and Sam — your mock collaborators! Check the activity feed on the right 👥' },
  { patterns: ['help', 'what', 'how', 'hi', 'hello', 'hey'], answer: 'Hii! 🌸 I\'m Blossom, your whiteboard helper! I can help with drawing tools, shapes, sticky notes, keyboard shortcuts, exporting, and more. What would you like to know? ✨' },
];

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const r of BOT_RESPONSES) {
    if (r.patterns.some(p => lower.includes(p))) return r.answer;
  }
  return "Hmm, I'm not sure about that! 🌸 Try asking about drawing, shapes, sticky notes, shortcuts, saving, or tasks. I\'m here to help! ✨";
}

let msgId = 0;

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: msgId++, role: 'bot', text: 'Hii! 🌸 I\'m Blossom, your whiteboard assistant! Ask me anything about the app — drawing, tools, shortcuts, tasks, you name it ✨' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    const userMsg: Message = { id: msgId++, role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { id: msgId++, role: 'bot', text: getResponse(text) }]);
    }, 700 + Math.random() * 400);
  };

  return (
    <>
      {/* Ghost button */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(o => !o)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          style={{
            background: open ? '#E91E8C' : showTooltip ? '#FCE4EC' : 'white',
            border: '2px solid #F48FB1',
            borderRadius: '50%',
            width: 42, height: 42,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem',
            boxShadow: '0 2px 12px rgba(233,30,140,0.2)',
            transition: 'all 0.2s',
            position: 'relative',
          }}
        >
          <span style={{ filter: open ? 'brightness(100)' : undefined }}>👻</span>
          {/* Online dot */}
          <div style={{ position: 'absolute', top: 2, right: 2, width: 10, height: 10, background: '#4CAF50', borderRadius: '50%', border: '2px solid white' }} />
        </button>

        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && !open && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute', top: '110%', right: 0,
                background: 'white', border: '1.5px solid #FCE4EC',
                borderRadius: 12, padding: '0.5rem 0.9rem',
                fontSize: '0.8rem', fontWeight: 700, color: '#3D1A2E',
                whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(233,30,140,0.15)',
                zIndex: 2000,
              }}
            >
              👋 Hii! How can I help you?
              <div style={{ position: 'absolute', top: -6, right: 14, width: 10, height: 10, background: 'white', border: '1.5px solid #FCE4EC', borderRight: 'none', borderBottom: 'none', transform: 'rotate(45deg)' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={{
              position: 'fixed',
              top: 68, right: 16,
              width: 320, height: 440,
              background: 'white',
              border: '1.5px solid #FCE4EC',
              borderRadius: 24,
              boxShadow: '0 12px 48px rgba(233,30,140,0.22)',
              display: 'flex', flexDirection: 'column',
              zIndex: 5000,
              fontFamily: 'Nunito, sans-serif',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg,#E91E8C,#c4177a)', padding: '0.9rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <div style={{ fontSize: '1.6rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>👻</div>
              <div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: '0.95rem' }}>Blossom Assistant</div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 6, height: 6, background: '#4CAF50', borderRadius: '50%' }} />
                  Online · here to help 🌸
                </div>
              </div>
              <button onClick={() => setOpen(false)} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.25)', border: 'none', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', color: 'white', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {messages.map(msg => (
                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '0.4rem', alignItems: 'flex-end' }}>
                  {msg.role === 'bot' && (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#E91E8C,#c4177a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>👻</div>
                  )}
                  <div style={{
                    maxWidth: '75%',
                    background: msg.role === 'bot' ? '#FFF0F5' : '#E91E8C',
                    color: msg.role === 'bot' ? '#3D1A2E' : 'white',
                    padding: '0.55rem 0.85rem',
                    borderRadius: msg.role === 'bot' ? '14px 14px 14px 4px' : '14px 14px 4px 14px',
                    fontSize: '0.83rem', fontWeight: 600, lineHeight: 1.5,
                    border: msg.role === 'bot' ? '1.5px solid #FCE4EC' : 'none',
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.4rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#E91E8C,#c4177a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>👻</div>
                  <div style={{ background: '#FFF0F5', border: '1.5px solid #FCE4EC', borderRadius: '14px 14px 14px 4px', padding: '0.55rem 0.9rem', display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#F48FB1', animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggested chips */}
            <div style={{ padding: '0 0.8rem 0.5rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['Drawing tools', 'Shortcuts', 'Export board'].map(s => (
                <button key={s} onClick={() => { setInput(s); }}
                  style={{ background: '#FFF0F5', border: '1.5px solid #FCE4EC', borderRadius: 50, padding: '0.2rem 0.65rem', fontSize: '0.7rem', fontWeight: 700, color: '#E91E8C', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', transition: 'all 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FCE4EC')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#FFF0F5')}>
                  {s}
                </button>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: '0 0.8rem 0.8rem', display: 'flex', gap: '0.5rem' }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') send(); }}
                placeholder="Ask anything about the board…"
                style={{
                  flex: 1, padding: '0.55rem 0.85rem',
                  border: '1.5px solid #F48FB1', borderRadius: 50,
                  fontFamily: 'Nunito, sans-serif', fontSize: '0.82rem',
                  color: '#3D1A2E', background: '#FFF0F5', outline: 'none',
                }}
              />
              <button onClick={send} style={{ width: 36, height: 36, borderRadius: '50%', background: '#E91E8C', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0, boxShadow: '0 2px 10px rgba(233,30,140,0.3)' }}>
                ➤
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
