from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from models import ReminderInstance, Reminder, Medicine, ElderlyProfile, User, Appointment
from services.reminder_instances import ReminderInstanceService
from services.notification_logs import NotificationLogService
from dtos.reminder_instances import ReminderInstanceUpdate
from dtos.notification_logs import NotificationLogCreate, NotificationLogUpdate
from enums import ReminderInstanceStatus
from integrations.twilio import create_call
from integrations.gemini import generate_content
import logging
import os

logger = logging.getLogger(__name__)


class ReminderCallService:
    @staticmethod
    def get_pending_instances_for_call(db: Session, check_interval_minutes: int = 15) -> List[ReminderInstance]:
        """
        Obtiene reminder_instances pendientes que deben recibir una llamada.
        
        Args:
            db: Sesión de base de datos
            check_interval_minutes: Intervalo en minutos para considerar que un recordatorio debe enviarse
                                    (por defecto 5 minutos, para dar margen de tiempo)
        
        Returns:
            Lista de ReminderInstance que necesitan llamadas
        """
        now = datetime.now()

        pending_instances = db.query(ReminderInstance).filter(
            and_(
                ReminderInstance.status == ReminderInstanceStatus.PENDING.value,
                ReminderInstance.scheduled_datetime <= now,
            )
        ).all()
        print(f"Pending instances for call: {len(pending_instances)}")
        
        return pending_instances
    
    @staticmethod
    def get_phone_number_for_reminder(db: Session, reminder: Reminder) -> Optional[str]:
        """
        Obtiene el número de teléfono para enviar la llamada.
        Intenta obtenerlo de elderly_profile_id directamente o a través de relaciones.
        
        Args:
            db: Sesión de base de datos
            reminder: Reminder del cual obtener el número de teléfono
        
        Returns:
            Número de teléfono o None si no se encuentra
        """
        elderly_profile_id = None
        
        # Intentar obtener elderly_profile_id directamente
        if reminder.elderly_profile_id:
            elderly_profile_id = reminder.elderly_profile_id
        # Si no está disponible, intentar obtenerlo a través de appointment_id
        elif reminder.appointment_id:
            appointment = db.query(Appointment).filter(Appointment.id == reminder.appointment_id).first()
            if appointment:
                elderly_profile_id = appointment.elderly_id
        # Si no está disponible, intentar obtenerlo a través de medicine
        elif reminder.medicine:
            medicine = db.query(Medicine).filter(Medicine.id == reminder.medicine).first()
            if medicine:
                # medicine.id es FK a elderly_profiles.id
                elderly_profile_id = medicine.id
        
        if not elderly_profile_id:
            logger.error(f"Reminder {reminder.id} no tiene elderly_profile_id disponible")
            return None
        
        # Obtener el elderly_profile
        elderly_profile = db.query(ElderlyProfile).filter(
            ElderlyProfile.id == elderly_profile_id
        ).first()
        
        if not elderly_profile:
            logger.error(f"ElderlyProfile con ID {elderly_profile_id} no encontrado")
            return None
        
        # Obtener el número de teléfono del usuario asociado o emergency_contact
        user = db.query(User).filter(User.id == elderly_profile.id).first()
        if user and user.phone:
            return user.phone
        elif elderly_profile.emergency_contact:
            return elderly_profile.emergency_contact
        
        logger.warning(f"No se encontró número de teléfono para ElderlyProfile {elderly_profile_id}")
        return None
    
    @staticmethod
    def generate_call_message(db: Session, reminder: Reminder) -> str:
        """
        Genera el mensaje personalizado para la llamada según el tipo de reminder.
        
        Args:
            db: Sesión de base de datos
            reminder: Reminder del cual generar el mensaje
        
        Returns:
            Mensaje a decir en la llamada
        """
        if reminder.reminder_type == "medicine":
            if not reminder.medicine:
                return "Recordatorio: Es hora de tomar tu medicamento. ¿Ya lo tomaste?"
            
            medicine = db.query(Medicine).filter(Medicine.id == reminder.medicine).first()
            if not medicine:
                return "Recordatorio: Es hora de tomar tu medicamento. ¿Ya lo tomaste?"
            
            # Obtener información de la persona mayor
            elderly_profile = db.query(ElderlyProfile).filter(
                ElderlyProfile.id == medicine.id
            ).first()
            
            elderly_name = None
            if elderly_profile:
                user = db.query(User).filter(User.id == elderly_profile.id).first()
                if user:
                    elderly_name = user.full_name
            
            try:
                tablets_info = f"{medicine.tablets_per_dose} tableta(s)" if medicine.tablets_per_dose else "la dosis indicada"
                
                name_context = f"\n- Nombre de la persona: {elderly_name}" if elderly_name else ""
                name_instruction = f"\n- Dirigirse a la persona por su nombre: {elderly_name}" if elderly_name else "\n- Usar un saludo genérico y amigable"
                
                prompt = f"""Genera un mensaje de recordatorio amigable y claro en español para tomar medicamento que será dicho en una llamada telefónica. 

                Información del medicamento:
                - Nombre: {medicine.name}
                - Dosis: {tablets_info}{name_context}

                El mensaje debe:
                - Ser cálido y empático, dirigido a una persona mayor{name_instruction}
                - Mencionar el nombre del medicamento: {medicine.name}
                - Especificar claramente la cantidad: {tablets_info}
                - Ser breve (máximo 2-3 oraciones)
                - Usar un tono amigable y no alarmante
                - Ser apropiado para ser dicho en voz alta en una llamada

                Solo devuelve el mensaje, sin comillas ni formato adicional."""

                # Generar contenido con Gemini
                gemini_response = generate_content(prompt)
                
                # Extraer el texto de la respuesta de Gemini
                if gemini_response and "candidates" in gemini_response:
                    candidates = gemini_response.get("candidates", [])
                    if candidates and len(candidates) > 0:
                        content = candidates[0].get("content", {})
                        parts = content.get("parts", [])
                        if parts and len(parts) > 0:
                            message = parts[0].get("text", "").strip()
                            if message:
                                logger.info(f"Mensaje generado por IA para medicamento {medicine.name}: {message}")
                                return message
                
                raise ValueError("Respuesta vacía de Gemini")
                
            except Exception as e:
                logger.error(f"Error al generar mensaje con IA: {str(e)}. Usando mensaje por defecto.")
                tablets_info = f"{medicine.tablets_per_dose} tableta(s)" if medicine.tablets_per_dose else "la dosis indicada"
                greeting = f"Querido/a {elderly_name}, " if elderly_name else "Hola, "
                return f"{greeting}recuerda tomar {medicine.name} ({tablets_info}). ¿Ya lo tomaste?"
        
        elif reminder.reminder_type == "appointment":
            return "Recordatorio: Tienes una cita médica próximamente. Por favor confirma tu asistencia."
        
        return "Tienes un recordatorio pendiente. Por favor confirma."
    
    @staticmethod
    async def process_reminder_call(
        db: Session, 
        reminder_instance: ReminderInstance
    ) -> Dict:
        """
        Procesa una reminder_instance pendiente enviando una llamada telefónica.
        
        Args:
            db: Sesión de base de datos
            reminder_instance: ReminderInstance a procesar
        
        Returns:
            Diccionario con el resultado del procesamiento
        """
        result = {
            "reminder_instance_id": reminder_instance.id,
            "success": False,
            "error": None,
            "call_sid": None
        }
        
        try:
            # Obtener el reminder asociado
            reminder = db.query(Reminder).filter(Reminder.id == reminder_instance.reminder_id).first()
            if not reminder:
                error_msg = f"Reminder con ID {reminder_instance.reminder_id} no encontrado"
                logger.error(error_msg)
                result["error"] = error_msg
                return result
            
            # Obtener número de teléfono
            phone_number = ReminderCallService.get_phone_number_for_reminder(db, reminder)
            if not phone_number:
                error_msg = f"No se pudo obtener número de teléfono para reminder {reminder.id}"
                logger.error(error_msg)
                result["error"] = error_msg
                return result
            
            # Generar mensaje
            message = ReminderCallService.generate_call_message(db, reminder)
            print('message from generate_call_message', message)
            logger.info(f"Mensaje generado para la llamada: {message}")
            
            # Obtener webhook URL si está configurada
            webhook_url = os.getenv('TWILIO_WEBHOOK_URL')
            print(f"Webhook URL: {webhook_url}")
            logger.info(f"Webhook URL: {webhook_url}")
            
            # Crear notification_log antes de enviar la llamada
            log_data = NotificationLogCreate(
                reminder_instance_id=reminder_instance.id,
                notification_type="call",
                recepient_phone=phone_number,
                status="pending",
                sent_at=datetime.now()
            )
            notification_log = NotificationLogService.create(db, log_data)
            
            # Enviar llamada
            try:
                print('process reminder call')
                logger.info(f"Enviando llamada a {phone_number} con mensaje: {message}")
                call_sid = create_call(phone_number, message, webhook_url=webhook_url, reminder_instance_id=reminder_instance.id)
                
                result["call_sid"] = call_sid
                
                # Actualizar reminder_instance a "waiting" (esperando respuesta)
                instance_update = ReminderInstanceUpdate(
                    status=ReminderInstanceStatus.WAITING.value
                )
                ReminderInstanceService.update(db, reminder_instance.id, instance_update)
                
                # Actualizar notification_log
                log_update = NotificationLogUpdate(
                    status="sent",
                    sent_at=datetime.now(),
                    response=f"Call SID: {call_sid}"
                )
                NotificationLogService.update(db, notification_log.id, log_update)
                
                result["success"] = True
                logger.info(f"Llamada enviada exitosamente para reminder_instance {reminder_instance.id}. Call SID: {call_sid}")
                
            except Exception as e:
                error_msg = f"Error al enviar llamada: {str(e)}"
                logger.error(error_msg)
                
                # Actualizar reminder_instance a "failure"
                instance_update = ReminderInstanceUpdate(
                    status=ReminderInstanceStatus.FAILURE.value
                )
                ReminderInstanceService.update(db, reminder_instance.id, instance_update)
                
                # Actualizar notification_log con el error
                log_update = NotificationLogUpdate(
                    status="failed",
                    error_message=error_msg
                )
                NotificationLogService.update(db, notification_log.id, log_update)
                
                result["error"] = error_msg
        
        except Exception as e:
            error_msg = f"Error al procesar reminder_instance {reminder_instance.id}: {str(e)}"
            logger.error(error_msg)
            result["error"] = error_msg
        
        return result
    
    @staticmethod
    async def process_pending_calls(db: Session) -> Dict:
        """
        Procesa todos los reminder_instances pendientes que necesitan llamadas.
        
        Args:
            db: Sesión de base de datos
        
        Returns:
            Diccionario con estadísticas del procesamiento
        """
        print('in async process_pending_calls', flush=True)
        logger.info('logger.info in async process_pending_calls')
        pending_instances = ReminderCallService.get_pending_instances_for_call(db)
        
        results = {
            "processed": 0,
            "successful": 0,
            "failed": 0,
            "errors": []
        }
        
        for instance in pending_instances:
            result = await ReminderCallService.process_reminder_call(db, instance)
            print('result from process_reminder_call', result, flush=True)
            results["processed"] += 1
            
            if result["success"]:
                results["successful"] += 1
            else:
                results["failed"] += 1
                if result["error"]:
                    results["errors"].append({
                        "reminder_instance_id": result["reminder_instance_id"],
                        "error": result["error"]
                    })
        
        return results

