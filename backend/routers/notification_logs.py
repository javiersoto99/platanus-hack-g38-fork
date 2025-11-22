from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from services.notification_logs import NotificationLogService
from dtos.notification_logs import NotificationLogCreate, NotificationLogUpdate, NotificationLogResponse

router = APIRouter(prefix="/notification-logs", tags=["notification-logs"])


@router.get("/", response_model=List[NotificationLogResponse])
async def get_notification_logs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Obtener todos los logs de notificaciones con paginación"""
    logs = NotificationLogService.get_all(db, skip=skip, limit=limit)
    return logs


@router.get("/{log_id}", response_model=NotificationLogResponse)
async def get_notification_log(
    log_id: int,
    db: Session = Depends(get_db)
):
    """Obtener un log de notificación por su ID"""
    log = NotificationLogService.get_by_id(db, log_id)
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Log de notificación con ID {log_id} no encontrado"
        )
    return log


@router.get("/reminder-instance/{reminder_instance_id}", response_model=List[NotificationLogResponse])
async def get_notification_logs_by_reminder_instance(
    reminder_instance_id: int,
    db: Session = Depends(get_db)
):
    """Obtener todos los logs de notificaciones de una instancia de recordatorio"""
    logs = NotificationLogService.get_by_reminder_instance_id(db, reminder_instance_id)
    return logs


@router.get("/status/{status}", response_model=List[NotificationLogResponse])
async def get_notification_logs_by_status(
    status: str,
    db: Session = Depends(get_db)
):
    """Obtener todos los logs de notificaciones por estado"""
    logs = NotificationLogService.get_by_status(db, status)
    return logs


@router.post("/", response_model=NotificationLogResponse, status_code=status.HTTP_201_CREATED)
async def create_notification_log(
    log_data: NotificationLogCreate,
    db: Session = Depends(get_db)
):
    """Crear un nuevo log de notificación"""
    try:
        log = NotificationLogService.create(db, log_data)
        return log
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


@router.put("/{log_id}", response_model=NotificationLogResponse)
async def update_notification_log(
    log_id: int,
    log_data: NotificationLogUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar un log de notificación existente"""
    try:
        log = NotificationLogService.update(db, log_id, log_data)
        if not log:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Log de notificación con ID {log_id} no encontrado"
            )
        return log
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


@router.patch("/{log_id}", response_model=NotificationLogResponse)
async def partial_update_notification_log(
    log_id: int,
    log_data: NotificationLogUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar parcialmente un log de notificación existente"""
    try:
        log = NotificationLogService.update(db, log_id, log_data)
        if not log:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Log de notificación con ID {log_id} no encontrado"
            )
        return log
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


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification_log(
    log_id: int,
    db: Session = Depends(get_db)
):
    """Eliminar un log de notificación"""
    success = NotificationLogService.delete(db, log_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Log de notificación con ID {log_id} no encontrado"
        )
    return None

