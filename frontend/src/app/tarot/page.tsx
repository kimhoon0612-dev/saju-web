"use client";
import Link from "next/link";
import { useState } from "react";
import { Sparkles, Heart, Star, Moon } from "lucide-react";

export default function TarotPage() {
    // Current Active Tab
    const [activeTab, setActiveTab] = useState("전체");

    // Expanded Tarot Topics (10+ per category)
    const tarotList = [
        // 애정 (Love) - 10 items
        { id: 101, category: "애정", title: "나의 진정한 인연은 언제 나타날까?", tags: "#새로운인연 #타이밍", bgColor: "bg-pink-900/30 border border-pink-500/20", emoji: "💕" },
        { id: 102, category: "애정", title: "지금 썸타는 그 사람의 진짜 속마음", tags: "#썸 #속마음", bgColor: "bg-purple-900/30 border border-purple-500/20", emoji: "👀" },
        { id: 103, category: "애정", title: "헤어진 그 사람, 우리 다시 만날 수 있을까?", tags: "#재회운 #미련", bgColor: "bg-indigo-900/30 border border-indigo-500/20", emoji: "🥀" },
        { id: 104, category: "애정", title: "내가 짝사랑하는 그 사람과 잘 될 확률", tags: "#짝사랑 #연애성공", bgColor: "bg-rose-900/30 border border-rose-500/20", emoji: "💘" },
        { id: 105, category: "애정", title: "현재 연인과의 앞으로의 관계 흐름", tags: "#현재연애 #권태기극복", bgColor: "bg-red-900/30 border border-red-500/20", emoji: "💑" },
        { id: 106, category: "애정", title: "나의 매력 포인트는 무엇일까?", tags: "#자기매력 #어필포인트", bgColor: "bg-fuchsia-900/30 border border-fuchsia-500/20", emoji: "✨" },
        { id: 107, category: "애정", title: "결혼을 전제로 만날 수 있는 사람일까?", tags: "#결혼운 #진지한만남", bgColor: "bg-amber-900/30 border border-amber-500/20", emoji: "💍" },
        { id: 108, category: "애정", title: "최근 멀어진 친구/연인과 관계 회복법", tags: "#관계회복 #화해", bgColor: "bg-sky-900/30 border border-sky-500/20", emoji: "🤝" },
        { id: 109, category: "애정", title: "나를 남몰래 좋아하고 있는 사람이 있을까?", tags: "#비밀연애 #숨겨진마음", bgColor: "bg-violet-900/30 border border-violet-500/20", emoji: "🤫" },
        { id: 110, category: "애정", title: "다음 연애는 어떤 스타일의 사람과 할까?", tags: "#다음연애 #이상형", bgColor: "bg-pink-900/30 border border-pink-500/20", emoji: "🔮" },

        // 재물 (Wealth) - 10 items
        { id: 201, category: "재물", title: "올해 나의 재물운 흐름은 어떨까?", tags: "#금전운 #재물흐름", bgColor: "bg-yellow-900/30 border border-yellow-500/20", emoji: "💰" },
        { id: 202, category: "재물", title: "지금 고려 중인 투자, 진행해도 괜찮을까?", tags: "#투자운 #수익기대", bgColor: "bg-emerald-900/30 border border-emerald-500/20", emoji: "📈" },
        { id: 203, category: "재물", title: "나의 숨겨진 재물 그릇의 크기", tags: "#재물그릇 #잠재력", bgColor: "bg-amber-900/30 border border-amber-500/20", emoji: "🏺" },
        { id: 204, category: "재물", title: "부를 끌어당기기 위해 내가 해야 할 행동", tags: "#부자되기 #금전전략", bgColor: "bg-teal-900/30 border border-teal-500/20", emoji: "🧘" },
        { id: 205, category: "재물", title: "가까운 미래에 뜻밖의 수익(횡재수)이 있을까?", tags: "#횡재수 #로또운", bgColor: "bg-green-900/30 border border-green-500/20", emoji: "🎁" },
        { id: 206, category: "재물", title: "현재 나의 금전적 문제, 언제 해결될까?", tags: "#빚청산 #위기탈출", bgColor: "bg-blue-900/30 border border-blue-500/20", emoji: "🔑" },
        { id: 207, category: "재물", title: "사업/부업을 시작하면 돈이 될까?", tags: "#N잡 #사업운", bgColor: "bg-orange-900/30 border border-orange-500/20", emoji: "🚀" },
        { id: 208, category: "재물", title: "나의 주 지출 원인과 절약 팁", tags: "#소비습관 #절약", bgColor: "bg-rose-900/30 border border-rose-500/20", emoji: "✂️" },
        { id: 209, category: "재물", title: "부동산/문서 운이 들어오는 시기", tags: "#내집마련 #문서운", bgColor: "bg-cyan-900/30 border border-cyan-500/20", emoji: "🏠" },
        { id: 210, category: "재물", title: "돈을 빌려주거나 빌려도 괜찮은 시기인가?", tags: "#금전거래 #신용", bgColor: "bg-slate-900/30 border border-slate-500/20", emoji: "🤝" },

        // 취업/학업 (Career/Study) - 10 items
        { id: 301, category: "취업/학업", title: "다가오는 면접/시험, 합격할 수 있을까?", tags: "#합격운 #면접운", bgColor: "bg-blue-900/30 border border-blue-500/20", emoji: "🎯" },
        { id: 302, category: "취업/학업", title: "대체 언제쯤 취업/이직에 성공할까?", tags: "#취업시기 #이직운", bgColor: "bg-indigo-900/30 border border-indigo-500/20", emoji: "💼" },
        { id: 303, category: "취업/학업", title: "현재 직장 계속 다녀야 할까, 퇴사할까?", tags: "#퇴사고민 #진로", bgColor: "bg-purple-900/30 border border-purple-500/20", emoji: "🚪" },
        { id: 304, category: "취업/학업", title: "나의 숨겨진 재능과 가장 잘 맞는 천직은?", tags: "#천직 #적성찾기", bgColor: "bg-fuchsia-900/30 border border-fuchsia-500/20", emoji: "⭐" },
        { id: 305, category: "취업/학업", title: "프로젝트/승진에서 좋은 결과를 얻을 수 있을까?", tags: "#승진운 #성과", bgColor: "bg-sky-900/30 border border-sky-500/20", emoji: "🏆" },
        { id: 306, category: "취업/학업", title: "새로운 분야로의 진로 변경, 괜찮을까?", tags: "#진로변경 #새출발", bgColor: "bg-emerald-900/30 border border-emerald-500/20", emoji: "🌱" },
        { id: 307, category: "취업/학업", title: "학업/공부에 집중이 안 될 때 극복 방법은?", tags: "#슬럼프탈출 #학업운", bgColor: "bg-amber-900/30 border border-amber-500/20", emoji: "📚" },
        { id: 308, category: "취업/학업", title: "직장 내 인간관계 스트레스 탈출법", tags: "#사회생활 #처세술", bgColor: "bg-rose-900/30 border border-rose-500/20", emoji: "🤯" },
        { id: 309, category: "취업/학업", title: "프리랜서/1인 기업으로 성공할 수 있을까?", tags: "#독립 #창업운", bgColor: "bg-orange-900/30 border border-orange-500/20", emoji: "💻" },
        { id: 310, category: "취업/학업", title: "해외 우물 밖으로 나가는 운이 있을까?", tags: "#유학 #해외취업", bgColor: "bg-cyan-900/30 border border-cyan-500/20", emoji: "✈️" },

        // 건강 (Health) - 10 items
        { id: 401, category: "건강", title: "요즘 너무 피곤한데, 나의 에너지는 어떤 상태일까?", tags: "#에너지체크 #번아웃", bgColor: "bg-green-900/30 border border-green-500/20", emoji: "🔋" },
        { id: 402, category: "건강", title: "주의해야 할 올 한 해 건강 이슈는?", tags: "#건강검진 #예방", bgColor: "bg-teal-900/30 border border-teal-500/20", emoji: "🩺" },
        { id: 403, category: "건강", title: "나의 정신 건강(멘탈) 관리 팁", tags: "#마음챙김 #스트레스", bgColor: "bg-sky-900/30 border border-sky-500/20", emoji: "🧘‍♀️" },
        { id: 404, category: "건강", title: "다이어트/운동 계획, 이번엔 성공할 수 있을까?", tags: "#다이어트 #운동운", bgColor: "bg-orange-900/30 border border-orange-500/20", emoji: "🏃‍♀️" },
        { id: 405, category: "건강", title: "나에게 필요한 영양소나 음식 기운은?", tags: "#음식궁합 #오행", bgColor: "bg-amber-900/30 border border-amber-500/20", emoji: "🥗" },
        { id: 406, category: "건강", title: "수면의 질을 높이기 위해 필요한 것은?", tags: "#불면증 #휴식", bgColor: "bg-indigo-900/30 border border-indigo-500/20", emoji: "💤" },
        { id: 407, category: "건강", title: "잔병치레 극복을 위한 나의 생활 습관 교정", tags: "#생활습관 #면역력", bgColor: "bg-lime-900/30 border border-lime-500/20", emoji: "💊" },
        { id: 408, category: "건강", title: "현재 치료 중인 질환의 호전 가능성", tags: "#회복운 #건강운", bgColor: "bg-emerald-900/30 border border-emerald-500/20", emoji: "🩹" },
        { id: 409, category: "건강", title: "휴식이 필요할 때 내가 가야 할 힐링 스팟", tags: "#여행운 #재충전", bgColor: "bg-cyan-900/30 border border-cyan-500/20", emoji: "🏝️" },
        { id: 410, category: "건강", title: "반려동물의 현재 건강 상태나 조심할 점", tags: "#반려동물 #펫타로", bgColor: "bg-rose-900/30 border border-rose-500/20", emoji: "🐾" },

        // 인간관계 (Relationships) - 10 items
        { id: 501, category: "인간관계", title: "나를 힘들게 하는 그 사람, 어떻게 대할까?", tags: "#기싸움 #처세술", bgColor: "bg-slate-900/30 border border-slate-500/20", emoji: "⚔️" },
        { id: 502, category: "인간관계", title: "나의 귀인은 언제 어디서 나타날까?", tags: "#귀인운 #인연", bgColor: "bg-yellow-900/30 border border-yellow-500/20", emoji: "👼" },
        { id: 503, category: "인간관계", title: "친구 무리에서 나는 어떤 존재일까?", tags: "#소셜포지션 #이미지", bgColor: "bg-indigo-900/30 border border-indigo-500/20", emoji: "🎭" },
        { id: 504, category: "인간관계", title: "새로운 무리/모임에 들어가면 잘 적응할까?", tags: "#새출발 #적응력", bgColor: "bg-green-900/30 border border-green-500/20", emoji: "🌱" },
        { id: 505, category: "인간관계", title: "오해받고 있는 상황, 어떻게 풀어야 할까?", tags: "#오해해결 #진심", bgColor: "bg-blue-900/30 border border-blue-500/20", emoji: "💧" },
        { id: 506, category: "인간관계", title: "나의 뒷담화를 하는 사람이 있을까?", tags: "#인간관계 #주의할사람", bgColor: "bg-red-900/30 border border-red-500/20", emoji: "🐍" },
        { id: 507, category: "인간관계", title: "오랜 친구와의 갈등, 먼저 사과해야 할까?", tags: "#우정 #갈등해결", bgColor: "bg-orange-900/30 border border-orange-500/20", emoji: "🕊️" },
        { id: 508, category: "인간관계", title: "가족과의 문제, 어떤 마음가짐이 필요할까?", tags: "#가족운 #이해", bgColor: "bg-amber-900/30 border border-amber-500/20", emoji: "🏡" },
        { id: 509, category: "인간관계", title: "동업을 제안받았는데 함께해도 괜찮을까?", tags: "#동업 #파트너십", bgColor: "bg-teal-900/30 border border-teal-500/20", emoji: "🔗" },
        { id: 510, category: "인간관계", title: "내 주변의 소중한 인연 놓치지 않는 법", tags: "#인복 #감사", bgColor: "bg-fuchsia-900/30 border border-fuchsia-500/20", emoji: "💝" },
    ];

    const tabs = ["전체", "애정", "재물", "취업/학업", "건강", "인간관계"];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0f25] via-[#1a142d] to-[#2c1b4d] text-white pb-24 font-pretendard">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-purple-900/20 to-transparent"></div>
                {Array.from({ length: 20 }).map((_, i) => (
                    <Star
                        key={i}
                        className="absolute text-yellow-100/20 fill-yellow-100/20"
                        size={Math.random() * 4 + 2}
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animation: `pulse ${Math.random() * 4 + 2}s infinite`
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10">
                {/* Header / Title Area */}
                <div className="px-5 pt-8 pb-4">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-amber-200">
                            마인드 타로
                        </h1>
                    </div>

                    <div className="mb-2">
                        <p className="text-sm font-bold text-purple-300 mb-1 flex items-center gap-1">
                            무의식을 비추는 거울 <Sparkles size={14} className="text-amber-300" />
                        </p>
                        <h2 className="text-[22px] font-black leading-tight text-white/95">
                            내면의 소리에<br/>귀 기울이는 시간
                        </h2>
                    </div>
                </div>

                {/* Top 2 Big Cards */}
                <div className="px-5 flex gap-3 mb-10">
                    <Link href="/tarot/play?type=daily" className="flex-1 rounded-3xl border border-purple-500/20 bg-[#1e1533]/80 backdrop-blur-md p-5 flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:bg-[#241a3d]/90 hover:border-purple-500/40 transition-all cursor-pointer block transform hover:-translate-y-1 group">
                        <div className="relative mb-3 h-12 w-12 flex justify-center items-center">
                            <div className="absolute w-[30px] h-[40px] border border-purple-400/30 bg-[#160f24] rounded-lg flex items-center justify-center rotate-12 translate-x-2 shadow-sm group-hover:rotate-[15deg] transition-transform">
                                <Moon size={14} className="text-purple-300" />
                            </div>
                            <div className="absolute w-[30px] h-[40px] border border-amber-400/30 bg-[#2b1b42] rounded-lg flex items-center justify-center -rotate-12 -translate-x-1.5 z-10 shadow-sm group-hover:-rotate-[15deg] transition-transform">
                                <Star size={14} className="text-amber-300" />
                            </div>
                        </div>
                        <h3 className="text-[15px] font-black text-white/90 mb-1">투데이 인사이트</h3>
                        <p className="text-[12px] font-medium text-white/50">오늘의 흐름 읽기</p>
                    </Link>
                    <Link href="/tarot/play?type=monthly" className="flex-1 rounded-3xl border border-indigo-500/20 bg-[#161c33]/80 backdrop-blur-md p-5 flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:bg-[#1a213b]/90 hover:border-indigo-500/40 transition-all cursor-pointer block transform hover:-translate-y-1 group">
                        <div className="text-4xl mb-3 mt-1 opacity-90 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform">🕊️</div>
                        <h3 className="text-[15px] font-black text-white/90 mb-1">이달의 테마</h3>
                        <p className="text-[12px] font-medium text-white/50">월간 감정선 진단</p>
                    </Link>
                </div>

                {/* Secondary Header */}
                <div className="px-5 mb-4">
                    <h2 className="text-[19px] font-black text-white/90">지금 가장 큰 고민은 무엇인가요?</h2>
                    <p className="text-sm text-white/50 mt-1">질문을 선택하고 카드를 뽑아보세요.</p>
                </div>

                {/* Scrollable Categories Tab */}
                <div className="pl-5 mb-6 overflow-x-auto scrollbar-hide">
                    <div className="flex gap-2 w-max pr-5">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-full text-[14px] font-bold transition-all border shadow-sm ${activeTab === tab
                                    ? "bg-purple-600/40 text-white border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                                    : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tarot List */}
                <div className="px-5 flex flex-col gap-3">
                    {tarotList
                        .filter(item => activeTab === "전체" || item.category === activeTab)
                        .map((item) => (
                            <Link
                                href={`/tarot/play?type=single&category=${item.title}`}
                                key={item.id}
                                className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-purple-500/30 transition-all group cursor-pointer"
                            >
                                <div className="flex flex-col flex-1 pr-4">
                                    <h3 className="text-[15px] font-bold mb-1.5 text-white/90 group-hover:text-purple-300 transition-colors leading-snug">{item.title}</h3>
                                    <p className="text-[12px] text-white/40 font-medium">{item.tags}</p>
                                </div>
                                <div className={`w-[60px] h-[60px] rounded-xl ${item.bgColor} flex items-center justify-center text-2xl shadow-sm shrink-0 group-hover:scale-105 transition-transform`}>
                                    {item.emoji}
                                </div>
                            </Link>
                        ))}
                </div>
            </div>
        </div>
    );
}
