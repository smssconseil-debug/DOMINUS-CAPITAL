const BCB_SGS_BASE = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs';
const BCB_PTAX_BASE = 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata';
const REQUEST_TIMEOUT_MS = 10000;

module.exports = async function panorama(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  res.setHeader('Cache-Control', 'no-store');

  const today = getSaoPauloDate();
  const sevenDaysAgo = shiftDate(today, -7);
  const oneHundredEightyDaysAgo = shiftDate(today, -180);
  const ptaxFrom = formatDate(sevenDaysAgo, 'MM-DD-YYYY');
  const ptaxTo = formatDate(today, 'MM-DD-YYYY');
  const ptaxUrl = `${BCB_PTAX_BASE}/CotacaoDolarPeriodo(dataInicial='${ptaxFrom}',dataFinalCotacao='${ptaxTo}')?$format=json`;

  const [dollar, selic, ipca] = await Promise.all([
    getIndicator('Dólar PTAX', () => fetchLatestPtax(ptaxUrl, today)),
    getIndicator('Selic', () =>
      fetchLatestSgs(432, shiftDate(today, -14), today),
    ),
    getIndicator('IPCA', () =>
      fetchLatestSgs(433, oneHundredEightyDaysAgo, today),
    ),
  ]);

  const metrics = { dollar, selic, ipca };
  const hasAvailableData = Object.values(metrics).some((metric) => metric.value !== null);

  if (!hasAvailableData) {
    return res.status(502).json({
      error: 'Não foi possível consultar os indicadores oficiais agora. Tente novamente mais tarde.',
      metrics,
    });
  }

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=300');

  return res.status(200).json({
    updatedAt: new Date().toISOString(),
    metrics,
  });
};

async function getIndicator(name, fetchValue) {
  try {
    const result = await fetchValue();

    if (!result) {
      throw new Error('A fonte não retornou um valor de referência válido.');
    }

    return { ...result, error: null };
  } catch (error) {
    console.error(`Falha ao consultar o indicador ${name} no Banco Central.`, error);

    return {
      value: null,
      date: null,
      error: 'Não foi possível atualizar este indicador agora.',
    };
  }
}

async function fetchLatestPtax(url, today) {
  const response = await fetchJson(url);
  const rows = getRows(response);
  const latest = rows
    .filter((row) => row.dataHoraCotacao && row.dataHoraCotacao.slice(0, 10) <= today)
    .sort((first, second) => second.dataHoraCotacao.localeCompare(first.dataHoraCotacao))[0];
  const value = Number(latest?.cotacaoVenda);

  if (!latest || !Number.isFinite(value)) {
    return null;
  }

  return {
    value,
    date: latest.dataHoraCotacao.slice(0, 10),
    time: latest.dataHoraCotacao.slice(11, 16),
  };
}

async function fetchLatestSgs(seriesId, from, to) {
  const query = new URLSearchParams({
    formato: 'json',
    dataInicial: formatDate(from, 'DD/MM/YYYY'),
    dataFinal: formatDate(to, 'DD/MM/YYYY'),
  });
  const response = await fetchJson(`${BCB_SGS_BASE}.${seriesId}/dados?${query}`);
  const latest = getRows(response)
    .map((row) => ({ ...row, date: parseBrazilianDate(row.data) }))
    .filter((row) => row.date && row.date <= to)
    .sort((first, second) => second.date.localeCompare(first.date))[0];
  const value = Number(latest?.valor);

  if (!latest || !Number.isFinite(value)) {
    return null;
  }

  return {
    value,
    date: latest.date,
  };
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Banco Central respondeu com HTTP ${response.status}.`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

function getRows(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.value)) return response.value;
  return [];
}

function getSaoPauloDate() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  return `${values.year}-${values.month}-${values.day}`;
}

function shiftDate(date, days) {
  const shifted = new Date(`${date}T00:00:00.000Z`);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted.toISOString().slice(0, 10);
}

function formatDate(date, pattern) {
  const [year, month, day] = date.split('-');

  if (pattern === 'MM-DD-YYYY') return `${month}-${day}-${year}`;
  return `${day}/${month}/${year}`;
}

function parseBrazilianDate(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value || '');
  if (!match) return null;
  return `${match[3]}-${match[2]}-${match[1]}`;
}
