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
  CheckCircle,
  Clock3,
  Lock,
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

const MEP_COLORS = ['#4a7fa0', '#6088b8', '#3a8878', '#6870a8', '#4a8858'];
const MIN_PROGRESS_WIDTH_PERCENT = 6;
const POSITIVE_LABEL_OFFSET_Y = -10;
const NEGATIVE_LABEL_OFFSET_Y = 18;
const BAR_POSITIVE_COLOR = '#3a8868';
const BAR_NEGATIVE_COLOR = '#a85858';
const DASHBOARD_BG_ACCENT =
  'radial-gradient(circle at top left, rgba(30,70,120,0.22), transparent 35%), radial-gradient(circle at bottom right, rgba(10,35,70,0.18), transparent 32%)';
const DASHBOARD_BG_VIGNETTE = 'radial-gradient(circle at center, transparent 45%, rgba(2,6,15,0.40) 100%)';

export default function Dashboard() {
  const [showSaibaMais, setShowSaibaMais] = useState(false);
  const [interestForm, setInterestForm] = useState({ email: '', phone: '', name: '' });
  const [interestSent, setInterestSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const metrics = useMemo(() => computeMetrics(tradesData, {}), []);

  const summary = useMemo(() => {
    const monthly = metrics.monthly ?? [];
    const positiveMonths = monthly.filter((item) => item.liquido > 0).length;
    const totalMonths = monthly.length;
    const bestMonth = monthly.reduce((best, item) => (!best || item.percent > best.percent ? item : best), null);
    const worstMonth = monthly.reduce((worst, item) => (!worst || item.percent < worst.percent ? item : worst), null);
    const finalCapital = INITIAL_CAPITAL + (metrics.kpis?.lucro_liquido ?? 0);
    const totalGrowth = INITIAL_CAPITAL > 0 ? ((metrics.kpis?.lucro_liquido ?? 0) / INITIAL_CAPITAL) * 100 : 0;
    const capitalProtected = finalCapital >= INITIAL_CAPITAL ? 100 : Math.max(0, (finalCapital / INITIAL_CAPITAL) * 100);

    return {
      finalCapital,
      totalGrowth,
      positiveMonths,
      totalMonths,
      bestMonth,
      worstMonth,
      capitalProtected,
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
          fill: item.percent >= 0 ? BAR_POSITIVE_COLOR : BAR_NEGATIVE_COLOR,
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

  const submitSaibaMais = async (e) => {
    e.preventDefault();

    if (!process.env.REACT_APP_FORMSPREE_URL) {
      setSubmitError('Formulário não configurado. Entre em contato diretamente.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch(process.env.REACT_APP_FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          subject: `Novo lead Dominus Capital: ${interestForm.name}`,
          nome: interestForm.name,
          email: interestForm.email,
          whatsapp: interestForm.phone,
        }),
      });

      if (!response.ok) {
        setSubmitError('Não foi possível enviar. Por favor, tente novamente.');
        return;
      }

      setInterestSent(true);
      setTimeout(() => {
        setShowSaibaMais(false);
        setInterestSent(false);
        setInterestForm({ email: '', phone: '', name: '' });
      }, 3000);
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      setSubmitError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    let formatted = value;
    if (value.length > 2) {
      formatted = `(${value.slice(0, 2)}) ${value.length > 7 ? `${value.slice(2, 7)}-${value.slice(7)}` : value.slice(2)}`;
    }

    setInterestForm((prev) => ({ ...prev, phone: formatted }));
  };

  return (
    <div id="topo" className="relative overflow-hidden bg-[#040e1c] text-[#dce0ec]">
      <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: DASHBOARD_BG_ACCENT }} />
      <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: DASHBOARD_BG_VIGNETTE }} />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 pb-14 lg:px-6">
        <section id="estrutura" className="scroll-mt-28 rounded-[28px] border border-[#3a5878]/22 bg-[#071525]/95 p-6 shadow-[0_14px_40px_rgba(2,6,20,0.50)] lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
            <div className="flex flex-col justify-between gap-6">
              <div className="space-y-5">
                <p className="text-sm uppercase tracking-[0.2em] text-[#7890a8]" style={{ fontFamily: "'Cinzel', serif" }}>Resultados detalhados</p>
                <div className="space-y-3">
                  <h1 className="max-w-xl text-4xl font-medium uppercase leading-[1.05] text-[#e0e4f0] sm:text-5xl lg:text-[4.25rem]" style={{ fontFamily: "'Cinzel', serif" }}>
                    Transparência
                    <br />
                    em cada dado.
                    <br />
                    <span className="text-[#9ab0cc]">Consistência</span>
                    <br />
                    <span className="text-[#9ab0cc]">em cada decisão.</span>
                  </h1>
                  <p className="max-w-xl text-lg leading-8 text-[#8890a4]">
                    Cada número aqui é extraído diretamente do histórico real de operações — sem arredondamentos, sem filtros. O que você vê é o que aconteceu.
                  </p>
                </div>
              </div>

              <div className="inline-flex max-w-xl items-start gap-4 rounded-2xl border border-[#3a5878]/30 bg-[#0d2035]/75 px-5 py-4">
                <ShieldCheck className="mt-1 h-7 w-7 shrink-0 text-[#5a7ea0]" />
                <div>
                  <p className="text-base font-semibold uppercase tracking-[0.08em] text-[#9098b0]">Dados reais, extraídos da operação.</p>
                  <p className="mt-1 text-sm text-[#8890a4]">Nenhum dado simulado. Todas as operações estão no histórico e podem ser verificadas pelo investidor.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#3a5878]/22 bg-[#0a1928] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] lg:p-6">
              <p className="mb-4 text-sm uppercase tracking-[0.18em] text-[#7890a8]" style={{ fontFamily: "'Cinzel', serif" }}>Desempenho acumulado</p>
              <div className="grid gap-px overflow-hidden rounded-[22px] border border-[#3a5878]/18 bg-[#0e1e30]/45 md:grid-cols-2">
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
                  title="Capital protegido"
                  value={formatPercent(summary.capitalProtected)}
                  detail={summary.capitalProtected === 100 ? 'Sem perda do capital inicial' : 'Abaixo do capital inicial'}
                  positive={summary.capitalProtected === 100}
                  negative={summary.capitalProtected < 100}
                />
              </div>
            </div>
          </div>
        </section>

        <section
          id="resultados"
          className="scroll-mt-28 rounded-[28px] border border-[#3a5878]/22 bg-[#071525]/95 p-5 shadow-[0_14px_40px_rgba(2,6,20,0.45)] lg:p-6"
        >
          <p className="mb-5 text-sm uppercase tracking-[0.2em] text-[#7890a8]" style={{ fontFamily: "'Cinzel', serif" }}>Desempenho mensal (%)</p>
          <div className="h-[320px] w-full sm:h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 24, right: 8, left: -18, bottom: 8 }}>
                <CartesianGrid stroke="#162030" vertical={false} />
                <XAxis dataKey="shortLabel" tick={{ fill: '#8890a4', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  domain={monthlyDomain}
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fill: '#607080', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                />
                <RechartsTooltip
                  cursor={{ fill: 'rgba(60,90,140,0.12)' }}
                  contentStyle={{
                    backgroundColor: '#0a1928',
                    border: '1px solid rgba(60,90,130,0.45)',
                    borderRadius: '14px',
                    color: '#dce0ec',
                  }}
                  formatter={(value, _name, item) => [formatPercent(value), `Lucro: ${formatCurrency(item.payload.liquido)}`]}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Bar dataKey="percent" radius={[4, 4, 0, 0]} maxBarSize={30}>
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
          <section className="rounded-[28px] border border-[#3a5878]/22 bg-[#071525]/95 p-5 shadow-[0_14px_40px_rgba(2,6,20,0.45)] lg:p-6">
            <div className="mb-5 flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-[#5a7ea0]" />
              <p className="text-sm uppercase tracking-[0.2em] text-[#7890a8]" style={{ fontFamily: "'Cinzel', serif" }}>Desempenho por horário</p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-[1.1fr_0.9fr_1.1fr] gap-4 border-b border-[#3a5878]/22 pb-3 text-xs uppercase tracking-[0.14em] text-[#607080]">
                <span>Horário</span>
                <span>Lucro (R$)</span>
                <span>% do lucro total</span>
              </div>

              {(metrics.hourly ?? []).map((item) => (
                <div key={item.horario} className="grid grid-cols-[1.1fr_0.9fr_1.1fr] items-center gap-4 text-sm text-[#d8dce8]">
                  <span>{item.horario}</span>
                  <span className="font-medium text-[#5aaa7c]">{formatCurrency(item.liquido)}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#132030]">
                      <div
                        className={`h-full rounded-full ${getProgressBarClass(item.percent)}`}
                        style={{ width: `${clampProgressWidth(item.percent)}%` }}
                      />
                    </div>
                    <span className={`w-16 text-right ${getPercentTextClass(item.percent)}`}>{formatPercent(item.percent)}</span>
                  </div>
                </div>
              ))}

              <div className="grid grid-cols-[1.1fr_0.9fr_1.1fr] gap-4 border-t border-[#3a5878]/22 pt-4 text-sm font-semibold uppercase tracking-[0.08em]">
                <span className="text-[#9098b0]">Total</span>
                <span className="text-[#5aaa7c]">{formatCurrency(metrics.kpis?.lucro_liquido ?? 0)}</span>
                <span className="text-right text-[#5aaa7c]">100%</span>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-[#3a5878]/22 bg-[#071525]/95 p-5 shadow-[0_14px_40px_rgba(2,6,20,0.45)] lg:p-6">
            <p className="mb-5 text-sm uppercase tracking-[0.2em] text-[#7890a8]" style={{ fontFamily: "'Cinzel', serif" }}>Distribuição de lucro por MEP</p>
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
                      stroke="rgba(4,14,28,0.9)"
                      strokeWidth={3}
                    >
                      {pieData.map((item) => (
                        <Cell key={item.label} fill={item.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#0a1928',
                        border: '1px solid rgba(60,90,130,0.45)',
                        borderRadius: '14px',
                        color: '#dce0ec',
                      }}
                      formatter={(value) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                {pieData.map((item) => (
                  <div key={item.label} className="flex items-start justify-between gap-4 border-b border-[#3060a0]/15 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <div>
                        <p className="text-lg text-[#dce0ec]">{item.label}</p>
                        <p className="text-sm text-[#607080]">{formatCurrency(item.liquido)}</p>
                      </div>
                    </div>
                    <span className="text-2xl font-medium text-[#dce0ec]">{formatPercent(item.percent)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-start gap-4 rounded-2xl border border-[#3a5878]/30 bg-[#0d2035]/75 px-5 py-4">
              <Star className="mt-1 h-6 w-6 shrink-0 text-[#5a7ea0]" />
              <div>
                <p className="text-base font-semibold uppercase tracking-[0.08em] text-[#9098b0]">Estratégia diversificada</p>
                <p className="mt-1 text-sm leading-6 text-[#8890a4]">
                  O robô Gênesis opera em múltiplos MEPs para reduzir exposição concentrada em um único horário ou padrão de mercado.
                </p>
              </div>
            </div>
          </section>
        </div>

        <section id="filosofia" className="scroll-mt-28 rounded-[28px] border border-[#3a5878]/22 bg-[#071525]/95 p-5 shadow-[0_14px_40px_rgba(2,6,20,0.45)] lg:p-6">
          <p className="mb-5 text-sm uppercase tracking-[0.2em] text-[#7890a8]" style={{ fontFamily: "'Cinzel', serif" }}>Notas importantes</p>
          <div className="grid gap-4 md:grid-cols-3">
            <NoteCard
              icon={<ShieldCheck className="h-7 w-7 text-[#7898b8]" />}
              title="Rentabilidade passada não é garantia de futuro."
              description="Resultados históricos não garantem resultados futuros. Operações no mercado financeiro envolvem riscos."
            />
            <NoteCard
              icon={<Lock className="h-7 w-7 text-[#7898b8]" />}
              title="Acesso restrito"
              description="Os relatórios completos e as métricas detalhadas são compartilhados apenas com investidores que passam pela análise de perfil."
            />
            <NoteCard
              icon={<BadgeCheck className="h-7 w-7 text-[#7898b8]" />}
              title="Gestão profissional"
              description="Cada parâmetro do robô foi definido e testado com capital real. Não operamos com configuração padrão de mercado."
            />
          </div>
        </section>

        <section
          id="gestao-risco"
          className="scroll-mt-28 rounded-[28px] border border-[#3a5878]/22 bg-[#071525]/95 p-5 shadow-[0_14px_40px_rgba(2,6,20,0.45)] lg:p-6"
        >
          <div
            id="acesso"
            className="grid scroll-mt-28 gap-6 rounded-[24px] border border-[#304868]/28 bg-[radial-gradient(circle_at_right,_rgba(30,60,100,0.20),_transparent_34%),#071525] p-5 lg:grid-cols-[1fr_auto] lg:items-center lg:p-6"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-full border border-[#304868]/30 bg-[#0d1e30] p-3">
                <Lock className="h-7 w-7 text-[#5a7ea0]" />
              </div>
              <div>
                <p className="text-2xl uppercase tracking-[0.12em] text-[#9098b0]" style={{ fontFamily: "'Cinzel', serif" }}>Acesso exclusivo à estrutura completa</p>
                <p className="mt-2 max-w-3xl text-base leading-7 text-[#8890a4]">
                  Se os resultados fazem sentido pra você, o próximo passo é uma conversa direta. Vou apresentar a estrutura completa, tirar todas as dúvidas e ver se faz sentido para o seu perfil.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-3">
              <button
                type="button"
                onClick={() => setShowSaibaMais(true)}
                className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[linear-gradient(90deg,#304878,#4a6898,#8890b0)] px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#f0f2f8] transition hover:brightness-110"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Solicitar acesso
                <ArrowRight className="h-5 w-5" />
              </button>
              <p className="text-center text-xs uppercase tracking-[0.12em] text-[#607080]">Sem compromisso. Só uma conversa.</p>
            </div>
          </div>
        </section>
      </div>

      {showSaibaMais && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-[28px] border border-[#3a5878]/45 bg-[#040e1c] p-6 shadow-[0_0_100px_rgba(40,80,140,0.28)]">
            <button
              type="button"
              onClick={() => setShowSaibaMais(false)}
              className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-[#8890a4] transition hover:text-[#dce0ec]"
            >
              Fechar
            </button>

            {interestSent ? (
              <div className="py-8 text-center">
                <CheckCircle className="mx-auto mb-5 h-16 w-16 text-[#7898b8]" />
                <h3 className="text-2xl font-semibold uppercase tracking-[0.12em] text-[#e0e4f0]" style={{ fontFamily: "'Cinzel', serif" }}>Recebemos seu contato</h3>
                <p className="mt-3 text-sm leading-6 text-[#8890a4]">Um especialista da Dominus Capital entrará em contato em breve.</p>
              </div>
            ) : (
              <>
                <div className="mb-6 space-y-3 text-center">
                  <p className="text-sm uppercase tracking-[0.18em] text-[#9ab0cc]" style={{ fontFamily: "'Cinzel', serif" }}>Solicitar acesso</p>
                  <h3 className="text-3xl font-semibold uppercase tracking-[0.1em] text-[#e0e4f0]" style={{ fontFamily: "'Cinzel', serif" }}>Estrutura Dominus</h3>
                  <p className="text-sm leading-6 text-[#8890a4]">Deixe seus dados abaixo para agendarmos uma apresentação exclusiva.</p>
                </div>

                <form onSubmit={submitSaibaMais} className="space-y-4">
                  <input
                    required
                    type="text"
                    placeholder="Seu nome completo"
                    value={interestForm.name}
                    onChange={(e) => setInterestForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-[#071525] px-4 py-3 text-[#dce0ec] outline-none transition focus:border-[#6080a0] placeholder:text-[#607080]"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Seu melhor e-mail"
                    value={interestForm.email}
                    onChange={(e) => setInterestForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-[#071525] px-4 py-3 text-[#dce0ec] outline-none transition focus:border-[#6080a0] placeholder:text-[#607080]"
                  />
                  <input
                    required
                    type="tel"
                    placeholder="WhatsApp"
                    value={interestForm.phone}
                    onChange={handlePhoneChange}
                    className="w-full rounded-2xl border border-white/10 bg-[#071525] px-4 py-3 text-[#dce0ec] outline-none transition focus:border-[#6080a0] placeholder:text-[#607080]"
                  />

                  {submitError && <p className="text-center text-sm text-red-400">{submitError}</p>}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-2xl bg-[linear-gradient(90deg,#304878,#4a6898,#7890c0)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#f0f2f8] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {isSubmitting ? 'Enviando...' : 'Quero conhecer agora'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryMetric({ title, value, detail, positive = false, negative = false }) {
  return (
    <div className="bg-[#0c1b2a] p-5">
      <p className="text-xs uppercase tracking-[0.14em] text-[#607080]">{title}</p>
      <p className={`mt-3 text-[2rem] font-medium leading-none ${positive ? 'text-[#5aaa7c]' : negative ? 'text-[#c07070]' : 'text-[#dce0ec]'}`}>
        {value}
      </p>
      <p className="mt-3 text-sm text-[#8890a4]">{detail}</p>
    </div>
  );
}

function NoteCard({ icon, title, description }) {
  return (
    <div className="flex gap-4 rounded-[24px] border border-[#304860]/30 bg-[#0c1b2a] p-5">
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-lg uppercase leading-7 text-[#dce0ec]">{title}</p>
        <p className="mt-2 text-sm leading-6 text-[#8890a4]">{description}</p>
      </div>
    </div>
  );
}

function renderBarLabel({ x, y, width, height, value }) {
  if (typeof value !== 'number') return null;
  const labelY = value >= 0 ? y + POSITIVE_LABEL_OFFSET_Y : y + height + NEGATIVE_LABEL_OFFSET_Y;
  return (
    <text x={x + width / 2} y={labelY} fill="#8890a4" fontSize="11" textAnchor="middle">
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
  return percent >= 0 ? 'bg-[#3a7858]' : 'bg-[#8a5050]';
}

function getPercentTextClass(percent) {
  return percent >= 0 ? 'text-[#8890a4]' : 'text-[#c08080]';
}
