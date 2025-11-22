from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from services.reminder_instances import ReminderInstanceService
from dtos.reminder_instances import ReminderInstanceCreate, ReminderInstanceUpdate, ReminderInstanceResponse

router = APIRouter(prefix="/reminder-instances", tags=["reminder-instances"])


@router.get("/", response_model=List[ReminderInstanceResponse])
async def get_reminder_instances(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Obtener todas las instancias de recordatorios con paginación"""
    instances = ReminderInstanceService.get_all(db, skip=skip, limit=limit)
    return instances


@router.get("/{instance_id}", response_model=ReminderInstanceResponse)
async def get_reminder_instance(
    instance_id: int,
    db: Session = Depends(get_db)
):
    """Obtener una instancia de recordatorio por su ID"""
    instance = ReminderInstanceService.get_by_id(db, instance_id)
    if not instance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Instancia de recordatorio con ID {instance_id} no encontrada"
        )
    return instance


@router.get("/reminder/{reminder_id}", response_model=List[ReminderInstanceResponse])
async def get_reminder_instances_by_reminder(
    reminder_id: int,
    db: Session = Depends(get_db)
):
    """Obtener todas las instancias de un recordatorio"""
    instances = ReminderInstanceService.get_by_reminder_id(db, reminder_id)
    return instances


@router.get("/status/{status}", response_model=List[ReminderInstanceResponse])
async def get_reminder_instances_by_status(
    status: str,
    db: Session = Depends(get_db)
):
    """Obtener todas las instancias por estado"""
    instances = ReminderInstanceService.get_by_status(db, status)
    return instances


@router.get("/pending/all", response_model=List[ReminderInstanceResponse])
async def get_pending_reminder_instances(
    db: Session = Depends(get_db)
):
    """Obtener todas las instancias pendientes"""
    instances = ReminderInstanceService.get_pending(db)
    return instances


@router.post("/", response_model=ReminderInstanceResponse, status_code=status.HTTP_201_CREATED)
async def create_reminder_instance(
    instance_data: ReminderInstanceCreate,
    db: Session = Depends(get_db)
):
    """Crear una nueva instancia de recordatorio"""
    try:
        instance = ReminderInstanceService.create(db, instance_data)
        return instance
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


@router.put("/{instance_id}", response_model=ReminderInstanceResponse)
async def update_reminder_instance(
    instance_id: int,
    instance_data: ReminderInstanceUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar una instancia de recordatorio existente"""
    try:
        instance = ReminderInstanceService.update(db, instance_id, instance_data)
        if not instance:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Instancia de recordatorio con ID {instance_id} no encontrada"
            )
        return instance
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


@router.patch("/{instance_id}", response_model=ReminderInstanceResponse)
async def partial_update_reminder_instance(
    instance_id: int,
    instance_data: ReminderInstanceUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar parcialmente una instancia de recordatorio existente"""
    try:
        instance = ReminderInstanceService.update(db, instance_id, instance_data)
        if not instance:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Instancia de recordatorio con ID {instance_id} no encontrada"
            )
        return instance
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


@router.delete("/{instance_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reminder_instance(
    instance_id: int,
    db: Session = Depends(get_db)
):
    """Eliminar una instancia de recordatorio"""
    success = ReminderInstanceService.delete(db, instance_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Instancia de recordatorio con ID {instance_id} no encontrada"
        )
    return None

