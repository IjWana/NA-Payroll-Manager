import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';
import { Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-gray-200 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
