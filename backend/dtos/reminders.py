from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional


class ReminderCreate(BaseModel):
    reminder_type: str
    periodicity: Optional[int] = None  # Minutos entre cada envío de recordatorio
    start_date: datetime  # Fecha y hora exacta del primer recordatorio
    end_date: Optional[date] = None
    medicine: Optional[int] = None  # Solo si reminder_type == "medicine"
    appointment_id: Optional[int] = None  # Solo si reminder_type == "appointment"
    elderly_profile_id: Optional[int] = None  # Para otros tipos de reminders
    is_active: Optional[bool] = True


class ReminderUpdate(BaseModel):
    reminder_type: Optional[str] = None
    periodicity: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[date] = None
    medicine: Optional[int] = None
    appointment_id: Optional[int] = None
    elderly_profile_id: Optional[int] = None
    is_active: Optional[bool] = None


class ReminderResponse(BaseModel):
    id: int
    reminder_type: str
    periodicity: Optional[int]
    start_date: datetime
    end_date: Optional[date]
    medicine: Optional[int]
    appointment_id: Optional[int]
    elderly_profile_id: Optional[int]
    is_active: Optional[bool]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

