"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    RefreshCw, ChevronRight,
    Calendar, // 신년운세
    BookOpen, // 토정비결
    FileText, // 정통사주
    Sun, // 오늘의 운세
    Clock, // 내일의 운세
    ClipboardCheck, // 지정일 운세
    Dices, // 행운의 번호
    Gift, // 천생복덕운
    FileBadge, // 행운의 부적
    CalendarCheck, // 이사택일
    Users, // 관상 (카메라)
    Camera, X, Loader2,
    Briefcase, // 취업 운세
    LineChart, // 능력 평가
    BrainCircuit, // 심리 분석
    MessageSquareHeart, // 소원담벼락 (대체)
    Sparkles, // 고민구슬
    Headset, // 점신 1:1 상담
    Cookie, // 포춘쿠키
    Cat, // 띠 운세
    Stars, // 별자리 운세
    CloudSun, // 태어난 계절운
    Cake, // 생년월일 운세
    Globe2, // 전생운
    Gem, // 탄생석
    HeartHandshake, // 짝궁합
    Puzzle // 정통궁합
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import UserBadge from "@/components/UserBadge";
import ElementalBarChart from "@/components/ElementalBarChart";

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

export default function FortuneHubPage() {
    const router = useRouter();
    const [userName, setUserName] = useState("");

    // Insight Modal State
    const [elementDetailModal, setElementDetailModal] = useState<{ isOpen: boolean, title: string, content: string }>({ isOpen: false, title: "", content: "" });

    const [userSaju, setUserSaju] = useState<any>(null);

    // Modal States
    const [showLotto, setShowLotto] = useState(false);
    const [lottoNumbers, setLottoNumbers] = useState<number[]>([]);

    const [showTrait, setShowTrait] = useState(false);
    const [traitResult, setTraitResult] = useState({ title: "", desc: "", reason: "" });

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

    // Calculate Element Counts and Saju Strength
    let elementCounts: Record<string, number> = { "목": 0, "화": 0, "토": 0, "금": 0, "수": 0 };
    let sajuStrength = "알 수 없음";

    if (userSaju) {
        const elementMap: Record<string, string> = { "wood": "목", "fire": "화", "earth": "토", "metal": "금", "water": "수" };
        const pillars = [userSaju.time_pillar, userSaju.day_pillar, userSaju.month_pillar, userSaju.year_pillar];

        pillars.forEach(p => {
            if (p?.heavenly?.element) elementCounts[elementMap[p.heavenly.element]] += 1;
            if (p?.earthly?.element) elementCounts[elementMap[p.earthly.element]] += 1;
        });

        // Simple strength calculation based on supportive elements
        const dmElement = userSaju.day_pillar?.heavenly?.element;
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
                if (p?.earthly?.element && supportive.includes(p.earthly.element)) supportCount += (p === userSaju?.month_pillar ? 2 : 1); // Weight month branch
            });

            sajuStrength = supportCount >= 4 ? "신강(身強)" : "신약(身弱)";
        }
    }

    // Helpers for Bazi Grid
    const getHanja = (label?: string) => label ? label.split('(')[0] : "?";
    const getHangul = (label?: string) => label && label.includes('(') ? label.split('(')[1].replace(')', '') : "?";

    const pillars = userSaju ? [
        { label: "시주", data: userSaju?.time_pillar },
        { label: "일주", data: userSaju?.day_pillar },
        { label: "월주", data: userSaju?.month_pillar },
        { label: "년주", data: userSaju?.year_pillar }
    ] : [];

    // Calculate dynamic radar chart points based on five elements counts
    const getRadarPoints = () => {
        if (!userSaju) return "50,20 80,45 60,82 20,78 15,35"; // Fallback points

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

    useEffect(() => {
        const storedInfo = sessionStorage.getItem("saju_user_info");
        const storedSaju = sessionStorage.getItem("saju_matrix");
        if (storedInfo) {
            try {
                const parsed = JSON.parse(storedInfo);
                if (parsed.name) setUserName(parsed.name);
            } catch (e) { }
        }
        if (storedSaju) {
            try {
                setUserSaju(JSON.parse(storedSaju));
            } catch (e) { }
        }
    }, []);

    // 1. Lotto Logic
    const handleLotto = () => {
        const nums = new Set<number>();
        while (nums.size < 6) {
            nums.add(Math.floor(Math.random() * 45) + 1);
        }
        setLottoNumbers(Array.from(nums).sort((a, b) => a - b));
        setShowLotto(true);
    };

    // 2. Trait Logic
    const handleTrait = () => {
        let title = "평인복덕";
        let desc = "평범함 속에 비범함이 감춰진 사주입니다. 작은 행운이 자주 찾아옵니다.";
        let reason = "당신의 사주는 오행이 고루 분포되어 있어 특별한 치우침 없이 무난한 평온함을 누리는 에너지입니다.";

        if (userSaju && userSaju?.day_pillar) {
            const dayElem = userSaju?.day_pillar.heavenly.element;
            const dayLabel = userSaju?.day_pillar.heavenly.label;

            if (dayElem === "목") {
                title = "태을귀인";
                desc = "학문과 지혜를 돕는 강력한 귀인의 기운이 있습니다.";
                reason = `당신의 일간인 '${dayLabel}(${dayElem})'과 사주의 기운이 만나, 학업이나 연구, 지적인 활동에서 뜻밖의 조력자를 만나게 되는 길신이 찾아옵니다.`;
            } else if (dayElem === "화") {
                title = "천을귀인";
                desc = "주변의 도움으로 위기를 모면하는 최고의 길신이 함께합니다.";
                reason = `당신의 일간인 '${dayLabel}(${dayElem})' 특유의 에너지 덕분에, 위험한 순간마다 보이지 않는 귀인의 도움을 받아 흉몽이 길몽으로 바뀌는 강력한 복을 타고 났습니다.`;
            } else if (dayElem === "토") {
                title = "문창귀인";
                desc = "글재주가 뛰어나고 지혜로우며 흉운을 길운으로 바꿉니다.";
                reason = `당신의 일간인 '${dayLabel}(${dayElem})'의 단단한 기반 위에 총명함이 수놓아져, 말을 조리 있게 하고 학문적 성취나 창작 활동에서 큰 행운을 얻게 됩니다.`;
            } else if (dayElem === "금") {
                title = "천주귀인";
                desc = "의식이 풍부하고 평생 의식주 걱정이 없는 복덕운입니다.";
                reason = `당신의 일간인 '${dayLabel}(${dayElem})'의 결실을 맺는 성질이 작용하여, 타고난 식록(먹을 복)이 풍부해 평생 경제적인 안락함을 누릴 수 있는 든든한 사주입니다.`;
            } else if (dayElem === "수") {
                title = "금여록";
                desc = "부귀와 안락을 상징하며 좋은 사람들을 만날 귀한 운입니다.";
                reason = `당신의 일간인 '${dayLabel}(${dayElem})'의 유연하고 맑은 성질이 좋은 배우자나 훌륭한 파트너를 이끌어, 인생의 수레를 타고 편안히 나아가는 복을 지녔습니다.`;
            }
        }
        setTraitResult({ title, desc, reason });
        setShowTrait(true);
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

        if (userSaju && userSaju?.month_pillar) {
            const mg = userSaju?.month_pillar.earthly.ten_god || "";
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

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-24 font-pretendard">

            {/* Header */}
            <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 h-14 max-w-md mx-auto flex items-center px-5 justify-between border-b border-gray-100">
                <h1 className="text-xl font-extrabold text-[#4A5568] tracking-tight">나의 흐름</h1>
                <UserBadge />
            </header>

            <main className="max-w-md mx-auto flex flex-col gap-3 px-4 pt-3">

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
                {/* Main Content Areas */}
                <div className="flex-1 w-full pt-4 pb-32">
                    <div className="flex flex-col gap-4">
                        {/* Bazi Grid Injected */}
                        {/* Bazi Grid (8 Pillars) instead of Green Banner Image Area */}
                        <div className="bg-white rounded-[32px] p-7 pt-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5 flex flex-col items-center">
                            <div className="flex justify-between items-start w-full mb-7 px-1 gap-2">
                                <div>
                                    <div className="text-[13px] text-gray-400 font-bold mb-1 tracking-wider uppercase">나의 기본 설정</div>
                                    <h2 className="text-[26px] font-black tracking-tight text-gray-900">사주팔자</h2>
                                </div>
                                <span className="text-[13px] font-bold text-[#3B705C] bg-[#3B705C]/10 px-3.5 py-1.5 rounded-full mt-1.5 whitespace-nowrap shrink-0">{sajuStrength}</span>
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
                                            <div className="text-[26px] leading-none mb-1 font-black opacity-90">{getHanja(pillar.data?.heavenly?.label)}</div>
                                            <div className="text-[9px] opacity-70 flex gap-0.5 items-center font-pretendard font-medium">
                                                <span>{getHangul(pillar.data?.heavenly?.label)}</span>
                                                <span>·</span>
                                                <span>{ELEMENT_KOR[pillar.data?.heavenly?.element || "earth"]}</span>
                                            </div>
                                        </div>

                                        <div className={`w-full aspect-[4/5] ${ELEMENT_COLORS_BG[pillar.data?.earthly?.element || "earth"]} rounded-[12px] flex flex-col items-center justify-center font-bold shadow-sm relative overflow-hidden mb-3 ring-1 ring-inset ring-black/5`}>
                                            <div className="text-[26px] leading-none mb-1 font-black opacity-90">{getHanja(pillar.data?.earthly?.label)}</div>
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

                        {/* Radar Chart Card (오늘의 운세 흐름 읽기) */}
                        <div className="bg-white rounded-[32px] p-7 pt-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5">
                            <div className="text-[13px] text-gray-400 font-bold mb-1 tracking-wider uppercase">나의 분석 모델</div>
                            <h2 className="text-[26px] font-black tracking-tight text-gray-900 mb-6">{userSaju?.user_name || "당신"}의 선천적 밸런스</h2>

                            <div className="relative w-full mx-auto mb-8 mt-4 px-1">
                                <ElementalBarChart matrix={userSaju} />
                            </div>

                            <div className="flex flex-col gap-5">
                                <div
                                    onClick={() => setElementDetailModal({
                                        isOpen: true,
                                        title: "나의 핵심 기운: 일간(日干)",
                                        content: `사주명리학에서 일간(日干)은 '나 자신'을 상징하는 가장 본질적인 기운이자, 평생토록 변하지 않는 내면의 코어를 의미합니다. 당신이 태어난 날의 하늘의 기운을 뜻하는 이 글자는, 당신의 잠재력, 고유한 성향, 그리고 대인관계를 맺는 방식을 결정짓습니다.\n\n당신은 [${userSaju?.day_pillar?.heavenly?.element === "wood" ? "木(목) - 뻗어나가는 나무" : userSaju?.day_pillar?.heavenly?.element === "fire" ? "火(화) - 타오르는 불꽃" : userSaju?.day_pillar?.heavenly?.element === "earth" ? "土(토) - 품어주는 대지" : userSaju?.day_pillar?.heavenly?.element === "metal" ? "金(금) - 단단한 바위나 보석" : "水(수) - 흐르는 강물이나 바다"}]의 에너지를 품고 태어났습니다. ${userSaju?.day_pillar?.heavenly?.element === "wood" ? "이는 곧게 위로 성장하려는 진취력, 어떤 역경에도 꺾이지 않고 봄을 향해 나아가는 생명력을 상징합니다. 남을 보살피는 어진 마음(仁)이 기본 바탕에 깔려 있으며, 창도적이고 미래 지향적인 리더십을 발휘할 때 가장 큰 빛을 발합니다." : userSaju?.day_pillar?.heavenly?.element === "fire" ? "이는 세상에 빛과 열기를 전하는 뜨거운 열정, 예의(禮)를 중시하며 언제나 솔직 담백하게 자신을 드러내는 성향을 상징합니다. 예술적 감각이 뛰어나고, 주변 사람들에게 영감을 주며, 무언가를 폭발적으로 시작해내는 에너지가 가장 매력적인 장점입니다." : userSaju?.day_pillar?.heavenly?.element === "earth" ? "이는 만물을 길러내고 포용하는 넓은 대지와 같습니다. 묵묵히 중심을 지키고 다른 기운들이 조화를 이루도록 돕는 중재자 역할을 하며, 신의(信)와 균형 감각이 뛰어납니다. 쉽게 흔들리지 않는 든든함으로 주변 사람들의 절대적인 신뢰를 끄는 힘이 있습니다." : userSaju?.day_pillar?.heavenly?.element === "metal" ? "이는 세월 속에 다듬어진 단단한 쇠나 제련된 보석을 의미합니다. 옳고 그름을 명확히 하는 결단력과 정의(義), 그리고 본사물의 핵심을 파악하는 분석력이 탁월합니다. 겉으로는 차가워 보일 수 있으나 한번 맺은 인연에 대해서는 무서운 의리를 보여주는 외유내강의 전형입니다." : "이는 쉼 없이 아래로 흐르며 생명을 이어나가는 지혜(智)와 유연함을 뜻합니다. 어떠한 형태의 그릇에 담겨도 스스로 모양을 바꾸듯 타인에 대한 공감 능력과 환경 적응력이 타의 추종을 불허합니다. 깊은 사유와 자유로운 사고방식이 성공의 가장 큰 열쇠가 됩니다."}\n\n이 작은 글자 하나가 당신이 세상과 소통하는 창문이 됩니다. 내 안의 기운을 스스로 사랑하고 긍정할 때, 운명의 주도권을 쥘 수 있습니다.`
                                    })}
                                    className="cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-xl transition-colors"
                                >
                                    <h3 className="text-[17px] font-black text-gray-900 mb-1.5 flex items-center gap-0.5">나의 일간: {userSaju?.day_pillar?.heavenly?.label || "알 수 없음"} <ChevronRight className="w-[18px] h-[18px] text-gray-400 translate-y-[0.5px]" /></h3>
                                    <p className="text-[15px] text-gray-600 font-bold leading-[1.6] break-keep line-clamp-2">
                                        사주의 중심이 되는 기운입니다. {userSaju?.day_pillar?.heavenly?.element === "wood" ? "나무처럼 곧고 성장하려는 본질적인 성향을" : userSaju?.day_pillar?.heavenly?.element === "fire" ? "불처럼 열정적이고 밝은 본질적인 성향을" : userSaju?.day_pillar?.heavenly?.element === "earth" ? "흙처럼 포용력 있고 길러내는 본질적인 성향을" : userSaju?.day_pillar?.heavenly?.element === "metal" ? "쇠처럼 단단하고 결단력 있는 본질적인 성향을" : "물처럼 유연하고 지혜로운 본질적인 성향을"} 가지고 있습니다.
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
                                        {userSaju ? `목(${elementCounts["목"]}), 화(${elementCounts["화"]}), 토(${elementCounts["토"]}), 금(${elementCounts["금"]}), 수(${elementCounts["수"]})` : "음양오행"}로 이루어져 있습니다. 위 그래프를 통해 본인의 오행 밸런스를 확인해 보세요.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ==== 영역 2: 내 삶의 나침반! 심층 분석 ==== */}
                        <section className="bg-white rounded-[32px] p-7 pt-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5 flex flex-col gap-8">
                            <div>
                                <div className="text-[13px] text-gray-400 font-bold mb-1 tracking-wider uppercase">내 삶의 나침반</div>
                                <h2 className="text-[26px] font-black tracking-tight text-gray-900 mb-2">정통 사주 심층 분석</h2>
                            </div>

                            {/* 정통 사주 리딩 파트 */}
                            <div>
                                <h3 className="text-[15px] font-black text-gray-800 mb-5 flex items-center gap-2"><span className="w-1.5 h-4 bg-[#FFB199] rounded-full block"></span>종합 운세</h3>
                                <div className="grid grid-cols-4 gap-y-8 gap-x-2">
                                    <Link href="/saju/confirm?type=정통사주" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-transform active:scale-95">
                                        <SpotIcon emoji="🐯" />
                                        <span className="text-[13px] font-bold text-gray-700 tracking-tight">정통 명리</span>
                                    </Link>
                                    <Link href="/saju/confirm?type=신년 흐름" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-transform active:scale-95">
                                        <SpotIcon emoji="🐍" />
                                        <span className="text-[13px] font-bold text-gray-700 tracking-tight">신년 흐름</span>
                                    </Link>
                                    <Link href="/saju/confirm?type=토정비결" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-transform active:scale-95">
                                        <SpotIcon emoji="🐉" />
                                        <span className="text-[13px] font-bold text-gray-700 tracking-tight">토정비결</span>
                                    </Link>
                                    <Link href="/saju/confirm?type=천생복덕운" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-transform active:scale-95">
                                        <SpotIcon emoji="🐨" />
                                        <span className="text-[13px] font-bold text-gray-700 tracking-tight">타고난 잠재력</span>
                                    </Link>
                                </div>
                            </div>

                            {/* 커리어 파트 */}
                            <div className="pt-8 border-t border-gray-100/60 mt-2">
                                <h3 className="text-[15px] font-black text-gray-800 mb-5 flex items-center gap-2"><span className="w-1.5 h-4 bg-blue-300 rounded-full block"></span>포텐셜 및 커리어</h3>
                                <div className="grid grid-cols-3 gap-x-2 gap-y-8">
                                    <Link href="/saju/confirm?type=취업 운세" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-transform active:scale-95">
                                        <div className="w-[64px] h-[64px] bg-white border border-gray-100/80 rounded-[20px] shadow-sm flex items-center justify-center relative mb-1 ring-1 ring-black/5">
                                            <div className="absolute w-[24px] h-[24px] bg-[#E2E8F0] rounded-full bottom-1 right-1 opacity-80"></div>
                                            <span className="relative z-10 text-[30px] group-hover:-translate-y-1 transition-transform drop-shadow-sm">💼</span>
                                        </div>
                                        <span className="text-[13px] font-bold text-gray-700">커리어 운</span>
                                    </Link>
                                    <Link href="/saju/confirm?type=능력 평가" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-transform active:scale-95">
                                        <div className="w-[64px] h-[64px] bg-white border border-gray-100/80 rounded-[20px] shadow-sm flex items-center justify-center relative mb-1 ring-1 ring-black/5">
                                            <div className="absolute w-[24px] h-[24px] bg-[#E2E8F0] rounded-full top-2 right-1 opacity-80"></div>
                                            <span className="relative z-10 text-[30px] group-hover:-translate-y-1 transition-transform drop-shadow-sm">📈</span>
                                        </div>
                                        <span className="text-[13px] font-bold text-gray-700">역량 평가</span>
                                    </Link>
                                    <Link href="/saju/confirm?type=심리 분석" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-transform active:scale-95">
                                        <div className="w-[64px] h-[64px] bg-white border border-gray-100/80 rounded-[20px] shadow-sm flex items-center justify-center relative mb-1 ring-1 ring-black/5">
                                            <div className="absolute w-[24px] h-[24px] bg-[#E2E8F0] rounded-full bottom-2 left-1 opacity-80"></div>
                                            <span className="relative z-10 text-[30px] group-hover:-translate-y-1 transition-transform drop-shadow-sm">🦋</span>
                                        </div>
                                        <span className="text-[13px] font-bold text-gray-700">자아 탐구</span>
                                    </Link>
                                </div>
                            </div>

                            {/* 선천 파트 */}
                            <div className="pt-8 border-t border-gray-100/60 mt-2">
                                <h3 className="text-[15px] font-black text-gray-800 mb-5 flex items-center gap-2"><span className="w-1.5 h-4 bg-[#A8D5BA] rounded-full block"></span>나의 선천적 디자인</h3>
                                <div className="grid grid-cols-4 gap-y-9 gap-x-2">
                                    <Link href="/saju/confirm?type=띠 운세" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-transform active:scale-95">
                                        <SpotIcon emoji="🐵" />
                                        <span className="text-[13px] font-bold text-gray-700 tracking-tight">띠 해석</span>
                                    </Link>
                                    <Link href="/saju/confirm?type=별자리 운세" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-transform active:scale-95">
                                        <SpotIcon emoji="✨" />
                                        <span className="text-[13px] font-bold text-gray-700 tracking-tight">별자리표</span>
                                    </Link>
                                    <Link href="/saju/confirm?type=태어난 계절운" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-transform active:scale-95">
                                        <SpotIcon emoji="🌸" />
                                        <span className="text-[13px] font-bold text-gray-700 tracking-tight">계절 에너지</span>
                                    </Link>
                                    <Link href="/saju/confirm?type=생년월일 운세" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-transform active:scale-95">
                                        <SpotIcon emoji="🎂" />
                                        <span className="text-[13px] font-bold text-gray-700 tracking-tight">나침반 흐름</span>
                                    </Link>
                                    <div onClick={() => palmInputRef.current?.click()} className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-transform active:scale-95">
                                        <SpotIcon emoji="🖐️" />
                                        <span className="text-[13px] font-bold text-gray-700 tracking-tight">나의 손금</span>
                                        <input type="file" accept="image/*" ref={palmInputRef} className="hidden" onChange={handlePalmUpload} />
                                    </div>
                                    <Link href="/saju/confirm?type=전생운" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-transform active:scale-95">
                                        <SpotIcon emoji="🔮" />
                                        <span className="text-[13px] font-bold text-gray-700 tracking-tight">과거의 나</span>
                                    </Link>
                                    <Link href="/saju/confirm?type=탄생석" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-transform active:scale-95">
                                        <SpotIcon emoji="💎" hasBadge />
                                        <span className="text-[13px] font-bold text-gray-700 tracking-tight">퍼스널 젬잼</span>
                                    </Link>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

            </main>

            <BottomNav />

            {/* Element Detail Modal */}
            {elementDetailModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setElementDetailModal({ ...elementDetailModal, isOpen: false })}>
                    <div className="bg-white rounded-3xl p-6 w-[85%] max-w-[340px] shadow-2xl relative text-center flex flex-col items-center" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setElementDetailModal({ ...elementDetailModal, isOpen: false })} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X size={20} /></button>
                        <h3 className="text-xl font-bold text-gray-900 mb-4 whitespace-pre-wrap leading-tight">{elementDetailModal.title}</h3>
                        <div className="bg-gray-50 p-4 rounded-2xl w-full border border-gray-100 max-h-[60vh] overflow-y-auto text-left relative hidden-scrollbar">
                            <p className="text-[14px] text-gray-800 leading-[1.8] font-medium whitespace-pre-wrap break-keep">{elementDetailModal.content}</p>
                        </div>
                    </div>
                </div>
            )}

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

        </div>
    );
}
