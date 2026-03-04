import requests
import json

data = {
    "birth_time_iso": "1990-01-01T12:00:00",
    "longitude": 127.0,
    "gender": "male"
}

try:
    print("Testing /api/calculate...")
    calc_res = requests.post("http://127.0.0.1:8000/api/calculate", json=data)
    print("Calculate status:", calc_res.status_code)
    if calc_res.status_code != 200:
        print("Calculate error:", calc_res.text)
        exit(1)
        
    calc_data = calc_res.json()
    matrix = calc_data.get("matrix")
    
    print("\nTesting /api/insight...")
    in_res = requests.post("http://127.0.0.1:8000/api/insight", json=matrix)
    print("Insight status:", in_res.status_code)
    if in_res.status_code != 200:
        print("Insight error:", in_res.text)
        
    print("\nTesting /api/life-stages...")
    ls_res = requests.post("http://127.0.0.1:8000/api/life-stages", json=matrix)
    print("Life Stages status:", ls_res.status_code)
    print("Life Stages text:", ls_res.text)
    if ls_res.status_code != 200:
        print("Life Stages error:", ls_res.text)
        
except Exception as e:
    print("Exception:", e)
