import { UserCircle2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function Topbar() {
  const location = useLocation();
  const pathName = location.pathname.replace('/', '') || 'dashboard';
  const title = pathName.charAt(0).toUpperCase() + pathName.slice(1);

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium">Admin User</p>
          <p className="text-xs text-gray-500">Payroll Officer</p>
        </div>
        <UserCircle2 size={32} className="text-gray-600" />
      </div>
    </header>
  );
}
