import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck, FileText, Wallet, Clock, LogOut } from 'lucide-react';
import { logout } from '../services/auth/storage';

const navItems = [
  { path: '/employer', label: 'Vue d\'ensemble', icon: <LayoutDashboard className="w-4 h-4" /> },
  { path: '/employer/mes-reservations', label: 'Mes réservations', icon: <CalendarCheck className="w-4 h-4" /> },
  { path: '/employer/mes-demandes', label: 'Mes demandes', icon: <FileText className="w-4 h-4" /> },
  { path: '/employer/budgets', label: 'Budgets', icon: <Wallet className="w-4 h-4" /> },
  { path: '/employer/historique', label: 'Historique', icon: <Clock className="w-4 h-4" /> },
];

export default function EmployerLayout() {
  return (
    <div className="flex flex-col min-h-svh">
      <header className="flex items-center justify-between px-6 h-16 bg-white border-b border-[#A5A6A5] shadow-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#A11B1B] text-white font-bold text-sm">
            EV
          </span>
          <span className="text-[#565556] font-semibold text-base tracking-tight">
            Eazy Visa <span className="text-[#A5A6A5] font-normal">— Employé</span>
          </span>
        </div>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/employer'}
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
            EM
          </div>
          <button
            onClick={() => {
              logout();
              window.location.href = '/connexion';
            }}
            className="p-2 rounded-md text-[#A5A6A5] hover:text-[#A11B1B] hover:bg-[#A11B1B]/10 transition-colors duration-200"
            title="Déconnexion"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>
      <main className="flex-1 p-6 bg-[#f8f8f8]">
        <Outlet />
      </main>
    </div>
  );
}
