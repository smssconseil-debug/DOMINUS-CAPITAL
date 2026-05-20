import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { BarChart3, Info, Mail } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Sobre from './pages/Sobre';
import Contato from './pages/Contato';

function App() {
  return (
    <div className="dark min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-[#d4af37]/30">
      <nav className="sticky top-0 z-50 border-b border-[#d4af37]/20 bg-[#0a0a0a]/95 backdrop-blur px-4 py-3">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-black tracking-[0.18em] text-[#d4af37] sm:text-base">DOMINUS CAPITAL</span>
          <div className="flex flex-wrap gap-2">
            <NavItem to="/" label="Painel" icon={BarChart3} />
            <NavItem to="/sobre" label="Sobre" icon={Info} />
            <NavItem to="/contato" label="Contato" icon={Mail} />
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function NavItem({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-widest transition-all sm:text-[11px] ${
          isActive
            ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#f9e596]'
            : 'border-white/10 bg-[#111] text-gray-300 hover:border-[#d4af37]/40 hover:text-white'
        }`
      }
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  );
}

export default App;
