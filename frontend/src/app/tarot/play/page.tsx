"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Sparkles, Loader2 } from "lucide-react";

export default function TarotPlayPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const type = searchParams?.get("type") || "daily";

    // Daily Configuration (3 Cards) vs Monthly Configuration (6 Cards)
    const isDaily = type === "daily";
    const titleInfo = isDaily ? "오늘의 타로" : "이달의 타로";
    const targetCount = isDaily ? 3 : 6;
    const targetCategories = isDaily
        ? ["직장/사업운", "애정운", "재물운"]
        : ["직장/사업운", "애정운", "재물운", "학업운", "건강운", "종합운"];

    // step 1 = draw cards, step 2 = viewing results
    const [step, setStep] = useState(1);

    // Track selected cards out of a mock deck
    const deckSize = 10;
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

    // Fetching state
    const [isFetching, setIsFetching] = useState(false);
    const [readings, setReadings] = useState<any[]>([]);

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
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";
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

            setTimeout(() => {
                setReadings(data);
                setStep(2);
                setIsFetching(false);
            }, 1500); // Give flip animation time to finish

        } catch (error) {
            console.error("Tarot reading error:", error);
            alert("운세 결과 생성에 실패했습니다. 다시 시도해주세요.");
            setIsFetching(false);
            setSelectedIndices([]);
        }
    };

    const getSelectionLabel = (index: number) => {
        const order = selectedIndices.indexOf(index);
        if (order === -1) return null;
        return targetCategories[order];
    };

    return (
        <div className="min-h-screen bg-[#F5F6F8] text-[#111111] font-pretendard pb-24">
            <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100 h-14 max-w-md mx-auto flex items-center px-4">
                <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-700 hover:text-black transition-colors rounded-full hover:bg-gray-100">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="flex-1 text-center text-lg font-bold mr-6">{titleInfo}</h1>
            </header>

            <main className="max-w-md mx-auto pt-20 px-5">
                {step === 1 && (
                    <div className="animate-in fade-in duration-500 flex flex-col items-center min-h-[70vh]">
                        <div className="text-center mb-8">
                            <h2 className="text-xl font-bold mb-2">
                                마음을 집중하고<br />
                                <span className="text-purple-600 font-extrabold">{targetCount}장</span>의 카드를 골라주세요
                            </h2>
                            <p className="text-gray-500 text-sm">
                                선택 진행도: {selectedIndices.length} / {targetCount}장
                            </p>
                        </div>

                        {/* Deck layout */}
                        <div className="grid grid-cols-3 gap-3 w-full justify-items-center mb-8 relative">
                            {Array.from({ length: deckSize }).map((_, i) => {
                                const isSelected = selectedIndices.includes(i);
                                const label = getSelectionLabel(i);

                                return (
                                    <div
                                        key={i}
                                        onClick={() => handleCardClick(i)}
                                        className={`relative w-20 h-32 rounded-lg cursor-pointer transition-all duration-500 transform ${isFetching && !isSelected ? 'opacity-30' : 'hover:-translate-y-1'
                                            } ${isSelected ? 'rotate-y-180 scale-105 z-10 opacity-70 cursor-default' : ''
                                            }`}
                                        style={{ perspective: "1000px" }}
                                    >
                                        {/* Back of card */}
                                        <div className={`absolute inset-0 backface-hidden rounded-lg border-2 border-primary-900 bg-primary-900 shadow-md flex items-center justify-center transition-all duration-500 ${isSelected ? 'opacity-0' : 'opacity-100'}`}>
                                            <div className="w-full h-full opacity-20 border-[3px] border-amber-400 m-1 rounded-md"></div>
                                            <Sparkles className="absolute text-amber-400 opacity-40" size={24} />
                                        </div>

                                        {/* Front of card (Dummy Selected State) */}
                                        <div className={`absolute inset-0 backface-hidden rounded-lg border border-purple-300 bg-purple-50 shadow-lg flex flex-col items-center justify-center transition-all duration-500 rotate-y-180 p-1 text-center ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
                                            <span className="text-xs font-bold text-purple-700 break-keep">{label}</span>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Center fetching overlay */}
                            {isFetching && (
                                <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/40 backdrop-blur-sm rounded-xl">
                                    <div className="bg-white px-6 py-4 rounded-full shadow-lg flex items-center gap-3 animate-pulse">
                                        <Loader2 className="animate-spin text-purple-600" size={20} />
                                        <span className="font-bold text-sm">운명의 흐름을 읽는 중...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === 2 && readings.length > 0 && (
                    <div className="animate-in slide-in-from-bottom-8 duration-700 flex flex-col gap-6">
                        <div className="text-center mb-2">
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
                                {titleInfo} 풀이 결과
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">카드가 당신에게 전하는 메시지입니다</p>
                        </div>

                        {readings.map((reading, idx) => (
                            <div key={idx} className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-400 to-pink-500"></div>

                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-16 h-24 bg-gray-50 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center justify-center shrink-0">
                                        <span className="text-3xl mb-1">{reading.emoji}</span>
                                    </div>
                                    <div className="pt-1">
                                        <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
                                            {reading.category}
                                        </span>
                                        <h3 className="text-lg font-bold mt-2 text-gray-800 leading-tight">
                                            {reading.card_name_kr}
                                        </h3>
                                        <p className="text-xs text-gray-400 uppercase">{reading.card_name}</p>
                                    </div>
                                </div>

                                <div className="text-left text-[14px] leading-relaxed text-gray-700 bg-gray-50/50 p-4 rounded-xl whitespace-pre-wrap">
                                    {reading.interpretation}
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={() => router.push('/tarot')}
                            className="w-full mt-4 bg-[#111111] text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg"
                        >
                            확인 완료
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
