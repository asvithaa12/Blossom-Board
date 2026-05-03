import { useLocation, useRoute } from 'wouter';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Navbar({ onNavigate, currentPage }: NavbarProps) {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(255,240,245,0.92)', backdropFilter: 'blur(16px)',
      borderBottom: '1.5px solid #F48FB1',
      padding: '0 1.5rem', height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div
        onClick={() => onNavigate('landing')}
        style={{ fontSize: '1.35rem', fontWeight: 900, color: '#E91E8C', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', userSelect: 'none' }}
      >
        🌸 <span>Blossom Board</span>
      </div>

      <div style={{ display: 'flex', gap: '0.2rem' }}>
        {[
          { id: 'landing', label: '🏠 Home' },
          { id: 'board', label: '✏️ Whiteboard' },
          { id: 'tasks', label: '📋 Tasks' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            style={{
              padding: '0.38rem 1rem',
              borderRadius: 50,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Nunito, sans-serif',
              fontWeight: 700,
              fontSize: '0.84rem',
              transition: 'all 0.2s',
              background: currentPage === id ? '#E91E8C' : 'transparent',
              color: currentPage === id ? 'white' : '#7B3F6E',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        onClick={() => onNavigate('board')}
        style={{
          background: '#E91E8C', color: 'white',
          padding: '0.4rem 1.2rem',
          borderRadius: 50, border: 'none', cursor: 'pointer',
          fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: '0.85rem',
          transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(233,30,140,0.3)',
        }}
        onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'scale(1.05)'; }}
        onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'scale(1)'; }}
      >
        Open Board ♡
      </button>
    </nav>
  );
}
