"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Info, Share2, Plus, Calendar as CalendarIcon, X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { getAstrologyData } from "@/utils/astrology";
import AstrologyHeroCard from "@/components/AstrologyHeroCard";
import UserBadge from "@/components/UserBadge";

interface SajuUserInfo {
    name: string;
    birth_time_iso: string;
    longitude: number;
    is_lunar: boolean;
    is_leap_month: boolean;
    gender: string;
}

const ELEMENT_COLORS: Record<string, string> = {
    "wood": "bg-[#4CAF50] text-white",     // Green
    "fire": "bg-[#F44336] text-white",     // Red
    "earth": "bg-[#FFC107] text-[#111]",   // Yellow
    "metal": "bg-[#9E9E9E] text-white",     // Grey/White
    "water": "bg-[#212121] text-white",     // Black
};

const ELEMENT_COLORS_BG: Record<string, string> = {
    "wood": "bg-[#4CAF50]",
    "fire": "bg-[#F44336]",
    "earth": "bg-[#FFC107]",
    "metal": "bg-[#9E9E9E]",
    "water": "bg-[#212121]",
};

const ELEMENT_KOR: Record<string, string> = {
    "wood": "목", "fire": "화", "earth": "토", "metal": "금", "water": "수"
};

const ANIMAL_EMOJI: Record<string, string> = {
    "자": "🐭", "축": "🐮", "인": "🐯", "묘": "🐰", "진": "🐲", "사": "🐍",
    "오": "🐴", "미": "🐑", "신": "🐵", "유": "🐔", "술": "🐶", "해": "🐷"
};

const TRAIT_MAP: Record<string, { short: string, desc: string }> = {
    "비견": { short: "독립", desc: "주관과 독립심" },
    "겁재": { short: "승부", desc: "강한 승부욕" },
    "식신": { short: "탐구", desc: "창의와 탐구" },
    "상관": { short: "표현", desc: "탁월한 언변" },
    "편재": { short: "인맥", desc: "넓은 인맥·재물" },
    "정재": { short: "성실", desc: "치밀하고 꼼꼼함" },
    "편관": { short: "카리스마", desc: "막중한 책임감" },
    "정관": { short: "원칙", desc: "바르고 정직함" },
    "편인": { short: "직관", desc: "예술적 직관력" },
    "정인": { short: "포용", desc: "따뜻한 수용력" },
    "본원": { short: "본질", desc: "나의 순수 근본" },
};

const SAJU_INFO: Record<string, string> = {
    "신년 흐름": "한 해의 전반적인 길흉화복을 다각도로 분석하여 올 한 해 나아갈 방향을 제시해 드립니다.",
    "토정비결": "조선시대부터 이어져 온 비결로, 한 해의 운수를 열두 달 단위로 촘촘하게 짚어봅니다.",
    "정통 명리": "태어난 연월일시를 바탕으로 평생의 운명, 성격, 재물, 길흉 등을 전문적으로 분석합니다.",
    "오늘의운세": "오늘 하루 나를 둘러싼 오행의 흐름을 파악하여 하루를 지혜롭게 보낼 수 있도록 도와드립니다.",
    "내일의운세": "다가올 내일의 특별한 기운을 미리 읽고, 조심할 점과 기회로 삼을 점을 안내해 드립니다.",
    "지정일 운세": "중요한 일정을 앞두고, 특정 날짜의 특별한 운의 흐름과 기운 상생을 확인합니다.",
    "타인과의 궁합": "나와 매칭 대상의 기운이 조화로운지, 서로에게 어떤 영향을 주는지 인연의 합을 객관적으로 분석합니다.",
    "짝궁합": "나와 특별한 인연의 감정선과 합/충을 섬세하게 분석하여 앞으로의 관계 발전을 짚어봅니다.",
    "정통궁합": "결혼이나 깊은 동업 관계를 생각할 때, 두 사람의 운명적 궁합과 득실을 봅니다.",
    "띠 해석": "내가 태어난 해의 띠(십이지)의 특성과, 다가올 흐름이 나와 어떻게 어울릴지 분석합니다.",
    "별자리표": "서양 점성술의 별자리와 태어난 날짜의 행성 위치를 바탕으로 운명의 지도를 그려봅니다.",
    "계절 에너지": "봄, 여름, 가을, 겨울. 내가 태어난 계절의 온습도와 조후가 내 운명에 미치는 영향을 알아봅니다.",
    "나침반 흐름": "특별한 날 태어난 당신의 기본적 숫자 에너지와 생일이 주는 타고난 매력을 풀어냅니다.",
    "과거의 나": "내 영혼에 새겨진 과거의 흔적과 성향을 명리적으로 역추적하여 전생의 인연을 상상해 봅니다.",
    "퍼스널 젬잼": "나의 태어난 달과 맞는 행운의 보석, 그리고 그 보석이 나의 사주에 어떤 부족한 기운을 채워줄지 봅니다.",
    "타고난 잠재력": "사주 원국에 깃든 나의 천생복덕과 가장 강력한 축복 에너지를 확인합니다.",
    "커리어 운": "현재 직업, 취업, 이직에 있어 나다운 강점과 골든타임을 찾아줍니다.",
    "역량 평가": "나만의 무기와 숨겨진 직업적 강점을 다면적으로 평가합니다.",
    "자아 탐구": "겉모습과 내면의 차이, 나의 심리적 기질과 가장 어울리는 직업을 알아봅니다."
};

function ConfirmContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const type = searchParams?.get("type") || "운세";

    const isSpecificDate = type === "지정일 운세";
    const isCompatibility = type === "타인과의 궁합" || type === "짝궁합" || type === "정통궁합";
    const isAstrology = ["별자리표", "퍼스널 젬잼", "나침반 흐름", "과거의 나", "계절 에너지", "띠 해석"].includes(type);

    const [matrix, setMatrix] = useState<any>(null);
    const [userInfo, setUserInfo] = useState<SajuUserInfo | null>(null);

    // Partner State
    const [partnerMatrix, setPartnerMatrix] = useState<any>(null);
    const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
    const [isCalculatingPartner, setIsCalculatingPartner] = useState(false);

    // Calendar State
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

    useEffect(() => {
        const storedMatrix = sessionStorage.getItem("saju_matrix");
        const storedUser = sessionStorage.getItem("saju_user_info");

        if (storedMatrix) {
            setMatrix(JSON.parse(storedMatrix));
        } else {
            router.replace("/");
            return;
        }

        if (storedUser) {
            setUserInfo(JSON.parse(storedUser));
        }
    }, [router]);

    if (!matrix || !userInfo) {
        return (
            <div className="min-h-screen bg-[#F5F6F8] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Prepare Grid Data
    // Display order: Year (right) -> Month -> Day -> Time (left) usually,
    // The screenshot shows Time | Day | Month | Year from Left to Right.
    // Wait, let's look at standard: 시주 | 일주 | 월주 | 년주  (Left -> Right reading)
    const pillars = [
        { label: "시주", data: matrix.time_pillar },
        { label: "일주", data: matrix.day_pillar },
        { label: "월주", data: matrix.month_pillar },
        { label: "년주", data: matrix.year_pillar }
    ];

    // Format Date string: "1973.10.18 (양력)"
    const birthDateObj = new Date(userInfo.birth_time_iso);
    const formattedDate = `${birthDateObj.getFullYear()}.${String(birthDateObj.getMonth() + 1).padStart(2, '0')}.${String(birthDateObj.getDate()).padStart(2, '0')} (${userInfo.is_lunar ? '음력' : '양력'})`;
    const formattedTime = `${birthDateObj.getHours()}시 ${birthDateObj.getMinutes()}분`;
    const genderKr = (userInfo.gender === 'M' || userInfo.gender === 'male') ? '남성' : '여성';

    // Helper to parse "癸(계)" into Hanja ("癸") and Hangul ("계")
    const getHanja = (label?: string) => label ? label.split('(')[0] : "?";
    const getHangul = (label?: string) => label && label.includes('(') ? label.split('(')[1].replace(')', '') : "?";

    // Summary Elements Calculation
    const dayElement = matrix.day_pillar?.heavenly?.element || "earth";
    const dayBranchHanja = getHanja(matrix.day_pillar?.earthly?.label);
    const dayBranchHangul = getHangul(matrix.day_pillar?.earthly?.label);
    const dominantTenGod = matrix.month_pillar?.earthly?.ten_god || "상관";

    // Astrology Info
    const astData = isAstrology ? getAstrologyData(type, birthDateObj) : null;

    // Calendar Helpers
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const calendarDays = Array.from({ length: 42 }, (_, i) => {
        const dayNumber = i - firstDayOfMonth + 1;
        return (dayNumber > 0 && dayNumber <= daysInMonth) ? dayNumber : null;
    });

    const changeMonth = (offset: number) => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
    };

    const handleSelectDate = (day: number) => {
        setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
        setIsCalendarOpen(false);
    };

    const handlePartnerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsCalculatingPartner(true);
        const formData = new FormData(e.currentTarget);
        const name = formData.get("partner_name") as string;
        const dateStr = formData.get("partner_date") as string;
        const timeStr = formData.get("partner_time") as string;
        const isUnknownTime = formData.get("partner_time_unknown") === "on";
        const gender = formData.get("partner_gender") as string;
        const calendarType = formData.get("partner_calendar") as string;

        try {
            // Default to 12:00 if unknown time
            const finalTimeStr = isUnknownTime ? "12:00" : (timeStr || "12:00");

            // Generate ISO string
            const isoString = `${dateStr}T${finalTimeStr}:00`;

            const payload = {
                birth_time_iso: isoString,
                longitude: 126.978, // Defaulting to Seoul
                is_lunar: calendarType === "lunar",
                is_leap_month: false,
                gender: gender
            };

            const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://saju-web.onrender.com";
            const response = await fetch(`${API_BASE}/api/calculate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error("Failed to calculate partner saju");
            }

            const data = await response.json();

            setPartnerMatrix(data.matrix);
            sessionStorage.setItem("saju_partner_matrix", JSON.stringify(data.matrix));
            sessionStorage.setItem("saju_partner_info", JSON.stringify({ name, ...payload }));
            setIsPartnerModalOpen(false);

        } catch (error) {
            console.error("Error calculating partner:", error);
            alert("상대방 정보를 계산하는 중 오류가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setIsCalculatingPartner(false);
        }
    };

    return (
        <div className="font-pretendard bg-[#F5F6F8] min-h-screen pb-10 text-[#111111] relative">

            {/* Header */}
            <header className="bg-white px-5 h-14 flex items-center justify-between border-b border-gray-100 sticky top-0 z-40">
                <button onClick={() => router.back()} className="text-gray-800 p-2 -ml-2">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="font-bold text-[18px] text-gray-900 absolute left-1/2 -translate-x-1/2">{type}</h1>
                <div className="flex items-center gap-3 text-gray-800">
                    <Share2 size={20} className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors" />
                    <UserBadge />
                </div>
            </header>

            <main className="max-w-md mx-auto px-5 pt-6 flex flex-col gap-6">

                {/* 1. User Profile Box */}
                {!isAstrology && (
                    <section className="bg-white rounded-[24px] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-gray-50 flex justify-between items-start relative">
                        <div className="flex flex-col gap-1.5">
                            <h2 className="text-[18px] font-extrabold text-gray-900 mb-1 flex items-baseline gap-1.5">
                                {userInfo.name.replace(/님$/, '')} <span className="text-[13px] font-medium text-gray-500 font-normal">(본인)</span>
                            </h2>
                            <p className="text-[15px] text-gray-700 font-medium tracking-tight">{formattedDate}</p>
                            <p className="text-[15px] text-gray-700 font-medium tracking-tight">{formattedTime}</p>
                            <p className="text-[15px] text-gray-700 font-medium tracking-tight">{genderKr}</p>
                        </div>
                        <Link href="/" className="absolute right-6 top-6 bg-[#fbff3a] text-gray-900 text-[13px] font-bold px-4 py-1.5 rounded-full hover:bg-yellow-300 transition-colors shadow-sm">
                            변경
                        </Link>
                    </section>
                )}

                {/* 2. Three Info Summary Badges */}
                {!isAstrology && (
                    <section className="flex gap-3 justify-between">
                        <div className="flex-1 bg-white rounded-[24px] p-4 flex flex-col items-center justify-center shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-gray-50 h-[130px]">
                            <div className={`w-[52px] h-[52px] rounded-full flex items-center justify-center text-[22px] font-bold shadow-sm mb-3 ${ELEMENT_COLORS[dayElement]}`}>
                                {ELEMENT_KOR[dayElement]}
                            </div>
                            <span className="text-[15px] font-extrabold text-gray-900">{ELEMENT_KOR[dayElement] || "미상"}</span>
                            <span className="text-[12px] text-gray-400 mt-0.5">오행</span>
                        </div>

                        <div className="flex-1 bg-white rounded-[24px] p-4 flex flex-col items-center justify-center shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-gray-50 h-[130px] relative">
                            <div className="absolute top-3 right-3 w-5 h-5 bg-gray-800 text-white rounded-full text-[10px] flex items-center justify-center font-bold">?</div>
                            <div className="w-[52px] h-[52px] rounded-full bg-gray-50 flex items-center justify-center text-[30px] shadow-sm mb-3 border border-gray-100">
                                {ANIMAL_EMOJI[dayBranchHangul] || "🐾"}
                            </div>
                            <span className="text-[15px] font-extrabold text-gray-900">{dayBranchHanja} 동물</span>
                            <span className="text-[12px] text-gray-400 mt-0.5">일주 동물</span>
                        </div>

                        <div className="flex-1 bg-white rounded-[24px] p-4 flex flex-col items-center justify-center shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-gray-50 h-[130px]">
                            <div className="w-[52px] h-[52px] rounded-full bg-gray-600 text-white flex items-center justify-center text-[15px] font-bold shadow-sm mb-3 shadow-[0_2px_10px_rgba(0,0,0,0.15)] leading-tight tracking-tighter">
                                {TRAIT_MAP[dominantTenGod]?.short || dominantTenGod.substring(0, 2)}
                            </div>
                            <span className="text-[13px] font-extrabold text-gray-900 text-center leading-tight whitespace-pre-line">
                                {TRAIT_MAP[dominantTenGod]?.desc || dominantTenGod}
                            </span>
                            <span className="text-[11px] text-gray-400 mt-1">타고난 성향</span>
                        </div>
                    </section>
                )}

                {/* 3. Bazi Grid (8 Pillars) */}
                {!isAstrology && (
                    <section className="bg-white rounded-[24px] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-gray-50">
                        <div className="flex justify-between w-full h-full max-w-[340px] mx-auto gap-2">
                            {pillars.map((pillar, idx) => (
                                <div key={idx} className={`flex flex-col items-center w-[23%] relative ${isCompatibility && pillar.label === '일주' ? 'bg-blue-50/50 rounded-xl relative' : ''}`}>

                                    {isCompatibility && pillar.label === '일주' && (
                                        <div className="absolute inset-0 border border-blue-400/40 rounded-xl border-dashed pointer-events-none scale-y-110 scale-x-105"></div>
                                    )}

                                    <span className={`text-[12px] mb-4 font-medium tracking-tight ${pillar.label === '일주' ? 'text-gray-900 font-bold' : 'text-gray-400'}`}>
                                        {pillar.label}
                                    </span>

                                    <div className="text-[12px] font-bold text-gray-800 mb-3 h-[18px] flex items-center justify-center whitespace-nowrap">
                                        {pillar.data?.heavenly?.ten_god || "-"}
                                    </div>

                                    <div className={`w-full aspect-[4/5] ${ELEMENT_COLORS_BG[pillar.data?.heavenly?.element || "earth"]} rounded-[14px] flex flex-col items-center justify-center text-white font-bold mb-2 shadow-sm relative overflow-hidden`}>
                                        <div className="text-[28px] leading-none mb-1 shadow-sm">{getHanja(pillar.data?.heavenly?.label)}</div>
                                        <div className="text-[9px] opacity-80 flex gap-0.5 items-center">
                                            <span>{getHangul(pillar.data?.heavenly?.label)}</span>
                                            <span className="text-[7px]">,</span>
                                            <span>{ELEMENT_KOR[pillar.data?.heavenly?.element || "earth"]}</span>
                                        </div>
                                    </div>

                                    <div className={`w-full aspect-[4/5] ${ELEMENT_COLORS_BG[pillar.data?.earthly?.element || "earth"]} rounded-[14px] flex flex-col items-center justify-center text-white font-bold shadow-sm relative overflow-hidden mb-3`}>
                                        <div className="text-[28px] leading-none mb-1 shadow-sm">{getHanja(pillar.data?.earthly?.label)}</div>
                                        <div className="text-[9px] opacity-80 flex gap-0.5 items-center">
                                            <span>{getHangul(pillar.data?.earthly?.label)}</span>
                                            <span className="text-[7px]">,</span>
                                            <span>{ELEMENT_KOR[pillar.data?.earthly?.element || "earth"]}</span>
                                        </div>
                                    </div>

                                    <div className="text-[12px] font-bold text-gray-800 mb-1 min-h-[18px] whitespace-nowrap">
                                        {pillar.data?.earthly?.ten_god || "-"}
                                    </div>
                                    <div className="text-[12px] font-bold text-gray-500 whitespace-nowrap">
                                        {pillar.data?.twelve_state || "-"}
                                    </div>

                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Astrology Visuals */}
                {isAstrology && astData && (
                    <AstrologyHeroCard data={astData} />
                )}

                {/* Compatibility Target Add Section */}
                {isCompatibility && (
                    <section className="bg-white rounded-[24px] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col items-center justify-center gap-4 py-8 relative">
                        {partnerMatrix ? (
                            <div className="flex flex-col items-center gap-3 w-full">
                                <div className="w-[64px] h-[64px] rounded-[20px] bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm relative">
                                    <div className="text-2xl font-bold">♥</div>
                                    <button
                                        onClick={() => { setPartnerMatrix(null); sessionStorage.removeItem("saju_partner_matrix"); sessionStorage.removeItem("saju_partner_info"); }}
                                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 text-gray-500 shadow hover:text-red-500"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                <div className="text-center">
                                    <p className="text-[15px] font-bold text-gray-900">상대방 정보가 추가되었습니다</p>
                                    <p className="text-[13px] text-gray-500 mt-1">이제 분석을 시작할 수 있습니다.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsPartnerModalOpen(true)}
                                    className="w-[64px] h-[64px] rounded-[20px] border border-gray-300 flex items-center justify-center text-gray-400 hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <Plus size={32} strokeWidth={1} />
                                </button>
                                <p className="text-[13px] text-gray-500 font-medium">궁합을 볼 상대방의 정보를 추가해주세요</p>
                            </>
                        )}
                    </section>
                )}

                {/* Specific Date Picker Trigger (If not modal, show inline) */}
                {isSpecificDate && (
                    <section
                        className="bg-white rounded-[24px] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-blue-100 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50/50 transition-colors"
                        onClick={() => setIsCalendarOpen(true)}
                    >
                        <div className="flex items-center gap-3 w-full">
                            <div className="w-12 h-12 bg-blue-100/50 rounded-full flex items-center justify-center text-blue-500">
                                <CalendarIcon size={24} />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-[16px] font-bold text-gray-900 leading-tight mb-0.5 border-b border-gray-400 border-dashed pb-0.5 w-max">
                                    {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
                                </h3>
                                <span className="text-[13px] text-gray-500 mt-1">이 날의 운세는 어떨까요? (변경하려면 탭하세요)</span>
                            </div>
                        </div>
                    </section>
                )}

                {/* Saju Type Info & Action Button */}
                <section className="bg-white rounded-[24px] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col gap-5 mb-4">
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[14px] font-black text-[#d4af37] tracking-tight">{type} 정보</span>
                        <p className="text-[15px] text-gray-700 leading-relaxed font-medium break-keep">
                            {SAJU_INFO[type] || "선택하신 운세의 다양한 기운과 흐름을 명리학과 타로점, 점성술을 융합하여 입체적으로 풀어드립니다."}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            if (isCompatibility && !partnerMatrix) {
                                alert("궁합을 볼 상대방의 정보를 먼저 추가해주세요.");
                            } else {
                                router.push(`/saju/result?type=${encodeURIComponent(type)}`);
                            }
                        }}
                        className="w-full py-4 bg-gradient-to-r from-gray-900 to-[#1e1e1e] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md hover:from-black hover:to-gray-900 transition-colors"
                    >
                        <Sparkles size={18} className="text-[#fbff3a]" /> 운세 풀이 보기
                    </button>
                </section>

            </main>

            {/* Calendar Modal */}
            {isCalendarOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/60 backdrop-blur-sm p-5 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-[340px] overflow-hidden flex flex-col animate-in slide-in-from-bottom-8">
                        {/* Calendar Header */}
                        <div className="bg-[#2196F3] p-5 text-white flex flex-col gap-1 relative">
                            <span className="text-sm font-medium opacity-80">날짜 선택</span>
                            <div className="flex items-center justify-between mt-1">
                                <h2 className="text-3xl font-light">
                                    {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 <span className="text-2xl ml-1">(토)</span>
                                </h2>
                                <button className="rounded-full w-8 h-8 flex items-center justify-center hover:bg-white/20">
                                    ✏️
                                </button>
                            </div>
                        </div>

                        {/* Calendar Body */}
                        <div className="p-4 bg-white flex flex-col">
                            <div className="flex items-center justify-between mb-4 mt-2 px-2">
                                <span className="font-bold text-gray-800 flex items-center gap-1 cursor-pointer">
                                    {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월 <span className="text-xs">▾</span>
                                </span>
                                <div className="flex gap-4 text-gray-500">
                                    <button onClick={() => changeMonth(-1)}><ChevronLeft size={20} /></button>
                                    <button onClick={() => changeMonth(1)}><ChevronRight size={20} /></button>
                                </div>
                            </div>

                            {/* Days of week */}
                            <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2 font-medium">
                                <div className="text-red-500">일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div className="text-blue-500">토</div>
                            </div>

                            {/* Dates Grid */}
                            <div className="grid grid-cols-7 gap-y-2 text-center text-sm font-medium">
                                {calendarDays.map((num, i) => {
                                    const isSelected = num === selectedDate.getDate() && currentMonth.getMonth() === selectedDate.getMonth();
                                    const isToday = num === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth();

                                    return (
                                        <div key={i} className="flex items-center justify-center p-1 relative h-9">
                                            {num ? (
                                                <button
                                                    onClick={() => handleSelectDate(num)}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? 'bg-[#2196F3] text-white shadow-md' :
                                                        isToday ? 'border border-[#2196F3] text-[#2196F3]' : 'text-gray-700 hover:bg-gray-100'
                                                        }`}>
                                                    {num}
                                                </button>
                                            ) : <span />}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Footer Actions */}
                            <div className="flex justify-end gap-6 mt-6 px-2 font-bold text-[#2196F3] text-[15px]">
                                <button onClick={() => setIsCalendarOpen(false)} className="hover:opacity-80">취소</button>
                                <button onClick={() => setIsCalendarOpen(false)} className="hover:opacity-80">확인</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Partner Input Modal */}
            {isPartnerModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/60 backdrop-blur-sm p-5 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in slide-in-from-bottom-8">
                        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900">상대방 정보 입력</h3>
                            <button onClick={() => setIsPartnerModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-5 max-h-[70vh] overflow-y-auto">
                            <form id="partner-form" onSubmit={handlePartnerSubmit} className="flex flex-col gap-5">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[13px] font-bold text-gray-700">이름</label>
                                    <input type="text" name="partner_name" required placeholder="예: 홍길동" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder-gray-400" />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1 flex flex-col gap-1.5">
                                        <label className="text-[13px] font-bold text-gray-700">성별</label>
                                        <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                                            <label className="flex-1 text-center cursor-pointer relative">
                                                <input type="radio" name="partner_gender" value="male" className="peer sr-only" defaultChecked />
                                                <div className="py-2 text-[14px] font-bold text-gray-400 rounded-lg peer-checked:bg-white peer-checked:text-blue-600 peer-checked:shadow-sm transition-all">남성</div>
                                            </label>
                                            <label className="flex-1 text-center cursor-pointer relative">
                                                <input type="radio" name="partner_gender" value="female" className="peer sr-only" />
                                                <div className="py-2 text-[14px] font-bold text-gray-400 rounded-lg peer-checked:bg-white peer-checked:text-pink-600 peer-checked:shadow-sm transition-all">여성</div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1 flex flex-col gap-1.5">
                                        <label className="text-[13px] font-bold text-gray-700">생년월일</label>
                                        <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-200 mb-2">
                                            <label className="flex-1 text-center cursor-pointer relative">
                                                <input type="radio" name="partner_calendar" value="solar" className="peer sr-only" defaultChecked />
                                                <div className="py-2 text-[14px] font-bold text-gray-400 rounded-lg peer-checked:bg-white peer-checked:text-gray-900 peer-checked:shadow-sm transition-all">양력</div>
                                            </label>
                                            <label className="flex-1 text-center cursor-pointer relative">
                                                <input type="radio" name="partner_calendar" value="lunar" className="peer sr-only" />
                                                <div className="py-2 text-[14px] font-bold text-gray-400 rounded-lg peer-checked:bg-white peer-checked:text-gray-900 peer-checked:shadow-sm transition-all">음력</div>
                                            </label>
                                        </div>
                                        <input type="date" name="partner_date" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium uppercase" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[13px] font-bold text-gray-700">태어난 시간</label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" name="partner_time_unknown" className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500" />
                                            <span className="text-[12px] text-gray-500 font-medium">잘 모름</span>
                                        </label>
                                    </div>
                                    <select name="partner_time" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium appearance-none">
                                        <option value="">선택해주세요</option>
                                        <option value="23:30">자시 (23:30 ~ 01:29)</option>
                                        <option value="01:30">축시 (01:30 ~ 03:29)</option>
                                        <option value="03:30">인시 (03:30 ~ 05:29)</option>
                                        <option value="05:30">묘시 (05:30 ~ 07:29)</option>
                                        <option value="07:30">진시 (07:30 ~ 09:29)</option>
                                        <option value="09:30">사시 (09:30 ~ 11:29)</option>
                                        <option value="11:30">오시 (11:30 ~ 13:29)</option>
                                        <option value="13:30">미시 (13:30 ~ 15:29)</option>
                                        <option value="15:30">신시 (15:30 ~ 17:29)</option>
                                        <option value="17:30">유시 (17:30 ~ 19:29)</option>
                                        <option value="19:30">술시 (19:30 ~ 21:29)</option>
                                        <option value="21:30">해시 (21:30 ~ 23:29)</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsPartnerModalOpen(false)}
                                className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                form="partner-form"
                                disabled={isCalculatingPartner}
                                className="flex-[2] py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isCalculatingPartner ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : "저장하기"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SajuConfirmPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#F5F6F8] flex items-center justify-center"><div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div></div>}>
            <ConfirmContent />
        </Suspense>
    );
}
