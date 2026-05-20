import { useState, useMemo } from 'react';
import tradesData from '../data/trades.json';
import { computeMetrics } from '../lib/computeMetrics';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  Area, AreaChart, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { CheckCircle, TrendingUp, Bot, X, Percent, Filter, TableProperties } from 'lucide-react';

export default function Dashboard() {
  const [showSaibaMais, setShowSaibaMais] = useState(false);
  const [interestForm, setInterestForm] = useState({ email: '', phone: '', name: '' });
  const [interestSent, setInterestSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [showMobileDaily, setShowMobileDaily] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [selectedAno, setSelectedAno] = useState([]);
  const [selectedMes, setSelectedMes] = useState([]);
  const [selectedDia, setSelectedDia] = useState([]);
  const [selectedPeriodo, setSelectedPeriodo] = useState([]);

  const toggle = (setter) => (value) =>
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);

  const metrics = useMemo(() => computeMetrics(tradesData, {
    ano: selectedAno,
    mes: selectedMes,
    dia: selectedDia,
    periodo: selectedPeriodo,
  }), [selectedAno, selectedMes, selectedDia, selectedPeriodo]);

  const filterLabel = useMemo(() => {
    const hasFilter = selectedAno.length > 0 || selectedMes.length > 0 || selectedDia.length > 0 || selectedPeriodo.length > 0;
    if (!hasFilter) return 'Histórico Completo';
    const parts = [];
    if (selectedAno.length > 0) parts.push([...selectedAno].sort((a, b) => a - b).join(', '));
    if (selectedMes.length > 0) {
      const mesesOrdem = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
      const sorted = [...selectedMes].sort((a, b) => mesesOrdem.indexOf(a.toLowerCase()) - mesesOrdem.indexOf(b.toLowerCase()));
      parts.push(sorted.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', '));
    }
    if (selectedDia.length > 0) parts.push('Dias: ' + [...selectedDia].sort((a, b) => a - b).join(', '));
    if (selectedPeriodo.length > 0) parts.push(selectedPeriodo.join(', '));
    return parts.join(' · ');
  }, [selectedAno, selectedMes, selectedDia, selectedPeriodo]);

  const submitSaibaMais = async (e) => {
    if (e) e.preventDefault();
    if (!process.env.REACT_APP_FORMSPREE_URL) {
      setSubmitError('Formulário não configurado. Entre em contato diretamente.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch(process.env.REACT_APP_FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          subject: `Novo lead Robô Gênesis: ${interestForm.name}`,
          nome: interestForm.name,
          email: interestForm.email,
          whatsapp: interestForm.phone,
        }),
      });
      if (res.ok) {
        setInterestSent(true);
        setTimeout(() => {
          setShowSaibaMais(false);
          setInterestSent(false);
          setInterestForm({ email: '', phone: '', name: '' });
        }, 3000);
      } else {
        setSubmitError('Não foi possível enviar. Por favor, tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao enviar formulário:', err);
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
      formatted = `(${value.slice(0, 2)}) ${value.length > 7 ? value.slice(2, 7) + '-' + value.slice(7) : value.slice(2)}`;
    }
    setInterestForm({ ...interestForm, phone: formatted });
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const dias = Array.from({ length: 31 }, (_, i) => i + 1);
  const periodos = ['Manhã', 'Tarde'];

  const pieData = [
    { name: 'Gains', value: metrics.kpis.gains, color: '#10b981' },
    { name: 'Loss', value: metrics.kpis.loss, color: '#ef4444' },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#050505] text-gray-100 font-sans bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
      
      {/* Top Bar / Header */}
      <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end bg-[#0a0a0a] border-b border-[#d4af37]/30 p-4 md:p-5 lg:px-6 shadow-[0_4px_30px_rgba(0,0,0,0.8)] relative z-20 shrink-0">
        <div className="absolute top-0 left-0 right-0 h-1 md:h-1.5 bg-gradient-to-r from-[#d4af37] via-[#f9e596] to-[#d4af37]"></div>
        
        <div className="text-center lg:text-left mt-2 lg:mt-0 w-full lg:w-auto">
          <div className="flex items-center justify-center gap-3 lg:justify-start">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d4af37]/50 bg-[#121212] text-sm font-black tracking-[0.15em] text-[#f9e596] shadow-[0_0_24px_rgba(212,175,55,0.2)]">
              DC
            </span>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl 2xl:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#fff] to-[#d4af37] tracking-tighter uppercase drop-shadow-[0_0_20px_rgba(212,175,55,0.4)] leading-tight">
                DOMINUS CAPITAL
              </h1>
              <p className="text-[#d4af37] tracking-[0.18em] sm:tracking-[0.24em] text-[9px] sm:text-[10px] font-bold mt-0.5">
                Resultados reais · disciplina · tecnologia · performance
              </p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setShowSaibaMais(true)} 
          className="mt-4 lg:mt-0 relative group overflow-hidden rounded-lg p-[2px] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.6)] transition-shadow w-full sm:w-auto shrink-0"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-[#d4af37] via-[#f9e596] to-[#d4af37] animate-[spin_3s_linear_infinite] group-hover:animate-none"></span>
          <div className="relative bg-[#050505] px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg flex items-center justify-center gap-3 transition-all group-hover:bg-gradient-to-r group-hover:from-[#d4af37] group-hover:to-[#b5952f]">
             <Bot className="w-5 h-5 sm:w-7 sm:h-7 text-[#d4af37] group-hover:text-black group-hover:animate-bounce" />
             <span className="text-xs sm:text-base lg:text-lg font-black text-[#d4af37] group-hover:text-black uppercase tracking-wider">
               SAIBA MAIS SOBRE O ROBÔ
             </span>
          </div>
        </button>
      </div>

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden relative w-full">
        
        {(showMobileDaily || showMobileFilters) && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 xl:hidden" 
            onClick={() => { setShowMobileDaily(false); setShowMobileFilters(false); }} 
          />
        )}

        {/* LEFT COLUMN: Daily Table */}
        <div className={`
          fixed xl:static inset-y-0 left-0 z-50 xl:z-auto
          w-[280px] 2xl:w-[320px] shrink-0 bg-[#0a0a0a] border-r border-[#d4af37]/20 flex flex-col shadow-2xl
          transition-transform duration-300 ease-in-out
          ${showMobileDaily ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
        `}>
          <div className="bg-[#111] p-3 2xl:p-4 border-b border-[#d4af37]/20 flex justify-between items-center shrink-0">
            <div className="flex flex-col min-w-0">
              <h3 className="text-[#d4af37] text-xs 2xl:text-sm font-bold uppercase tracking-widest leading-tight">Desempenho Diário</h3>
              <span className="text-[9px] 2xl:text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5 break-words">{filterLabel}</span>
            </div>
            <button onClick={() => setShowMobileDaily(false)} className="xl:hidden text-gray-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-[#d4af37]/30 flex-1">
            <table className="w-full text-[10px] 2xl:text-xs text-right border-collapse">
              <thead className="bg-[#161616] text-gray-400 sticky top-0 shadow-md z-10">
                <tr>
                  <th className="p-2.5 2xl:p-3 text-center border-b border-[#d4af37]/20">Dia</th>
                  <th className="p-2.5 2xl:p-3 border-b border-[#d4af37]/20">Líquido</th>
                  <th className="p-2.5 2xl:p-3 border-b border-[#d4af37]/20 hidden sm:table-cell">Acumulado</th>
                  <th className="p-2.5 2xl:p-3 border-b border-[#d4af37]/20 text-center">Assert.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {metrics.daily.map((d, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="p-2.5 2xl:p-3 text-center font-bold text-gray-500 border-r border-white/5">{d.dia}</td>
                    <td className={`p-2.5 2xl:p-3 font-black border-r border-white/5 ${d.liquido >= 0 ? 'text-emerald-500 bg-emerald-500/5' : 'text-rose-500 bg-rose-500/5'}`}>
                      {formatCurrency(d.liquido)}
                    </td>
                    <td className="p-2.5 2xl:p-3 font-semibold text-gray-400 border-r border-white/5 hidden sm:table-cell">
                      {formatCurrency(d.acumulado)}
                    </td>
                    <td className="p-2.5 2xl:p-3 text-center text-gray-400 font-bold">{d.assertividade}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CENTER COLUMN */}
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide p-3 sm:p-4 lg:p-6 gap-4 sm:gap-5 w-full relative min-w-0">
          
          <div className="flex xl:hidden gap-3 w-full shrink-0">
            <button 
              onClick={() => setShowMobileDaily(true)} 
              className="flex-1 bg-[#111] border border-[#d4af37]/30 text-[#d4af37] p-2.5 rounded-lg flex items-center justify-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-md active:scale-95 transition-all"
            >
              <TableProperties className="w-4 h-4"/> Ver Diário
            </button>
            <button 
              onClick={() => setShowMobileFilters(true)} 
              className="flex-1 bg-[#111] border border-[#d4af37]/30 text-[#d4af37] p-2.5 rounded-lg flex items-center justify-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-md active:scale-95 transition-all"
            >
              <Filter className="w-4 h-4"/> Filtros
            </button>
          </div>

          {/* KPIs */}
          <div className="flex flex-col gap-3 sm:gap-4 w-full shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="sm:col-span-2 bg-[#111] border border-[#d4af37]/50 rounded-xl p-4 md:p-5 flex flex-col justify-center relative overflow-hidden shadow-[0_0_15px_rgba(212,175,55,0.1)] group">
                <div className="absolute right-0 top-0 w-32 h-32 bg-[#d4af37]/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-[#d4af37]/20 transition-all"></div>
                <span className="text-[#d4af37] text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 relative z-10">Lucro Total Líquido</span>
                <span className={`text-3xl xl:text-4xl font-black relative z-10 truncate ${metrics.kpis.lucro_liquido >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(metrics.kpis.lucro_liquido || 0)}
                </span>
              </div>
              
              <div className="sm:col-span-1 bg-[#0a0a0a] border border-white/10 rounded-xl p-4 flex flex-col justify-center">
                <span className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">Lucro Bruto</span>
                <span className="text-xl xl:text-2xl font-bold text-white truncate">{formatCurrency(metrics.kpis.lucro_bruto || 0)}</span>
                <span className="text-[10px] text-rose-400 font-semibold mt-1 truncate">Losers: {formatCurrency(metrics.kpis.total_perdido || 0)}</span>
              </div>

              <div className="sm:col-span-1 flex flex-col gap-2 h-full">
                <div className="flex-1 bg-rose-500/10 border border-rose-500/20 rounded-xl flex flex-col justify-center px-4 py-2">
                  <span className="text-[9px] md:text-[10px] text-rose-500/70 font-bold uppercase tracking-wider">DrawDown Max</span>
                  <span className="text-sm md:text-base font-bold text-rose-500 truncate">{formatCurrency(metrics.kpis.drawdown || 0)}</span>
                </div>
                <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col justify-center px-4 py-2">
                  <span className="text-[9px] md:text-[10px] text-emerald-500/70 font-bold uppercase tracking-wider">Run-Up Max</span>
                  <span className="text-sm md:text-base font-bold text-emerald-500 truncate">{formatCurrency(metrics.kpis.runup || 0)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              <SmallKpi title="Operações" value={metrics.kpis.operacoes || 0} />
              <SmallKpi title="Gains" value={metrics.kpis.gains || 0} color="text-emerald-500" />
              <SmallKpi title="Loss" value={metrics.kpis.loss || 0} color="text-rose-500" />
              <SmallKpi title="Assertividade" value={`${metrics.kpis.assertividade || 0}%`} color="text-[#d4af37]" />
              <SmallKpi title="Dias Oper." value={metrics.kpis.dias_operados || 0} className="col-span-2 sm:col-span-1 lg:col-span-1" />
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 w-full">
            <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-xl p-4 sm:p-5 shadow-2xl flex flex-col min-h-[300px] sm:min-h-[350px] min-w-0">
              <h3 className="text-[#d4af37] text-[11px] sm:text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4"/> Evolução do Capital Real
              </h3>
              <div className="flex-1 w-full min-h-[200px] sm:min-h-[250px] min-w-0">
                {metrics.chart.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.chart} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAcum2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d4af37" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="dia" stroke="#555" tick={{fill: '#888', fontSize: 10}} tickMargin={10} minTickGap={20} />
                      <YAxis stroke="#555" tick={{fill: '#888', fontSize: 10}} tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`} width={55} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#111', border: '1px solid #d4af37', borderRadius: '4px', fontSize: '12px' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value) => [formatCurrency(value), "Acumulado"]}
                      />
                      <Area type="monotone" dataKey="acumulado" stroke="#d4af37" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAcum2)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-600 text-xs">Sem dados</div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1 bg-[#0a0a0a] border border-white/10 rounded-xl p-4 sm:p-5 shadow-2xl flex flex-col items-center justify-center relative min-h-[280px]">
               <h3 className="text-[#d4af37] text-[11px] sm:text-xs font-bold uppercase tracking-widest absolute top-4 left-4 sm:top-5 sm:left-5 flex items-center gap-2">
                 <Percent className="w-4 h-4"/> Win Rate
               </h3>
               <div className="w-full h-[180px] sm:h-[220px] mt-6 min-w-0">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie data={pieData} cx="50%" cy="50%" innerRadius="65%" outerRadius="85%" paddingAngle={5} dataKey="value" stroke="none">
                       {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                     </Pie>
                     <RechartsTooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px', fontSize: '12px' }} itemStyle={{ color: '#fff' }} />
                   </PieChart>
                 </ResponsiveContainer>
               </div>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-6">
                  <span className="text-3xl md:text-4xl font-black text-white">{metrics.kpis.assertividade || 0}%</span>
               </div>
               <div className="flex gap-4 mt-2 bg-[#111] py-1.5 px-3 sm:py-2 sm:px-4 rounded-full border border-white/5 shadow-inner">
                 <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-400 font-bold">
                   <div className="w-2.5 h-2.5 rounded bg-emerald-500 shadow-[0_0_8px_#10b981]"></div> GAINS
                 </div>
                 <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-400 font-bold">
                   <div className="w-2.5 h-2.5 rounded bg-rose-500 shadow-[0_0_8px_#ef4444]"></div> LOSS
                 </div>
               </div>
            </div>
          </div>

          {/* Bottom Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full pb-8">
            <SimpleTable title="Resumo Mensal" data={metrics.monthly} cols={['mes', 'liquido', 'percent', 'acumulado']} />
            <SimpleTable title="Resumo por Horário" data={metrics.hourly} cols={['horario', 'liquido', 'percent']} />
            <SimpleTable title="MEP Líquido" data={metrics.mep} cols={['mep', 'liquido', 'percent']} />
          </div>

        </div>

        {/* RIGHT COLUMN: Filters */}
        <div className={`
          fixed xl:static inset-y-0 right-0 z-50 xl:z-auto
          w-[250px] 2xl:w-[280px] shrink-0 bg-[#0a0a0a] border-l border-[#d4af37]/20 p-4 2xl:p-5 flex flex-col gap-5 shadow-2xl
          overflow-y-auto scrollbar-hide transition-transform duration-300 ease-in-out
          ${showMobileFilters ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}
        `}>
          <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
            <h3 className="text-[#d4af37] font-bold uppercase tracking-widest text-xs 2xl:text-sm flex items-center gap-2">
               <Filter className="w-4 h-4"/> Filtros
            </h3>
            <div className="flex gap-2 items-center">
              {(selectedAno.length > 0 || selectedMes.length > 0 || selectedDia.length > 0 || selectedPeriodo.length > 0) && (
                <button onClick={() => { setSelectedAno([]); setSelectedMes([]); setSelectedDia([]); setSelectedPeriodo([]); }} className="text-[9px] uppercase font-bold text-rose-500 hover:text-rose-400 bg-rose-500/10 px-2 py-1 rounded transition-colors">Limpar</button>
              )}
              <button onClick={() => setShowMobileFilters(false)} className="xl:hidden text-gray-400 hover:text-white p-1 bg-white/5 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {metrics.available_years && metrics.available_years.length > 0 && (
            <div>
              <h4 className="text-[9px] 2xl:text-[10px] text-gray-500 uppercase font-bold mb-2.5 tracking-widest">Ano</h4>
              <div className="grid grid-cols-2 gap-2">
                {metrics.available_years.map(a => (
                  <button key={a} onClick={() => toggle(setSelectedAno)(a)}
                    className={`text-[10px] 2xl:text-xs py-1.5 2xl:py-2 px-1 rounded border transition-all uppercase font-bold tracking-wider ${selectedAno.includes(a) ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.2)]' : 'bg-[#111] border-white/5 text-gray-400 hover:border-white/20 hover:text-white'}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-white/5">
            <h4 className="text-[9px] 2xl:text-[10px] text-gray-500 uppercase font-bold mb-2.5 tracking-widest">Meses</h4>
            <div className="grid grid-cols-2 gap-2">
              {meses.map(m => (
                <button key={m} onClick={() => toggle(setSelectedMes)(m)}
                  className={`text-[10px] 2xl:text-xs py-1.5 2xl:py-2 px-1 rounded border transition-all uppercase font-bold tracking-wider ${selectedMes.includes(m) ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.2)]' : 'bg-[#111] border-white/5 text-gray-400 hover:border-white/20 hover:text-white'}`}>
                  {m.substring(0,3)}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/5">
            <h4 className="text-[9px] 2xl:text-[10px] text-gray-500 uppercase font-bold mb-2.5 tracking-widest">Período</h4>
            <div className="grid grid-cols-2 gap-2">
              {periodos.map(p => (
                <button key={p} onClick={() => toggle(setSelectedPeriodo)(p)}
                  className={`text-[10px] 2xl:text-xs py-1.5 2xl:py-2 px-1 rounded border transition-all uppercase font-bold tracking-wider ${selectedPeriodo.includes(p) ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-[#111] border-white/5 text-gray-400 hover:border-white/20 hover:text-white'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 pb-8">
            <h4 className="text-[9px] 2xl:text-[10px] text-gray-500 uppercase font-bold mb-2.5 tracking-widest">Dias do Mês</h4>
            <div className="grid grid-cols-5 gap-1.5">
              {dias.map(d => (
                <button key={d} onClick={() => toggle(setSelectedDia)(d)}
                  className={`text-[10px] 2xl:text-xs aspect-square flex items-center justify-center rounded border transition-all font-bold ${selectedDia.includes(d) ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-[0_0_8px_rgba(212,175,55,0.4)]' : 'bg-[#111] border-white/5 text-gray-400 hover:border-white/20 hover:text-white hover:bg-[#1a1a1a]'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Modal Saiba Mais */}
      {showSaibaMais && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#050505] border border-[#d4af37] rounded-xl w-full max-w-md p-6 md:p-8 relative shadow-[0_0_100px_rgba(212,175,55,0.2)] max-h-[95vh] overflow-y-auto scrollbar-hide">
            <button onClick={() => setShowSaibaMais(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white bg-white/5 p-2 rounded-full transition-colors">
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            
            {interestSent ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 md:w-20 md:h-20 text-[#d4af37] mx-auto mb-6 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
                <h3 className="text-xl md:text-2xl font-black text-white mb-2 tracking-tight uppercase">RECEBEMOS SEU CONTATO!</h3>
                <p className="text-gray-400 text-sm md:text-base">Um especialista da <strong className="text-[#d4af37]">Dominus Capital</strong> entrará em contato em breve.</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6 mt-2">
                  <div className="inline-block p-3 md:p-4 rounded-full bg-[#d4af37]/10 mb-4 border border-[#d4af37]/30 shadow-inner">
                    <Bot className="w-8 h-8 md:w-10 md:h-10 text-[#d4af37]" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-[#d4af37] mb-1.5 uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">ROBÔ GÊNESIS</h3>
                  <p className="text-gray-400 text-xs md:text-sm font-medium tracking-wide">Deixe seus dados abaixo para agendarmos uma apresentação exclusiva.</p>
                </div>
                
                <form onSubmit={submitSaibaMais} className="space-y-4">
                  <div>
                    <input required type="text" placeholder="SEU NOME COMPLETO" value={interestForm.name} onChange={e => setInterestForm({...interestForm, name: e.target.value})}
                      className="w-full bg-[#111] border border-white/10 rounded-lg p-3.5 md:p-4 text-white placeholder:text-gray-600 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none uppercase text-xs font-bold tracking-widest transition-all shadow-inner" />
                  </div>
                  <div>
                    <input required type="email" placeholder="SEU MELHOR EMAIL" value={interestForm.email} onChange={e => setInterestForm({...interestForm, email: e.target.value})}
                      className="w-full bg-[#111] border border-white/10 rounded-lg p-3.5 md:p-4 text-white placeholder:text-gray-600 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none uppercase text-xs font-bold tracking-widest transition-all shadow-inner" />
                  </div>
                  <div>
                    <input required type="tel" placeholder="WHATSAPP Ex: (11) 99999-9999" value={interestForm.phone} onChange={handlePhoneChange}
                      className="w-full bg-[#111] border border-white/10 rounded-lg p-3.5 md:p-4 text-white placeholder:text-gray-600 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none uppercase text-xs font-bold tracking-widest transition-all shadow-inner" />
                  </div>
                  {submitError && (
                    <p className="text-red-400 text-xs text-center font-bold">{submitError}</p>
                  )}
                  <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-[#d4af37] via-[#f9e596] to-[#d4af37] text-black font-black text-sm md:text-base uppercase tracking-[0.2em] p-3.5 md:p-4 rounded-lg mt-4 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100">
                    {isSubmitting ? 'ENVIANDO...' : 'QUERO CONHECER AGORA'}
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

function SmallKpi({ title, value, color = "text-white", className = "" }) {
  return (
    <div className={`col-span-1 bg-[#0a0a0a] border border-white/10 rounded-xl p-3 md:p-4 flex flex-col justify-center text-center shadow-md hover:border-white/20 transition-colors ${className}`}>
      <span className="text-gray-500 text-[8px] md:text-[9px] font-bold uppercase tracking-widest mb-1">{title}</span>
      <span className={`text-lg sm:text-xl md:text-2xl font-black truncate ${color}`}>{value}</span>
    </div>
  );
}

function SimpleTable({ title, data, cols }) {
  const colLabels = { mes: 'Mês/Ano', liquido: 'Lucro (R$)', percent: '% Capital', acumulado: 'Acumulado (R$)' };
  if (!data) return null;
  return (
    <div className="bg-[#0a0a0a] rounded-xl border border-white/10 overflow-hidden flex flex-col h-[280px] shadow-xl min-w-0">
      <div className="p-3 md:p-4 border-b border-[#d4af37]/20 bg-[#111] shrink-0">
        <h3 className="font-bold text-[10px] md:text-xs text-[#d4af37] uppercase tracking-widest">{title}</h3>
      </div>
      <div className="overflow-x-auto overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-[#d4af37]/20 w-full">
        <table className="w-full min-w-[220px] text-xs text-right border-collapse">
          <thead className="bg-[#161616] text-gray-500 sticky top-0 shadow-sm z-10">
            <tr>
              {cols.map((c, i) => (
                <th key={c} className={`p-2.5 md:p-3 font-bold uppercase tracking-wider border-b border-white/10 whitespace-nowrap ${i===0 ? 'text-left' : ''}`}>{colLabels[c] || c}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-[#111] transition-colors">
                {cols.map((c, j) => {
                  let val = row[c];
                  if (c === 'liquido' || c === 'acumulado') {
                    val = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
                  } else if (c === 'percent') {
                    val = `${val}%`;
                  }
                  const isCurrency = c === 'liquido' || c === 'acumulado';
                  const isPositive = isCurrency && row[c] >= 0;
                  const isNegative = isCurrency && row[c] < 0;
                  return (
                    <td key={j} className={`p-2.5 md:p-3 border-r border-white/5 last:border-r-0 whitespace-nowrap ${j===0 ? 'text-left text-gray-400 font-bold capitalize' : ''} ${isPositive ? 'text-emerald-400 font-bold' : isNegative ? 'text-rose-400 font-bold' : 'text-gray-300'}`}>
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={cols.length} className="p-4 text-center text-gray-500">Sem dados</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
