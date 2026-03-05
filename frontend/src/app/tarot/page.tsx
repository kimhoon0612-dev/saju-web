"use client";

import { useState } from "react";
import { Sparkles, Heart, Star, Moon } from "lucide-react";

export default function TarotPage() {
    // Current Active Tab
    const [activeTab, setActiveTab] = useState("전체");

    const tabs = ["전체", "26년 타로", "연애/결혼", "짝사랑/재회", "취업/학업"];

    // Mock Data based on the screenshots
    const tarotList = [
        { id: 1, title: "꿈꿔온 나의 이상형 알려주세요!", tags: "#연애운 #나의 이상형", bgColor: "bg-pink-100", emoji: "❓" },
        { id: 2, title: "상대를 연인으로 만드는 법", tags: "#짝사랑 #짝사랑 종결 비결", bgColor: "bg-blue-50", emoji: "💡" },
        { id: 3, title: "나만의 연애 전략을 찾아주세요", tags: "#연애운 #맞춤형 연애전략", bgColor: "bg-purple-50", emoji: "♟️" },
        { id: 4, title: "우리, 결혼할 수 있을까?", tags: "#짝사랑 #너와 나는 어디까지?", bgColor: "bg-orange-50", emoji: "💍" },
        { id: 5, title: "연애할 때 조심해야 할 것은?", tags: "#연애운 #연애시 주의점", bgColor: "bg-red-50", emoji: "⚠️" },
        { id: 6, title: "나와 사귀게 될 사람", tags: "#짝사랑 #다른 인연", bgColor: "bg-yellow-50", emoji: "📣" },
        { id: 7, title: "대체 언제쯤 취업할 수 있을까?", tags: "#취업 #나의 진로", bgColor: "bg-green-50", emoji: "💼" },
        { id: 8, title: "내가 겪을 수 있는 건강 이슈는?", tags: "#건강운 #컨디션 점검", bgColor: "bg-teal-50", emoji: "🧘‍♀️" },
        { id: 9, title: "내 반려견은 무슨 생각을 할까?", tags: "#반려동물 #속마음", bgColor: "bg-rose-50", emoji: "🐶" },
    ];

    return (
        <div className="min-h-screen bg-white text-[#111111] pb-24 font-pretendard">
            {/* Header / Title Area */}
            <div className="px-5 pt-4 pb-2">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">타로</h1>
                    <button className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <Sparkles size={16} /> 카드설정
                    </button>
                </div>

                <div className="mb-2">
                    <p className="text-sm font-medium text-[#A855F7] mb-1 flex items-center gap-1">
                        매일 찾게 되는 타로카드 <Heart size={14} className="fill-[#A855F7] text-[#A855F7]" />
                    </p>
                    <h2 className="text-xl font-bold">평범한 일상 속 타로점</h2>
                </div>
            </div>

            {/* Top 2 Big Cards */}
            <div className="px-5 flex gap-3 mb-10">
                <div className="flex-1 rounded-2xl border border-gray-100 bg-white p-5 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className="relative mb-3 h-12 w-12 flex justify-center items-center">
                        {/* Back Card (Moon) */}
                        <div className="absolute w-[30px] h-[40px] border-[1.5px] border-[#111] bg-[#111] rounded-[3px] flex items-center justify-center rotate-12 translate-x-2 shadow-sm">
                            <Moon size={14} className="text-white fill-white" />
                        </div>
                        {/* Front Card (Star) */}
                        <div className="absolute w-[30px] h-[40px] border-[1.5px] border-[#111] bg-white rounded-[3px] flex items-center justify-center -rotate-12 -translate-x-1.5 z-10 shadow-sm">
                            <Star size={14} className="text-[#111]" />
                        </div>
                    </div>
                    <h3 className="text-[15px] font-bold mb-1">오늘의 타로</h3>
                    <p className="text-xs text-gray-400">오늘 하루는 어떨까?</p>
                </div>
                <div className="flex-1 rounded-2xl border border-gray-100 bg-white p-5 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className="text-4xl mb-3">🔮</div>
                    <h3 className="text-[15px] font-bold mb-1">이달의 타로</h3>
                    <p className="text-xs text-gray-400">이번달 나의 총운은?</p>
                </div>
            </div>

            {/* Secondary Header */}
            <div className="px-5 mb-4">
                <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                    타로점으로 고민해결! 🔮
                </p>
                <h2 className="text-xl font-bold">궁금한 타로를 선택해봐요!</h2>
            </div>

            {/* Scrollable Categories Tab */}
            <div className="pl-5 mb-6 overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 w-max pr-5">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${activeTab === tab
                                ? "bg-[#111111] text-white border-[#111111]"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tarot List */}
            <div className="px-5 flex flex-col gap-4">
                {tarotList.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 group cursor-pointer border-b border-gray-50/50 pb-4 last:border-0">
                        <div className="flex flex-col flex-1 pr-4">
                            <h3 className="text-[16px] font-bold mb-1.5 group-hover:text-brand-red transition-colors">{item.title}</h3>
                            <p className="text-[13px] text-gray-400 font-medium">{item.tags}</p>
                        </div>
                        <div className={`w-[72px] h-[72px] rounded-2xl ${item.bgColor} flex items-center justify-center text-3xl shadow-sm shrink-0`}>
                            {item.emoji}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Charge Banner */}
            <div className="fixed bottom-[80px] left-0 right-0 max-w-md mx-auto px-5 z-40 bg-white/90 backdrop-blur-sm pt-4 pb-2 border-t border-gray-50">
                <div className="flex justify-between items-center bg-white border border-gray-100 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                    <div className="flex flex-col">
                        <p className="text-xs text-gray-500 font-medium mb-1">전면 광고 없이 쾌적하게 ⚡ 무료로!!</p>
                        <p className="text-[15px] font-bold">
                            행운패스 잔여시간 <span className="text-blue-600">충전이 필요해요</span>
                        </p>
                    </div>
                    <button className="bg-[#1a1a1a] text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-black transition-colors shadow-sm">
                        충전하기
                    </button>
                </div>
            </div>
        </div>
    );
}
