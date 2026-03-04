import os
import asyncio
import httpx
from typing import Dict, Any, Optional

# Example for GoAPI (Midjourney Wrapper)
MIDJOURNEY_API_KEY = os.environ.get("MIDJOURNEY_API_KEY", "")
MIDJOURNEY_BASE_URL = "https://api.midjourneyapi.xyz/mj/v2" 

async def generate_talisman_image(product_id: str, element_theme: Optional[str] = "water", user_concern: Optional[str] = None) -> str:
    """
    Initiates a highly aesthetic Midjourney generation for a digital talisman.
    If no API key is provided, returns a premium Unsplash fallback instantly for local testing.
    Incorporates user's present psychological concern (user_concern) into the prompt.
    """
    
    # PREMIUM FALLBACKS per Element / Product Type (Served by Next.js from /public/talismans)
    fallbacks = {
        "wood": "http://127.0.0.1:3000/talismans/health.png",
        "fire": "http://127.0.0.1:3000/talismans/love.png",
        "earth": "http://127.0.0.1:3000/talismans/wealth.png",
        "metal": "http://127.0.0.1:3000/talismans/wealth.png",
        "water": "http://127.0.0.1:3000/talismans/health.png",
        "default": "http://127.0.0.1:3000/talismans/wealth.png"
    }
    
    selected_fallback = fallbacks.get(element_theme, fallbacks["default"])

    if not MIDJOURNEY_API_KEY:
        print("WARNING: MIDJOURNEY_API_KEY is not set. Using premium fallback images.")
        await asyncio.sleep(2) # Simulate async processing
        return selected_fallback

    # --- REAL MIDJOURNEY WORKFLOW (GoAPI Layout) ---
    prompt = f"A breathtaking, highly aesthetic, minimalist and mystical 3D rendered mobile wallpaper representing the Chinese Element: {element_theme}. "
    if user_concern:
        prompt += f"It strictly embodies the energy needed to manifest the user's sincere wish: '{user_concern}'. "
    prompt += "It should feel premium, soothing, deeply atmospheric with glowing neon highlights. No text, no letters. High resolution, elegant abstract composition --ar 9:16 --v 6.0"
    
    try:
        async with httpx.AsyncClient() as client:
            # 1. Start generation (Imagine)
            start_res = await client.post(
                f"{MIDJOURNEY_BASE_URL}/imagine",
                headers={"X-API-KEY": MIDJOURNEY_API_KEY},
                json={"prompt": prompt}
            )
            start_res.raise_for_status()
            task_id = start_res.json().get("task_id")
            
            if not task_id:
                return selected_fallback
                
            # 2. Polling for completion
            for _ in range(30): # 30 attempts, 2 seconds each = 60s max
                await asyncio.sleep(2)
                status_res = await client.post(
                    f"{MIDJOURNEY_BASE_URL}/fetch",
                    headers={"X-API-KEY": MIDJOURNEY_API_KEY},
                    json={"task_id": task_id}
                )
                
                status_data = status_res.json()
                if status_data.get("status") == "finished":
                    # Assume task returns an array of 4 images, pick the first one URL
                    if status_data.get("task_result") and status_data["task_result"].get("image_urls"):
                        return status_data["task_result"]["image_urls"][0]
                    break
                elif status_data.get("status") == "failed":
                    break
                    
            return selected_fallback # Timeout or failed
            
    except Exception as e:
        print(f"Midjourney API Error: {e}")
        return selected_fallback
