"use client";

import { useState, useEffect } from "react";
import { RefreshCw, ChevronRight, User, Sparkles } from "lucide-react";
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
    if (stored) {
      setMatrixData(JSON.parse(stored));
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

          {/* Top Title & Weather */}
          <div className="flex items-center justify-between px-4 pt-4 pb-5">
            <div className="flex items-center gap-2">
              <span className="text-[26px]">☁️</span>
              <div className="flex flex-col">
                <span className="text-[15px] font-black text-gray-900 leading-none mb-0.5">18°C 구름많음</span>
                <span className="text-[12px] font-bold text-[#2AC1BC] leading-none tracking-tight">미세 좋음 · 초미세 좋음</span>
              </div>
            </div>
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
            <div className="flex flex-wrap items-center justify-center gap-2.5 px-3">
              <button className="bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] rounded-full px-4 py-2 text-[14px] font-bold text-gray-800 flex items-center gap-1.5 whitespace-nowrap">👀 심리풀이</button>
              <button className="bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] rounded-full px-4 py-2 text-[14px] font-bold text-gray-800 flex items-center gap-1.5 whitespace-nowrap"><span className="text-blue-500 text-[16px] leading-[1]">👣</span> 출석체크</button>
              <Link href="/saju" className="bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] rounded-full px-5 py-2.5 text-[14px] font-bold text-gray-800 whitespace-nowrap">정통사주</Link>
              <button className="bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] rounded-full px-5 py-2.5 text-[14px] font-bold text-gray-800 whitespace-nowrap">신년운</button>
              <button className="bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] rounded-full px-5 py-2.5 text-[14px] font-bold text-gray-800 whitespace-nowrap">행운코디</button>
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

                <Link href="/saju" className="mt-8 mb-2 text-[15px] font-bold text-gray-900 flex items-center gap-1 hover:text-gray-600 transition-colors">
                  오늘 하루 자세히 보기 <ChevronRight className="w-4 h-4 ml-0.5" />
                </Link>
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
                <div>
                  <h3 className="text-[17px] font-black text-gray-900 mb-1.5 flex items-center gap-0.5">나의 일간: {matrixData.day_pillar?.heavenly?.label || "알 수 없음"} <ChevronRight className="w-[18px] h-[18px] text-gray-400 translate-y-[0.5px]" /></h3>
                  <p className="text-[15px] text-gray-600 font-bold leading-[1.6] break-keep">
                    사주의 중심이 되는 기운입니다. {matrixData.day_pillar?.heavenly?.element === "wood" ? "나무처럼 곧고 성장하려는 본질적인 성향을" : matrixData.day_pillar?.heavenly?.element === "fire" ? "불처럼 열정적이고 밝은 본질적인 성향을" : matrixData.day_pillar?.heavenly?.element === "earth" ? "흙처럼 포용력 있고 길러내는 본질적인 성향을" : matrixData.day_pillar?.heavenly?.element === "metal" ? "쇠처럼 단단하고 결단력 있는 본질적인 성향을" : "물처럼 유연하고 지혜로운 본질적인 성향을"} 가지고 있습니다.
                  </p>
                </div>
                <div>
                  <h3 className="text-[17px] font-black text-gray-900 mb-1.5 flex items-center gap-0.5">신강/신약 판별 <ChevronRight className="w-[18px] h-[18px] text-gray-400 translate-y-[0.5px]" /></h3>
                  <p className="text-[15px] text-gray-600 font-bold leading-[1.6] break-keep">
                    {sajuStrength} 체질입니다. 일간을 도와주는 세력이 내 기운을 어떻게 지탱하는지 분석했습니다.
                  </p>
                </div>
                <div>
                  <h3 className="text-[17px] font-black text-gray-900 mb-1.5 flex items-center gap-0.5">선천적 기운 분포 <ChevronRight className="w-[18px] h-[18px] text-gray-400 translate-y-[0.5px]" /></h3>
                  <p className="text-[15px] text-gray-600 font-bold leading-[1.6] break-keep">
                    {matrixData ? `목(${elementCounts["목"]}), 화(${elementCounts["화"]}), 토(${elementCounts["토"]}), 금(${elementCounts["금"]}), 수(${elementCounts["수"]})` : "음양오행"}로 이루어져 있습니다. 위 그래프를 통해 본인의 오행 밸런스를 확인해 보세요. 중심의 기운과 상생상극을 확인하면 삶의 밸런스가 더욱 단단해집니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </motion.div>
      )}

    </div>
  );
}
