"use client";

import Link from "next/link";
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
    ShieldOff, // 살풀이 (대체)
    FileBadge, // 행운의 부적 (대체)
    CalendarCheck, // 이사택일
    Users, // 관상 (대체)
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
    return (
        <div className="min-h-screen bg-[#F5F6F8] text-[#111111] pb-[100px] font-pretendard">

            {/* Header */}
            <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 h-14 max-w-md mx-auto flex items-center px-5 justify-between">
                <h1 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">운세</h1>
                <button className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-full transition-colors">
                    <RefreshCw size={14} className="text-gray-500" />
                    김훈님
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
                        <Link href="/saju" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon icon={Calendar} hasBadge />
                            <span className="text-[13px] font-medium text-gray-800 tracking-tight">신년운세</span>
                        </Link>
                        <Link href="/saju" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon icon={BookOpen} hasBadge />
                            <span className="text-[13px] font-medium text-gray-800 tracking-tight">토정비결</span>
                        </Link>
                        <Link href="/saju" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon icon={FileText} hasBadge />
                            <span className="text-[13px] font-medium text-gray-800 tracking-tight">정통사주</span>
                        </Link>
                        <Link href="/saju" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon icon={Sun} />
                            <span className="text-[13px] font-medium text-gray-800 tracking-tight">오늘의 운세</span>
                        </Link>
                        <Link href="/saju" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon icon={Clock} />
                            <span className="text-[13px] font-medium text-gray-800 tracking-tight">내일의 운세</span>
                        </Link>
                        <Link href="/saju" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon icon={ClipboardCheck} />
                            <span className="text-[13px] font-medium text-gray-800 tracking-tight">지정일 운세</span>
                        </Link>
                        {/* Hidden rows from screenshot 2 but added for fullness */}
                        <Link href="/saju" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon icon={Users} hasBadge />
                            <span className="text-[13px] font-medium text-gray-800 tracking-tight">관상</span>
                        </Link>
                        <Link href="/saju" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon icon={HeartHandshake} hasBadge />
                            <span className="text-[13px] font-medium text-gray-800 tracking-tight">궁합</span>
                        </Link>
                        <Link href="/saju" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon icon={Sparkles} hasBadge />
                            <span className="text-[13px] font-medium text-gray-800 tracking-tight">타로 운세</span>
                        </Link>
                    </div>
                </section>

                {/* Section 2: 액운 방지 (List) */}
                <section className="bg-white rounded-[24px] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
                    <div className="mb-5">
                        <span className="text-[12px] text-gray-400 font-medium tracking-tight">액운 방지</span>
                        <h2 className="text-[20px] font-extrabold mt-0.5 text-[#111]">손쉽게 행운을 얻는 방법</h2>
                    </div>
                    <div className="flex flex-col gap-6">
                        <Link href="#" className="flex items-center gap-4 group cursor-pointer">
                            <CircleIcon icon={Dices} />
                            <div className="flex flex-col">
                                <h3 className="text-[16px] font-bold text-[#222]">행운의 번호</h3>
                                <p className="text-[13px] text-gray-400 mt-0.5">내 인생을 바꿔줄 6개의 숫자</p>
                            </div>
                        </Link>
                        <Link href="#" className="flex items-center gap-4 group cursor-pointer">
                            <CircleIcon icon={Gift} />
                            <div className="flex flex-col">
                                <h3 className="text-[16px] font-bold text-[#222]">천생복덕운</h3>
                                <p className="text-[13px] text-gray-400 mt-0.5">타고난 복을 활용해 보세요</p>
                            </div>
                        </Link>
                        <Link href="#" className="flex items-center gap-4 group cursor-pointer">
                            <CircleIcon icon={ShieldOff} />
                            <div className="flex flex-col">
                                <h3 className="text-[16px] font-bold text-[#222]">살풀이</h3>
                                <p className="text-[13px] text-gray-400 mt-0.5">액운 방지에는 살풀이가 최고!</p>
                            </div>
                        </Link>
                        <Link href="#" className="flex items-center gap-4 group cursor-pointer">
                            <CircleIcon icon={FileBadge} />
                            <div className="flex flex-col">
                                <h3 className="text-[16px] font-bold text-[#222]">행운의 부적</h3>
                                <p className="text-[13px] text-gray-400 mt-0.5">나를 도와주는 영험한 기운</p>
                            </div>
                        </Link>
                        <Link href="#" className="flex items-center gap-4 group cursor-pointer">
                            <CircleIcon icon={CalendarCheck} />
                            <div className="flex flex-col">
                                <h3 className="text-[16px] font-bold text-[#222]">이사택일</h3>
                                <p className="text-[13px] text-gray-400 mt-0.5">한눈에 보는 이사하기 좋은 날</p>
                            </div>
                        </Link>
                        <Link href="#" className="flex items-center gap-4 group cursor-pointer">
                            <CircleIcon icon={Users} />
                            <div className="flex flex-col">
                                <h3 className="text-[16px] font-bold text-[#222]">관상</h3>
                                <p className="text-[13px] text-gray-400 mt-0.5">얼굴에 적힌 운명 알아보기</p>
                            </div>
                        </Link>
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
                        <Link href="/saju" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon icon={Cat} />
                            <span className="text-[13px] font-medium text-gray-800 tracking-tight">띠 운세</span>
                        </Link>
                        <Link href="/saju" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon icon={Stars} />
                            <span className="text-[13px] font-medium text-gray-800 tracking-tight">별자리 운세</span>
                        </Link>
                        <Link href="/saju" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon icon={CloudSun} />
                            <span className="text-[13px] font-medium text-gray-800 tracking-tight">태어난 계절운</span>
                        </Link>
                        <Link href="/saju" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon icon={Cake} />
                            <span className="text-[13px] font-medium text-gray-800 tracking-tight">생년월일 운세</span>
                        </Link>
                        <Link href="/saju" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
                            <SpotIcon icon={Globe2} />
                            <span className="text-[13px] font-medium text-gray-800 tracking-tight">전생운</span>
                        </Link>
                        <Link href="/saju" className="flex flex-col items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity">
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
                        <Link href="#" className="flex items-center gap-4 group cursor-pointer">
                            <div className="w-[52px] h-[52px] rounded-full bg-[#f8f9fb] flex items-center justify-center border border-gray-100 shadow-sm shrink-0">
                                <div className="absolute w-[18px] h-[18px] bg-[#fbff3a] rounded-full opacity-80"></div>
                                <HeartHandshake size={24} strokeWidth={1.5} className="relative z-10 text-[#222]" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-[16px] font-bold text-[#222]">짝궁합</h3>
                                <p className="text-[13px] text-gray-400 mt-0.5">쉽고 자세한 해석을 원한다면!</p>
                            </div>
                        </Link>
                        <Link href="#" className="flex items-center gap-4 group cursor-pointer">
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
        </div>
    );
}
