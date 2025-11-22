from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class FamilyElderlyRelationshipCreate(BaseModel):
    id: int  # Debe ser el mismo ID que elderly_profile o user (family_member)
    relationship_type: Optional[str] = None
    is_primary_contact: Optional[bool] = False
    notification_enabled: Optional[bool] = True


class FamilyElderlyRelationshipUpdate(BaseModel):
    relationship_type: Optional[str] = None
    is_primary_contact: Optional[bool] = None
    notification_enabled: Optional[bool] = None


class FamilyElderlyRelationshipResponse(BaseModel):
    id: int
    relationship_type: Optional[str]
    is_primary_contact: Optional[bool]
    notification_enabled: Optional[bool]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

