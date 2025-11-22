from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    phone: Optional[str] = None
    full_name: str
    role: str  # Por ejemplo: "elderly", "health_worker", "admin", etc.


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    phone: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: str
    phone: Optional[str]
    full_name: str
    role: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

