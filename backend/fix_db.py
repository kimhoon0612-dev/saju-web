import sqlite3

def fix_db():
    conn = sqlite3.connect('saju_market.db')
    cursor = conn.cursor()
    
    # 1. Fix Virtual Expert Images
    images = [
        "https://randomuser.me/api/portraits/women/44.jpg",
        "https://randomuser.me/api/portraits/men/32.jpg",
        "https://randomuser.me/api/portraits/women/68.jpg",
        "https://randomuser.me/api/portraits/men/90.jpg",
        "https://randomuser.me/api/portraits/women/24.jpg",
    ]
    
    try:
        cursor.execute("SELECT id FROM virtual_experts ORDER BY id")
        experts = cursor.fetchall()
        for i, expert in enumerate(experts):
            if i < len(images):
                cursor.execute("UPDATE virtual_experts SET image_url = ? WHERE id = ?", (images[i], expert[0]))
        print("Fixed Virtual Experts images!")
    except Exception as e:
        print("Error fixing virtual_experts:", e)
        
    try:
        cursor.execute("SELECT id FROM expert_profiles ORDER BY id")
        profiles = cursor.fetchall()
        for i, profile in enumerate(profiles):
            if i < len(images):
                cursor.execute("UPDATE expert_profiles SET image_url = ? WHERE id = ?", (images[i], profile[0]))
        print("Fixed Expert Profiles images!")
    except Exception as e:
        print("Error fixing expert profiles:", e)

    # 2. Insert Store Products
    try:
        cursor.execute("DELETE FROM products WHERE category IN ('amulet', 'coin')")
        
        products = [
            ("재물 대박 부적", "막힌 재물운을 뚫어주는 강력한 에너지가 깃듭니다.", 25000, 35000, "BEST,인기", "amulet", "wealth", "/talismans/wealth.png", 0, 0, 1),
            ("사랑 성취 부적", "짝사랑, 재회, 새로운 인연을 강하게 끌어당깁니다.", 29000, 45000, "주문폭주", "amulet", "love", "/talismans/love.png", 0, 0, 1),
            ("건강 기원 영부", "질병을 예방하고 몸의 기운을 맑게 호신합니다.", 19000, 25000, "", "amulet", "health", "/talismans/health.png", 0, 0, 1),
            ("합격 기원 부적", "수능, 임용, 취업 등 중요한 시험에서 운을 더합니다.", 32000, 40000, "", "amulet", "wood", "/talismans/love.png", 0, 0, 1),
            ("스타터 코인팩", "5,000 코인 가볍게 충전", 5000, None, "", "coin", "coin", "/coins/coin_5k.png", 5000, 0, 1),
            ("베이직 코인팩", "10,000 코인 충전", 10000, None, "", "coin", "coin", "/coins/coin_10k.png", 10000, 500, 1),
            ("인기 코인팩", "30,000 코인 넉넉하게 충전", 30000, None, "인기", "coin", "coin", "/coins/coin_30k.png", 30000, 2000, 1),
            ("프로 상담팩", "50,000 코인 충전 완료", 50000, None, "BEST", "coin", "coin", "/coins/coin_50k.png", 50000, 5000, 1),
            ("VIP 마스터팩", "100,000 코인 대용량 충전", 100000, None, "혜택최대", "coin", "coin", "/coins/coin_100k.png", 100000, 15000, 1),
        ]
        
        cursor.executemany("""
            INSERT INTO products 
            (name, description, price, original_price, sales_tags, category, theme, image_url, coin_amount, bonus_coins, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, products)
        
        print("Inserted Store Products and Coin Packages into DB!")
    except Exception as e:
        print("Error inserting products:", e)
        
    conn.commit()
    conn.close()

if __name__ == "__main__":
    fix_db()
