import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';

const refreshIntervalMs = 30 * 60 * 1000;

const indicators = [
  {
    key: 'dollar',
    title: 'Dólar PTAX',
    description: 'Cotação de venda de referência',
    format: (value) =>
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      }).format(value),
    suffix: '',
  },
  {
    key: 'selic',
    title: 'Selic',
    description: 'Taxa anualizada · série diária',
    format: (value) => formatDecimal(value),
    suffix: '% a.a.',
  },
  {
    key: 'ipca',
    title: 'IPCA',
    description: 'Variação mensal',
    format: (value) => formatDecimal(value),
    suffix: '%',
  },
];

export default function MarketOverview() {
  const [marketData, setMarketData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const updateMarketData = async () => {
      try {
        const response = await fetch('/api/panorama');
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Não foi possível atualizar os indicadores.');
        }

        if (isMounted) {
          setMarketData(result);
          setLoadError('');
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error.message || 'Não foi possível atualizar os indicadores.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    updateMarketData();
    const intervalId = window.setInterval(updateMarketData, refreshIntervalMs);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <section aria-labelledby="market-overview-title" className="scroll-mt-24">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#d4af37]">Fontes oficiais · Banco Central do Brasil</p>
          <h2 id="market-overview-title" className="mt-1 text-xl font-medium text-white">
            Panorama econômico
          </h2>
          <p className="mt-1 text-xs text-[#888]">Indicadores macroeconômicos; não são cotações de bolsa em tempo real.</p>
        </div>
        {marketData?.updatedAt && (
          <p className="text-xs text-[#777]">
            Consulta atualizada em {formatUpdateTime(marketData.updatedAt)}
          </p>
        )}
      </div>

      {loadError && (
        <p role="status" className="mb-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-sm text-amber-200">
          {loadError} {marketData ? 'Os últimos dados disponíveis continuam exibidos.' : ''}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {indicators.map((indicator) => {
          const item = marketData?.metrics?.[indicator.key];

          return (
            <article key={indicator.key} className="rounded-2xl border border-white/10 bg-[#0b0b0b] p-5">
              <p className="text-sm text-[#a8a8a8]">{indicator.title}</p>
              <p className="mt-1 text-xs text-[#777]">{indicator.description}</p>
              <p className="mt-5 text-2xl font-medium tracking-tight text-[#f3d47c]">
                {item?.value !== null && item?.value !== undefined
                  ? `${indicator.format(item.value)}${indicator.suffix ? ` ${indicator.suffix}` : ''}`
                  : isLoading
                    ? 'Carregando…'
                    : 'Indisponível'}
              </p>
              <p className="mt-2 text-xs text-[#777]">
                {item?.date
                  ? `Referência: ${formatReferenceDate(item.date)}${item.time ? ` às ${item.time}` : ''}`
                  : item?.error || 'Aguardando consulta à fonte oficial.'}
              </p>
            </article>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-2 text-xs text-[#777] sm:flex-row sm:items-center sm:justify-between">
        <p>Atualização automática a cada 30 minutos. A periodicidade de divulgação varia por indicador.</p>
        <a
          href="https://dadosabertos.bcb.gov.br/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit items-center gap-1.5 text-[#c9b36b] transition hover:text-[#f3d47c]"
        >
          Consultar dados abertos do BCB
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </section>
  );
}

function formatDecimal(value) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatReferenceDate(value) {
  const [year, month, day] = value.split('-').map(Number);

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function formatUpdateTime(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(value));
}
