import { ArrowRight, BarChart3, Bot } from 'lucide-react';

export default function Contato() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-[#d4af37]/30 bg-[#0a0a0a] p-6 shadow-[0_0_25px_rgba(212,175,55,0.08)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#d4af37]">Projeto demonstrativo</p>
        <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">Sobre o protótipo</h1>
        <p className="mt-3 max-w-2xl text-sm text-gray-300 sm:text-base">
          Esta página apresenta conceitos de automação e visualização de dados que ainda estão em desenvolvimento. Não há cadastro, contratação ou cobrança por meio deste site.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ContactLink
          href="/#produtos"
          icon={<Bot className="h-6 w-6 text-[#d4af37]" />}
          title="Conceitos de robôs"
          description="Veja a demonstração do conceito Gênesis e os detalhes disponíveis nesta versão."
        />
        <ContactLink
          href="/#resultados"
          icon={<BarChart3 className="h-6 w-6 text-[#d4af37]" />}
          title="Visualização de dados"
          description="Explore gráficos baseados no histórico operacional apresentado para fins demonstrativos."
        />
      </section>
    </main>
  );
}

function ContactLink({ href, icon, title, description }) {
  return (
    <a href={href} className="group rounded-xl border border-white/10 bg-[#111] p-5 transition hover:border-[#d4af37]/50">
      {icon}
      <h2 className="mt-3 text-sm font-black uppercase tracking-wider text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-gray-400">{description}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#d4af37]">
        Ver detalhes
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </a>
  );
}
