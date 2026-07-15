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
      <section className="rounded-2xl border border-[#3a5878]/30 bg-[#071525] p-6 shadow-[0_0_25px_rgba(30,70,120,0.12)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#7890a8]" style={{ fontFamily: "'Cinzel', serif" }}>Sobre a Dominus</p>
        <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#e0e4f0] sm:text-3xl" style={{ fontFamily: "'Cinzel', serif" }}>Quem somos</h1>
        <p className="mt-3 max-w-3xl text-sm text-[#8890a4] sm:text-base">
          A Dominus Capital nasceu da necessidade de operar o mercado com regras claras, sem emoção e sem achismo. Combinamos automação, disciplina e controle de risco para entregar consistência — não promessas.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {destaques.map(({ icon: Icon, title, description }) => (
          <article key={title} className="rounded-xl border border-[#3a5878]/22 bg-[#071525] p-5">
            <Icon className="h-6 w-6 text-[#7898b8]" />
            <h2 className="mt-3 text-sm font-black uppercase tracking-wider text-[#dce0ec]" style={{ fontFamily: "'Cinzel', serif" }}>{title}</h2>
            <p className="mt-2 text-sm text-[#8890a4]">{description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
