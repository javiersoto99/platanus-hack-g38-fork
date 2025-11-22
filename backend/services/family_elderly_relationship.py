from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import text
from typing import List, Optional
from models import FamilyElderlyRelationship, ElderlyProfile, User  # Importar para que estén en metadata
from dtos.family_elderly_relationship import FamilyElderlyRelationshipCreate, FamilyElderlyRelationshipUpdate


class FamilyElderlyRelationshipService:
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[FamilyElderlyRelationship]:
        """Obtener todas las relaciones familia-adulto mayor con paginación"""
        return db.query(FamilyElderlyRelationship).offset(skip).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, relationship_id: int) -> Optional[FamilyElderlyRelationship]:
        """Obtener una relación por su ID"""
        return db.query(FamilyElderlyRelationship).filter(FamilyElderlyRelationship.id == relationship_id).first()

    @staticmethod
    def get_by_elderly_id(db: Session, elderly_id: int) -> List[FamilyElderlyRelationship]:
        """Obtener todas las relaciones de un adulto mayor"""
        return db.query(FamilyElderlyRelationship).filter(FamilyElderlyRelationship.id == elderly_id).all()

    @staticmethod
    def get_by_family_member_id(db: Session, family_member_id: int) -> List[FamilyElderlyRelationship]:
        """Obtener todas las relaciones de un miembro de la familia"""
        return db.query(FamilyElderlyRelationship).filter(FamilyElderlyRelationship.id == family_member_id).all()

    @staticmethod
    def get_primary_contacts(db: Session) -> List[FamilyElderlyRelationship]:
        """Obtener todos los contactos principales"""
        return db.query(FamilyElderlyRelationship).filter(FamilyElderlyRelationship.is_primary_contact == True).all()

    @staticmethod
    def create(db: Session, relationship_data: FamilyElderlyRelationshipCreate) -> FamilyElderlyRelationship:
        """Crear una nueva relación familia-adulto mayor"""
        data = relationship_data.model_dump()
        relationship_id = data.pop('id')
        
        # Construir la query con OVERRIDING SYSTEM VALUE
        columns = ', '.join([f'"{k}"' for k in data.keys() if data[k] is not None])
        values = ', '.join([f':{k}' for k in data.keys() if data[k] is not None])
        params = {k: v for k, v in data.items() if v is not None}
        params['id'] = relationship_id
        
        query = f"""
            INSERT INTO family_elderly_relationship (id, {columns}) 
            OVERRIDING SYSTEM VALUE 
            VALUES (:id, {values})
            RETURNING *
        """
        
        try:
            result = db.execute(text(query), params)
            db.commit()
            # Obtener la relación creada
            relationship = db.query(FamilyElderlyRelationship).filter(FamilyElderlyRelationship.id == relationship_id).first()
            return relationship
        except IntegrityError as e:
            db.rollback()
            error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
            if 'foreign key' in error_msg.lower() or 'violates foreign key constraint' in error_msg.lower():
                raise ValueError(
                    f"Error: El ID {relationship_data.id} no existe en ninguna de las tablas referenciadas "
                    "(elderly_profiles o users)"
                )
            raise ValueError(f"Error al crear la relación: {error_msg}")
        except Exception as e:
            db.rollback()
            raise ValueError(f"Error inesperado al crear la relación: {str(e)}")

    @staticmethod
    def update(
        db: Session, relationship_id: int, relationship_data: FamilyElderlyRelationshipUpdate
    ) -> Optional[FamilyElderlyRelationship]:
        """Actualizar una relación existente"""
        relationship = db.query(FamilyElderlyRelationship).filter(FamilyElderlyRelationship.id == relationship_id).first()
        if not relationship:
            return None

        update_data = relationship_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(relationship, field, value)

        try:
            db.commit()
            db.refresh(relationship)
            return relationship
        except IntegrityError as e:
            db.rollback()
            error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
            raise ValueError(f"Error al actualizar la relación: {error_msg}")
        except Exception as e:
            db.rollback()
            raise ValueError(f"Error inesperado al actualizar la relación: {str(e)}")

    @staticmethod
    def delete(db: Session, relationship_id: int) -> bool:
        """Eliminar una relación"""
        relationship = db.query(FamilyElderlyRelationship).filter(FamilyElderlyRelationship.id == relationship_id).first()
        if not relationship:
            return False

        db.delete(relationship)
        db.commit()
        return True

