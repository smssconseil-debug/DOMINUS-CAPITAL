#!/usr/bin/env node
/**
 * csv-to-json.js
 *
 * Fetches a CSV from a Google Sheets "Publish to web" URL (or reads a local file)
 * and writes the converted data to frontend/src/data/trades.json.
 *
 * Usage:
 *   node csv-to-json.js                          # uses SHEETS_CSV_URL env var
 *   node csv-to-json.js <url-or-local-path>      # explicit source
 *
 * Expected CSV columns (order-independent, header row required):
 *   ativo       - asset ticker, e.g. WDOFUT
 *   abertura    - open datetime: "YYYY-MM-DD HH:MM:SS" or "DD/MM/YYYY HH:MM:SS"
 *   res_operacao - gross result in BRL (number)
 *   custo       - cost/fee in BRL (number)
 *
 * Derived fields (computed automatically):
 *   liquido = res_operacao - custo
 *   is_gain = liquido > 0
 *   is_loss = liquido < 0
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const OUTPUT_PATH = path.join(__dirname, 'frontend', 'src', 'data', 'trades.json');

// ── helpers ──────────────────────────────────────────────────────────────────

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function parseCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCsv(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(Boolean);
  if (lines.length < 2) throw new Error('CSV has no data rows');
  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().trim());
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = values[i] ?? ''; });
    return obj;
  });
}

/**
 * Parses a datetime string in either:
 *   ISO:        "2026-01-02T09:05:00" / "2026-01-02 09:05:00"
 *   Brazilian:  "02/01/2026 09:05:00"
 * Returns an ISO 8601 UTC string "YYYY-MM-DDTHH:MM:SS.000Z"
 */
function parseAbertura(raw) {
  const s = raw.trim();

  // ISO-ish: starts with 4-digit year (YYYY-MM-DD or YYYY/MM/DD)
  if (/^\d{4}[-/]/.test(s)) {
    const normalized = s.replace(/\//g, '-').replace(' ', 'T');
    const withZ = normalized.endsWith('Z') ? normalized : normalized + 'Z';
    const d = new Date(withZ);
    if (!isNaN(d)) return d.toISOString();
  }

  // Brazilian: DD/MM/YYYY HH:MM:SS or DD/MM/YYYY
  const brMatch = s.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (brMatch) {
    const [, dd, mm, yyyy, hh = '00', min = '00', ss = '00'] = brMatch;
    const d = new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}Z`);
    if (!isNaN(d)) return d.toISOString();
  }

  throw new Error(`Cannot parse datetime: "${raw}"`);
}

function parseNumber(raw) {
  if (raw === undefined || raw === null || raw === '') return 0;
  // Remove thousand separators (. in pt-BR) and normalise decimal comma
  const s = String(raw).replace(/\./g, '').replace(',', '.').replace(/[^\d.\-]/g, '');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function round2(n) { return Math.round(n * 100) / 100; }

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const source = process.argv[2] || process.env.SHEETS_CSV_URL;

  if (!source) {
    console.error(
      'Error: no source provided.\n' +
      'Set the SHEETS_CSV_URL environment variable or pass the URL/path as first argument.'
    );
    process.exit(1);
  }

  let csvText;
  if (source.startsWith('http://') || source.startsWith('https://')) {
    console.log(`Fetching CSV from: ${source}`);
    csvText = await fetchUrl(source);
  } else {
    console.log(`Reading local file: ${source}`);
    csvText = fs.readFileSync(source, 'utf8');
  }

  const rows = parseCsv(csvText);
  console.log(`Parsed ${rows.length} rows`);

  // Validate required columns
  const required = ['ativo', 'abertura', 'res_operacao', 'custo'];
  const headers = Object.keys(rows[0] || {});
  for (const col of required) {
    if (!headers.includes(col)) {
      throw new Error(`Missing required column "${col}". Found columns: ${headers.join(', ')}`);
    }
  }

  const trades = rows
    .filter((r) => r.ativo && r.abertura) // skip blank rows
    .map((r) => {
      const res_operacao = round2(parseNumber(r.res_operacao));
      const custo = round2(parseNumber(r.custo));
      const liquido = round2(res_operacao - custo);
      return {
        ativo: r.ativo.trim().toUpperCase(),
        abertura: parseAbertura(r.abertura),
        res_operacao,
        custo,
        liquido,
        is_gain: liquido > 0,
        is_loss: liquido < 0,
      };
    });

  console.log(`Converted ${trades.length} valid trades`);

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(trades, null, 2) + '\n', 'utf8');
  console.log(`Written to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
