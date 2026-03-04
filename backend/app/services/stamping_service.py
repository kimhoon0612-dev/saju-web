import httpx
import base64
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont

async def apply_custom_stamp(image_url: str, wish_text: str) -> str:
    """
    Downloads the image from URL, overlays the wish_text symmetrically using Pillow,
    and returns returning the final image as a base64 encoded string.
    The text is VOLATILE: it is processed only in memory and never saved to a database or local disk.
    """
    if not wish_text:
        return image_url # Return original if no text
        
    try:
        # 1. Fetch the raw image from URL into memory
        async with httpx.AsyncClient() as client:
            response = await client.get(image_url)
            response.raise_for_status()
            img_data = response.content
            
        # 2. Open image with Pillow
        img = Image.open(BytesIO(img_data)).convert("RGBA")
        width, height = img.size
        
        # 3. Create a transparent overlay for stamping
        txt_layer = Image.new('RGBA', img.size, (255,255,255,0))
        draw = ImageDraw.Draw(txt_layer)
        
        # Try to load a nice font, fallback to default (If building for production, bundle a .ttf font)
        font_size = int(width * 0.05) 
        try:
            fonts_to_try = [
                "C:\\Windows\\Fonts\\malgun.ttf", # Windows (Korean)
                "/System/Library/Fonts/AppleGothic.ttf", # Mac
                "/usr/share/fonts/truetype/nanum/NanumGothic.ttf", # Linux
                "arial.ttf" # English fallback
            ]
            font = None
            for f_name in fonts_to_try:
                try:
                    font = ImageFont.truetype(f_name, font_size)
                    break
                except OSError:
                    continue
            if not font:
                font = ImageFont.load_default()
        except OSError:
            font = ImageFont.load_default()

        # Text properties
        text = wish_text
        text_bbox = draw.textbbox((0, 0), text, font=font)
        text_width = text_bbox[2] - text_bbox[0]
        text_height = text_bbox[3] - text_bbox[1]
        
        # Position: Center bottom with some padding
        x = (width - text_width) / 2
        y = height - (height * 0.15) 
        
        # Add a subtle dark shadow behind text for readability
        shadow_offset = 3
        draw.text((x + shadow_offset, y + shadow_offset), text, font=font, fill=(0, 0, 0, 180))
        
        # Stamp the actual text (Gold-ish white color)
        draw.text((x, y), text, font=font, fill=(255, 235, 205, 230))
        
        # 4. Composite the layers
        final_img = Image.alpha_composite(img, txt_layer)
        final_img = final_img.convert("RGB") # Drop alpha for JPEG output
        
        # 5. Export to Base64 in-memory (No disk write)
        buffered = BytesIO()
        final_img.save(buffered, format="JPEG", quality=90)
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        
        # Cleanup
        del img, txt_layer, draw, final_img
        
        return f"data:image/jpeg;base64,{img_str}"
        
    except Exception as e:
        print(f"Stamping Error: {e}")
        # If stamping fails, gracefully return the unmodified image url
        return image_url
