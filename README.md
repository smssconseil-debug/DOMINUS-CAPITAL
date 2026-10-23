# DOMINUS CAPITAL — Protótipo

Protótipo demonstrativo em React hospedado no **Vercel**, com conceitos de automação, visualização de dados e atualização de dados de exemplo via **Google Sheets → GitHub Actions**.

## Sobre a demonstração

- O conceito Gênesis e os cartões de conteúdo são exemplos visuais em desenvolvimento.
- A página não oferece cadastro, contratação, serviços ou processamento de pagamentos.
- Os gráficos exibem dados históricos e têm finalidade demonstrativa; resultados passados não garantem resultados futuros.
- A página inicial consulta dólar PTAX, Selic e IPCA nas APIs públicas do Banco Central do Brasil. Os indicadores têm diferentes frequências de divulgação e não são cotações de bolsa em tempo real.

## Panorama econômico

O painel da página inicial usa uma função da Vercel (`/api/panorama`) para consultar as APIs do Banco Central:

- Dólar PTAX (cotação de venda): API PTAX do BCB.
- Selic anualizada (série diária): SGS série 432.
- IPCA (variação mensal): SGS série 433.

Os dados são atualizados automaticamente a cada 30 minutos no navegador e armazenados em cache na função por até 5 minutos. Cada cartão mostra a data de referência retornada pela fonte. Uma falha de consulta é exibida sem substituir os dados por valores simulados.

---

## Como funciona a atualização automática

```
Google Sheets  →  GitHub Actions (cron diário)  →  commit trades.json  →  Vercel re-deploya
```

1. A planilha do Google Sheets é publicada como CSV público.
2. O GitHub Action (`sync-sheets.yml`) roda todo dia às 06:00 UTC, faz o fetch do CSV e executa `csv-to-json.js`.
3. Se `frontend/src/data/trades.json` mudou, o bot commita e faz push.
4. O Vercel detecta o push e faz rebuild + deploy automático.

---

## Configuração inicial

### 1. Preparar a planilha Google Sheets

A planilha deve ter uma **linha de cabeçalho** com estas colunas (os nomes devem ser exatamente esses):

| ativo | abertura | res_operacao | custo |
|-------|----------|--------------|-------|
| WDOFUT | 02/01/2026 09:05:00 | 60 | 1 |
| WDOFUT | 02/01/2026 09:38:00 | -90 | 1 |

- **ativo** — ticker do ativo (ex: `WDOFUT`, `WINFUT`)
- **abertura** — data/hora de abertura no formato `DD/MM/AAAA HH:MM:SS` ou `AAAA-MM-DD HH:MM:SS`
- **res_operacao** — resultado bruto da operação em R$ (pode ser negativo)
- **custo** — custo/taxa em R$ (sempre positivo)

> Os campos `liquido`, `is_gain` e `is_loss` são calculados automaticamente.

### 2. Publicar a planilha como CSV

1. No Google Sheets: **Arquivo → Compartilhar → Publicar na web**
2. Escolha a aba correta e selecione formato **Valores separados por vírgula (.csv)**
3. Clique em **Publicar** e copie o link gerado
   - O link terá o formato: `https://docs.google.com/spreadsheets/d/.../pub?gid=...&single=true&output=csv`

### 3. Adicionar o secret no GitHub

1. Vá em **Settings → Secrets and variables → Actions** no repositório
2. Clique em **New repository secret**
3. Nome: `SHEETS_CSV_URL`
4. Valor: cole a URL CSV copiada no passo anterior

### 4. (Opcional) Alterar a frequência de atualização

Edite o campo `cron` em `.github/workflows/sync-sheets.yml`:

```yaml
schedule:
  - cron: '0 6 * * *'   # todo dia às 06:00 UTC
  # - cron: '0 */6 * * *' # a cada 6 horas
  # - cron: '0 9,13 * * 1-5' # seg-sex às 09h e 13h UTC
```

### 5. Disparar manualmente (primeira vez)

Após configurar o secret, vá em **Actions → Sync Google Sheets → trades.json → Run workflow** para testar imediatamente sem esperar o cron.

---

## Atualização manual (sem automação)

```bash
# 1. Baixe o CSV da planilha e salve como trades.csv na raiz
# 2. Execute:
node csv-to-json.js trades.csv
# 3. Commit e push do arquivo gerado:
git add frontend/src/data/trades.json
git commit -m "chore(data): update trades"
git push
```

---

## Desenvolvimento local

```bash
cd frontend
yarn install
yarn start
```

O panorama ao vivo usa uma função da Vercel em `/api/panorama`; para validar essa parte, use uma prévia implantada na Vercel.
