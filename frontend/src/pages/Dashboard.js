import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Clock3,
  Headphones,
  Lock,
  MessagesSquare,
  ShieldCheck,
  Star,
} from 'lucide-react';
import tradesData from '../data/trades.json';
import { computeMetrics } from '../lib/computeMetrics';

const INITIAL_CAPITAL = 1000;
const MONTH_SHORT = {
  janeiro: 'Jan',
  fevereiro: 'Fev',
  março: 'Mar',
  abril: 'Abr',
  maio: 'Mai',
  junho: 'Jun',
  julho: 'Jul',
  agosto: 'Ago',
  setembro: 'Set',
  outubro: 'Out',
  novembro: 'Nov',
  dezembro: 'Dez',
};

const MEP_COLORS = ['#d7a93d', '#b78d3b', '#d8b66d', '#8c6a2d'];
const MIN_PROGRESS_WIDTH_PERCENT = 6;
const POSITIVE_LABEL_OFFSET_Y = -10;
const NEGATIVE_LABEL_OFFSET_Y = 18;
const robots = [
  {
    name: 'Gênesis',
    description:
      'Apresentação demonstrativa do conceito de robô de trading Gênesis. Detalhes de funcionamento ainda estão em desenvolvimento.',
  },
];

export default function Dashboard() {
  const metrics = useMemo(() => computeMetrics(tradesData, {}), []);

  const summary = useMemo(() => {
    const monthly = metrics.monthly ?? [];
    const positiveMonths = monthly.filter((item) => item.liquido > 0).length;
    const totalMonths = monthly.length;
    const bestMonth = monthly.reduce((best, item) => (!best || item.percent > best.percent ? item : best), null);
    const worstMonth = monthly.reduce((worst, item) => (!worst || item.percent < worst.percent ? item : worst), null);
    const finalCapital = INITIAL_CAPITAL + (metrics.kpis?.lucro_liquido ?? 0);
    const totalGrowth = INITIAL_CAPITAL > 0 ? ((metrics.kpis?.lucro_liquido ?? 0) / INITIAL_CAPITAL) * 100 : 0;
    const capitalVsInitial = INITIAL_CAPITAL > 0 ? (finalCapital / INITIAL_CAPITAL) * 100 : 0;

    return {
      finalCapital,
      totalGrowth,
      positiveMonths,
      totalMonths,
      bestMonth,
      worstMonth,
      capitalVsInitial,
      consistency: totalMonths > 0 ? (positiveMonths / totalMonths) * 100 : 0,
    };
  }, [metrics]);

  const monthlyChartData = useMemo(
    () =>
      (metrics.monthly ?? []).map((item) => {
        const [monthName, year] = item.mes.split('/');
        return {
          ...item,
          shortLabel: `${MONTH_SHORT[monthName] || monthName.slice(0, 3)}/${year}`,
          fill: item.percent >= 0 ? '#2fb45a' : '#ef4444',
        };
      }),
    [metrics.monthly],
  );

  const monthlyDomain = useMemo(() => {
    const values = monthlyChartData.map((item) => item.percent);
    const min = values.length ? Math.min(...values, 0) : -10;
    const max = values.length ? Math.max(...values, 0) : 10;
    return [Math.floor(min - 15), Math.ceil(max + 35)];
  }, [monthlyChartData]);

  const pieData = useMemo(
    () =>
      (metrics.mep ?? []).map((item, index) => ({
        ...item,
        label: `MEP ${item.mep}`,
        value: Math.max(item.liquido, 0),
        color: MEP_COLORS[index % MEP_COLORS.length],
      })),
    [metrics.mep],
  );

  return (
    <div id="topo" className="relative overflow-hidden bg-[#050505] text-[#f7f2e8]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,175,55,0.10),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(212,175,55,0.08),_transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(212,175,55,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.05)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 pb-14 lg:px-6">
        <section id="inicio" className="scroll-mt-28 rounded-[28px] border border-[#d4af37]/12 bg-[#06080d]/95 p-6 shadow-[0_0_80px_rgba(0,0,0,0.35)] lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
            <div className="flex flex-col justify-between gap-6">
              <div className="space-y-5">
                <p className="text-sm uppercase tracking-[0.2em] text-[#d4af37]">Protótipo em desenvolvimento</p>
                <div className="space-y-3">
                  <h1 className="max-w-xl text-4xl font-medium uppercase leading-[1.05] text-[#f8f4ec] sm:text-5xl lg:text-[4.25rem]">
                    Ideias para
                    <br />
                    trading.
                    <br />
                    <span className="text-[#d4af37]">Conheça os</span>
                    <br />
                    <span className="text-[#d4af37]">conceitos.</span>
                  </h1>
                  <p className="max-w-xl text-lg leading-8 text-[#d0cbc0]">
                    Uma demonstração em construção para apresentar ideias de automação e análise de mercado. Este site não oferece contratação ou cobrança.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="#produtos"
                    className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(90deg,#b8892d,#d4af37,#f0cb6f)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-[#16130b] transition hover:brightness-110"
                  >
                    Saiba mais
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#resultados"
                    className="inline-flex items-center rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-[#f5efe2] transition hover:border-[#d4af37]/60 hover:text-[#d4af37]"
                  >
                    Ver resultados
                  </a>
                </div>
              </div>

              <div className="inline-flex max-w-xl items-start gap-4 rounded-2xl border border-[#d4af37]/30 bg-[#11161f]/75 px-5 py-4">
                <ShieldCheck className="mt-1 h-7 w-7 shrink-0 text-[#d4af37]" />
                <div>
                  <p className="text-base font-semibold uppercase tracking-[0.08em] text-[#d4af37]">Projeto demonstrativo.</p>
                  <p className="mt-1 text-sm text-[#c9c3b7]">Conteúdo e funcionalidades em desenvolvimento; os dados exibidos são históricos.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#d4af37]/18 bg-[#090c12] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] lg:p-6">
              <p className="mb-4 text-sm uppercase tracking-[0.18em] text-[#d4af37]">Desempenho acumulado</p>
              <div className="grid gap-px overflow-hidden rounded-[22px] border border-[#d4af37]/14 bg-[#20170a]/40 md:grid-cols-2">
                <SummaryMetric
                  title="Crescimento total"
                  value={formatPercent(summary.totalGrowth)}
                  detail="Sobre o capital inicial"
                  positive
                />
                <SummaryMetric
                  title="Capital final"
                  value={formatCurrency(summary.finalCapital)}
                  detail="Resultado líquido"
                  positive
                />
                <SummaryMetric
                  title="Melhor mês"
                  value={summary.bestMonth ? formatPercent(summary.bestMonth.percent) : '0,00%'}
                  detail={summary.bestMonth ? capitalizeLabel(summary.bestMonth.mes) : 'Sem histórico'}
                  positive
                />
                <SummaryMetric
                  title="Pior mês"
                  value={summary.worstMonth ? formatPercent(summary.worstMonth.percent) : '0,00%'}
                  detail={summary.worstMonth ? capitalizeLabel(summary.worstMonth.mes) : 'Sem histórico'}
                  negative
                />
                <SummaryMetric
                  title="Meses positivos"
                  value={`${summary.positiveMonths} de ${summary.totalMonths}`}
                  detail={`${formatPercent(summary.consistency)} de consistência`}
                  positive
                />
                <SummaryMetric
                  title="Capital vs. inicial"
                  value={formatPercent(summary.capitalVsInitial)}
                  detail={summary.capitalVsInitial >= 100 ? 'Igual ou acima do capital inicial' : 'Abaixo do capital inicial'}
                  positive={summary.capitalVsInitial >= 100}
                  negative={summary.capitalVsInitial < 100}
                />
              </div>
            </div>
          </div>
        </section>

        <section id="produtos" className="scroll-mt-28 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#d4af37]">Demonstração</p>
              <h2 className="mt-2 text-3xl font-semibold uppercase tracking-tight text-[#f8f4ec] sm:text-4xl">Conceitos de robôs</h2>
              <p className="mt-2 max-w-2xl text-base leading-7 text-[#c9c3b7]">
                Explore as ideias que estamos prototipando. Os exemplos abaixo são informativos e não estão disponíveis para contratação.
              </p>
            </div>
            <span className="w-fit rounded-full border border-[#d4af37]/25 bg-[#11161f] px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-[#d4af37]">
              Protótipo
            </span>
          </div>

          <div className="grid gap-4">
            {robots.map((robot) => (
              <article
                key={robot.name}
                className="grid gap-6 rounded-[28px] border border-[#d4af37]/25 bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.12),_transparent_34%),#080b11] p-6 shadow-[0_0_60px_rgba(0,0,0,0.3)] lg:grid-cols-[1fr_auto] lg:items-center lg:p-8"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-2xl border border-[#d4af37]/25 bg-[#11161f] p-3">
                      <Bot className="h-7 w-7 text-[#d4af37]" />
                    </div>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.12em] text-emerald-300">
                      Conceito demonstrativo
                    </span>
                  </div>
                  <h3 className="mt-5 text-3xl font-semibold uppercase tracking-[0.12em] text-[#f8f4ec]">{robot.name}</h3>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-[#c9c3b7]">{robot.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2 text-xs uppercase tracking-[0.1em] text-[#c9c3b7]">
                    <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">Em desenvolvimento</span>
                    <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">Sem contratação</span>
                  </div>
                </div>
                <a
                  href="#resultados"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d4af37]/35 px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.1em] text-[#d4af37] transition hover:border-[#d4af37] hover:bg-[#d4af37]/10"
                >
                  Saiba mais
                  <ArrowRight className="h-4 w-4" />
                </a>
              </article>
            ))}
          </div>
        </section>

        <section id="servicos" className="scroll-mt-28 space-y-5">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#d4af37]">Ideias em avaliação</p>
            <h2 className="mt-2 text-2xl font-semibold uppercase tracking-tight text-[#f8f4ec] sm:text-3xl">Conceitos de suporte</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#c9c3b7]">
              Estas são possibilidades para a experiência futura do projeto. Nenhum serviço está sendo oferecido nesta demonstração.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <ServiceCard
              icon={<Headphones className="h-6 w-6 text-[#d4af37]" />}
              title="Central de ajuda"
              description="Conceito de uma área com orientações e respostas sobre o uso da plataforma."
              detail="A central de ajuda é apenas uma ideia para versões futuras do protótipo."
            />
            <ServiceCard
              icon={<MessagesSquare className="h-6 w-6 text-[#d4af37]" />}
              title="Conteúdo educativo"
              description="Conceito de materiais explicativos sobre automação e leitura de dados."
              detail="O conteúdo educativo está em planejamento e não constitui recomendação de investimento."
            />
          </div>
        </section>

        <section
          id="resultados"
          className="scroll-mt-28 rounded-[28px] border border-[#d4af37]/12 bg-[#06080d]/95 p-5 shadow-[0_0_60px_rgba(0,0,0,0.32)] lg:p-6"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-[#d4af37]">Histórico operacional</p>
          <p className="mb-5 mt-2 max-w-3xl text-sm leading-6 text-[#c9c3b7]">
            Dados históricos da operação disponibilizada. Resultados passados não garantem resultados futuros, e operar no mercado financeiro envolve riscos.
          </p>
          <div className="h-[320px] w-full sm:h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 24, right: 8, left: -18, bottom: 8 }}>
                <CartesianGrid stroke="#1f232c" vertical={false} />
                <XAxis dataKey="shortLabel" tick={{ fill: '#c9c3b7', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  domain={monthlyDomain}
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fill: '#8d8b84', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                />
                <RechartsTooltip
                  cursor={{ fill: 'rgba(212,175,55,0.05)' }}
                  contentStyle={{
                    backgroundColor: '#0f131a',
                    border: '1px solid rgba(212,175,55,0.25)',
                    borderRadius: '14px',
                    color: '#f7f2e8',
                  }}
                  formatter={(value, _name, item) => [formatPercent(value), `Lucro: ${formatCurrency(item.payload.liquido)}`]}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Bar dataKey="percent" radius={[6, 6, 0, 0]} maxBarSize={34}>
                  {monthlyChartData.map((item) => (
                    <Cell key={item.mes} fill={item.fill} />
                  ))}
                  <LabelList content={renderBarLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div id="tecnologia" className="grid scroll-mt-28 gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <section className="rounded-[28px] border border-[#d4af37]/12 bg-[#06080d]/95 p-5 shadow-[0_0_60px_rgba(0,0,0,0.28)] lg:p-6">
            <div className="mb-5 flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-[#d4af37]" />
              <p className="text-sm uppercase tracking-[0.2em] text-[#d4af37]">Desempenho por horário</p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-[1.1fr_0.9fr_1.1fr] gap-4 border-b border-[#d4af37]/10 pb-3 text-xs uppercase tracking-[0.14em] text-[#8d8b84]">
                <span>Horário</span>
                <span>Lucro (R$)</span>
                <span>% do lucro total</span>
              </div>

              {(metrics.hourly ?? []).map((item) => (
                <div key={item.horario} className="grid grid-cols-[1.1fr_0.9fr_1.1fr] items-center gap-4 text-sm text-[#f1ece1]">
                  <span>{item.horario}</span>
                  <span className="font-medium text-[#2fb45a]">{formatCurrency(item.liquido)}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#1d1f24]">
                      <div
                        className={`h-full rounded-full ${getProgressBarClass(item.percent)}`}
                        style={{ width: `${clampProgressWidth(item.percent)}%` }}
                      />
                    </div>
                    <span className={`w-16 text-right ${getPercentTextClass(item.percent)}`}>{formatPercent(item.percent)}</span>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-[1.1fr_0.9fr_1.1fr] gap-4 border-t border-[#d4af37]/10 pt-4 text-sm font-semibold uppercase tracking-[0.08em]">
                <span className="text-[#d4af37]">Total</span>
                <span className="text-[#2fb45a]">{formatCurrency(metrics.kpis?.lucro_liquido ?? 0)}</span>
                <span className="text-right text-[#2fb45a]">100%</span>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-[#d4af37]/12 bg-[#06080d]/95 p-5 shadow-[0_0_60px_rgba(0,0,0,0.28)] lg:p-6">
            <p className="mb-5 text-sm uppercase tracking-[0.2em] text-[#d4af37]">Distribuição de lucro por MEP</p>
            <div className="grid gap-6 md:grid-cols-[0.95fr_1.05fr] md:items-center">
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={68}
                      outerRadius={98}
                      paddingAngle={2}
                      stroke="rgba(5,5,5,0.9)"
                      strokeWidth={3}
                    >
                      {pieData.map((item) => (
                        <Cell key={item.label} fill={item.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#0f131a',
                        border: '1px solid rgba(212,175,55,0.25)',
                        borderRadius: '14px',
                        color: '#f7f2e8',
                      }}
                      formatter={(value) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                {pieData.map((item) => (
                  <div key={item.label} className="flex items-start justify-between gap-4 border-b border-[#d4af37]/10 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <div>
                        <p className="text-lg text-[#f5efe2]">{item.label}</p>
                        <p className="text-sm text-[#8d8b84]">{formatCurrency(item.liquido)}</p>
                      </div>
                    </div>
                    <span className="text-2xl font-medium text-[#f5efe2]">{formatPercent(item.percent)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-start gap-4 rounded-2xl border border-[#d4af37]/20 bg-[#11161f]/75 px-5 py-4">
              <Star className="mt-1 h-6 w-6 shrink-0 text-[#d4af37]" />
              <div>
                <p className="text-base font-semibold uppercase tracking-[0.08em] text-[#d4af37]">Estratégia diversificada</p>
                <p className="mt-1 text-sm leading-6 text-[#c9c3b7]">
                  Alocação visualmente organizada entre os diferentes MEPs para manter a leitura estratégica clara e premium.
                </p>
              </div>
            </div>
          </section>
        </div>

        <section id="filosofia" className="scroll-mt-28 rounded-[28px] border border-[#d4af37]/12 bg-[#06080d]/95 p-5 shadow-[0_0_60px_rgba(0,0,0,0.28)] lg:p-6">
          <p className="mb-5 text-sm uppercase tracking-[0.2em] text-[#d4af37]">Notas importantes</p>
          <div className="grid gap-4 md:grid-cols-3">
            <NoteCard
              icon={<ShieldCheck className="h-7 w-7 text-[#d4af37]" />}
              title="Rentabilidade passada não é garantia de futuro."
              description="Resultados históricos não garantem resultados futuros. Operações no mercado financeiro envolvem riscos."
            />
            <NoteCard
              icon={<Lock className="h-7 w-7 text-[#d4af37]" />}
              title="Projeto em desenvolvimento"
              description="Esta página é uma demonstração. Recursos, exemplos e conteúdo podem mudar durante a construção."
            />
            <NoteCard
              icon={<BadgeCheck className="h-7 w-7 text-[#d4af37]" />}
              title="Gestão profissional"
              description="Estrutura desenhada para disciplina operacional, controle de risco e visão de longo prazo."
            />
          </div>
        </section>

        <section
          id="sobre-prototipo"
          className="scroll-mt-28 rounded-[28px] border border-[#d4af37]/12 bg-[#06080d]/95 p-5 shadow-[0_0_60px_rgba(0,0,0,0.28)] lg:p-6"
        >
          <div
            id="saiba-mais"
            className="grid scroll-mt-28 gap-6 rounded-[24px] border border-[#d4af37]/18 bg-[radial-gradient(circle_at_right,_rgba(212,175,55,0.16),_transparent_34%),#0a0d13] p-5 lg:grid-cols-[1fr_auto] lg:items-center lg:p-6"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-full border border-[#d4af37]/25 bg-[#0d1118] p-3">
                <Lock className="h-7 w-7 text-[#d4af37]" />
              </div>
              <div>
                <p className="text-2xl uppercase tracking-[0.12em] text-[#d4af37]">Sobre este protótipo</p>
                <p className="mt-2 max-w-3xl text-base leading-7 text-[#c9c3b7]">
                  Estamos explorando formas de apresentar dados e conceitos de automação em uma interface clara. Esta versão é apenas demonstrativa e não realiza cadastros ou transações.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-3">
              <button
                type="button"
                onClick={() => document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[linear-gradient(90deg,#b8892d,#d4af37,#f0cb6f)] px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#16130b] transition hover:brightness-110"
              >
                Saiba mais
                <ArrowRight className="h-5 w-5" />
              </button>
              <p className="text-center text-xs uppercase tracking-[0.12em] text-[#8d8b84]">Conteúdo informativo</p>
            </div>
          </div>
        </section>
      </div>

    </div>
  );
}

function SummaryMetric({ title, value, detail, positive = false, negative = false }) {
  return (
    <div className="bg-[#0b1017] p-5">
      <p className="text-xs uppercase tracking-[0.14em] text-[#8d8b84]">{title}</p>
      <p className={`mt-3 text-[2rem] font-medium leading-none ${positive ? 'text-[#2fb45a]' : negative ? 'text-[#ef4444]' : 'text-[#f7f2e8]'}`}>
        {value}
      </p>
      <p className="mt-3 text-sm text-[#c9c3b7]">{detail}</p>
    </div>
  );
}

function NoteCard({ icon, title, description }) {
  return (
    <div className="flex gap-4 rounded-[24px] border border-[#d4af37]/14 bg-[#0b1017] p-5">
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-lg uppercase leading-7 text-[#f7f2e8]">{title}</p>
        <p className="mt-2 text-sm leading-6 text-[#c9c3b7]">{description}</p>
      </div>
    </div>
  );
}

function ServiceCard({ icon, title, description, detail }) {
  return (
    <article className="rounded-[24px] border border-[#d4af37]/15 bg-[#080b11] p-5 sm:p-6">
      <div className="flex gap-4">
        <div className="h-fit rounded-xl border border-[#d4af37]/20 bg-[#11161f] p-3">{icon}</div>
        <div>
          <h3 className="text-lg font-semibold uppercase tracking-[0.08em] text-[#f7f2e8]">{title}</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#c9c3b7]">{description}</p>
        </div>
      </div>
      <details className="group mt-5 border-t border-white/10 pt-4">
        <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold uppercase tracking-[0.1em] text-[#d4af37]">
          Saiba mais
          <ArrowRight className="h-4 w-4 transition-transform group-open:rotate-90" />
        </summary>
        <p className="mt-3 text-sm leading-6 text-[#c9c3b7]">{detail}</p>
      </details>
    </article>
  );
}

function renderBarLabel({ x, y, width, height, value }) {
  if (typeof value !== 'number') return null;
  const labelY = value >= 0 ? y + POSITIVE_LABEL_OFFSET_Y : y + height + NEGATIVE_LABEL_OFFSET_Y;
  return (
    <text x={x + width / 2} y={labelY} fill="#f7f2e8" fontSize="11" textAnchor="middle">
      {formatPercent(value)}
    </text>
  );
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

function formatPercent(value) {
  return `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0)}%`;
}

function capitalizeLabel(label) {
  if (!label) return '';
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function clampProgressWidth(percent) {
  return Math.min(Math.max(Math.abs(percent), MIN_PROGRESS_WIDTH_PERCENT), 100);
}

function getProgressBarClass(percent) {
  return percent >= 0
    ? 'bg-[linear-gradient(90deg,#8c631d,#d4af37,#f0cd73)]'
    : 'bg-[linear-gradient(90deg,#6f1d1b,#ef4444,#f87171)]';
}

function getPercentTextClass(percent) {
  return percent >= 0 ? 'text-[#c9c3b7]' : 'text-[#f87171]';
}
