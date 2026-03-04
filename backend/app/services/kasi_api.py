import os
import requests
from typing import Optional, Dict
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# 한국천문연구원 API 엔드포인트
# 문서: https://www.data.go.kr/data/15012679/openapi.do
KASI_LUNAR_CAL_URL = "http://apis.data.go.kr/B090041/openapi/service/LrsrCldInfoService/getLunCalInfo"

# 실제 배포 시 .env 파일 등을 통해 주입받아야 함
KASI_API_KEY = os.environ.get("KASI_API_KEY", "DEMO_KEY_REQUIRED_FOR_PRODUCTION")

def fetch_saju_ganji_from_kasi(year: int, month: int, day: int) -> Optional[Dict[str, str]]:
    """
    한국천문연구원 API를 호출하여 해당 양력일의 음력/양력 간지(60갑자) 정보를 가져온다.
    이 정보는 사주의 년주, 월주, 일주의 기준이 된다.
    
    :param year: 양력 연도 (예: 2026)
    :param month: 양력 월 (예: 2)
    :param day: 양력 일 (예: 23)
    :return: 간지 정보 딕셔너리 (년, 월, 일의 천간과 지지) 또는 실패 시 None
    """
    params = {
        "solYear": str(year),
        "solMonth": f"{month:02d}",
        "solDay": f"{day:02d}",
        "ServiceKey": KASI_API_KEY,
        "_type": "json"  # JSON 포맷 강제
    }

    try:
        response = requests.get(KASI_LUNAR_CAL_URL, params=params, timeout=5)
        response.raise_for_status()
        
        data = response.json()
        
        # API 응답 구조 파싱 
        # (주의: KASI 응답 형식이 변경될 수 있으므로 예외 처리가 필수적임)
        items = data.get("response", {}).get("body", {}).get("items", {}).get("item", {})
        
        # 목록으로 오는 경우가 있고, 딕셔너리 하나만 오는 경우가 있음
        if isinstance(items, list):
            item = items[0]
        else:
            item = items
            
        if not item:
            print(f"[{year}-{month}-{day}] KASI API 응답에 60갑자 데이터가 없습니다.")
            return None
            
        return {
            "lunYear_ganji": item.get("lunYear"),    # 세차 (년주) 예: 丙午(병오)
            "lunMonth_ganji": item.get("lunMonth"),  # 월건 (월주) 예: 庚寅(경인)
            "lunDay_ganji": item.get("lunIljin"),    # 일진 (일주) 예: 壬申(임신)
            "solWeek": item.get("solWeek")           # 요일
        }
        
    except requests.exceptions.RequestException as e:
        print(f"KASI API 호출 중 네트워크 오류 발생: {e}")
        return None
    except Exception as e:
        print(f"KASI API 응답 파싱 중 오류 발생: {e}")
        return None

# 코어 로직의 흐름을 보여주기 위한 테스트
if __name__ == "__main__":
    test_result = fetch_saju_ganji_from_kasi(2026, 2, 23)
    print("=== KASI 천문연구원 데이터 Fetch 결과 ===")
    print(test_result)
    # API 키가 없으면 RequestException 또는 파싱 에러가 뜰 수 있음.
