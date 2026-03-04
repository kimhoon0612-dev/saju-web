import datetime
import math
import ephem
from app.core.bazi_calculator import calculate_bazi

def calculate_eot_and_true_solar_time(standard_time: datetime.datetime, longitude: float) -> datetime.datetime:
    """
    1. Calculate Equation of Time (EoT) in minutes.
    2. Add Longitude correction (4 minutes per degree from standard meridian).
    3. Return True Solar Time.
    
    Standard Meridian for KST (UTC+9) is 135°E.
    Korea is roughly at 127.0°E (Seoul).
    """
    # Longitude correction: 4 minutes per degree difference from 135E
    # If Seoul is 127E, 127 - 135 = -8 degrees. -8 * 4 = -32 minutes.
    standard_meridian = 135.0
    lon_correction_min = (longitude - standard_meridian) * 4.0
    
    # Equation of Time calculation
    # Using a common approximation:
    # Let B = 360/365.24 * (d - 81) in degrees, where d is day of the year.
    day_of_year = standard_time.timetuple().tm_yday
    
    # More precise empirical formula:
    # B = (2 * pi / 365) * (day - 81)
    # EoT = 9.87 * sin(2B) - 7.53 * cos(B) - 1.5 * sin(B)
    b_rad = (2 * math.pi / 365.0) * (day_of_year - 81)
    eot_min = 9.87 * math.sin(2 * b_rad) - 7.53 * math.cos(b_rad) - 1.5 * math.sin(b_rad)
    
    total_correction_min = lon_correction_min + eot_min
    
    true_solar_time = standard_time + datetime.timedelta(minutes=total_correction_min)
    return true_solar_time, eot_min, lon_correction_min

def test_eot():
    # Test date: Feb 15 (EoT is around -14 minutes)
    dt1 = datetime.datetime(2024, 2, 15, 12, 0, 0)
    # Test date: Nov 3 (EoT is around +16 minutes)
    dt2 = datetime.datetime(2024, 11, 3, 12, 0, 0)
    
    seoul_lon = 127.0
    
    tst1, eot1, lon_c = calculate_eot_and_true_solar_time(dt1, seoul_lon)
    tst2, eot2, _ = calculate_eot_and_true_solar_time(dt2, seoul_lon)
    
    print(f"Date: {dt1.strftime('%Y-%m-%d')} | EoT: {eot1:.2f} min | Lon Correction: {lon_c:.2f} min | KST: 12:00 -> TST: {tst1.strftime('%H:%M:%S')}")
    print(f"Date: {dt2.strftime('%Y-%m-%d')} | EoT: {eot2:.2f} min | Lon Correction: {lon_c:.2f} min | KST: 12:00 -> TST: {tst2.strftime('%H:%M:%S')}")

if __name__ == "__main__":
    test_eot()
