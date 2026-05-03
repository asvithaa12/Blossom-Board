import { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import WhiteboardPage from './pages/WhiteboardPage';
import TasksPage from './pages/TasksPage';
import ToastContainer from './components/Toast';

function AppInner() {
  const [page, setPage] = useState<'landing' | 'board' | 'tasks'>('landing');
  const { theme } = useTheme();

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, fontFamily: 'Nunito, sans-serif', transition: 'background 0.35s' }}>
      <Navbar onNavigate={(p) => setPage(p as any)} currentPage={page} />
      {page === 'landing' && <LandingPage onNavigate={(p) => setPage(p as any)} />}
      {page === 'board'   && <WhiteboardPage onNavigate={(p) => setPage(p as any)} />}
      {page === 'tasks'   && <TasksPage />}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
