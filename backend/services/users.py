from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext
from typing import List, Optional
from models import User
from dtos.users import UserCreate, UserUpdate

# Configurar el contexto de hashing de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hashear una contraseña"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar una contraseña"""
    return pwd_context.verify(plain_password, hashed_password)


class UserService:
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        """Obtener todos los usuarios con paginación"""
        return db.query(User).offset(skip).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        """Obtener un usuario por su ID"""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        """Obtener un usuario por su email"""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def create(db: Session, user_data: UserCreate) -> User:
        """Crear un nuevo usuario"""
        # Hashear la contraseña antes de guardarla
        hashed_password = hash_password(user_data.password)
        
        user_dict = user_data.model_dump()
        user_dict['password'] = hashed_password
        
        user = User(**user_dict)
        db.add(user)
        try:
            db.commit()
            db.refresh(user)
            return user
        except IntegrityError as e:
            db.rollback()
            error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
            if 'unique constraint' in error_msg.lower() or 'duplicate key' in error_msg.lower():
                raise ValueError(f"Error: El email {user_data.email} ya está registrado")
            raise ValueError(f"Error al crear el usuario: {error_msg}")
        except Exception as e:
            db.rollback()
            raise ValueError(f"Error inesperado al crear el usuario: {str(e)}")

    @staticmethod
    def update(
        db: Session, user_id: int, user_data: UserUpdate
    ) -> Optional[User]:
        """Actualizar un usuario existente"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None

        update_data = user_data.model_dump(exclude_unset=True)
        
        # Si se está actualizando la contraseña, hashearla
        if 'password' in update_data and update_data['password']:
            update_data['password'] = hash_password(update_data['password'])
        
        for field, value in update_data.items():
            setattr(user, field, value)

        try:
            db.commit()
            db.refresh(user)
            return user
        except IntegrityError as e:
            db.rollback()
            error_msg = str(e.orig) if hasattr(e, 'orig') else str(e)
            if 'unique constraint' in error_msg.lower() or 'duplicate key' in error_msg.lower():
                raise ValueError(f"Error: El email ya está registrado por otro usuario")
            raise ValueError(f"Error al actualizar el usuario: {error_msg}")
        except Exception as e:
            db.rollback()
            raise ValueError(f"Error inesperado al actualizar el usuario: {str(e)}")

    @staticmethod
    def delete(db: Session, user_id: int) -> bool:
        """Eliminar un usuario"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False

        db.delete(user)
        db.commit()
        return True

    @staticmethod
    def authenticate(db: Session, email: str, password: str) -> Optional[User]:
        """Autenticar un usuario con email y contraseña"""
        user = UserService.get_by_email(db, email)
        if not user:
            return None
        
        if not verify_password(password, user.password):
            return None
        
        return user

