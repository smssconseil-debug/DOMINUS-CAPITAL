import { Mail, MessageCircle, Phone } from 'lucide-react';

const canais = [
  { icon: MessageCircle, title: 'WhatsApp', value: '(11) 99999-9999' },
  { icon: Mail, title: 'Email', value: 'contato@dominuscapital.com' },
  { icon: Phone, title: 'Telefone', value: '(11) 4000-0000' },
];

export default function Contato() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-[#3a5878]/30 bg-[#071525] p-6 shadow-[0_0_25px_rgba(30,70,120,0.12)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#7890a8]" style={{ fontFamily: "'Cinzel', serif" }}>Contato</p>
        <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#e0e4f0] sm:text-3xl" style={{ fontFamily: "'Cinzel', serif" }}>
          Fale com nosso time
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-[#8890a4] sm:text-base">
          Antes de qualquer decisão, prefiro conversar. Se você tem dúvidas sobre o robô Gênesis, os planos ou como funciona a operação, é só chamar.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {canais.map(({ icon: Icon, title, value }) => (
          <article key={title} className="rounded-xl border border-[#3a5878]/22 bg-[#071525] p-5">
            <Icon className="h-6 w-6 text-[#7898b8]" />
            <h2 className="mt-3 text-sm font-black uppercase tracking-wider text-[#dce0ec]" style={{ fontFamily: "'Cinzel', serif" }}>{title}</h2>
            <p className="mt-2 text-base text-[#8890a4]">{value}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
