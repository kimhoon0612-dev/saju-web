"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Sparkles, Heart, Star, Moon, ChevronRight } from "lucide-react";
import UserBadge from "@/components/UserBadge";

// HOT 배지 대상 id 목록 (상위 인기 질문)
const HOT_IDS = new Set([101, 102, 201, 205, 301, 304, 401, 501]);
const NEW_IDS = new Set([109, 210, 309, 410, 510]);

export default function TarotPage() {
    const [activeTab, setActiveTab] = useState("전체");
    const [favorites, setFavorites] = useState<Set<number>>(new Set());
    const [isAnimating, setIsAnimating] = useState(false);

    // Load favorites from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem("tarot_favorites");
            if (stored) setFavorites(new Set(JSON.parse(stored)));
        } catch {}
    }, []);

    const toggleFavorite = (id: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setFavorites(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            localStorage.setItem("tarot_favorites", JSON.stringify(Array.from(next)));
            return next;
        });
    };

    const handleTabChange = (tab: string) => {
        if (tab === activeTab) return;
        setIsAnimating(true);
        setTimeout(() => {
            setActiveTab(tab);
            setIsAnimating(false);
        }, 180);
    };

    const tarotList = [
        // 애정
        { id: 101, category: "애정", title: "나의 진정한 인연은 언제 나타날까?", tags: "#새로운인연 #타이밍", emoji: "💕" },
        { id: 102, category: "애정", title: "지금 썸타는 그 사람의 진짜 속마음", tags: "#썸 #속마음", emoji: "👀" },
        { id: 103, category: "애정", title: "헤어진 그 사람, 우리 다시 만날 수 있을까?", tags: "#재회운 #미련", emoji: "🥀" },
        { id: 104, category: "애정", title: "내가 짝사랑하는 그 사람과 잘 될 확률", tags: "#짝사랑 #연애성공", emoji: "💘" },
        { id: 105, category: "애정", title: "현재 연인과의 앞으로의 관계 흐름", tags: "#현재연애 #권태기극복", emoji: "💑" },
        { id: 106, category: "애정", title: "나의 매력 포인트는 무엇일까?", tags: "#자기매력 #어필포인트", emoji: "✨" },
        { id: 107, category: "애정", title: "결혼을 전제로 만날 수 있는 사람일까?", tags: "#결혼운 #진지한만남", emoji: "💍" },
        { id: 108, category: "애정", title: "최근 멀어진 친구/연인과 관계 회복법", tags: "#관계회복 #화해", emoji: "🤝" },
        { id: 109, category: "애정", title: "나를 남몰래 좋아하고 있는 사람이 있을까?", tags: "#비밀연애 #숨겨진마음", emoji: "🤫" },
        { id: 110, category: "애정", title: "다음 연애는 어떤 스타일의 사람과 할까?", tags: "#다음연애 #이상형", emoji: "🔮" },
        // 재물
        { id: 201, category: "재물", title: "올해 나의 재물운 흐름은 어떨까?", tags: "#금전운 #재물흐름", emoji: "💰" },
        { id: 202, category: "재물", title: "지금 고려 중인 투자, 진행해도 괜찮을까?", tags: "#투자운 #수익기대", emoji: "📈" },
        { id: 203, category: "재물", title: "나의 숨겨진 재물 그릇의 크기", tags: "#재물그릇 #잠재력", emoji: "🏺" },
        { id: 204, category: "재물", title: "부를 끌어당기기 위해 내가 해야 할 행동", tags: "#부자되기 #금전전략", emoji: "🧘" },
        { id: 205, category: "재물", title: "가까운 미래에 뜻밖의 수익(횡재수)이 있을까?", tags: "#횡재수 #로또운", emoji: "🎁" },
        { id: 206, category: "재물", title: "현재 나의 금전적 문제, 언제 해결될까?", tags: "#빚청산 #위기탈출", emoji: "🔑" },
        { id: 207, category: "재물", title: "사업/부업을 시작하면 돈이 될까?", tags: "#N잡 #사업운", emoji: "🚀" },
        { id: 208, category: "재물", title: "나의 주 지출 원인과 절약 팁", tags: "#소비습관 #절약", emoji: "✂️" },
        { id: 209, category: "재물", title: "부동산/문서 운이 들어오는 시기", tags: "#내집마련 #문서운", emoji: "🏠" },
        { id: 210, category: "재물", title: "돈을 빌려주거나 빌려도 괜찮은 시기인가?", tags: "#금전거래 #신용", emoji: "🤝" },
        // 취업/학업
        { id: 301, category: "취업/학업", title: "다가오는 면접/시험, 합격할 수 있을까?", tags: "#합격운 #면접운", emoji: "🎯" },
        { id: 302, category: "취업/학업", title: "대체 언제쯤 취업/이직에 성공할까?", tags: "#취업시기 #이직운", emoji: "💼" },
        { id: 303, category: "취업/학업", title: "현재 직장 계속 다녀야 할까, 퇴사할까?", tags: "#퇴사고민 #진로", emoji: "🚪" },
        { id: 304, category: "취업/학업", title: "나의 숨겨진 재능과 가장 잘 맞는 천직은?", tags: "#천직 #적성찾기", emoji: "⭐" },
        { id: 305, category: "취업/학업", title: "프로젝트/승진에서 좋은 결과를 얻을 수 있을까?", tags: "#승진운 #성과", emoji: "🏆" },
        { id: 306, category: "취업/학업", title: "새로운 분야로의 진로 변경, 괜찮을까?", tags: "#진로변경 #새출발", emoji: "🌱" },
        { id: 307, category: "취업/학업", title: "학업/공부에 집중이 안 될 때 극복 방법은?", tags: "#슬럼프탈출 #학업운", emoji: "📚" },
        { id: 308, category: "취업/학업", title: "직장 내 인간관계 스트레스 탈출법", tags: "#사회생활 #처세술", emoji: "🤯" },
        { id: 309, category: "취업/학업", title: "프리랜서/1인 기업으로 성공할 수 있을까?", tags: "#독립 #창업운", emoji: "💻" },
        { id: 310, category: "취업/학업", title: "해외 우물 밖으로 나가는 운이 있을까?", tags: "#유학 #해외취업", emoji: "✈️" },
        // 건강
        { id: 401, category: "건강", title: "요즘 너무 피곤한데, 나의 에너지는 어떤 상태일까?", tags: "#에너지체크 #번아웃", emoji: "🔋" },
        { id: 402, category: "건강", title: "주의해야 할 올 한 해 건강 이슈는?", tags: "#건강검진 #예방", emoji: "🩺" },
        { id: 403, category: "건강", title: "나의 정신 건강(멘탈) 관리 팁", tags: "#마음챙김 #스트레스", emoji: "🧘‍♀️" },
        { id: 404, category: "건강", title: "다이어트/운동 계획, 이번엔 성공할 수 있을까?", tags: "#다이어트 #운동운", emoji: "🏃‍♀️" },
        { id: 405, category: "건강", title: "나에게 필요한 영양소나 음식 기운은?", tags: "#음식궁합 #오행", emoji: "🥗" },
        { id: 406, category: "건강", title: "수면의 질을 높이기 위해 필요한 것은?", tags: "#불면증 #휴식", emoji: "💤" },
        { id: 407, category: "건강", title: "잔병치레 극복을 위한 나의 생활 습관 교정", tags: "#생활습관 #면역력", emoji: "💊" },
        { id: 408, category: "건강", title: "현재 치료 중인 질환의 호전 가능성", tags: "#회복운 #건강운", emoji: "🩹" },
        { id: 409, category: "건강", title: "휴식이 필요할 때 내가 가야 할 힐링 스팟", tags: "#여행운 #재충전", emoji: "🏝️" },
        { id: 410, category: "건강", title: "반려동물의 현재 건강 상태나 조심할 점", tags: "#반려동물 #펫타로", emoji: "🐾" },
        // 인간관계
        { id: 501, category: "인간관계", title: "나를 힘들게 하는 그 사람, 어떻게 대할까?", tags: "#기싸움 #처세술", emoji: "⚔️" },
        { id: 502, category: "인간관계", title: "나의 귀인은 언제 어디서 나타날까?", tags: "#귀인운 #인연", emoji: "👼" },
        { id: 503, category: "인간관계", title: "친구 무리에서 나는 어떤 존재일까?", tags: "#소셜포지션 #이미지", emoji: "🎭" },
        { id: 504, category: "인간관계", title: "새로운 무리/모임에 들어가면 잘 적응할까?", tags: "#새출발 #적응력", emoji: "🌱" },
        { id: 505, category: "인간관계", title: "오해받고 있는 상황, 어떻게 풀어야 할까?", tags: "#오해해결 #진심", emoji: "💧" },
        { id: 506, category: "인간관계", title: "나의 뒷담화를 하는 사람이 있을까?", tags: "#인간관계 #주의할사람", emoji: "🐍" },
        { id: 507, category: "인간관계", title: "오랜 친구와의 갈등, 먼저 사과해야 할까?", tags: "#우정 #갈등해결", emoji: "🕊️" },
        { id: 508, category: "인간관계", title: "가족과의 문제, 어떤 마음가짐이 필요할까?", tags: "#가족운 #이해", emoji: "🏡" },
        { id: 509, category: "인간관계", title: "동업을 제안받았는데 함께해도 괜찮을까?", tags: "#동업 #파트너십", emoji: "🔗" },
        { id: 510, category: "인간관계", title: "내 주변의 소중한 인연 놓치지 않는 법", tags: "#인복 #감사", emoji: "💝" },
    ];

    const tabs = ["전체", "애정", "재물", "취업/학업", "건강", "인간관계"];
    const tabEmoji: Record<string, string> = {
        "전체": "🌟", "애정": "💕", "재물": "💰", "취업/학업": "💼", "건강": "💪", "인간관계": "🤝"
    };

    const filtered = tarotList.filter(item => activeTab === "전체" || item.category === activeTab);
    const favCount = favorites.size;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0f25] via-[#1a142d] to-[#2c1b4d] text-white pb-28 font-pretendard">
            {/* Background starfield */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-purple-900/20 to-transparent" />
                {Array.from({ length: 30 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-white"
                        style={{
                            width: `${Math.random() * 2.5 + 1}px`,
                            height: `${Math.random() * 2.5 + 1}px`,
                            top: `${Math.random() * 80}%`,
                            left: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.4 + 0.1,
                            animation: `pulse ${Math.random() * 4 + 2}s ${Math.random() * 3}s infinite`,
                        }}
                    />
                ))}
                {/* Nebula orbs */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-[80px]" />
                <div className="absolute bottom-40 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px]" />
            </div>

            <div className="relative z-10 max-w-md mx-auto">
                {/* Header */}
                <div className="px-5 pt-10 pb-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <p className="text-[11px] font-black text-purple-400 uppercase tracking-widest mb-1">MIND TAROT</p>
                            <h1 className="text-[28px] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-200 to-amber-200 leading-tight">
                                마인드 타로
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            {favCount > 0 && (
                                <button
                                    onClick={() => handleTabChange("전체")}
                                    className="flex items-center gap-1 text-[12px] font-black text-pink-300 bg-pink-900/30 border border-pink-500/30 px-2.5 py-1 rounded-full"
                                >
                                    <Heart className="w-3 h-3 fill-pink-300" /> {favCount}
                                </button>
                            )}
                            <UserBadge />
                        </div>
                    </div>

                    <p className="text-[14px] text-purple-300 mb-1 flex items-center gap-1.5 font-bold">
                        무의식을 비추는 거울 <Sparkles size={13} className="text-amber-300" />
                    </p>
                    <h2 className="text-[20px] font-black leading-tight text-white/95 break-keep">
                        내면의 소리에 귀 기울이는 시간
                    </h2>
                </div>

                {/* Quick Access Cards */}
                <div className="px-5 flex gap-3 mb-8">
                    <Link href="/tarot/play?type=daily" className="flex-1 rounded-[24px] border border-purple-500/25 bg-gradient-to-b from-purple-900/60 to-purple-950/80 backdrop-blur-md p-5 flex flex-col items-center justify-center shadow-xl hover:border-purple-400/50 transition-all group transform hover:-translate-y-1">
                        <div className="relative mb-3 h-14 w-14 flex justify-center items-center">
                            <div className="absolute w-8 h-11 border border-purple-400/30 bg-[#160f24] rounded-lg flex items-center justify-center rotate-12 translate-x-2.5 shadow-sm group-hover:rotate-[18deg] transition-transform duration-300">
                                <Moon size={14} className="text-purple-300" />
                            </div>
                            <div className="absolute w-8 h-11 border border-amber-400/30 bg-[#2b1b42] rounded-lg flex items-center justify-center -rotate-12 -translate-x-2 z-10 shadow-sm group-hover:-rotate-[18deg] transition-transform duration-300">
                                <Star size={14} className="text-amber-300 fill-amber-300/50" />
                            </div>
                        </div>
                        <h3 className="text-[15px] font-black text-white/95 mb-1">투데이 인사이트</h3>
                        <p className="text-[11px] font-medium text-white/45">오늘의 흐름 읽기</p>
                    </Link>
                    <Link href="/tarot/play?type=monthly" className="flex-1 rounded-[24px] border border-indigo-500/25 bg-gradient-to-b from-indigo-900/60 to-indigo-950/80 backdrop-blur-md p-5 flex flex-col items-center justify-center shadow-xl hover:border-indigo-400/50 transition-all group transform hover:-translate-y-1">
                        <div className="text-5xl mb-3 mt-1 opacity-90 drop-shadow-[0_0_16px_rgba(255,255,255,0.25)] group-hover:scale-110 transition-transform duration-300">🕊️</div>
                        <h3 className="text-[15px] font-black text-white/95 mb-1">이달의 테마</h3>
                        <p className="text-[11px] font-medium text-white/45">월간 감정선 진단</p>
                    </Link>
                </div>

                {/* Question section header */}
                <div className="px-5 mb-5">
                    <h2 className="text-[20px] font-black text-white/95">지금 가장 큰 고민은?</h2>
                    <p className="text-[13px] text-white/40 mt-1 font-medium">질문을 선택하고 카드를 뽑아보세요.</p>
                </div>

                {/* Category Tabs */}
                <div className="pl-5 mb-5 overflow-x-auto hide-scrollbar">
                    <div className="flex gap-2 w-max pr-5">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold transition-all border shadow-sm whitespace-nowrap ${
                                    activeTab === tab
                                        ? "bg-purple-600/50 text-white border-purple-500/60 shadow-[0_0_18px_rgba(168,85,247,0.35)]"
                                        : "bg-white/5 text-white/55 border-white/10 hover:bg-white/10 hover:text-white/80"
                                }`}
                            >
                                <span>{tabEmoji[tab]}</span>
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tarot List with animation */}
                <div
                    className={`px-5 flex flex-col gap-2.5 transition-all duration-180 ${
                        isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                    }`}
                    style={{ transform: isAnimating ? 'translateY(8px)' : 'translateY(0)', transition: 'opacity 0.18s ease, transform 0.18s ease' }}
                >
                    {filtered.map((item) => {
                        const isHot = HOT_IDS.has(item.id);
                        const isNew = NEW_IDS.has(item.id);
                        const isFav = favorites.has(item.id);

                        return (
                            <Link
                                href={`/tarot/play?type=single&category=${item.title}`}
                                key={item.id}
                                className="flex justify-between items-center p-4 rounded-[20px] bg-white/5 border border-white/6 hover:bg-white/10 hover:border-purple-500/35 transition-all group cursor-pointer"
                            >
                                <div className="flex flex-col flex-1 pr-3">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        {isHot && (
                                            <span className="text-[10px] font-black bg-gradient-to-r from-orange-500 to-red-500 text-white px-1.5 py-0.5 rounded-full">🔥 HOT</span>
                                        )}
                                        {isNew && !isHot && (
                                            <span className="text-[10px] font-black bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-1.5 py-0.5 rounded-full">✨ NEW</span>
                                        )}
                                    </div>
                                    <h3 className="text-[14px] font-bold text-white/90 group-hover:text-purple-200 transition-colors leading-snug break-keep">{item.title}</h3>
                                    <p className="text-[11px] text-white/35 font-medium mt-1">{item.tags}</p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {/* Favorite button */}
                                    <button
                                        onClick={(e) => toggleFavorite(item.id, e)}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                            isFav
                                                ? 'bg-pink-500/20 border border-pink-500/40'
                                                : 'bg-white/5 border border-white/10 opacity-0 group-hover:opacity-100'
                                        }`}
                                    >
                                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-pink-400 text-pink-400' : 'text-white/50'}`} />
                                    </button>

                                    {/* Emoji icon */}
                                    <div className="w-[58px] h-[58px] rounded-[16px] bg-white/6 border border-white/8 flex items-center justify-center text-[26px] shadow-sm shrink-0 group-hover:scale-105 group-hover:bg-white/10 transition-all">
                                        {item.emoji}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Bottom padding for nav */}
                <div className="h-8" />
            </div>
        </div>
    );
}
