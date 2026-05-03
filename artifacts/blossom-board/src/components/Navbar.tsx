import { useState } from 'react';
import ChatBot from './ChatBot';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [hov, setHov] = useState(false);
  const on = theme.kawaii;

  return (
    <button
      onClick={toggleTheme}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={on ? 'Switch to Normal UI' : 'Switch to Kawaii UI'}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.42rem',
        padding: '0.28rem 0.72rem 0.28rem 0.48rem',
        borderRadius: 50,
        border: `1.5px solid ${on ? '#F48FB1' : '#cbd5e1'}`,
        background: on
          ? (hov ? '#FCE4EC' : 'white')
          : (hov ? '#f1f5f9' : 'white'),
        cursor: 'pointer',
        transition: 'all 0.22s',
        flexShrink: 0,
        boxShadow: on ? '0 2px 8px rgba(233,30,140,0.10)' : '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <span style={{
        display: 'inline-flex', alignItems: 'center',
        width: 34, height: 18, borderRadius: 50,
        background: on ? '#E91E8C' : '#cbd5e1',
        position: 'relative', transition: 'background 0.25s', flexShrink: 0,
      }}>
        <span style={{
          position: 'absolute',
          left: on ? 18 : 2,
          width: 14, height: 14, borderRadius: '50%',
          background: 'white',
          boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
          transition: 'left 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        }} />
      </span>
      <span style={{
        fontSize: '0.72rem', fontWeight: 700,
        color: on ? '#E91E8C' : '#64748b',
        whiteSpace: 'nowrap', transition: 'color 0.22s',
        fontFamily: 'Nunito, sans-serif',
      }}>
        {on ? '🌸 Kawaii' : '☁ Classic'}
      </span>
    </button>
  );
}

export default function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const { theme } = useTheme();

  const navLinks = theme.kawaii
    ? [
        { id: 'landing', label: '🏠 Home' },
        { id: 'board',   label: '✏️ Whiteboard' },
        { id: 'tasks',   label: '📋 Tasks' },
      ]
    : [
        { id: 'landing', label: 'Home' },
        { id: 'board',   label: 'Whiteboard' },
        { id: 'tasks',   label: 'Tasks' },
      ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      /* Solid opaque background — no blur, no haze */
      background: theme.kawaii ? '#FFF0F5' : '#ffffff',
      borderBottom: `1.5px solid ${theme.navBorder}`,
      padding: '0 1.2rem', height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '0.5rem',
      transition: 'background 0.35s, border-color 0.35s',
      boxShadow: theme.kawaii
        ? '0 1px 0 #F48FB144'
        : '0 1px 3px rgba(0,0,0,0.07)',
    }}>
      {/* Logo */}
      <div
        onClick={() => onNavigate('landing')}
        style={{
          fontSize: '1.2rem', fontWeight: theme.headingWeight,
          color: theme.primary,
          display: 'flex', alignItems: 'center', gap: '0.3rem',
          cursor: 'pointer', userSelect: 'none', flexShrink: 0,
        }}
      >
        {theme.kawaii ? '🌸' : '◈'}
        <span>Blossom Board</span>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: '0.15rem' }}>
        {navLinks.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            style={{
              padding: '0.38rem 0.9rem',
              borderRadius: theme.radiusPill,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: theme.labelWeight,
              fontSize: '0.82rem',
              transition: 'all 0.2s',
              background: currentPage === id ? theme.primary : 'transparent',
              color: currentPage === id ? 'white' : theme.textMuted,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
        <ThemeToggle />
        {theme.kawaii && <ChatBot />}
        <button
          onClick={() => onNavigate('board')}
          style={{
            background: theme.primary, color: 'white',
            padding: '0.4rem 1.1rem',
            borderRadius: theme.radiusPill,
            border: 'none', cursor: 'pointer',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: theme.labelWeight, fontSize: '0.83rem',
            transition: 'all 0.2s',
            boxShadow: theme.shadow,
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = theme.primaryHover;
            (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = theme.primary;
            (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
          }}
        >
          {theme.kawaii ? 'Open Board ♡' : 'Open Board'}
        </button>
      </div>
    </nav>
  );
}
