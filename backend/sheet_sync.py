import asyncio
import pandas as pd
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

SHEET_URL = 'https://docs.google.com/spreadsheets/d/1Mbfa_CVNL1xxoJntMKs0R5IG47N8VF3h77O9y82J4rE/export?format=csv'

def fetch_and_parse_sheet() -> list:
    df = pd.read_csv(SHEET_URL)
    df.columns = ['ativo', 'abertura', 'fechamento', 'resultado', 'total']
    df = df.dropna(subset=['abertura', 'resultado'])
    
    # Parse dates: usually MM/DD/YY HH:MM in this sheet
    df['abertura_dt'] = pd.to_datetime(df['abertura'], format='%m/%d/%y %H:%M', exact=False, errors='coerce')
    df['fechamento_dt'] = pd.to_datetime(df['fechamento'], format='%m/%d/%y %H:%M', exact=False, errors='coerce')
    
    df['abertura_dt'] = df['abertura_dt'].fillna(pd.to_datetime(df['abertura'], errors='coerce'))
    df['fechamento_dt'] = df['fechamento_dt'].fillna(pd.to_datetime(df['fechamento'], errors='coerce'))
    
    records = []
    for _, row in df.iterrows():
        if pd.isna(row['abertura_dt']): continue
        
        # Clean currency string if needed
        res_str = str(row['resultado']).replace(',', '.').strip()
        try:
            res_float = float(res_str)
        except ValueError:
            continue
            
        records.append({
            'ativo': str(row['ativo']),
            'abertura': row['abertura_dt'],
            'fechamento': row['fechamento_dt'],
            'res_operacao': res_float,
            'custo': 1.0,
            'liquido': res_float - 1.0,
            'is_gain': res_float > 0,
            'is_loss': res_float < 0,
            'is_zero': res_float == 0
        })
    return records

async def sync_google_sheets(db):
    try:
        logger.info("Fetching Google Sheets data...")
        records = await asyncio.to_thread(fetch_and_parse_sheet)
        
        if records:
            await db.trades.delete_many({})
            await db.trades.insert_many(records)
            logger.info(f"Successfully synced {len(records)} trades from Google Sheets.")
            return {"status": "success", "count": len(records)}
        else:
            logger.warning("No records found in Google Sheet.")
            return {"status": "error", "message": "No valid records found"}
    except Exception as e:
        logger.error(f"Error syncing sheets: {e}")
        return {"status": "error", "message": str(e)}
