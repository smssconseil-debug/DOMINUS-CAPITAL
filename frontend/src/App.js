import { useEffect, useId } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link, Navigate, NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Sobre from './pages/Sobre';
import Contato from './pages/Contato';

const navItems = [
  { path: '/conceitos', label: 'Conceitos' },
  { path: '/resultados', label: 'Resultados' },
  { path: '/riscos', label: 'Riscos' },
];

function App() {
  return (
    <div className="dark min-h-screen bg-[#050505] text-[#f7f2e8] font-sans selection:bg-[#d4af37]/30">
      <nav className="sticky top-0 z-50 border-b border-[#d4af37]/15 bg-[#050505]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <DominusLogo className="h-10 w-10 shrink-0" />
            <div className="leading-none">
              <div className="text-xl font-semibold uppercase tracking-[0.16em] text-[#d4af37]">Dominus</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.58em] text-[#f5efe2]">Capital</div>
            </div>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            <div className="group relative">
              <NavLink
                to="/produtos"
                className={({ isActive }) =>
                  `inline-flex items-center gap-1 py-2 text-sm transition-colors hover:text-white ${isActive ? 'text-white' : 'text-[#a8a8a8]'}`
                }
              >
                Produtos
                <span aria-hidden="true" className="text-xs">⌄</span>
              </NavLink>
              <div className="absolute left-0 top-full hidden w-60 pt-3 group-hover:block group-focus-within:block">
                <div className="rounded-xl border border-white/10 bg-[#111] p-2 shadow-2xl shadow-black/50">
                  <ProductMenuLink to="/produtos/genesis" title="Gênesis" description="Conceito de robô Dominus" />
                  <ProductMenuLink to="/produtos/robo-teste" title="Robô de teste" description="Produto genérico para demonstração" />
                  <div className="my-1 border-t border-white/[0.08]" />
                  <ProductMenuLink to="/produtos" title="Ver todos os produtos" description="Acessar o catálogo completo" />
                </div>
              </div>
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `py-2 text-sm transition-colors hover:text-white ${isActive ? 'text-white' : 'text-[#a8a8a8]'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <Link
            to="/produtos"
            className="inline-flex items-center gap-2 rounded-lg bg-[#d4af37] px-4 py-2.5 text-sm font-semibold text-[#111] transition hover:bg-[#edca70]"
          >
            Saiba mais
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="flex items-center gap-6 overflow-x-auto border-t border-white/[0.06] px-4 py-2.5 lg:hidden">
          <NavLink
            to="/produtos"
            className={({ isActive }) =>
              `shrink-0 text-xs transition-colors hover:text-white ${isActive ? 'text-white' : 'text-[#a8a8a8]'}`
            }
          >
            Produtos
          </NavLink>
          <NavLink to="/produtos/genesis" className="shrink-0 text-xs text-[#a8a8a8] transition-colors hover:text-white">
            Gênesis
          </NavLink>
          <NavLink to="/produtos/robo-teste" className="shrink-0 text-xs text-[#a8a8a8] transition-colors hover:text-white">
            Robô de teste
          </NavLink>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `shrink-0 text-xs transition-colors hover:text-white ${isActive ? 'text-white' : 'text-[#a8a8a8]'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Dashboard page="home" />} />
        <Route path="/produtos" element={<Dashboard page="robots" />} />
        <Route path="/produtos/:productId" element={<ProductRoute />} />
        <Route path="/robos" element={<Navigate to="/produtos" replace />} />
        <Route path="/conceitos" element={<Dashboard page="concepts" />} />
        <Route path="/resultados" element={<Dashboard page="results" />} />
        <Route path="/riscos" element={<Dashboard page="risks" />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function ProductRoute() {
  const { productId } = useParams();

  return <Dashboard page="product" productId={productId} />;
}

function ProductMenuLink({ to, title, description }) {
  return (
    <Link to={to} className="block rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.06]">
      <span className="block text-sm font-medium text-white">{title}</span>
      <span className="mt-1 block text-xs text-[#888]">{description}</span>
    </Link>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
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
