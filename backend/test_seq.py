import requests

# Test 1: `/api/insight`
print("Testing /api/insight")
payload = {
    'year_pillar': {}, 'month_pillar': {}, 'day_pillar': {'heavenly': {'label': '갑'}}, 'time_pillar': {}
}
try:
    r1 = requests.post('https://saju-web.onrender.com/api/insight', json=payload, timeout=20)
    print("insight:", r1.status_code)
except Exception as e:
    print("insight error:", e)

# Test 2: `/api/life-stages`
print("Testing /api/life-stages")
try:
    r2 = requests.post('https://saju-web.onrender.com/api/life-stages', json=payload, timeout=20)
    print("life-stages:", r2.status_code)
except Exception as e:
    print("life-stages error:", e)

# Test 3: `/api/specific-reading` STREAM OPTIONS
print("Testing OPTIONS for specific-reading")
r3 = requests.options('https://saju-web.onrender.com/api/specific-reading', headers={
    'Origin': 'https://saju.test',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'content-type'
})
print("OPTIONS:", r3.status_code, dict(r3.headers))
