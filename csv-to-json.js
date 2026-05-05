#!/usr/bin/env node
/**
 * Conversor CSV → JSON para o dashboard Dominus Capital
 *
 * USO:
 *   node csv-to-json.js                        # usa data.csv por padrão
 *   node csv-to-json.js meu-arquivo.csv        # usa arquivo especificado
 *
 * O arquivo CSV deve ter o formato:
 *   Ativo;Abertura;Fechamento;Res. Operação;Total
 *   WDOFUT;02/01/2026 09:05;02/01/2026 09:08;60;60
 *
 * Após rodar, faça commit do arquivo gerado e redeploy o site.
 */

const fs = require('fs');
const path = require('path');

const INPUT_CSV = process.argv[2] || path.join(__dirname, 'data.csv');
const OUTPUT_JSON = path.join(__dirname, 'frontend', 'src', 'data', 'trades.json');

if (!fs.existsSync(INPUT_CSV)) {
  console.error(`Arquivo não encontrado: ${INPUT_CSV}`);
  process.exit(1);
}

const raw = fs.readFileSync(INPUT_CSV, 'latin1');
const lines = raw.replace(/\r/g, '').split('\n').filter(l => l.trim());

const trades = [];
let skipped = 0;

for (let i = 1; i < lines.length; i++) {
  const cols = lines[i].split(';');
  if (cols.length < 4) { skipped++; continue; }

  const ativo = cols[0].trim();
  const abertura = cols[1].trim();
  const res_str = cols[3].trim();

  if (!abertura || !res_str) { skipped++; continue; }

  // Parse DD/MM/YYYY HH:MM
  const m = abertura.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
  if (!m) { console.warn(`Linha ${i + 1}: data inválida "${abertura}" — ignorada`); skipped++; continue; }

  const aberturaISO = new Date(Date.UTC(+m[3], +m[2] - 1, +m[1], +m[4], +m[5])).toISOString();
  const res = parseFloat(res_str.replace(',', '.'));
  if (isNaN(res)) { skipped++; continue; }

  trades.push({
    ativo,
    abertura: aberturaISO,
    res_operacao: res,
    custo: 1.0,
    liquido: res - 1.0,
    is_gain: res > 0,
    is_loss: res < 0,
  });
}

fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
fs.writeFileSync(OUTPUT_JSON, JSON.stringify(trades, null, 2));

console.log(`✅ Convertido: ${trades.length} trades → ${OUTPUT_JSON}`);
if (skipped > 0) console.log(`⚠️  ${skipped} linhas ignoradas (inválidas/vazias)`);
console.log('\nPróximos passos:');
console.log('  git add frontend/src/data/trades.json');
console.log('  git commit -m "chore: atualizar dados de trades"');
console.log('  git push  →  redeploy automático');
