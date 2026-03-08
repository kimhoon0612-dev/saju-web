"use client";

import { useState, useEffect } from "react";
import { RefreshCw, ChevronRight, User, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AgenticChatbot from "@/components/AgenticChatbot";
import BirthDataForm from "@/components/BirthDataForm";

const ELEMENT_COLORS_BG: Record<string, string> = {
  "wood": "bg-[#A8D5BA] text-gray-800", // Pastel Green
  "fire": "bg-[#FFC3A0] text-gray-800", // Pastel Salmon
  "earth": "bg-[#F7D08A] text-gray-800", // Pastel Yellow
  "metal": "bg-[#E2E8F0] text-gray-800", // Light Gray
  "water": "bg-[#A2D2FF] text-gray-800", // Pastel Blue
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
  const [showSplashMode, setShowSplashMode] = useState(true);

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
      setShowSplashMode(false); // Skip splash if data exists
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
      sessionStorage.removeItem("saju_insight");
      sessionStorage.removeItem("saju_lifestages");
      sessionStorage.removeItem("saju_partner_matrix");

      // Clear any specific reading caches
      const keysToRemoveH = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith("saju_specific_")) {
          keysToRemoveH.push(key);
        }
      }
      keysToRemoveH.forEach(k => sessionStorage.removeItem(k));

      console.log("Data saved to sessionStorage. Showing dashboard...");
      setMatrixData(completeMatrix);
      setUserGender(data.gender);

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
    sessionStorage.removeItem("saju_insight");
    sessionStorage.removeItem("saju_lifestages");
    sessionStorage.removeItem("saju_partner_matrix");

    // Clear any specific reading caches
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith("saju_specific_")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => sessionStorage.removeItem(k));
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
    <div className="w-full flex flex-col min-h-screen bg-[#FDFBFA]">
      <AnimatePresence>
        {!matrixData && showSplashMode && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0B0D17] overflow-hidden cursor-pointer"
            onClick={() => setShowSplashMode(false)}
          >
            {/* Very subtle noise texture overlay for Tarot feel */}
            <div className="absolute inset-0 opacity-[0.06] mix-blend-screen pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.75\" numOctaves=\"4\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')" }}></div>

            {/* Elegant Dark Nebula Background */}
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-90 transition-opacity duration-1000">
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.4, 0.6, 0.4]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-[120vw] h-[120vw] max-w-[800px] max-h-[800px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#281B43] via-[#100918] to-transparent rounded-full blur-[80px]"
              />
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="absolute w-[100vw] h-[100vw] max-w-[600px] max-h-[600px] bg-[conic-gradient(from_0deg,_transparent_0deg,_#6B4C9A_90deg,_transparent_180deg,_#B89F65_270deg,_transparent_360deg)] opacity-10 rounded-full blur-[60px] mix-blend-screen"
              />
            </div>

            {/* Glowing Tarot Crystal/Orb Concept - Refined */}
            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 flex flex-col items-center justify-center mb-16"
            >
              <div className="w-36 h-36 md:w-44 md:h-44 relative flex items-center justify-center group">
                {/* Ethereal Glow */}
                <motion.div
                  animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-[-20px] rounded-full bg-[#8A4FFF]/30 blur-2xl"
                />

                {/* Cosmic Inner Orb - Minimal & Elegant */}
                <div className="absolute inset-0 rounded-full border-[1.5px] border-[#D4AF37]/40 shadow-[0_0_30px_rgba(212,175,55,0.15)] overflow-hidden backdrop-blur-md"
                  style={{ background: 'radial-gradient(circle at 40% 30%, rgba(212, 175, 55, 0.15), rgba(16, 10, 28, 0.8))' }}
                >
                  <motion.div
                    animate={{ rotate: [0, -360] }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-50%] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-screen"
                  />
                  {/* Subtle sweep gradient inside orb */}
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,_transparent_0deg,_rgba(255,255,255,0.1)_90deg,_transparent_180deg)]"
                  />
                </div>

                {/* Center Core element: Elegant glowing star */}
                <motion.div
                  animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.85, 1, 0.85] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 text-[#FCEEB5] drop-shadow-[0_0_12px_rgba(252,238,181,0.6)]"
                >
                  <Sparkles className="w-14 h-14 md:w-16 md:h-16" strokeWidth={1} />
                </motion.div>
              </div>
            </motion.div>

            {/* Typography - Clean, Modern Occult Feel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
              className="relative z-10 text-center flex flex-col items-center px-6"
            >
              <h2 className="text-[26px] md:text-[32px] font-extrabold text-[#F5F5F7] tracking-tight leading-[1.35] mb-6 font-pretendard drop-shadow-md">
                당신의 <span className="text-[#D4AF37] font-black drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">운명</span>이 <span className="block mt-1">궁금한가요?</span>
              </h2>

              <motion.div
                animate={{ opacity: [0.5, 1, 0.5], y: [0, 2, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="mt-6 flex flex-col items-center gap-2"
              >
                <div className="flex items-center gap-2 text-[13px] font-bold tracking-wide text-[#E2E8F0] bg-white/5 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
                  <span>화면을 탭하여 운명의 책 열기</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!matrixData ? (
        // --- FULL SCREEN ONBOARDING HERO (THEME B: CLEAN MINIMALIST) ---
        // Rendered unconditionally underneath the Splash Screen to avoid unmount flickers
        <motion.div
          className="w-full min-h-[calc(100vh-12rem)] flex flex-col items-center justify-start px-4 pt-2 pb-8 relative bg-[#FDFBFA] overflow-hidden"
        >
          {/* Subtle minimal background decoration */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#FFB199]/10 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-[20%] left-[-20%] w-[50%] h-[50%] bg-[#81C784]/10 rounded-full blur-[60px]"></div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="w-full max-w-md relative z-10 flex flex-col gap-6 pt-10"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center p-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm mb-6">
                <Sparkles className="w-8 h-8 text-[#4A5568]" strokeWidth={1.5} />
              </div>
              <h1 className="text-[28px] font-black text-[#2D3748] tracking-tight mb-3 leading-[1.3] font-pretendard">
                나를 발견하는<br />가장 조용한 시간
              </h1>
              <p className="text-gray-500 font-medium text-[15px] break-keep px-4">
                생년월일을 통해 당신의 고유한 결을 읽어냅니다.<br />자연의 흐름과 일상을 동기화하세요.
              </p>
            </div>

            <div className="w-full pb-8 mt-4 relative z-20">
              <BirthDataForm onCalculate={handleCalculate} isLoading={isLoading} buttonText="나의 매트릭스 생성" />
            </div>
          </motion.div>
        </motion.div>
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

                    <div className="text-[12px] font-bold text-gray-500 mb-3 h-[18px] flex items-center justify-center whitespace-nowrap">
                      {pillar.data?.heavenly?.ten_god || "-"}
                    </div>

                    <div className={`w-full aspect-[4/5] ${ELEMENT_COLORS_BG[pillar.data?.heavenly?.element || "earth"]} rounded-[12px] flex flex-col items-center justify-center font-bold mb-2 shadow-sm relative overflow-hidden ring-1 ring-inset ring-black/5`}>
                      <div className="text-[26px] leading-none mb-1 font-serif opacity-90">{getHanja(pillar.data?.heavenly?.label)}</div>
                      <div className="text-[9px] opacity-70 flex gap-0.5 items-center font-pretendard font-medium">
                        <span>{getHangul(pillar.data?.heavenly?.label)}</span>
                        <span>·</span>
                        <span>{ELEMENT_KOR[pillar.data?.heavenly?.element || "earth"]}</span>
                      </div>
                    </div>

                    <div className={`w-full aspect-[4/5] ${ELEMENT_COLORS_BG[pillar.data?.earthly?.element || "earth"]} rounded-[12px] flex flex-col items-center justify-center font-bold shadow-sm relative overflow-hidden mb-3 ring-1 ring-inset ring-black/5`}>
                      <div className="text-[26px] leading-none mb-1 font-serif opacity-90">{getHanja(pillar.data?.earthly?.label)}</div>
                      <div className="text-[9px] opacity-70 flex gap-0.5 items-center font-pretendard font-medium">
                        <span>{getHangul(pillar.data?.earthly?.label)}</span>
                        <span>·</span>
                        <span>{ELEMENT_KOR[pillar.data?.earthly?.element || "earth"]}</span>
                      </div>
                    </div>

                    <div className="text-[12px] font-bold text-gray-500 mb-1 min-h-[18px] whitespace-nowrap">
                      {pillar.data?.earthly?.ten_god || "-"}
                    </div>
                    <div className="text-[11px] font-medium text-gray-400 whitespace-nowrap">
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
                className="flex-1 bg-white border border-gray-100 shadow-sm rounded-2xl py-3.5 text-[15px] font-bold text-[#4A5568] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <span className="text-[18px] leading-[1]">🐾</span> 나의 출석
              </button>
              <button
                onClick={() => setIsOutfitModalOpen(true)}
                className="flex-1 bg-white border border-gray-100 shadow-sm rounded-2xl py-3.5 text-[15px] font-bold text-[#4A5568] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <span className="text-[18px] leading-[1]">👗</span> 럭키 컬러
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
                    title: "나의 핵심 기운: 일간(日干)",
                    content: `사주명리학에서 일간(日干)은 '나 자신'을 상징하는 가장 본질적인 기운이자, 평생토록 변하지 않는 내면의 코어를 의미합니다. 당신이 태어난 날의 하늘의 기운을 뜻하는 이 글자는, 당신의 잠재력, 고유한 성향, 그리고 대인관계를 맺는 방식을 결정짓습니다.\n\n당신은 [${matrixData.day_pillar?.heavenly?.element === "wood" ? "木(목) - 뻗어나가는 나무" : matrixData.day_pillar?.heavenly?.element === "fire" ? "火(화) - 타오르는 불꽃" : matrixData.day_pillar?.heavenly?.element === "earth" ? "土(토) - 품어주는 대지" : matrixData.day_pillar?.heavenly?.element === "metal" ? "金(금) - 단단한 바위나 보석" : "水(수) - 흐르는 강물이나 바다"}]의 에너지를 품고 태어났습니다. ${matrixData.day_pillar?.heavenly?.element === "wood" ? "이는 곧게 위로 성장하려는 진취력, 어떤 역경에도 꺾이지 않고 봄을 향해 나아가는 생명력을 상징합니다. 남을 보살피는 어진 마음(仁)이 기본 바탕에 깔려 있으며, 창도적이고 미래 지향적인 리더십을 발휘할 때 가장 큰 빛을 발합니다." : matrixData.day_pillar?.heavenly?.element === "fire" ? "이는 세상에 빛과 열기를 전하는 뜨거운 열정, 예의(禮)를 중시하며 언제나 솔직 담백하게 자신을 드러내는 성향을 상징합니다. 예술적 감각이 뛰어나고, 주변 사람들에게 영감을 주며, 무언가를 폭발적으로 시작해내는 에너지가 가장 매력적인 장점입니다." : matrixData.day_pillar?.heavenly?.element === "earth" ? "이는 만물을 길러내고 포용하는 넓은 대지와 같습니다. 묵묵히 중심을 지키고 다른 기운들이 조화를 이루도록 돕는 중재자 역할을 하며, 신의(信)와 균형 감각이 뛰어납니다. 쉽게 흔들리지 않는 든든함으로 주변 사람들의 절대적인 신뢰를 끄는 힘이 있습니다." : matrixData.day_pillar?.heavenly?.element === "metal" ? "이는 세월 속에 다듬어진 단단한 쇠나 제련된 보석을 의미합니다. 옳고 그름을 명확히 하는 결단력과 정의(義), 그리고 본사물의 핵심을 파악하는 분석력이 탁월합니다. 겉으로는 차가워 보일 수 있으나 한번 맺은 인연에 대해서는 무서운 의리를 보여주는 외유내강의 전형입니다." : "이는 쉼 없이 아래로 흐르며 생명을 이어나가는 지혜(智)와 유연함을 뜻합니다. 어떠한 형태의 그릇에 담겨도 스스로 모양을 바꾸듯 타인에 대한 공감 능력과 환경 적응력이 타의 추종을 불허합니다. 깊은 사유와 자유로운 사고방식이 성공의 가장 큰 열쇠가 됩니다."}\n\n이 작은 글자 하나가 당신이 세상과 소통하는 창문이 됩니다. 내 안의 기운을 스스로 사랑하고 긍정할 때, 운명의 주도권을 쥘 수 있습니다.`
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
                    title: "에너지의 중심: 신강/신약",
                    content: `명리학에서 말하는 '신강(身強)'과 '신약(身弱)'은 체력적인 강함이 절대 아닙니다. 이는 내가 타고난 본질의 기운(일간)을 돕는 주변 환경이나 에너지가 내 사주 내에 얼마나 많이 포진되어 있는가를 나타내는 저울과 같습니다.\n\n당신의 사주는 **[${sajuStrength}]**의 형태를 띠고 있습니다.\n\n${sajuStrength === "신강(身強)"
                      ? "신강한 사주는 자아와 줏대가 매우 뚜렷하여 어떠한 풍파가 닥쳐도 자신만의 길을 뚫고 나가는 강인한 멘탈과 불도저 같은 추진력을 상징합니다. 독립심이 강해 타인에게 기대기보다는 스스로 성취를 이루는 것을 선호합니다. 때로는 아집으로 비춰질 수 있으므로, 넘치는 에너지를 타인을 포용하고 돕는 데(식상, 재성, 관성의 기운) 사용하거나 밖으로 발산하는 취미를 가졌을 때 인생의 밸런스가 황금비율을 이루며 크게 발복합니다."
                      : "신약한 사주는 딱딱한 참나무라기보다는 바람에 유연하게 휘어지는 대나무와 같습니다. 날카로운 감수성과 탁월한 처세술, 주변 사람들과 환경에 물 흐르듯 적응하는 친화력이 최대 강점입니다. 거친 세상 속에서도 타인의 힘을 빌리고 협력하여 거대한 결과를 이끌어내는 팀 플레이어이자 전략가입니다. 스스로 결정의 무게를 온전히 짊어지기보다는, 지식과 자격증(인성)을 갖추거나 믿을 수 있는 동료(비겁)와 결속할 때 폭발적인 시너지가 창출됩니다."}\n\n신강과 신약은 결코 좋고 나쁨의 우열이 아닙니다. 자동차에 비유하자면 사륜구동 SUV(신강)냐, 속도와 코너링에 특화된 스포츠카(신약)냐의 차이일 뿐입니다. 내 몸통의 특성을 명확히 이해하고, 나에게 맞는 도로(직업, 환경)를 선택하는 것이 개운(開運)의 첫걸음입니다.`
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
                    title: "오행의 교향곡: 선천적 기운 분포",
                    content: `우주 만물은 목(木), 화(火), 토(土), 금(金), 수(水) 다섯 가지 에너지의 상호작용으로 이루어집니다. 당신의 태어난 생년월일시 여덟 글자(팔자)는 이 5대 기운의 특별한 바코드이자, 평생 변하지 않는 나의 선천적 재능 스탯표입니다.\n\n▶ 당신의 오행 성적부:\n🌿 목(木): ${elementCounts["목"]}개 - 기획력, 창조성, 인자함\n🔥 화(火): ${elementCounts["화"]}개 - 열정, 표현력, 화려함\n🪨 토(土): ${elementCounts["토"]}개 - 포용력, 신용, 중재 능력\n🪓 금(金): ${elementCounts["금"]}개 - 결단력, 분석, 강직함\n💧 수(水): ${elementCounts["수"]}개 - 유연성, 지혜, 수용력\n\n특정 오행이 3개 이상이라면 그 기운이 내 삶을 강하게 주도하는 무기가 되지만, 너무 지나치면 오히려 해당 기운의 부정적 단점(예: 나무가 너무 빽빽해 자라지 못함)이 발현될 가능성도 담고 있습니다.\n\n사주의 핵심은 **중용(中庸)**입니다. 그래프에서 유난히 뾰족하게 튀어나온(과도한) 에너지는 사회적 활동이나 승화(운동, 기부 등)를 통해 기운을 설기(빼내기)해 주어야 합니다. 반대로 전혀 없거나 1개 이하로 부족하여 움푹 패인 오행 부위는, 행운 코디 추천 색상의 의류를 입어 보완하거나 그 오행이 상징하는 행동 기질(예: 수가 부족하다면 유연하고 양보하는 태도 등)을 의식적으로 습관화하여 보완할 때 내 삶의 흐름이 막힘없이 둥글고 원만하게 돌아가게 됩니다.`
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
          <div className="bg-white rounded-t-[32px] sm:rounded-[28px] w-full max-w-sm overflow-hidden shadow-2xl relative flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-5 duration-300 max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="p-6 pt-8 pb-4 flex flex-col items-center border-b border-gray-100 shrink-0 sticky top-0 bg-white z-10">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mb-6 absolute top-3 sm:hidden"></div>
              <h3 className="font-extrabold text-[22px] text-gray-900 mb-2">{elementDetailModal.title}</h3>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="text-[15px] text-gray-700 leading-[1.8] font-medium break-keep">
                {elementDetailModal.content.split('\n').map((line, i) => (
                  <p key={i} className={line.trim() === '' ? 'h-4' : 'mb-1'}>
                    {line.includes('**') ? (
                      // Simple bold parser for **text**
                      line.split(/(\*\*.*?\*\*)/).map((part, j) =>
                        part.startsWith('**') && part.endsWith('**')
                          ? <strong key={j} className="text-gray-900 font-extrabold">{part.slice(2, -2)}</strong>
                          : part
                      )
                    ) : (
                      line
                    )}
                  </p>
                ))}
              </div>
            </div>

            <div className="p-5 w-full shrink-0 sticky bottom-0 bg-white border-t border-gray-50">
              <button
                onClick={() => setElementDetailModal({ ...elementDetailModal, isOpen: false })}
                className="w-full bg-[#4A5568] text-white font-bold text-[16px] h-[52px] rounded-2xl hover:bg-[#2D3748] transition-colors shadow-sm"
              >
                확인 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Attendance Calendar Modal (Minimalist) */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 z-[100] flex justify-center items-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setIsAttendanceModalOpen(false)}>
          <div className="bg-[#FDFBFA] border border-gray-100 rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="p-5 flex justify-between items-center bg-white border-b border-gray-100 shrink-0 sticky top-0 z-10">
              <div>
                <h3 className="font-extrabold text-[19px] text-gray-900 flex items-center gap-1.5"><span className="text-2xl">🌿</span> 나의 명리 출석</h3>
                <p className="text-[12px] font-bold text-gray-500 mt-0.5">매일 조금씩 쌓이는 운의 흐름</p>
              </div>
              <button onClick={() => setIsAttendanceModalOpen(false)} className="rounded-full p-2 bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors shadow-sm">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                <div className="grid grid-cols-7 gap-1 mb-3">
                  {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                    <div key={day} className={`text-center text-[12px] font-bold ${i === 0 ? 'text-[#FFB199]' : i === 6 ? 'text-[#A2D2FF]' : 'text-gray-400'}`}>
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const day = i + 1;
                    const isToday = day === new Date().getDate();
                    const isPast = day < new Date().getDate();
                    const isChecked = isPast && Math.random() > 0.3;
                    const markers = ['🌱', '🌿', '🍀', '🍃', '🪴'];
                    const dayMarker = markers[day % markers.length];

                    return (
                      <div key={day} className={`aspect-[4/5] sm:aspect-square rounded-xl flex flex-col items-center justify-between p-1.5 relative ${isToday ? 'bg-[#81C784] text-white shadow-sm ring-1 ring-[#81C784] ring-offset-1' : 'bg-[#FDFBFA] text-gray-600 border border-transparent hover:border-gray-200 transition-colors'}`}>
                        <div className="w-full flex justify-start leading-none">
                          <span className={`text-[11px] sm:text-[13px] font-bold ${isToday ? 'text-white' : 'text-gray-400'}`}>{day}</span>
                        </div>
                        <div className="flex-1 flex items-center justify-center w-full mt-0.5">
                          {isChecked ? (
                            <span className="text-[22px] sm:text-[28px] drop-shadow-sm leading-none">{dayMarker}</span>
                          ) : isToday ? (
                            <span className="text-[18px] sm:text-[22px] animate-pulse">✨</span>
                          ) : (
                            <span className="text-[14px] sm:text-[18px] opacity-20 grayscale">{dayMarker}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-5 bg-white shrink-0 sticky bottom-0 z-10 rounded-t-[24px] border-t border-gray-100 text-center">
              <button
                onClick={() => {
                  alert("출석이 확인되었습니다!");
                  setIsAttendanceModalOpen(false);
                }}
                className="w-full bg-[#4A5568] text-white font-extrabold text-[17px] h-[54px] rounded-2xl hover:bg-[#2D3748] transition-colors shadow-sm mb-2 flex items-center justify-center leading-none"
              >
                <span>오늘 출석 체크</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Lucky Outfit Modal (Minimalist) */}
      {isOutfitModalOpen && (
        <div className="fixed inset-0 z-[100] flex justify-center items-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setIsOutfitModalOpen(false)}>
          <div className="bg-[#FDFBFA] border border-gray-100 rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl relative flex flex-col animate-in zoom-in-95 duration-300 max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFB199]/10 rounded-bl-full filter blur-xl z-0"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#81C784]/10 rounded-tr-full filter blur-2xl z-0"></div>

            <div className="p-5 flex justify-between items-center bg-white/50 border-b border-gray-100 shrink-0 sticky top-0 z-10">
              <div className="relative z-10">
                <h3 className="font-extrabold text-[19px] text-[#4A5568] flex items-center gap-1.5"><span className="text-2xl">✨</span> 퍼스널 럭키 컬러</h3>
                <p className="text-[12px] font-bold text-gray-500 mt-0.5">나의 부족한 기운을 채워보세요</p>
              </div>
              <button onClick={() => setIsOutfitModalOpen(false)} className="rounded-full p-2 bg-white/80 text-gray-400 hover:bg-gray-100 transition-colors shadow-sm relative z-10">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto relative z-10 flex flex-col items-center">
              {/* Daily Element Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 w-full mb-5 flex flex-col text-center relative overflow-hidden group">
                <div className="w-16 h-16 bg-[#F7F5F2] rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <span className="text-[32px] drop-shadow-sm transform group-hover:scale-110 transition-transform">🌿</span>
                </div>
                <h4 className="text-[18px] font-black text-gray-900 mb-1">오늘의 보완 기운: 부드러운 목(木)</h4>
                <p className="text-[14px] text-gray-600 font-medium leading-relaxed break-keep">
                  상생의 흐름을 만들어 일의 추진력을 얻기 위해 차분한 파란색 계열이나 싱그러운 그린 계열의 착장이 유리합니다.
                </p>
              </div>

              {/* Gender Specific Outfit Suggestion */}
              <div className="bg-gradient-to-br from-white to-[#F9FAFB] rounded-3xl p-5 shadow-sm border border-gray-100 w-full text-center">
                <div className="text-[40px] mb-3 inline-block drop-shadow-sm opacity-80">
                  {userGender === "male" || userGender === "M" ? "👕" : "👗"}
                </div>
                <h4 className="text-[16px] font-bold text-gray-900 mb-2">
                  {userGender === "male" || userGender === "M" ? "차분한 네이비 셋업" : "소프트 민트 블라우스/원피스"}
                </h4>
                <p className="text-[14px] text-gray-500 font-medium break-keep leading-relaxed px-2">
                  {userGender === "male" || userGender === "M"
                    ? "깔끔한 네이비 톤의 자켓 혹은 니트는 오늘 당신에게 신뢰감과 강력한 긍정적 기운을 끌어당깁니다."
                    : "부드럽고 생기 있는 민트 계열의 원피스나 네이비 톤의 아우터는 오늘 당신의 매력을 돋보이게 합니다."
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
