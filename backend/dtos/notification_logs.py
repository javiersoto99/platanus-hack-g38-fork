from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class NotificationLogCreate(BaseModel):
    reminder_instance_id: int
    notification_type: str
    recepient_phone: str  # Nota: manteniendo el typo de la BD
    status: str
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    response: Optional[str] = None
    error_message: Optional[str] = None


class NotificationLogUpdate(BaseModel):
    notification_type: Optional[str] = None
    recepient_phone: Optional[str] = None
    status: Optional[str] = None
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    response: Optional[str] = None
    error_message: Optional[str] = None


class NotificationLogResponse(BaseModel):
    id: int
    reminder_instance_id: int
    notification_type: str
    recepient_phone: str
    status: str
    sent_at: Optional[datetime]
    delivered_at: Optional[datetime]
    response: Optional[str]
    error_message: Optional[str]

    class Config:
        from_attributes = True

