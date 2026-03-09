"use client";

import { useState, useEffect, useRef } from "react";
import { RefreshCw, ChevronRight, User, Sparkles, X, Dices, FileBadge, CalendarCheck, Camera, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AgenticChatbot from "@/components/AgenticChatbot";
import BirthDataForm from "@/components/BirthDataForm";


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

  // Physiognomy States
  const [showFace, setShowFace] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [faceResult, setFaceResult] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        const res = await fetch("https://saju-web.onrender.com/api/physiognomy", {
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
      <motion.div
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FDFBFA] overflow-hidden cursor-pointer transition-all duration-700 ease-in-out ${(!matrixData && showSplashMode) ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
          }`}
        onClick={handleSplashClick}
      >
        {/* Soft, vibrant MZ-style background gradients */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              x: [-20, 20, -20],
              y: [-20, 20, -20],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] max-w-[600px] max-h-[600px] bg-[#FFB199] opacity-30 rounded-full blur-[80px] mix-blend-multiply"
          />
          <motion.div
            animate={{
              x: [20, -20, 20],
              y: [20, -20, 20],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] bg-[#81C784] opacity-30 rounded-full blur-[70px] mix-blend-multiply"
          />
          <motion.div
            animate={{
              y: [-30, 30, -30],
              scale: [0.9, 1.1, 0.9]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-[30%] left-[20%] w-[50vw] h-[50vw] max-w-[400px] max-h-[400px] bg-[#A2D2FF] opacity-20 rounded-full blur-[60px] mix-blend-multiply"
          />
        </div>

        {/* Floating Emojis / Modern 3D feel Elements */}
        <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center pointer-events-none pt-10">
          <motion.div
            animate={{ y: [-15, 15, -15], rotate: [-5, 5, -5] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <div className="w-40 h-40 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[40px] shadow-[0_20px_40px_rgba(0,0,0,0.08)] flex items-center justify-center group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent"></div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="text-[72px] drop-shadow-md relative z-10"
              >
                🔮
              </motion.div>
            </div>

            {/* Small floating badges */}
            <motion.div
              animate={{ y: [-5, 5, -5], rotate: [10, -10, 10] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -top-4 -right-6 w-14 h-14 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white flex items-center justify-center text-xl"
            >
              ✨
            </motion.div>
            <motion.div
              animate={{ y: [5, -5, 5], rotate: [-10, 10, -10] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute -bottom-6 -left-6 w-16 h-16 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white flex items-center justify-center text-2xl"
            >
              🍀
            </motion.div>
          </motion.div>
        </div>

        {/* Clean, bold Typography */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-center flex flex-col items-center px-6 pb-24 w-full"
        >
          <span className="bg-[#4A5568]/10 text-[#4A5568] px-4 py-1.5 rounded-full text-xs font-bold mb-5 tracking-wide uppercase">
            Personal Analytics
          </span>
          <h2 className="text-[32px] md:text-[40px] font-black text-[#111827] tracking-tight leading-[1.2] mb-6 font-pretendard">
            당신의 매일이 <br />더 완벽해지도록
          </h2>

          <motion.div
            animate={{ opacity: [0.7, 1, 0.7], y: [0, 2, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="mt-2 w-full max-w-[280px]"
          >
            <div className="w-full bg-[#111827] text-white flex items-center justify-center gap-3 py-4 rounded-[20px] font-bold text-[16px] shadow-[0_8px_20px_rgba(17,24,39,0.15)] group relative overflow-hidden">
              <span className="relative z-10">내 인생 알고리즘 보기</span>
              <ChevronRight className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {!matrixData && (
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
      )
      }

      {
        matrixData && (
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

              {/* Daily/Fun Hub injected from saju/page.tsx */}
              <div className="px-4 mb-4">
                {/* ==== 영역 1: 매일매일 가볍게! 재미 운세 ==== */}
                <section className="bg-white rounded-[32px] p-6 pt-7 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col gap-6">
                  <div className="mb-2">
                    <span className="text-[12px] text-gray-400 font-bold tracking-tight">매일매일 가볍게!</span>
                    <h2 className="text-[20px] font-black mt-0.5 text-[#4A5568]">데일리 운세 & 즐길거리</h2>
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
                    <div onClick={() => fileInputRef.current?.click()} className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-opacity">
                      <CircleIcon emoji="🦊" />
                      <div className="flex flex-col">
                        <h3 className="text-[16px] font-black text-[#4A5568]">나의 관상</h3>
                        <p className="text-[13px] text-gray-400 mt-0.5 font-medium">AI가 분석하는 첫인상과 이미지</p>
                      </div>
                      <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handlePhotoUpload} />
                    </div>
                  </div>
                </section>


              </div>
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

    </div >
  );
}
