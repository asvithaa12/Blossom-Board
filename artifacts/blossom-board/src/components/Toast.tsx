import { useEffect, useState } from 'react';

export interface ToastData {
  id: string;
  message: string;
  icon?: string;
  type?: 'success' | 'info' | 'error';
}

let toastListeners: Array<(t: ToastData) => void> = [];

export function showToast(message: string, icon?: string, type?: ToastData['type']) {
  const t: ToastData = { id: Math.random().toString(36).slice(2), message, icon, type };
  toastListeners.forEach(l => l(t));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const listener = (t: ToastData) => {
      setToasts(prev => [...prev, t]);
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 3000);
    };
    toastListeners.push(listener);
    return () => { toastListeners = toastListeners.filter(l => l !== listener); };
  }, []);

  return (
    <div style={{ position: 'fixed', top: 72, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: 'white', border: '1.5px solid #FCE4EC',
          borderRadius: 14, padding: '10px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 4px 24px rgba(233,30,140,0.15)',
          animation: 'slideInRight 0.3s ease',
          fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.85rem',
          color: '#3D1A2E', minWidth: 200,
        }}>
          {t.icon && <span>{t.icon}</span>}
          {t.message}
        </div>
      ))}
    </div>
  );
}
