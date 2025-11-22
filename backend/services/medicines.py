from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import text
from typing import List, Optional
from models import Medicine, ElderlyProfile  # Importar ElderlyProfile para que esté en metadata
from dtos.medicines import MedicineCreate, MedicineUpdate


class MedicineService:
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Medicine]:
        """Obtener todos los medicamentos con paginación"""
        return db.query(Medicine).offset(skip).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, medicine_id: int) -> Optional[Medicine]:
        """Obtener un medicamento por su ID"""
        return db.query(Medicine).filter(Medicine.id == medicine_id).first()

    @staticmethod
    def get_by_elderly_id(db: Session, elderly_id: int) -> List[Medicine]:
        """Obtener todos los medicamentos de un adulto mayor"""
        return db.query(Medicine).filter(Medicine.id == elderly_id).all()

    @staticmethod
    def create(db: Session, medicine_data: MedicineCreate) -> Medicine:
        """Crear un nuevo medicamento"""
        data = medicine_data.model_dump()
        medicine_id = data.pop('id')
        
        # Construir la query con OVERRIDING SYSTEM VALUE
        columns = ', '.join([f'"{k}"' for k in data.keys() if data[k] is not None])
        values = ', '.join([f':{k}' for k in data.keys() if data[k] is not None])
        params = {k: v for k, v in data.items() if v is not None}
        params['id'] = medicine_id
        
        query = f"""
            INSERT INTO medicines (id, {columns}) 
            OVERRIDING SYSTEM VALUE 
            VALUES (:id, {values})
            RETURNING *
        """
        
        try:
            result = db.execute(text(query), params)
            db.commit()
            # Obtener el medicamento creado
            medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
            return medicine
        except IntegrityError as e:
            db.rollback()
            error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
            if 'foreign key' in error_msg.lower() or 'violates foreign key constraint' in error_msg.lower():
                raise ValueError(f"Error: El ID {medicine_data.id} no existe en la tabla elderly_profiles")
            raise ValueError(f"Error al crear el medicamento: {error_msg}")
        except Exception as e:
            db.rollback()
            raise ValueError(f"Error inesperado al crear el medicamento: {str(e)}")

    @staticmethod
    def update(
        db: Session, medicine_id: int, medicine_data: MedicineUpdate
    ) -> Optional[Medicine]:
        """Actualizar un medicamento existente"""
        medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
        if not medicine:
            return None

        update_data = medicine_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(medicine, field, value)

        try:
            db.commit()
            db.refresh(medicine)
            return medicine
        except IntegrityError as e:
            db.rollback()
            error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
            raise ValueError(f"Error al actualizar el medicamento: {error_msg}")
        except Exception as e:
            db.rollback()
            raise ValueError(f"Error inesperado al actualizar el medicamento: {str(e)}")

    @staticmethod
    def delete(db: Session, medicine_id: int) -> bool:
        """Eliminar un medicamento"""
        medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
        if not medicine:
            return False

        db.delete(medicine)
        db.commit()
        return True

