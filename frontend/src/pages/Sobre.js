import { ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

const destaques = [
  {
    icon: TrendingUp,
    title: 'Performance real',
    description: 'Todo o histórico de operações está disponível para consulta. Nada de backtests vendidos como resultado real.',
  },
  {
    icon: ShieldCheck,
    title: 'Gestão de risco',
    description: 'Stop loss definido antes de entrar em cada operação. O capital é preservado antes de qualquer outra coisa.',
  },
  {
    icon: Sparkles,
    title: 'Tecnologia proprietária',
    description: 'O robô Gênesis opera com parâmetros definidos pela nossa equipe, sem depender de sinais externos ou copy trade.',
  },
];

export default function Sobre() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-[#d4af37]/30 bg-[#0a0a0a] p-6 shadow-[0_0_25px_rgba(212,175,55,0.08)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#d4af37]">Sobre a Dominus</p>
        <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">Quem somos</h1>
        <p className="mt-3 max-w-3xl text-sm text-gray-300 sm:text-base">
          A Dominus Capital nasceu da necessidade de operar o mercado com regras claras, sem emoção e sem achismo. Combinamos automação, disciplina e controle de risco para entregar consistência — não promessas.
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
