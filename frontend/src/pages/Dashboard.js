import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '../App';
import { Link } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  Area, AreaChart, BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { LogOut, CheckCircle, TrendingUp, ShieldCheck, Cpu, PlayCircle, Bot, X, Lock, Trophy, Target, Clock, CalendarDays } from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useContext(AuthContext);

  const [showSaibaMais, setShowSaibaMais] = useState(false);
  const [interestForm, setInterestForm] = useState({ email: '', phone: '', name: '' });
  const [interestSent, setInterestSent] = useState(false);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/dashboard/metrics`, { withCredentials: true });
      setMetrics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [user]); // Refetch if user logs in/out

  const handleLogout = async () => {
    await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    setUser(null);
  };

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

  const handleSaibaMaisClick = () => {
    if (user) {
      submitSaibaMais();
    } else {
      setShowSaibaMais(true);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  if (!metrics && loading) {
    return <div className="flex h-screen items-center justify-center bg-[#050505] text-[#d4af37] text-xl font-bold tracking-widest animate-pulse">CARREGANDO DADOS GÊNESIS...</div>;
  }

  // Derived calculations for new charts
  const mesesPositivos = metrics?.monthly?.filter(m => m.liquido > 0).length || 0;
  const totalMeses = metrics?.monthly?.length || 0;
  const percentMesesPositivos = totalMeses > 0 ? Math.round((mesesPositivos / totalMeses) * 100) : 0;

  const pieData = metrics ? [
    { name: 'Gains', value: metrics.kpis.gains, color: '#10b981' },
    { name: 'Loss', value: metrics.kpis.loss, color: '#ef4444' }
  ] : [];

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505] text-gray-100 font-sans bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] relative">
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#d4af37] via-[#f9e596] to-[#d4af37]"></div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col pt-8">
        
        {/* Header Section */}
        <div className="px-8 flex justify-between items-start mb-6">
          <div>
            <h2 className="text-[#d4af37] text-sm uppercase tracking-[0.2em] font-bold mb-1">DOMINUS CAPITAL APRESENTA</h2>
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">RESULTADOS REAIS.</h1>
            <h1 className="text-3xl md:text-4xl font-black text-[#d4af37] uppercase tracking-tight">DESEMPENHO COMPROVADO.</h1>
            <p className="text-gray-400 mt-3 text-sm md:text-base font-medium tracking-wide">NÚMEROS 100% REAIS. OPERAÇÕES REAIS. RESULTADOS REAIS.</p>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">Olá, <span className="text-[#d4af37] font-semibold">{user.name || user.email}</span></span>
                <button onClick={handleLogout} className="text-xs bg-red-500/10 text-red-500 border border-red-500/30 px-3 py-1.5 rounded hover:bg-red-500/20 transition-all flex items-center gap-2">
                  <LogOut className="w-3 h-3" /> Sair
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="text-sm border border-[#d4af37]/50 text-[#d4af37] hover:bg-[#d4af37]/10 px-6 py-2 rounded-md font-semibold transition-all">
                  LOGIN
                </Link>
                <Link to="/register" className="text-sm bg-gradient-to-r from-[#d4af37] to-[#b5952f] text-black hover:opacity-90 px-6 py-2 rounded-md font-bold transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                  CADASTRE-SE
                </Link>
              </div>
            )}
            
            <button onClick={handleSaibaMaisClick} className="flex items-center gap-2 text-sm bg-[#111] border border-white/10 hover:border-[#d4af37]/50 px-4 py-2 rounded text-white transition-all group">
              <Bot className="w-4 h-4 text-[#d4af37] group-hover:animate-pulse" /> Saiba mais sobre o Gênesis
            </button>
          </div>
        </div>

        {/* Visitor Restriction Banner */}
        {metrics?.is_restricted && (
          <div className="mx-8 mb-6 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="text-[#d4af37] w-5 h-5" />
              <div>
                <p className="text-[#d4af37] font-bold text-sm uppercase tracking-wider">Modo Visitante</p>
                <p className="text-gray-300 text-xs mt-0.5">Exibindo demonstração dos últimos 2 meses. Para acessar o histórico completo de 16 meses, faça seu cadastro gratuito.</p>
              </div>
            </div>
            <Link to="/register" className="bg-[#d4af37] text-black text-xs font-bold px-4 py-2 rounded hover:opacity-90 shadow-md">VER HISTÓRICO COMPLETO</Link>
          </div>
        )}

        <div className="flex-1 px-8 pb-8 flex flex-col gap-6">
          
          {/* TOP BIG KPIs ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-xl p-6 relative overflow-hidden shadow-2xl flex items-center justify-between group hover:border-[#d4af37]/30 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <TrendingUp className="w-32 h-32 text-[#d4af37]" />
              </div>
              <div className="relative z-10">
                <h3 className="text-[#d4af37] text-sm font-bold uppercase tracking-[0.2em] mb-1">Lucro Total Líquido</h3>
                <div className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                  {formatCurrency(metrics?.kpis?.lucro_liquido || 0)}
                </div>
              </div>
              <div className="relative z-10 text-right border-l border-white/10 pl-6">
                <div className="text-gray-500 uppercase text-[10px] tracking-widest font-bold">Período Analisado</div>
                <div className="text-white font-bold text-lg">{metrics?.is_restricted ? 'Últimos 2 Meses' : 'Total 16 Meses'}</div>
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 flex flex-col justify-center shadow-lg">
              <h3 className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-1 text-center">Fator de Lucro</h3>
              <div className="text-3xl font-black text-white text-center">
                {((metrics?.kpis?.lucro_bruto || 0) / (Math.abs(metrics?.kpis?.custos || 1) + 1)).toFixed(2)}
              </div>
              <p className="text-xs text-center text-[#d4af37] mt-1 font-semibold">Excelente Eficiência</p>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 flex flex-col justify-center shadow-lg">
              <h3 className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-1 text-center">Trades Executados</h3>
              <div className="text-3xl font-black text-white text-center">{metrics?.kpis?.operacoes || 0}</div>
              <p className="text-xs text-center text-[#d4af37] mt-1 font-semibold">100% Automatizado</p>
            </div>
          </div>

          {/* HIGHLIGHT CARDS ROW */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoCard icon={<Cpu />} title="Sistema" value="100% Automatizado" sub="0% Intervenção Humana" />
            <InfoCard icon={<ShieldCheck />} title="Gestão de Risco" value="Risco Controlado" sub="Proteção Automática" />
            <InfoCard icon={<Trophy />} title="Consistência" value={`${mesesPositivos} de ${totalMeses} Meses`} sub={`${percentMesesPositivos}% de Meses Positivos`} />
            <InfoCard icon={<CheckCircle />} title="Disciplina" value="Processo Rígido" sub="Baseado em Dados Reais" />
          </div>

          {/* DASHBOARD CHARTS - ROW 1 */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* AREA CHART: EVOLUÇÃO */}
            <div className="xl:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-xl p-6 shadow-xl flex flex-col min-h-[350px]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-[#d4af37] text-sm font-bold uppercase tracking-widest flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Evolução do Capital Real</h3>
                  <p className="text-xs text-gray-500 mt-1">Acúmulo de patrimônio trade a trade.</p>
                </div>
                <div className="text-right hidden sm:block">
                   <p className="text-[10px] text-gray-500 uppercase tracking-widest">Drawdown Máximo</p>
                   <p className="text-rose-500 font-bold">{formatCurrency(metrics?.kpis?.drawdown || 0)}</p>
                </div>
              </div>
              <div className="flex-1 w-full">
                {metrics && metrics.chart.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.chart} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAcum" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d4af37" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="dia" stroke="#555" tick={{fill: '#888', fontSize: 11}} tickMargin={10} />
                      <YAxis stroke="#555" tick={{fill: '#888', fontSize: 11}} tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`} width={60} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#111', border: '1px solid #d4af37', borderRadius: '4px' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value) => [formatCurrency(value), "Capital Total"]}
                        labelStyle={{ color: '#888' }}
                      />
                      <Area type="monotone" dataKey="acumulado" stroke="#d4af37" strokeWidth={3} fillOpacity={1} fill="url(#colorAcum)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-600">Sem dados</div>
                )}
              </div>
            </div>

            {/* DONUT CHART: WIN RATE */}
            <div className="xl:col-span-1 bg-[#0a0a0a] border border-white/10 rounded-xl p-6 shadow-xl flex flex-col items-center justify-center relative">
               <h3 className="text-[#d4af37] text-sm font-bold uppercase tracking-widest absolute top-6 left-6 flex items-center gap-2"><Target className="w-4 h-4"/> Win Rate</h3>
               
               <div className="w-full h-[250px] mt-6">
                 {metrics && (
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={pieData}
                         cx="50%"
                         cy="50%"
                         innerRadius={70}
                         outerRadius={90}
                         paddingAngle={5}
                         dataKey="value"
                         stroke="none"
                       >
                         {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                       </Pie>
                       <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '4px' }}
                          itemStyle={{ color: '#fff' }}
                       />
                     </PieChart>
                   </ResponsiveContainer>
                 )}
               </div>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-6">
                  <span className="text-3xl font-black text-white">{metrics?.kpis?.assertividade || 0}%</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Acerto</span>
               </div>
               
               <div className="flex gap-6 mt-2">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                   <span className="text-sm text-gray-400">Gains ({metrics?.kpis?.gains})</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                   <span className="text-sm text-gray-400">Loss ({metrics?.kpis?.loss})</span>
                 </div>
               </div>
            </div>

          </div>

          {/* DASHBOARD CHARTS - ROW 2 */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
             
             {/* MONTHLY BAR CHART */}
             <div className="xl:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-xl p-6 shadow-xl flex flex-col min-h-[300px]">
                <h3 className="text-[#d4af37] text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2"><CalendarDays className="w-4 h-4"/> Lucro/Prejuízo por Mês</h3>
                <div className="flex-1 w-full">
                  {metrics && metrics.monthly.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metrics.monthly} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <XAxis dataKey="mes" stroke="#555" tick={{fill: '#888', fontSize: 11}} tickFormatter={(v) => v.split('/')[0].substring(0,3)} />
                        <YAxis stroke="#555" tick={{fill: '#888', fontSize: 11}} tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`} width={60} />
                        <RechartsTooltip 
                          cursor={{fill: '#222'}}
                          contentStyle={{ backgroundColor: '#111', border: '1px solid #d4af37', borderRadius: '4px' }}
                          formatter={(value) => [formatCurrency(value), "Resultado"]}
                          labelFormatter={(label) => `Mês: ${label}`}
                        />
                        <Bar dataKey="liquido" radius={[4, 4, 0, 0]}>
                          {metrics.monthly.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.liquido >= 0 ? '#10b981' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-600">Sem dados</div>
                  )}
                </div>
             </div>

             {/* MONTHLY TABLE */}
             <div className="xl:col-span-1 bg-[#0a0a0a] border border-white/10 rounded-xl flex flex-col max-h-[350px] shadow-xl overflow-hidden">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#111]">
                  <h3 className="text-[#d4af37] text-sm font-bold uppercase tracking-widest">Resumo Mensal</h3>
                </div>
                <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-[#d4af37]/20 flex-1">
                  <table className="w-full text-xs">
                    <thead className="bg-[#161616] text-gray-500 sticky top-0">
                      <tr>
                        <th className="p-3 text-left font-semibold uppercase">Mês/Ano</th>
                        <th className="p-3 text-right font-semibold uppercase">Lucro (R$)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {metrics?.monthly.map((row, i) => (
                        <tr key={i} className="hover:bg-white/5">
                          <td className="p-3 text-gray-300 capitalize">{row.mes}</td>
                          <td className={`p-3 text-right font-bold ${row.liquido >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {row.liquido >= 0 ? '+' : ''}{formatCurrency(row.liquido)}
                          </td>
                        </tr>
                      ))}
                      {metrics?.monthly.length === 0 && (
                        <tr><td colSpan="2" className="p-4 text-center text-gray-500">Sem dados</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
             </div>
             
          </div>

          {/* DASHBOARD CHARTS - ROW 3 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* HOURLY PERFORMANCE */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 shadow-xl flex flex-col min-h-[300px]">
                <h3 className="text-[#d4af37] text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2"><Clock className="w-4 h-4"/> Desempenho por Horário</h3>
                <div className="flex-1 w-full">
                  {metrics && metrics.hourly.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={metrics.hourly} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <XAxis dataKey="horario" stroke="#555" tick={{fill: '#888', fontSize: 10}} interval={0} angle={-45} textAnchor="end" height={60} />
                        <YAxis stroke="#555" tick={{fill: '#888', fontSize: 11}} tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`} width={60} />
                        <RechartsTooltip 
                          cursor={{fill: '#222'}}
                          contentStyle={{ backgroundColor: '#111', border: '1px solid #d4af37', borderRadius: '4px' }}
                          formatter={(value) => [formatCurrency(value), "Resultado"]}
                        />
                        <Bar dataKey="liquido" radius={[4, 4, 0, 0]}>
                          {metrics.hourly.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.liquido >= 0 ? '#10b981' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-600">Sem dados</div>
                  )}
                </div>
             </div>

             {/* DAILY TABLE SUMMARY */}
             <div className="bg-[#0a0a0a] border border-white/10 rounded-xl flex flex-col max-h-[300px] shadow-xl overflow-hidden">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#111]">
                  <h3 className="text-[#d4af37] text-sm font-bold uppercase tracking-widest">Resumo Operacional Diário (Média)</h3>
                </div>
                <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-[#d4af37]/20 flex-1">
                  <table className="w-full text-xs">
                    <thead className="bg-[#161616] text-gray-500 sticky top-0">
                      <tr>
                        <th className="p-3 text-left font-semibold uppercase">Dia do Mês</th>
                        <th className="p-3 text-right font-semibold uppercase">Líquido Acum.</th>
                        <th className="p-3 text-right font-semibold uppercase">Win Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {metrics?.daily.map((row, i) => (
                        <tr key={i} className="hover:bg-white/5">
                          <td className="p-3 text-gray-300">Dia {row.dia}</td>
                          <td className={`p-3 text-right font-bold ${row.liquido >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {formatCurrency(row.liquido)}
                          </td>
                          <td className="p-3 text-right text-gray-400">{row.assertividade}%</td>
                        </tr>
                      ))}
                      {metrics?.daily.length === 0 && (
                        <tr><td colSpan="3" className="p-4 text-center text-gray-500">Sem dados</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
             </div>

          </div>

        </div>
      </div>

      {/* Modal Saiba Mais */}
      {showSaibaMais && !user && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-[#d4af37]/50 rounded-2xl w-full max-w-md p-8 relative shadow-[0_0_50px_rgba(212,175,55,0.15)]">
            <button onClick={() => setShowSaibaMais(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
              <X className="w-6 h-6" />
            </button>
            
            {interestSent ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Interesse Registrado!</h3>
                <p className="text-gray-400">Em breve nossa equipe entrará em contato com você sobre o Gênesis.</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-[#d4af37] mb-2 uppercase tracking-wide">Descubra o Gênesis</h3>
                  <p className="text-gray-400 text-sm">Deixe seus dados e nossa equipe entrará em contato para apresentar a plataforma.</p>
                </div>
                
                <form onSubmit={submitSaibaMais} className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Nome</label>
                    <input required type="text" value={interestForm.name} onChange={e => setInterestForm({...interestForm, name: e.target.value})}
                      className="w-full bg-[#111] border border-white/10 rounded p-3 text-white focus:border-[#d4af37] outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Email</label>
                    <input required type="email" value={interestForm.email} onChange={e => setInterestForm({...interestForm, email: e.target.value})}
                      className="w-full bg-[#111] border border-white/10 rounded p-3 text-white focus:border-[#d4af37] outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">WhatsApp</label>
                    <input required type="tel" value={interestForm.phone} onChange={e => setInterestForm({...interestForm, phone: e.target.value})}
                      className="w-full bg-[#111] border border-white/10 rounded p-3 text-white focus:border-[#d4af37] outline-none" />
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-[#d4af37] to-[#b5952f] text-black font-bold uppercase tracking-wider p-3 rounded mt-4 hover:opacity-90 transition-all">
                    Solicitar Contato
                  </button>
                </form>
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">Para liberar o histórico de 16 meses agora, <Link to="/register" className="text-[#d4af37] hover:underline" onClick={() => setShowSaibaMais(false)}>Faça seu Cadastro</Link>.</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {showSaibaMais && user && interestSent && (
         <div className="fixed bottom-8 right-8 bg-[#111] border border-[#d4af37] p-4 rounded-lg shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
           <CheckCircle className="text-[#d4af37] w-6 h-6" />
           <div>
             <p className="text-white font-bold text-sm">Interesse Registrado!</p>
             <p className="text-gray-400 text-xs">Avisamos nossa equipe com seu email de cadastro.</p>
           </div>
         </div>
      )}
    </div>
  );
}

function InfoCard({ icon, title, value, sub }) {
  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:border-[#d4af37]/30 transition-all shadow-md group">
      <div className="text-[#d4af37] p-3 bg-[#d4af37]/5 rounded-lg group-hover:bg-[#d4af37]/10 transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{title}</p>
        <p className="text-sm font-bold text-white leading-tight">{value}</p>
        <p className="text-[10px] text-[#d4af37] font-medium">{sub}</p>
      </div>
    </div>
  );
}
