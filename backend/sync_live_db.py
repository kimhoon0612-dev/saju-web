import os
import requests
import json
import time

TALSIMAN_SEED_DATA = [
    # [금전/재물/사업/관직]
    {"category": "wish", "theme": "wealth", "name": "재수대길부 (財數大吉符)", "price": 15000, "desc": "큰 재물과 복을 부르는 부적"},
    {"category": "wish", "theme": "wealth", "name": "사업번창부 (事業繁昌符)", "price": 15000, "desc": "사업의 성공과 확장을 돕는 부적"},
    {"category": "wish", "theme": "wealth", "name": "금전수익부 (金錢收益符)", "price": 15000, "desc": "재물이 새어나가는 것을 막고 모으는 부적"},
    {"category": "wish", "theme": "wealth", "name": "대박기원부 (大舶祈願符)", "price": 15000, "desc": "횡재수와 큰 금전운을 기원하는 부적"},
    {"category": "wish", "theme": "wealth", "name": "초재부 (招財符)", "price": 12000, "desc": "사방에서 재물을 끌어들이는 부적"},
    {"category": "wish", "theme": "wealth", "name": "금운부 (金運符)", "price": 12000, "desc": "타고난 금전운 자체를 상승시키는 부적"},
    {"category": "wish", "theme": "wealth", "name": "천객만래부 (千客萬來符)", "price": 12000, "desc": "장사나 영엽에 손님이 끊이지 않게 하는 부적"},
    {"category": "wish", "theme": "wealth", "name": "재산상승부 (財産上昇符)", "price": 15000, "desc": "부동산 등 자산 가치의 상승을 돕는 부적"},
    {"category": "wish", "theme": "wealth", "name": "대초관직부 (大招官職符)", "price": 15000, "desc": "좋은 직장이나 높은 관직(합격)에 오르게 하는 부적"},
    {"category": "wish", "theme": "wealth", "name": "승격승진부 (昇格昇進符)", "price": 12000, "desc": "조직 내에서 빠르고 안정적인 승진을 돕는 부적"},
    {"category": "wish", "theme": "wealth", "name": "관직재산부 (官職財産符)", "price": 18000, "desc": "명예(관직)와 재물을 동시에 얻게 해주는 부적"},
    {"category": "wish", "theme": "wealth", "name": "재테크성공부", "price": 15000, "desc": "주식, 투자 등 현금 자산의 운용 성공을 돕는 부적"},

    # [연애/인연/관계/가정]
    {"category": "wish", "theme": "love", "name": "애정성사부 (愛情成事符)", "price": 15000, "desc": "짝사랑이나 원하는 인연이 맺어지게 하는 부적"},
    {"category": "wish", "theme": "love", "name": "귀인상봉부 (貴人相逢符)", "price": 15000, "desc": "내 삶을 좋은 방향으로 이끌 귀인을 만나게 하는 부적"},
    {"category": "wish", "theme": "love", "name": "호접부 (蝴蝶符, 나비부)", "price": 18000, "desc": "이성에게 매력을 어필하여 도화살을 좋게 발현시키는 부적"},
    {"category": "wish", "theme": "love", "name": "부부화합부 (夫婦和合符)", "price": 15000, "desc": "부부 사이의 갈등을 풀고 금슬을 좋게 하는 부적"},
    {"category": "wish", "theme": "love", "name": "인연합의부 (因緣合意符)", "price": 12000, "desc": "끊어진 인연을 잇거나 멀어진 관계를 회복하는 부적"},
    {"category": "wish", "theme": "love", "name": "가택편안부 (家宅便安符)", "price": 12000, "desc": "집안에 우환이 없고 평화롭기를 기원하는 부적"},
    {"category": "wish", "theme": "love", "name": "안택부 (安宅符)", "price": 15000, "desc": "이사 또는 새 집에서 가정의 안정을 돕는 부적"},
    {"category": "wish", "theme": "love", "name": "자손번창부 (子孫繁昌符)", "price": 15000, "desc": "훌륭한 자손을 얻고 자녀들이 잘 자라게 돕는 부적"},
    {"category": "wish", "theme": "love", "name": "생자부 (生子符)", "price": 15000, "desc": "간절히 아기를 원할 때 건강한 임신을 돕는 잉태 부적"},
    {"category": "wish", "theme": "love", "name": "인복상승부 (人福上昇符)", "price": 12000, "desc": "어딜 가나 사람들의 도움과 사랑을 받게 하는 부적"},
    {"category": "wish", "theme": "love", "name": "구설수방지부 (口舌數防止符)", "price": 12000, "desc": "타인의 시기나 험담, 구설에 휘말리지 않게 막아주는 부적"},
    {"category": "wish", "theme": "love", "name": "은인보은부 (恩人報恩符)", "price": 15000, "desc": "나에게 도움을 줄 은인과 귀인을 보호하고 끌어당기는 부적"},

    # [건강/장수/평안/수호]
    {"category": "wish", "theme": "health", "name": "무병장수부 (無病長壽符)", "price": 15000, "desc": "잔병치레 없이 길고 건강한 삶을 누리게 하는 부적"},
    {"category": "wish", "theme": "health", "name": "백살소멸부 (百殺消滅符)", "price": 18000, "desc": "나에게 작용하는 백 가지 나쁜 살(殺)을 소멸시키는 부적"},
    {"category": "wish", "theme": "health", "name": "삼재소멸부 (三災消滅符)", "price": 15000, "desc": "3년간 머무는 삼재의 흉운을 막는 부적"},
    {"category": "wish", "theme": "health", "name": "오귀퇴치부 (五鬼退治符)", "price": 15000, "desc": "주위를 맴도는 나쁜 영가(잡귀) 수호"},
    {"category": "wish", "theme": "health", "name": "사고예방부 (事故豫防符)", "price": 15000, "desc": "갑작스러운 사고나 횡액으로부터 몸을 보호하는 부적"},
    {"category": "wish", "theme": "health", "name": "질병치유부 (疾病治癒符)", "price": 15000, "desc": "앓고 있는 병의 차도와 빠른 회복을 기원하는 부적"},
    {"category": "wish", "theme": "health", "name": "피로회복부 (疲勞恢復符)", "price": 9900, "desc": "심신이 지치고 번아웃이 왔을 때 기력을 보충해 주는 부적"},
    {"category": "wish", "theme": "health", "name": "수면안정부 (睡眠安定符)", "price": 9900, "desc": "악몽이나 가위눌림 없이 편안하게 잠들게 해주는 부적"},
    {"category": "wish", "theme": "health", "name": "교통안전부 (交通安全符)", "price": 12000, "desc": "운전 및 이동 중의 무사 무탈을 기원하는 부적"},
    {"category": "wish", "theme": "health", "name": "호신수호부 (護身守護符)", "price": 15000, "desc": "보이지 않는 든든한 방패처럼 내 몸과 기운을 지켜주는 부적"},
    {"category": "wish", "theme": "health", "name": "동토부정부 (動土不淨符)", "price": 12000, "desc": "흙을 잘못 건드리거나 부정 탄 것을 정화하는 부적"},
    {"category": "wish", "theme": "health", "name": "사주관살부 (四柱關殺符)", "price": 15000, "desc": "내 사주팔자에 선천적으로 타고난 나쁜 흉살을 약화시키는 부적"},
    {"category": "wish", "theme": "health", "name": "신수재앙부 (身數災殃符)", "price": 15000, "desc": "한 해의 나쁜 신수나 갑작스러운 재앙을 비껴가게 돕는 부적"},
    {"category": "wish", "theme": "health", "name": "처용부 (處容符)", "price": 18000, "desc": "처용의 굳센 기운을 빌려 역병과 강력한 악귀를 막아내는 부적"},

    # [성공/학업/소원/기타]
    {"category": "wish", "theme": "wood", "name": "만사형통부 (萬事亨通符)", "price": 15000, "desc": "모든 일이 얽힘 없이 순조롭게 풀려나가는 궁극의 부적"},
    {"category": "wish", "theme": "wood", "name": "소원성취부 (所願成就符)", "price": 15000, "desc": "마음속 간절한 단 하나의 소원을 꼭 이뤄지게 돕는 부적"},
    {"category": "wish", "theme": "wood", "name": "합격기원부 (合格祈願符)", "price": 15000, "desc": "대학, 국가고시, 자격증 등 모든 시험의 합격을 돕는 부적"},
    {"category": "wish", "theme": "wood", "name": "취업성공부 (就業成功符)", "price": 15000, "desc": "원하는 타이밍에 원하던 직장에 합격하게 해주는 부적"},
    {"category": "wish", "theme": "wood", "name": "관재소멸부 (官災消滅符)", "price": 15000, "desc": "억울한 관재수를 피하게 하는 부적"},
    {"category": "wish", "theme": "wood", "name": "집중력강화부 (集中力强化符)", "price": 9900, "desc": "공부나 업무 시 산만함을 없애고 몰입력을 극대화하는 부적"},
    {"category": "wish", "theme": "wood", "name": "개운부 (開運符)", "price": 18000, "desc": "막혀있던 운세의 숨통을 트이게 하고 운로를 넓혀주는 부적"},
    {"category": "wish", "theme": "wood", "name": "칠성부 (七星符)", "price": 18000, "desc": "칠성신(북두칠성)의 기운을 받아 수명과 복을 관장하는 부적"},
    {"category": "wish", "theme": "wood", "name": "이사안정부 (移徙安定符)", "price": 12000, "desc": "이사 시 흉방의 기운을 누르고 새 터전의 복을 받는 부적"},
    {"category": "wish", "theme": "wood", "name": "꿈해몽길조부 (夢吉兆符)", "price": 12000, "desc": "흉몽은 길몽으로 바꾸고, 길몽은 현실로 끌어당기는 부적"},
    {"category": "wish", "theme": "wood", "name": "천부인수호부 (天符印守護符)", "price": 25000, "desc": "막강한 권위와 리더십을 부여하는 최고위 수호 부적"},

    # [추가 보강 - 매매, 재물, 종합수호]
    {"category": "wish", "theme": "wealth", "name": "부동산매매부 (不動産賣買符)", "price": 15000, "desc": "집, 상가 등 부동산이 빠르고 좋은 가격에 매매되도록 돕는 부적"},
    {"category": "wish", "theme": "wood", "name": "부귀영화부 (富貴榮華符)", "price": 18000, "desc": "부와 귀를 동시에 누리며 풍요로운 삶을 살게 해주는 부적"},
    {"category": "wish", "theme": "wealth", "name": "득재진보부 (得財進寶符)", "price": 15000, "desc": "진귀한 재물과 보배를 끊임없이 얻게 해주는 부적"},
    {"category": "wish", "theme": "health", "name": "병마퇴치부 (病魔退治符)", "price": 15000, "desc": "몸에 깃든 병마를 쫓아내고 기력을 맑게 하는 부적"},
    {"category": "wish", "theme": "love", "name": "악인퇴치부 (惡人退治符)", "price": 12000, "desc": "나를 괴롭히거나 해코지하려는 악인을 멀어지게 하는 부적"},
    {"category": "wish", "theme": "health", "name": "백마신장수호부 (白馬神將守護符)", "price": 18000, "desc": "강력한 백마신장의 기운으로 온갖 잡귀와 재액을 베어내는 부적"},
    {"category": "wish", "theme": "wood", "name": "일일소원부 (一日所願符)", "price": 9900, "desc": "그날 하루의 작은 소망과 행운을 이뤄주는 가벼운 일일 수호 부적"},
]

def push_missing_items():
    res = requests.get("https://saju-web.onrender.com/api/store/products")
    existing = res.json().get("products", [])
    existing_names = [p["name"] for p in existing]
    
    for item in TALSIMAN_SEED_DATA:
        if item["name"] not in existing_names:
            safe_name = item["name"].split("(")[0].strip()
            filename = f"talisman_{safe_name}.png"
            image_url = f"/talismans/uploads/{filename}"
            
            payload = {
                "name": item["name"],
                "theme": item["theme"],
                "price_points": item["price"],
                "prompt_template": item["desc"],
                "is_active": True,
                "image_url": image_url
            }
            
            # API endpoint: /api/admin/talisman/inventory
            r = requests.post("https://saju-web.onrender.com/api/admin/talisman/inventory", json=payload)
            if r.status_code == 200:
                print(f"Added: {item['name']}")
            else:
                print(f"Failed: {item['name']} - {r.text}")
            time.sleep(0.5)

if __name__ == "__main__":
    push_missing_items()
