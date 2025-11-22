import httpx
import os


async def send_telegram_message(
    chat_id: str,
    text: str
):
    """
    Envía un mensaje de Telegram con botones inline "Sí" y "No".
    
    Args:
        chat_id: ID del chat de Telegram (puede ser un número de teléfono o username)
        text: Texto del mensaje
    
    Returns:
        dict: Respuesta de la API de Telegram
    """
    bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
    if not bot_token:
        raise ValueError("TELEGRAM_BOT_TOKEN no está configurada en las variables de entorno")
    
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    
    # Botones hardcodeados: Compatibles con WhatsApp
    # "taken" y "skip" para medicamentos (compatible con WhatsApp)
    payload = {
        "chat_id": chat_id,
        "text": text,
        "reply_markup": {
            "inline_keyboard": [[
                {"text": "Sí", "callback_data": "taken"},
                {"text": "No", "callback_data": "skip"}
            ]]
        }
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload)
        
        # Manejar errores de manera descriptiva
        if response.status_code == 401:
            raise ValueError(
                "Error 401 Unauthorized. El TELEGRAM_BOT_TOKEN no es válido o ha expirado."
            )
        elif response.status_code == 400:
            error_detail = response.json().get("description", response.text)
            raise ValueError(
                f"Error 400 Bad Request al enviar mensaje de Telegram: {error_detail}"
            )
        elif not response.is_success:
            error_detail = response.text
            raise ValueError(
                f"Error al enviar mensaje de Telegram (status {response.status_code}): {error_detail}"
            )
        
        return response.json()
