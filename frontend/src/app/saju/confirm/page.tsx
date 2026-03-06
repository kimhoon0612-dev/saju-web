"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Info, Share2, Plus, Calendar as CalendarIcon, X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";

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

const SAJU_INFO: Record<string, string> = {
    "신년운세": "한 해의 전반적인 길흉화복을 다각도로 분석하여 올 한 해 나아갈 방향을 제시해 드립니다.",
    "토정비결": "조선시대부터 이어져 온 비결로, 한 해의 운수를 열두 달 단위로 촘촘하게 짚어봅니다.",
    "정통사주": "태어난 연월일시를 바탕으로 평생의 운명, 성격, 재물, 길흉 등을 전문적으로 분석합니다.",
    "오늘의운세": "오늘 하루 나를 둘러싼 오행의 흐름을 파악하여 하루를 지혜롭게 보낼 수 있도록 도와드립니다.",
    "내일의운세": "다가올 내일의 특별한 기운을 미리 읽고, 조심할 점과 기회로 삼을 점을 안내해 드립니다.",
    "지정일 운세": "중요한 일정을 앞두고, 특정 날짜의 특별한 운의 흐름과 기운 상생을 확인합니다.",
    "궁합": "나와 매칭 대상의 기운이 조화로운지, 서로에게 어떤 영향을 주는지 인연의 합을 객관적으로 분석합니다.",
    "짝궁합": "나와 특별한 인연의 감정선과 합/충을 섬세하게 분석하여 앞으로의 관계 발전을 짚어봅니다.",
    "정통궁합": "결혼이나 깊은 동업 관계를 생각할 때, 두 사람의 운명적 궁합과 득실을 봅니다.",
    "띠 운세": "내가 태어난 해의 띠(십이지)의 특성과, 다가올 흐름이 나와 어떻게 어울릴지 분석합니다.",
    "별자리 운세": "서양 점성술의 별자리와 태어난 날짜의 행성 위치를 바탕으로 운명의 지도를 그려봅니다.",
    "태어난 계절운": "봄, 여름, 가을, 겨울. 내가 태어난 계절의 온습도와 조후가 내 운명에 미치는 영향을 알아봅니다.",
    "생년월일 운세": "특별한 날 태어난 당신의 기본적 숫자 에너지와 생일이 주는 타고난 매력을 풀어냅니다.",
    "전생운": "내 영혼에 새겨진 과거의 흔적과 성향을 명리적으로 역추적하여 전생의 인연을 상상해 봅니다.",
    "탄생석": "나의 태어난 달과 맞는 행운의 보석, 그리고 그 보석이 나의 사주에 어떤 부족한 기운을 채워줄지 봅니다.",
};

function ConfirmContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const type = searchParams?.get("type") || "운세";

    const isSpecificDate = type === "지정일 운세";
    const isCompatibility = type === "짝궁합" || type === "정통궁합";

    const [matrix, setMatrix] = useState<any>(null);
    const [userInfo, setUserInfo] = useState<SajuUserInfo | null>(null);

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
    const dayBranch = getHanja(matrix.day_pillar?.earthly?.label);
    const dominantTenGod = matrix.month_pillar?.earthly?.ten_god || "상관";

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

    return (
        <div className="font-pretendard bg-[#F5F6F8] min-h-screen pb-10 text-[#111111] relative">

            {/* Header */}
            <header className="bg-white px-5 h-14 flex items-center justify-between border-b border-gray-100 sticky top-0 z-40">
                <button onClick={() => router.back()} className="text-gray-800 p-2 -ml-2">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="font-bold text-[18px] text-gray-900 absolute left-1/2 -translate-x-1/2">{type}</h1>
                <div className="flex gap-4 text-gray-800">
                    <Info size={22} className="cursor-pointer" />
                    <Share2 size={22} className="cursor-pointer" />
                </div>
            </header>

            <main className="max-w-md mx-auto px-5 pt-6 flex flex-col gap-6">

                {/* 1. User Profile Box */}
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

                {/* 2. Three Info Summary Badges */}
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
                            {ANIMAL_EMOJI[dayBranch] || "🐾"}
                        </div>
                        <span className="text-[15px] font-extrabold text-gray-900">{dayBranch} 동물</span>
                        <span className="text-[12px] text-gray-400 mt-0.5">일주 동물</span>
                    </div>

                    <div className="flex-1 bg-white rounded-[24px] p-4 flex flex-col items-center justify-center shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-gray-50 h-[130px]">
                        <div className="w-[52px] h-[52px] rounded-full bg-gray-600 text-white flex items-center justify-center text-[18px] font-bold shadow-sm mb-3">
                            {dominantTenGod.substring(0, 2)}
                        </div>
                        <span className="text-[15px] font-extrabold text-gray-900">{dominantTenGod}</span>
                        <span className="text-[12px] text-gray-400 mt-0.5">타고난 성향</span>
                    </div>
                </section>

                {/* 3. Bazi Grid (8 Pillars) */}
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

                {/* Compatibility Target Add Section */}
                {isCompatibility && (
                    <section className="bg-white rounded-[24px] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col items-center justify-center gap-4 py-10">
                        <div className="w-[64px] h-[64px] rounded-[20px] border border-gray-300 flex items-center justify-center text-gray-400 hover:bg-gray-50 cursor-pointer transition-colors">
                            <Plus size={32} strokeWidth={1} />
                        </div>
                        <p className="text-[13px] text-gray-500 font-medium">궁합을 볼 대상의 정보를 추가해주세요</p>
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
                            if (isCompatibility) {
                                alert("궁합 대상 정보가 아직 추가되지 않았습니다. (Demo)");
                            } else {
                                router.push("/saju/result");
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
