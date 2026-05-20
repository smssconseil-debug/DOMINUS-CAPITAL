import { Mail, MessageCircle, Phone } from 'lucide-react';

const canais = [
  { icon: MessageCircle, title: 'WhatsApp', value: '(11) 99999-9999' },
  { icon: Mail, title: 'Email', value: 'contato@dominuscapital.com' },
  { icon: Phone, title: 'Telefone', value: '(11) 4000-0000' },
];

export default function Contato() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-[#d4af37]/30 bg-[#0a0a0a] p-6 shadow-[0_0_25px_rgba(212,175,55,0.08)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#d4af37]">Contato</p>
        <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
          Fale com nosso time
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-gray-300 sm:text-base">
          Escolha o canal preferido para tirar dúvidas, conhecer o robô Gênesis e entender qual plano combina com
          seu perfil.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {canais.map(({ icon: Icon, title, value }) => (
          <article key={title} className="rounded-xl border border-white/10 bg-[#111] p-5">
            <Icon className="h-6 w-6 text-[#d4af37]" />
            <h2 className="mt-3 text-sm font-black uppercase tracking-wider text-white">{title}</h2>
            <p className="mt-2 text-base text-gray-300">{value}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
