import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '../App';
import { Link } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  Area, AreaChart, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { LogOut, CheckCircle, TrendingUp, ShieldCheck, Cpu, PlayCircle, Bot, X, CalendarDays, Percent, DollarSign, Activity } from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useContext(AuthContext);

  const [showSaibaMais, setShowSaibaMais] = useState(false);
  const [interestForm, setInterestForm] = useState({ email: '', phone: '', name: '' });
  const [interestSent, setInterestSent] = useState(false);

  // Filters
  const [selectedMes, setSelectedMes] = useState(null);
  const [selectedDia, setSelectedDia] = useState(null);
  const [selectedPeriodo, setSelectedPeriodo] = useState(null);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedMes) params.append('mes', selectedMes);
      if (selectedDia) params.append('dia', selectedDia);
      if (selectedPeriodo) params.append('periodo', selectedPeriodo);

      const res = await axios.get(`${API}/dashboard/metrics?${params.toString()}`, { withCredentials: true });
      setMetrics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [selectedMes, selectedDia, selectedPeriodo, user]);

  const submitSaibaMais = async (e) => {
    if(e) e.preventDefault();
    try {
      await axios.post(`${API}/leads/interest`, interestForm, { withCredentials: true });
      setInterestSent(true);
      setTimeout(() => { setShowSaibaMais(false); setInterestSent(false); }, 3000);
    } catch (err) {
      console.error("Erro ao enviar interesse");
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const dias = Array.from({ length: 31 }, (_, i) => i + 1);
  const periodos = ['Manhã', 'Tarde'];

  if (!metrics && loading) {
    return <div className="flex h-screen items-center justify-center bg-[#050505] text-[#d4af37] text-2xl font-black tracking-widest animate-pulse">CARREGANDO DADOS GÊNESIS...</div>;
  }

  const pieData = metrics ? [
    { name: 'Gains', value: metrics.kpis.gains, color: '#10b981' },
    { name: 'Loss', value: metrics.kpis.loss, color: '#ef4444' }
  ] : [];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#050505] text-gray-100 font-sans bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
      
      {/* Top Bar / Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-[#0a0a0a] border-b border-[#d4af37]/30 p-6 shadow-[0_4px_30px_rgba(0,0,0,0.8)] relative z-20">
        <div className="text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#fff] to-[#d4af37] tracking-tighter uppercase drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">
             DOMINUS CAPITAL
          </h1>
          <p className="text-[#d4af37] tracking-[0.4em] text-sm md:text-base font-bold mt-1 uppercase">
            Performance Institucional Gênesis
          </p>
        </div>
        
        <button 
          onClick={() => setShowSaibaMais(true)} 
          className="mt-6 md:mt-0 relative group overflow-hidden rounded-lg p-[2px] shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_50px_rgba(212,175,55,0.6)] transition-shadow"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-[#d4af37] via-[#f9e596] to-[#d4af37] animate-[spin_3s_linear_infinite] group-hover:animate-none"></span>
          <div className="relative bg-[#050505] px-8 py-4 rounded-lg flex items-center gap-4 transition-all group-hover:bg-gradient-to-r group-hover:from-[#d4af37] group-hover:to-[#b5952f]">
             <Bot className="w-8 h-8 text-[#d4af37] group-hover:text-black group-hover:animate-bounce" />
             <span className="text-xl md:text-2xl font-black text-[#d4af37] group-hover:text-black uppercase tracking-wider">
               SAIBA MAIS SOBRE O ROBÔ
             </span>
          </div>
        </button>
      </div>

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT COLUMN: Daily Table */}
        <div className="hidden lg:flex w-[350px] bg-[#0a0a0a] border-r border-[#d4af37]/20 flex-col z-10 shadow-2xl">
          <div className="bg-[#111] p-4 border-b border-[#d4af37]/20">
            <h3 className="text-[#d4af37] text-sm font-bold uppercase tracking-widest text-center">Desempenho Diário</h3>
          </div>
          <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-[#d4af37]/30 flex-1">
            <table className="w-full text-xs text-right border-collapse">
              <thead className="bg-[#161616] text-gray-400 sticky top-0 shadow-md">
                <tr>
                  <th className="p-3 text-center border-b border-[#d4af37]/20">Dia</th>
                  <th className="p-3 border-b border-[#d4af37]/20">Líquido</th>
                  <th className="p-3 border-b border-[#d4af37]/20">Acumulado</th>
                  <th className="p-3 border-b border-[#d4af37]/20">Assert.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {metrics?.daily.map((d, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 text-center font-bold text-gray-500 border-r border-white/5">{d.dia}</td>
                    <td className={`p-3 font-black border-r border-white/5 ${d.liquido >= 0 ? 'text-emerald-500 bg-emerald-500/5' : 'text-rose-500 bg-rose-500/5'}`}>
                      {formatCurrency(d.liquido)}
                    </td>
                    <td className="p-3 font-semibold text-gray-300 border-r border-white/5">{formatCurrency(d.acumulado)}</td>
                    <td className="p-3 text-gray-400 font-bold">{d.assertividade}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CENTER COLUMN: Dashboard & Charts */}
        <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide p-6 gap-6 relative">
          
          {/* Top KPIs Row (PowerBI Style) */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-3">
            <div className="col-span-2 bg-[#111] border border-[#d4af37]/50 rounded-lg p-4 flex flex-col justify-center relative overflow-hidden shadow-[0_0_15px_rgba(212,175,55,0.1)]">
              <div className="absolute right-0 top-0 w-32 h-32 bg-[#d4af37]/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <span className="text-[#d4af37] text-xs font-bold uppercase tracking-widest mb-1 relative z-10">Lucro Líquido</span>
              <span className={`text-2xl xl:text-3xl font-black relative z-10 ${metrics?.kpis.lucro_liquido >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(metrics?.kpis.lucro_liquido || 0)}
              </span>
            </div>
            
            <div className="col-span-2 bg-[#0a0a0a] border border-white/10 rounded-lg p-4 flex flex-col justify-center">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Lucro Bruto</span>
              <span className="text-xl font-bold text-white">{formatCurrency(metrics?.kpis.lucro_bruto || 0)}</span>
              <span className="text-[10px] text-rose-400 font-semibold mt-1">Custos: {formatCurrency(metrics?.kpis.custos || 0)}</span>
            </div>

            <SmallKpi title="Operações" value={metrics?.kpis.operacoes || 0} />
            <SmallKpi title="Gains" value={metrics?.kpis.gains || 0} color="text-emerald-500" />
            <SmallKpi title="Loss" value={metrics?.kpis.loss || 0} color="text-rose-500" />
            <SmallKpi title="Assertividade" value={`${metrics?.kpis.assertividade || 0}%`} color="text-[#d4af37]" />
            <SmallKpi title="Dias Operados" value={metrics?.kpis.dias_operados || 0} />
            
            <div className="col-span-1 flex flex-col gap-2">
              <div className="flex-1 bg-rose-500/10 border border-rose-500/20 rounded-md flex flex-col justify-center px-3">
                <span className="text-[9px] text-rose-500/70 font-bold uppercase">DrawDown</span>
                <span className="text-sm font-bold text-rose-500">{formatCurrency(metrics?.kpis.drawdown || 0)}</span>
              </div>
              <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md flex flex-col justify-center px-3">
                <span className="text-[9px] text-emerald-500/70 font-bold uppercase">Run-Up</span>
                <span className="text-sm font-bold text-emerald-500">{formatCurrency(metrics?.kpis.runup || 0)}</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Big Area Chart */}
            <div className="xl:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-xl p-5 shadow-2xl flex flex-col min-h-[350px]">
              <h3 className="text-[#d4af37] text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4"/> Evolução Patrimonial
              </h3>
              <div className="flex-1 w-full">
                {metrics && metrics.chart.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.chart} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAcum2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="dia" stroke="#555" tick={{fill: '#888', fontSize: 11}} />
                      <YAxis stroke="#555" tick={{fill: '#888', fontSize: 11}} tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`} width={60} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#111', border: '1px solid #d4af37', borderRadius: '4px' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value) => [formatCurrency(value), "Capital Acumulado"]}
                      />
                      <Area type="monotone" dataKey="acumulado" stroke="#d4af37" strokeWidth={3} fillOpacity={1} fill="url(#colorAcum2)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-600">Sem dados para este filtro</div>
                )}
              </div>
            </div>

            {/* Win Rate Donut */}
            <div className="xl:col-span-1 bg-[#0a0a0a] border border-white/10 rounded-xl p-5 shadow-2xl flex flex-col items-center justify-center relative">
               <h3 className="text-[#d4af37] text-sm font-bold uppercase tracking-widest absolute top-5 left-5 flex items-center gap-2"><Percent className="w-4 h-4"/> Win Rate</h3>
               <div className="w-full h-[200px] mt-4">
                 {metrics && (
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                         {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                       </Pie>
                       <RechartsTooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px' }} itemStyle={{ color: '#fff' }} />
                     </PieChart>
                   </ResponsiveContainer>
                 )}
               </div>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
                  <span className="text-3xl font-black text-white">{metrics?.kpis?.assertividade || 0}%</span>
               </div>
               <div className="flex gap-4 mt-2">
                 <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold"><div className="w-3 h-3 rounded bg-emerald-500"></div> GAINS</div>
                 <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold"><div className="w-3 h-3 rounded bg-rose-500"></div> LOSS</div>
               </div>
            </div>
          </div>

          {/* Bottom Tables / Mini Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SimpleTable title="Resumo Mensal" data={metrics?.monthly} cols={['mes', 'liquido', 'percent']} />
            <SimpleTable title="Resumo por Horário" data={metrics?.hourly} cols={['horario', 'liquido', 'percent']} />
            <SimpleTable title="MEP Líquido" data={metrics?.mep} cols={['mep', 'liquido', 'percent']} />
          </div>

        </div>

        {/* RIGHT COLUMN: Filters Sidebar */}
        <div className="w-72 bg-[#0a0a0a] border-l border-[#d4af37]/20 p-5 flex flex-col gap-6 overflow-y-auto scrollbar-hide shadow-2xl z-10">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <h3 className="text-[#d4af37] font-bold uppercase tracking-widest text-sm">Filtros Avançados</h3>
            {(selectedMes || selectedDia || selectedPeriodo) && (
              <button onClick={() => { setSelectedMes(null); setSelectedDia(null); setSelectedPeriodo(null); }} className="text-[10px] uppercase font-bold text-rose-500 hover:text-rose-400 bg-rose-500/10 px-2 py-1 rounded">Limpar</button>
            )}
          </div>

          <div>
            <h4 className="text-[10px] text-gray-500 uppercase font-bold mb-3 tracking-widest">Meses</h4>
            <div className="grid grid-cols-2 gap-2">
              {meses.map(m => (
                <button key={m} onClick={() => setSelectedMes(selectedMes === m ? null : m)}
                  className={`text-xs py-2 px-1 rounded border transition-all uppercase font-bold tracking-wider ${selectedMes === m ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.2)]' : 'bg-[#111] border-white/5 text-gray-400 hover:border-white/20 hover:text-white'}`}>
                  {m.substring(0,3)}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <h4 className="text-[10px] text-gray-500 uppercase font-bold mb-3 tracking-widest">Período</h4>
            <div className="grid grid-cols-2 gap-2">
              {periodos.map(p => (
                <button key={p} onClick={() => setSelectedPeriodo(selectedPeriodo === p ? null : p)}
                  className={`text-xs py-2 px-1 rounded border transition-all uppercase font-bold tracking-wider ${selectedPeriodo === p ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-[#111] border-white/5 text-gray-400 hover:border-white/20 hover:text-white'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 pb-8">
            <h4 className="text-[10px] text-gray-500 uppercase font-bold mb-3 tracking-widest">Dias do Mês</h4>
            <div className="grid grid-cols-5 gap-1.5">
              {dias.map(d => (
                <button key={d} onClick={() => setSelectedDia(selectedDia === d ? null : d)}
                  className={`text-xs aspect-square flex items-center justify-center rounded border transition-all font-bold ${selectedDia === d ? 'bg-[#d4af37] text-black border-[#d4af37]' : 'bg-[#111] border-white/5 text-gray-400 hover:border-white/20 hover:text-white'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Modal Saiba Mais (For All) */}
      {showSaibaMais && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#050505] border-2 border-[#d4af37] rounded-xl w-full max-w-lg p-10 relative shadow-[0_0_100px_rgba(212,175,55,0.2)]">
            <button onClick={() => setShowSaibaMais(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white bg-white/5 p-2 rounded-full">
              <X className="w-5 h-5" />
            </button>
            
            {interestSent ? (
              <div className="text-center py-10">
                <CheckCircle className="w-20 h-20 text-[#d4af37] mx-auto mb-6 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
                <h3 className="text-3xl font-black text-white mb-3 tracking-tight uppercase">RECEBEMOS SEU CONTATO!</h3>
                <p className="text-gray-400 text-lg">Um especialista da <strong className="text-[#d4af37]">Dominus Capital</strong> entrará em contato em breve para apresentar o Gênesis.</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="inline-block p-4 rounded-full bg-[#d4af37]/10 mb-4 border border-[#d4af37]/30">
                    <Bot className="w-10 h-10 text-[#d4af37]" />
                  </div>
                  <h3 className="text-3xl font-black text-[#d4af37] mb-2 uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]">ROBÔ GÊNESIS</h3>
                  <p className="text-gray-300 text-sm font-medium tracking-wide">Desbloqueie a automação financeira definitiva. Deixe seus dados abaixo para agendarmos uma apresentação.</p>
                </div>
                
                <form onSubmit={submitSaibaMais} className="space-y-5">
                  <div>
                    <input required type="text" placeholder="SEU NOME COMPLETO" value={interestForm.name} onChange={e => setInterestForm({...interestForm, name: e.target.value})}
                      className="w-full bg-[#111] border border-white/10 rounded-lg p-4 text-white placeholder:text-gray-600 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none uppercase text-sm font-bold tracking-widest transition-all" />
                  </div>
                  <div>
                    <input required type="email" placeholder="SEU MELHOR EMAIL" value={interestForm.email} onChange={e => setInterestForm({...interestForm, email: e.target.value})}
                      className="w-full bg-[#111] border border-white/10 rounded-lg p-4 text-white placeholder:text-gray-600 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none uppercase text-sm font-bold tracking-widest transition-all" />
                  </div>
                  <div>
                    <input required type="tel" placeholder="WHATSAPP COM DDD" value={interestForm.phone} onChange={e => setInterestForm({...interestForm, phone: e.target.value})}
                      className="w-full bg-[#111] border border-white/10 rounded-lg p-4 text-white placeholder:text-gray-600 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none uppercase text-sm font-bold tracking-widest transition-all" />
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-[#d4af37] via-[#f9e596] to-[#d4af37] text-black font-black text-lg uppercase tracking-[0.2em] p-4 rounded-lg mt-6 hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all transform hover:scale-[1.02]">
                    QUERO CONHECER AGORA
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

function SmallKpi({ title, value, color = "text-white" }) {
  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4 flex flex-col justify-center text-center">
      <span className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mb-1">{title}</span>
      <span className={`text-xl font-black ${color}`}>{value}</span>
    </div>
  );
}

function SimpleTable({ title, data, cols }) {
  if (!data) return null;
  return (
    <div className="bg-[#0a0a0a] rounded-xl border border-white/10 overflow-hidden flex flex-col h-[280px] shadow-lg">
      <div className="p-4 border-b border-[#d4af37]/20 bg-[#111]">
        <h3 className="font-bold text-xs text-[#d4af37] uppercase tracking-widest">{title}</h3>
      </div>
      <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-[#d4af37]/20">
        <table className="w-full text-xs text-right border-collapse">
          <thead className="bg-[#161616] text-gray-500 sticky top-0 shadow-sm z-10">
            <tr>
              {cols.map((c, i) => (
                <th key={c} className={`p-3 font-bold uppercase tracking-wider border-b border-white/10 ${i===0 ? 'text-left' : ''}`}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-[#111] transition-colors">
                {cols.map((c, j) => {
                  let val = row[c];
                  if (c === 'liquido') {
                    val = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
                  } else if (c === 'percent') {
                    val = `${val}%`;
                  }
                  const isCurrency = c === 'liquido';
                  const isPositive = isCurrency && row[c] >= 0;
                  const isNegative = isCurrency && row[c] < 0;
                  
                  return (
                    <td key={j} className={`p-3 border-r border-white/5 last:border-r-0 ${j===0 ? 'text-left text-gray-400 font-bold capitalize' : ''} ${isPositive ? 'text-emerald-400 font-bold' : isNegative ? 'text-rose-400 font-bold' : 'text-gray-300'}`}>
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
