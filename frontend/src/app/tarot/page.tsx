"use client";
import Link from "next/link";
import { useState } from "react";
import { Sparkles, Heart, Star, Moon } from "lucide-react";

export default function TarotPage() {
    // Current Active Tab
    const [activeTab, setActiveTab] = useState("전체");

    const tabs = ["전체", "26년 타로", "연애/결혼", "짝사랑/재회", "취업/학업", "금전/사업", "인간관계/기타"];

    // Expanded 21 Tarot Topics
    const tarotList = [
        // 연애/결혼 (4)
        { id: 1, category: "연애/결혼", title: "꿈꿔온 나의 이상형 알려주세요!", tags: "#연애운 #나의 이상형", bgColor: "bg-pink-100", emoji: "❓" },
        { id: 3, category: "연애/결혼", title: "나만의 연애 전략을 찾아주세요", tags: "#연애운 #맞춤형 연애전략", bgColor: "bg-purple-50", emoji: "♟️" },
        { id: 4, category: "연애/결혼", title: "우리, 결혼할 수 있을까?", tags: "#연애운 #너와 나는 어디까지?", bgColor: "bg-orange-50", emoji: "💍" },
        { id: 5, category: "연애/결혼", title: "나와 사귀게 될 사람", tags: "#새로운인연 #언제쯤", bgColor: "bg-yellow-50", emoji: "📣" },

        // 짝사랑/재회 (4)
        { id: 2, category: "짝사랑/재회", title: "상대를 연인으로 만드는 법", tags: "#짝사랑 #짝사랑 종결 비결", bgColor: "bg-blue-50", emoji: "💡" },
        { id: 10, category: "짝사랑/재회", title: "헤어진 그 사람, 다시 만날 수 있을까?", tags: "#재회운 #그리움", bgColor: "bg-indigo-50", emoji: "💔" },
        { id: 11, category: "짝사랑/재회", title: "그 사람도 나를 생각하고 있을까?", tags: "#속마음 #짝사랑", bgColor: "bg-rose-100", emoji: "🤔" },
        { id: 12, category: "짝사랑/재회", title: "우리가 다시 연락하게 될 타이밍", tags: "#재회 #연락운", bgColor: "bg-sky-50", emoji: "📱" },

        // 취업/학업 (4)
        { id: 7, category: "취업/학업", title: "대체 언제쯤 취업할 수 있을까?", tags: "#취업 #나의 진로", bgColor: "bg-green-50", emoji: "💼" },
        { id: 13, category: "취업/학업", title: "다가오는 시험, 합격할 수 있을까?", tags: "#시험운 #합격기원", bgColor: "bg-amber-50", emoji: "✏️" },
        { id: 14, category: "취업/학업", title: "나에게 맞는 적성과 직업은?", tags: "#진로고민 #천직", bgColor: "bg-violet-50", emoji: "🎯" },
        { id: 15, category: "취업/학업", title: "직장을 옮겨도 괜찮을까?", tags: "#이직운 #새출발", bgColor: "bg-cyan-50", emoji: "🚪" },

        // 금전/사업 (4)
        { id: 16, category: "금전/사업", title: "올해 나의 재물운 흐름은?", tags: "#금전운 #재물운", bgColor: "bg-yellow-100", emoji: "💰" },
        { id: 17, category: "금전/사업", title: "내가 투자한 곳, 수익이 날까?", tags: "#투자운 #대박기원", bgColor: "bg-emerald-50", emoji: "📈" },
        { id: 18, category: "금전/사업", title: "사업을 시작해도 될 타이밍일까?", tags: "#창업운 #사업운", bgColor: "bg-red-50", emoji: "🚀" },
        { id: 19, category: "금전/사업", title: "나에게 금전적 여유가 생기는 시기", tags: "#성공운 #부자되기", bgColor: "bg-blue-100", emoji: "💎" },

        // 인간관계/기타 (3)
        { id: 8, category: "인간관계/기타", title: "내가 겪을 수 있는 건강 이슈는?", tags: "#건강운 #컨디션 점검", bgColor: "bg-teal-50", emoji: "🧘‍♀️" },
        { id: 9, category: "인간관계/기타", title: "내 반려견/반려묘 무슨 생각을 할까?", tags: "#반려동물 #속마음", bgColor: "bg-rose-50", emoji: "🐶" },
        { id: 20, category: "인간관계/기타", title: "직장 동료와의 관계, 어떻게 풀까?", tags: "#인간관계 #사회생활", bgColor: "bg-slate-100", emoji: "🤝" },

        // 26년 타로 (1)
        { id: 21, category: "26년 타로", title: "2026년 나의 종합 타로 운세는?", tags: "#신년운세 #2026년", bgColor: "bg-fuchsia-100", emoji: "🎊" },
    ];

    return (
        <div className="min-h-screen bg-[#FDFBFA] text-[#2D3748] pb-24 font-pretendard">
            {/* Header / Title Area */}
            <div className="px-5 pt-4 pb-2">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-black text-[#4A5568]">마인드 타로</h1>
                    <button className="text-sm font-bold text-gray-500 flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                        <Sparkles size={14} className="text-[#81C784]" /> 성향 설정
                    </button>
                </div>

                <div className="mb-2">
                    <p className="text-sm font-bold text-[#81C784] mb-1 flex items-center gap-1">
                        무의식을 비추는 거울 <Heart size={14} className="fill-[#81C784] text-[#81C784]" />
                    </p>
                    <h2 className="text-xl font-black">내면의 소리에 귀 기울이는 시간</h2>
                </div>
            </div>

            {/* Top 2 Big Cards */}
            <div className="px-5 flex gap-3 mb-10">
                <Link href="/tarot/play?type=daily" className="flex-1 rounded-3xl border border-gray-100 bg-white p-5 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow cursor-pointer block">
                    <div className="relative mb-3 h-12 w-12 flex justify-center items-center">
                        <div className="absolute w-[30px] h-[40px] border border-gray-100 bg-gray-50 rounded-lg flex items-center justify-center rotate-12 translate-x-2 shadow-sm">
                            <Moon size={14} className="text-gray-400" />
                        </div>
                        <div className="absolute w-[30px] h-[40px] border border-gray-100 bg-white rounded-lg flex items-center justify-center -rotate-12 -translate-x-1.5 z-10 shadow-sm">
                            <Star size={14} className="text-[#FFB199]" />
                        </div>
                    </div>
                    <h3 className="text-[15px] font-black text-gray-800 mb-1">투데이 인사이트</h3>
                    <p className="text-[12px] font-medium text-gray-400">오늘의 흐름 읽기</p>
                </Link>
                <Link href="/tarot/play?type=monthly" className="flex-1 rounded-3xl border border-gray-100 bg-white p-5 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow cursor-pointer block">
                    <div className="text-4xl mb-3 mt-1 opacity-90 drop-shadow-sm">🕊️</div>
                    <h3 className="text-[15px] font-black text-gray-800 mb-1">이달의 테마</h3>
                    <p className="text-[12px] font-medium text-gray-400">월간 감정선 진단</p>
                </Link>
            </div>

            {/* Secondary Header */}
            <div className="px-5 mb-4">
                <h2 className="text-lg font-black text-gray-800">지금 가장 큰 고민은 무엇인가요?</h2>
            </div>

            {/* Scrollable Categories Tab */}
            <div className="pl-5 mb-6 overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 w-max pr-5">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-full text-[14px] font-bold transition-colors border shadow-sm ${activeTab === tab
                                ? "bg-[#4A5568] text-white border-[#4A5568]"
                                : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tarot List */}
            <div className="px-5 flex flex-col gap-4">
                {tarotList
                    .filter(item => activeTab === "전체" || item.category === activeTab)
                    .map((item) => (
                        <Link
                            href={`/tarot/play?type=single&category=${item.title}`}
                            key={item.id}
                            className="flex justify-between items-center py-2 group cursor-pointer border-b border-gray-50/50 pb-4 last:border-0 hover:bg-gray-50/50 rounded-xl transition-colors px-2 -mx-2"
                        >
                            <div className="flex flex-col flex-1 pr-4">
                                <h3 className="text-[16px] font-bold mb-1.5 group-hover:text-purple-600 transition-colors">{item.title}</h3>
                                <p className="text-[13px] text-gray-400 font-medium">{item.tags}</p>
                            </div>
                            <div className={`w-[72px] h-[72px] rounded-2xl ${item.bgColor} flex items-center justify-center text-3xl shadow-sm shrink-0`}>
                                {item.emoji}
                            </div>
                        </Link>
                    ))}
            </div>

        </div >
    );
}
