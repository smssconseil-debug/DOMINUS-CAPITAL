import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API, AuthContext } from '../App';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { LogOut, RefreshCcw, TrendingUp, TrendingDown, DollarSign, Activity, Percent, CalendarDays } from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setUser } = useContext(AuthContext);

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
  }, [selectedMes, selectedDia, selectedPeriodo]);

  const handleLogout = async () => {
    await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    setUser(null);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const dias = Array.from({ length: 31 }, (_, i) => i + 1);

  if (!metrics && loading) {
    return <div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-white">Loading Dashboard...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a] text-gray-100 font-sans">
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Dominus Capital</h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <RefreshCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /> 
              Dados atualizados online
            </p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>

        {/* Top KPIs Row */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-5 xl:grid-cols-10 gap-3 mb-6">
            <KpiCard title="Líquido" value={formatCurrency(metrics.kpis.lucro_liquido)} type={metrics.kpis.lucro_liquido >= 0 ? 'gain' : 'loss'} colSpan="col-span-2" featured />
            <KpiCard title="Lucro Bruto" value={formatCurrency(metrics.kpis.lucro_bruto)} subTitle={`Custos: ${formatCurrency(metrics.kpis.custos)}`} colSpan="col-span-2" />
            <KpiCard title="Operações" value={metrics.kpis.operacoes} icon={<Activity className="w-4 h-4 opacity-50" />} />
            <KpiCard title="Gains" value={metrics.kpis.gains} type="gain" />
            <KpiCard title="Loss" value={metrics.kpis.loss} type="loss" />
            <KpiCard title="Assertividade" value={`${metrics.kpis.assertividade}%`} icon={<Percent className="w-4 h-4 opacity-50" />} />
            <KpiCard title="Dias Op." value={metrics.kpis.dias_operados} icon={<CalendarDays className="w-4 h-4 opacity-50" />} />
            <div className="col-span-1 flex flex-col gap-2">
              <MiniCard title="DrawDown" value={formatCurrency(metrics.kpis.drawdown)} type="loss" />
              <MiniCard title="Run-Up" value={formatCurrency(metrics.kpis.runup)} type="gain" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Daily Table */}
          <div className="lg:col-span-1 bg-[#111111] rounded-2xl border border-white/10 overflow-hidden shadow-lg flex flex-col h-[600px]">
            <div className="p-4 border-b border-white/10 bg-white/5">
              <h3 className="font-semibold text-sm text-gray-300">Desempenho Diário</h3>
            </div>
            <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              <table className="w-full text-xs text-right">
                <thead className="sticky top-0 bg-[#161616] text-gray-400 z-10 shadow-md">
                  <tr>
                    <th className="p-3 text-center">Dia</th>
                    <th className="p-3">Líquido</th>
                    <th className="p-3">Acumulado</th>
                    <th className="p-3">Assertividade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {metrics?.daily.map((d, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 text-center text-gray-400">{d.dia}</td>
                      <td className={`p-3 font-medium ${d.liquido >= 0 ? 'text-emerald-400 bg-emerald-400/5' : 'text-rose-400 bg-rose-400/5'}`}>{formatCurrency(d.liquido)}</td>
                      <td className="p-3 text-gray-300">{formatCurrency(d.acumulado)}</td>
                      <td className="p-3 text-gray-400">{d.assertividade}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Center Column: Charts and Small Tables */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Chart Area */}
            <div className="bg-[#111111] rounded-2xl border border-white/10 p-5 shadow-lg h-[350px]">
              <h3 className="font-semibold text-sm text-gray-300 mb-4">Líquido Diário e Total Acumulado</h3>
              {metrics && metrics.chart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.chart} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAcumulado" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="dia" stroke="#555" tick={{fill: '#888', fontSize: 12}} />
                    <YAxis stroke="#555" tick={{fill: '#888', fontSize: 12}} tickFormatter={(val) => `R$${val/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="acumulado" name="Total Acumulado" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAcumulado)" />
                    <Line type="step" dataKey="liquido" name="Líquido Diário" stroke="#10b981" strokeWidth={2} dot={{r: 2, fill: '#10b981'}} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">Sem dados para o filtro atual</div>
              )}
            </div>

            {/* Bottom Tables */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <SimpleTable title="Resumo Mensal" data={metrics?.monthly} cols={['mes', 'liquido', 'percent']} currencyCols={['liquido']} suffix={{percent: '%'}} />
              <SimpleTable title="Resumo Horário" data={metrics?.hourly} cols={['horario', 'percent', 'liquido']} currencyCols={['liquido']} suffix={{percent: '%'}} />
              <SimpleTable title="MEP Líquido" data={metrics?.mep} cols={['mep', 'liquido', 'percent']} currencyCols={['liquido']} suffix={{percent: '%'}} />
            </div>

          </div>
        </div>
      </div>

      {/* Right Sidebar Filters */}
      <div className="w-64 bg-[#111111] border-l border-white/10 p-6 flex flex-col gap-8 overflow-y-auto">
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2"><CalendarDays className="w-4 h-4 text-emerald-500" /> Filtros</h3>
            {(selectedMes || selectedDia || selectedPeriodo) && (
              <button onClick={() => { setSelectedMes(null); setSelectedDia(null); setSelectedPeriodo(null); }} className="text-xs text-rose-400 hover:text-rose-300">Limpar</button>
            )}
          </div>
          
          <div className="space-y-6">
            
            {/* Meses */}
            <div>
              <h4 className="text-xs uppercase text-gray-500 font-bold mb-3 tracking-wider">Meses</h4>
              <div className="grid grid-cols-2 gap-2">
                {meses.map(m => (
                  <button 
                    key={m} 
                    onClick={() => setSelectedMes(selectedMes === m ? null : m)}
                    className={`text-xs py-2 px-1 rounded-md border transition-all ${selectedMes === m ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-[#161616] border-white/5 text-gray-400 hover:border-white/20'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Período */}
            <div>
              <h4 className="text-xs uppercase text-gray-500 font-bold mb-3 tracking-wider">Período</h4>
              <div className="grid grid-cols-2 gap-2">
                {['Manhã', 'Tarde'].map(p => (
                  <button 
                    key={p} 
                    onClick={() => setSelectedPeriodo(selectedPeriodo === p ? null : p)}
                    className={`text-xs py-2 px-1 rounded-md border transition-all ${selectedPeriodo === p ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-[#161616] border-white/5 text-gray-400 hover:border-white/20'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Dias */}
            <div>
              <h4 className="text-xs uppercase text-gray-500 font-bold mb-3 tracking-wider">Dias</h4>
              <div className="grid grid-cols-5 gap-1.5">
                {dias.map(d => (
                  <button 
                    key={d} 
                    onClick={() => setSelectedDia(selectedDia === d ? null : d)}
                    className={`text-xs aspect-square flex items-center justify-center rounded-md border transition-all ${selectedDia === d ? 'bg-emerald-500 text-white border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-[#161616] border-white/5 text-gray-400 hover:border-white/20 hover:bg-[#222]'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}

// Subcomponents
function KpiCard({ title, value, subTitle, type = 'neutral', colSpan = "col-span-1", featured, icon }) {
  const isGain = type === 'gain';
  const isLoss = type === 'loss';
  
  return (
    <div className={`${colSpan} bg-[#111111] rounded-2xl border border-white/10 p-4 shadow-lg flex flex-col justify-center relative overflow-hidden group hover:border-white/20 transition-all`}>
      {featured && (
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
      )}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</span>
        {icon && <span>{icon}</span>}
      </div>
      <div className={`text-2xl font-bold truncate ${featured ? 'text-3xl' : ''} ${isGain ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-white'}`}>
        {value}
      </div>
      {subTitle && <div className="text-xs text-gray-500 mt-1">{subTitle}</div>}
    </div>
  );
}

function MiniCard({ title, value, type }) {
  return (
    <div className={`bg-[#111111] border border-white/10 rounded-xl p-2.5 flex items-center justify-between shadow-sm`}>
      <span className="text-[10px] text-gray-500 uppercase font-semibold">{title}</span>
      <span className={`text-xs font-bold ${type === 'gain' ? 'text-emerald-400' : type === 'loss' ? 'text-rose-400' : 'text-white'}`}>{value}</span>
    </div>
  );
}

function SimpleTable({ title, data, cols, currencyCols, suffix = {} }) {
  if (!data) return null;
  return (
    <div className="bg-[#111111] rounded-xl border border-white/10 overflow-hidden flex flex-col h-64">
      <div className="p-3 border-b border-white/10 bg-white/5">
        <h3 className="font-semibold text-xs text-gray-300">{title}</h3>
      </div>
      <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <table className="w-full text-xs text-right">
          <thead className="bg-[#161616] text-gray-500 sticky top-0">
            <tr>
              {cols.map((c, i) => (
                <th key={c} className={`p-2 font-medium ${i===0 ? 'text-left' : ''}`}>{c.charAt(0).toUpperCase() + c.slice(1)}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-white/5">
                {cols.map((c, j) => {
                  let val = row[c];
                  if (currencyCols.includes(c)) {
                    val = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
                  } else if (suffix[c]) {
                    val = `${val}${suffix[c]}`;
                  }
                  const isCurrency = currencyCols.includes(c);
                  const isNegative = isCurrency && row[c] < 0;
                  const isPositive = isCurrency && row[c] > 0;
                  
                  return (
                    <td key={j} className={`p-2 ${j===0 ? 'text-left text-gray-400' : ''} ${isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-gray-300'}`}>
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
