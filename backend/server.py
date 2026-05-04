from dotenv import load_dotenv
import os
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, Request, Response, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import logging
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone

from auth import (
    hash_password, verify_password, create_access_token, create_refresh_token, get_current_user
)

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# -- Models --
class LoginRequest(BaseModel):
    email: str
    password: str

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -- Auth Endpoints --
@api_router.post("/auth/login")
async def login(req: LoginRequest, response: Response):
    email = req.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    user["_id"] = user_id
    user.pop("password_hash", None)
    return user

@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user

@api_router.post("/auth/logout")
async def logout(response: Response, user: dict = Depends(get_current_user)):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

# -- Dashboard Endpoints --
@api_router.get("/dashboard/metrics")
async def get_metrics(
    user: dict = Depends(get_current_user),
    mes: Optional[str] = None,
    dia: Optional[int] = None,
    periodo: Optional[str] = None
):
    query = {}
    # Mes map
    meses_map = {
        "janeiro": 1, "fevereiro": 2, "março": 3, "abril": 4, "maio": 5, "junho": 6,
        "julho": 7, "agosto": 8, "setembro": 9, "outubro": 10, "novembro": 11, "dezembro": 12
    }
    
    # In a real app, query by datetime range. Our seed data has dates.
    # To filter by month/day, we can either aggregate or fetch and filter in memory.
    # Since dataset is small, let's fetch all and filter in memory for speed and flexibility.
    trades = await db.trades.find({}, {"_id": 0}).to_list(None)
    
    filtered_trades = []
    for t in trades:
        abertura = t['abertura']
        if mes and meses_map.get(mes.lower()) != abertura.month:
            continue
        if dia and dia != abertura.day:
            continue
        if periodo:
            hour = abertura.hour
            is_manha = hour < 12
            if periodo.lower() == "manhã" and not is_manha:
                continue
            if periodo.lower() == "tarde" and is_manha:
                continue
        filtered_trades.append(t)

    # Calculate KPIs
    lucro_bruto = sum(t['res_operacao'] for t in filtered_trades if t['res_operacao'] > 0)
    custos = sum(t['custo'] for t in filtered_trades)
    lucro_liquido = sum(t['liquido'] for t in filtered_trades)
    operacoes = len(filtered_trades)
    gains = sum(1 for t in filtered_trades if t['is_gain'])
    loss = sum(1 for t in filtered_trades if t['is_loss'])
    assertividade = (gains / operacoes * 100) if operacoes > 0 else 0
    
    # Unique days operated
    dias_operados = len(set(t['abertura'].date() for t in filtered_trades))
    
    # Calculate Run-Up / DrawDown based on cumulative equity curve
    cumulative = 0
    max_cum = 0
    drawdown = 0
    runup = 0
    for t in filtered_trades: # ensure chronologically sorted
        cumulative += t['liquido']
        if cumulative > max_cum:
            max_cum = cumulative
        dd = cumulative - max_cum
        if dd < drawdown:
            drawdown = dd
        if cumulative > runup:
            runup = cumulative

    kpis = {
        "lucro_liquido": round(lucro_liquido, 2),
        "lucro_bruto": round(lucro_bruto, 2),
        "custos": round(custos, 2),
        "operacoes": operacoes,
        "gains": gains,
        "loss": loss,
        "assertividade": round(assertividade, 2),
        "dias_operados": dias_operados,
        "drawdown": round(drawdown, 2),
        "runup": round(runup, 2)
    }

    # Group by Day
    daily_map = {}
    for t in filtered_trades:
        d = t['abertura'].day
        if d not in daily_map:
            daily_map[d] = {'dia': d, 'liquido': 0, 'gains': 0, 'ops': 0}
        daily_map[d]['liquido'] += t['liquido']
        daily_map[d]['gains'] += 1 if t['is_gain'] else 0
        daily_map[d]['ops'] += 1
    
    daily = []
    acumulado = 0
    for d in sorted(daily_map.keys()):
        dm = daily_map[d]
        acumulado += dm['liquido']
        daily.append({
            "dia": dm['dia'],
            "liquido": round(dm['liquido'], 2),
            "acumulado": round(acumulado, 2),
            "assertividade": round((dm['gains'] / dm['ops'] * 100), 2) if dm['ops'] > 0 else 0
        })

    # Group by Month
    inv_meses_map = {v: k for k, v in meses_map.items()}
    month_map = {}
    for t in filtered_trades:
        m = inv_meses_map.get(t['abertura'].month, "mes")
        if m not in month_map:
            month_map[m] = {'mes': m, 'liquido': 0, 'm_num': t['abertura'].month}
        month_map[m]['liquido'] += t['liquido']
    
    monthly = []
    for m_val in sorted(month_map.values(), key=lambda x: x['m_num']):
        m = m_val['mes']
        liq = m_val['liquido']
        perc = (liq / lucro_liquido * 100) if lucro_liquido != 0 else 0
        monthly.append({
            "mes": m,
            "liquido": round(liq, 2),
            "percent": round(perc, 2)
        })

    # Group by Hour
    hour_map = {}
    for t in filtered_trades:
        h = t['abertura'].hour
        label = f"{h:02d}h - {h+1:02d}h"
        if label not in hour_map:
            hour_map[label] = {'horario': label, 'liquido': 0, 'h': h}
        hour_map[label]['liquido'] += t['liquido']
    
    hourly = []
    for h_val in sorted(hour_map.values(), key=lambda x: x['h']):
        h_label = h_val['horario']
        liq = h_val['liquido']
        perc = (liq / lucro_liquido * 100) if lucro_liquido != 0 else 0
        hourly.append({
            "horario": h_label,
            "liquido": round(liq, 2),
            "percent": round(perc, 2)
        })

    # MEP Liquido Mock (as this seems to be a specific custom grouping 1..4)
    mep = [
        {"mep": "1", "liquido": round(lucro_liquido * 0.4, 2), "percent": 40.0},
        {"mep": "2", "liquido": round(lucro_liquido * 0.3, 2), "percent": 30.0},
        {"mep": "3", "liquido": round(lucro_liquido * 0.2, 2), "percent": 20.0},
        {"mep": "4", "liquido": round(lucro_liquido * 0.1, 2), "percent": 10.0}
    ]

    return {
        "kpis": kpis,
        "daily": daily,
        "monthly": monthly,
        "hourly": hourly,
        "mep": mep,
        "chart": daily # Daily contains the chart data already
    }


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hashed,
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc)
        })
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})

@app.on_event("startup")
async def startup_event():
    await db.users.create_index("email", unique=True)
    await seed_admin()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
