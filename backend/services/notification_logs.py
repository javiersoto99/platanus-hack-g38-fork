from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import text
from typing import List, Optional
from models import NotificationLog, ReminderInstance  # Importar ReminderInstance para que esté en metadata
from dtos.notification_logs import NotificationLogCreate, NotificationLogUpdate


class NotificationLogService:
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[NotificationLog]:
        """Obtener todos los logs de notificaciones con paginación"""
        return db.query(NotificationLog).offset(skip).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, log_id: int) -> Optional[NotificationLog]:
        """Obtener un log de notificación por su ID"""
        return db.query(NotificationLog).filter(NotificationLog.id == log_id).first()

    @staticmethod
    def get_by_reminder_instance_id(db: Session, reminder_instance_id: int) -> List[NotificationLog]:
        """Obtener todos los logs de notificaciones de una instancia de recordatorio"""
        return db.query(NotificationLog).filter(NotificationLog.reminder_instance_id == reminder_instance_id).all()

    @staticmethod
    def get_by_status(db: Session, status: str) -> List[NotificationLog]:
        """Obtener todos los logs de notificaciones por estado"""
        return db.query(NotificationLog).filter(NotificationLog.status == status).all()

    @staticmethod
    def create(db: Session, log_data: NotificationLogCreate) -> NotificationLog:
        """Crear un nuevo log de notificación"""
        data = log_data.model_dump()
        
        # Crear el objeto directamente con SQLAlchemy
        log = NotificationLog(**data)
        
        try:
            db.add(log)
            db.commit()
            db.refresh(log)
            return log
        except IntegrityError as e:
            db.rollback()
            error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
            if 'foreign key' in error_msg.lower() or 'violates foreign key constraint' in error_msg.lower():
                raise ValueError(f"Error: El reminder_instance_id {log_data.reminder_instance_id} no existe en la tabla reminder_instances")
            raise ValueError(f"Error al crear el log de notificación: {error_msg}")
        except Exception as e:
            db.rollback()
            raise ValueError(f"Error inesperado al crear el log de notificación: {str(e)}")

    @staticmethod
    def update(
        db: Session, log_id: int, log_data: NotificationLogUpdate
    ) -> Optional[NotificationLog]:
        """Actualizar un log de notificación existente"""
        log = db.query(NotificationLog).filter(NotificationLog.id == log_id).first()
        if not log:
            return None

        update_data = log_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(log, field, value)

        try:
            db.commit()
            db.refresh(log)
            return log
        except IntegrityError as e:
            db.rollback()
            error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
            raise ValueError(f"Error al actualizar el log de notificación: {error_msg}")
        except Exception as e:
            db.rollback()
            raise ValueError(f"Error inesperado al actualizar el log de notificación: {str(e)}")

    @staticmethod
    def delete(db: Session, log_id: int) -> bool:
        """Eliminar un log de notificación"""
        log = db.query(NotificationLog).filter(NotificationLog.id == log_id).first()
        if not log:
            return False

        db.delete(log)
        db.commit()
        return True

