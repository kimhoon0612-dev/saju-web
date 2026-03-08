import requests
import json

payload = {
    "saju_matrix": {
        "year_pillar": {"heavenly": {"name": "甲", "label": "갑"}, "earthly": {"name": "子", "label": "자"}},
        "month_pillar": {"heavenly": {"name": "甲", "label": "갑"}, "earthly": {"name": "子", "label": "자"}},
        "day_pillar": {"heavenly": {"name": "甲", "label": "갑"}, "earthly": {"name": "子", "label": "자"}},
        "time_pillar": {"heavenly": {"name": "甲", "label": "갑"}, "earthly": {"name": "子", "label": "자"}}
    }
}

types = ["정통사주", "토정비결", "신년운세", "천생복덕운", "띠 운세", "별자리 운세"]

for t in types:
    print(f"\n--- Testing {t} ---")
    p = payload.copy()
    p["reading_type"] = t
    try:
        res = requests.post('http://127.0.0.1:8000/api/specific-reading', json=p, stream=True)
        print(f"Status Code: {res.status_code}")
        for line in res.iter_lines():
            if line:
                print(line.decode('utf-8'))
    except Exception as e:
        print(f"Request failed for {t}: {e}")
