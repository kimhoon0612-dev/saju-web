import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_full_pipeline():
    print("--- Testing /api/calculate (True Solar Time & Matrix) ---")
    calc_req = {
        "birth_time_iso": "1994-10-23T15:30:00",
        "longitude": 127.5,
        "is_lunar": False,
        "is_leap_month": False,
        "gender": "F"
    }
    
    res = requests.post(f"{BASE_URL}/calculate", json=calc_req)
    if res.status_code == 200:
        data = res.json()
        print(f"[OK] Total Correction (min): {data.get('total_correction_min')}")
        print(f"[OK] Day Pillar: {data.get('matrix', {}).get('day_pillar', {}).get('earthly', {}).get('label')}")
        
        matrix = data.get('matrix')
    else:
        print(f"[FAILED] /api/calculate: {res.text}")
        return

    print("\n--- Testing /api/calendar/sync (Sync-Scheduler) ---")
    sync_req = {
        "date": "2026-02-23",
        "message": "Concentrate on execution today.",
        "element_type": "metal"
    }
    res_sync = requests.post(f"{BASE_URL}/calendar/sync", json=sync_req)
    if res_sync.status_code == 200:
        print(f"[OK] ICS Data length: {len(res_sync.text)}")
    else:
        print(f"[FAILED] /api/calendar/sync: {res_sync.text}")

    print("\n--- Testing /api/goods/generate (Digital Goods) ---")
    goods_req = {
        "saju_params": matrix
    }
    res_goods = requests.post(f"{BASE_URL}/goods/generate", json=goods_req)
    if res_goods.status_code == 200:
        g_data = res_goods.json()
        print(f"[OK] Theme: {g_data.get('theme')}")
        print(f"[OK] Image URL: {g_data.get('image_url')[:50]}...")
    else:
        print(f"[FAILED] /api/goods/generate: {res_goods.text}")

if __name__ == "__main__":
    test_full_pipeline()
