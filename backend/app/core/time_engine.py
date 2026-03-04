import math
from datetime import datetime, timedelta

def get_equation_of_time(day_of_year: int) -> float:
    """
    균시차(Equation of Time) 계산 (근사식 사용)
    지구의 타원 궤도와 황도 기울기로 인해 발생하는 평태양시와 진태양시의 차이를 분(minute) 단위로 반환.
    
    :param day_of_year: 해당 연도의 1월 1일부터 경과한 일수 (1~365)
    :return: 균시차 (분 단위, 부동소수점)
    """
    # 궤도 근점 이각 (B) 계산
    # B = (n - 81) * (360 / 365.24) (도 단위) => 라디안 변환
    B = 2 * math.pi * (day_of_year - 81) / 365.24
    
    # 균시차 근사 공식 (결과: 분)
    # EOT = 9.87 * sin(2B) - 7.53 * cos(B) - 1.5 * sin(B)
    eot = 9.87 * math.sin(2 * B) - 7.53 * math.cos(B) - 1.5 * math.sin(B)
    return eot

def calculate_true_solar_time(standard_time: datetime, longitude: float, standard_meridian: float = 135.0) -> dict:
    """
    표준시를 입력받아 출생지 경도와 균시차를 반영한 '진태양시(True Solar Time)'를 계산.
    
    :param standard_time: 입력된 사용자의 출생 일시 (KST 등, timezone info가 없어도 로컬 타임으로 가정)
    :param longitude: 사용자가 태어난 곳의 십진 경도 (예: 서울 = 126.978)
    :param standard_meridian: 해당 타임존의 기준 경도 (한국/일본 표준시는 135도)
    :return: { 'true_solar_time': datetime, 'correction_minutes': float, 'eot_minutes': float }
    """
    # 1. 경도 보정값 계산 (Longitude Correction)
    # 1도 차이당 4분 (24시간 * 60분 / 360도 = 4분/도)
    # 경도가 기준 자오선보다 서쪽이면 -, 동쪽이면 +
    longitude_offset_minutes = (longitude - standard_meridian) * 4
    
    # 2. 균시차(EoT) 계산
    # 요일 번호 추출 (1월 1일이 1이 되도록)
    day_of_year = standard_time.timetuple().tm_yday
    eot_minutes = get_equation_of_time(day_of_year)
    
    # 총 보정 시간 (Total Correction)
    total_correction_minutes = longitude_offset_minutes + eot_minutes
    
    # 진태양시 도출
    true_solar_time = standard_time + timedelta(minutes=total_correction_minutes)
    
    return {
        "original_standard_time": standard_time.isoformat(),
        "true_solar_time": true_solar_time,
        "true_solar_time_iso": true_solar_time.isoformat(),
        "longitude_offset_min": round(longitude_offset_minutes, 2),
        "eot_min": round(eot_minutes, 2),
        "total_correction_min": round(total_correction_minutes, 2)
    }

# 로컬 테스트용 블록
if __name__ == "__main__":
    # 예시: 2026년 2월 23일 낮 12:00, 서울 출생 (경도 126.978)
    test_time = datetime(2026, 2, 23, 12, 0, 0)
    seoul_longitude = 126.978
    
    result = calculate_true_solar_time(test_time, seoul_longitude)
    print("=== 진태양시 연산 결과 ===")
    print(f"표준시 (입력): {result['original_standard_time']}")
    print(f"경도 보정(분): {result['longitude_offset_min']}")
    print(f"균시차 보정(분): {result['eot_min']}")
    print(f"진태양시 (출력): {result['true_solar_time_iso']}")
