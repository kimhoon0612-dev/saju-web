import requests
import json

payload = {
    "saju_matrix": {
        "year_pillar": {"heavenly": {"name": "甲", "label": "갑"}, "earthly": {"name": "子", "label": "자"}},
        "month_pillar": {"heavenly": {"name": "甲", "label": "갑"}, "earthly": {"name": "子", "label": "자"}},
        "day_pillar": {"heavenly": {"name": "甲", "label": "갑"}, "earthly": {"name": "子", "label": "자"}},
        "time_pillar": {"heavenly": {"name": "甲", "label": "갑"}, "earthly": {"name": "子", "label": "자"}}
    },
    "reading_type": "신년운세"
}

try:
    res = requests.post('https://saju-web.onrender.com/api/specific-reading', json=payload, stream=True)
    print(f"Status Code: {res.status_code}")
    for line in res.iter_lines():
        if line:
            print(line.decode('utf-8'))
except Exception as e:
    print(f"Request failed: {e}")
