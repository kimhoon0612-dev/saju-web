import json
from fastapi.testclient import TestClient
from app.main import app  # Check if importing from app.main works, wait it's main.py in the root

try:
    from main import app
except ImportError:
    from app.main import app

client = TestClient(app)

def test_calculate():
    print("--- 1. Testing /api/calculate ---")
    payload = {
        "birth_time_iso": "1995-05-15T14:30:00",
        "longitude": 126.978,
        "gender": "M"
    }
    response = client.post("/api/calculate", json=payload)
    if response.status_code == 200:
        print("SUCCESS! Output:")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
        return response.json()
    else:
        print(f"FAILED (Status {response.status_code}):")
        print(response.text)
        return None

def test_insight(matrix_data):
    if not matrix_data:
        return
    print("\n\n--- 2. Testing /api/insight ---")
    response = client.post("/api/insight", json=matrix_data)
    if response.status_code == 200:
        print("SUCCESS! Output:")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    else:
        print(f"FAILED (Status {response.status_code}):")
        print(response.text)

def test_digital_goods(matrix_data):
    if not matrix_data: return
    print("\n\n--- 3. Testing /api/goods/generate ---")
    payload = {
        "saju_params": matrix_data
    }
    response = client.post("/api/goods/generate", json=payload)
    if response.status_code == 200:
        data = response.json()
        print("SUCCESS! Theme:", data.get("theme"))
        print("Image URL:", data.get("image_url")[:70], "...")
    else:
        print(f"FAILED (Status {response.status_code}):")
        print(response.text)

if __name__ == "__main__":
    matrix_res = test_calculate()
    if matrix_res and "matrix" in matrix_res:
        # test_insight(matrix_res["matrix"])
        test_digital_goods(matrix_res["matrix"])
