"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Sparkles, Loader2, Star, Moon } from "lucide-react";
import UserBadge from "@/components/UserBadge";

function TarotPlayContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const type = searchParams?.get("type") || "daily";

    // Dynamic Configuration
    let titleInfo = "특별한 타로";
    let targetCount = 1;
    let targetCategories = [searchParams?.get("category") || "오늘의 운세"];

    if (type === "daily") {
        titleInfo = "오늘의 타로";
        targetCount = 3;
        targetCategories = ["애정운", "재물운", "직장/사업운"];
    } else if (type === "monthly") {
        titleInfo = "이달의 타로";
        targetCount = 6;
        targetCategories = ["직장운", "애정운", "재물운", "학업운", "건강운", "종합운"];
    } else if (type === "single") {
        titleInfo = "궁금한 타로"; // "Curious Tarot"
        // uses the default targetCount = 1 and targetCategories from searchParams
    }

    const [step, setStep] = useState(1);
    const deckSize = 22; // 5 x 4 + 2 for the pyramid-like structure
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

    // Fetching state
    const [isFetching, setIsFetching] = useState(false);
    const [progress, setProgress] = useState(0); // for the loading screen (0 to 100%)
    const [readings, setReadings] = useState<any[]>([]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isFetching && progress < 100) {
            timer = setTimeout(() => {
                setProgress(prev => Math.min(prev + Math.floor(Math.random() * 10) + 2, 99));
            }, 250);
        }
        return () => clearTimeout(timer);
    }, [isFetching, progress]);

    const handleCardClick = (index: number) => {
        if (isFetching || selectedIndices.includes(index) || selectedIndices.length >= targetCount) {
            return;
        }

        const newSelection = [...selectedIndices, index];
        setSelectedIndices(newSelection);

        if (newSelection.length === targetCount) {
            submitSelections();
        }
    };

    const submitSelections = async () => {
        setIsFetching(true);
        setProgress(5);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://saju-web.onrender.com";
            const response = await fetch(`${apiUrl}/api/tarot/draw-multiple`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: type,
                    categories: targetCategories
                })
            });

            if (!response.ok) throw new Error("Failed to draw cards");

            const data = await response.json();

            setProgress(100);
            setTimeout(() => {
                setReadings(data);
                setStep(2);
                setIsFetching(false);
                setProgress(0);
            }, 700); // Very small delay at 100%

        } catch (error) {
            console.error("Tarot reading error:", error);
            alert("운세 결과 생성에 실패했습니다. 다시 시도해주세요.");
            setIsFetching(false);
            setProgress(0);
            setSelectedIndices([]);
        }
    };

    // Helper for rendering placeholder boxes (Target missing cards)
    const renderPlaceholders = () => {
        return (
            <div className={`flex gap-3 justify-center mb-10 flex-wrap max-w-[320px] mx-auto`}>
                {Array.from({ length: targetCount }).map((_, i) => {
                    const isFilled = i < selectedIndices.length;
                    return (
                        <div key={i} className={`flex flex-col items-center justify-center w-[60px] h-[85px] rounded-xl border-[1.5px] border-dashed ${isFilled ? 'border-purple-400 bg-purple-900/30 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'border-white/20'} transition-all duration-300`}>
                            <span className={`text-[12px] text-center px-1 ${isFilled ? 'text-purple-200 font-bold opacity-100' : 'text-white/40 opacity-70'}`}>
                                {targetCategories[i]}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#110e1b] text-white font-pretendard pb-24 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#110e1b] via-[#1a142d] to-[#2c224f] opacity-100 z-0 pointer-events-none"></div>

            <header className="relative z-50 h-14 max-w-md mx-auto flex items-center px-4 justify-between pt-2">
                <button onClick={() => router.back()} className="p-2 -ml-2 text-white/80 hover:text-white transition-colors rounded-full">
                    <ChevronLeft size={28} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 border border-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                        <span className="text-white/80 text-sm font-medium">?</span>
                    </div>
                    <UserBadge />
                </div>
            </header>

            <main className="relative z-10 max-w-md mx-auto px-5 pt-4">
                {step === 1 && !isFetching && (
                    <div className="animate-in fade-in duration-500 flex flex-col items-center">
                        <div className="text-center mb-8">
                            <h2 className="text-[22px] font-bold leading-[1.3] tracking-tight text-white/90">
                                오늘의 기운을 생각하며<br />
                                카드 {targetCount}장을 선택해주세요.
                            </h2>
                        </div>

                        {renderPlaceholders()}

                        {/* Deck layout - 22 cards */}
                        <div className="flex flex-wrap justify-center gap-[6px] w-full max-w-[360px] mx-auto mb-10">
                            {Array.from({ length: deckSize }).map((_, i) => {
                                const isSelected = selectedIndices.includes(i);
                                return (
                                    <div
                                        key={i}
                                        onClick={() => handleCardClick(i)}
                                        className={`relative w-[14.5%] aspect-[0.68] rounded flex-shrink-0 cursor-pointer transition-all duration-500 transform ${isSelected ? 'opacity-0 scale-50 pointer-events-none translate-y-[-50px]' : 'hover:-translate-y-1 hover:brightness-125 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] shadow-sm'
                                            }`}
                                    >
                                        <div className="w-full h-full bg-[#1e1030] border border-[#d4af37]/40 rounded overflow-hidden flex items-center justify-center p-1.5 relative">
                                            <div className="absolute inset-1 border-[0.5px] border-[#d4af37]/30 rounded-[2px]"></div>
                                            {/* Abstract card back symbol */}
                                            <div className="w-full h-full flex flex-col items-center justify-center opacity-80 gap-0.5">
                                                <Star className="text-[#d4af37] w-3 h-3 fill-[#d4af37]" />
                                                <Moon className="text-[#d4af37] w-2 h-2 fill-[#d4af37] rotate-[130deg]" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Fixed Bottom Action Area for Step 1 */}
                {step === 1 && !isFetching && (
                    <div className="fixed bottom-0 left-0 right-0 bg-[#f5f6fa] text-black h-[72px] flex items-center justify-center shadow-[0_-10px_20px_rgba(0,0,0,0.1)] z-50">
                        <p className="text-[#999999] font-medium text-[16px]">
                            {selectedIndices.length < targetCount ? "카드를 선택해 주세요." : "잠시만 기다려주세요..."}
                        </p>
                    </div>
                )}

                {/* Generating Loading Overlay inspired by user screenshot */}
                {/* Generating Loading Overlay with Bouncing Cards */}
                {isFetching && (
                    <div className="fixed inset-0 bg-[#0e0a1a] z-50 flex flex-col items-center justify-center overflow-hidden">
                        {/* Starry Background for analyzing screen */}
                        <div className="absolute inset-0 z-0 pointer-events-none">
                            {Array.from({ length: 30 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className="absolute text-yellow-100/30 fill-yellow-100/30"
                                    size={Math.random() * 8 + 2}
                                    style={{
                                        top: `${Math.random() * 100}%`,
                                        left: `${Math.random() * 100}%`,
                                        opacity: Math.random() * 0.5 + 0.1,
                                        animation: `pulse ${Math.random() * 3 + 1}s infinite`
                                    }}
                                />
                            ))}
                        </div>

                        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-md px-6 text-center h-full">

                            {/* Bouncing/Flipping Cards Animation */}
                            <div className="relative w-full h-[200px] flex items-center justify-center mb-8">
                                {/* Center Card */}
                                <div className="absolute z-30 w-[80px] h-[120px] bg-[#1e1030] border border-[#d4af37] rounded-lg shadow-[0_0_30px_rgba(212,175,55,0.4)] flex flex-col items-center justify-center animate-[bounce_2s_infinite]">
                                    <div className="absolute inset-1 border-[0.5px] border-[#d4af37]/40 rounded"></div>
                                    <Star className="text-[#d4af37] w-6 h-6 fill-[#d4af37] mb-1" />
                                    <Moon className="text-[#d4af37] w-4 h-4 fill-[#d4af37] rotate-[130deg]" />
                                </div>
                                {/* Left Card */}
                                <div className="absolute z-20 w-[70px] h-[105px] bg-[#1a0e29] border border-[#d4af37]/70 rounded-lg shadow-lg flex flex-col items-center justify-center -translate-x-[60px] translate-y-[20px] -rotate-12 animate-[bounce_2s_infinite_0.4s]">
                                    <div className="absolute inset-1 border-[0.5px] border-[#d4af37]/30 rounded"></div>
                                    <Star className="text-[#d4af37]/70 w-5 h-5 fill-[#d4af37]/70" />
                                </div>
                                {/* Right Card */}
                                <div className="absolute z-20 w-[70px] h-[105px] bg-[#1a0e29] border border-[#d4af37]/70 rounded-lg shadow-lg flex flex-col items-center justify-center translate-x-[60px] translate-y-[10px] rotate-12 animate-[bounce_2s_infinite_0.8s]">
                                    <div className="absolute inset-1 border-[0.5px] border-[#d4af37]/30 rounded"></div>
                                    <Moon className="text-[#d4af37]/70 w-5 h-5 fill-[#d4af37]/70" />
                                </div>
                            </div>

                            {/* Large Percentage Text */}
                            <div className="mb-6 flex flex-col items-center">
                                <span className="text-[64px] font-black text-transparent bg-clip-text bg-gradient-to-b from-[#fde68a] to-[#d4af37] drop-shadow-[0_2px_10px_rgba(212,175,55,0.5)] tabular-nums leading-none">
                                    {progress}<span className="text-[32px] ml-1">%</span>
                                </span>
                            </div>

                            <h2 className="text-white/90 font-bold tracking-wide leading-relaxed text-[18px]">
                                신비로운 우주의 에너지를 모아<br />타로 카드를 해석하고 있어요...
                            </h2>

                            {/* Small progress bar directly under text */}
                            <div className="w-48 h-1.5 bg-white/10 rounded-full mt-8 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#d4af37] to-[#fef08a] transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Screen */}
                {
                    step === 2 && readings.length > 0 && (
                        <div className="animate-in slide-in-from-bottom-8 duration-700 flex flex-col gap-5 pt-2">
                            <div className="text-center mb-4">
                                <h2 className="text-2xl font-bold text-amber-200">
                                    {titleInfo} 풀이 결과
                                </h2>
                                <p className="text-white/60 text-sm mt-1">우주의 기운이 담긴 메시지입니다</p>
                            </div>

                            {readings.map((reading, idx) => (
                                <div key={idx} className="bg-[#241c3a]/80 backdrop-blur-sm rounded-2xl p-5 shadow-xl border border-[#d4af37]/20 relative overflow-hidden">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-[72px] h-[110px] bg-[#100c19] rounded-lg border border-[#d4af37]/40 shadow-inner flex flex-col items-center justify-center shrink-0 relative overflow-hidden">
                                            <span className="text-4xl mb-1 relative z-10">{reading.emoji}</span>
                                        </div>
                                        <div className="pt-2">
                                            <span className="text-[11px] font-bold text-amber-200 bg-amber-900/40 border border-amber-500/30 px-2.5 py-1 rounded">
                                                {reading.category}
                                            </span>
                                            <h3 className="text-[19px] font-bold mt-2.5 text-white leading-tight">
                                                {reading.card_name_kr}
                                            </h3>
                                            <p className="text-[11px] text-white/40 uppercase mt-0.5">{reading.card_name}</p>
                                        </div>
                                    </div>

                                    <div className="text-left text-[14px] leading-relaxed text-white/80 bg-black/20 p-4 rounded-xl whitespace-pre-wrap border border-white/5">
                                        {reading.interpretation}
                                    </div>
                                </div>
                            ))}

                            {/* Expert Consultation CTA */}
                            <div className="bg-[#1e152e] rounded-2xl p-5 border border-purple-500/20 mt-2 mb-4 text-center">
                                <h3 className="text-white/90 font-bold mb-1">더 깊은 해답이 필요하신가요?</h3>
                                <p className="text-white/50 text-[13px] mb-4">
                                    카드의 직관적인 메시지를 넘어,<br />전문가와 1:1로 구체적인 고민을 나누어보세요.
                                </p>
                                <button
                                    onClick={() => router.push('/experts')}
                                    className="w-full bg-purple-600/20 text-purple-300 border border-purple-500/30 py-3 rounded-xl font-bold text-[15px] hover:bg-purple-600/30 transition-colors"
                                >
                                    전문가에게 깊이 있는 상담받기
                                </button>
                            </div>

                            <button
                                onClick={() => router.push('/tarot')}
                                className="w-full bg-amber-500 text-[#111] py-4 rounded-2xl font-bold text-lg hover:bg-amber-400 transition-colors shadow-[0_4px_15px_rgba(245,158,11,0.3)] mb-8"
                            >
                                확인 완료
                            </button>
                        </div>
                    )
                }
            </main >
        </div >
    );
}

export default function TarotPlayPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#110e1b] flex items-center justify-center">
                <Loader2 className="animate-spin text-amber-500" size={32} />
            </div>
        }>
            <TarotPlayContent />
        </Suspense>
    );
}
