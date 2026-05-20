import { ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

const destaques = [
  {
    icon: TrendingUp,
    title: 'Performance real',
    description: 'Exibimos resultados auditáveis com histórico detalhado de operações.',
  },
  {
    icon: ShieldCheck,
    title: 'Gestão de risco',
    description: 'Regras de proteção e monitoramento contínuo para preservar capital.',
  },
  {
    icon: Sparkles,
    title: 'Tecnologia proprietária',
    description: 'Estratégias automatizadas focadas em disciplina e consistência operacional.',
  },
];

export default function Sobre() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-[#d4af37]/30 bg-[#0a0a0a] p-6 shadow-[0_0_25px_rgba(212,175,55,0.08)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#d4af37]">Sobre a Dominus</p>
        <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">Quem somos</h1>
        <p className="mt-3 max-w-3xl text-sm text-gray-300 sm:text-base">
          A Dominus Capital combina análise quantitativa, tecnologia e disciplina operacional para entregar uma
          experiência transparente para investidores que buscam evolução consistente.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {destaques.map(({ icon: Icon, title, description }) => (
          <article key={title} className="rounded-xl border border-white/10 bg-[#111] p-5">
            <Icon className="h-6 w-6 text-[#d4af37]" />
            <h2 className="mt-3 text-sm font-black uppercase tracking-wider text-white">{title}</h2>
            <p className="mt-2 text-sm text-gray-400">{description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
