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

// Helper for the yellow circle + black line icon style
const SpotIcon = ({ icon: Icon, hasBadge = false }: { icon: any, hasBadge?: boolean }) => (
    <div className="relative w-[46px] h-[46px] flex items-center justify-center">
        {/* Yellow Spot Background */}
        <div className="absolute w-[22px] h-[22px] bg-[#fbff3a] rounded-full bottom-0 right-1 translate-x-1/4 translate-y-1/4"></div>
        <Icon size={32} strokeWidth={1.5} className="relative z-10 text-[#222]" />
        {hasBadge && (
            <span className="absolute top-0 right-[-2px] text-[10px] font-bold text-red-500 bg-white rounded-full leading-none z-20">N</span>
        )}
    </div>
);

// Helper for pure circle line icon (no yellow spot) used in list
const CircleIcon = ({ icon: Icon, bgColor = "bg-white" }: { icon: any, bgColor?: string }) => (
    <div className={`w-[48px] h-[48px] rounded-full flex items-center justify-center border border-gray-100 ${bgColor} shadow-sm shrink-0`}>
        <Icon size={24} strokeWidth={1.5} className="text-[#222]" />
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
    const [traitResult, setTraitResult] = useState({ title: "", desc: "" });

    const [showMoving, setShowMoving] = useState(false);

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
        if (userSaju && userSaju.day_pillar) {
            const dayElem = userSaju.day_pillar.heavenly.element;
            if (dayElem === "목") { title = "태을귀인"; desc = "학문과 지혜를 돕는 강력한 귀인의 기운이 있습니다." }
            else if (dayElem === "화") { title = "천을귀인"; desc = "주변의 도움으로 위기를 모면하는 최고의 길신이 함께합니다." }
            else if (dayElem === "토") { title = "문창귀인"; desc = "글재주가 뛰어나고 지혜로우며 흉운을 길운으로 바꿉니다." }
            else if (dayElem === "금") { title = "천주귀인"; desc = "의식이 풍부하고 평생 의식주 걱정이 없는 복덕운입니다." }
            else if (dayElem === "수") { title = "금여록"; desc = "부귀와 안락을 상징하며 좋은 배우자를 만날 귀한 운입니다." }
        }
        setTraitResult({ title, desc });
        setShowTrait(true);
    };

    // 3. Talisman Logic
    const handleTalisman = () => {
        let type = "wealth";
        if (userSaju && userSaju.month_pillar) {
            const mg = userSaju.month_pillar.earthly.ten_god;
            if (mg?.includes("관성")) type = "career";
            else if (mg?.includes("재성")) type = "wealth";
            else if (mg?.includes("인성")) type = "health";
            else if (mg?.includes("비겁")) type = "love";
        }
        router.push(`/store?type=${type}`);
    };

    // 4. Moving Logic
    const getMovingDates = () => {
        const today = new Date();
        const dates = [];
        for (let i = 1; i <= 14; i++) {
            const d = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
            // 심플화: 태양력 날짜 숫자 끝이 9, 0 인 경우를 손없는 날로 대체하여 샘플 표시 (실제는 음력이어야함)
            const dayStr = d.getDate().toString();
            if (dayStr.endsWith("9") || dayStr.endsWith("0")) {
                dates.push(`${d.getMonth() + 1}월 ${d.getDate()}일`);
            }
        }
        return dates.slice(0, 3);
    };

    // 5. Face Reading Logic
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setShowFace(true);
        setIsAnalyzing(true);
        setFaceResult("");

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64Str = event.target?.result as string;
            try {
                const res = await fetch("https://saju-web.onrender.com/api/physiognomy", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ image_base64: base64Str })
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
        reader.readAsDataURL(file);
    };

    return (
        <div className="min-h-screen bg-[#F5F6F8] text-[#111111] pb-[100px] font-pretendard">

            {/* Header */}
            <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 h-14 max-w-md mx-auto flex items-center px-5 justify-between">
                <h1 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">운세</h1>
                <button className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-full transition-colors">
                    <RefreshCw size={14} className="text-gray-500" />
                    {userName ? `${userName}님` : "방문자님"}
                </button>
            </header>

            <main className="max-w-md mx-auto flex flex-col gap-3 px-4 pt-3">

                {/* Banner */}
                <div className="w-full bg-[#ffcc99] rounded-[24px] p-6 relative overflow-hidden shadow-sm h-[130px] flex items-center cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#ffd4a6] to-[#ffb870] z-0"></div>
                    <div className="relative z-10 flex flex-col h-full justify-center pb-2">
                        <span className="bg-[#111] text-white text-[10px] px-2.5 py-1 rounded-full w-max font-bold mb-2">복주머니 모으기 {'>'}</span>
                        <h2 className="text-[20px] font-extrabold leading-tight text-[#222]">
                            미션하면 복이<br />몽글몽글
                        </h2>
                        <p className="text-[12px] text-gray-800 mt-1.5 font-medium">복주머니 톡, 봄이 톡!</p>
                    </div>
                    {/* Dummy 3D illustration representation */}
                    <div className="absolute right-[-10px] bottom-[-30px] w-[140px] h-[150px] bg-gradient-to-t from-orange-400 to-orange-200 rounded-full blur-2xl opacity-60 z-0"></div>
                    <div className="absolute right-1 bottom-0 text-[100px] leading-none z-10 drop-shadow-lg">
                        🐴
                    </div>
                    {/* Pagination Dots */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                        <div className="w-1.5 h-1.5 rounded-full bg-white opacity-100"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40"></div>
                    </div>
                </div>

                {/* Section 1: 사주 풀이 (Grid) */}
                <section className="bg-white rounded-[24px] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
                    <div className="mb-5">
                        <span className="text-[12px] text-gray-400 font-medium tracking-tight">소름 돋는 미래 예측</span>
                        <h2 className="text-[20px] font-extrabold mt-0.5 text-[#111]">가장 정확한 사주 풀이</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-y-7 gap-x-2">
                        <Link href="/saju/confirm?type=신년운세" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon icon={Calendar} hasBadge />
                            <span className="text-[13px] font-medium text-gray-800 tracking-tight">신년운세</span>
                        </Link>
                        <Link href="/saju/confirm?type=토정비결" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon icon={BookOpen} hasBadge />
                            <span className="text-[13px] font-medium text-gray-800 tracking-tight">토정비결</span>
                        </Link>
                        <Link href="/saju/confirm?type=정통사주" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon icon={FileText} hasBadge />
                            <span className="text-[13px] font-medium text-gray-800 tracking-tight">정통사주</span>
                        </Link>
                        <Link href="/saju/confirm?type=오늘의운세" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon icon={Sun} />
                            <span className="text-[13px] font-medium text-gray-800 tracking-tight">오늘의 운세</span>
                        </Link>
                        <Link href="/saju/confirm?type=내일의운세" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon icon={Clock} />
                            <span className="text-[13px] font-medium text-gray-800 tracking-tight">내일의 운세</span>
                        </Link>
                        <Link href="/saju/confirm?type=지정일 운세" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon icon={ClipboardCheck} />
                            <span className="text-[13px] font-medium text-gray-800 tracking-tight">지정일 운세</span>
                        </Link>
                        {/* Hidden rows from screenshot 2 but added for fullness */}
                        <Link href="/saju/confirm?type=궁합" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon icon={HeartHandshake} hasBadge />
                            <span className="text-[13px] font-medium text-gray-800 tracking-tight">궁합</span>
                        </Link>
                    </div>
                </section>

                {/* Section 2: 액운 방지 (List) -> "손쉽게 행운을 얻는 방법" */}
                <section className="bg-white rounded-[24px] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
                    <div className="mb-5">
                        <span className="text-[12px] text-gray-400 font-medium tracking-tight">액운 방지</span>
                        <h2 className="text-[20px] font-extrabold mt-0.5 text-[#111]">손쉽게 행운을 얻는 방법</h2>
                    </div>
                    <div className="flex flex-col gap-6">
                        {/* 1. 행운의 번호 */}
                        <div onClick={handleLotto} className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-opacity">
                            <CircleIcon icon={Dices} />
                            <div className="flex flex-col">
                                <h3 className="text-[16px] font-bold text-[#222]">행운의 번호</h3>
                                <p className="text-[13px] text-gray-400 mt-0.5">내 인생을 바꿔줄 6개의 숫자</p>
                            </div>
                        </div>
                        {/* 2. 천생복덕운 */}
                        <div onClick={handleTrait} className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-opacity">
                            <CircleIcon icon={Gift} />
                            <div className="flex flex-col">
                                <h3 className="text-[16px] font-bold text-[#222]">천생복덕운</h3>
                                <p className="text-[13px] text-gray-400 mt-0.5">내 사주에 숨겨진 귀인과 복</p>
                            </div>
                        </div>
                        {/* 3. 행운의 부적 */}
                        <div onClick={handleTalisman} className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-opacity">
                            <CircleIcon icon={FileBadge} />
                            <div className="flex flex-col">
                                <h3 className="text-[16px] font-bold text-[#222]">행운의 부적</h3>
                                <p className="text-[13px] text-gray-400 mt-0.5">나에게 꼭 필요한 맞춤 기운</p>
                            </div>
                        </div>
                        {/* 4. 이사택일 */}
                        <div onClick={() => setShowMoving(true)} className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-opacity">
                            <CircleIcon icon={CalendarCheck} />
                            <div className="flex flex-col">
                                <h3 className="text-[16px] font-bold text-[#222]">이사택일</h3>
                                <p className="text-[13px] text-gray-400 mt-0.5">한눈에 보는 이사하기 좋은 날</p>
                            </div>
                        </div>
                        {/* 5. 관상 */}
                        <div onClick={() => fileInputRef.current?.click()} className="flex items-center gap-4 group cursor-pointer hover:opacity-80 transition-opacity">
                            <CircleIcon icon={Users} />
                            <div className="flex flex-col">
                                <h3 className="text-[16px] font-bold text-[#222]">관상</h3>
                                <p className="text-[13px] text-gray-400 mt-0.5">얼굴에 적힌 운명 AI 분석</p>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                capture="user"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handlePhotoUpload}
                            />
                        </div>
                    </div>
                </section>

                {/* Section 3: 직업 및 진로 (Grid) */}
                <section className="bg-white rounded-[24px] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
                    <div className="mb-5">
                        <span className="text-[12px] text-gray-400 font-medium tracking-tight">취업과 진로</span>
                        <h2 className="text-[20px] font-extrabold mt-0.5 text-[#111]">내게 맞는 직업 찾기</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-x-2">
                        <Link href="#" className="flex flex-col items-center gap-2 group cursor-pointer">
                            <div className="w-[60px] h-[60px] bg-white border border-gray-100 rounded-[18px] shadow-sm flex items-center justify-center relative mb-1">
                                <div className="absolute w-[22px] h-[22px] bg-[#fbff3a] rounded-full bottom-1 right-1 opacity-80"></div>
                                <Briefcase size={28} strokeWidth={1.5} className="relative z-10 text-[#222] group-hover:-translate-y-1 transition-transform" />
                            </div>
                            <span className="text-[13px] font-bold text-gray-800">취업 운세</span>
                        </Link>
                        <Link href="#" className="flex flex-col items-center gap-2 group cursor-pointer">
                            <div className="w-[60px] h-[60px] bg-white border border-gray-100 rounded-[18px] shadow-sm flex items-center justify-center relative mb-1">
                                <div className="absolute w-[22px] h-[22px] bg-[#fbff3a] rounded-full top-2 right-1 opacity-80"></div>
                                <LineChart size={28} strokeWidth={1.5} className="relative z-10 text-[#222] group-hover:-translate-y-1 transition-transform" />
                            </div>
                            <span className="text-[13px] font-bold text-gray-800">능력 평가</span>
                        </Link>
                        <Link href="#" className="flex flex-col items-center gap-2 group cursor-pointer">
                            <div className="w-[60px] h-[60px] bg-white border border-gray-100 rounded-[18px] shadow-sm flex items-center justify-center relative mb-1">
                                <div className="absolute w-[22px] h-[22px] bg-[#fbff3a] rounded-full bottom-2 left-1 opacity-80"></div>
                                <BrainCircuit size={28} strokeWidth={1.5} className="relative z-10 text-[#222] group-hover:-translate-y-1 transition-transform" />
                            </div>
                            <span className="text-[13px] font-bold text-gray-800">심리 분석</span>
                        </Link>
                    </div>
                </section>

                {/* Section 4: 해결책 (Cards) */}
                <section className="bg-white rounded-[24px] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
                    <div className="mb-5">
                        <span className="text-[12px] text-gray-400 font-medium tracking-tight">소원을 이뤄요</span>
                        <h2 className="text-[20px] font-extrabold mt-0.5 text-[#111]">지금 필요한 해결책</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pb-2">
                        <Link href="#" className="bg-[#f8f9fb] rounded-[20px] p-4 h-[130px] flex flex-col justify-between group cursor-pointer hover:bg-gray-100 transition-colors relative overflow-hidden">
                            <div>
                                <h3 className="text-[15px] font-bold text-[#111]">소원담벼락</h3>
                                <p className="text-[11px] text-gray-500 mt-1 leading-tight w-[80%]">함께 비는 소원은<br />더 빨리 이뤄져요</p>
                            </div>
                            <div className="absolute bottom-3 right-3 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm">
                                <div className="absolute w-[14px] h-[14px] bg-[#fbff3a] rounded-full top-1 right-1 opacity-80"></div>
                                <MessageSquareHeart size={20} className="relative z-10 text-[#222]" />
                            </div>
                        </Link>
                        <Link href="#" className="bg-[#f8f9fb] rounded-[20px] p-4 h-[130px] flex flex-col justify-between group cursor-pointer hover:bg-gray-100 transition-colors relative overflow-hidden">
                            <div>
                                <h3 className="text-[15px] font-bold text-[#111]">고민구슬</h3>
                                <p className="text-[11px] text-gray-500 mt-1 leading-tight w-[80%]">머리 아픈 고민!<br />3초만에 끝내기</p>
                            </div>
                            <div className="absolute bottom-3 right-3 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm">
                                <div className="absolute w-[14px] h-[14px] bg-[#fbff3a] rounded-full bottom-1 right-1 opacity-80"></div>
                                <Sparkles size={20} className="relative z-10 text-[#222]" />
                            </div>
                        </Link>
                        <Link href="#" className="bg-[#f8f9fb] rounded-[20px] p-4 h-[130px] flex flex-col justify-between group cursor-pointer hover:bg-gray-100 transition-colors relative overflow-hidden">
                            <div>
                                <h3 className="text-[15px] font-bold text-[#111]">점신 1:1 상담</h3>
                                <p className="text-[11px] text-gray-500 mt-1 leading-tight w-[85%]">혼자 해결하기 어려운<br />문제가 있다면</p>
                            </div>
                            <div className="absolute bottom-3 right-3 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm border border-[#fbff3a]">
                                <Headset size={20} className="text-[#222]" />
                            </div>
                        </Link>
                        <Link href="#" className="bg-[#f8f9fb] rounded-[20px] p-4 h-[130px] flex flex-col justify-between group cursor-pointer hover:bg-gray-100 transition-colors relative overflow-hidden">
                            <div>
                                <h3 className="text-[15px] font-bold text-[#111]">포춘쿠키</h3>
                                <p className="text-[11px] text-gray-500 mt-1 leading-tight w-[90%]">오늘의 당신에게<br />필요한 한마디</p>
                            </div>
                            <div className="absolute bottom-3 right-3 w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm">
                                <Cookie size={20} className="text-[#222]" />
                            </div>
                        </Link>
                    </div>
                </section>

                {/* Section 5: 타고난 운명 (Grid) */}
                <section className="bg-white rounded-[24px] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
                    <div className="mb-5">
                        <span className="text-[12px] text-gray-400 font-medium tracking-tight">타고난 운명</span>
                        <h2 className="text-[20px] font-extrabold mt-0.5 text-[#111]">나에 대한 모든 것</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-y-7 gap-x-2">
                        <Link href="/saju/confirm?type=띠 운세" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon icon={Cat} />
                            <span className="text-[13px] font-medium text-gray-800 tracking-tight">띠 운세</span>
                        </Link>
                        <Link href="/saju/confirm?type=별자리 운세" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon icon={Stars} />
                            <span className="text-[13px] font-medium text-gray-800 tracking-tight">별자리 운세</span>
                        </Link>
                        <Link href="/saju/confirm?type=태어난 계절운" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon icon={CloudSun} />
                            <span className="text-[13px] font-medium text-gray-800 tracking-tight">태어난 계절운</span>
                        </Link>
                        <Link href="/saju/confirm?type=생년월일 운세" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon icon={Cake} />
                            <span className="text-[13px] font-medium text-gray-800 tracking-tight">생년월일 운세</span>
                        </Link>
                        <Link href="/saju/confirm?type=전생운" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon icon={Globe2} />
                            <span className="text-[13px] font-medium text-gray-800 tracking-tight">전생운</span>
                        </Link>
                        <Link href="/saju/confirm?type=탄생석" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon icon={Gem} hasBadge />
                            <span className="text-[13px] font-medium text-gray-800 tracking-tight">탄생석</span>
                        </Link>
                    </div>
                </section>

                {/* Section 6: 궁합 파헤치기 (List Variant) */}
                <section className="bg-white rounded-[24px] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
                    <div className="mb-5">
                        <span className="text-[12px] text-gray-400 font-medium tracking-tight">궁합 파헤치기</span>
                        <h2 className="text-[20px] font-extrabold mt-0.5 text-[#111]">우리는 어떻게 될까?</h2>
                    </div>
                    <div className="flex flex-col gap-5">
                        <Link href="/saju/confirm?type=짝궁합" className="flex items-center gap-4 group cursor-pointer">
                            <div className="w-[52px] h-[52px] rounded-full bg-[#f8f9fb] flex items-center justify-center border border-gray-100 shadow-sm shrink-0">
                                <div className="absolute w-[18px] h-[18px] bg-[#fbff3a] rounded-full opacity-80"></div>
                                <HeartHandshake size={24} strokeWidth={1.5} className="relative z-10 text-[#222]" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-[16px] font-bold text-[#222]">짝궁합</h3>
                                <p className="text-[13px] text-gray-400 mt-0.5">쉽고 자세한 해석을 원한다면!</p>
                            </div>
                        </Link>
                        <Link href="/saju/confirm?type=정통궁합" className="flex items-center gap-4 group cursor-pointer">
                            <div className="w-[52px] h-[52px] rounded-full bg-[#f8f9fb] flex items-center justify-center border border-gray-100 shadow-sm shrink-0">
                                <div className="absolute w-[18px] h-[18px] bg-[#fbff3a] rounded-full translate-x-1 opacity-80"></div>
                                <Puzzle size={24} strokeWidth={1.5} className="relative z-10 text-[#222]" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-[16px] font-bold text-[#222]">정통궁합</h3>
                                <p className="text-[13px] text-gray-400 mt-0.5">연애 시작 전 확인 필수!</p>
                            </div>
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
                        <div className="bg-gray-50 p-4 rounded-2xl w-full text-center">
                            <p className="text-sm text-gray-700 leading-relaxed font-medium break-keep">{traitResult.desc}</p>
                        </div>
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
                        <p className="text-sm text-gray-500 mb-4">다음에 다가오는 이사하기 좋은 날입니다.</p>
                        <div className="flex flex-col gap-2 w-full">
                            {getMovingDates().map((date, i) => (
                                <div key={i} className="bg-blue-50 text-blue-800 font-bold py-3 rounded-xl">
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
