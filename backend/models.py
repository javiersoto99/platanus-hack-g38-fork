from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey, Numeric, Boolean
from sqlalchemy.sql import func
from database import Base
from enums import ReminderInstanceStatus


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), nullable=False, unique=True)
    password = Column(String, nullable=False)
    phone = Column(String(20), nullable=True)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.current_timestamp(), nullable=True)
    updated_at = Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=True)


class ElderlyProfile(Base):
    __tablename__ = "elderly_profiles"

    id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    date_of_birth = Column(Date, nullable=True)
    address = Column(Text, nullable=True)
    emergency_contact = Column(String, nullable=True)
    medical_notes = Column(Text, nullable=True)
    blood_type = Column(String(5), nullable=True)
    insurance_info = Column(Text, nullable=True)
    isapre_info = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.current_timestamp(), nullable=True)
    updated_at = Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=True)


class HealthWorker(Base):
    __tablename__ = "health_workers"

    id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    profession = Column(String(100), nullable=True)
    license_number = Column(String(100), nullable=True)
    verification_status = Column(String, default="pending", nullable=True)
    rating = Column(Numeric(3, 2), default=5.00, nullable=True)
    total_appointments = Column(Integer, default=0, nullable=True)
    created_at = Column(DateTime, server_default=func.current_timestamp(), nullable=True)
    updated_at = Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=True)


class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, ForeignKey("elderly_profiles.id", ondelete="CASCADE"), primary_key=True)
    name = Column(String(255), nullable=False)
    dosage = Column(String, nullable=True)
    total_tablets = Column(Integer, nullable=True)
    tablets_left = Column(Integer, nullable=True)
    tablets_per_dose = Column(Integer, default=1, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.current_timestamp(), nullable=True)
    updated_at = Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=True)


class ReminderInstance(Base):
    __tablename__ = "reminder_instances"

    id = Column(Integer, primary_key=True, autoincrement=True)
    reminder_id = Column(Integer, ForeignKey("reminders.id", ondelete="CASCADE"), nullable=False)
    scheduled_datetime = Column(DateTime, nullable=False)
    status = Column(String, default=ReminderInstanceStatus.PENDING.value, nullable=True)
    taken_at = Column(DateTime, nullable=True)
    retry_count = Column(Integer, default=0, nullable=True)
    max_retries = Column(Integer, default=3, nullable=True)
    family_notified = Column(Boolean, default=False, nullable=True)
    family_notified_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.current_timestamp(), nullable=True)
    updated_at = Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=True)


class NotificationLog(Base):
    __tablename__ = "notification_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    reminder_instance_id = Column(Integer, ForeignKey("reminder_instances.id", ondelete="CASCADE"), nullable=False)
    notification_type = Column(String(50), nullable=False)
    recepient_phone = Column(String, nullable=False)  # Nota: typo en la BD original
    status = Column(String(50), nullable=False)
    sent_at = Column(DateTime, server_default=func.current_timestamp(), nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    response = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, autoincrement=True)  # ID único del reminder
    reminder_type = Column(String(50), nullable=False)
    periodicity = Column(Integer, nullable=True)  # Minutos entre cada envío de recordatorio
    start_date = Column(DateTime, nullable=False)  # Fecha y hora exacta del primer recordatorio
    end_date = Column(Date, nullable=True)
    medicine = Column(Integer, ForeignKey("medicines.id", ondelete="CASCADE"), nullable=True)  # Solo si reminder_type == "medicine"
    appointment_id = Column(Integer, ForeignKey("appointments.id", ondelete="CASCADE"), nullable=True)  # Solo si reminder_type == "appointment"
    elderly_profile_id = Column(Integer, ForeignKey("elderly_profiles.id", ondelete="CASCADE"), nullable=True)  # Para otros tipos de reminders
    is_active = Column(Boolean, default=True, nullable=True)
    created_at = Column(DateTime, server_default=func.current_timestamp(), nullable=True)
    updated_at = Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=True)


class FamilyElderlyRelationship(Base):
    __tablename__ = "family_elderly_relationship"

    id = Column(Integer, primary_key=True)  # Puede referenciar a elderly_profiles.id o users.id
    relationship_type = Column(Text, nullable=True)
    is_primary_contact = Column(Boolean, default=False, nullable=True)
    notification_enabled = Column(Boolean, default=True, nullable=True)
    created_at = Column(DateTime, server_default=func.current_timestamp(), nullable=True)


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    scheduled_datetime = Column(DateTime, nullable=False)
    doctor_name = Column(String(255), nullable=True)
    specialty = Column(String(100), nullable=True)
    address = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="scheduled", nullable=False)
    doctors_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.current_timestamp(), nullable=False)
    updated_at = Column(DateTime, server_default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=False)
    
    # Foreign keys
    elderly_id = Column(Integer, ForeignKey("elderly_profiles.id", ondelete="CASCADE"), nullable=False)
    health_worker_id = Column(Integer, ForeignKey("health_workers.id", ondelete="CASCADE"), nullable=False)
