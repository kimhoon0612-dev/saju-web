"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Sparkles, Loader2 } from "lucide-react";

export default function TarotPlayPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const type = searchParams?.get("type") || "daily";

    // Steps: 0 = choose topic, 1 = shuffle & draw, 2 = reading result
    const [step, setStep] = useState(0);
    const [selectedTopic, setSelectedTopic] = useState<{ id: string, name: string } | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [readingResult, setReadingResult] = useState<any>(null);
    const [flippedCardIndex, setFlippedCardIndex] = useState<number | null>(null);

    const topics = [
        { id: "career", name: "직장운/사업운", emoji: "💼" },
        { id: "love", name: "애정운", emoji: "❤️" },
        { id: "wealth", name: "재물운", emoji: "💰" },
        { id: "study", name: "학업운", emoji: "🎓" },
        { id: "health", name: "건강운", emoji: "🌿" },
        { id: "general", name: "종합운", emoji: "🌟" }
    ];

    const titleInfo = type === "daily" ? "오늘의 타로" : "이달의 타로";

    const handleTopicSelect = (topic: { id: string, name: string }) => {
        setSelectedTopic(topic);
        setStep(1);
    };

    const drawCard = async (cardIndex: number) => {
        if (isDrawing || flippedCardIndex !== null) return;

        setFlippedCardIndex(cardIndex);
        setIsDrawing(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";
            const response = await fetch(`${apiUrl}/api/tarot/draw`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: type,
                    category: selectedTopic?.name || "종합운"
                })
            });

            if (!response.ok) throw new Error("Failed to draw card");

            const data = await response.json();

            // Wait for flip animation to finish before showing result
            setTimeout(() => {
                setReadingResult(data);
                setStep(2);
                setIsDrawing(false);
            }, 1500);

        } catch (error) {
            console.error("Tarot reading error:", error);
            alert("운세 결과 생성에 실패했습니다. 다시 시도해주세요.");
            setIsDrawing(false);
            setFlippedCardIndex(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F6F8] text-[#111111] font-pretendard">
            <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100 h-14 max-w-md mx-auto flex items-center px-4">
                <button onClick={() => {
                    if (step > 0 && !isDrawing) setStep(step - 1);
                    else router.back();
                }} className="p-2 -ml-2 text-gray-700 hover:text-black transition-colors rounded-full hover:bg-gray-100">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="flex-1 text-center text-lg font-bold mr-6">{titleInfo}</h1>
            </header>

            <main className="max-w-md mx-auto pt-16 px-5 pb-24">
                {step === 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center mb-10 mt-6">
                            <Sparkles className="mx-auto text-purple-500 mb-3" size={32} />
                            <h2 className="text-2xl font-bold mb-2">어떤 운세가 궁금하신가요?</h2>
                            <p className="text-gray-500 text-sm">{titleInfo}로 보고 싶은 주제를 골라주세요.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {topics.map((topic) => (
                                <button
                                    key={topic.id}
                                    onClick={() => handleTopicSelect(topic)}
                                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all flex flex-col items-center gap-3 group active:scale-95"
                                >
                                    <span className="text-4xl group-hover:scale-110 transition-transform">{topic.emoji}</span>
                                    <span className="font-bold text-gray-800">{topic.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 1 && (
                    <div className="animate-in fade-in duration-500 flex flex-col items-center justify-center min-h-[70vh]">
                        <div className="text-center mb-12">
                            <p className="text-purple-600 font-bold mb-2 text-sm">[{selectedTopic?.name}]</p>
                            <h2 className="text-2xl font-bold">마음을 집중하고<br />카드를 한 장 선택해주세요</h2>
                        </div>

                        <div className="flex gap-4 justify-center">
                            {[0, 1, 2].map((index) => (
                                <div
                                    key={index}
                                    onClick={() => drawCard(index)}
                                    className={`relative w-[90px] h-[150px] rounded-xl cursor-pointer transition-all duration-500 transform ${isDrawing && flippedCardIndex !== index ? 'opacity-30 scale-90' : 'hover:-translate-y-2'
                                        } ${flippedCardIndex === index ? 'rotate-y-180 scale-110 z-10' : ''
                                        }`}
                                    style={{ perspective: "1000px" }}
                                >
                                    {/* Back of card */}
                                    <div className={`absolute w-full h-full backface-hidden rounded-xl border-2 border-primary-900 bg-primary-900 shadow-lg flex items-center justify-center overflow-hidden transition-all duration-500 ${flippedCardIndex === index ? 'opacity-0' : 'opacity-100'}`}>
                                        <div className="w-full h-full opacity-20 border-[4px] border-amber-400 m-1 rounded-lg"></div>
                                        <Sparkles className="absolute text-amber-400 opacity-50" size={32} />
                                    </div>

                                    {/* Front of card (Fake/Loading for animation) */}
                                    <div className={`absolute w-full h-full backface-hidden rounded-xl border border-gray-200 bg-white shadow-xl flex items-center justify-center transition-all duration-500 rotate-y-180 ${flippedCardIndex === index ? 'opacity-100' : 'opacity-0'}`}>
                                        <Loader2 className="animate-spin text-purple-500" size={24} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && readingResult && (
                    <div className="animate-in slide-in-from-bottom-8 duration-700 mt-6">
                        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-400 to-pink-500"></div>

                            <p className="text-purple-600 font-bold text-sm mb-4">{titleInfo} • {selectedTopic?.name}</p>

                            <div className="w-[120px] h-[190px] mx-auto bg-gray-50 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center mb-6">
                                <span className="text-5xl mb-2">{readingResult.emoji}</span>
                                <span className="font-bold text-sm bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                                    {readingResult.card_name_kr}
                                </span>
                            </div>

                            <h2 className="text-2xl font-bold mb-6 text-gray-800 leading-tight">
                                당신이 뽑은 카드<br />
                                <span className="text-purple-600">'{readingResult.card_name_kr}'</span>
                            </h2>

                            <div className="text-left text-[15px] leading-relaxed text-gray-700 space-y-4 whitespace-pre-wrap">
                                {readingResult.interpretation}
                            </div>
                        </div>

                        <button
                            onClick={() => router.push('/tarot')}
                            className="w-full mt-6 bg-[#111111] text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg"
                        >
                            다른 타로 점보기
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
