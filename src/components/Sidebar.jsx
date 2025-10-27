import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Wallet, FileBarChart2, FileStack } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/personnel', label: 'Personnel Management', icon: Users },
  { to: '/payroll', label: 'Payroll', icon: Wallet },
  { to: '/reports', label: 'Reports Analytics', icon: FileBarChart2 },
  { to: '/history', label: 'Payroll History', icon: FileStack },
  
];

export function Sidebar() {
  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-20 flex items-center px-4 font-bold text-army-green border-b"> <img src="/Icons/NAFC_Logo.svg" alt="NAFC logo" className=' h-20 w-20 animate-pulse duration-1000 ease-in-out delay-500' /></div>
      <nav className="flex-1 overflow-y-auto py-3">
        <ul className="space-y-1 px-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors border border-transparent ${
                    isActive
                      ? 'bg-army-green/50 text-army-green border-army-green/20'
                      : 'text-black hover:bg-gray-200'
                  }`
                }
              >
                <Icon size={18} color='blue' />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-3 text-xs text-gray-500 border-t">&copy; {new Date().getFullYear()} Nigerian Army</div>
    </aside>
  );
}
