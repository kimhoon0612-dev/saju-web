import requests
import json
import time

url = "https://saju-web.onrender.com/api/specific-reading"
payload = {
    "saju_matrix": {
        "day_master": "甲",
        "pillars": {
            "year": ["병", "오"],
            "month": ["기", "해"],
            "day": ["갑", "자"],
            "time": ["갑", "자"]
        },
        "elements": {
            "wood": 2, "fire": 1, "earth": 1, "metal": 0, "water": 4
        }
    },
    "reading_type": "정통사주"
}

print(f"Sending request to {url}...")
try:
    start_time = time.time()
    response = requests.post(url, json=payload, timeout=120)
    end_time = time.time()
    print(f"Status Code: {response.status_code}")
    print(f"Response (first 500 chars): {response.text[:500]}")
    print(f"Time Taken: {end_time - start_time:.2f} seconds")
except Exception as e:
    print(f"Error: {e}")
