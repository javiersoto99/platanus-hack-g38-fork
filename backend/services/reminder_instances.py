from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from models import ReminderInstance
from dtos.reminder_instances import ReminderInstanceCreate, ReminderInstanceUpdate


class ReminderInstanceService:
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[ReminderInstance]:
        """Obtener todas las instancias de recordatorios con paginación"""
        return db.query(ReminderInstance).offset(skip).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, instance_id: int) -> Optional[ReminderInstance]:
        """Obtener una instancia de recordatorio por su ID"""
        return db.query(ReminderInstance).filter(ReminderInstance.id == instance_id).first()

    @staticmethod
    def get_by_reminder_id(db: Session, reminder_id: int) -> List[ReminderInstance]:
        """Obtener todas las instancias de un recordatorio"""
        return db.query(ReminderInstance).filter(ReminderInstance.reminder_id == reminder_id).all()

    @staticmethod
    def get_by_status(db: Session, status: str) -> List[ReminderInstance]:
        """Obtener todas las instancias por estado"""
        return db.query(ReminderInstance).filter(ReminderInstance.status == status).all()

    @staticmethod
    def get_pending(db: Session) -> List[ReminderInstance]:
        """Obtener todas las instancias pendientes"""
        return db.query(ReminderInstance).filter(ReminderInstance.status == "pending").all()

    @staticmethod
    def create(db: Session, instance_data: ReminderInstanceCreate) -> ReminderInstance:
        """Crear una nueva instancia de recordatorio"""
        # Excluir el ID del dump para que la BD lo genere automáticamente
        data = instance_data.model_dump(exclude={'id'})
        instance = ReminderInstance(**data)
        
        try:
            db.add(instance)
            db.flush()
            db.refresh(instance)
            return instance
        except IntegrityError as e:
            db.rollback()
            error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
            if 'foreign key' in error_msg.lower() or 'violates foreign key constraint' in error_msg.lower():
                raise ValueError(f"Error: El reminder_id {instance_data.reminder_id} no existe en la tabla reminders")
            raise ValueError(f"Error al crear la instancia de recordatorio: {error_msg}")
        except Exception as e:
            db.rollback()
            raise ValueError(f"Error inesperado al crear la instancia de recordatorio: {str(e)}")

    @staticmethod
    def update(
        db: Session, instance_id: int, instance_data: ReminderInstanceUpdate
    ) -> Optional[ReminderInstance]:
        """Actualizar una instancia de recordatorio existente"""
        instance = db.query(ReminderInstance).filter(ReminderInstance.id == instance_id).first()
        if not instance:
            return None

        update_data = instance_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(instance, field, value)

        try:
            db.commit()
            db.refresh(instance)
            return instance
        except IntegrityError as e:
            db.rollback()
            error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
            raise ValueError(f"Error al actualizar la instancia de recordatorio: {error_msg}")
        except Exception as e:
            db.rollback()
            raise ValueError(f"Error inesperado al actualizar la instancia de recordatorio: {str(e)}")

    @staticmethod
    def delete(db: Session, instance_id: int) -> bool:
        """Eliminar una instancia de recordatorio"""
        instance = db.query(ReminderInstance).filter(ReminderInstance.id == instance_id).first()
        if not instance:
            return False

        db.delete(instance)
        db.commit()
        return True

