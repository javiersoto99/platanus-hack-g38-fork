from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class MedicineCreate(BaseModel):
    id: int  # Debe ser el mismo ID que el elderly_profile
    name: str
    dosage: Optional[str] = None
    total_tablets: Optional[int] = None
    tablets_left: Optional[int] = None
    tablets_per_dose: Optional[int] = 1
    notes: Optional[str] = None


class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    dosage: Optional[str] = None
    total_tablets: Optional[int] = None
    tablets_left: Optional[int] = None
    tablets_per_dose: Optional[int] = None
    notes: Optional[str] = None


class MedicineResponse(BaseModel):
    id: int
    name: str
    dosage: Optional[str]
    total_tablets: Optional[int]
    tablets_left: Optional[int]
    tablets_per_dose: Optional[int]
    notes: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

