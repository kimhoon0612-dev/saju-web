"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    RefreshCw,
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

export default function FortuneHubPage() {
    const router = useRouter();
    const [userName, setUserName] = useState("");
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

    // Physiognomy States
    const [showFace, setShowFace] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [faceResult, setFaceResult] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const storedInfo = sessionStorage.getItem("saju_user_info");
        const storedSaju = sessionStorage.getItem("saju_matrix_data");
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

        if (userSaju && userSaju.day_pillar) {
            const dayElem = userSaju.day_pillar.heavenly.element;
            const dayLabel = userSaju.day_pillar.heavenly.label;

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

        if (userSaju && userSaju.month_pillar) {
            const mg = userSaju.month_pillar.earthly.ten_god || "";
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

    return (
        <div className="min-h-screen bg-[#FDFBFA] text-[#2D3748] pb-24 font-pretendard">

            {/* Header */}
            <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 h-14 max-w-md mx-auto flex items-center px-5 justify-between border-b border-gray-50">
                <h1 className="text-xl font-extrabold text-[#4A5568]">나의 흐름</h1>
                <button className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:bg-gray-50 px-3 py-1.5 rounded-full transition-colors border border-gray-100 shadow-sm">
                    <RefreshCw size={14} className="text-gray-400" />
                    {userName ? `${userName}님` : "방문자님"}
                </button>
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

                {/* Section 1: 사주 풀이 (Grid) */}
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="mb-5">
                        <span className="text-[12px] text-gray-400 font-bold tracking-tight">명리학 기반 인사이트</span>
                        <h2 className="text-[20px] font-black mt-0.5 text-[#4A5568]">정통 명리 베이직</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-y-7 gap-x-2">
                        <Link href="/saju/confirm?type=신년 흐름" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon emoji="🐍" hasBadge />
                            <span className="text-[13px] font-bold text-gray-700 tracking-tight">신년 흐름</span>
                        </Link>
                        <Link href="/saju/confirm?type=토정비결" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon emoji="🐉" hasBadge />
                            <span className="text-[13px] font-bold text-gray-700 tracking-tight">토정비결</span>
                        </Link>
                        <Link href="/saju/confirm?type=정통사주" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon emoji="🐯" hasBadge />
                            <span className="text-[13px] font-bold text-gray-700 tracking-tight">정통 명리</span>
                        </Link>
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
                        {/* Hidden rows from screenshot 2 but added for fullness */}
                        <Link href="/saju/confirm?type=타인과의 궁합" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon emoji="🐰" hasBadge />
                            <span className="text-[13px] font-bold text-gray-700 tracking-tight">타인과의 궁합</span>
                        </Link>
                    </div>
                </section>

                {/* Section 2: 액운 방지 (List) -> "간편한 행운 팁" */}
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="mb-5">
                        <span className="text-[12px] text-gray-400 font-bold tracking-tight">상황별 맞춤 분석</span>
                        <h2 className="text-[20px] font-black mt-0.5 text-[#4A5568]">운의 흐름 팁</h2>
                    </div>
                    <div className="flex flex-col gap-6">
                        {/* 1. 행운의 번호 */}
                        <div onClick={handleLotto} className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-opacity">
                            <CircleIcon emoji="🐷" />
                            <div className="flex flex-col">
                                <h3 className="text-[16px] font-black text-[#4A5568]">퍼스널 행운 번호</h3>
                                <p className="text-[13px] text-gray-400 mt-0.5 font-medium">나만의 시그니처 넘버 6개</p>
                            </div>
                        </div>
                        {/* 2. 천생복덕운 (타고난 잠재력) - AI 읽기로 라우팅 */}
                        <Link href="/saju/confirm?type=천생복덕운" className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-opacity">
                            <CircleIcon emoji="🐨" />
                            <div className="flex flex-col">
                                <h3 className="text-[16px] font-black text-[#4A5568]">타고난 잠재력</h3>
                                <p className="text-[13px] text-gray-400 mt-0.5 font-medium">명리가 알려주는 나의 감춰진 강점</p>
                            </div>
                        </Link>
                        {/* 3. 행운의 부적 */}
                        <div onClick={handleTalisman} className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-opacity">
                            <CircleIcon emoji="🐢" />
                            <div className="flex flex-col">
                                <h3 className="text-[16px] font-black text-[#4A5568]">에너지 부스터</h3>
                                <p className="text-[13px] text-gray-400 mt-0.5 font-medium">지금 내게 필요한 맞춤형 긍정 에너지</p>
                            </div>
                        </div>
                        {/* 4. 이사택일 */}
                        <div onClick={() => setShowMoving(true)} className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-opacity">
                            <CircleIcon emoji="🐌" />
                            <div className="flex flex-col">
                                <h3 className="text-[16px] font-black text-[#4A5568]">캘린더 매니징</h3>
                                <p className="text-[13px] text-gray-400 mt-0.5 font-medium">이사/중요 일정 길일 찾기</p>
                            </div>
                        </div>
                        {/* 5. 관상 */}
                        <div onClick={() => fileInputRef.current?.click()} className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-opacity">
                            <CircleIcon emoji="🦊" />
                            <div className="flex flex-col">
                                <h3 className="text-[16px] font-black text-[#4A5568]">나의 관상</h3>
                                <p className="text-[13px] text-gray-400 mt-0.5 font-medium">AI가 분석하는 첫인상과 이미지</p>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handlePhotoUpload}
                            />
                        </div>
                    </div>
                </section>

                {/* Section 3: 직업 및 진로 (Grid) */}
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="mb-5">
                        <span className="text-[12px] text-gray-400 font-bold tracking-tight">취업과 진로</span>
                        <h2 className="text-[20px] font-black mt-0.5 text-[#4A5568]">포텐셜 & 커리어</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-x-2">
                        <Link href="/saju/confirm?type=취업 운세" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="w-[60px] h-[60px] bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-center relative mb-1">
                                <div className="absolute w-[22px] h-[22px] bg-[#E2E8F0] rounded-full bottom-1 right-1 opacity-80"></div>
                                <span className="relative z-10 text-[28px] group-hover:-translate-y-1 transition-transform drop-shadow-sm">💼</span>
                            </div>
                            <span className="text-[13px] font-bold text-gray-700">커리어 운</span>
                        </Link>
                        <Link href="/saju/confirm?type=능력 평가" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="w-[60px] h-[60px] bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-center relative mb-1">
                                <div className="absolute w-[22px] h-[22px] bg-[#E2E8F0] rounded-full top-2 right-1 opacity-80"></div>
                                <span className="relative z-10 text-[28px] group-hover:-translate-y-1 transition-transform drop-shadow-sm">📈</span>
                            </div>
                            <span className="text-[13px] font-bold text-gray-700">역량 평가</span>
                        </Link>
                        <Link href="/saju/confirm?type=심리 분석" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="w-[60px] h-[60px] bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-center relative mb-1">
                                <div className="absolute w-[22px] h-[22px] bg-[#E2E8F0] rounded-full bottom-2 left-1 opacity-80"></div>
                                <span className="relative z-10 text-[28px] group-hover:-translate-y-1 transition-transform drop-shadow-sm">🦋</span>
                            </div>
                            <span className="text-[13px] font-bold text-gray-700">자아 탐구</span>
                        </Link>
                    </div>
                </section>



                {/* Section 5: 타고난 운명 (Grid) */}
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="mb-5">
                        <span className="text-[12px] text-gray-400 font-bold tracking-tight">나만의 고유 속성</span>
                        <h2 className="text-[20px] font-black mt-0.5 text-[#4A5568]">나의 선천적 디자인</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-y-7 gap-x-2">
                        <Link href="/saju/confirm?type=띠 운세" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon emoji="🐵" />
                            <span className="text-[13px] font-bold text-gray-700 tracking-tight">띠 해석</span>
                        </Link>
                        <Link href="/saju/confirm?type=별자리 운세" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon emoji="✨" />
                            <span className="text-[13px] font-bold text-gray-700 tracking-tight">별자리 지표</span>
                        </Link>
                        <Link href="/saju/confirm?type=태어난 계절운" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon emoji="🌸" />
                            <span className="text-[13px] font-bold text-gray-700 tracking-tight">계절 에너지</span>
                        </Link>
                        <Link href="/saju/confirm?type=생년월일 운세" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon emoji="🎂" />
                            <span className="text-[13px] font-bold text-gray-700 tracking-tight">나침반 흐름</span>
                        </Link>
                        <Link href="/saju/confirm?type=전생운" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon emoji="🔮" />
                            <span className="text-[13px] font-bold text-gray-700 tracking-tight">과거의 나</span>
                        </Link>
                        <Link href="/saju/confirm?type=탄생석" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon emoji="💎" hasBadge />
                            <span className="text-[13px] font-bold text-gray-700 tracking-tight">퍼스널 젬잼</span>
                        </Link>
                    </div>
                </section>


            </main>

            <BottomNav />

            {/* ==== MODALS ==== */}

            {/* 1. Lotto Modal */}
            {showLotto && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 w-[85%] max-w-[340px] shadow-2xl relative text-center flex flex-col items-center">
                        <button onClick={() => setShowLotto(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X size={20} /></button>
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                            <Dices size={24} className="text-yellow-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">행운의 번호</h3>
                        <p className="text-sm text-gray-500 mb-6">이번 주 행운을 가져다 줄 6개의 숫자입니다.</p>
                        <div className="flex flex-wrap justify-center gap-2 mb-4">
                            {lottoNumbers.map((num, i) => {
                                let bgClass = "bg-gray-200 text-gray-800";
                                if (num <= 10) bgClass = "bg-yellow-400 text-yellow-900";
                                else if (num <= 20) bgClass = "bg-blue-400 text-white";
                                else if (num <= 30) bgClass = "bg-red-400 text-white";
                                else if (num <= 40) bgClass = "bg-gray-400 text-white";
                                else bgClass = "bg-green-500 text-white";

                                return (
                                    <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${bgClass}`}>
                                        {num}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Trait Modal */}
            {showTrait && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 w-[85%] max-w-[340px] shadow-2xl relative text-center flex flex-col items-center">
                        <button onClick={() => setShowTrait(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X size={20} /></button>
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                            <Gift size={24} className="text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{traitResult.title}</h3>
                        <p className="text-sm text-gray-500 mb-4">{traitResult.reason}</p>
                        <div className="bg-gray-50 p-4 rounded-2xl w-full text-center">
                            <p className="text-[14px] text-gray-800 leading-relaxed font-medium break-keep">{traitResult.desc}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* 2-B. Talisman Modal */}
            {showTalisman && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 w-[85%] max-w-[340px] shadow-2xl relative text-center flex flex-col items-center">
                        <button onClick={() => setShowTalisman(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X size={20} /></button>
                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                            <FileBadge size={24} className="text-red-600" />
                        </div>
                        <span className="text-xs font-bold text-red-500 bg-red-100 px-2.5 py-1 rounded-full mb-3">맞춤 추천 부적</span>

                        <div className="flex overflow-x-auto gap-4 w-full pb-4 hidden-scrollbar snap-x snap-mandatory">
                            {talismanResults.map((t, idx) => (
                                <div key={idx} className="flex flex-col items-center min-w-[160px] snap-center shrink-0">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{t.title}</h3>
                                    <p className="text-xs text-gray-500 mb-3 max-w-[140px] mx-auto leading-relaxed">{t.desc}</p>

                                    <div className="w-[110px] h-[160px] bg-gradient-to-b from-yellow-50 to-orange-100 rounded-xl border-2 border-orange-200 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
                                        <div className="absolute inset-x-0 top-2 bottom-2 border-2 border-dashed border-orange-300 opacity-40 mx-2"></div>
                                        <span className="text-[32px] opacity-70">
                                            {t.type === "wealth" ? "🪙" : t.type === "career" ? "💼" : t.type === "health" ? "🌿" : "💖"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className="text-[11px] text-gray-400 mt-2">좌우로 스와이프하여 더 많은 부적을 확인하세요.</p>
                        <button onClick={() => router.push('/store')} className="mt-4 w-full py-3 bg-gray-900 text-white rounded-xl text-[14px] font-bold">부적 상점 가기</button>
                    </div>
                </div>
            )}

            {/* 3. Moving Date Modal */}
            {showMoving && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 w-[85%] max-w-[340px] shadow-2xl relative text-center flex flex-col items-center">
                        <button onClick={() => setShowMoving(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X size={20} /></button>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <CalendarCheck size={24} className="text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">길일 (손 없는 날)</h3>
                        <p className="text-sm text-gray-500 mb-4">이사하기 좋은 날을 월별로 확인해 보세요.</p>

                        <div className="flex items-center gap-2 mb-4 w-full justify-center">
                            <select
                                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 font-bold outline-none"
                                value={movingYear}
                                onChange={(e) => setMovingYear(Number(e.target.value))}
                            >
                                <option value={new Date().getFullYear()}>{new Date().getFullYear()}년</option>
                                <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}년</option>
                            </select>
                            <select
                                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 font-bold outline-none"
                                value={movingMonth}
                                onChange={(e) => setMovingMonth(Number(e.target.value))}
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                    <option key={m} value={m}>{m}월</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2 w-full max-h-[160px] overflow-y-auto hidden-scrollbar">
                            {getMovingDates().map((date, i) => (
                                <div key={i} className="bg-blue-50 text-blue-800 text-[14px] font-bold py-3 rounded-xl">
                                    {date}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 4. Physiognomy Modal */}
            {showFace && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 w-[85%] max-w-[340px] shadow-2xl relative text-center flex flex-col items-center max-h-[80vh] overflow-y-auto hidden-scrollbar">
                        {!isAnalyzing && <button onClick={() => setShowFace(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X size={20} /></button>}

                        <div className="w-14 h-14 bg-gradient-to-tr from-[#fbff3a] to-yellow-400 rounded-full flex items-center justify-center mb-4 shadow-sm">
                            <Camera size={26} className="text-yellow-900" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-4">AI 관상 분석</h3>

                        {isAnalyzing ? (
                            <div className="flex flex-col items-center justify-center py-6">
                                <Loader2 className="animate-spin text-yellow-500 mb-3" size={32} />
                                <p className="text-sm font-medium text-gray-600">얼굴의 굴곡과 기운을 읽는 중입니다...</p>
                            </div>
                        ) : (
                            <div className="text-left bg-gray-50 p-4 rounded-2xl w-full border border-gray-100">
                                <p className="text-[14px] text-gray-800 leading-relaxed font-medium break-keep whitespace-pre-wrap">
                                    {faceResult}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}
