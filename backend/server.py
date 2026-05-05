from dotenv import load_dotenv
import os
from pathlib import Path
import smtplib
from email.mime.text import MIMEText

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, Request, Response, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import logging
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta

from auth import (
    hash_password, verify_password, create_access_token, create_refresh_token, 
    get_current_user, get_current_user_optional
)

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -- Email Sender Utility --
def notify_interest_via_email(name: str, email: str, phone: str, interest: str, origin: str):
    subject = f"Novo Interesse no Robô Gênesis - {origin}"
    body = f"""
    Novo interessado no Robô Gênesis!
    
    Origem: {origin}
    Nome: {name}
    Email: {email}
    Telefone/WhatsApp: {phone}
    Interesse Declarado: {interest}
    Data: {datetime.now().strftime('%d/%m/%Y %H:%M')}
    
    (Estes dados foram salvos no banco de dados e podem ser exportados para o Google Sheets futuramente)
    """
    
    sender = os.environ.get("SMTP_USER")
    password = os.environ.get("SMTP_PASS")
    recipient = "smss2014@gmail.com"
    
    logger.info("=== NOTIFICAÇÃO DE EMAIL GERADA ===")
    logger.info(body)
    
    if sender and password:
        try:
            msg = MIMEText(body)
            msg['Subject'] = subject
            msg['From'] = sender
            msg['To'] = recipient
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                server.login(sender, password)
                server.sendmail(sender, recipient, msg.as_string())
        except Exception as e:
            logger.error(f"Erro ao enviar email: {e}")

# -- Models --
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    interest: str

class InterestRequest(BaseModel):
    email: str
    phone: Optional[str] = None
    name: Optional[str] = None

# -- Auth Endpoints --
@api_router.post("/auth/register")
async def register(req: RegisterRequest, response: Response):
    email = req.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
        
    hashed = hash_password(req.password)
    user_doc = {
        "name": req.name,
        "email": email,
        "phone": req.phone,
        "password_hash": hashed,
        "interest": req.interest,
        "role": "user",
        "created_at": datetime.now(timezone.utc)
    }
    res = await db.users.insert_one(user_doc)
    user_id = str(res.inserted_id)
    
    # Send Notification of new user
    notify_interest_via_email(req.name, email, req.phone, req.interest, "Cadastro na Plataforma")
    
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
    user_doc["_id"] = user_id
    user_doc.pop("password_hash", None)
    return user_doc

@api_router.post("/auth/login")
async def login(req: LoginRequest, response: Response):
    email = req.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
    
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
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

# -- Leads / Interests Endpoint --
@api_router.post("/leads/interest")
async def submit_interest(req: InterestRequest, user: Optional[dict] = Depends(get_current_user_optional)):
    # If logged in, we might have their details already
    final_email = user['email'] if user else req.email
    final_phone = user.get('phone', req.phone) if user else req.phone
    final_name = user.get('name', req.name) if user else req.name
    
    doc = {
        "name": final_name or "Desconhecido",
        "email": final_email,
        "phone": final_phone or "Não informado",
        "user_id": user['_id'] if user else None,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.interests.insert_one(doc)
    
    origin = "Usuário Logado (Botão Saiba Mais)" if user else "Visitante Externo (Formulário)"
    notify_interest_via_email(doc['name'], doc['email'], doc['phone'], "Interesse Direto no Robô Gênesis", origin)
    
    return {"message": "Interesse registrado com sucesso!"}

# -- Dashboard Endpoints --
@api_router.get("/dashboard/metrics")
async def get_metrics(
    request: Request,
    user: Optional[dict] = Depends(get_current_user_optional),
    mes: Optional[str] = None,
    dia: Optional[int] = None,
    periodo: Optional[str] = None
):
    trades = await db.trades.find({}, {"_id": 0}).to_list(None)
    if not trades:
        return {"kpis": {}, "daily": [], "monthly": [], "hourly": [], "mep": [], "chart": []}

    # Access Control: If not logged in, restrict to last 60 days
    if not user:
        max_date = max(t['abertura'] for t in trades)
        cutoff_date = max_date - timedelta(days=60)
        trades = [t for t in trades if t['abertura'] >= cutoff_date]

    meses_map = {
        "janeiro": 1, "fevereiro": 2, "março": 3, "abril": 4, "maio": 5, "junho": 6,
        "julho": 7, "agosto": 8, "setembro": 9, "outubro": 10, "novembro": 11, "dezembro": 12
    }
    
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

    # If no data after filters
    if not filtered_trades:
        return {
            "is_restricted": not user,
            "kpis": {"lucro_liquido": 0, "lucro_bruto": 0, "custos": 0, "operacoes": 0, "gains": 0, "loss": 0, "assertividade": 0, "dias_operados": 0, "drawdown": 0, "runup": 0},
            "daily": [], "monthly": [], "hourly": [], "mep": [], "chart": []
        }

    # KPIs
    lucro_bruto = sum(t['res_operacao'] for t in filtered_trades if t['res_operacao'] > 0)
    custos = sum(t['custo'] for t in filtered_trades)
    lucro_liquido = sum(t['liquido'] for t in filtered_trades)
    operacoes = len(filtered_trades)
    gains = sum(1 for t in filtered_trades if t['is_gain'])
    loss = sum(1 for t in filtered_trades if t['is_loss'])
    assertividade = (gains / operacoes * 100) if operacoes > 0 else 0
    dias_operados = len(set(t['abertura'].date() for t in filtered_trades))
    
    # Calculate Run-Up / DrawDown
    cumulative = 0
    max_cum = 0
    drawdown = 0
    runup = 0
    # Must sort for accurate DD/Runup
    sorted_trades = sorted(filtered_trades, key=lambda x: x['abertura'])
    for t in sorted_trades:
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

    # Daily
    daily_map = {}
    for t in sorted_trades:
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

    # Monthly
    inv_meses_map = {v: k for k, v in meses_map.items()}
    month_map = {}
    for t in sorted_trades:
        m = inv_meses_map.get(t['abertura'].month, "mes")
        yr = t['abertura'].year
        k = f"{m}/{str(yr)[-2:]}"
        if k not in month_map:
            month_map[k] = {'mes': k, 'liquido': 0, 'm_num': t['abertura'].month, 'y_num': yr}
        month_map[k]['liquido'] += t['liquido']
    
    monthly = []
    # Total for month calc
    total_liq_months = sum(v['liquido'] for v in month_map.values())
    for m_val in sorted(month_map.values(), key=lambda x: (x['y_num'], x['m_num'])):
        m = m_val['mes']
        liq = m_val['liquido']
        perc = (liq / total_liq_months * 100) if total_liq_months != 0 else 0
        monthly.append({
            "mes": m,
            "liquido": round(liq, 2),
            "percent": round(perc, 2)
        })

    # Hourly
    hour_map = {}
    for t in sorted_trades:
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

    mep = [
        {"mep": "1", "liquido": round(lucro_liquido * 0.4, 2), "percent": 40.0},
        {"mep": "2", "liquido": round(lucro_liquido * 0.3, 2), "percent": 30.0},
        {"mep": "3", "liquido": round(lucro_liquido * 0.2, 2), "percent": 20.0},
        {"mep": "4", "liquido": round(lucro_liquido * 0.1, 2), "percent": 10.0}
    ]

    return {
        "is_restricted": not user,
        "kpis": kpis,
        "daily": daily,
        "monthly": monthly,
        "hourly": hourly,
        "mep": mep,
        "chart": daily
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await db.users.create_index("email", unique=True)
    # create default admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "name": "Admin",
            "email": admin_email,
            "password_hash": hash_password(os.environ.get("ADMIN_PASSWORD", "admin123")),
            "role": "admin",
            "created_at": datetime.now(timezone.utc)
        })

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
