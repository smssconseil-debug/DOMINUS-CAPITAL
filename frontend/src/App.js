import { Lock } from 'lucide-react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Sobre from './pages/Sobre';
import Contato from './pages/Contato';

const navItems = [
  { id: 'estrutura', label: 'Estrutura' },
  { id: 'filosofia', label: 'Filosofia' },
  { id: 'tecnologia', label: 'Tecnologia' },
  { id: 'gestao-risco', label: 'Gestão de Risco' },
  { id: 'resultados', label: 'Resultados', active: true },
];

function App() {
  return (
    <div className="dark min-h-screen bg-[#040e1c] text-[#dce0ec] font-sans selection:bg-[#4a6898]/30">
      <nav className="sticky top-0 z-50 border-b border-[#3a5878]/20 bg-[#040e1c]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-6">
          <a href="/#topo" className="flex items-center gap-3">
            <img src="/logo.png" alt="Dominus Capital" className="h-12 w-12 shrink-0 object-contain" />
            <div className="leading-none">
              <div className="text-2xl font-semibold uppercase tracking-[0.18em] text-[#dce0ec]" style={{ fontFamily: "'Cinzel', serif" }}>Dominus</div>
              <div className="mt-1 text-sm uppercase tracking-[0.6em] text-[#9098b0]" style={{ fontFamily: "'Cinzel', serif" }}>Capital</div>
            </div>
          </a>

          <div className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`/#${item.id}`}
                className={`border-b px-1 pb-3 text-sm uppercase tracking-[0.08em] transition-colors ${
                  item.active
                    ? 'border-[#9ab0cc] text-[#9ab0cc]'
                    : 'border-transparent text-[#9098b0] hover:text-[#dce0ec]'
                }`}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {item.label}
              </a>
            ))}
          </div>

          <a
            href="/#acesso"
            className="inline-flex items-center gap-2 rounded-xl border border-[#4a6898]/50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#9ab0cc] transition hover:border-[#9ab0cc] hover:bg-[#4a6898]/15 sm:text-sm"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            <Lock className="h-4 w-4" />
            Solicitar acesso
          </a>
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

export default App;
