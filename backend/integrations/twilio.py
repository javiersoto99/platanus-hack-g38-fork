import os
from twilio.rest import Client
from typing import Optional


def create_call(
    to: str,
    message: str,
    from_number: Optional[str] = None,
    webhook_url: Optional[str] = None,
    reminder_instance_id: Optional[int] = None
) -> str:
    """
    Crea una llamada telefónica usando Twilio
    
    Args:
        to: Número de teléfono destino (formato: +56979745451)
        message: Mensaje a decir en la llamada
        from_number: Número de teléfono origen (opcional, usa el de .env si no se proporciona)
        webhook_url: URL del webhook para recibir respuestas (opcional)
    
    Returns:
        call_sid: ID de la llamada creada
    """
    print('reminder_instance_id en create_call', reminder_instance_id)
    account_sid = os.getenv('TWILIO_ACCOUNT_SID')
    auth_token = os.getenv('TWILIO_AUTH_TOKEN')
    
    if not account_sid or not auth_token:
        raise ValueError("TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN deben estar configurados en las variables de entorno")
    
    client = Client(account_sid, auth_token)
    
    # Usar el número de origen de .env si no se proporciona uno
    if not from_number:
        from_number = os.getenv('TWILIO_PHONE_NUMBER', '+19895752358')
    
    # Construir el mensaje TwiML
    twiml = f"""<Response>
              <Say voice="alice" language="es-ES">{message}</Say>"""
    
    # Si hay webhook_url, agregar Gather para recibir respuesta
    print('webhook_url en create_call', webhook_url)
    if webhook_url:
        twiml += f"""
              <Gather input="speech" language="es-ES" action="{f'webhook_url?reminder_instance_id={reminder_instance_id}'}">
                <Say voice="alice" language="es-ES">
                  Si ya lo hiciste, di "sí".
                </Say>
              </Gather>"""
    
    twiml += """
           </Response>"""
    
    print('twiml en create_call', twiml)
    call = client.calls.create(
        from_=from_number,
        to=to,
        twiml=twiml
    )
    
    return call.sid


if __name__ == "__main__":
    create_call(
        to='+56979745451',
        message='Hola abuelo, recuerda tomar tu dosis de 500mg de paracetamol.'
    )
