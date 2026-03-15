"use client";

import { useState, useEffect, useRef } from "react";
import { RefreshCw, ChevronRight, User, Sparkles, X, Dices, FileBadge, CalendarCheck, Camera, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AgenticChatbot from "@/components/AgenticChatbot";
import BirthDataForm from "@/components/BirthDataForm";
import UserBadge from "@/components/UserBadge";


const ELEMENT_KOR: Record<string, string> = {
  "wood": "목", "fire": "화", "earth": "토", "metal": "금", "water": "수"
};

// Helper for the minimalist icon style
const SpotIcon = ({ emoji, hasBadge = false }: { emoji?: string, icon?: any, hasBadge?: boolean }) => (
  <div className="relative w-[46px] h-[46px] flex items-center justify-center">
    {/* Soft Pastel Spot Background */}
    <div className="absolute w-[24px] h-[24px] bg-[#E2E8F0] rounded-full bottom-0 right-1 translate-x-1/4 translate-y-1/4"></div>
    {emoji ? (
      <span className="relative z-10 text-[26px] drop-shadow-sm">{emoji}</span>
    ) : null}
    {hasBadge && (
      <span className="absolute top-0 right-[-2px] text-[10px] font-bold text-white bg-[#FFB199] rounded-full leading-none z-20 px-1 shadow-sm">N</span>
    )}
  </div>
);

// Helper for pure circle line icon (Emoji version)
const CircleIcon = ({ emoji, bgColor = "bg-[#FDFBFA]" }: { emoji: string, bgColor?: string }) => (
  <div className={`w-[48px] h-[48px] rounded-full flex items-center justify-center border border-gray-100 ${bgColor} shadow-sm shrink-0`}>
    <span className="text-[24px]">{emoji}</span>
  </div>
);


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

  // Modal States
  const [showLotto, setShowLotto] = useState(false);
  const [lottoNumbers, setLottoNumbers] = useState<number[]>([]);

  const [showMoving, setShowMoving] = useState(false);
  const [movingYear, setMovingYear] = useState(new Date().getFullYear());
  const [movingMonth, setMovingMonth] = useState(new Date().getMonth() + 1);

  const [showTalisman, setShowTalisman] = useState(false);
  const [talismanResults, setTalismanResults] = useState<{ type: string, title: string, desc: string }[]>([]);

  const [showFace, setShowFace] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [faceResult, setFaceResult] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Palmistry States
  const [showPalm, setShowPalm] = useState(false);
  const [isAnalyzingPalm, setIsAnalyzingPalm] = useState(false);
  const [palmResult, setPalmResult] = useState<any>(null);
  const palmInputRef = useRef<HTMLInputElement>(null);

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

  // 1. Lotto Logic
  const handleLotto = () => {
    const nums = new Set<number>();
    while (nums.size < 6) {
      nums.add(Math.floor(Math.random() * 45) + 1);
    }
    setLottoNumbers(Array.from(nums).sort((a, b) => a - b));
    setShowLotto(true);
  };

  // 3. Talisman Logic (Multiple)
  const handleTalisman = () => {
    const results = [];
    // Base wealth talisman is always good to have
    results.push({
      type: "wealth",
      title: "재물 넉넉 부적",
      desc: "뜻밖의 금전운이 따르고 지출이 줄어드는 강력한 재물 부적입니다."
    });

    if (matrixData && matrixData.month_pillar) {
      const mg = matrixData.month_pillar.earthly.ten_god || "";
      if (mg.includes("관성")) {
        results.push({
          type: "career",
          title: "직장 탄탄 부적",
          desc: "직장에서 능력을 인정받고 승진이나 이직 운을 틔워주는 부적입니다."
        });
      } else if (mg.includes("인성")) {
        results.push({
          type: "health",
          title: "무병 무탈 부적",
          desc: "잔병치레를 막아주고 몸과 마음의 평온을 지켜주는 건강 부적입니다."
        });
      } else if (mg.includes("비겁")) {
        results.push({
          type: "love",
          title: "애정 만발 부적",
          desc: "주변 인연이 좋아지고 좋은 짝을 찾아주는 사랑 부적입니다."
        });
      }
    }

    // Add a secondary default if only one was added
    if (results.length === 1) {
      results.push({
        type: "health",
        title: "무병 무탈 부적",
        desc: "올 한해 잔병치레를 막아주고 당신의 체력을 든든하게 지켜줍니다."
      });
      results.push({
        type: "love",
        title: "애정 만발 부적",
        desc: "어디를 가나 사람들에게 호감을 얻고 따뜻한 인연을 맺게 돕습니다."
      });
    } else if (results.length === 2) {
      results.push({
        type: "love",
        title: "귀인 상봉 부적",
        desc: "조용히 나를 돕는 귀인이 나타나 위기를 기회로 바꿔주는 신비한 부적입니다."
      });
    }

    setTalismanResults(results);
    setShowTalisman(true);
  };

  // 4. Moving Logic
  const getMovingDates = () => {
    const dates = [];
    // 지정된 연/월의 1일부터 말일까지 순회하며 일자가 9, 0으로 끝나는 날짜 수집
    const daysInMonth = new Date(movingYear, movingMonth, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = day.toString();
      if (dayStr.endsWith("9") || dayStr.endsWith("0")) {
        // 요일 계산
        const objDate = new Date(movingYear, movingMonth - 1, day);
        const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
        const weekDay = daysOfWeek[objDate.getDay()];
        dates.push(`${movingMonth}월 ${day}일 (${weekDay})`);
      }
    }
    // 최근 날짜순이므로 전체 다 보여주거나 적절히 자름 (보통 한 달에 5~6개 정도)
    return dates;
  };

  // 5. Face Reading Logic
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setShowFace(true);
    setIsAnalyzing(true);
    setFaceResult("");

    // Resize the image using HTML Canvas to prevent mobile browser crashes from large base64 strings
    const MAX_WIDTH = 600;
    const MAX_HEIGHT = 600;

    const img = new Image();
    img.onerror = () => {
      setFaceResult("이미지를 불러오는데 실패했습니다.");
      setIsAnalyzing(false);
    };

    // Use Object URL instead of Base64 FileReader to prevent mobile browser OOM crash
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      // Clean up the object URL to free memory immediately
      URL.revokeObjectURL(objectUrl);

      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round((height *= MAX_WIDTH / width));
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = Math.round((width *= MAX_HEIGHT / height));
          height = MAX_HEIGHT;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        setFaceResult("이미지 처리 중 오류가 발생했습니다.");
        setIsAnalyzing(false);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Compress as JPEG
      const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://saju-web.onrender.com";
        const res = await fetch(`${API_BASE}/api/physiognomy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_base64: compressedBase64 })
        });

        if (res.ok) {
          const data = await res.json();
          setFaceResult(data.result);
        } else {
          setFaceResult("AI 분석 서버와 연결이 원활하지 않습니다. 다시 시도해 주세요.");
        }
      } catch (err) {
        setFaceResult("분석 중 오류가 발생했습니다.");
      } finally {
        setIsAnalyzing(false);
      }
    };

    img.src = objectUrl;
  };

  // 6. Palm Reading Logic
  const handlePalmUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setShowPalm(true);
    setIsAnalyzingPalm(true);
    setPalmResult(null);

    const MAX_WIDTH = 600;
    const MAX_HEIGHT = 600;

    const img = new Image();
    img.onerror = () => {
      setPalmResult("이미지를 불러오는데 실패했습니다.");
      setIsAnalyzingPalm(false);
    };

    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round((height *= MAX_WIDTH / width));
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = Math.round((width *= MAX_HEIGHT / height));
          height = MAX_HEIGHT;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        setPalmResult("이미지 처리 중 오류가 발생했습니다.");
        setIsAnalyzingPalm(false);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://saju-web.onrender.com";
        const res = await fetch(`${API_BASE}/api/palmistry`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_base64: compressedBase64 })
        });

        if (res.ok) {
          const data = await res.json();
          setPalmResult(data);
        } else {
          setPalmResult({ error: "AI 분석 서버와 연결이 원활하지 않습니다. 다시 시도해 주세요." });
        }
      } catch (err) {
        setPalmResult({ error: "분석 중 오류가 발생했습니다." });
      } finally {
        setIsAnalyzingPalm(false);
      }
    };

    img.src = objectUrl;
  };

  // Check if we have matrix data in sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("saju_matrix");
    const storedUserInfo = sessionStorage.getItem("saju_user_info");

    if (stored) {
      setMatrixData(JSON.parse(stored));
      setShowSplashMode(false); // Skip splash if data exists
    } else {
      router.push("/");
    }

    if (storedUserInfo) {
      try {
        const parsed = JSON.parse(storedUserInfo);
        if (parsed.gender) setUserGender(parsed.gender);
      } catch (e) { }
    }

    setIsInitializing(false);
  }, [router]);

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

      // Scroll to top of the matrix dashboard
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 50);

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
  const handleSplashClick = () => {
    if (!showSplashMode) return;
    setShowSplashMode(false);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#F5F6F8] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-t-[3px] border-r-[3px] border-gray-300 border-solid animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-screen bg-[#FDFBFA]">
      {
        matrixData && (
          // --- MAIN HOME DASHBOARD AFTER LOGIN ---
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-md mx-auto relative z-10 w-full pb-36 bg-[#F5F6F8]"
          >

            {/* Header */}
            <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 h-14 max-w-md mx-auto flex items-center px-5 justify-between border-b border-gray-50">
              <h1 className="text-xl font-extrabold text-[#4A5568]">투데이</h1>
              <UserBadge onClick={clearMatrix} />
            </header>

            <div className="px-4 pt-3 pb-4">
              {/* Animated Ad Banner Placeholder */}
              <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 rounded-[24px] relative overflow-hidden h-40 flex items-center justify-center border border-gray-100 shadow-sm">
                {/* Background decorative elements */}
                <div className="absolute inset-0 opacity-40">
                  <div className="absolute top-4 left-4 w-16 h-16 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                  <div className="absolute bottom-4 right-4 w-20 h-20 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                {/* Animated animals layer */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute -bottom-2 left-10 text-3xl animate-[bounce_3s_ease-in-out_infinite]">🐶</div>
                  <div className="absolute bottom-2 right-16 text-2xl animate-[bounce_2.5s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }}>🐰</div>
                  <div className="absolute top-6 left-1/4 text-2xl animate-[bounce_4s_ease-in-out_infinite]" style={{ animationDelay: '1.2s' }}>🐱</div>
                  <div className="absolute top-10 right-1/4 text-4xl animate-[pulse_3s_ease-in-out_infinite] origin-bottom -rotate-12">🦒</div>
                  <div className="absolute bottom-4 left-1/3 text-2xl animate-[bounce_2.8s_ease-in-out_infinite]" style={{ animationDelay: '1.8s' }}>🐼</div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-sm border border-white/50 text-center mx-4">
                  <span className="inline-block bg-indigo-100 text-indigo-700 text-[10px] font-black px-2.5 py-1 rounded-full mb-2 tracking-wide">
                    NOTICE
                  </span>
                  <h2 className="text-[18px] font-black text-gray-900 leading-[1.3] tracking-tight mb-1">
                    광고 오픈 준비 중입니다
                  </h2>
                  <p className="text-[13px] font-bold text-gray-600">
                    동물 친구들이 공간을 꾸미고 있어요! 🐾
                  </p>
                </div>

                {/* Pagination Dots (Decorative) */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-200"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-200"></div>
                </div>
              </div>
            </div>

            {/* Today's Summary Card and Daily Hub */}
            <div className="px-4 flex flex-col gap-4 pb-12">
              <div className="bg-white rounded-[32px] p-6 pt-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-50 overflow-hidden relative">
                <div className="text-[13px] text-gray-400 font-bold mb-1 tracking-wide">오늘의 운세</div>
                <h2 className="text-[24px] font-black tracking-tight text-gray-900 mb-8">{matrixData.user_name || "방문자"}님의 하루 요약</h2>

                {/* Wave Graph Area -> Modern Radial Dial */}
                <div className="flex flex-col items-center justify-center mt-4 mb-8">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    {/* Background glow */}
                    <div className="absolute inset-0 bg-[#2AC1BC]/10 rounded-full blur-2xl flex items-center justify-center animate-pulse"></div>
                    
                    {/* Outer static ring */}
                    <svg className="w-full h-full -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#F1F3F5" strokeWidth="8" />
                      {/* Dynamic progress ring */}
                      <circle 
                        cx="50" cy="50" r="45" 
                        fill="none" 
                        stroke="url(#gradientDial)" 
                        strokeWidth="8" 
                        strokeLinecap="round" 
                        strokeDasharray="282.7" 
                        strokeDashoffset={282.7 - (282.7 * parseInt(String(dailyScore))) / 100}
                        className="transition-all duration-1500 ease-out"
                      />
                      <defs>
                        <linearGradient id="gradientDial" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#48CAE4" />
                          <stop offset="100%" stopColor="#2AC1BC" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Inner Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-1">SCORE</span>
                      <div className="flex items-start">
                        <span className="text-[46px] font-black text-gray-900 leading-none tracking-tighter">{dailyScore}</span>
                        <span className="text-[16px] font-bold text-gray-400 mt-1 ml-0.5">점</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center text-center mt-6 z-20 relative">
                    <p className="text-[17px] font-bold text-gray-800 leading-snug w-full px-2 break-keep mt-2">
                        {matrixData.daily_fortune?.description || "문을 두드리면 반드시 열리는 하루입니다."}
                    </p>

                    <button onClick={() => setIsDailyModalOpen(true)} className="mt-8 mb-2 text-[15px] font-bold text-gray-900 flex items-center gap-1 hover:text-gray-600 transition-colors">
                        오늘 하루 자세히 보기 <ChevronRight className="w-4 h-4 ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Daily/Fun Hub injected from saju/page.tsx */}
              <section className="bg-white rounded-[32px] p-6 pt-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col gap-6">
                <div>
                  <div className="text-[13px] text-gray-400 font-bold mb-1 tracking-wide">매일매일 가볍게!</div>
                  <h2 className="text-[24px] font-black tracking-tight text-gray-900 mb-6">데일리 운세 & 즐길거리</h2>
                </div>

                {/* 데일리 기운 (Grid) */}
                <div className="grid grid-cols-4 gap-y-7 gap-x-2">
                  <Link href="/saju/confirm?type=오늘의운세" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                    <SpotIcon emoji="🐣" />
                    <span className="text-[13px] font-bold text-gray-700 tracking-tight">오늘의 기운</span>
                  </Link>
                  <Link href="/saju/confirm?type=내일의운세" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                    <SpotIcon emoji="🦉" />
                    <span className="text-[13px] font-bold text-gray-700 tracking-tight">내일의 기운</span>
                  </Link>
                  <Link href="/saju/confirm?type=지정일 운세" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                    <SpotIcon emoji="🦄" />
                    <span className="text-[13px] font-bold text-gray-700 tracking-tight">지정일 기운</span>
                  </Link>
                  <Link href="/saju/confirm?type=타인과의 궁합" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                    <SpotIcon emoji="🐰" />
                    <span className="text-[13px] font-bold text-gray-700 tracking-tight">궁합</span>
                  </Link>
                </div>

                {/* 행운 팁 (List) */}
                <div className="flex flex-col gap-6 pt-4 border-t border-gray-50">
                  <div onClick={handleLotto} className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-opacity">
                    <CircleIcon emoji="🐷" />
                    <div className="flex flex-col">
                      <h3 className="text-[16px] font-black text-[#4A5568]">퍼스널 행운 번호</h3>
                      <p className="text-[13px] text-gray-400 mt-0.5 font-medium">나만의 시그니처 넘버 6개</p>
                    </div>
                  </div>
                  <div onClick={handleTalisman} className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-opacity">
                    <CircleIcon emoji="🐢" />
                    <div className="flex flex-col">
                      <h3 className="text-[16px] font-black text-[#4A5568]">에너지 부스터</h3>
                      <p className="text-[13px] text-gray-400 mt-0.5 font-medium">지금 내게 필요한 맞춤형 부적 추천</p>
                    </div>
                  </div>
                  <div onClick={() => setShowMoving(true)} className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-opacity">
                    <CircleIcon emoji="🐌" />
                    <div className="flex flex-col">
                      <h3 className="text-[16px] font-black text-[#4A5568]">캘린더 매니징</h3>
                      <p className="text-[13px] text-gray-400 mt-0.5 font-medium">이사/중요 일정 등 길일 찾기</p>
                    </div>
                  </div>
                  <div onClick={() => setIsOutfitModalOpen(true)} className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-opacity">
                    <CircleIcon emoji="👗" />
                    <div className="flex flex-col">
                      <h3 className="text-[16px] font-black text-[#4A5568]">럭키 컬러</h3>
                      <p className="text-[13px] text-gray-400 mt-0.5 font-medium">나만의 행운의 아이템 매칭</p>
                    </div>
                  </div>
                  <div onClick={() => fileInputRef.current?.click()} className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-opacity">
                    <CircleIcon emoji="🦊" />
                    <div className="flex flex-col">
                      <h3 className="text-[16px] font-black text-[#4A5568]">나의 관상</h3>
                      <p className="text-[13px] text-gray-400 mt-0.5 font-medium">AI가 분석하는 첫인상과 이미지</p>
                    </div>
                    <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handlePhotoUpload} />
                  </div>
                  <div onClick={() => palmInputRef.current?.click()} className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-opacity">
                    <CircleIcon emoji="🖐️" />
                    <div className="flex flex-col">
                      <h3 className="text-[16px] font-black text-[#4A5568]">나의 손금</h3>
                      <p className="text-[13px] text-gray-400 mt-0.5 font-medium">손바닥에 그려진 나의 길흉화복</p>
                    </div>
                    <input type="file" accept="image/*" ref={palmInputRef} className="hidden" onChange={handlePalmUpload} />
                  </div>
                </div>
              </section>
            </div>

          </motion.div>
        )
      }

      {/* Daily Fortune Detail Modal */}
      {
        isDailyModalOpen && matrixData && (
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
        )
      }

      {/* 1. Element Detail Modal */}
      {
        elementDetailModal.isOpen && (
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
        )
      }

      {/* 2. Attendance Calendar Modal (Minimalist) */}
      {
        isAttendanceModalOpen && (
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
        )
      }

      {/* 3. Lucky Outfit Modal (Minimalist) */}
      {
        isOutfitModalOpen && (
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
        )
      }

      {/* Face Reading Modal */}
      {showFace && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowFace(false)}>
          <div className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl relative text-center flex flex-col items-center animate-scale-in" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowFace(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-800 transition-colors"><X size={24} /></button>
            
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-[32px]">🦊</span>
            </div>
            
            <h3 className="text-[22px] font-black text-gray-900 mb-2">AI 관상 분석</h3>
            
            {isAnalyzing ? (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-[15px] font-bold text-gray-600">명리학 기반으로<br/>얼굴에 담긴 기운을 분석하는 중입니다...</p>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-4">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-left max-h-[50vh] overflow-y-auto">
                  <p className="text-[15px] text-gray-800 leading-relaxed font-medium break-keep whitespace-pre-wrap">{faceResult}</p>
                </div>
                <button onClick={() => setShowFace(false)} className="w-full bg-gray-900 text-white font-bold text-[16px] h-[52px] rounded-2xl hover:bg-gray-800 transition-colors">
                  확인 완료
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Palmistry Modal */}
      {showPalm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowPalm(false)}>
          <div className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl relative text-center flex flex-col items-center animate-scale-in" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowPalm(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-800 transition-colors"><X size={24} /></button>
            
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-[32px]">🖐️</span>
            </div>
            
            <h3 className="text-[22px] font-black text-gray-900 mb-2">AI 손금 분석</h3>
            
            {isAnalyzingPalm ? (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-[15px] font-bold text-gray-600">수상학 기반으로<br/>손바닥에 새겨진 길흉을 분석하는 중입니다...</p>
              </div>
            ) : (
              <div className="w-full flex flex-col gap-4">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 sm:p-5 text-left max-h-[60vh] overflow-y-auto hidden-scrollbar flex flex-col gap-4">
                    {palmResult?.error ? (
                        <p className="text-[15px] text-red-500 font-bold">{palmResult.error}</p>
                    ) : palmResult?.result ? (
                        <p className="text-[15px] text-gray-800 leading-relaxed font-medium break-keep whitespace-pre-wrap">{palmResult.result}</p>
                    ) : palmResult ? (
                        <>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5"><span className="text-lg">🧬</span></div>
                                <div>
                                    <h4 className="text-[15px] font-black text-gray-900 mb-1">생명선 <span className="text-[12px] text-gray-400 font-medium ml-1">건강·수명</span></h4>
                                    <p className="text-[14px] text-gray-700 leading-relaxed font-medium break-keep whitespace-pre-wrap">{palmResult.life_line}</p>
                                </div>
                            </div>
                            <div className="w-full h-px bg-gray-200/60"></div>
                            
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5"><span className="text-lg">🧠</span></div>
                                <div>
                                    <h4 className="text-[15px] font-black text-gray-900 mb-1">두뇌선 <span className="text-[12px] text-gray-400 font-medium ml-1">지능·적성</span></h4>
                                    <p className="text-[14px] text-gray-700 leading-relaxed font-medium break-keep whitespace-pre-wrap">{palmResult.brain_line}</p>
                                </div>
                            </div>
                            <div className="w-full h-px bg-gray-200/60"></div>
                            
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center shrink-0 mt-0.5"><span className="text-lg">❤️</span></div>
                                <div>
                                    <h4 className="text-[15px] font-black text-gray-900 mb-1">감정선 <span className="text-[12px] text-gray-400 font-medium ml-1">성격·연애</span></h4>
                                    <p className="text-[14px] text-gray-700 leading-relaxed font-medium break-keep whitespace-pre-wrap">{palmResult.heart_line}</p>
                                </div>
                            </div>
                            <div className="w-full h-px bg-gray-200/60"></div>
                            
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0 mt-0.5"><span className="text-lg">💼</span></div>
                                <div>
                                    <h4 className="text-[15px] font-black text-gray-900 mb-1">운명선 <span className="text-[12px] text-gray-400 font-medium ml-1">직업·재물</span></h4>
                                    <p className="text-[14px] text-gray-700 leading-relaxed font-medium break-keep whitespace-pre-wrap">{palmResult.fate_line}</p>
                                </div>
                            </div>
                            
                            <div className="mt-2 bg-blue-50/50 rounded-xl p-3 border border-blue-100/50">
                                <p className="text-[13px] text-blue-800 font-bold leading-relaxed break-keep leading-[1.6]">
                                    <span className="text-[15px] mr-1">✨</span>{palmResult.summary}
                                </p>
                            </div>
                        </>
                    ) : null}
                </div>
                <button onClick={() => setShowPalm(false)} className="w-full bg-gray-900 text-white font-bold text-[16px] h-[52px] rounded-2xl hover:bg-gray-800 transition-colors">
                  확인 완료
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div >
  );
}
