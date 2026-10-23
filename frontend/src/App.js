import { useId } from 'react';
import { ArrowRight } from 'lucide-react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Sobre from './pages/Sobre';
import Contato from './pages/Contato';

const navItems = [
  { id: 'produtos', label: 'Robôs' },
  { id: 'servicos', label: 'Conceitos' },
  { id: 'resultados', label: 'Resultados' },
  { id: 'filosofia', label: 'Riscos' },
];

function App() {
  return (
    <div className="dark min-h-screen bg-[#050505] text-[#f7f2e8] font-sans selection:bg-[#d4af37]/30">
      <nav className="sticky top-0 z-50 border-b border-[#d4af37]/15 bg-[#050505]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-6">
          <a href="/#topo" className="flex items-center gap-3">
            <DominusLogo className="h-12 w-12 shrink-0" />
            <div className="leading-none">
              <div className="text-2xl font-semibold uppercase tracking-[0.18em] text-[#d4af37]">Dominus</div>
              <div className="mt-1 text-sm uppercase tracking-[0.6em] text-[#f5efe2]">Capital</div>
            </div>
          </a>

          <div className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`/#${item.id}`}
                className="border-b border-transparent px-1 pb-3 text-sm uppercase tracking-[0.08em] text-[#f5efe2] transition-colors hover:border-[#d4af37] hover:text-[#d4af37]"
              >
                {item.label}
              </a>
            ))}
          </div>

          <a
            href="/#produtos"
            className="inline-flex items-center gap-2 rounded-xl border border-[#d4af37]/40 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#d4af37] transition hover:border-[#d4af37] hover:bg-[#d4af37]/10 sm:text-sm"
          >
            Saiba mais
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="flex items-center gap-6 overflow-x-auto px-4 pb-3 lg:hidden">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`/#${item.id}`}
              className="shrink-0 text-xs uppercase tracking-[0.08em] text-[#f5efe2] transition-colors hover:text-[#d4af37]"
            >
              {item.label}
            </a>
          ))}
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

function DominusLogo({ className = '' }) {
  const gradientRef = `dominus-gold-${useId().replace(/[^a-zA-Z0-9-_]/g, '')}`;

  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={gradientRef} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5d37a" />
          <stop offset="55%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#9c6f19" />
        </linearGradient>
      </defs>
      <path
        d="M32 4 50 10v18c0 13.16-7.97 24.91-20 29.52C17.97 52.91 10 41.16 10 28V10z"
        fill="none"
        stroke={`url(#${gradientRef})`}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M32 15v22" fill="none" stroke={`url(#${gradientRef})`} strokeWidth="3" strokeLinecap="round" />
      <path d="M22 20v18" fill="none" stroke={`url(#${gradientRef})`} strokeWidth="3" strokeLinecap="round" />
      <path d="M42 20v18" fill="none" stroke={`url(#${gradientRef})`} strokeWidth="3" strokeLinecap="round" />
      <path d="M21 22l22 15" fill="none" stroke={`url(#${gradientRef})`} strokeWidth="3" strokeLinecap="round" />
      <path d="M43 22 21 37" fill="none" stroke={`url(#${gradientRef})`} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default App;
