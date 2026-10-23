import { useMemo, useState } from 'react';
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
  Search,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { Link } from 'react-router-dom';
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
const products = [
  {
    id: 'genesis',
    name: 'Gênesis',
    description:
      'Apresentação demonstrativa do conceito de robô de trading Gênesis. Detalhes de funcionamento ainda estão em desenvolvimento.',
    label: 'Conceito Dominus',
    detail: 'O Gênesis é apresentado aqui como um conceito em desenvolvimento. Esta página serve para testar a apresentação individual de um produto.',
  },
  {
    id: 'robo-teste',
    name: 'ATLAS PERFORMANCE',
    description:
      'Produto genérico de demonstração para testar como novos robôs poderão aparecer no catálogo.',
    label: 'Produto de demonstração',
    detail: 'Este card genérico é apenas um exemplo visual para validar o fluxo do catálogo. Substitua o nome e as informações quando o próximo produto estiver definido.',
  },
];

const pageDetails = {
  robots: {
    eyebrow: 'Catálogo demonstrativo',
    title: 'Produtos',
    description: 'Explore cada conceito de robô em sua própria página.',
  },
  concepts: {
    eyebrow: 'Em desenvolvimento',
    title: 'Conceitos',
    description: 'Ideias e funcionalidades que estamos avaliando para futuras experiências.',
  },
  results: {
    eyebrow: 'Painel demonstrativo',
    title: 'Resultados históricos',
    description: 'Visualize o histórico operacional e os indicadores disponíveis nesta demonstração.',
  },
  risks: {
    eyebrow: 'Informação importante',
    title: 'Riscos e metodologia',
    description: 'Entenda o contexto dos dados apresentados e os riscos envolvidos em operações financeiras.',
  },
};

export default function Dashboard({ page = 'home', productId = '' }) {
  const [robotSearch, setRobotSearch] = useState('');
  const selectedProduct = products.find((product) => product.id === productId);
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
  const visibleProducts = products.filter((product) =>
    `${product.name} ${product.description}`.toLocaleLowerCase('pt-BR').includes(robotSearch.trim().toLocaleLowerCase('pt-BR')),
  );

  return (
    <div id="topo" className="relative overflow-hidden bg-[#050505] text-[#f7f2e8]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,_rgba(212,175,55,0.07),_transparent_36%)]" />

      <div className="relative mx-auto flex max-w-[1440px] flex-col gap-10 px-4 pb-16 lg:px-8">
        {page === 'home' && (
          <>
        <section id="inicio" className="relative flex min-h-[690px] scroll-mt-24 flex-col items-center justify-start overflow-hidden pt-20 text-center sm:min-h-[760px] sm:pt-28">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(ellipse_at_50%_42%,_rgba(212,175,55,0.14),_transparent_48%),linear-gradient(180deg,_rgba(5,5,5,0)_58%,_#050505_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-[310px] h-[420px] opacity-50 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_75%,transparent)]">
            <MarketBackdrop />
          </div>

          <div className="relative z-10 flex max-w-4xl flex-col items-center">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-[#c9c3b7]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
              Protótipo em desenvolvimento
            </span>
            <h1 className="text-5xl font-semibold leading-[1.02] tracking-[-0.055em] text-white sm:text-6xl lg:text-[5.5rem]">
              Onde estratégia
              <br />
              encontra <span className="bg-gradient-to-r from-[#f3d47c] via-[#d4af37] to-[#a97b26] bg-clip-text text-transparent">tecnologia.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#b5b5b5] sm:text-lg sm:leading-8">
              Explore conceitos de automação e análise de mercado em uma experiência visual criada pela Dominus Capital.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/produtos"
                className="inline-flex items-center gap-2 rounded-lg bg-[#f3f3f3] px-6 py-3.5 text-sm font-semibold text-[#111] transition hover:bg-white"
              >
                Explore os robôs
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/resultados"
                className="inline-flex items-center rounded-lg border border-white/15 bg-black/25 px-6 py-3.5 text-sm font-medium text-white transition hover:border-white/35 hover:bg-white/[0.06]"
              >
                Ver painel demonstrativo
              </Link>
            </div>
            <p className="mt-4 text-xs text-[#777]">Demonstração visual. Sem cadastro, contratação ou cobrança.</p>
          </div>

          <Link to="/produtos" className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-xs text-[#888] transition hover:text-white">
            Role para explorar
            <span className="mx-auto mt-3 block h-8 w-px bg-gradient-to-b from-[#d4af37]/70 to-transparent" />
          </Link>
        </section>
          </>
        )}

        {page !== 'home' && page !== 'product' && (
          <section className="border-b border-white/10 pb-7 pt-12 sm:pt-16">
            <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">{pageDetails[page].eyebrow}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">{pageDetails[page].title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#a8a8a8]">{pageDetails[page].description}</p>
          </section>
        )}

        {page === 'product' && selectedProduct && (
          <section className="mx-auto grid w-full max-w-6xl gap-8 pb-8 pt-10 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:pt-16">
            <div>
              <Link to="/produtos" className="mb-8 inline-flex items-center gap-2 text-sm text-[#999] transition hover:text-white">
                <ArrowRight className="h-4 w-4 rotate-180" />
                Voltar aos produtos
              </Link>
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-[#d4af37]/25 bg-[#111] p-3">
                  <Bot className="h-7 w-7 text-[#d4af37]" />
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-[#bbb]">
                  {selectedProduct.label}
                </span>
              </div>
              <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-white sm:text-6xl">{selectedProduct.name}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#aaa]">{selectedProduct.description}</p>
              <p className="mt-6 max-w-2xl border-l-2 border-[#d4af37]/60 pl-4 text-sm leading-7 text-[#888]">
                {selectedProduct.detail}
              </p>
              <p className="mt-8 text-xs text-[#777]">Protótipo demonstrativo. Sem cadastro, contratação ou cobrança.</p>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 sm:p-8">
              <div className="pointer-events-none absolute inset-0 opacity-70">
                <MarketBackdrop />
              </div>
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/20 bg-black/40 px-3 py-1.5 text-xs text-[#d9c47f]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
                  Página de produto de teste
                </span>
                <div className="mt-24 rounded-2xl border border-white/10 bg-black/70 p-5 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#888]">Status do conceito</p>
                  <p className="mt-2 text-2xl font-medium text-white">Em desenvolvimento</p>
                  <p className="mt-3 text-sm leading-6 text-[#999]">Esta página individual valida a navegação e a apresentação de futuros produtos.</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {page === 'product' && !selectedProduct && (
          <section className="py-16 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-[#d4af37]">Produto não encontrado</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Esse produto não está no catálogo.</h1>
            <Link
              to="/produtos"
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-3 text-sm text-white transition hover:border-white/35"
            >
              Voltar aos produtos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        )}

        {page === 'home' && (
        <section aria-label="Indicadores históricos demonstrativos" className="scroll-mt-24">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#a9a9a9]">Painel demonstrativo</p>
              <h2 className="mt-1 text-xl font-medium text-white">Resumo do histórico operacional</h2>
            </div>
            <span className="text-xs text-[#777]">Dados históricos · não são cotações em tempo real</span>
          </div>
          <div className="grid overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] sm:grid-cols-2 lg:grid-cols-3">
            <SummaryMetric title="Crescimento total" value={formatPercent(summary.totalGrowth)} detail="Sobre o capital inicial" positive />
            <SummaryMetric title="Capital final" value={formatCurrency(summary.finalCapital)} detail="Resultado líquido histórico" positive />
            <SummaryMetric
              title="Meses positivos"
              value={`${summary.positiveMonths} de ${summary.totalMonths}`}
              detail={`${formatPercent(summary.consistency)} do período`}
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
              title="Capital vs. inicial"
              value={formatPercent(summary.capitalVsInitial)}
              detail={summary.capitalVsInitial >= 100 ? 'Igual ou acima do capital inicial' : 'Abaixo do capital inicial'}
              positive={summary.capitalVsInitial >= 100}
              negative={summary.capitalVsInitial < 100}
            />
          </div>
        </section>
        )}

        {page === 'robots' && (
        <section id="produtos" className="scroll-mt-28 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[#d4af37]">Demonstração</p>
              <h2 className="mt-2 text-3xl font-semibold uppercase tracking-tight text-[#f8f4ec] sm:text-4xl">Produtos</h2>
              <p className="mt-2 max-w-2xl text-base leading-7 text-[#c9c3b7]">
              Cada produto tem sua própria página de apresentação. Escolha um item para explorar.
              </p>
            </div>
            <span className="w-fit rounded-full border border-[#d4af37]/25 bg-[#11161f] px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-[#d4af37]">
              Protótipo
            </span>
          </div>

          <div className="grid gap-4">
            <label className="flex max-w-xl items-center gap-3 rounded-xl border border-white/10 bg-[#111]/90 px-4 py-3.5 text-left transition focus-within:border-[#d4af37]/60">
              <Search className="h-5 w-5 shrink-0 text-[#8c8c8c]" />
              <input
                type="search"
                value={robotSearch}
                onChange={(event) => setRobotSearch(event.target.value)}
                placeholder="Buscar robôs e conceitos"
                aria-label="Buscar robôs e conceitos"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#777]"
              />
            </label>
            {visibleProducts.map((product) => (
              <article
                key={product.id}
                className="grid gap-6 rounded-[28px] border border-[#d4af37]/25 bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.12),_transparent_34%),#080b11] p-6 shadow-[0_0_60px_rgba(0,0,0,0.3)] lg:grid-cols-[1fr_auto] lg:items-center lg:p-8"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-2xl border border-[#d4af37]/25 bg-[#11161f] p-3">
                      <Bot className="h-7 w-7 text-[#d4af37]" />
                    </div>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.12em] text-emerald-300">
                      {product.label}
                    </span>
                  </div>
                  <h3 className="mt-5 text-3xl font-semibold uppercase tracking-[0.12em] text-[#f8f4ec]">{product.name}</h3>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-[#c9c3b7]">{product.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2 text-xs uppercase tracking-[0.1em] text-[#c9c3b7]">
                    <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">Em desenvolvimento</span>
                    <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">Sem contratação</span>
                  </div>
                </div>
                <Link
                  to={`/produtos/${product.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d4af37]/35 px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.1em] text-[#d4af37] transition hover:border-[#d4af37] hover:bg-[#d4af37]/10"
                >
                  Saiba mais
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
            {visibleProducts.length === 0 && (
              <p className="rounded-2xl border border-white/10 bg-[#0b0b0b] px-5 py-8 text-center text-sm text-[#a8a8a8]">
                Nenhum conceito encontrado. Tente outra busca.
              </p>
            )}
          </div>
        </section>
        )}

        {page === 'concepts' && (
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
        )}

        {page === 'results' && (
          <>
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
          </>
        )}

        {page === 'risks' && (
          <>
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
          </>
        )}

        {page === 'home' && (
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
        )}
      </div>

    </div>
  );
}

function SummaryMetric({ title, value, detail, positive = false, negative = false }) {
  return (
    <div className="border-b border-r border-white/[0.06] bg-[#0b0b0b] p-5 transition-colors hover:bg-[#101010]">
      <p className="text-xs uppercase tracking-[0.14em] text-[#8d8b84]">{title}</p>
      <p className={`mt-3 text-2xl font-medium leading-none sm:text-[2rem] ${positive ? 'text-[#2fb45a]' : negative ? 'text-[#ef4444]' : 'text-[#f7f2e8]'}`}>
        {value}
      </p>
      <p className="mt-3 text-sm text-[#c9c3b7]">{detail}</p>
    </div>
  );
}

function MarketBackdrop() {
  return (
    <svg viewBox="0 0 1440 520" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="market-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d4af37" stopOpacity="0" />
          <stop offset="48%" stopColor="#e5c15b" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="market-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d4af37" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g stroke="#ffffff" strokeOpacity="0.07" strokeWidth="1">
        <path d="M0 80H1440M0 160H1440M0 240H1440M0 320H1440M0 400H1440" />
        <path d="M120 0V520M300 0V520M480 0V520M660 0V520M840 0V520M1020 0V520M1200 0V520M1380 0V520" />
      </g>
      <path
        d="M0 360L90 340L160 365L235 300L310 322L390 260L470 285L545 220L625 248L710 190L785 222L865 155L945 184L1020 130L1095 164L1175 105L1255 145L1330 78L1440 110V520H0Z"
        fill="url(#market-area)"
      />
      <path
        d="M0 360L90 340L160 365L235 300L310 322L390 260L470 285L545 220L625 248L710 190L785 222L865 155L945 184L1020 130L1095 164L1175 105L1255 145L1330 78L1440 110"
        fill="none"
        stroke="url(#market-line)"
        strokeWidth="2.5"
      />
      <circle cx="1330" cy="78" r="5" fill="#f0cd73" />
      <circle cx="1330" cy="78" r="13" fill="#d4af37" fillOpacity="0.15" />
    </svg>
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
