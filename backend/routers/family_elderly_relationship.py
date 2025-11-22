from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from services.family_elderly_relationship import FamilyElderlyRelationshipService
from dtos.family_elderly_relationship import FamilyElderlyRelationshipCreate, FamilyElderlyRelationshipUpdate, FamilyElderlyRelationshipResponse

router = APIRouter(prefix="/family-elderly-relationships", tags=["family-elderly-relationships"])


@router.get("/", response_model=List[FamilyElderlyRelationshipResponse])
async def get_family_elderly_relationships(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Obtener todas las relaciones familia-adulto mayor con paginación"""
    relationships = FamilyElderlyRelationshipService.get_all(db, skip=skip, limit=limit)
    return relationships


@router.get("/{relationship_id}", response_model=FamilyElderlyRelationshipResponse)
async def get_family_elderly_relationship(
    relationship_id: int,
    db: Session = Depends(get_db)
):
    """Obtener una relación por su ID"""
    relationship = FamilyElderlyRelationshipService.get_by_id(db, relationship_id)
    if not relationship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Relación con ID {relationship_id} no encontrada"
        )
    return relationship


@router.get("/elderly/{elderly_id}", response_model=List[FamilyElderlyRelationshipResponse])
async def get_relationships_by_elderly(
    elderly_id: int,
    db: Session = Depends(get_db)
):
    """Obtener todas las relaciones de un adulto mayor"""
    relationships = FamilyElderlyRelationshipService.get_by_elderly_id(db, elderly_id)
    return relationships


@router.get("/family-member/{family_member_id}", response_model=List[FamilyElderlyRelationshipResponse])
async def get_relationships_by_family_member(
    family_member_id: int,
    db: Session = Depends(get_db)
):
    """Obtener todas las relaciones de un miembro de la familia"""
    relationships = FamilyElderlyRelationshipService.get_by_family_member_id(db, family_member_id)
    return relationships


@router.get("/primary-contacts/all", response_model=List[FamilyElderlyRelationshipResponse])
async def get_primary_contacts(
    db: Session = Depends(get_db)
):
    """Obtener todos los contactos principales"""
    relationships = FamilyElderlyRelationshipService.get_primary_contacts(db)
    return relationships


@router.post("/", response_model=FamilyElderlyRelationshipResponse, status_code=status.HTTP_201_CREATED)
async def create_family_elderly_relationship(
    relationship_data: FamilyElderlyRelationshipCreate,
    db: Session = Depends(get_db)
):
    """Crear una nueva relación familia-adulto mayor"""
    try:
        relationship = FamilyElderlyRelationshipService.create(db, relationship_data)
        return relationship
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


@router.put("/{relationship_id}", response_model=FamilyElderlyRelationshipResponse)
async def update_family_elderly_relationship(
    relationship_id: int,
    relationship_data: FamilyElderlyRelationshipUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar una relación existente"""
    try:
        relationship = FamilyElderlyRelationshipService.update(db, relationship_id, relationship_data)
        if not relationship:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Relación con ID {relationship_id} no encontrada"
            )
        return relationship
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


@router.patch("/{relationship_id}", response_model=FamilyElderlyRelationshipResponse)
async def partial_update_family_elderly_relationship(
    relationship_id: int,
    relationship_data: FamilyElderlyRelationshipUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar parcialmente una relación existente"""
    try:
        relationship = FamilyElderlyRelationshipService.update(db, relationship_id, relationship_data)
        if not relationship:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Relación con ID {relationship_id} no encontrada"
            )
        return relationship
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


@router.delete("/{relationship_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_family_elderly_relationship(
    relationship_id: int,
    db: Session = Depends(get_db)
):
    """Eliminar una relación"""
    success = FamilyElderlyRelationshipService.delete(db, relationship_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Relación con ID {relationship_id} no encontrada"
        )
    return None

