import pandas as pd
import pymongo
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv('/app/backend/.env')

mongo_url = os.environ['MONGO_URL']
client = pymongo.MongoClient(mongo_url)
db = client[os.environ['DB_NAME']]

df = pd.read_csv('/app/data.csv', sep=';', encoding='latin1')
df.columns = ['ativo', 'abertura', 'fechamento', 'res_operacao', 'total']

# Drop NaN
df = df.dropna(subset=['abertura', 'res_operacao'])

# Parse dates (Format: DD/MM/YYYY HH:MM)
df['abertura_dt'] = pd.to_datetime(df['abertura'], format='%d/%m/%Y %H:%M', exact=False, errors='coerce')
df['abertura_dt'] = df['abertura_dt'].fillna(pd.to_datetime(df['abertura'], dayfirst=True, errors='coerce'))

df['fechamento_dt'] = pd.to_datetime(df['fechamento'], format='%d/%m/%Y %H:%M', exact=False, errors='coerce')
df['fechamento_dt'] = df['fechamento_dt'].fillna(pd.to_datetime(df['fechamento'], dayfirst=True, errors='coerce'))

# Prepare records
records = []
for _, row in df.iterrows():
    if pd.isna(row['abertura_dt']): continue
    records.append({
        'ativo': str(row['ativo']),
        'abertura': row['abertura_dt'],
        'fechamento': row['fechamento_dt'],
        'res_operacao': float(row['res_operacao']),
        'custo': 1.0,
        'liquido': float(row['res_operacao']) - 1.0,
        'is_gain': float(row['res_operacao']) > 0,
        'is_loss': float(row['res_operacao']) < 0,
        'is_zero': float(row['res_operacao']) == 0
    })

if records:
    db.trades.delete_many({})
    db.trades.insert_many(records)
    print(f"Inserted {len(records)} trades")
else:
    print("No records inserted")
