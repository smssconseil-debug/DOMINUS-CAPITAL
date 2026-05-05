import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '../App';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { LogOut, CheckCircle, TrendingUp, ShieldCheck, Cpu, PlayCircle, Bot, X, Lock } from 'lucide-react';

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

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedMes) params.append('mes', selectedMes);
      if (selectedDia) params.append('dia', selectedDia);

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
  }, [selectedMes, selectedDia, user]); // Refetch if user logs in/out

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
      // User logged in, submit immediately
      submitSaibaMais();
    } else {
      // Visitor, show form
      setShowSaibaMais(true);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

  if (!metrics && loading) {
    return <div className="flex h-screen items-center justify-center bg-[#050505] text-[#d4af37]">Carregando Sistema...</div>;
  }

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
                <span className="text-sm text-gray-400">Olá, <span className="text-white font-semibold">{user.name || user.email}</span></span>
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
            
            <button onClick={handleSaibaMaisClick} className="flex items-center gap-2 text-sm bg-white/5 border border-white/10 hover:border-[#d4af37]/50 px-4 py-2 rounded text-white transition-all group">
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
                <p className="text-[#d4af37] font-bold text-sm uppercase">Modo Visitante</p>
                <p className="text-gray-300 text-xs">Exibindo apenas os últimos 2 meses. Para acessar o histórico completo de 16 meses, faça seu cadastro.</p>
              </div>
            </div>
            <Link to="/register" className="bg-[#d4af37] text-black text-xs font-bold px-4 py-2 rounded hover:opacity-90">VER HISTÓRICO COMPLETO</Link>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="flex-1 px-8 pb-8 grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* Left Column: Big KPIs & Month List */}
          <div className="xl:col-span-1 flex flex-col gap-6">
            
            {/* Main KPI */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp className="w-24 h-24 text-[#d4af37]" />
              </div>
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Lucro Total Líquido</h3>
              <div className="text-4xl md:text-5xl font-black text-[#d4af37] tracking-tighter">
                {formatCurrency(metrics?.kpis?.lucro_liquido || 0)}
              </div>
              <div className="mt-4 flex justify-between items-center text-xs border-t border-white/10 pt-4">
                <div className="text-center">
                  <div className="text-gray-500 uppercase">Win Rate</div>
                  <div className="text-white font-bold text-lg">{metrics?.kpis?.assertividade || 0}%</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500 uppercase">Fator de Lucro</div>
                  <div className="text-white font-bold text-lg">{(metrics?.kpis?.lucro_bruto / (Math.abs(metrics?.kpis?.custos || 1) + 1)).toFixed(2)}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-500 uppercase">Trades</div>
                  <div className="text-white font-bold text-lg">{metrics?.kpis?.operacoes || 0}</div>
                </div>
              </div>
            </div>

            {/* Monthly Results Table */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl flex flex-col flex-1 max-h-[500px] overflow-hidden">
              <div className="bg-[#111] p-4 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-[#d4af37] text-sm font-bold uppercase tracking-widest">Resultado Real por Mês</h3>
              </div>
              <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-[#d4af37]/20 flex-1">
                <table className="w-full text-xs">
                  <thead className="bg-[#161616] text-gray-500 sticky top-0">
                    <tr>
                      <th className="p-3 text-left font-semibold uppercase">Mês/Ano</th>
                      <th className="p-3 text-right font-semibold uppercase">Lucro (R$)</th>
                      <th className="p-3 text-right font-semibold uppercase">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {metrics?.monthly.map((row, i) => (
                      <tr key={i} className="hover:bg-white/5">
                        <td className="p-3 text-gray-300 capitalize">{row.mes}</td>
                        <td className={`p-3 text-right font-bold ${row.liquido >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {row.liquido >= 0 ? '+' : ''}{formatCurrency(row.liquido)}
                        </td>
                        <td className="p-3 text-right text-gray-400">{row.percent}%</td>
                      </tr>
                    ))}
                    {metrics?.monthly.length === 0 && (
                      <tr><td colSpan="3" className="p-4 text-center text-gray-500">Sem dados</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Charts and Info */}
          <div className="xl:col-span-3 flex flex-col gap-6">
            
            {/* Top Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoCard icon={<Cpu />} title="Sistema" value="100% Automatizado" sub="0% Intervenção Humana" />
              <InfoCard icon={<ShieldCheck />} title="Gestão de Risco" value="Risco Controlado" sub="Proteção de Capital Automática" />
              <InfoCard icon={<PlayCircle />} title="Estratégia" value="Robusta" sub="Validada em Vários Cenários" />
              <InfoCard icon={<CheckCircle />} title="Consistência" value="Disciplina" sub="Processo Baseado em Dados" />
            </div>

            {/* Chart Area */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 flex-1 shadow-2xl min-h-[400px] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-[#d4af37] text-sm font-bold uppercase tracking-widest">Evolução do Capital Real</h3>
                  <p className="text-xs text-gray-500 mt-1">Rentabilidade passada não garante resultados futuros.</p>
                </div>
                {/* Minimal Filters */}
                <div className="flex gap-2">
                  <select onChange={(e) => setSelectedMes(e.target.value || null)} className="bg-[#111] border border-white/10 text-xs text-gray-300 rounded px-3 py-1.5 focus:border-[#d4af37] focus:outline-none">
                    <option value="">Todos os Meses</option>
                    {meses.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="flex-1 w-full relative">
                {metrics && metrics.chart.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                    <AreaChart data={metrics.chart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAcum" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="dia" stroke="#555" tick={{fill: '#888', fontSize: 11}} />
                      <YAxis stroke="#555" tick={{fill: '#888', fontSize: 11}} tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#111', border: '1px solid #d4af37', borderRadius: '4px' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value) => formatCurrency(value)}
                      />
                      <Area type="step" dataKey="acumulado" name="Capital Total" stroke="#d4af37" strokeWidth={3} fillOpacity={1} fill="url(#colorAcum)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-600">Nenhum dado encontrado para o filtro</div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Modal Saiba Mais (For Visitors) */}
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
      
      {/* Toast for Logged In users clicking Saiba Mais */}
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
    <div className="bg-[#111] border border-white/5 rounded-lg p-4 flex items-center gap-4 hover:border-[#d4af37]/30 transition-all">
      <div className="text-[#d4af37] p-2 bg-[#d4af37]/10 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{title}</p>
        <p className="text-sm font-bold text-white">{value}</p>
        <p className="text-[10px] text-gray-400">{sub}</p>
      </div>
    </div>
  );
}
