"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Sparkles, Loader2, Star, Moon } from "lucide-react";

function TarotPlayContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const type = searchParams?.get("type") || "daily";

    // Daily Configuration (3 Cards) vs Monthly Configuration (6 Cards)
    const isDaily = type === "daily";
    const titleInfo = isDaily ? "오늘의 타로" : "이달의 타로";
    const targetCount = isDaily ? 3 : 6;
    const targetCategories = isDaily
        ? ["애정운", "재물운", "직장/사업운"]
        : ["직장운", "애정운", "재물운", "학업운", "건강운", "종합운"];

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
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://saju-api.onrender.com";
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
                <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white/80 text-lg font-medium">?</span>
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
                        <div className="flex flex-wrap justify-center gap-2 w-full max-w-[340px] mx-auto mb-10">
                            {Array.from({ length: deckSize }).map((_, i) => {
                                const isSelected = selectedIndices.includes(i);
                                return (
                                    <div
                                        key={i}
                                        onClick={() => handleCardClick(i)}
                                        className={`relative w-[17.5%] aspect-[0.68] rounded flex-shrink-0 cursor-pointer transition-all duration-500 transform ${isSelected ? 'opacity-0 scale-50 pointer-events-none translate-y-[-50px]' : 'hover:-translate-y-1 hover:brightness-125 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] shadow-sm'
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
                {isFetching && (
                    <div className="fixed inset-0 bg-[#16122d] z-50 flex flex-col items-center justify-center overflow-hidden">
                        {/* Starry Background for analyzing screen */}
                        <div className="absolute inset-0 z-0">
                            {/* Dummy stars scattered */}
                            {Array.from({ length: 20 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className="absolute text-white/40 fill-white"
                                    size={Math.random() * 12 + 4}
                                    style={{
                                        top: `${Math.random() * 100}%`,
                                        left: `${Math.random() * 100}%`,
                                        opacity: Math.random() * 0.5 + 0.2,
                                        animation: `pulse ${Math.random() * 3 + 2}s infinite`
                                    }}
                                />
                            ))}
                        </div>

                        <div className="relative z-10 flex flex-col items-center w-full max-w-md px-8 text-center pt-20 flex-1">
                            <h2 className="text-white text-xl font-bold mb-16 opacity-90 tracking-wide pb-4">
                                점신의 특별한 타로 해석을 경험해보세요.
                            </h2>

                            {/* Glowing Zodiac/Astro Circle Animation */}
                            <div className="relative w-64 h-64 flex items-center justify-center">
                                {/* Outer rings */}
                                <div className="absolute w-[280px] h-[280px] rounded-full border border-blue-300/20 animate-[spin_30s_linear_infinite]"></div>
                                <div className="absolute w-[240px] h-[240px] rounded-full border border-pink-300/30 animate-[spin_20s_linear_infinite_reverse]"></div>
                                {/* Inner Zodiac symbols mockup */}
                                <div className="absolute w-[200px] h-[200px] border-[0.5px] border-yellow-200/20 rounded-full animate-[spin_25s_linear_infinite] flex items-center justify-center">
                                    <div className="w-full h-full rotate-45 border-t border-yellow-200/20 absolute"></div>
                                    <div className="w-full h-full rotate-90 border-t border-yellow-200/20 absolute"></div>
                                    <div className="w-full h-full -rotate-45 border-t border-yellow-200/20 absolute"></div>
                                </div>
                                {/* Inner glowing moon */}
                                <div className="w-24 h-24 bg-gradient-to-tr from-amber-100 to-amber-300 rounded-full shadow-[0_0_50px_rgba(251,191,36,0.6)] flex flex-col items-center justify-center animate-pulse relative overflow-hidden">
                                    <Moon className="absolute text-amber-600/20 w-16 h-16 -right-2 top-2 fill-amber-600/20" />
                                </div>
                            </div>
                        </div>

                        {/* Bottom loading bar area (Progress Bar) */}
                        <div className="absolute bottom-0 left-0 right-0 bg-[#e4e7ee] h-[60px] flex items-center relative overflow-hidden z-20">
                            <div
                                className="absolute left-0 top-0 bottom-0 bg-[#fcff4b] transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-center MixBlend">
                                <span className="text-[14px] font-bold text-gray-800 tracking-tight z-10 mix-blend-difference filter">
                                    선택한 타로를 분석하고 있어요...{progress}%
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Screen */}
                {step === 2 && readings.length > 0 && (
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

                        <button
                            onClick={() => router.push('/tarot')}
                            className="w-full mt-6 bg-amber-500 text-[#111] py-4 rounded-2xl font-bold text-lg hover:bg-amber-400 transition-colors shadow-[0_4px_15px_rgba(245,158,11,0.3)] mb-8"
                        >
                            확인 완료
                        </button>
                    </div>
                )}
            </main>
        </div>
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
