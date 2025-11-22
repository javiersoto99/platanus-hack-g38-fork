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
import httpx
import os
from models import ReminderInstance

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
        
        # Buscar reminder_instance por message_id del mensaje original
        message_id = body.get("message", {}).get("context", {}).get("id", None)
        
        if not message_id:
            logger.warning("No se pudo obtener message_id del webhook")
            return {
                "status": "error",
                "message": "No se pudo obtener message_id del mensaje"
            }
        
        from models import ReminderInstance
        reminder_instance = db.query(ReminderInstance).filter(
            ReminderInstance.message_id == message_id
        ).first()
        
        if not reminder_instance:
            logger.warning(f"No se encontró reminder_instance para message_id {message_id}")
            return {
                "status": "error",
                "message": f"No se encontró reminder_instance para el message_id {message_id}"
            }
        
        reminder_instance_id = reminder_instance.id
        
        # Determinar el estado según la respuesta del botón
        # "taken" o "btn_yes" o "Si" = respuesta positiva
        # "skip" o "btn_no" o "No" = respuesta negativa
        is_positive_response = (
            button_id in ["taken", "btn_yes"] or 
            button_title and button_title.lower() in ["sí", "si", "yes", "ya lo tomé"]
        )
        print('is_positive_response', is_positive_response)
        
        # Status del notification_log: "sent" si fue sí, "rejected" si fue no
        log_status = "sent" if is_positive_response else "rejected"
        print('log_status', log_status)
        
        # Status del reminder_instance
        instance_status = ReminderInstanceStatus.SUCCESS.value if is_positive_response else ReminderInstanceStatus.REJECTED.value
        print('instance_status', instance_status)

        # Crear nuevo notification_log con la respuesta
        from models import NotificationLog
        notification_log = NotificationLog(
            reminder_instance_id=reminder_instance_id,
            notification_type="whatsapp",
            recepient_phone=phone_number,
            status=log_status,
            sent_at=datetime.now(),
            delivered_at=datetime.now(),
            response=user_response or f"Respuesta recibida: {button_id or button_title}"
        )
        db.add(notification_log)
        db.flush()
        db.refresh(notification_log)
        
        # Actualizar reminder_instance status
        instance_update = ReminderInstanceUpdate(
            status=instance_status,
            taken_at=datetime.now() if is_positive_response else None
        )
        ReminderInstanceService.update(db, reminder_instance_id, instance_update)
        
        logger.info(f"NotificationLog {notification_log.id} creado con status {log_status}. Reminder instance {reminder_instance_id} actualizado a {instance_status}. Respuesta: {user_response}")
        
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

@router.post("/webhook/telegram")
async def telegram_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Webhook para recibir respuestas de Telegram.
    Actualiza el reminder_instance y notification_log con la respuesta del usuario.
    
    Payload esperado de Telegram:
    {
        "update_id": 123,
        "callback_query": {
            "id": "callback_id",
            "from": {"id": 640905539, ...},
            "message": {...},
            "data": "taken" o "skip"
        }
    }
    """
    try:
        body = await request.json()
        logger.info(f"Webhook de Telegram recibido: {body}")
        
        bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        
        if "callback_query" not in body:
            logger.info("No hay callback_query en el webhook, ignorando")
            return {"status": "ok", "message": "No es un callback_query"}
        
        callback_query = body["callback_query"]
        callback_id = callback_query["id"]
        chat_id = str(callback_query["from"]["id"])  # Convertir a string para comparar
        callback_data = callback_query.get("data")
        
        # Extraer message_id del mensaje original
        message_id = None
        if "message" in callback_query and "message_id" in callback_query["message"]:
            message_id = str(callback_query["message"]["message_id"])
        
        logger.info(f"Callback recibido - chat_id: {chat_id}, message_id: {message_id}, data: {callback_data}")
        
        async with httpx.AsyncClient() as client:
            await client.post(
                f"https://api.telegram.org/bot{bot_token}/answerCallbackQuery",
                json={"callback_query_id": callback_id}
            )
        
        if not callback_data:
            logger.warning("No hay callback_data en el callback_query")
            return {
                "status": "error",
                "message": "No se pudo obtener callback_data"
            }
        
        if not message_id:
            logger.warning("No hay message_id en el callback_query")
            return {
                "status": "error",
                "message": "No se pudo obtener message_id del mensaje"
            }
        
        # Buscar reminder_instance por message_id
        from models import ReminderInstance
        reminder_instance = db.query(ReminderInstance).filter(
            ReminderInstance.message_id == message_id
        ).first()
        
        if not reminder_instance:
            logger.warning(f"No se encontró reminder_instance para message_id {message_id}")
            return {
                "status": "error",
                "message": f"No se encontró reminder_instance para el message_id {message_id}"
            }
        
        reminder_instance_id = reminder_instance.id
        
        # Determinar el estado según el callback_data
        if callback_data == "taken":
            instance_status = ReminderInstanceStatus.SUCCESS.value
            user_response = "taken: Ya lo tomé"
        elif callback_data == "skip":
            instance_status = ReminderInstanceStatus.REJECTED.value  # Usar REJECTED para "skip"
            user_response = "skip: Omitir"
        elif callback_data == "confirm":
            instance_status = ReminderInstanceStatus.SUCCESS.value
            user_response = "confirm: Confirmado"
        elif callback_data == "cancel":
            instance_status = ReminderInstanceStatus.REJECTED.value
            user_response = "cancel: Cancelado"
        else:
            # Para otros casos
            instance_status = ReminderInstanceStatus.SUCCESS.value
            user_response = f"{callback_data}: Respuesta recibida"
        
        # Buscar notification_log asociado al reminder_instance
        from models import NotificationLog
        notification_log = db.query(NotificationLog).filter(
            NotificationLog.reminder_instance_id == reminder_instance_id,
            NotificationLog.notification_type == "telegram"
        ).first()
        
        # Actualizar notification_log con la respuesta si existe
        if notification_log:
            log_update = NotificationLogUpdate(
                response=user_response,
                delivered_at=datetime.now(),
                status="delivered"
            )
            NotificationLogService.update(db, notification_log.id, log_update)
            logger.info(f"NotificationLog {notification_log.id} actualizado con respuesta: {user_response}")
        else:
            logger.warning(f"No se encontró notification_log para reminder_instance_id {reminder_instance_id}")
        
        # Actualizar reminder_instance status
        instance_update = ReminderInstanceUpdate(
            status=instance_status,
            taken_at=datetime.now() if callback_data == "taken" else None
        )
        ReminderInstanceService.update(db, reminder_instance_id, instance_update)
        logger.info(f"Reminder instance {reminder_instance_id} actualizado a {instance_status}. Respuesta: {user_response}")
        
        return {
            "status": "success",
            "reminder_instance_id": reminder_instance_id,
            "chat_id": chat_id,
            "user_response": user_response,
            "callback_data": callback_data,
            "message": "Webhook procesado correctamente"
        }
        
    except Exception as e:
        logger.error(f"Error procesando webhook de Telegram: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return {
            "status": "error",
            "message": str(e)
        }