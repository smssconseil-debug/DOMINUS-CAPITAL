/**
 * Computes all dashboard metrics from the raw trades array.
 * Mirrors the logic that was previously in the Python backend (server.py).
 *
 * @param {Array}  allTrades     - Full array of trade objects from trades.json
 * @param {Object} filters       - { ano, mes, dia, periodo }
 * @returns {Object}             - Same shape as the /dashboard/metrics API response
 */
export function computeMetrics(allTrades, filters = {}) {
  const { ano, mes, dia, periodo } = filters;

  if (!allTrades || allTrades.length === 0) {
    return { kpis: {}, daily: [], monthly: [], hourly: [], mep: [], chart: [], available_years: [] };
  }

  const mesesMap = {
    janeiro: 1, fevereiro: 2, março: 3, abril: 4, maio: 5, junho: 6,
    julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
  };

  // Parse ISO dates once — use UTC getters to match the UTC timestamps stored in trades.json
  const trades = allTrades.map(t => ({ ...t, aberturaDate: new Date(t.abertura) }));

  const available_years = [...new Set(trades.map(t => t.aberturaDate.getUTCFullYear()))].sort((a, b) => b - a);

  // Apply filters
  const filtered = trades.filter(t => {
    const d = t.aberturaDate;
    if (ano && d.getUTCFullYear() !== ano) return false;
    if (mes && mesesMap[mes.toLowerCase()] !== d.getUTCMonth() + 1) return false;
    if (dia && dia !== d.getUTCDate()) return false;
    if (periodo) {
      const hour = d.getUTCHours();
      const isManha = hour < 12;
      if (periodo.toLowerCase() === 'manhã' && !isManha) return false;
      if (periodo.toLowerCase() === 'tarde' && isManha) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    return {
      kpis: { lucro_liquido: 0, lucro_bruto: 0, custos: 0, operacoes: 0, gains: 0, loss: 0, assertividade: 0, dias_operados: 0, drawdown: 0, runup: 0 },
      daily: [], monthly: [], hourly: [], mep: [], chart: [], available_years,
    };
  }

  const sorted = [...filtered].sort((a, b) => a.aberturaDate - b.aberturaDate);

  // KPIs
  const lucro_bruto = round(filtered.reduce((s, t) => s + (t.res_operacao > 0 ? t.res_operacao : 0), 0));
  const custos = round(filtered.reduce((s, t) => s + t.custo, 0));
  const lucro_liquido = round(filtered.reduce((s, t) => s + t.liquido, 0));
  const operacoes = filtered.length;
  const gains = filtered.filter(t => t.is_gain).length;
  const loss = filtered.filter(t => t.is_loss).length;
  const assertividade = round(operacoes > 0 ? (gains / operacoes) * 100 : 0);
  const dias_operados = new Set(sorted.map(t => t.abertura.slice(0, 10))).size;

  // DrawDown / Run-Up
  let cumulative = 0, maxCum = 0, drawdown = 0, runup = 0;
  for (const t of sorted) {
    cumulative += t.liquido;
    if (cumulative > maxCum) maxCum = cumulative;
    const dd = cumulative - maxCum;
    if (dd < drawdown) drawdown = dd;
    if (cumulative > runup) runup = cumulative;
  }

  const kpis = {
    lucro_liquido,
    lucro_bruto,
    custos,
    operacoes,
    gains,
    loss,
    assertividade,
    dias_operados,
    drawdown: round(drawdown),
    runup: round(runup),
  };

  // Daily
  const dailyMap = {};
  for (const t of sorted) {
    const d = t.aberturaDate.getUTCDate();
    if (!dailyMap[d]) dailyMap[d] = { dia: d, liquido: 0, gains: 0, ops: 0 };
    dailyMap[d].liquido += t.liquido;
    if (t.is_gain) dailyMap[d].gains++;
    dailyMap[d].ops++;
  }
  let acum = 0;
  const daily = Object.keys(dailyMap).sort((a, b) => a - b).map(d => {
    const dm = dailyMap[d];
    acum += dm.liquido;
    return {
      dia: dm.dia,
      liquido: round(dm.liquido),
      acumulado: round(acum),
      assertividade: round(dm.ops > 0 ? (dm.gains / dm.ops) * 100 : 0),
    };
  });

  // Chart (chronological by date string)
  const chartMap = {};
  for (const t of sorted) {
    const dStr = t.abertura.slice(0, 10);
    const label = `${pad(t.aberturaDate.getUTCDate())}/${pad(t.aberturaDate.getUTCMonth() + 1)}/${String(t.aberturaDate.getUTCFullYear()).slice(-2)}`;
    if (!chartMap[dStr]) chartMap[dStr] = { date: dStr, label, liquido: 0 };
    chartMap[dStr].liquido += t.liquido;
  }
  let acumChart = 0;
  const chart = Object.keys(chartMap).sort().map(dStr => {
    acumChart += chartMap[dStr].liquido;
    return { date: dStr, dia: chartMap[dStr].label, liquido: round(chartMap[dStr].liquido), acumulado: round(acumChart) };
  });

  // Monthly
  const invMeses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const monthMap = {};
  for (const t of sorted) {
    const mNum = t.aberturaDate.getUTCMonth() + 1;
    const yr = t.aberturaDate.getUTCFullYear();
    const k = `${invMeses[mNum - 1]}/${String(yr).slice(-2)}`;
    if (!monthMap[k]) monthMap[k] = { mes: k, liquido: 0, m_num: mNum, y_num: yr };
    monthMap[k].liquido += t.liquido;
  }
  const totalLiqMonths = Object.values(monthMap).reduce((s, v) => s + v.liquido, 0);
  const monthly = Object.values(monthMap)
    .sort((a, b) => a.y_num !== b.y_num ? a.y_num - b.y_num : a.m_num - b.m_num)
    .map(v => ({
      mes: v.mes,
      liquido: round(v.liquido),
      percent: round(totalLiqMonths !== 0 ? (v.liquido / totalLiqMonths) * 100 : 0),
    }));

  // Hourly
  const hourMap = {};
  for (const t of sorted) {
    const h = t.aberturaDate.getUTCHours();
    const label = `${pad(h)}h - ${pad(h + 1)}h`;
    if (!hourMap[label]) hourMap[label] = { horario: label, liquido: 0, h };
    hourMap[label].liquido += t.liquido;
  }
  const hourly = Object.values(hourMap)
    .sort((a, b) => a.h - b.h)
    .map(v => ({
      horario: v.horario,
      liquido: round(v.liquido),
      percent: round(lucro_liquido !== 0 ? (v.liquido / lucro_liquido) * 100 : 0),
    }));

  const mep = [
    { mep: '1', liquido: round(lucro_liquido * 0.4), percent: 40.0 },
    { mep: '2', liquido: round(lucro_liquido * 0.3), percent: 30.0 },
    { mep: '3', liquido: round(lucro_liquido * 0.2), percent: 20.0 },
    { mep: '4', liquido: round(lucro_liquido * 0.1), percent: 10.0 },
  ];

  return { kpis, daily, monthly, hourly, mep, chart, available_years };
}

function round(n) { return Math.round(n * 100) / 100; }
function pad(n) { return String(n).padStart(2, '0'); }
