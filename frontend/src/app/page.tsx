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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
  const [talismanResults, setTalismanResults] = useState<{ type: string, title: string, desc: string, reason: string }[]>([]);

  // Banner slider state
  const [bannerIndex, setBannerIndex] = useState(0);
  const isStoreEnabled = process.env.NEXT_PUBLIC_ENABLE_STORE === "true";
  const isExpertsEnabled = process.env.NEXT_PUBLIC_ENABLE_EXPERTS === "true";

  const bannerSlides = [
    { badge: '🔮 AI 정밀 분석', title: '나만의 사주 심층 리포트', sub: '8글자 명식 전체 풀이 · 무제한 AI 상담', cta: '지금 분석하기', href: '/saju', from: 'from-violet-600', to: 'to-purple-800' },
    ...(isStoreEnabled ? [{ badge: '⚡ 코인 이벤트', title: '첫 충전 30% 보너스!', sub: '지금 충전하면 추가 코인을 드려요', cta: '코인 충전하기', href: '/store', from: 'from-amber-500', to: 'to-orange-700' }] : []),
    ...(isExpertsEnabled ? [{ badge: '👤 전문가 상담', title: '1:1 명리학 전문가 매칭', sub: '검증된 상담사와 실시간 채팅 운세상담', cta: '상담사 찾기', href: '/experts', from: 'from-teal-500', to: 'to-cyan-700' }] : []),
  ];

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

  // Attendance Check
  const [attendanceStatus, setAttendanceStatus] = useState<boolean | null>(null);
  const [consecutiveDays, setConsecutiveDays] = useState(0);
  const [isClaimingAttendance, setIsClaimingAttendance] = useState(false);

  // Parse daily score locally based on harmony/clash backend logic
  let dailyScore = 75;
  if (matrixData?.daily_fortune) {
    const clashes = matrixData.daily_fortune.clash_with?.length || 0;
    const harmonies = matrixData.daily_fortune.harmony_with?.length || 0;
    dailyScore = 75 + (harmonies * 10) - (clashes * 10);
    dailyScore = Math.max(40, Math.min(100, dailyScore));
  }

  // Banner auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex(prev => (prev + 1) % bannerSlides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  // 1. 오행 기반 행운 번호 알고리즘
  const handleLotto = () => {
    const elementRanges: Record<string, [number, number]> = {
      wood: [1, 9], fire: [10, 19], earth: [20, 29], metal: [30, 39], water: [40, 45],
    };
    const dayElem = matrixData?.day_pillar?.heavenly?.element?.toLowerCase() || '';
    const monthElem = matrixData?.month_pillar?.heavenly?.element?.toLowerCase() || '';
    const yearElem = matrixData?.year_pillar?.heavenly?.element?.toLowerCase() || '';
    const weights: Record<string, number> = { wood: 1, fire: 1, earth: 1, metal: 1, water: 1 };
    if (dayElem && weights[dayElem] !== undefined)   weights[dayElem]   += 3;
    if (monthElem && weights[monthElem] !== undefined) weights[monthElem] += 2;
    if (yearElem && weights[yearElem] !== undefined)  weights[yearElem]  += 1;
    const pickElement = (): string => {
      const elems = Object.keys(weights);
      const total = elems.reduce((s, e) => s + weights[e], 0);
      let r = Math.random() * total;
      for (const e of elems) { r -= weights[e]; if (r <= 0) return e; }
      return elems[0];
    };
    const nums = new Set<number>();
    let tries = 0;
    while (nums.size < 6 && tries < 200) {
      const elem = pickElement();
      const [min, max] = elementRanges[elem] || [1, 45];
      nums.add(Math.floor(Math.random() * (max - min + 1)) + min);
      tries++;
    }
    while (nums.size < 6) nums.add(Math.floor(Math.random() * 45) + 1);
    setLottoNumbers(Array.from(nums).sort((a, b) => a - b));
    setShowLotto(true);
  };

  // 3. 오행 조후 기반 정밀 부적 추천
  const handleTalisman = () => {
    const results: { type: string; title: string; desc: string; reason: string }[] = [];
    const elementScore: Record<string, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    const pillars = ['year_pillar', 'month_pillar', 'day_pillar', 'time_pillar'];
    pillars.forEach(p => {
      const he = matrixData?.[p]?.heavenly?.element?.toLowerCase();
      const ee = matrixData?.[p]?.earthly?.element?.toLowerCase();
      if (he && elementScore[he] !== undefined) elementScore[he]++;
      if (ee && elementScore[ee] !== undefined) elementScore[ee]++;
    });
    const weakest = Object.entries(elementScore).sort((a, b) => a[1] - b[1])[0][0];
    const strongest = Object.entries(elementScore).sort((a, b) => b[1] - a[1])[0][0];
    const elemMap: Record<string, { type: string; title: string; desc: string; reason: string }> = {
      wood:  { type: 'health', title: '건강 활력 부적', desc: '목기(木氣)를 보충하여 체력과 성장력을 끌어올립니다.', reason: `목(木)기운이 ${elementScore.wood}개로 부족합니다.` },
      fire:  { type: 'career', title: '직장 발전 부적', desc: '화기(火氣)로 열정과 리더십을 폭발시켜 직장운을 활짝 열어줍니다.', reason: `화(火)기운이 ${elementScore.fire}개로 부족합니다.` },
      earth: { type: 'wealth', title: '재물 안정 부적', desc: '토기(土氣)로 재물의 뿌리를 단단히 하여 축적과 안정을 이끕니다.', reason: `토(土)기운이 ${elementScore.earth}개로 부족합니다.` },
      metal: { type: 'wealth', title: '재물 대박 부적', desc: '금기(金氣)로 결실과 금전운을 강하게 당겨 뜻밖의 횡재수를 만듭니다.', reason: `금(金)기운이 ${elementScore.metal}개로 부족합니다.` },
      water: { type: 'love',   title: '지혜 인연 부적', desc: '수기(水氣)로 지혜와 인연의 흐름을 원활하게 하여 귀인을 불러옵니다.', reason: `수(水)기운이 ${elementScore.water}개로 부족합니다.` },
    };
    results.push(elemMap[weakest]);
    const combined = (matrixData?.day_pillar?.earthly?.ten_god || '') + (matrixData?.month_pillar?.earthly?.ten_god || '');
    if (combined.includes('관성') || combined.includes('편관')) {
      results.push({ type: 'career', title: '합격 출세 부적', desc: '관성(官星)의 기운을 극대화하여 시험·취업·승진에서 두각을 나타냅니다.', reason: '관성이 월주/일주에 위치합니다.' });
    } else if (combined.includes('재성') || combined.includes('편재')) {
      results.push({ type: 'wealth', title: '재물 대박 부적', desc: '재성(財星) 기운을 더욱 강화하여 금전운 폭발 부적입니다.', reason: '재성이 월주/일주에 위치합니다.' });
    } else if (combined.includes('인성') || combined.includes('편인')) {
      results.push({ type: 'health', title: '무병 무탈 부적', desc: '인성(印星) 기운으로 건강과 정신력을 든든하게 지켜주는 부적입니다.', reason: '인성이 월주/일주에 위치합니다.' });
    } else {
      results.push({ type: 'love', title: '애정 만발 부적', desc: '주변 인연이 좋아지고 소울메이트를 끌어당기는 인연 부적입니다.', reason: '인연과 대인관계 운을 보강합니다.' });
    }
    if (strongest !== weakest) {
      results.push({ type: 'luck', title: '귀인 상봉 부적', desc: `${strongest === 'fire' ? '화(火)' : strongest === 'wood' ? '목(木)' : strongest === 'metal' ? '금(金)' : strongest === 'water' ? '수(水)' : '토(土)'}기운이 강한 당신 곁에 귀인이 나타납니다.`, reason: '가장 강한 기운을 귀인으로 연결합니다.' });
    } else {
      results.push({ type: 'luck', title: '만사 형통 부적', desc: '모든 기운의 균형을 잡아 원하는 일이 술술 풀리는 종합 개운 부적입니다.', reason: '오행 균형으로 전반적 운을 끌어올립니다.' });
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

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (token) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          setIsInitializing(false);
          return;
        }

        const stored = sessionStorage.getItem("saju_matrix");
        const storedUserInfo = sessionStorage.getItem("saju_user_info");

        if (stored) {
          // sessionStorage에 이미 있으면 바로 이동
          window.location.href = "/saju";
          return;
        }

        if (storedUserInfo) {
          const parsed = JSON.parse(storedUserInfo);
          if (parsed.gender) setUserGender(parsed.gender);
        }

        // DB에서 생년월일 불러오기 (자동 복원 시도)
        try {
          const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://saju-web.onrender.com";
          const meRes = await fetch(`${API_BASE}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (meRes.ok) {
            const me = await meRes.json();
            if (me.birth_time_iso) {
              // DB에 생년월일이 있으면 자동 재계산
              const calcRes = await fetch(`${API_BASE}/api/calculate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  birth_time_iso: me.birth_time_iso,
                  longitude: 126.978,
                  is_lunar: me.is_lunar || false,
                  is_leap_month: me.is_leap_month || false,
                  gender: me.gender || "F"
                })
              });
              if (calcRes.ok) {
                const responseData = await calcRes.json();
                responseData.matrix.user_name = me.name || "방문자";
                const completeMatrix = {
                  ...responseData.matrix,
                  daily_fortune: responseData.matrix.daily_fortune || responseData.fortune_cycle?.iljin,
                  fortune_cycle: responseData.fortune_cycle
                };
                sessionStorage.setItem("saju_matrix", JSON.stringify(completeMatrix));
                sessionStorage.setItem("saju_user_info", JSON.stringify({
                  name: me.name,
                  birth_time_iso: me.birth_time_iso,
                  is_lunar: me.is_lunar,
                  is_leap_month: me.is_leap_month,
                  gender: me.gender,
                  longitude: 126.978
                }));
                window.location.href = "/saju";
                return;
              }
            }
          }
        } catch (e) {
          console.warn("DB 자동 복원 실패 (비치명적):", e);
        }
      } catch (e) {
        console.error("SessionStorage Access Error in WebView:", e);
      }
      setIsInitializing(false);
    };
    init();
  }, [router]);

  useEffect(() => {
    const checkAttendance = async () => {
      const token = localStorage.getItem("access_token");
      if (!token || !isLoggedIn) return;
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://saju-web.onrender.com";
        const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8000' : API_BASE;
        const res = await fetch(`${baseUrl}/api/users/attendance/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAttendanceStatus(data.already_claimed);
          setConsecutiveDays(data.consecutive_days || 0);
        }
      } catch (err) {
        console.error("Failed to check attendance:", err);
      }
    };
    if (isLoggedIn) {
      checkAttendance();
    }
  }, [isLoggedIn]);

  const handleAttendanceClaim = async () => {
    if (isClaimingAttendance) return;
    setIsClaimingAttendance(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://saju-web.onrender.com";
      const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8000' : API_BASE;
      const res = await fetch(`${baseUrl}/api/users/attendance`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAttendanceStatus(true);
        setConsecutiveDays(data.new_streak || 1);
        const streakMsg = data.streak_bonus > 0 ? `\n🎊 ${data.new_streak}일 연속 출석 보너스! +${data.streak_bonus} 코인` : '';
        alert(`✅ 출석 완료!\n기본 보상: ${data.reward_amount} 코인${streakMsg}\n\n현재 잔액: ${data.new_balance.toLocaleString()} 코인`);
      } else {
        const err = await res.json();
        alert(err.detail || "오류가 발생했습니다.");
      }
    } catch (err) {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setIsClaimingAttendance(false);
    }
  };

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

      // DB 자동 저장: 로그인 상태인 경우 생년월일 정보를 서버에 영속화
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://saju-web.onrender.com";
          await fetch(`${API_BASE}/api/users/birth-data`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({
              birth_time_iso: data.birth_time_iso,
              is_lunar: data.is_lunar,
              is_leap_month: data.is_leap_month,
              gender: data.gender,
              name: data.name,
              saju_summary: `${completeMatrix.year_pillar?.heavenly?.label || ''}${completeMatrix.year_pillar?.earthly?.label || ''} ${completeMatrix.month_pillar?.heavenly?.label || ''}${completeMatrix.month_pillar?.earthly?.label || ''} ${completeMatrix.day_pillar?.heavenly?.label || ''}${completeMatrix.day_pillar?.earthly?.label || ''} ${completeMatrix.time_pillar?.heavenly?.label || ''}${completeMatrix.time_pillar?.earthly?.label || ''}`
            })
          });
        } catch (e) {
          console.warn("사주 데이터 DB 저장 실패 (비치명적):", e);
        }
      }

      console.log("Data saved to sessionStorage. Redirecting to My Flow (Saju)...");
      window.location.href = '/saju';

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
      <div className="min-h-screen bg-[#F5F6F8] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-t-[3px] border-r-[3px] border-indigo-500 border-solid animate-spin mb-4"></div>
        <p className="text-sm font-semibold text-gray-700">세상의 모든 사주팔자 시스템을 초기화하고 있습니다...</p>
        <p className="text-xs text-gray-500 mt-2">만약 이 화면이 계속 보인다면, 우주 파동 연결이 지연되는 중입니다.</p>
        <p className="text-xs text-gray-400 mt-1">WebView Cache Bypassed / Hard Redirect Mode</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-screen bg-[#F8F9FA]">
      <motion.div
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-all duration-700 ease-in-out bg-[#F8F9FA] ${(!matrixData && showSplashMode) ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
        onClick={handleSplashClick}
      >
        {/* Phase 0: High-Tech Midnight Blue Background */}
        <div className="absolute inset-0 bg-[#0C0F26] flex justify-center items-center overflow-hidden pointer-events-none">
          {/* Deep immersive dark background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(21,17,58,0.4)_0%,rgba(12,15,38,1)_100%)]"></div>
        </div>

        {/* Animation Container */}
        <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none h-full w-full mt-[-8vh]">
          
          <div className="relative w-[180px] h-[180px] flex items-center justify-center">
            
            {/* Phase 01: Mascot Entrance & Floating (0.0s ~ ) */}
            <motion.div
              initial={{ scale: 0, rotate: -15, opacity: 0 }}
              animate={{ scale: [0, 1.15, 1], rotate: [0, 5, -5, 0], opacity: 1, y: [0, -8, 0] }}
              transition={{ 
                scale: { duration: 1.0, ease: "easeOut" },
                rotate: { duration: 1.5, ease: "easeInOut" },
                y: { repeat: Infinity, duration: 3.5, ease: "easeInOut" }
              }}
              className="absolute w-36 h-36 rounded-[36px] overflow-hidden border-4 border-[#D4AF37] shadow-[0_12px_40px_rgba(212,175,55,0.4)] bg-[#161233] p-1"
            >
              <img
                src="/images/welcome_anime_mascot.png"
                alt="세상의 모든 사주팔자 마스코트"
                className="w-full h-full object-contain"
              />
            </motion.div>

            {/* Magic Sparkle Particles floating outward */}
            <div className="absolute inset-0 w-[240px] h-[240px]">
              {[...Array(12)].map((_, i) => {
                const angle = (i * 360) / 12;
                const distance = 70 + Math.random() * 50;
                return (
                  <motion.span
                    key={`sparkle-${i}`}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                    animate={{ 
                      x: Math.cos(angle * Math.PI / 180) * distance, 
                      y: Math.sin(angle * Math.PI / 180) * distance, 
                      scale: [0, 1.2, 0.8, 0],
                      opacity: [0, 1, 0.8, 0]
                    }}
                    transition={{ 
                      duration: 2.2, 
                      delay: 0.8 + Math.random() * 0.6,
                      repeat: Infinity,
                      repeatDelay: Math.random() * 1.5,
                      ease: "easeOut" 
                    }}
                    className="absolute text-[#D4AF37] text-lg font-bold select-none top-1/2 left-1/2 mt-[-10px] ml-[-10px]"
                  >
                    ✦
                  </motion.span>
                )
              })}
            </div>

            {/* Glowing magic ring backing */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: [0, 0.4, 0.2] }}
              transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
              className="absolute w-[200px] h-[200px] border border-[#D4AF37]/30 rounded-full blur-[2px]"
            />
          </div>
          
          {/* Phase 02: Cartoon-style Text Popup (1.2s ~ ) */}
          <div className="mt-10 flex flex-col justify-center items-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.1, 1], opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center gap-2"
            >
              <div className="text-[26px] md:text-[36px] tracking-[0.15em] text-[#D4AF37] font-sans font-black drop-shadow-[0_2px_10px_rgba(212,175,55,0.4)]">
                세상의 모든 사주팔자
              </div>
              <div className="text-[#D4AF37]/50 tracking-[0.25em] text-xs font-semibold uppercase mt-1">
                All Saju in the World
              </div>
            </motion.div>
          </div>
          
        </div>

        {/* Sync Transition Fallback (For Testing) */}
        {!matrixData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4.5, duration: 1.0 }}
            className="absolute bottom-12 z-20"
          >
            <button 
              className="text-[#D4AF37]/60 text-xs tracking-widest hover:text-[#D4AF37] transition-colors border-b border-transparent hover:border-[#D4AF37]/50 py-1 uppercase"
            >
              Skip Intro
            </button>
          </motion.div>
        )}
      </motion.div>

      {
        !matrixData && (
          <motion.div
            className="w-full min-h-[calc(100vh-12rem)] flex flex-col items-center justify-start px-4 pt-2 pb-8 relative bg-[#0C0F26] overflow-hidden"
          >
            {/* Cosmic nebula backgrounds */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-violet-600/15 rounded-full blur-[90px]"></div>
              <div className="absolute bottom-[20%] left-[-20%] w-[60%] h-[60%] bg-indigo-500/15 rounded-full blur-[80px]"></div>
              <div className="absolute top-[30%] left-[25%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[100px]"></div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="w-full max-w-md relative z-10 flex flex-col gap-6 pt-8"
            >
              <div className="text-center">
                {/* Floating mascot illustration */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                  className="relative w-36 h-36 mx-auto mb-6 drop-shadow-[0_12px_36px_rgba(168,85,247,0.3)]"
                >
                  <img
                    src="/images/welcome_anime_mascot.png"
                    alt="세상의 모든 사주팔자 마스코트"
                    className="w-full h-full object-contain rounded-[36px] border-2 border-white/10 bg-[#161233]"
                  />
                </motion.div>

                <h1 className="text-[26px] font-black text-white tracking-tight mb-3 leading-[1.3] font-pretendard">
                  세상의 모든 사주팔자
                </h1>
                <p className="text-white/60 font-medium text-[14px] leading-relaxed break-keep px-6">
                  {isLoggedIn 
                    ? "생년월일을 통해 당신의 고유한 결을 읽어냅니다.\n자연의 흐름과 일상을 동기화하세요."
                    : "우주의 흐름과 나의 일상을 동기화하는\n가장 쉽고 친근한 명리 가이드"}
                </p>
              </div>

              <div className="w-full pb-8 mt-2 relative z-20">
                {isLoggedIn ? (
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[28px] p-5 shadow-xl">
                    <BirthDataForm onCalculate={handleCalculate} isLoading={isLoading} buttonText="나의 매트릭스 생성" />
                  </div>
                ) : (
                  <div className="w-full flex flex-col gap-3 mt-4">
                    <button
                      onClick={() => {
                        const KAKAO_REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY || "a1a2b678a3ba09a7c064e3b4bfafc6cd";
                        const REDIRECT_URI = typeof window !== 'undefined' 
                          ? `${window.location.origin}/auth/kakao/callback` 
                          : '';
                        
                        setIsLoading(true);
                        window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
                      }}
                      disabled={isLoading}
                      className="w-full h-15 bg-[#FEE500] text-[#000000] rounded-[20px] flex items-center justify-center font-black font-pretendard border-2 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000000] transition-all disabled:opacity-50 relative"
                    >
                      <div className="absolute left-5 flex items-center justify-center">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 4C7.02944 4 3 7.12643 3 10.982C3 13.4478 4.60411 15.6133 6.95837 16.8856L6.08272 20.061C5.97893 20.4374 6.38871 20.7265 6.70327 20.5015L10.3758 17.8741C10.9026 17.9351 11.4447 17.9641 12 17.9641C16.9706 17.9641 21 14.8377 21 10.982C21 7.12643 16.9706 4 12 4Z" fill="black"/>
                        </svg>
                      </div>
                      {isLoading ? "연결 중..." : "카카오로 시작하기"}
                    </button>
                    
                    <p className="text-[11px] text-center text-white/40 font-pretendard mt-4">
                      카카오 로그인 시 세상의 모든 사주팔자의 <a href="/terms" className="underline text-white/60">이용약관</a> 및 <a href="/terms" className="underline text-white/60">개인정보처리방침</a>에 동의하게 됩니다.
                    </p>
                  </div>
                )}
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

            {/* Header */}
            <header className="px-5 pt-8 pb-4 max-w-md mx-auto">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">투데이</h1>
                <UserBadge onClick={clearMatrix} />
              </div>
            </header>

            <div className="px-4 pt-3 pb-4">
              {/* Promotion Banner Slider */}
              <div className="w-full rounded-[24px] relative overflow-hidden h-40 shadow-md">
                {bannerSlides.map((slide, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 bg-gradient-to-br ${slide.from} ${slide.to} flex flex-col justify-center px-6 transition-opacity duration-700 ${
                      idx === bannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                  >
                    <div className="absolute right-4 top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                    <span className="inline-block bg-white/20 text-white text-[11px] font-black px-2.5 py-1 rounded-full mb-2 tracking-wide w-fit">
                      {slide.badge}
                    </span>
                    <h2 className="text-[20px] font-black text-white leading-[1.2] tracking-tight mb-1">{slide.title}</h2>
                    <p className="text-[12px] font-bold text-white/80 mb-3">{slide.sub}</p>
                    <Link href={slide.href}
                      className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-[13px] font-black px-4 py-1.5 rounded-full border border-white/30 transition-all w-fit"
                    >
                      {slide.cta} <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                  {bannerSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setBannerIndex(idx)}
                      className={`rounded-full transition-all ${
                        idx === bannerIndex ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Today's Summary Card and Daily Hub */}
            <div className="px-4 flex flex-col gap-5 pb-12 mt-2">
              <div className="bg-white rounded-[32px] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5 overflow-hidden relative animate-fade-in-up">
                {/* Glow orb */}
                <div
                  className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-60 pointer-events-none"
                  style={{ background: dailyScore >= 80 ? '#2AC1BC30' : dailyScore >= 60 ? '#FFA00030' : '#FF704330' }}
                />
                <div className="text-[13px] text-gray-400 font-bold mb-1 tracking-wider uppercase">오늘의 운세</div>
                <h2 className="text-[26px] font-black tracking-tight text-gray-900 mb-6">{matrixData.user_name || "방문자"}님의 하루 요약</h2>

                {/* Wave Graph Area -> Modern Radial Dial */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-44 h-44 flex items-center justify-center">
                    {/* Background glow */}
                    <div
                      className="absolute inset-3 rounded-full blur-xl opacity-20 pointer-events-none"
                      style={{ background: dailyScore >= 80 ? '#2AC1BC' : dailyScore >= 60 ? '#FFA000' : '#FF7043' }}
                    />
                    
                    {/* Outer static ring */}
                    <svg className="w-full h-full -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="44" fill="none" stroke="#F1F3F5" strokeWidth="7" />
                      {/* Dynamic progress ring */}
                      <circle 
                        cx="50" cy="50" r="44" 
                        fill="none" 
                        stroke="url(#homeGradientDial)" 
                        strokeWidth="7" 
                        strokeLinecap="round" 
                        strokeDasharray="276.5" 
                        strokeDashoffset={276.5 - (276.5 * dailyScore) / 100}
                        style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                      />
                      <defs>
                        <linearGradient id="homeGradientDial" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={dailyScore >= 80 ? '#48CAE4' : dailyScore >= 60 ? '#FFD54F' : '#FF8A65'} />
                          <stop offset="100%" stopColor={dailyScore >= 80 ? '#2AC1BC' : dailyScore >= 60 ? '#FFA000' : '#FF5722'} />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Inner Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">TODAY</span>
                      <div className="flex items-start">
                        <span className="text-[50px] font-black text-gray-900 leading-none tracking-tighter">{dailyScore}</span>
                        <span className="text-[16px] font-bold text-gray-400 mt-2 ml-0.5">점</span>
                      </div>
                      <span className="text-[12px] font-bold mt-1" style={{ color: dailyScore >= 80 ? '#2AC1BC' : dailyScore >= 60 ? '#FFA000' : '#FF7043' }}>
                        {dailyScore >= 85 ? '🌟 최상' : dailyScore >= 70 ? '😊 양호' : dailyScore >= 55 ? '😐 보통' : '⚠️ 주의'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center text-center mt-5 z-20 relative px-2">
                    <p className="text-[16px] font-bold text-gray-800 leading-snug break-keep">
                        {matrixData.daily_fortune?.description || "문을 두드리면 반드시 열리는 하루입니다."}
                    </p>

                    <button onClick={() => setIsDailyModalOpen(true)} className="mt-5 mb-2 text-[14px] font-bold text-gray-500 flex items-center gap-1 hover:text-gray-800 transition-colors border border-gray-200 px-4 py-1.5 rounded-full">
                        오늘 하루 자세히 보기 <ChevronRight className="w-4 h-4 ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Daily Attendance Banner */}
              {isLoggedIn && attendanceStatus !== null && (
                <div
                  onClick={attendanceStatus ? undefined : handleAttendanceClaim}
                  className={`rounded-[28px] p-5 shadow-[0_8px_30px_rgba(250,204,21,0.25)] relative overflow-hidden group transition-all ${
                    attendanceStatus
                      ? 'bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200 cursor-default'
                      : 'bg-gradient-to-r from-yellow-400 to-orange-400 border border-yellow-300 cursor-pointer hover:scale-[1.02] active:scale-95'
                  }`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-2xl rounded-full transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-700" />
                  
                  <div className="flex items-center justify-between relative z-10 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-inner backdrop-blur-sm border ${
                        attendanceStatus ? 'bg-gray-200 border-gray-300' : 'bg-white/30 border-white/40 animate-[bounce_3s_ease-in-out_infinite]'
                      }`}>
                        {attendanceStatus ? '✅' : '🎁'}
                      </div>
                      <div className={`flex flex-col ${attendanceStatus ? 'text-gray-600' : 'text-white'}`}>
                        <span className="text-[13px] font-extrabold opacity-90 drop-shadow-sm mb-0.5">
                          {attendanceStatus ? `${consecutiveDays}일 연속 출석 중` : '매일매일 쏟아지는 혜택'}
                        </span>
                        <span className="text-[18px] font-black drop-shadow-md tracking-tight">
                          {attendanceStatus ? '오늘 출석 완료! 🎉' : '출석 50코인 받기'}
                        </span>
                      </div>
                    </div>
                    {!attendanceStatus && <ChevronRight className="w-6 h-6 text-white opacity-90 drop-shadow-sm" />}
                  </div>

                  {/* 7-day streak bar */}
                  <div className="flex gap-1.5 relative z-10">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const filled = i < (attendanceStatus ? consecutiveDays + 1 : consecutiveDays);
                      const isToday = i === (attendanceStatus ? consecutiveDays : consecutiveDays);
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className={`w-full h-2 rounded-full transition-all ${
                            filled
                              ? attendanceStatus
                                ? 'bg-orange-400'
                                : 'bg-white'
                              : attendanceStatus
                                ? 'bg-gray-300'
                                : 'bg-white/30'
                          } ${isToday && !attendanceStatus ? 'animate-pulse' : ''}`} />
                          <span className={`text-[9px] font-bold ${
                            filled
                              ? attendanceStatus ? 'text-orange-500' : 'text-white/90'
                              : attendanceStatus ? 'text-gray-400' : 'text-white/40'
                          }`}>{i + 1}일</span>
                        </div>
                      );
                    })}
                  </div>
                  {consecutiveDays >= 6 && !attendanceStatus && (
                    <p className={`text-[11px] font-black mt-2 text-center relative z-10 ${attendanceStatus ? 'text-gray-500' : 'text-white'}`}>
                      🎊 오늘 출석하면 7일 연속! +100 보너스 코인 지급
                    </p>
                  )}
                </div>
              )}

              {/* Daily/Fun Hub injected from saju/page.tsx */}
              <section className="bg-white rounded-[32px] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5 flex flex-col gap-6">
                <div>
                  <div className="text-[13px] text-gray-400 font-bold mb-1 tracking-wider uppercase">매일매일 가볍게!</div>
                  <h2 className="text-[26px] font-black tracking-tight text-gray-900 mb-6">데일리 운세 & 즐길거리</h2>
                </div>

                {/* 데일리 기운 (Grid) */}
                <div className="grid grid-cols-4 gap-y-8 gap-x-2">
                  <Link href="/saju/confirm?type=오늘의운세" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity active:scale-95">
                    <SpotIcon emoji="🐣" />
                    <span className="text-[13px] font-bold text-gray-700 tracking-tight">오늘의 기운</span>
                  </Link>
                  <Link href="/saju/confirm?type=내일의운세" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity active:scale-95">
                    <SpotIcon emoji="🦉" />
                    <span className="text-[13px] font-bold text-gray-700 tracking-tight">내일의 기운</span>
                  </Link>
                  <Link href="/saju/confirm?type=지정일 운세" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity active:scale-95">
                    <SpotIcon emoji="🦄" />
                    <span className="text-[13px] font-bold text-gray-700 tracking-tight">지정일 기운</span>
                  </Link>
                  <Link href="/saju/confirm?type=타인과의 궁합" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity active:scale-95">
                    <SpotIcon emoji="🐰" />
                    <span className="text-[13px] font-bold text-gray-700 tracking-tight">궁합</span>
                  </Link>
                </div>

                {/* 행운 팁 (List) */}
                <div className="flex flex-col gap-7 pt-5 border-t border-gray-100/60">
                  <div onClick={handleLotto} className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-transform active:scale-95">
                    <CircleIcon emoji="🐷" />
                    <div className="flex flex-col">
                      <h3 className="text-[17px] font-black text-gray-900 tracking-tight">퍼스널 행운 번호</h3>
                      <p className="text-[13px] text-gray-500 mt-0.5 font-medium">나만의 시그니처 넘버 6개</p>
                    </div>
                  </div>
                  <div onClick={handleTalisman} className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-transform active:scale-95">
                    <CircleIcon emoji="🐢" />
                    <div className="flex flex-col">
                      <h3 className="text-[17px] font-black text-gray-900 tracking-tight">에너지 부스터</h3>
                      <p className="text-[13px] text-gray-500 mt-0.5 font-medium">지금 내게 필요한 맞춤형 부적 추천</p>
                    </div>
                  </div>
                  <div onClick={() => setShowMoving(true)} className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-transform active:scale-95">
                    <CircleIcon emoji="🐌" />
                    <div className="flex flex-col">
                      <h3 className="text-[17px] font-black text-gray-900 tracking-tight">캘린더 매니징</h3>
                      <p className="text-[13px] text-gray-500 mt-0.5 font-medium">이사/중요 일정 등 길일 찾기</p>
                    </div>
                  </div>
                  <div onClick={() => setIsOutfitModalOpen(true)} className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-transform active:scale-95">
                    <CircleIcon emoji="👗" />
                    <div className="flex flex-col">
                      <h3 className="text-[17px] font-black text-gray-900 tracking-tight">럭키 컬러</h3>
                      <p className="text-[13px] text-gray-500 mt-0.5 font-medium">나만의 행운의 아이템 매칭</p>
                    </div>
                  </div>
                  <div onClick={() => fileInputRef.current?.click()} className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-transform active:scale-95">
                    <CircleIcon emoji="🦊" />
                    <div className="flex flex-col">
                      <h3 className="text-[17px] font-black text-gray-900 tracking-tight">나의 관상</h3>
                      <p className="text-[13px] text-gray-500 mt-0.5 font-medium">AI가 분석하는 첫인상과 이미지</p>
                    </div>
                    <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handlePhotoUpload} />
                  </div>
                  <div onClick={() => palmInputRef.current?.click()} className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-transform active:scale-95">
                    <CircleIcon emoji="🖐️" />
                    <div className="flex flex-col">
                      <h3 className="text-[17px] font-black text-gray-900 tracking-tight">나의 손금</h3>
                      <p className="text-[13px] text-gray-500 mt-0.5 font-medium">손바닥에 그려진 나의 길흉화복</p>
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
