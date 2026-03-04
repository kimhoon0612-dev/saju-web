import sys
import asyncio
from datetime import datetime

# Add the app to path to allow absolute imports
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.bazi_calculator import calculate_bazi, get_comprehensive_fortune

def debug_calc():
    print("Starting debug_calc...")
    birth_iso = "1990-01-01T12:00:00"
    birth_datetime = datetime.fromisoformat(birth_iso)
    longitude = 126.978
    gender = "F"
    
    print("Running calculate_bazi...")
    saju_matrix = calculate_bazi(birth_datetime, longitude, gender)
    print("calculate_bazi finished. Running fortune...")
    
    current_kst = datetime.utcnow()
    fortune_cycle = get_comprehensive_fortune(saju_matrix, current_kst)
    print("Fortune cycle finished.")
    print("DONE.")

if __name__ == "__main__":
    debug_calc()
