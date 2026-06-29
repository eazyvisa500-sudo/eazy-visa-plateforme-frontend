import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, BarChart3, CalendarCheck, Wallet } from 'lucide-react';

const navItems = [
  { path: '/admin', label: 'Vue d\'ensemble', icon: <LayoutDashboard className="w-4 h-4" /> },
  { path: '/admin/employers', label: 'Employers', icon: <Users className="w-4 h-4" /> },
  { path: '/admin/demandes', label: 'Demandes', icon: <FileText className="w-4 h-4" /> },
  { path: '/admin/analytiques', label: 'Analytiques', icon: <BarChart3 className="w-4 h-4" /> },
  { path: '/admin/reservation', label: 'Réservation', icon: <CalendarCheck className="w-4 h-4" /> },
  { path: '/admin/budgets', label: 'Budgets', icon: <Wallet className="w-4 h-4" /> },
];

export default function AdminLayout() {
  return (
    <div className="flex flex-col min-h-svh">
      <header className="flex items-center justify-between px-6 h-16 bg-white border-b border-[#A5A6A5] shadow-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#A11B1B] text-white font-bold text-sm">
            EV
          </span>
          <span className="text-[#565556] font-semibold text-base tracking-tight">
            Eazy Visa <span className="text-[#A5A6A5] font-normal">— Admin</span>
          </span>
        </div>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-[rgba(161,27,27,0.1)] text-[#A11B1B]'
                    : 'text-[#565556] hover:bg-[#f4f4f4] hover:text-[#565556]'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#A11B1B]/10 flex items-center justify-center text-[#A11B1B] font-semibold text-xs">
            AD
          </div>
        </div>
      </header>
      <main className="flex-1 p-6 bg-[#f8f8f8]">
        <Outlet />
      </main>
    </div>
  );
}
