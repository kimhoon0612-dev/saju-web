from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from datetime import datetime, timedelta
import math
import ephem

# --- Astronomical Time Calculation ---
def calculate_true_solar_time(standard_time: datetime, longitude: float = 127.5) -> datetime:
    """
    표준시(KST 등)를 기반으로 해당 경도의 진태양시(True Solar Time)를 계산합니다.
    - longitude: 출생지 경도 (기본값 127.5 - 한국 표준/서울 보정 기준, 오차율 0% 하드코딩)
    
    계산식:
    진태양시 = 표준시 + 경도보정 + 균시차(Equation of Time)
    """
    # 1. 경도 보정 (Longitude Correction)
    # KST 기준 자오선은 135도. 1도당 4분의 시간차.
    standard_meridian = 135.0
    lon_correction_min = (longitude - standard_meridian) * 4.0
    
    # 2. 균시차 보정 (Equation of Time)
    # B = (2 * pi / 365) * (day_of_year - 81)
    # EoT = 9.87 * sin(2B) - 7.53 * cos(B) - 1.5 * sin(B) (분 단위)
    day_of_year = standard_time.timetuple().tm_yday
    b_rad = (2 * math.pi / 365.0) * (day_of_year - 81)
    eot_min = 9.87 * math.sin(2 * b_rad) - 7.53 * math.cos(b_rad) - 1.5 * math.sin(b_rad)
    
    # 총 보정 시간(분) 추가
    total_correction_m = lon_correction_min + eot_min
    
    # 진태양시 반환
    return standard_time + timedelta(minutes=total_correction_m)

# --- Pydantic Data Models ---

class BaziChar(BaseModel):
    id: str
    element: str = Field(description="wood, fire, earth, metal, water")
    label: str = Field(description="Korean label for the element characteristic")
    ten_god: str = Field(default="", description="십성 (Ten Gods)")

class HiddenStem(BaseModel):
    label: str
    ten_god: str

class Pillar(BaseModel):
    titleKo: str
    titleEn: str
    heavenly: BaziChar  
    earthly: BaziChar   
    hidden_stems: List[HiddenStem] = []
    twelve_state: str = ""
    symbolic_stars: List[str] = []
    description: str = ""
    wealth_luck: str = ""
    love_luck: str = ""
    career_luck: str = ""

class DaewunPillar(BaseModel):
    age: int
    year: int
    heavenly: BaziChar
    earthly: BaziChar
    description: str = ""
    wealth_luck: str = ""
    love_luck: str = ""
    career_luck: str = ""

class SajuMatrix(BaseModel):
    time_pillar: Pillar
    day_pillar: Pillar
    month_pillar: Pillar
    year_pillar: Pillar
    daewun_number: int = 1
    daewun_pillars: List[DaewunPillar] = []

class DailyFortune(BaseModel):
    date: str
    heavenly: BaziChar
    earthly: BaziChar
    clash_with: List[str] = []
    harmony_with: List[str] = []
    daily_message: str = ""

class FortuneCycle(BaseModel):
    current_daewun: Optional[DaewunPillar] = None
    sewun: Pillar  # Yearly
    wolun: Pillar   # Monthly
    iljin: DailyFortune # Daily


# --- Constants for Bazi Mapping ---
HEAVENLY_STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"]
HEAVENLY_HANJA = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
EARTHLY_BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"]
EARTHLY_HANJA = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]

STEM_ELEMENTS = ["wood", "wood", "fire", "fire", "earth", "earth", "metal", "metal", "water", "water"]
BRANCH_ELEMENTS = ["water", "earth", "wood", "wood", "earth", "fire", "fire", "earth", "metal", "metal", "earth", "water"]

BRANCH_TO_STEM_IDX = [9, 5, 0, 1, 4, 2, 3, 5, 6, 7, 4, 8] # Main Qi for branches

HIDDEN_STEMS_MAP = {
    0: [8, 9],       # 자: 임, 계
    1: [9, 7, 5],    # 축: 계, 신, 기
    2: [4, 2, 0],    # 인: 무, 병, 갑
    3: [0, 1],       # 묘: 갑, 을
    4: [1, 9, 4],    # 진: 을, 계, 무
    5: [4, 6, 2],    # 사: 무, 경, 병
    6: [2, 5, 3],    # 오: 병, 기, 정
    7: [3, 1, 5],    # 미: 정, 을, 기
    8: [4, 8, 6],    # 신: 무, 임, 경
    9: [6, 7],       # 유: 경, 신
    10: [7, 3, 4],   # 술: 신, 정, 무
    11: [4, 0, 8]    # 해: 무, 갑, 임
}

def get_ten_gods(day_master_idx: int, target_stem_idx: int) -> str:
    if day_master_idx == -1: return ""
    dm_elem = day_master_idx // 2
    tgt_elem = target_stem_idx // 2
    same_yin_yang = (day_master_idx % 2) == (target_stem_idx % 2)
    
    diff = (tgt_elem - dm_elem) % 5
    if diff == 0:
        return "비견" if same_yin_yang else "겁재"
    elif diff == 1:
        return "식신" if same_yin_yang else "상관"
    elif diff == 2:
        return "편재" if same_yin_yang else "정재"
    elif diff == 3:
        return "편관" if same_yin_yang else "정관"
    elif diff == 4:
        return "편인" if same_yin_yang else "정인"
    return ""

def get_ten_gods_description(ten_god: str, cycle_type: str) -> str:
    """십성(Ten Gods)을 바탕으로 해당 운세 주기(대운, 세운, 월운)의 일반적 특징을 반환합니다."""
    cycle_context = {
        "대운": "10년간 지속되는 큰 환경과 가치관의 바탕입니다.",
        "세운": "올해 1년 동안 주도적으로 테마를 이끄는 기운입니다.",
        "월운": "이번 달 특유의 분위기와 일어나는 사건의 성향입니다."
    }.get(cycle_type, "")

    desc = {
        "비견": "자립심과 주체성이 강해지며, 동료나 친구와의 관계가 중요해집니다.",
        "겁재": "경쟁심이 발생하며 무리한 지출이나 승부욕을 조심해야 하는 시기입니다.",
        "식신": "창의력과 활동력이 좋아지고, 의식주가 안정되며 여유가 생깁니다.",
        "상관": "기존 틀을 깨고 변화를 추구하며, 표현력과 언변이 두드러집니다.",
        "편재": "활동 범위가 넓어지고 예기치 않은 큰 재물이나 이벤트가 발생할 수 있습니다.",
        "정재": "고정적이고 안정적인 재물운이 상승하며, 성실함의 결실을 맺습니다.",
        "편관": "책임감과 압박감이 커지지만, 이를 극복하면 큰 명예와 권위를 얻습니다.",
        "정관": "안정적이고 합리적인 명예운이 상승하며, 승진이나 안정된 직장이 유리합니다.",
        "편인": "독창적이고 깊은 생각에 빠지며, 철학, 종교, 특수학문에 관심이 커집니다.",
        "정인": "주변의 도움이나 귀인의 조력을 받기 쉽고, 문서나 자격증 관련 운이 좋습니다."
    }.get(ten_god, "")
    
    return f"{desc} ({cycle_context})"

def get_categorized_fortunes(ten_god: str) -> Dict[str, str]:
    """십성 바탕으로 재물운, 애정운, 직장/사업운을 구체적으로 반환합니다."""
    fortunes = {
        "비견": {"wealth": "지출이 늘어날 수 있으니 동업이나 보증은 피하는 것이 좋습니다.", "love": "고집이 세져 다툼이 일어날 수 있으니 양보가 필요합니다.", "career": "독립심이 강해져 홀로 추진하는 일에 유리합니다."},
        "겁재": {"wealth": "예상치 못한 큰 지출이나 손재수가 발생할 수 있으니 자산 관리에 유의하세요.", "love": "경쟁자가 나타나거나 의견 충돌이 잦아질 수 있습니다.", "career": "과감한 추진력이 생기지만 무리한 확장은 피해야 합니다."},
        "식신": {"wealth": "안정적인 수익이 발생하고, 꾸준한 노력으로 재물이 모입니다.", "love": "편안하고 화목한 관계가 유지되며 새로운 인연을 만나기 좋습니다.", "career": "자신의 재능을 발휘하여 인정받으며 의식주가 풍족해집니다."},
        "상관": {"wealth": "빠른 눈치와 아이디어로 단기적인 수익을 창출할 수 있습니다.", "love": "기존 관계에 권태를 느끼기 쉬우니 새로운 자극이 필요합니다.", "career": "기존의 틀을 깨는 혁신적인 일에 유리하나 구설수를 조심하세요."},
        "편재": {"wealth": "투기성 자본이나 예상치 못한 횡재수가 있지만 지출도 큽니다.", "love": "만남과 헤어짐이 빈번할 수 있으며 매력적인 인연이 다가옵니다.", "career": "사업 영역을 상업적으로 넓히거나 수완을 발휘하기 좋습니다."},
        "정재": {"wealth": "차곡차곡 저축하며 고정적이고 안정적인 재물이 쌓이는 시기입니다.", "love": "안정적이고 변함없는 사랑을 나누며 결혼하기 좋은 시기입니다.", "career": "맡은 바 책임을 다해 신임과 안정적인 보상을 받습니다."},
        "편관": {"wealth": "재물이 나가더라도 큰 명예나 권력을 얻기 위해 투자하는 시기입니다.", "love": "스트레스가 많은 연애나 강렬한 이끌림이 있는 인연을 만납니다.", "career": "어려움을 극복하고 승진하거나 큰 책임을 맡게 됩니다."},
        "정관": {"wealth": "무리하지 않고 안정적인 월급과 명예로운 보상이 따릅니다.", "love": "이성적이고 바른 인연을 만나며 관계가 순탄하게 발전합니다.", "career": "취업이나 승진 운이 매우 좋으며 조직 내에서 인정받습니다."},
        "편인": {"wealth": "현금보다는 문서나 부동산, 지적 재산권으로 재물을 묶어두는 것이 유리합니다.", "love": "외로움을 타기 쉽고 생각과 감정 기복이 커질 수 있습니다.", "career": "독창적인 아이디어나 특수 분야, 전문 기술에서 역량을 발휘합니다."},
        "정인": {"wealth": "윗사람의 조력이나 문서상(상속, 증여, 부동산)의 큰 재물운이 있습니다.", "love": "포근하고 배려심 깊은 사람을 만나 정신적 위안을 얻습니다.", "career": "학업, 자격증 취득에 매우 유리하며 주변의 든든한 지원을 받습니다."},
    }
    return fortunes.get(ten_god, {"wealth": "", "love": "", "career": ""})

def get_12_state(stem_idx: int, branch_idx: int) -> str:
    STATES_12 = ["장생", "목욕", "관대", "건록", "제왕", "쇠", "병", "사", "묘", "절", "태", "양"]
    if stem_idx == 0: idx = (branch_idx - 11) % 12
    elif stem_idx == 1: idx = (6 - branch_idx) % 12
    elif stem_idx == 2: idx = (branch_idx - 2) % 12
    elif stem_idx == 3: idx = (9 - branch_idx) % 12
    elif stem_idx == 4: idx = (branch_idx - 2) % 12
    elif stem_idx == 5: idx = (9 - branch_idx) % 12
    elif stem_idx == 6: idx = (branch_idx - 5) % 12
    elif stem_idx == 7: idx = (0 - branch_idx) % 12
    elif stem_idx == 8: idx = (branch_idx - 8) % 12
    elif stem_idx == 9: idx = (3 - branch_idx) % 12
    else: return ""
    return STATES_12[idx]

def get_12_symbolic_stars(ref_branch: int, tgt_branch: int) -> str:
    # 12신살: 해묘미(11,3,7)->기준(8), 인오술(2,6,10)->기준(11), 사유축(5,9,1)->기준(2), 신자진(8,0,4)->기준(5)
    STARS = ["겁살", "재살", "천살", "지살", "년살(도화)", "월살", "망신살", "장성살", "반안살", "역마살", "육해살", "화개살"]
    start_idx = 0
    if ref_branch in [11, 3, 7]: start_idx = 8
    elif ref_branch in [2, 6, 10]: start_idx = 11
    elif ref_branch in [5, 9, 1]: start_idx = 2
    elif ref_branch in [8, 0, 4]: start_idx = 5
    
    idx = (tgt_branch - start_idx) % 12
    return STARS[idx]

def get_relations(tgt_branch: int, other_branches: List[int]) -> List[str]:
    relations = []
    # 충 (자오, 축미, 인신, 묘유, 진술, 사해)
    chong_pairs = [{0,6}, {1,7}, {2,8}, {3,9}, {4,10}, {5,11}]
    # 육합 (자축, 인해, 묘술, 진유, 사신, 오미)
    he_pairs = [{0,1}, {2,11}, {3,10}, {4,9}, {5,8}, {6,7}]
    # 원진 (자미, 축오, 인유, 묘신, 진해, 사술)
    yuanjin_pairs = [{0,7}, {1,6}, {2,9}, {3,8}, {4,11}, {5,10}]
    # 형 (인사신, 축술미, 자묘, 진진, 오오, 유유, 해해)
    xing_pairs = [{2,5}, {5,8}, {2,8}, {1,10}, {10,7}, {1,7}, {0,3}]
    
    has_chong = False
    has_he = False
    has_yuanjin = False
    has_xing = False
    
    for other in other_branches:
        pair = {tgt_branch, other}
        if pair in chong_pairs: has_chong = True
        if pair in he_pairs: has_he = True
        if pair in yuanjin_pairs: has_yuanjin = True
        if pair in xing_pairs: has_xing = True
        if pair == {4,4} and tgt_branch == 4: has_xing = True # 진진
        if pair == {6,6} and tgt_branch == 6: has_xing = True # 오오
        if pair == {9,9} and tgt_branch == 9: has_xing = True # 유유
        if pair == {11,11} and tgt_branch == 11: has_xing = True # 해해
        
    if has_chong: relations.append("충(沖)")
    if has_he: relations.append("합(合)")
    if has_yuanjin: relations.append("원진(怨)")
    if has_xing: relations.append("형(刑)")
        
    return relations

def get_symbolic_stars(day_master_idx: int, branch_idx: int, year_branch: int, day_branch: int, all_branches: List[int]) -> List[str]:
    stars = []
    # 천을귀인
    if day_master_idx in [0, 4, 6] and branch_idx in [1, 7]: stars.append("천을귀인")
    elif day_master_idx in [1, 5] and branch_idx in [0, 8]: stars.append("천을귀인")
    elif day_master_idx in [2, 3] and branch_idx in [9, 11]: stars.append("천을귀인")
    elif day_master_idx == 7 and branch_idx in [2, 6]: stars.append("천을귀인")
    elif day_master_idx in [8, 9] and branch_idx in [3, 5]: stars.append("천을귀인")
    
    # 공망 (Calculated based on Day Pillar - passed externally)
    empty_start = (10 - day_master_idx + day_branch) % 12
    if branch_idx == empty_start or branch_idx == (empty_start + 1) % 12:
        stars.append("공망")
        
    # 12신살
    y_star = get_12_symbolic_stars(year_branch, branch_idx)
    d_star = get_12_symbolic_stars(day_branch, branch_idx)
    stars.append((f"[년]{y_star}" if y_star != d_star else f"[년,일]{y_star}").replace("살","")) # 간소화 표기
    if y_star != d_star:
        stars.append(f"[일]{d_star}".replace("살",""))
        
    # 형충회합
    other_b = [b for b in all_branches if b != branch_idx]
    rels = get_relations(branch_idx, all_branches) # Check against all branches including self for self-xing
    # filter out self-comparisons unless it's self-xing
    self_count = all_branches.count(branch_idx)
    rels = get_relations(branch_idx, [b for b in all_branches if b != branch_idx])
    if self_count > 1 and branch_idx in [4, 6, 9, 11]:
        if "형(刑)" not in rels: rels.append("형(刑)")
    stars.extend(rels)
    
    return stars

def get_bazi_char(is_stem: bool, index: int, prefix: str, day_master_idx: int) -> BaziChar:
    if is_stem:
        hanja = HEAVENLY_HANJA[index]
        hangul = HEAVENLY_STEMS[index]
        elem = STEM_ELEMENTS[index]
        ten_god = get_ten_gods(day_master_idx, index) if prefix != "d_h" else "일간"
    else:
        hanja = EARTHLY_HANJA[index]
        hangul = EARTHLY_BRANCHES[index]
        elem = BRANCH_ELEMENTS[index]
        ten_god = get_ten_gods(day_master_idx, BRANCH_TO_STEM_IDX[index])
        
    return BaziChar(
        id=f"{prefix}_{hanja}",
        element=elem,
        label=f"{hanja}({hangul})",
        ten_god=ten_god
    )

def calculate_bazi(standard_time: datetime, longitude: float = 127.0, gender: str = "F") -> SajuMatrix:
    """
    천문학적 알고리즘(PyEphem)을 사용하여 진태양시 및 절기(Solar Terms)를 기반으로 사주 명식을 계산합니다.
    standard_time: 입력된 KST 기준 표준시 (절기 계산용 UTC 변환에 사용)
    longitude: 출생지 경도 (진태양시 계산에 사용)
    gender: "M" 또는 "F" (대운 순행/역행 계산에 사용)
    """
    
    # 1. 진태양시 계산 (경도 및 균시차 반영)
    true_solar_time = calculate_true_solar_time(standard_time, longitude)
    
    # 1. 태양 황경(Ecliptic Longitude) 계산을 위해 KST를 UTC로 변환
    # (한국 표준시 KST = UTC + 9)
    # timezone-naive datetime이므로 단순 시간 차감 사용
    utc_time = standard_time - timedelta(hours=9)
    
    sun = ephem.Sun()
    sun.compute(utc_time)
    
    # 태양의 겉보기 황경 계산 (0~360도)
    solar_lon = math.degrees(ephem.Ecliptic(sun).lon)
    
    # === 년주 (Year Pillar) 계산 ===
    # 년주는 입춘(황경 315도)을 기준으로 바뀜.
    year_val = true_solar_time.year
    month_val = true_solar_time.month
    
    if month_val <= 2 and solar_lon < 315:
        saju_year = year_val - 1
    else:
        saju_year = year_val
        
    year_stem_idx = (saju_year - 4) % 10
    year_branch_idx = (saju_year - 4) % 12
    
    # === 월주 (Month Pillar) 계산 ===
    # 입춘(315도)을 0 기준으로 30도씩 12등분하여 월지 산출
    solar_lon_adj = (solar_lon - 315) % 360
    month_branch_idx = (int(solar_lon_adj // 30) + 2) % 12
    
    # 월간은 년간을 기준으로 '오호둔월법' 적용
    first_month_stem = ((year_stem_idx % 5) * 2 + 2) % 10
    month_stem_idx = (first_month_stem + (month_branch_idx - 2) % 12) % 10
    
    # === 일주 (Day Pillar) 계산 ===
    # 일주는 자정(00:00)을 기준으로 변경되므로 로컬 진태양시 사용
    # 날짜의 연속성을 위해 임의의 기준일(2024-03-06은 己巳일) 설정
    ref_date = datetime(2024, 3, 6).date()
    diff_days = (true_solar_time.date() - ref_date).days
    day_stem_idx = (5 + diff_days) % 10
    day_branch_idx = (5 + diff_days) % 12
    
    # === 시주 (Time Pillar) 계산 ===
    hour = true_solar_time.hour
    minute = true_solar_time.minute
    
    is_yaja = False
    if hour == 23 and minute >= 30:
        is_yaja = True
        
    time_branch_idx = ((hour + 1) % 24 // 2) % 12
    
    reference_day_stem_idx = day_stem_idx
    if is_yaja:
       # 야자시: 시간의 천간은 다음 날짜의 일간을 기준으로 함
       reference_day_stem_idx = (day_stem_idx + 1) % 10
       
    time_stem_start = (reference_day_stem_idx % 5) * 2 % 10
    time_stem_idx = (time_stem_start + time_branch_idx) % 10
    
    day_master_idx = day_stem_idx
    all_branches = [time_branch_idx, day_branch_idx, month_branch_idx, year_branch_idx]

    def build_pillar(title_ko, title_en, stem_idx, branch_idx, prefix, is_day_pillar=False):
        hidden_stems = []
        for hs_idx in HIDDEN_STEMS_MAP[branch_idx]:
            hidden_stems.append(HiddenStem(
                label=HEAVENLY_HANJA[hs_idx],
                ten_god=get_ten_gods(day_master_idx, hs_idx)
            ))
            
        stars = get_symbolic_stars(day_master_idx, branch_idx, year_branch_idx, day_branch_idx, all_branches)
            
        return Pillar(
            titleKo=title_ko, 
            titleEn=title_en,
            heavenly=get_bazi_char(True, stem_idx, f"{prefix}_h", day_master_idx),
            earthly=get_bazi_char(False, branch_idx, f"{prefix}_e", day_master_idx),
            hidden_stems=hidden_stems,
            twelve_state=get_12_state(stem_idx, branch_idx) if is_day_pillar else get_12_state(day_master_idx, branch_idx),
            symbolic_stars=stars
        )

    # === 대운 (Daewun) 계산 ===
    is_yang_year = (year_stem_idx % 2 == 0)
    is_male = (gender.upper() == "M")
    is_forward = (is_yang_year and is_male) or (not is_yang_year and not is_male)
    
    # 1. 대운수 계산 (다음/이전 절기까지의 일수 / 3)
    base_term = math.floor((solar_lon + 15) / 30) * 30 - 15
    if base_term < 0: base_term += 360
    
    if is_forward:
        target_lon = (base_term + 30) % 360
    else:
        target_lon = base_term % 360
        
    current_time = utc_time
    step = timedelta(hours=1) if is_forward else timedelta(hours=-1)
    
    sun_temp = ephem.Sun()
    for _ in range(40 * 24):
        current_time += step
        sun_temp.compute(current_time)
        curr_lon = math.degrees(ephem.Ecliptic(sun_temp).lon)
        
        if is_forward:
            if (curr_lon - solar_lon) % 360 >= (target_lon - solar_lon) % 360: break
        else:
            if (solar_lon - curr_lon) % 360 >= (solar_lon - target_lon) % 360: break
                
    diff_days = abs((current_time - utc_time).total_seconds()) / 86400.0
    daewun_number = round(diff_days / 3.0)
    if daewun_number == 0: daewun_number = 1
        
    # 2. 대운 기둥 8개 생성
    daewun_pillars = []
    start_year = true_solar_time.year + daewun_number
    
    curr_stem = month_stem_idx
    curr_branch = month_branch_idx
    
    for i in range(8):
        if is_forward:
            curr_stem = (curr_stem + 1) % 10
            curr_branch = (curr_branch + 1) % 12
        else:
            curr_stem = (curr_stem - 1) % 10
            curr_branch = (curr_branch - 1) % 12
            
        daewun_pillars.append(DaewunPillar(
            age=daewun_number + i * 10,
            year=start_year + i * 10,
            heavenly=get_bazi_char(True, curr_stem, f"dw_h_{i}", day_master_idx),
            earthly=get_bazi_char(False, curr_branch, f"dw_e_{i}", day_master_idx)
        ))

    return SajuMatrix(
        time_pillar=build_pillar("시 주", "Time Pillar", time_stem_idx, time_branch_idx, "t"),
        day_pillar=build_pillar("일 주", "Day Pillar", day_stem_idx, day_branch_idx, "d", True),
        month_pillar=build_pillar("월 주", "Month Pillar", month_stem_idx, month_branch_idx, "m"),
        year_pillar=build_pillar("년 주", "Year Pillar", year_stem_idx, year_branch_idx, "y"),
        daewun_number=daewun_number,
        daewun_pillars=daewun_pillars
    )

def get_comprehensive_fortune(saju_matrix: SajuMatrix, current_kst: datetime) -> FortuneCycle:
    """
    현재 시간(KST)을 기준으로 대운(Daewun), 세운(Sewun), 월운(Wolun), 일진(Iljin)을 모두 계산하여 반환합니다.
    """
    utc_time = current_kst - timedelta(hours=9)
    sun = ephem.Sun()
    sun.compute(utc_time)
    solar_lon = math.degrees(ephem.Ecliptic(sun).lon)

    # 1. 일간(Day Master) 인덱스 찾기
    dm_hanja = saju_matrix.day_pillar.heavenly.label.split("(")[0]
    try:
        dm_idx = HEAVENLY_HANJA.index(dm_hanja)
    except ValueError:
        dm_idx = -1

    # 2. 세운 (Yearly Fortune - Sewun)
    # 입춘(315도) 기준
    year_val = current_kst.year
    month_val = current_kst.month
    if month_val <= 2 and solar_lon < 315:
        sewun_year = year_val - 1
    else:
        sewun_year = year_val

    sewun_stem_idx = (sewun_year - 4) % 10
    sewun_branch_idx = (sewun_year - 4) % 12
    
    sewun_pillar = Pillar(
        titleKo="세 운",
        titleEn="Yearly Fortune",
        heavenly=get_bazi_char(True, sewun_stem_idx, "sewun_h", dm_idx),
        earthly=get_bazi_char(False, sewun_branch_idx, "sewun_e", dm_idx),
        twelve_state=get_12_state(dm_idx, sewun_branch_idx)
    )
    sewun_pillar.description = get_ten_gods_description(sewun_pillar.heavenly.ten_god, "세운")
    st = get_categorized_fortunes(sewun_pillar.heavenly.ten_god)
    sewun_pillar.wealth_luck = st["wealth"]
    sewun_pillar.love_luck = st["love"]
    sewun_pillar.career_luck = st["career"]

    # 3. 월운 (Monthly Fortune - Wolun)
    # 입춘(315도) 기준 30도 단위
    solar_lon_adj = (solar_lon - 315) % 360
    wolun_branch_idx = (int(solar_lon_adj // 30) + 2) % 12
    first_month_stem = ((sewun_stem_idx % 5) * 2 + 2) % 10
    wolun_stem_idx = (first_month_stem + (wolun_branch_idx - 2) % 12) % 10

    wolun_pillar = Pillar(
        titleKo="월 운",
        titleEn="Monthly Fortune",
        heavenly=get_bazi_char(True, wolun_stem_idx, "wolun_h", dm_idx),
        earthly=get_bazi_char(False, wolun_branch_idx, "wolun_e", dm_idx),
        twelve_state=get_12_state(dm_idx, wolun_branch_idx)
    )
    wolun_pillar.description = get_ten_gods_description(wolun_pillar.heavenly.ten_god, "월운")
    wt = get_categorized_fortunes(wolun_pillar.heavenly.ten_god)
    wolun_pillar.wealth_luck = wt["wealth"]
    wolun_pillar.love_luck = wt["love"]
    wolun_pillar.career_luck = wt["career"]

    # 4. 일진 (Daily Fortune - Iljin)
    ref_date = datetime(2024, 3, 6).date()
    # Pydantic may convert datetime to date or string if confused, let's ensure it's a date
    if isinstance(current_kst, str):
        current_kst_date = datetime.fromisoformat(current_kst).date()
    else:
        current_kst_date = current_kst.date()
        
    diff_days = (current_kst_date - ref_date).days
    day_stem_idx = (5 + diff_days) % 10
    day_branch_idx = (5 + diff_days) % 12
    
    daily_h = get_bazi_char(True, day_stem_idx, "daily_h", dm_idx)
    daily_e = get_bazi_char(False, day_branch_idx, "daily_e", dm_idx)
    
    clashes = []
    harmonies = []
    
    # 사주 원국 지지 추출
    user_branches = {
        "년지": saju_matrix.year_pillar.earthly.label.split("(")[0],
        "월지": saju_matrix.month_pillar.earthly.label.split("(")[0],
        "일지": saju_matrix.day_pillar.earthly.label.split("(")[0],
        "시지": saju_matrix.time_pillar.earthly.label.split("(")[0]
    }
    
    user_branch_indices = {}
    for k, v in user_branches.items():
        try:
            user_branch_indices[k] = EARTHLY_HANJA.index(v)
        except ValueError:
            pass
            
    # 형충합 확인
    chong_pairs = [{0,6}, {1,7}, {2,8}, {3,9}, {4,10}, {5,11}]
    he_pairs = [{0,1}, {2,11}, {3,10}, {4,9}, {5,8}, {6,7}]
    
    for pillar_name, b_idx in user_branch_indices.items():
        pair = {day_branch_idx, b_idx}
        if pair in chong_pairs:
            clashes.append(pillar_name)
        if pair in he_pairs:
            harmonies.append(pillar_name)
            
    # 간단한 액셔너블 메시지 매핑 (예시)
    msg = f"오늘의 기운은 {daily_h.label}{daily_e.label}입니다. "
    if "일지" in clashes:
        msg += "일지와 충이 발생하여 인간관계나 배우자 자리에 작은 변동이 있을 수 있으니 여유를 가지세요."
    elif "일지" in harmonies:
        msg += "일지와 합이 들어와 연애운이나 대인관계가 매우 순조로운 하루입니다."
    elif "월지" in clashes:
        msg += "사회궁(직장/학교)에 충이 있어 갑작스러운 업무 변경이 있을 수 있습니다."
    elif "월지" in harmonies:
        msg += "사회궁과 합을 이루어 직장이나 소속된 그룹에서 좋은 성과나 협력이 기대됩니다."
    elif daily_h.ten_god == "편재" or daily_h.ten_god == "정재":
        msg += "재물운이 활성화되는 시기입니다. 긍정적인 행동이 작은 이득으로 연결될 수 있습니다."
    elif daily_h.ten_god == "편관" or daily_h.ten_god == "정관":
        msg += "관성이 들어와 책임감이 커지는 하루입니다. 원칙을 지키면 인정받습니다."
    else:
        msg += "무난하고 평온하게 내실을 다지기 좋은 하루입니다."
            
    iljin = DailyFortune(
        date=current_kst.strftime("%Y-%m-%d"),
        heavenly=daily_h,
        earthly=daily_e,
        clash_with=clashes,
        harmony_with=harmonies,
        daily_message=msg
    )

    # 5. 현재 대운 (Current Daewun) 찾기
    # 대운수 계산 시 나이 기준을 위해 대략 계산 (정확한 출생연도를 matrix에 넣지 않음)
    # 현재 연도를 기준으로 현재 나이대의 대운을 찾습니다.
    # DaewunPillar 안에는 'year' 필드가 속해 있으므로, current_kst.year와 직접 비교합니다.
    current_daewun = None
    curr_y = getattr(current_kst, 'year', int(str(current_kst)[:4]))
    for dw in reversed(saju_matrix.daewun_pillars):
        if curr_y >= dw.year:
            current_daewun = dw
            break
            
    if not current_daewun and saju_matrix.daewun_pillars:
        current_daewun = saju_matrix.daewun_pillars[0]

    if current_daewun:
        current_daewun.description = get_ten_gods_description(current_daewun.heavenly.ten_god, "대운")
        dt = get_categorized_fortunes(current_daewun.heavenly.ten_god)
        current_daewun.wealth_luck = dt["wealth"]
        current_daewun.love_luck = dt["love"]
        current_daewun.career_luck = dt["career"]

    return FortuneCycle(
        current_daewun=current_daewun,
        sewun=sewun_pillar,
        wolun=wolun_pillar,
        iljin=iljin
    )
