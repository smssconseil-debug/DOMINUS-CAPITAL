import { ArrowRight, Bot, Headphones } from 'lucide-react';

export default function Contato() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-[#d4af37]/30 bg-[#0a0a0a] p-6 shadow-[0_0_25px_rgba(212,175,55,0.08)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#d4af37]">Contato</p>
        <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
          Fale com nosso time
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-gray-300 sm:text-base">
          Conheça os produtos e serviços e envie seu interesse pelo formulário da página. Valores e condições são informados antes de qualquer contratação.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ContactLink
          href="/#produtos"
          icon={<Bot className="h-6 w-6 text-[#d4af37]" />}
          title="Robôs e assinaturas"
          description="Explore os robôs e solicite informações sobre cada assinatura individual."
        />
        <ContactLink
          href="/#servicos"
          icon={<Headphones className="h-6 w-6 text-[#d4af37]" />}
          title="Serviços opcionais"
          description="Consulte suporte prioritário e consultoria, vendidos separadamente dos robôs."
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
