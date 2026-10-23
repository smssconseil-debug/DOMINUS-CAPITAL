import { useEffect } from 'react';
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
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-3 py-3 sm:gap-4 sm:px-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="leading-none">
              <div className="font-serif text-[1.35rem] font-normal uppercase tracking-[0.1em] text-[#e2c575] sm:text-[1.65rem] sm:tracking-[0.12em]">Dominus</div>
              <div className="mt-1.5 flex items-center gap-2.5">
                <span className="h-px w-5 bg-[#b99443]/80" />
                <span className="text-[8px] font-medium uppercase tracking-[0.4em] text-[#d6d0c4] sm:text-[9px] sm:tracking-[0.48em]">Capital</span>
                <span className="h-px w-5 bg-[#b99443]/80" />
              </div>
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
                  <ProductMenuLink to="/produtos/robo-teste" title="ATLAS PERFORMANCE" description="Produto de demonstração" />
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
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#d4af37] px-3 py-2.5 text-xs font-semibold text-[#111] transition hover:bg-[#edca70] sm:gap-2 sm:px-4 sm:text-sm"
          >
            Saiba mais
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Link>
        </div>
        <div aria-label="Navegação principal" role="navigation" className="flex flex-wrap items-center gap-x-4 gap-y-0 border-t border-white/[0.06] px-3 py-1.5 sm:gap-x-6 sm:px-4 lg:hidden">
          <NavLink
            to="/produtos"
            className={({ isActive }) =>
              `shrink-0 py-2 text-xs transition-colors hover:text-white ${isActive ? 'text-white' : 'text-[#a8a8a8]'}`
            }
          >
            Produtos
          </NavLink>
          <NavLink to="/produtos/genesis" className="shrink-0 py-2 text-xs text-[#a8a8a8] transition-colors hover:text-white">
            Gênesis
          </NavLink>
          <NavLink to="/produtos/robo-teste" className="shrink-0 py-2 text-xs text-[#a8a8a8] transition-colors hover:text-white">
            ATLAS PERFORMANCE
          </NavLink>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `shrink-0 py-2 text-xs transition-colors hover:text-white ${isActive ? 'text-white' : 'text-[#a8a8a8]'}`
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

export default App;
