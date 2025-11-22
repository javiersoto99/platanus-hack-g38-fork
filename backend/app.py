from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Dict
import os
from integrations.twilio import create_call
from integrations.gemini import generate_content
from integrations.kapso import send_whatsapp_message
from integrations.telegram import send_telegram_message
from routers import appointments, elderly_profiles, health_workers, users, medicines, notification_logs, reminders, reminder_instances, family_elderly_relationship
from database import Base, engine
from services.cron_service import init_scheduler, shutdown_scheduler
# from routers import auth
# from config import settings
import os

load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar el scheduler de cron al arrancar la aplicación
@app.on_event("startup")
async def startup_event():
    # Obtener intervalo del .env o usar 60 segundos por defecto
    interval_seconds = int(os.getenv('REMINDER_CRON_INTERVAL_SECONDS', '60'))
    init_scheduler(interval_seconds=interval_seconds)
    print(f"✅ Scheduler de recordatorios iniciado (intervalo: {interval_seconds} segundos)")

@app.on_event("shutdown")
async def shutdown_event():
    shutdown_scheduler()
    print("✅ Scheduler de recordatorios detenido")

# Importar todos los modelos para que estén registrados en Base.metadata
from models import Appointment, ElderlyProfile, HealthWorker, User, Medicine, NotificationLog, ReminderInstance, Reminder, FamilyElderlyRelationship

# Crear las tablas si no existen (solo en desarrollo, comentar en producción)
# Base.metadata.create_all(bind=engine)

class GeminiRequest(BaseModel):
    text: str
    model: str = "gemini-2.5-flash-lite"

class WhatsAppRequest(BaseModel):
    to: str
    body_text: str
    buttons: List[Dict[str, str]]
    phone_number_id: str = None

@app.get("/")
async def health_check():
    return {"status": "healthy!"}

@app.post("/calls/create")
async def create_phone_call(to: str = None, message: str = None):
    """Endpoint para crear una llamada telefónica usando Twilio"""
    try:
        # Valores por defecto para testing
        to_number = to or os.getenv('DEFAULT_PHONE_NUMBER', '+56979745451')
        call_message = message or "Hola, este es un recordatorio de prueba."
        
        call_sid = create_call(to_number, call_message)
        return {"status": "success", "message": "Llamada iniciada correctamente", "call_sid": call_sid}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/gemini/generate")
async def generate_gemini_content(request: GeminiRequest):
    """Endpoint para generar contenido usando la API de Gemini"""
    try:
        response = generate_content(request.text, request.model)
        return {"status": "success", "data": response}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/whatsapp/send")
async def send_whatsapp(request: WhatsAppRequest):
    """Endpoint para enviar un mensaje de WhatsApp con botones interactivos"""
    try:
        # response = await send_whatsapp_message(
        #     to=request.to,
        #     body_text=request.body_text,
        #     buttons=request.buttons,
        #     phone_number_id=request.phone_number_id
        # )
        response = await send_telegram_message(
            to=request.to,
            text=request.body_text
        )
        return {"status": "success", "data": response}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Routers
app.include_router(appointments.router)
app.include_router(elderly_profiles.router)
app.include_router(health_workers.router)
app.include_router(users.router)
app.include_router(medicines.router)
app.include_router(notification_logs.router)
app.include_router(reminders.router)
app.include_router(reminder_instances.router)
app.include_router(family_elderly_relationship.router)