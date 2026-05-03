import { useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import WhiteboardPage from './pages/WhiteboardPage';
import TasksPage from './pages/TasksPage';
import ToastContainer from './components/Toast';

export default function App() {
  const [page, setPage] = useState<'landing' | 'board' | 'tasks'>('landing');

  return (
    <div style={{ minHeight: '100vh', background: '#FFF0F5', fontFamily: 'Nunito, sans-serif' }}>
      <Navbar onNavigate={(p) => setPage(p as any)} currentPage={page} />
      {page === 'landing' && <LandingPage onNavigate={(p) => setPage(p as any)} />}
      {page === 'board' && <WhiteboardPage onNavigate={(p) => setPage(p as any)} />}
      {page === 'tasks' && <TasksPage />}
      <ToastContainer />
    </div>
  );
}
