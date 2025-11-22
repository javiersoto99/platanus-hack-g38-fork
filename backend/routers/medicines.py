from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from services.medicines import MedicineService
from dtos.medicines import MedicineCreate, MedicineUpdate, MedicineResponse

router = APIRouter(prefix="/medicines", tags=["medicines"])


@router.get("/", response_model=List[MedicineResponse])
async def get_medicines(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Obtener todos los medicamentos con paginación"""
    medicines = MedicineService.get_all(db, skip=skip, limit=limit)
    return medicines


@router.get("/{medicine_id}", response_model=MedicineResponse)
async def get_medicine(
    medicine_id: int,
    db: Session = Depends(get_db)
):
    """Obtener un medicamento por su ID"""
    medicine = MedicineService.get_by_id(db, medicine_id)
    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Medicamento con ID {medicine_id} no encontrado"
        )
    return medicine


@router.get("/elderly/{elderly_id}", response_model=List[MedicineResponse])
async def get_medicines_by_elderly(
    elderly_id: int,
    db: Session = Depends(get_db)
):
    """Obtener todos los medicamentos de un adulto mayor"""
    medicines = MedicineService.get_by_elderly_id(db, elderly_id)
    return medicines


@router.post("/", response_model=MedicineResponse, status_code=status.HTTP_201_CREATED)
async def create_medicine(
    medicine_data: MedicineCreate,
    db: Session = Depends(get_db)
):
    """Crear un nuevo medicamento"""
    try:
        medicine = MedicineService.create(db, medicine_data)
        return medicine
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


@router.put("/{medicine_id}", response_model=MedicineResponse)
async def update_medicine(
    medicine_id: int,
    medicine_data: MedicineUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar un medicamento existente"""
    try:
        medicine = MedicineService.update(db, medicine_id, medicine_data)
        if not medicine:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Medicamento con ID {medicine_id} no encontrado"
            )
        return medicine
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


@router.patch("/{medicine_id}", response_model=MedicineResponse)
async def partial_update_medicine(
    medicine_id: int,
    medicine_data: MedicineUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar parcialmente un medicamento existente"""
    try:
        medicine = MedicineService.update(db, medicine_id, medicine_data)
        if not medicine:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Medicamento con ID {medicine_id} no encontrado"
            )
        return medicine
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


@router.delete("/{medicine_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medicine(
    medicine_id: int,
    db: Session = Depends(get_db)
):
    """Eliminar un medicamento"""
    success = MedicineService.delete(db, medicine_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Medicamento con ID {medicine_id} no encontrado"
        )
    return None

