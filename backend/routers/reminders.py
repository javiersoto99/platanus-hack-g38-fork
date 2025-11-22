from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
from database import get_db
from services.reminders import ReminderService
from services.reminder_scheduler import ReminderSchedulerService
from services.reminder_instances import ReminderInstanceService
from services.notification_logs import NotificationLogService
from dtos.reminders import ReminderCreate, ReminderUpdate, ReminderResponse
from dtos.reminder_instances import ReminderInstanceUpdate
from dtos.notification_logs import NotificationLogUpdate
from enums import ReminderInstanceStatus
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reminders", tags=["reminders"])


@router.get("/", response_model=List[ReminderResponse])
async def get_reminders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Obtener todos los recordatorios con paginación"""
    reminders = ReminderService.get_all(db, skip=skip, limit=limit)
    return reminders


@router.get("/{reminder_id}", response_model=ReminderResponse)
async def get_reminder(
    reminder_id: int,
    db: Session = Depends(get_db)
):
    """Obtener un recordatorio por su ID"""
    reminder = ReminderService.get_by_id(db, reminder_id)
    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recordatorio con ID {reminder_id} no encontrado"
        )
    return reminder


@router.get("/active/all", response_model=List[ReminderResponse])
async def get_active_reminders(
    db: Session = Depends(get_db)
):
    """Obtener todos los recordatorios activos"""
    reminders = ReminderService.get_active(db)
    return reminders


@router.get("/type/{reminder_type}", response_model=List[ReminderResponse])
async def get_reminders_by_type(
    reminder_type: str,
    db: Session = Depends(get_db)
):
    """Obtener todos los recordatorios por tipo"""
    reminders = ReminderService.get_by_type(db, reminder_type)
    return reminders


@router.post("/", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
async def create_reminder(
    reminder_data: ReminderCreate,
    db: Session = Depends(get_db)
):
    """Crear un nuevo recordatorio"""
    try:
        reminder = ReminderService.create(db, reminder_data)
        return reminder
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.put("/{reminder_id}", response_model=ReminderResponse)
async def update_reminder(
    reminder_id: int,
    reminder_data: ReminderUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar un recordatorio existente"""
    try:
        reminder = ReminderService.update(db, reminder_id, reminder_data)
        if not reminder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Recordatorio con ID {reminder_id} no encontrado"
            )
        return reminder
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.patch("/{reminder_id}", response_model=ReminderResponse)
async def partial_update_reminder(
    reminder_id: int,
    reminder_data: ReminderUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar parcialmente un recordatorio existente"""
    try:
        reminder = ReminderService.update(db, reminder_id, reminder_data)
        if not reminder:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Recordatorio con ID {reminder_id} no encontrado"
            )
        return reminder
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )


@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reminder(
    reminder_id: int,
    db: Session = Depends(get_db)
):
    """Eliminar un recordatorio"""
    success = ReminderService.delete(db, reminder_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recordatorio con ID {reminder_id} no encontrado"
        )
    return None


@router.post("/check")
async def check_reminders(
    db: Session = Depends(get_db)
):
    """
    Endpoint para el cronjob externo que verifica y procesa reminders pendientes.
    Este endpoint debe ser llamado cada 5 segundos.
    """
    try:
        results = await ReminderSchedulerService.process_pending_reminders(db)
        return {
            "status": "success",
            "processed": results["processed"],
            "successful": results["successful"],
            "failed": results["failed"],
            "errors": results["errors"]
        }
    except Exception as e:
        logger.error(f"Error en check_reminders: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar reminders: {str(e)}"
        )


@router.post("/webhook")
async def whatsapp_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Webhook para recibir respuestas de WhatsApp desde Kapso.
    Actualiza el reminder_instance y notification_log con la respuesta del usuario.
    
    Payload esperado de Kapso:
    {
        "message": {
            "from": "56979745451",
            "interactive": {
                "type": "button_reply",
                "button_reply": {
                    "id": "btn_yes",
                    "title": "Si"
                }
            }
        },
        "conversation": {
            "phone_number": "56979745451"
        }
    }
    """
    try:
        body = await request.json()
        logger.info(f"Webhook recibido: {body}")
        
        # Extraer información del payload de Kapso
        phone_number = None
        user_response = None
        button_id = None
        button_title = None
        
        # Obtener número de teléfono del remitente
        if "message" in body and "from" in body["message"]:
            phone_number = body["message"]["from"]
        elif "conversation" in body and "phone_number" in body["conversation"]:
            phone_number = body["conversation"]["phone_number"]
        
        # Obtener respuesta del botón si es un mensaje interactivo
        if "message" in body and "interactive" in body["message"]:
            interactive = body["message"]["interactive"]
            if interactive.get("type") == "button_reply" and "button_reply" in interactive:
                button_reply = interactive["button_reply"]
                button_id = button_reply.get("id")
                button_title = button_reply.get("title")
                user_response = f"{button_id}: {button_title}" if button_id and button_title else button_id or button_title
        
        if not phone_number:
            logger.warning(f"No se pudo obtener phone_number del webhook: {body}")
            return {
                "status": "error",
                "message": "No se pudo obtener el número de teléfono del webhook"
            }
        
        # Buscar notification_log por phone_number y status "sent" o "waiting"
        # Buscamos el más reciente que esté esperando respuesta
        from models import NotificationLog
        notification_log = db.query(NotificationLog).filter(
            NotificationLog.recepient_phone == phone_number,
            NotificationLog.status.in_(["sent", "waiting"])
        ).order_by(NotificationLog.sent_at.desc()).first()
        
        if not notification_log:
            logger.warning(f"No se encontró notification_log para phone_number {phone_number}")
            return {
                "status": "error",
                "message": f"No se encontró notification_log para el número {phone_number}"
            }
        
        reminder_instance_id = notification_log.id
        
        # Actualizar notification_log con la respuesta
        log_update = NotificationLogUpdate(
            response=user_response or "Respuesta recibida",
            delivered_at=datetime.now(),
            status="delivered"
        )
        NotificationLogService.update(db, reminder_instance_id, log_update)
        
        # Actualizar reminder_instance status a "success"
        reminder_instance = ReminderInstanceService.get_by_id(db, reminder_instance_id)
        if reminder_instance:
            instance_update = ReminderInstanceUpdate(
                status=ReminderInstanceStatus.SUCCESS.value
            )
            ReminderInstanceService.update(db, reminder_instance_id, instance_update)
            logger.info(f"Reminder instance {reminder_instance_id} actualizado a success. Respuesta: {user_response}")
        else:
            logger.warning(f"No se encontró reminder_instance con id {reminder_instance_id}")
        
        return {
            "status": "success",
            "reminder_instance_id": reminder_instance_id,
            "phone_number": phone_number,
            "user_response": user_response,
            "message": "Webhook procesado correctamente"
        }
        
    except Exception as e:
        logger.error(f"Error procesando webhook: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return {
            "status": "error",
            "message": str(e)
        }

