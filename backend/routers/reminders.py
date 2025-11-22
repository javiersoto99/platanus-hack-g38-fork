from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from services.reminders import ReminderService
from dtos.reminders import ReminderCreate, ReminderUpdate, ReminderResponse

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

