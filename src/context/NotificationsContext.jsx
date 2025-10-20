import { createContext, useContext, useMemo, useState } from 'react';

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children, initial = [] }) {
  const [notifications, setNotifications] = useState(initial);

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );

  const add = (n) => {
    const id = n.id ?? `n_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    setNotifications(prev => [{ ...n, id, read: !!n.read }, ...prev]);
  };

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const remove = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, add, markRead, markAllRead, remove }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationsProvider');
  return ctx;
}