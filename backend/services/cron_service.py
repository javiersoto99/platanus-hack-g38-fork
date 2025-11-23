from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.orm import Session
from database import SessionLocal
from services.reminder_call_service import ReminderCallService
import logging
import atexit
import asyncio

logger = logging.getLogger(__name__)

# Scheduler global
scheduler = None


def init_scheduler(interval_seconds: int = 20):
    """
    Inicializa el scheduler de cron para procesar recordatorios pendientes.
    
    Args:
        interval_seconds: Intervalo en segundos entre cada ejecución (por defecto 60 segundos = 1 minuto)
    """
    global scheduler

    
    if scheduler is not None:
        logger.warning("Scheduler ya está inicializado")
        return
    
    scheduler = BackgroundScheduler()
    
    def process_reminders_job():
        """Job que se ejecuta periódicamente para procesar recordatorios pendientes"""
        db = SessionLocal()
        try:
            # Procesar llamadas pendientes (es async, usar asyncio.run)
            try:
                print('Processing pending calls')
                print('owo', flush=True)
                logger.info('logger.info owo')
                results = asyncio.run(
                    ReminderCallService.process_pending_calls(db)
                )
                print('Results: ', results)
                logger.info(
                    f"Cron job ejecutado: {results['processed']} procesados, "
                    f"{results['successful']} exitosos, {results['failed']} fallidos"
                )
            except Exception as e:
                logger.error(f"Error ejecutando async en cron job: {str(e)}", exc_info=True)
        except Exception as e:
            logger.error(f"Error en cron job de recordatorios: {str(e)}", exc_info=True)
        finally:
            db.close()
    
    # Agregar el job con intervalo configurable
    scheduler.add_job(
        func=process_reminders_job,
        trigger=IntervalTrigger(seconds=interval_seconds),
        id='process_reminder_calls',
        name='Procesar llamadas de recordatorios pendientes',
        replace_existing=True
    )
    
    scheduler.start()
    logger.info(f"Scheduler iniciado. Ejecutándose cada {interval_seconds} segundos.")
    
    # Registrar shutdown al salir
    atexit.register(lambda: shutdown_scheduler())


def shutdown_scheduler():
    """Detiene el scheduler"""
    global scheduler
    if scheduler is not None:
        scheduler.shutdown()
        scheduler = None
        logger.info("Scheduler detenido")


def get_scheduler():
    """Obtiene el scheduler actual"""
    return scheduler

