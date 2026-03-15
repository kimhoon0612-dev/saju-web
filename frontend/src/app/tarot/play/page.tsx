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
        // With streaming, we get real progress. Only do faux progress up to 20% to avoid stalling.
        if (isFetching && progress < 20) {
            timer = setTimeout(() => {
                setProgress(prev => Math.min(prev + 2, 20));
            }, 300);
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
        setReadings([]); // Clear any previous readings

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://saju-web.onrender.com";
            
            // Use local API for testing if we are in development, otherwise use the env var
            const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
                ? 'http://localhost:8000' 
                : apiUrl;

            const response = await fetch(`${baseUrl}/api/tarot/draw-multiple-stream`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: type,
                    categories: targetCategories
                })
            });

            if (!response.ok) throw new Error("Failed to draw cards");
            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = "";
            let completedCount = 0;
            const tempReadings: any[] = [];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                
                // The last element is either an empty string (if buffer ends with \n) or an incomplete line
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (line.trim() === "") continue;
                    try {
                        const reading = JSON.parse(line);
                        tempReadings.push(reading);
                        completedCount++;
                        
                        // Update progress dynamically based on completed chunks
                        const newProgress = Math.min(
                            20 + Math.floor((completedCount / targetCount) * 75), 
                            95
                        );
                        setProgress(newProgress);
                    } catch (e) {
                        console.error("Failed to parse JSON chunk:", line, e);
                    }
                }
            }

            setProgress(100);
            
            setTimeout(() => {
                // Ensure readings are ordered exactly as categories were requested
                const sortedReadings = targetCategories.map(cat => 
                    tempReadings.find(r => r.category === cat) || tempReadings[0]
                ).filter(Boolean);

                setReadings(sortedReadings);
                setStep(2);
                setIsFetching(false);
                setProgress(0);
            }, 700);

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
        <div className="min-h-screen bg-gradient-to-br from-[#0a0f25] via-[#1a142d] to-[#2c1b4d] text-white font-pretendard pb-24 relative overflow-hidden">
            {/* Background Gradient & Effects */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 inset-x-0 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent"></div>
                {Array.from({ length: 30 }).map((_, i) => (
                    <Star
                        key={i}
                        className="absolute text-yellow-100/30 fill-yellow-100/30"
                        size={Math.random() * 6 + 2}
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animation: `pulse ${Math.random() * 4 + 2}s infinite`
                        }}
                    />
                ))}
            </div>

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
                        <div className="text-center mb-12">
                            <p className="text-purple-300 font-bold text-[13px] mb-2 drop-shadow-sm flex items-center justify-center gap-1">
                                <Sparkles size={14} className="text-amber-300"/> 마인드 타로
                            </p>
                            <h2 className="text-[24px] font-black leading-[1.3] text-transparent bg-clip-text bg-gradient-to-r from-purple-100 to-white">
                                오늘의 기운을 담아<br />
                                카드 {targetCount}장을 선택해주세요
                            </h2>
                        </div>

                        {renderPlaceholders()}

                        {/* Deck layout - Fanning Arc layout */}
                        <div className="relative w-full max-w-[360px] mx-auto h-[220px] mb-12 flex justify-center items-end pb-8">
                            {Array.from({ length: deckSize }).map((_, i) => {
                                const isSelected = selectedIndices.includes(i);
                                
                                // Calculate position for the fanning effect
                                const angle = -60 + (i * (120 / (deckSize - 1)));
                                const radius = 240; 
                                const x = Math.sin(angle * (Math.PI / 180)) * radius;
                                const y = Math.cos(angle * (Math.PI / 180)) * radius - radius;
                                
                                return (
                                    <div
                                        key={i}
                                        onClick={() => handleCardClick(i)}
                                        className={`absolute w-[50px] aspect-[0.57] rounded-lg cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)] transform ${isSelected ? 'opacity-0 scale-[0.3] pointer-events-none translate-y-[-150px]' : 'hover:-translate-y-8 hover:scale-110 shadow-lg z-10 hover:z-20'}`}
                                        style={{
                                            transform: isSelected ? undefined : `translateX(${x}px) translateY(${y}px) rotate(${angle}deg)`,
                                            transformOrigin: 'bottom center',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                                        }}
                                    >
                                        <div className="w-full h-full bg-[#160f24] border border-purple-500/40 rounded-lg overflow-hidden flex items-center justify-center p-1 relative shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] hover:border-purple-400 group">
                                            <div className="absolute inset-[3px] border-[0.5px] border-amber-500/30 rounded-md"></div>
                                            {/* Abstract card back symbol */}
                                            <div className="w-full h-full flex flex-col items-center justify-center opacity-80 gap-[1px]">
                                                <Star className="text-amber-500/70 w-3 h-3 fill-amber-500/70 group-hover:fill-amber-300 group-hover:text-amber-300 transition-colors" />
                                                <Moon className="text-purple-400/70 w-2.5 h-2.5 fill-purple-400/70 rotate-[130deg] group-hover:fill-purple-300 group-hover:text-purple-300 transition-colors" />
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
                    <div className="fixed bottom-0 left-0 right-0 bg-[#0a0f25]/80 backdrop-blur-md border-t border-purple-900/50 text-white h-[76px] flex items-center justify-center z-50">
                        <p className={`font-bold text-[16px] transition-colors ${selectedIndices.length < targetCount ? 'text-white/60' : 'text-purple-300'}`}>
                            {selectedIndices.length < targetCount ? `신중하게 카드를 선택해 주세요 (${selectedIndices.length}/${targetCount})` : "운명의 카드를 해석하고 있습니다..."}
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
                            <div className="text-center mb-8">
                                <p className="text-purple-300 font-bold text-[13px] mb-1 flex items-center justify-center gap-1">
                                    <Sparkles size={14} className="text-amber-300"/> 마인드 타로 풀이
                                </p>
                                <h2 className="text-[24px] font-black text-white/95">
                                    {titleInfo} 결과
                                </h2>
                            </div>

                            {readings.map((reading, idx) => (
                                <div key={idx} className="bg-[#1e1533]/80 backdrop-blur-xl rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-purple-500/20 relative overflow-hidden group">
                                    <div className="absolute inset-x-0 -top-px h-px w-full bg-gradient-to-r from-transparent via-purple-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="flex items-start gap-5 mb-5">
                                        <div className="w-[80px] aspect-[0.57] bg-[#0a0f25] rounded-xl border border-purple-500/30 flex flex-col items-center justify-center shrink-0 relative overflow-hidden shadow-inner">
                                            <div className="absolute inset-1 border-[0.5px] border-amber-500/20 rounded-lg"></div>
                                            <span className="text-5xl mb-1 relative z-10 drop-shadow-md">{reading.emoji}</span>
                                        </div>
                                        <div className="pt-2">
                                            <span className="text-[12px] font-bold text-amber-200 bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-full inline-block">
                                                {reading.category}
                                            </span>
                                            <h3 className="text-[20px] font-black mt-3 text-white leading-tight">
                                                {reading.card_name_kr}
                                            </h3>
                                            <p className="text-[12px] text-purple-300/70 font-medium uppercase mt-1 opacity-80">{reading.card_name}</p>
                                        </div>
                                    </div>

                                    <div className="text-left text-[15px] leading-[1.7] text-white/90 bg-[#160f24]/50 p-5 rounded-2xl whitespace-pre-wrap border border-white/5 font-medium">
                                        {reading.interpretation}
                                    </div>
                                </div>
                            ))}

                            {/* Expert Consultation CTA */}
                            <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-md rounded-3xl p-6 border border-purple-500/30 mt-6 mb-4 text-center">
                                <h3 className="text-white font-bold mb-2 text-[17px]">더 깊은 방향성이 필요하신가요?</h3>
                                <p className="text-white/60 text-[14px] leading-relaxed mb-5">
                                    카드의 직관적인 메시지를 넘어,<br />전문가와 1:1로 구체적인 고민을 해소해보세요.
                                </p>
                                <button
                                    onClick={() => router.push('/experts')}
                                    className="w-full bg-purple-600/30 text-purple-200 border border-purple-500/50 py-3.5 rounded-2xl font-bold text-[15px] hover:bg-purple-600/50 hover:text-white transition-all shadow-[0_4px_15px_rgba(168,85,247,0.2)]"
                                >
                                    전문가에게 깊이 있는 상담받기
                                </button>
                            </div>

                            <button
                                onClick={() => router.push('/tarot')}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4.5 rounded-2xl font-bold text-[17px] hover:from-purple-500 hover:to-indigo-500 transition-all shadow-[0_4px_20px_rgba(147,51,234,0.4)] mb-8"
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
