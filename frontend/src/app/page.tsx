"use client";

import { useState, useEffect } from "react";
import { RefreshCw, ChevronRight, User, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AgenticChatbot from "@/components/AgenticChatbot";
import BirthDataForm from "@/components/BirthDataForm";

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

export default function Home() {
  const router = useRouter();
  const [matrixData, setMatrixData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);

  // New Modal States
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isOutfitModalOpen, setIsOutfitModalOpen] = useState(false);

  // Insight Modal State
  const [elementDetailModal, setElementDetailModal] = useState<{ isOpen: boolean, title: string, content: string }>({ isOpen: false, title: "", content: "" });

  // User Profile
  const [userGender, setUserGender] = useState<string>("female");

  // Parse daily score locally based on harmony/clash backend logic
  let dailyScore = 75;
  if (matrixData?.daily_fortune) {
    const clashes = matrixData.daily_fortune.clash_with?.length || 0;
    const harmonies = matrixData.daily_fortune.harmony_with?.length || 0;
    dailyScore = 75 + (harmonies * 10) - (clashes * 10);
    dailyScore = Math.max(40, Math.min(100, dailyScore));
  }

  // Calculate Element Counts and Saju Strength
  let elementCounts: Record<string, number> = { "목": 0, "화": 0, "토": 0, "금": 0, "수": 0 };
  let sajuStrength = "알 수 없음";

  if (matrixData) {
    const elementMap: Record<string, string> = { "wood": "목", "fire": "화", "earth": "토", "metal": "금", "water": "수" };
    const pillars = [matrixData.time_pillar, matrixData.day_pillar, matrixData.month_pillar, matrixData.year_pillar];

    pillars.forEach(p => {
      if (p?.heavenly?.element) elementCounts[elementMap[p.heavenly.element]] += 1;
      if (p?.earthly?.element) elementCounts[elementMap[p.earthly.element]] += 1;
    });

    // Simple strength calculation based on supportive elements
    const dmElement = matrixData.day_pillar?.heavenly?.element;
    if (dmElement) {
      let supportCount = 0;
      const supportMap: Record<string, string[]> = {
        "wood": ["wood", "water"],
        "fire": ["fire", "wood"],
        "earth": ["earth", "fire"],
        "metal": ["metal", "earth"],
        "water": ["water", "metal"]
      };
      const supportive = supportMap[dmElement] || [];
      pillars.forEach(p => {
        if (p?.heavenly?.element && supportive.includes(p.heavenly.element)) supportCount += 1;
        if (p?.earthly?.element && supportive.includes(p.earthly.element)) supportCount += (p === matrixData.month_pillar ? 2 : 1); // Weight month branch
      });

      sajuStrength = supportCount >= 4 ? "신강(身強)" : "신약(身弱)";
    }
  }

  // Helpers for Bazi Grid
  const getHanja = (label?: string) => label ? label.split('(')[0] : "?";
  const getHangul = (label?: string) => label && label.includes('(') ? label.split('(')[1].replace(')', '') : "?";

  const pillars = matrixData ? [
    { label: "시주", data: matrixData.time_pillar },
    { label: "일주", data: matrixData.day_pillar },
    { label: "월주", data: matrixData.month_pillar },
    { label: "년주", data: matrixData.year_pillar }
  ] : [];

  // Calculate dynamic radar chart points based on five elements counts
  const getRadarPoints = () => {
    if (!matrixData) return "50,20 80,45 60,82 20,78 15,35"; // Fallback points

    // Calculate ratio per element (0 to 4 max commonly)
    const getVal = (k1: string) => Math.min(4, elementCounts[k1] || 0) / 4;

    const r = 40; // Max radius
    const cx = 50;
    const cy = 50;

    // Order: 목(Top: -90), 화(Right: -18), 토(BottomRight: 54), 금(BottomLeft: 126), 수(Left: 198)
    const elements = [
      { v: getVal("목"), ang: -Math.PI / 2 },
      { v: getVal("화"), ang: -Math.PI / 2 + (Math.PI * 2 / 5) },
      { v: getVal("토"), ang: -Math.PI / 2 + (Math.PI * 4 / 5) },
      { v: getVal("금"), ang: -Math.PI / 2 + (Math.PI * 6 / 5) },
      { v: getVal("수"), ang: -Math.PI / 2 + (Math.PI * 8 / 5) }
    ];

    return elements.map(el => {
      const ratio = 0.2 + (el.v * 0.8); // 20% minimum baseline to avoid collapse
      const x = cx + Math.cos(el.ang) * r * ratio;
      const y = cy + Math.sin(el.ang) * r * ratio;
      return `${x},${y}`;
    }).join(" ");
  };

  // Check if we have matrix data in sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("saju_matrix");
    const storedUserInfo = sessionStorage.getItem("saju_user_info");

    if (stored) {
      setMatrixData(JSON.parse(stored));
    }
    if (storedUserInfo) {
      try {
        const parsed = JSON.parse(storedUserInfo);
        if (parsed.gender) setUserGender(parsed.gender);
      } catch (e) { }
    }

    setIsInitializing(false);
  }, []);

  const handleCalculate = async (data: { name: string; birth_time_iso: string; longitude: number; is_lunar: boolean; is_leap_month: boolean; gender: string }) => {
    setIsLoading(true);
    console.log("Starting calculation with data:", data);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://saju-web.onrender.com";
      const calcRes = await fetch(`${API_BASE}/api/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          birth_time_iso: data.birth_time_iso,
          longitude: data.longitude,
          is_lunar: data.is_lunar,
          is_leap_month: data.is_leap_month,
          gender: data.gender
        })
      });
      console.log("Fetch response status:", calcRes.status);
      if (!calcRes.ok) throw new Error(`계산 서버 오류 (Status: ${calcRes.status})`);
      const responseData = await calcRes.json();
      console.log("Received data:", responseData);

      // Inject the user's name into the matrix data for UI rendering
      responseData.matrix.user_name = data.name;

      // Save to session storage so /saju can use it
      const completeMatrix = {
        ...responseData.matrix,
        daily_fortune: responseData.matrix.daily_fortune || responseData.fortune_cycle?.iljin,
        fortune_cycle: responseData.fortune_cycle
      };

      sessionStorage.setItem("saju_matrix", JSON.stringify(completeMatrix));
      sessionStorage.setItem("saju_time_info", JSON.stringify({
        true_solar_time: responseData.true_solar_time,
        original_time: responseData.original_time,
        longitude_offset_min: responseData.longitude_offset_min,
        eot_min: responseData.eot_min,
        total_correction_min: responseData.total_correction_min
      }));
      sessionStorage.setItem("saju_user_info", JSON.stringify(data));

      console.log("Data saved to sessionStorage. Showing dashboard...");
      setMatrixData(completeMatrix);

    } catch (error: any) {
      console.error("데이터 동기화 실패:", error);
      alert(`우주 파동 분석 중 오류가 발생했습니다.\n상세: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMatrix = () => {
    sessionStorage.removeItem("saju_matrix");
    sessionStorage.removeItem("saju_time_info");
  };
  // Render a full-screen loading skeleton instead of 'null' to prevent FOUC
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-t-[3px] border-r-[3px] border-gray-300 border-solid animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      {!matrixData ? (
        // --- FULL SCREEN ONBOARDING HERO ---
        <div className="w-full min-h-[calc(100vh-12rem)] flex flex-col items-center justify-start px-4 pt-2 pb-8 relative bg-[#110e1b] overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Stars background */}
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full opacity-30 animate-pulse"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 3 + 1}px`,
                  height: `${Math.random() * 3 + 1}px`,
                  animationDuration: `${Math.random() * 3 + 2}s`
                }}
              />
            ))}
            <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] bg-purple-900/30 rounded-full blur-[80px] opacity-70"></div>
            <div className="absolute top-[50%] -left-[20%] w-[50%] h-[50%] bg-[#d4af37]/10 rounded-full blur-[60px] opacity-60"></div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="w-full max-w-md relative z-10 flex flex-col gap-6 pt-4"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center p-3.5 bg-[#1a142d] border border-[#d4af37]/30 rounded-2xl shadow-[0_0_15px_rgba(212,175,55,0.15)] mb-5">
                <span className="text-3xl leading-none">🔮</span>
              </div>
              <h1 className="text-[28px] font-black text-[#fdfbf7] tracking-tight mb-3 leading-[1.3] drop-shadow-md font-pretendard">
                하늘이 정해둔<br />당신만의 운명 안내서
              </h1>
              <p className="text-[#d4af37]/80 font-medium text-[15px] break-keep px-4">
                생년월일을 입력하고 밤하늘에 새겨진<br />나의 사주와 타로의 흐름을 확인하세요.
              </p>
            </div>

            <div className="w-full pb-8">
              <BirthDataForm onCalculate={handleCalculate} isLoading={isLoading} buttonText="운명의 흐름 확인하기" />
            </div>
          </motion.div>
        </div>
      ) : (
        // --- MAIN HOME DASHBOARD AFTER LOGIN ---
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-md mx-auto relative z-10 w-full pb-36 bg-[#F5F6F8]"
        >

          {/* Top Title */}
          <div className="flex items-center justify-end px-4 pt-4 pb-5">
            <button onClick={clearMatrix} className="flex items-center gap-1.5 text-[14px] font-bold text-gray-700 hover:text-gray-900 transition-colors">
              <RefreshCw className="w-4 h-4" />
              <span>{matrixData.user_name || "방문자"}님</span>
            </button>
          </div>

          {/* Bazi Grid (8 Pillars) instead of Green Banner Image Area */}
          <div className="px-4 pb-6">
            <div className="bg-white rounded-[32px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col items-center">
              <div className="flex justify-between items-center w-full mb-6 px-1">
                <h2 className="text-[20px] font-extrabold text-[#111]">나의 명식 (사주팔자)</h2>
                <span className="text-[13px] font-bold text-[#3B705C] bg-[#3B705C]/10 px-3 py-1 rounded-full">{sajuStrength}</span>
              </div>

              <div className="flex justify-between w-full h-full max-w-[340px] mx-auto gap-2">
                {pillars.map((pillar, idx) => (
                  <div key={idx} className="flex flex-col items-center w-[23%] relative">
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
            </div>
          </div>

          {/* Quick Links Grid */}
          <div className="px-4 pb-8">
            <div className="flex items-center justify-center gap-3 px-3">
              <button
                onClick={() => setIsAttendanceModalOpen(true)}
                className="flex-1 bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] rounded-full py-3 text-[15px] font-bold text-gray-800 flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors"
              >
                <span className="text-blue-500 text-[18px] leading-[1]">👣</span> 출석체크
              </button>
              <button
                onClick={() => setIsOutfitModalOpen(true)}
                className="flex-1 bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] rounded-full py-3 text-[15px] font-bold text-gray-800 flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors"
              >
                <span className="text-[#d4af37] text-[18px] leading-[1]">👔</span> 행운코디
              </button>
            </div>
          </div>

          {/* Today's Summary Card */}
          <div className="px-4 mb-4">
            <div className="bg-white rounded-[32px] p-6 pt-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-50 overflow-hidden relative">
              <div className="text-[13px] text-gray-400 font-bold mb-1 tracking-wide">오늘의 운세</div>
              <h2 className="text-[24px] font-black tracking-tight text-gray-900 mb-8">{matrixData.user_name || "방문자"}님의 하루 요약</h2>

              {/* Wave Graph Area */}
              <div className="w-[calc(100%+48px)] -ml-6 h-28 relative mb-6">
                {/* Score pill */}
                <div className="absolute top-2 right-[36%] transform translate-x-1/2 flex flex-col items-center z-20">
                  <div className="bg-[#2AC1BC] text-white text-[13px] font-black px-2.5 py-0.5 rounded-lg mb-1 relative shadow-sm leading-none">
                    {dailyScore}
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-transparent border-t-[#2AC1BC]"></div>
                  </div>
                  <div className="w-2 h-2 bg-white border-[2.5px] border-[#2AC1BC] rounded-full mt-2"></div>
                </div>

                {/* Fake curve */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M-10,70 Q 20,30 60,40 T 110,70 L 110,100 L -10,100 Z" fill="url(#grad2)" />
                  <path d="M-10,70 Q 20,30 60,40 T 110,70" fill="none" stroke="#2AC1BC" strokeWidth="1.5" />
                  <defs>
                    <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgba(42, 193, 188, 0.15)" />
                      <stop offset="100%" stopColor="rgba(42, 193, 188, 0)" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* X Axis labels */}
                <div className="absolute bottom-2 inset-x-0 w-full flex justify-between px-8 text-[14px] font-bold text-[#A8D8D6] z-10">
                  <span>그제</span>
                  <span>어제</span>
                  <span className="text-gray-900 bg-white shadow-sm border border-gray-100 rounded-full px-4 py-1.5 -translate-y-2 z-20">오늘</span>
                  <span>내일</span>
                  <span>모레</span>
                </div>
              </div>

              {/* Score and text */}
              <div className="flex flex-col items-center justify-center text-center mt-6 z-20 relative">
                <div className="relative mb-3">
                  <div className="absolute -top-[2px] -right-[20px] w-10 h-10 bg-[#FFF44F] rounded-full mix-blend-multiply opacity-80 z-0"></div>
                  <span className="text-[72px] font-black text-gray-900 leading-[0.85] relative z-10 tracking-tighter">
                    {dailyScore}
                  </span>
                </div>
                <p className="text-[17px] font-bold text-gray-800 leading-snug w-full px-2 break-keep mt-2">
                  {matrixData.daily_fortune?.description || "문을 두드리면 반드시 열리는 하루입니다."}
                </p>

                <button onClick={() => setIsDailyModalOpen(true)} className="mt-8 mb-2 text-[15px] font-bold text-gray-900 flex items-center gap-1 hover:text-gray-600 transition-colors">
                  오늘 하루 자세히 보기 <ChevronRight className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Radar Chart Card (오늘의 운세 흐름 읽기) */}
          <div className="px-4">
            <div className="bg-white rounded-[32px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-50">
              <div className="text-[13px] text-gray-400 font-bold mb-1 tracking-wide">나의 분석 모델</div>
              <h2 className="text-[24px] font-black tracking-tight text-gray-900 mb-6">{matrixData.user_name || "당신"}의 선천적 밸런스</h2>

              <div className="relative w-full aspect-square max-w-[280px] mx-auto mb-10 mt-6">
                {/* Static radar presentation for visually exact match */}
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm overflow-visible">
                  {/* Outer webs */}
                  <polygon points="50,10 90,38 75,85 25,85 10,38" fill="none" stroke="#F1F3F5" strokeWidth="0.5" />
                  <polygon points="50,25 75,44 65,70 35,70 25,44" fill="none" stroke="#F1F3F5" strokeWidth="0.5" />
                  <polygon points="50,40 60,50 55,60 45,60 40,50" fill="none" stroke="#F1F3F5" strokeWidth="0.5" />
                  {/* Spoke lines */}
                  <line x1="50" y1="50" x2="50" y2="10" stroke="#F1F3F5" strokeWidth="1" strokeDasharray="1,1" />
                  <line x1="50" y1="50" x2="90" y2="38" stroke="#F1F3F5" strokeWidth="1" strokeDasharray="1,1" />
                  <line x1="50" y1="50" x2="75" y2="85" stroke="#F1F3F5" strokeWidth="1" strokeDasharray="1,1" />
                  <line x1="50" y1="50" x2="25" y2="85" stroke="#F1F3F5" strokeWidth="1" strokeDasharray="1,1" />
                  <line x1="50" y1="50" x2="10" y2="38" stroke="#F1F3F5" strokeWidth="1" strokeDasharray="1,1" />

                  {/* Label dots */}
                  <circle cx="50" cy="10" r="1.5" fill="none" stroke="#DEE2E6" strokeWidth="0.8" />
                  <circle cx="90" cy="38" r="1.5" fill="none" stroke="#DEE2E6" strokeWidth="0.8" />
                  <circle cx="75" cy="85" r="1.5" fill="none" stroke="#DEE2E6" strokeWidth="0.8" />
                  <circle cx="25" cy="85" r="1.5" fill="none" stroke="#DEE2E6" strokeWidth="0.8" />
                  <circle cx="10" cy="38" r="1.5" fill="none" stroke="#DEE2E6" strokeWidth="0.8" />

                  {/* Filled Shape dynamically generated */}
                  <polygon points={getRadarPoints()} fill="rgba(42, 193, 188, 0.25)" stroke="#2AC1BC" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>

                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-5 text-[13px] text-gray-500 font-bold whitespace-nowrap">목(木)</div>
                <div className="absolute top-[35%] right-0 translate-x-3 -translate-y-1/2 text-[13px] text-gray-500 font-bold whitespace-nowrap">화(火)</div>
                <div className="absolute bottom-[10%] right-0 translate-x-0 translate-y-4 text-[13px] text-gray-500 font-bold whitespace-nowrap">토(土)</div>
                <div className="absolute bottom-[10%] left-0 translate-x-0 translate-y-4 text-[13px] text-gray-500 font-bold whitespace-nowrap">금(金)</div>
                <div className="absolute top-[35%] left-0 -translate-x-3 -translate-y-1/2 text-[13px] text-gray-500 font-bold whitespace-nowrap">수(水)</div>
              </div>

              <div className="flex flex-col gap-5 mt-2">
                <div
                  onClick={() => setElementDetailModal({
                    isOpen: true,
                    title: "나의 일간",
                    content: `사주의 중심이 되는 기운입니다. ${matrixData.day_pillar?.heavenly?.element === "wood" ? "나무처럼 곧고 성장하려는 본질적인 성향을" : matrixData.day_pillar?.heavenly?.element === "fire" ? "불처럼 열정적이고 밝은 본질적인 성향을" : matrixData.day_pillar?.heavenly?.element === "earth" ? "흙처럼 포용력 있고 길러내는 본질적인 성향을" : matrixData.day_pillar?.heavenly?.element === "metal" ? "쇠처럼 단단하고 결단력 있는 본질적인 성향을" : "물처럼 유연하고 지혜로운 본질적인 성향을"} 가지고 태어나셨습니다. 이는 평생을 관통하는 나의 가장 강력한 무기입니다.`
                  })}
                  className="cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-xl transition-colors"
                >
                  <h3 className="text-[17px] font-black text-gray-900 mb-1.5 flex items-center gap-0.5">나의 일간: {matrixData.day_pillar?.heavenly?.label || "알 수 없음"} <ChevronRight className="w-[18px] h-[18px] text-gray-400 translate-y-[0.5px]" /></h3>
                  <p className="text-[15px] text-gray-600 font-bold leading-[1.6] break-keep line-clamp-2">
                    사주의 중심이 되는 기운입니다. {matrixData.day_pillar?.heavenly?.element === "wood" ? "나무처럼 곧고 성장하려는 본질적인 성향을" : matrixData.day_pillar?.heavenly?.element === "fire" ? "불처럼 열정적이고 밝은 본질적인 성향을" : matrixData.day_pillar?.heavenly?.element === "earth" ? "흙처럼 포용력 있고 길러내는 본질적인 성향을" : matrixData.day_pillar?.heavenly?.element === "metal" ? "쇠처럼 단단하고 결단력 있는 본질적인 성향을" : "물처럼 유연하고 지혜로운 본질적인 성향을"} 가지고 있습니다.
                  </p>
                </div>
                <div
                  onClick={() => setElementDetailModal({
                    isOpen: true,
                    title: "신강/신약 판별",
                    content: `당신은 [${sajuStrength}] 체질입니다. 신강사주는 주관이 뚜렷하고 추진력이 강해 리더십을 발휘하기 좋으며, 신약사주는 유연함과 처세술이 뛰어나 주변 환경에 잘 적응하고 사람들의 조력을 끌어내는 능력이 탁월합니다.`
                  })}
                  className="cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-xl transition-colors"
                >
                  <h3 className="text-[17px] font-black text-gray-900 mb-1.5 flex items-center gap-0.5">신강/신약 판별 <ChevronRight className="w-[18px] h-[18px] text-gray-400 translate-y-[0.5px]" /></h3>
                  <p className="text-[15px] text-gray-600 font-bold leading-[1.6] break-keep line-clamp-2">
                    {sajuStrength} 체질입니다. 일간을 도와주는 세력이 내 기운을 어떻게 지탱하는지 분석했습니다.
                  </p>
                </div>
                <div
                  onClick={() => setElementDetailModal({
                    isOpen: true,
                    title: "선천적 기운 분포",
                    content: `목(${elementCounts["목"]}), 화(${elementCounts["화"]}), 토(${elementCounts["토"]}), 금(${elementCounts["금"]}), 수(${elementCounts["수"]}) 비율로 구성된 사주입니다. 넘치는 기운은 덜어내고 부족한 기운은 채용(색상, 방향, 직업)하여 균형을 맞출 때 인생의 흐름이 가장 순탄하게 열립니다.`
                  })}
                  className="cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-xl transition-colors"
                >
                  <h3 className="text-[17px] font-black text-gray-900 mb-1.5 flex items-center gap-0.5">선천적 기운 분포 <ChevronRight className="w-[18px] h-[18px] text-gray-400 translate-y-[0.5px]" /></h3>
                  <p className="text-[15px] text-gray-600 font-bold leading-[1.6] break-keep line-clamp-2">
                    {matrixData ? `목(${elementCounts["목"]}), 화(${elementCounts["화"]}), 토(${elementCounts["토"]}), 금(${elementCounts["금"]}), 수(${elementCounts["수"]})` : "음양오행"}로 이루어져 있습니다. 위 그래프를 통해 본인의 오행 밸런스를 확인해 보세요.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </motion.div>
      )}

      {/* Daily Fortune Detail Modal */}
      {isDailyModalOpen && matrixData && (
        <div className="fixed inset-0 z-[100] flex justify-center items-center bg-black/60 backdrop-blur-sm p-5 animate-in fade-in duration-200">
          <div className="bg-white rounded-[28px] w-full max-w-sm overflow-hidden shadow-2xl relative flex flex-col animate-in slide-in-from-bottom-5 duration-300 max-h-[90vh]">
            <div className="p-5 flex justify-between items-center bg-white border-b border-gray-100 shrink-0 sticky top-0 z-10">
              <h3 className="font-extrabold text-[18px] text-gray-900">오늘의 운세 리포트</h3>
              <button onClick={() => setIsDailyModalOpen(false)} className="rounded-full p-2 bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {/* Daily Overall */}
              <div className="flex flex-col items-center mb-6">
                <div className="bg-[#2AC1BC] text-white text-[15px] font-extrabold px-3 py-1 rounded-full mb-3">
                  전체 {matrixData?.daily_fortune?.monthly_score || dailyScore}점
                </div>
                <p className="text-[15px] text-gray-700 font-bold leading-relaxed text-center break-keep">
                  {matrixData?.daily_fortune?.daily_message || "문을 두드리면 반드시 열리는 하루입니다."}
                </p>
              </div>

              <div className="h-px bg-gray-100 w-full my-6"></div>

              {/* Breakdown */}
              <div className="flex flex-col gap-4">
                {/* Morning */}
                <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 flex gap-4 items-start">
                  <div className="flex flex-col items-center justify-center min-w-[50px]">
                    <span className="text-[13px] font-bold text-gray-500 mb-1">오전</span>
                    <span className="text-[22px] font-black text-blue-600">{matrixData?.daily_fortune?.morning_score || 70}</span>
                  </div>
                  <div className="w-px h-12 bg-blue-200/50 mt-1"></div>
                  <p className="text-[14px] text-gray-700 font-bold leading-snug pt-1 break-keep flex-1">
                    {matrixData?.daily_fortune?.morning_msg || "활기찬 시작이 예상되는 상쾌한 기운입니다."}
                  </p>
                </div>
                {/* Afternoon */}
                <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100 flex gap-4 items-start">
                  <div className="flex flex-col items-center justify-center min-w-[50px]">
                    <span className="text-[13px] font-bold text-gray-500 mb-1">오후</span>
                    <span className="text-[22px] font-black text-orange-500">{matrixData?.daily_fortune?.afternoon_score || 70}</span>
                  </div>
                  <div className="w-px h-12 bg-orange-200/50 mt-1"></div>
                  <p className="text-[14px] text-gray-700 font-bold leading-snug pt-1 break-keep flex-1">
                    {matrixData?.daily_fortune?.afternoon_msg || "집중력이 높아지고 목표를 달성하기 좋은 시간입니다."}
                  </p>
                </div>
                {/* Evening */}
                <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 flex gap-4 items-start">
                  <div className="flex flex-col items-center justify-center min-w-[50px]">
                    <span className="text-[13px] font-bold text-gray-500 mb-1">저녁</span>
                    <span className="text-[22px] font-black text-indigo-600">{matrixData?.daily_fortune?.evening_score || 70}</span>
                  </div>
                  <div className="w-px h-12 bg-indigo-200/50 mt-1"></div>
                  <p className="text-[14px] text-gray-700 font-bold leading-snug pt-1 break-keep flex-1">
                    {matrixData?.daily_fortune?.evening_msg || "하루를 성공적으로 마무리하며 편안한 휴식을 취하세요."}
                  </p>
                </div>
              </div>

            </div>
            {/* Modal Bottom Sticky Button */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0 sticky bottom-0 z-10">
              <button
                onClick={() => setIsDailyModalOpen(false)}
                className="w-full bg-gray-900 text-white font-bold text-[16px] h-12 rounded-[16px] hover:bg-gray-800 transition-colors shadow-md"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Element Detail Modal */}
      {elementDetailModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex justify-center items-end sm:items-center bg-black/60 backdrop-blur-sm sm:p-5 animate-in fade-in duration-200" onClick={() => setElementDetailModal({ ...elementDetailModal, isOpen: false })}>
          <div className="bg-white rounded-t-[32px] sm:rounded-[28px] w-full max-w-sm overflow-hidden shadow-2xl relative flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-5 duration-300" onClick={e => e.stopPropagation()}>
            <div className="p-6 pt-8 flex flex-col items-center">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mb-6 absolute top-3 sm:hidden"></div>
              <h3 className="font-extrabold text-[22px] text-gray-900 mb-4">{elementDetailModal.title}</h3>
              <p className="text-[16px] text-gray-700 leading-relaxed font-medium text-center break-keep px-2">
                {elementDetailModal.content}
              </p>
            </div>
            <div className="p-5 w-full">
              <button
                onClick={() => setElementDetailModal({ ...elementDetailModal, isOpen: false })}
                className="w-full bg-gray-900 text-white font-bold text-[16px] h-[52px] rounded-[16px] hover:bg-gray-800 transition-colors shadow-md"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Attendance Calendar Modal */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 z-[100] flex justify-center items-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setIsAttendanceModalOpen(false)}>
          <div className="bg-[#f0f9ff] border border-blue-100 rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="p-5 flex justify-between items-center bg-white/50 border-b border-blue-100/50 shrink-0 sticky top-0 z-10">
              <div>
                <h3 className="font-extrabold text-[19px] text-gray-900 flex items-center gap-1.5"><span className="text-2xl text-blue-500">🗓️</span> 나의 명리 출석부</h3>
                <p className="text-[12px] font-bold text-gray-500 mt-0.5">꾸준함이 운명을 바꿉니다</p>
              </div>
              <button onClick={() => setIsAttendanceModalOpen(false)} className="rounded-full p-2 bg-white/80 text-gray-500 hover:bg-white transition-colors shadow-sm">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {/* Calendar Grid Mockup */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-blue-50/50">
                {/* Days of Week */}
                <div className="grid grid-cols-7 gap-1 mb-3">
                  {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                    <div key={day} className={`text-center text-[12px] font-bold ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
                      {day}
                    </div>
                  ))}
                </div>
                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const day = i + 1;
                    const isToday = day === new Date().getDate();
                    const isPast = day < new Date().getDate();

                    // Mock attendance check (random past days checked)
                    const isChecked = isPast && Math.random() > 0.3;

                    // Fixed set of animals for the mockup
                    const animals = ['🐴', '🐯', '🐰', '🐉', '🐍', '🐮'];
                    const dayAnimal = animals[day % animals.length];

                    return (
                      <div key={day} className={`aspect-[4/5] sm:aspect-square rounded-xl flex flex-col items-center justify-between p-1.5 relative ${isToday ? 'bg-blue-500 text-white shadow-md ring-2 ring-blue-300 ring-offset-1' : 'bg-gray-50 text-gray-600 border border-transparent hover:border-blue-200 transition-colors'}`}>
                        <div className="w-full flex justify-start leading-none">
                          <span className={`text-[11px] sm:text-[13px] font-bold ${isToday ? 'text-white' : 'text-gray-400'}`}>{day}</span>
                        </div>

                        <div className="flex-1 flex items-center justify-center w-full mt-0.5">
                          {isChecked ? (
                            <span className="text-[22px] sm:text-[28px] drop-shadow-sm leading-none">{dayAnimal}</span>
                          ) : isToday ? (
                            <span className="text-[18px] sm:text-[22px] animate-pulse">✨</span>
                          ) : (
                            <span className="text-[14px] sm:text-[18px] opacity-20 grayscale">{dayAnimal}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-5 bg-white shrink-0 sticky bottom-0 z-10 rounded-t-[24px] shadow-[0_-4px_20px_rgba(0,0,0,0.03)] text-center">
              <button
                onClick={() => {
                  alert("오늘의 운석(도장)이 찍혔습니다!");
                  setIsAttendanceModalOpen(false);
                }}
                className="w-full bg-[#1E90FF] text-white font-extrabold text-[17px] h-[54px] rounded-[20px] hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30 mb-2 flex flex-col items-center justify-center leading-none gap-1"
              >
                <span>오늘 출석 체크하기</span>
              </button>
              <span className="text-[12px] font-medium text-gray-400">매일 접속하여 나만의 일진 동물을 모아보세요</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Lucky Outfit Modal */}
      {isOutfitModalOpen && (
        <div className="fixed inset-0 z-[100] flex justify-center items-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setIsOutfitModalOpen(false)}>
          <div className="bg-[#fff9f0] border border-[#ffe0b2] rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffd54f]/20 rounded-bl-full filter blur-xl z-0"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#ffcc80]/20 rounded-tr-full filter blur-2xl z-0"></div>

            <div className="p-5 flex justify-between items-center bg-white/40 border-b border-[#ffe0b2]/50 shrink-0 sticky top-0 z-10">
              <div className="relative z-10">
                <h3 className="font-extrabold text-[19px] text-[#8d6e63] flex items-center gap-1.5"><span className="text-2xl">✨</span> 맞춤 행운 코디</h3>
                <p className="text-[12px] font-bold text-[#bcaaa4] mt-0.5">내 기운을 올려주는 마법의 컬러</p>
              </div>
              <button onClick={() => setIsOutfitModalOpen(false)} className="rounded-full p-2 bg-white/80 text-gray-500 hover:bg-white transition-colors shadow-sm relative z-10">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto relative z-10 flex flex-col items-center">
              {/* Daily Element Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#ffe0b2]/40 w-full mb-5 flex flex-col text-center relative overflow-hidden group">
                <div className="w-16 h-16 bg-[#27ae60]/10 rounded-full flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(39,174,96,0.15)]">
                  <span className="text-[32px] drop-shadow-md transform group-hover:scale-110 transition-transform">🌿</span>
                </div>
                <h4 className="text-[18px] font-black text-gray-900 mb-1">오늘의 기운: 푸른 목(木) 기운</h4>
                <p className="text-[14px] text-gray-600 font-medium leading-relaxed break-keep">
                  상생의 흐름을 만들어 일의 추진력을 얻기 위해 차분한 파란색 계열이나 싱그러운 그린 계열의 착장이 유리합니다.
                </p>
              </div>

              {/* Gender Specific Outfit Suggestion */}
              <div className="bg-gradient-to-br from-white to-[#fafafa] rounded-3xl p-5 shadow-sm border border-gray-100 w-full text-center">
                <div className="text-[40px] mb-3 inline-block drop-shadow-md">
                  {userGender === "male" || userGender === "M" ? "👔" : "👗"}
                </div>
                <h4 className="text-[16px] font-bold text-gray-900 mb-2">
                  {userGender === "male" || userGender === "M" ? "깔끔한 네이비 셋업 수트" : "화사한 민트/네이비 원피스"}
                </h4>
                <p className="text-[14px] text-gray-600 font-medium break-keep leading-relaxed px-2">
                  {userGender === "male" || userGender === "M"
                    ? "단정한 네이비 톤의 자켓 혹은 니트와 슬랙스 조합은 오늘 당신에게 신뢰감과 강력한 긍정적 기운을 끌어당깁니다."
                    : "부드럽고 생기 있는 민트 계열의 원피스나 네이비 톤의 아우터는 오늘 당신의 매력을 돋보이게 하고 행운을 부릅니다."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
