import React, { useState } from 'react';
import { Network, History, CalendarRange, Briefcase, Coins, Heart, MessageSquareText } from 'lucide-react';
import { cn } from './DestinyMatrixCard';
import { ElementType } from './DaewunTimeline';

interface BaziChar {
    label: string;
    element: ElementType;
    ten_god: string;
}

interface Pillar {
    titleKo: string;
    heavenly: BaziChar;
    earthly: BaziChar;
    twelve_state?: string;
    description?: string;
    wealth_luck?: string;
    love_luck?: string;
    career_luck?: string;
}

interface DaewunPillar {
    age: number;
    year: number;
    heavenly: BaziChar;
    earthly: BaziChar;
    description?: string;
    wealth_luck?: string;
    love_luck?: string;
    career_luck?: string;
}

interface FortuneCycleProps {
    cycle: {
        current_daewun: DaewunPillar;
        sewun: Pillar;
        wolun: Pillar;
    };
}

const elementConfig: Record<ElementType, { bg: string, text: string, border: string }> = {
    wood: { bg: 'bg-[#27ae60]', text: 'text-[var(--color-wood-neon)]', border: 'border-[#1e8449]' },
    fire: { bg: 'bg-[#c0392b]', text: 'text-[var(--color-fire-orange)]', border: 'border-[#922b21]' },
    earth: { bg: 'bg-[#f39c12]', text: 'text-[var(--color-earth-amber)]', border: 'border-[#d68910]' },
    metal: { bg: 'bg-[#ecf0f1]', text: 'text-[var(--color-metal-silver)]', border: 'border-[#bdc3c7]' },
    water: { bg: 'bg-[#2c3e50]', text: 'text-[var(--color-water-blue)]', border: 'border-[#1a252f]' },
};

const CycleCard = ({ title, subtitle, icon: Icon, data, isDaewun = false }: { title: string, subtitle: string, icon: any, data: any, isDaewun?: boolean }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'career' | 'wealth' | 'love'>('general');

    const hasSpecificLuck = data.wealth_luck || data.career_luck || data.love_luck;

    return (
        <div className="flex-1 flex flex-col bg-black/60 rounded-[1.5rem] border border-white/10 p-5 relative overflow-hidden group hover:bg-white/5 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <h4 className="font-pretendard font-bold text-white text-base">{title}</h4>
                </div>
                <span className="font-outfit text-[10px] text-gray-500 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">{subtitle}</span>
            </div>

            {isDaewun && data && (
                <div className="mb-3 flex justify-center text-center items-center gap-2">
                    <span className="text-white font-pretendard font-bold text-sm bg-white/10 px-2 py-0.5 rounded-md">{data.age}세 대운</span>
                    <span className="text-gray-400 font-outfit text-xs">{data.year}년 시작</span>
                </div>
            )}

            <div className="flex justify-center gap-6 sm:gap-10 relative z-10 flex-1 items-center">
                {/* Heavenly Stem */}
                <div className="flex flex-col items-center gap-1">
                    <span className="text-gray-400 font-pretendard text-xs bg-black/50 px-2 py-0.5 rounded border border-white/5">
                        {data.heavenly.ten_god}
                    </span>
                    <span className={cn(
                        "font-serif text-4xl font-bold drop-shadow-lg scale-110",
                        elementConfig[data.heavenly.element as ElementType]?.text || "text-white"
                    )}>
                        {data.heavenly.label.split('(')[0]}
                    </span>
                    <span className="font-pretendard text-sm text-gray-500">
                        {data.heavenly.label.match(/\((.*?)\)/)?.[1] || ''}
                    </span>
                </div>

                {/* Earthly Branch */}
                <div className="flex flex-col items-center gap-1">
                    <span className="text-gray-400 font-pretendard text-xs bg-black/50 px-2 py-0.5 rounded border border-white/5">
                        {data.earthly.ten_god}
                    </span>
                    <span className={cn(
                        "font-serif text-4xl font-bold drop-shadow-lg scale-110",
                        elementConfig[data.earthly.element as ElementType]?.text || "text-white"
                    )}>
                        {data.earthly.label.split('(')[0]}
                    </span>
                    <span className="font-pretendard text-sm text-gray-500">
                        {data.earthly.label.match(/\((.*?)\)/)?.[1] || ''}
                    </span>
                </div>
            </div>

            {(!isDaewun && data.twelve_state) && (
                <div className="mt-4 flex justify-center text-center border-t border-white/10 pt-3 relative z-10">
                    <span className="text-[11px] text-gray-400 font-pretendard tracking-wide"><span className="text-gray-500 mr-1">12운성</span> {data.twelve_state}</span>
                </div>
            )}

            {data.description && (
                <div className="mt-4 flex flex-col gap-3 relative z-10 w-full">
                    {/* Toggle Buttons */}
                    {hasSpecificLuck && (
                        <div className="flex justify-center gap-1 sm:gap-2 mb-1 w-full flex-wrap">
                            <button
                                onClick={() => setActiveTab('general')}
                                className={cn("flex flex-1 items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] sm:text-xs font-pretendard transition-colors border",
                                    activeTab === 'general' ? "bg-white/10 text-white border-white/20" : "bg-black/30 text-gray-500 border-white/5 hover:text-gray-300")}
                            >
                                <MessageSquareText className="w-3 h-3" /> 총운
                            </button>
                            <button
                                onClick={() => setActiveTab('career')}
                                className={cn("flex flex-1 items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] sm:text-xs font-pretendard transition-colors border",
                                    activeTab === 'career' ? "bg-[var(--color-water-blue)]/20 text-[var(--color-water-blue)] border-[var(--color-water-blue)]/30" : "bg-black/30 text-gray-500 border-white/5 hover:text-[var(--color-water-blue)]")}
                            >
                                <Briefcase className="w-3 h-3" /> 직장/사업
                            </button>
                            <button
                                onClick={() => setActiveTab('wealth')}
                                className={cn("flex flex-1 items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] sm:text-xs font-pretendard transition-colors border",
                                    activeTab === 'wealth' ? "bg-[var(--color-earth-amber)]/20 text-[var(--color-earth-amber)] border-[var(--color-earth-amber)]/30" : "bg-black/30 text-gray-500 border-white/5 hover:text-[var(--color-earth-amber)]")}
                            >
                                <Coins className="w-3 h-3" /> 재물운
                            </button>
                            <button
                                onClick={() => setActiveTab('love')}
                                className={cn("flex flex-1 items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] sm:text-xs font-pretendard transition-colors border",
                                    activeTab === 'love' ? "bg-[var(--color-fire-orange)]/20 text-[var(--color-fire-orange)] border-[var(--color-fire-orange)]/30" : "bg-black/30 text-gray-500 border-white/5 hover:text-[var(--color-fire-orange)]")}
                            >
                                <Heart className="w-3 h-3" /> 애정운
                            </button>
                        </div>
                    )}

                    {/* Content Display */}
                    <div className="text-[11px] sm:text-xs text-gray-300 font-pretendard leading-relaxed text-center px-1 bg-black/40 border border-white/5 rounded-xl p-3 h-[80px] flex items-center justify-center shrink-0 break-keep">
                        {activeTab === 'general' && <p>{data.description}</p>}
                        {activeTab === 'career' && <p>{data.career_luck || "직장/사업운에 특이사항이 없습니다."}</p>}
                        {activeTab === 'wealth' && <p>{data.wealth_luck || "재물운에 특이사항이 없습니다."}</p>}
                        {activeTab === 'love' && <p>{data.love_luck || "애정운에 특이사항이 없습니다."}</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function FortuneCycleDashboard({ cycle }: FortuneCycleProps) {
    if (!cycle) return null;

    return (
        <div className="w-full rounded-[2rem] bg-black/40 border border-white/10 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[var(--color-fire-orange)] rounded-full blur-[150px] opacity-[0.05] pointer-events-none" />

            <header className="mb-6 flex flex-col gap-1 z-10 relative">
                <h3 className="font-pretendard text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <Network className="w-5 h-5 text-[var(--color-fire-orange)]" />운세 사이클 변화
                </h3>
                <p className="font-outfit text-xs text-gray-200 uppercase tracking-widest">
                    Comprehensive Fortune Cycle
                </p>
                <p className="font-pretendard text-xs text-gray-200 mt-2">
                    현재 머물고 있는 10년 대운(환경) 위에서 올해와 이번 달의 운세가 어떻게 흘러가는지 보여줍니다.
                </p>
            </header>

            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 z-10 relative">
                <CycleCard title="현재 대운" subtitle="Decade Base" icon={History} data={cycle.current_daewun} isDaewun={true} />
                <CycleCard title="올해 운세" subtitle="Yearly Theme" icon={CalendarRange} data={cycle.sewun} />
                <CycleCard title="이번달 운세" subtitle="Monthly Mood" icon={CalendarRange} data={cycle.wolun} />
            </div>
        </div>
    );
}
