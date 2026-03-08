import requests
import time

def clean_duplicates():
    print("Fetching live products...")
    res = requests.get("https://saju-web.onrender.com/api/store/products?random=98765")
    if res.status_code != 200:
        print("Failed to fetch products.")
        return
        
    data = res.json()
    products = data.get("products", [])
    
    print(f"Total products found: {len(products)}")
    
    seen_names = set()
    duplicates_to_delete = []
    
    # Sort products so we keep the older (or newer) ones. Let's sort by ID (assuming ID is sequential).
    # We will keep the first one we see (lowest ID or highest depending on how we sort).
    # Since we want to keep one, let's process in order. The API returns order_by(desc(created_at)).
    
    for p in products:
        name = p["name"]
        if name in seen_names:
            duplicates_to_delete.append(p)
        else:
            seen_names.add(name)
            
    print(f"Found {len(duplicates_to_delete)} duplicates out of {len(products)} products.")
    
    for d in duplicates_to_delete:
        pid = d["id"]
        pname = d["name"]
        print(f"Deleting duplicate: {pname} (ID: {pid})")
        r = requests.delete(f"https://saju-web.onrender.com/api/admin/talisman/inventory/{pid}")
        if r.status_code == 200:
            print(f"  Success.")
        else:
            print(f"  Failed: {r.text}")
        time.sleep(0.5)

if __name__ == "__main__":
    clean_duplicates()
