"use client";

import { useState, useEffect, Suspense } from "react";
import DestinyMatrixCard from "@/components/DestinyMatrixCard";
import ActionableInsightWidget from "@/components/ActionableInsightWidget";
import DaewunTimeline, { DaewunPillar } from "@/components/DaewunTimeline";
import FortuneCycleDashboard from "@/components/FortuneCycleDashboard";
import DailyGuideCard, { DailyFortuneData } from "@/components/DailyGuideCard";
import MonthlyReportTemplate from "@/components/MonthlyReportTemplate";
import ElementalRadarChart from "@/components/ElementalRadarChart";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface LifeStage {
    name: string;
    pillar: string;
    description: string;
}

interface MatrixData {
    time_pillar: any;
    day_pillar: any;
    month_pillar: any;
    year_pillar: any;
    daewun_number: number;
    daewun_pillars: DaewunPillar[];
    daily_fortune: DailyFortuneData;
    fortune_cycle?: any;
}

// Helper component for the cute animal loading animation
const AnimatedAnimalLoader = ({ dayStem, readingType }: { dayStem: string | null, readingType: string }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Fast fake progress up to 99%
        const interval = setInterval(() => {
            setProgress(p => {
                if (p < 99) {
                    return p + Math.floor(Math.random() * 5) + 1; // Increment by 1-5
                }
                return 99;
            });
        }, 300);
        return () => clearInterval(interval);
    }, []);

    // Determine animal based on Heavenly Stem (Day Master)
    let animalEmoji = "🔮"; // Default
    let animalAction = "걸어오는 중...";

    if (dayStem) {
        if (['갑', '을', '甲', '乙'].includes(dayStem)) {
            animalEmoji = "🐰"; // Wood
            animalAction = "토끼가 폴짝폴짝 뛰어오는 중...";
        } else if (['병', '정', '丙', '丁'].includes(dayStem)) {
            animalEmoji = "🐴"; // Fire
            animalAction = "말이 힘차게 달려오는 중...";
        } else if (['무', '기', '戊', '己'].includes(dayStem)) {
            animalEmoji = "🐶"; // Earth
            animalAction = "강아지가 신나게 쫓아오는 중...";
        } else if (['경', '신', '庚', '辛'].includes(dayStem)) {
            animalEmoji = "🐒"; // Metal
            animalAction = "원숭이가 나무를 타고 오는 중...";
        } else if (['임', '계', '壬', '癸'].includes(dayStem)) {
            animalEmoji = "🐷"; // Water
            animalAction = "돼지가 통통통 굴러오는 중...";
        }
    }

    return (
        <div className="flex flex-col items-center justify-center py-16 gap-6 relative overflow-hidden">
            {/* The Animal */}
            <div className="relative text-7xl animate-bounce" style={{ animationDuration: '0.8s' }}>
                {animalEmoji}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/10 rounded-full blur-[2px] animate-pulse"></div>
            </div>

            {/* The Message & Progress */}
            <div className="flex flex-col items-center gap-2">
                <p className="text-[#d4af37] font-black text-2xl tracking-tight">
                    {Math.min(progress, 99)}%
                </p>
                <h3 className="text-gray-900 font-bold text-lg text-center leading-tight">
                    당신의 {readingType}를<br />세밀하게 분석하고 있습니다.
                </h3>
                <p className="text-sm font-medium text-gray-500 mt-1">
                    {animalAction}
                </p>
            </div>
        </div>
    );
};

function SajuContent() {
    const [matrix, setMatrix] = useState<MatrixData | null>(null);
    const [insight, setInsight] = useState<string | null>(null);
    const [lifeStages, setLifeStages] = useState<LifeStage[] | null>(null);
    const [specificReading, setSpecificReading] = useState<string | null>(null);
    // Vercel 프록시 타임아웃(15초)을 우회하기 위해 Render 직접 호출.
    // 환경변수 없으면 Render 기본 주소 사용.
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://saju-web.onrender.com";
    const [timeInfo, setTimeInfo] = useState<{
        true_solar_time: string;
        original_time: string;
        longitude_offset_min: number;
        eot_min: number;
        total_correction_min: number;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialTabParam = searchParams.get('tab') as any;
    const readingType = searchParams.get('type');
    const displayTitle = readingType ? `${readingType} 결과` : '정밀 사주 분석';

    const initialTab = ['daewun', 'life_stages', 'yearly', 'daily', 'elemental'].includes(initialTabParam)
        ? initialTabParam
        : "daewun";

    const [activeTab, setActiveTab] = useState<"daewun" | "life_stages" | "yearly" | "daily" | "elemental">(initialTab);

    const handleTabClick = async (tab: "daewun" | "life_stages" | "yearly" | "daily" | "elemental") => {
        setActiveTab(tab);
        if (tab === "life_stages" && !lifeStages && matrix) {
            try {
                const res = await fetch(`${API_BASE}/life-stages`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(matrix)
                });
                if (res.ok) {
                    const data = await res.json();
                    setLifeStages(data.stages || null);
                } else {
                    throw new Error("Server returned non-200");
                }
            } catch (err) {
                console.error("Failed to fetch life stages:", err);
                setLifeStages([
                    { name: "초년기 (0~19세)", pillar: "년주", description: "성장의 토대를 마련하는 시기입니다." },
                    { name: "청년기 (20~39세)", pillar: "월주", description: "사회와 부딪히며 직업적 기틀을 잡습니다." },
                    { name: "중년기 (40~59세)", pillar: "일주", description: "나 자신의 능력이 완성되어 자율성을 가집니다." },
                    { name: "말년기 (60세 이후)", pillar: "시주", description: "결실을 맺고 지혜를 나누는 시기입니다." }
                ]);
            }
        }
    };


    // Effect for handling URL tab parameter changes
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'daewun' || tab === 'life_stages' || tab === 'yearly' || tab === 'daily' || tab === 'elemental') {
            setActiveTab(tab as any);
        }
    }, [searchParams]);

    // Effect for initializing matrix data
    useEffect(() => {

        const storedMatrix = sessionStorage.getItem("saju_matrix");
        const storedTimeInfo = sessionStorage.getItem("saju_time_info");

        if (!storedMatrix) {
            router.replace("/");
            return;
        }

        try {
            const parsedMatrix = JSON.parse(storedMatrix);
            setMatrix(parsedMatrix);

            if (storedTimeInfo) {
                setTimeInfo(JSON.parse(storedTimeInfo));
            }

            // Fetch insight and life stages if we just loaded the matrix
            const fetchAdditionalData = async () => {
                setIsLoading(true);
                try {
                    const paramsType = searchParams.get('type');

                    // Render 무료 서버 부하 및 Vercel 타임아웃 방지를 위해 순차적(Sequential)으로 호출
                    const insightRes = await fetch(`${API_BASE}/api/insight`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(parsedMatrix)
                    });
                    if (insightRes.ok) {
                        const insightData = await insightRes.json();
                        setInsight(insightData.insight);
                    }

                    const lifeRes = await fetch(`${API_BASE}/api/life-stages`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(parsedMatrix)
                    });
                    if (lifeRes.ok) {
                        const lifeData = await lifeRes.json();
                        setLifeStages(lifeData.stages || []);
                    }

                    if (paramsType) {
                        const storedPartnerMatrix = sessionStorage.getItem("saju_partner_matrix");
                        const specificPayload: any = { saju_matrix: parsedMatrix, reading_type: paramsType };
                        if (storedPartnerMatrix) {
                            specificPayload.partner_matrix = JSON.parse(storedPartnerMatrix);
                        }

                        const specificRes = await fetch(`${API_BASE}/api/specific-reading`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(specificPayload)
                        });
                        if (specificRes.ok) {
                            const readingData = await specificRes.json();
                            setSpecificReading(readingData.reading);
                        }
                    }

                } catch (error) {
                    console.error("추가 데이터 로드 실패:", error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchAdditionalData();

        } catch (e) {
            console.error("세션 스토리지 파싱 오류:", e);
            router.replace("/");
        }
    }, [router, searchParams]);

    return (
        <div className="font-pretendard bg-[#F5F6F8] min-h-screen pb-24 text-[#111111]">
            <div className="bg-white px-4 py-3 flex items-center border-b border-gray-100 sticky top-0 z-50">
                <Link href="/" className="p-2 -ml-2 text-gray-800">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="font-bold text-lg text-gray-900 ml-2">{displayTitle}</h1>
            </div>

            <main className="max-w-md mx-auto px-4 pt-4 flex flex-col gap-4 relative z-10 w-full">
                {matrix && (
                    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-5 duration-700">

                        {/* Specific Reading Display */}
                        {readingType ? (
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#d4af37]/30 mb-2 mt-2">
                                <h2 className="text-xl font-black text-gray-900 mb-4">{readingType} 상세 풀이</h2>
                                {specificReading ? (
                                    <div className="max-w-none text-gray-800 leading-relaxed font-medium text-[15px] space-y-3">
                                        {specificReading.split('\n').map((line, i) => {
                                            if (!line.trim()) return null;

                                            // Handling Headers
                                            if (line.startsWith('## ')) {
                                                return <h3 key={i} className="text-lg font-bold text-gray-900 mt-6 mb-2 border-b border-gray-100 pb-2">{line.replace('## ', '').replace(/\*\*/g, '')}</h3>;
                                            }
                                            if (line.startsWith('### ')) {
                                                return <h4 key={i} className="text-base font-bold text-gray-800 mt-4 mb-1">{line.replace('### ', '').replace(/\*\*/g, '')}</h4>;
                                            }

                                            // Handling List items
                                            if (line.trim().startsWith('- ')) {
                                                // Bold parsing for lists
                                                const parts = line.replace('- ', '').split(/(\*\*.*?\*\*)/g);
                                                return (
                                                    <div key={i} className="flex gap-2 mb-1 ml-2">
                                                        <span className="text-[#d4af37] font-bold">•</span>
                                                        <p className="flex-1">
                                                            {parts.map((part, idx) =>
                                                                part.startsWith('**') && part.endsWith('**')
                                                                    ? <strong key={idx} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>
                                                                    : part
                                                            )}
                                                        </p>
                                                    </div>
                                                );
                                            }

                                            // Normal paragraphs with bold parsing
                                            const paragraphParts = line.split(/(\*\*.*?\*\*)/g);
                                            return (
                                                <p key={i} className="mb-2 break-keep text-[14.5px]">
                                                    {paragraphParts.map((part, idx) =>
                                                        part.startsWith('**') && part.endsWith('**')
                                                            ? <strong key={idx} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>
                                                            : part
                                                    )}
                                                </p>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <AnimatedAnimalLoader
                                        dayStem={matrix?.day_pillar?.heavenly?.label?.[0] || null}
                                        readingType={readingType}
                                    />
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Main Module: Destiny Matrix (Always visible when not a specific reading) */}
                                <div className="w-full">
                                    <DestinyMatrixCard matrix={matrix} timeInfo={timeInfo} />
                                </div>

                                {/* Category Tabs (MZ Style Segmented Control) */}
                                <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 w-full overflow-x-auto hide-scrollbar snap-x shadow-sm h-14 items-center">
                                    <button
                                        onClick={() => handleTabClick("daewun")}
                                        className={`flex-1 min-w-[90px] text-[13px] font-bold py-2.5 px-3 rounded-xl transition-all snap-center whitespace-nowrap ${activeTab === 'daewun' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                                    >
                                        10년 대운
                                    </button>
                                    <button
                                        onClick={() => handleTabClick("life_stages")}
                                        className={`flex-1 min-w-[120px] text-[13px] font-bold py-2.5 px-3 rounded-xl transition-all snap-center whitespace-nowrap ${activeTab === 'life_stages' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                                    >
                                        평생 총운
                                    </button>
                                    <button
                                        onClick={() => handleTabClick("yearly")}
                                        className={`flex-1 min-w-[100px] text-[13px] font-bold py-2.5 px-3 rounded-xl transition-all snap-center whitespace-nowrap ${activeTab === 'yearly' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                                    >
                                        올해 운세
                                    </button>
                                    <button
                                        onClick={() => handleTabClick("daily")}
                                        className={`flex-1 min-w-[90px] text-[13px] font-bold py-2.5 px-3 rounded-xl transition-all snap-center whitespace-nowrap ${activeTab === 'daily' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                                    >
                                        오늘 일진
                                    </button>
                                    <button
                                        onClick={() => handleTabClick("elemental")}
                                        className={`flex-1 min-w-[90px] text-[13px] font-bold py-2.5 px-3 rounded-xl transition-all snap-center whitespace-nowrap ${activeTab === 'elemental' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                                    >
                                        오행 분석
                                    </button>
                                </div>

                                {/* Tab Contents */}
                                <div className="min-h-[400px] animate-in fade-in duration-500">

                                    {/* Tab 1: Daewun */}
                                    {activeTab === "daewun" && matrix.daewun_pillars && (
                                        <div className="bg-white rounded-3xl pb-6 shadow-sm border border-gray-100 overflow-hidden">
                                            <DaewunTimeline daewunNumber={matrix.daewun_number} pillars={matrix.daewun_pillars} />
                                        </div>
                                    )}

                                    {/* Tab: Life Stages */}
                                    {activeTab === "life_stages" && (
                                        <div className="flex flex-col gap-3">
                                            {!lifeStages ? (
                                                // Loading Skeleton
                                                <div className="flex flex-col gap-3 animate-pulse">
                                                    {[1, 2, 3, 4].map((skeleton) => (
                                                        <div key={skeleton} className="rounded-2xl bg-white border border-gray-100 p-5 h-28 flex flex-col justify-center">
                                                            <div className="w-1/3 h-5 bg-gray-200 rounded mb-3"></div>
                                                            <div className="w-full h-3 bg-gray-100 rounded mb-2"></div>
                                                            <div className="w-4/5 h-3 bg-gray-100 rounded"></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                lifeStages.map((stage, i) => (
                                                    <div key={i} className="rounded-2xl bg-white border border-gray-100 p-5 relative overflow-hidden group hover:bg-gray-50 transition-colors shadow-sm">
                                                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-500 opacity-70" />
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h4 className="text-lg font-bold text-gray-900 tracking-tight">{stage.name}</h4>
                                                            <span className="text-[11px] font-outfit text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                                                {stage.pillar}
                                                            </span>
                                                        </div>
                                                        <p className="text-[13px] text-gray-600 leading-relaxed font-medium">
                                                            {stage.description}
                                                        </p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}

                                    {/* Tab 2: Yearly & Monthly */}
                                    {activeTab === "yearly" && (
                                        <div className="flex flex-col gap-4">
                                            {matrix.fortune_cycle && (
                                                <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 p-4">
                                                    <FortuneCycleDashboard cycle={matrix.fortune_cycle} />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Tab 3: Daily Fortune & Insight */}
                                    {activeTab === "daily" && (
                                        <div className="flex flex-col gap-4">
                                            {matrix.daily_fortune && (
                                                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-1">
                                                    <DailyGuideCard fortune={matrix.daily_fortune} />
                                                </div>
                                            )}
                                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 relative overflow-hidden">
                                                <ActionableInsightWidget insightText={insight} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Tab 4: Elemental Analysis */}
                                    {activeTab === "elemental" && (
                                        <div className="h-[350px] bg-white rounded-3xl shadow-sm border border-gray-100 p-4 relative overflow-hidden">
                                            <ElementalRadarChart matrix={matrix} />
                                        </div>
                                    )}

                                </div>
                            </>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default function SajuPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F5F6F8]"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>}>
            <SajuContent />
        </Suspense>
    );
}
