import { UserCircle2, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSearch } from '../context/SearchContext.jsx';
import { useEffect, useRef, useState } from 'react';
import { useNotifications } from '../context/NotificationsContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export function Topbar(props) {
  const location = useLocation();
  const { query, setQuery, clear } = useSearch();

  // notifications from context
  const { notifications: items, unreadCount: unread, markAllRead, markRead } = useNotifications();
  const { user } = useAuth() || {};

  // local UI state
  const [open, setOpen] = useState(false);
  const bellRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!open) return;
      const b = bellRef.current;
      const p = panelRef.current;
      if (p && !p.contains(e.target) && b && !b.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const segment = location.pathname.split('/').filter(Boolean)[0] || 'dashboard';
  const human = (s) => {
    const r = s.replace(/-/g, ' ');
    return r.charAt(0).toUpperCase() + r.slice(1);
  };
  const resolvedTitle =
    segment === 'dashboard'
      ? 'Dashboard Overview'
      : segment === 'staff'
      ? 'Our Staffs'
      : human(segment);

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      {/* LEFT: greeting + page title */}
      <div className="flex items-center gap-4">
        <div>
          <p className="text-sm text-gray-500">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''},
          </p>
          <h1 className="text-lg font-semibold text-gray-800">{resolvedTitle}</h1>
        </div>
      </div>

      {/* RIGHT: search + notifications + user */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative w-64">
          <label htmlFor="topbar-search" className="sr-only">Search</label>
          <input
            id="topbar-search"
            type="search"
            placeholder="Search staff and runs..."
            className="w-full rounded-full border border-gray-300 pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <svg
            className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={clear}
              className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>

        {/* Notifications + Dropdown */}
        <div className="relative space-x-5">
          <button
            ref={bellRef}
            type="button"
            aria-label="Notifications"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen(o => !o)}
            className="relative border p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Bell size={18} className="text-gray-600" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>

          {open && (
            <div
              ref={panelRef}
              role="menu"
              className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg"
            >
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <span className="text-sm font-medium">Notifications</span>
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Mark all as read
                </button>
              </div>

              {items.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">No notifications</div>
              ) : (
                <ul className="max-h-80 overflow-auto py-1">
                  {items.map(item => (
                    <li
                      key={item.id}
                      className={`flex gap-3 px-3 py-2 hover:bg-gray-50 ${item.read ? 'opacity-80' : ''}`}
                      onClick={() => markRead(item.id)}
                    >
                      <span
                        className={`mt-1 h-2 w-2 rounded-full ${item.read ? 'bg-gray-300' : 'bg-indigo-600'}`}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-800">{item.title}</p>
                        <p className="truncate text-xs text-gray-500">{item.desc}</p>
                      </div>
                      <span className="text-xs text-gray-400">{item.time}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">{user?.name || 'Admin User'}</p>
            <p className="text-xs text-gray-500">{user?.role || 'Payroll Officer'}</p>
          </div>
          <UserCircle2 size={32} className="text-gray-600" />
        </div>
      </div>
    </header>
  );
}
