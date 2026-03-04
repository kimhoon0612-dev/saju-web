import traceback
from app.core.bazi_calculator import calculate_bazi, calculate_true_solar_time, get_comprehensive_fortune
from datetime import datetime, timedelta
from korean_lunar_calendar import KoreanLunarCalendar

def test_api_logic():
    try:
        # Mock request data
        birth_datetime = datetime.fromisoformat("1990-01-01T12:00:00")
        longitude = 127.0
        gender = "F"
        is_lunar = False
        is_leap_month = False

        if is_lunar:
            calendar = KoreanLunarCalendar()
            isValid = calendar.setLunarDate(birth_datetime.year, birth_datetime.month, birth_datetime.day, is_leap_month)
            if not isValid:
                raise ValueError("유효하지 않은 음력 날짜입니다.")
            birth_datetime = birth_datetime.replace(
                year=calendar.solarYear,
                month=calendar.solarMonth,
                day=calendar.solarDay
            )

        time_result = calculate_true_solar_time(birth_datetime, longitude)
        print("TST Calculated.")

        saju_matrix = calculate_bazi(birth_datetime, longitude, gender)
        print("Saju Matrix Calculated.")

        current_kst = datetime.utcnow() + timedelta(hours=9)
        fortune_cycle = get_comprehensive_fortune(saju_matrix, current_kst)
        print("Fortune Cycle Calculated.")
        
        matrix_dict = saju_matrix.dict()
        matrix_dict['daily_fortune'] = fortune_cycle.iljin.dict()
        matrix_dict['fortune_cycle'] = fortune_cycle.dict()
        print("Dict conversion successful.")

    except Exception as e:
        print("ERROR TRACEBACK:")
        print(traceback.format_exc())

if __name__ == "__main__":
    test_api_logic()
