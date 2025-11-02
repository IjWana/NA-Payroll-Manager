import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';
import { Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="flex w-full h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
          <main className="flex-1 p-4 overflow-y-auto bg-gray-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
