import httpx
import os
from typing import List, Dict


async def send_whatsapp_message(
    to: str,
    body_text: str,
    buttons: List[Dict[str, str]],
    phone_number_id: str = None
):
    api_key = os.getenv('KAPSO_API_KEY')
    if not api_key:
        raise ValueError("KAPSO_API_KEY no está configurada")
    
    phone_id = phone_number_id or os.getenv('KAPSO_PHONE_NUMBER_ID')
    if not phone_id:
        raise ValueError("KAPSO_PHONE_NUMBER_ID no está configurada")
    
    base_url = 'https://api.kapso.ai/meta/whatsapp'
    url = f"{base_url}/v21.0/{phone_id}/messages"
    
    headers = {
        "X-API-Key": api_key,
        "Content-Type": "application/json"
    }
    
    api_buttons = [
        {
            "type": "reply",
            "reply": {
                "id": button["id"],
                "title": button["title"]
            }
        }
        for button in buttons
    ]
    
    payload = {
        "messaging_product": "whatsapp",
        "to": to,
        "type": "interactive",
        "interactive": {
            "type": "button",
            "body": {
                "text": body_text
            },
            "action": {
                "buttons": api_buttons
            }
        }
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
