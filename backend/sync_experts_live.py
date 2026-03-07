import requests
import time

EXPERT_SEED_DATA = [
     {
        "category": '운세', "display_name": '예화', "code": '002',
        "tags": '#종합운세, #궁합, #택일, #학업, #취업, #사주',
        "rating": 4.8, "reviews_count": 3610, "avg_minutes": 14, "total_consults": 9999,
        "image_url": 'https://i.pravatar.cc/150?img=5',
        "is_online": True, "banner_text": '선착순 4명 남음', "is_free_available": True
    },
    {
        "category": '운세', "display_name": '백산도사', "code": '105',
        "tags": '#종합운세, #부동산, #금전운, #사업',
        "rating": 4.9, "reviews_count": 2150, "avg_minutes": 16, "total_consults": 8400,
        "image_url": 'https://i.pravatar.cc/150?img=11',
        "is_online": True, "is_free_available": False, "banner_text": ""
    },
    {
        "category": '운세', "display_name": '나무하트명리', "code": '199',
        "tags": '#단기운세, #궁합, #학업, #취업, #건강',
        "rating": 4.7, "reviews_count": 120, "avg_minutes": 12, "total_consults": 850,
        "image_url": 'https://i.pravatar.cc/150?img=15',
        "is_online": False, "banner_text": '부재중', "is_free_available": False
    },
    {
        "category": '운세', "display_name": '청운당', "code": '307',
        "tags": '#신년운세, #성격, #대인관계',
        "rating": 5.0, "reviews_count": 540, "avg_minutes": 10, "total_consults": 1200,
        "image_url": 'https://i.pravatar.cc/150?img=33',
        "is_online": True, "is_free_available": True, "banner_text": ""
    },
    {
        "category": '운세', "display_name": '해의기운', "code": '401',
        "tags": '#사주풀이, #직장, #승진, #이직',
        "rating": 4.6, "reviews_count": 890, "avg_minutes": 15, "total_consults": 3200,
        "image_url": 'https://i.pravatar.cc/150?img=47',
        "is_online": True, "banner_text": '대기열 적음', "is_free_available": False
    },
    {
        "category": '운세', "display_name": '별길', "code": '505',
        "tags": '#명리학, #사주명리, #성공운',
        "rating": 4.8, "reviews_count": 1100, "avg_minutes": 13, "total_consults": 4100,
        "image_url": 'https://i.pravatar.cc/150?img=52',
        "is_online": False, "is_free_available": True, "banner_text": ""
    },
    {
        "category": '운세', "display_name": '송암', "code": '612',
        "tags": '#정통사주, #작명, #개명',
        "rating": 4.9, "reviews_count": 3200, "avg_minutes": 18, "total_consults": 11000,
        "image_url": 'https://i.pravatar.cc/150?img=59',
        "is_online": True, "is_free_available": False, "banner_text": ""
    },
    {
        "category": '운세', "display_name": '예지당', "code": '710',
        "tags": '#연애운, #재물운, #사주',
        "rating": 4.7, "reviews_count": 950, "avg_minutes": 11, "total_consults": 2800,
        "image_url": 'https://i.pravatar.cc/150?img=65',
        "is_online": True, "banner_text": '빠른 상담', "is_free_available": True
    },
    {
        "category": '운세', "display_name": '연화', "code": '840',
        "tags": '#사주, #가정, #부부, #육아',
        "rating": 4.8, "reviews_count": 1450, "avg_minutes": 14, "total_consults": 5000,
        "image_url": 'https://i.pravatar.cc/150?img=68',
        "is_online": True, "is_free_available": False, "banner_text": ""
    },
    {
        "category": '운세', "display_name": '청명', "code": '903',
        "tags": '#사주명리, #궁합, #사업운, #재물',
        "rating": 4.9, "reviews_count": 4100, "avg_minutes": 20, "total_consults": 14000,
        "image_url": 'https://i.pravatar.cc/150?img=12',
        "is_online": True, "banner_text": '인기 상담사', "is_free_available": True
    },

    # --- 타로 (Tarot) 10명 ---
    {
        "category": '타로', "display_name": '로제타로', "code": '031',
        "tags": '#연애타로, #속마음, #재회',
        "rating": 4.9, "reviews_count": 4500, "avg_minutes": 12, "total_consults": 15000,
        "image_url": 'https://i.pravatar.cc/150?img=1',
        "is_online": True, "banner_text": '선착순 2명 남음', "is_free_available": True
    },
    {
        "category": '타로', "display_name": '수비', "code": '112',
        "tags": '#타로, #심리상담, #대인관계, #고민',
        "rating": 4.8, "reviews_count": 1800, "avg_minutes": 15, "total_consults": 6000,
        "image_url": 'https://i.pravatar.cc/150?img=9',
        "is_online": True, "is_free_available": False, "banner_text": ""
    },
    {
        "category": '타로', "display_name": '안젤라', "code": '243',
        "tags": '#타로, #연애, #재회, #썸',
        "rating": 4.7, "reviews_count": 900, "avg_minutes": 10, "total_consults": 3100,
        "image_url": 'https://i.pravatar.cc/150?img=16',
        "is_online": False, "is_free_available": True, "banner_text": ""
    },
    {
        "category": '타로', "display_name": '셀레나', "code": '351',
        "tags": '#직장인타로, #이직, #진로, #적성',
        "rating": 5.0, "reviews_count": 750, "avg_minutes": 14, "total_consults": 2300,
        "image_url": 'https://i.pravatar.cc/150?img=20',
        "is_online": True, "banner_text": '예리한 통찰력', "is_free_available": False
    },
    {
        "category": '타로', "display_name": '비너스', "code": '419',
        "tags": '#타로카드, #금전운, #사업운',
        "rating": 4.6, "reviews_count": 520, "avg_minutes": 11, "total_consults": 1400,
        "image_url": 'https://i.pravatar.cc/150?img=24',
        "is_online": True, "is_free_available": True, "banner_text": ""
    },
    {
        "category": '타로', "display_name": '릴리타로', "code": '577',
        "tags": '#펫타로, #반려동물, #타로상담',
        "rating": 4.9, "reviews_count": 1200, "avg_minutes": 16, "total_consults": 3800,
        "image_url": 'https://i.pravatar.cc/150?img=26',
        "is_online": True, "banner_text": '반려동물 마음읽기', "is_free_available": False
    },
    {
        "category": '타로', "display_name": '스윗베리', "code": '608',
        "tags": '#타로점, #오늘의운세, #연애타로',
        "rating": 4.8, "reviews_count": 3100, "avg_minutes": 9, "total_consults": 11500,
        "image_url": 'https://i.pravatar.cc/150?img=34',
        "is_online": False, "is_free_available": True, "banner_text": ""
    },
    {
        "category": '타로', "display_name": '문라이트', "code": '722',
        "tags": '#달의기운, #심리, #힐링타로',
        "rating": 4.7, "reviews_count": 850, "avg_minutes": 18, "total_consults": 2600,
        "image_url": 'https://i.pravatar.cc/150?img=45',
        "is_online": True, "is_free_available": False, "banner_text": ""
    },
    {
        "category": '타로', "display_name": '레아', "code": '891',
        "tags": '#속마음, #짝사랑, #연애상담',
        "rating": 4.9, "reviews_count": 5200, "avg_minutes": 12, "total_consults": 18000,
        "image_url": 'https://i.pravatar.cc/150?img=10',
        "is_online": True, "banner_text": '압도적 후기', "is_free_available": True
    },
    {
        "category": '타로', "display_name": '엘라', "code": '999',
        "tags": '#종합타로, #미래예측, #운흐름',
        "rating": 4.8, "reviews_count": 2900, "avg_minutes": 14, "total_consults": 8900,
        "image_url": 'https://i.pravatar.cc/150?img=49',
        "is_online": True, "is_free_available": False, "banner_text": ""
    }
]

def push_missing_experts():
    # First, check existing experts to avoid duplication
    r_get = requests.get("https://saju-web.onrender.com/api/admin/experts/")
    if r_get.status_code != 200:
        print(f"Failed to fetch experts: {r_get.text}")
        return
        
    existing_experts = r_get.json()
    existing_names = [e.get("display_name") for e in existing_experts]
    
    print(f"Found {len(existing_experts)} existing experts on server.")
    
    for expert_data in EXPERT_SEED_DATA:
        if expert_data["display_name"] not in existing_names:
            payload = {
                "category": expert_data["category"],
                "display_name": expert_data["display_name"],
                "code": expert_data["code"],
                "tags": expert_data.get("tags", ""),
                "rating": expert_data.get("rating", 4.5),
                "reviews_count": expert_data.get("reviews_count", 0),
                "avg_minutes": expert_data.get("avg_minutes", 10),
                "total_consults": expert_data.get("total_consults", 0),
                "image_url": expert_data.get("image_url", ""),
                "is_online": expert_data.get("is_online", True),
                "banner_text": expert_data.get("banner_text", ""),
                "is_free_available": expert_data.get("is_free_available", False),
                "introduction_text": ""
            }
            
            # API endpoint: /api/admin/experts/
            r_post = requests.post("https://saju-web.onrender.com/api/admin/experts/", json=payload)
            if r_post.status_code == 200:
                print(f"Added expert: {expert_data['display_name']}")
            else:
                print(f"Failed to add {expert_data['display_name']} - {r_post.text}")
            time.sleep(0.5)
        else:
            print(f"Skipped {expert_data['display_name']} (already exists)")

if __name__ == "__main__":
    push_missing_experts()
