from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional


class ReminderCreate(BaseModel):
    id: int  # Debe ser el mismo ID que appointment, elderly_profile o medicine
    reminder_type: str
    preiodicity: Optional[str] = None  # Nota: manteniendo el typo de la BD
    start_date: date
    end_date: Optional[date] = None
    is_active: Optional[bool] = True


class ReminderUpdate(BaseModel):
    reminder_type: Optional[str] = None
    preiodicity: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None


class ReminderResponse(BaseModel):
    id: int
    reminder_type: str
    preiodicity: Optional[str]
    start_date: date
    end_date: Optional[date]
    is_active: Optional[bool]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

