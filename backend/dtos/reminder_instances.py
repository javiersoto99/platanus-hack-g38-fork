from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enums import ReminderInstanceStatus


class ReminderInstanceCreate(BaseModel):
    # id: Optional[int] = None  # ID único de la instancia (auto-increment, opcional)
    reminder_id: int  # Foreign Key a reminders.id
    scheduled_datetime: datetime
    status: Optional[str] = ReminderInstanceStatus.PENDING.value
    taken_at: Optional[datetime] = None
    retry_count: Optional[int] = 0
    max_retries: Optional[int] = 3
    family_notified: Optional[bool] = False
    family_notified_at: Optional[datetime] = None
    notes: Optional[str] = None


class ReminderInstanceUpdate(BaseModel):
    reminder_id: Optional[int] = None
    scheduled_datetime: Optional[datetime] = None
    status: Optional[str] = None  # Puede ser: pending, waiting, failure, success
    taken_at: Optional[datetime] = None
    retry_count: Optional[int] = None
    max_retries: Optional[int] = None
    family_notified: Optional[bool] = None
    family_notified_at: Optional[datetime] = None
    notes: Optional[str] = None


class ReminderInstanceResponse(BaseModel):
    id: int
    reminder_id: int
    scheduled_datetime: datetime
    status: Optional[str]
    taken_at: Optional[datetime]
    retry_count: Optional[int]
    max_retries: Optional[int]
    family_notified: Optional[bool]
    family_notified_at: Optional[datetime]
    notes: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

