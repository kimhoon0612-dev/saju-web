import React from 'react';
import { CalendarDays } from 'lucide-react';
import { cn } from './DestinyMatrixCard';

export type ElementType = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

interface BaziChar {
    label: string;
    element: ElementType;
    ten_god: string;
}

export interface DaewunPillar {
    age: number;
    year: number;
    heavenly: BaziChar;
    earthly: BaziChar;
}

interface DaewunTimelineProps {
    daewunNumber: number;
    pillars: DaewunPillar[];
}

const elementConfig: Record<ElementType, { bg: string, text: string, border: string }> = {
    wood: { bg: 'bg-[#27ae60]', text: 'text-[var(--color-wood-neon)]', border: 'border-[#1e8449]' },
    fire: { bg: 'bg-[#c0392b]', text: 'text-[var(--color-fire-red)]', border: 'border-[#922b21]' },
    earth: { bg: 'bg-[#f39c12]', text: 'text-[var(--color-earth-amber)]', border: 'border-[#d68910]' },
    metal: { bg: 'bg-[#ecf0f1]', text: 'text-[var(--color-metal-silver)]', border: 'border-[#bdc3c7]' },
    water: { bg: 'bg-[#2c3e50]', text: 'text-[var(--color-water-blue)]', border: 'border-[#1a252f]' },
};

export default function DaewunTimeline({ daewunNumber, pillars }: DaewunTimelineProps) {
    if (!pillars || pillars.length === 0) return null;

    // Generate mock energy curve points based on element type for the chart
    const generatePath = () => {
        let path = `M 0 100`;
        const widthPerItem = 200; // Space per pillar

        pillars.forEach((p, i) => {
            const x = i * widthPerItem + 100;
            // Simple mock: Fire/Wood gives higher curve, Water/Metal lower, Earth middle
            let y = 100;
            if (p.heavenly.element === 'fire' || p.earthly.element === 'fire') y = 20;
            else if (p.heavenly.element === 'wood' || p.earthly.element === 'wood') y = 50;
            else if (p.heavenly.element === 'water' || p.earthly.element === 'water') y = 150;
            else if (p.heavenly.element === 'metal' || p.earthly.element === 'metal') y = 120;
            else y = 80;

            // Smoothing the curve
            path += ` C ${x - 50} ${i === 0 ? 100 : y}, ${x - 50} ${y}, ${x} ${y}`;
        });
        return path;
    };

    return (
        <div className="w-full rounded-[2rem] bg-[#0B0E14] border border-white/5 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-[-50%] right-[-10%] w-[80%] h-[100%] bg-[var(--color-water-blue)] rounded-full blur-[200px] opacity-[0.05] pointer-events-none" />

            <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 relative">
                <div>
                    <h3 className="font-pretendard text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-[var(--color-wood-neon)]" /> 대운 흐름 (Life Flow)
                    </h3>
                    <p className="font-outfit text-xs text-gray-400 mt-1 uppercase tracking-widest">
                        10-Year Destiny Curve
                    </p>
                </div>
                <div className="bg-white/5 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 self-start sm:self-auto shrink-0 shadow-inner">
                    <span className="text-gray-400 text-xs font-pretendard">대운수</span>
                    <span className="text-white font-bold font-outfit">{daewunNumber}</span>
                </div>
            </header>

            {/* SVG Gradient Line Chart */}
            <div className="relative w-full h-32 mb-4 overflow-x-hidden overflow-y-visible border-b border-white/10 hidden md:block">
                <svg width="100%" height="100%" preserveAspectRatio="none" viewBox={`0 0 ${pillars.length * 200} 200`}>
                    <defs>
                        <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="var(--color-water-blue)" />
                            <stop offset="50%" stopColor="var(--color-wood-neon)" />
                            <stop offset="100%" stopColor="var(--color-fire-red)" />
                        </linearGradient>
                        <filter id="glowChart" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="5" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <path
                        d={generatePath()}
                        fill="none"
                        stroke="url(#curveGradient)"
                        strokeWidth="4"
                        filter="url(#glowChart)"
                        strokeLinecap="round"
                    />
                </svg>
            </div>

            {/* Pillar Cards List */}
            <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-1 snap-x snap-mandatory hide-scrollbar z-10 relative">
                {pillars.map((pillar, idx) => (
                    <div
                        key={`dw_${idx}`}
                        className="min-w-[120px] max-w-[120px] sm:min-w-[140px] sm:max-w-[140px] flex flex-col items-center bg-white/5 rounded-[1.5rem] border border-white/10 p-5 shrink-0 snap-center hover:bg-white/10 transition-colors group relative overflow-hidden backdrop-blur-md cursor-pointer"
                    >
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-water-blue)]/0 to-[var(--color-water-blue)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Age & Year */}
                        <div className="flex flex-col items-center mb-3 text-center">
                            <span className="text-white font-pretendard font-bold text-lg">{pillar.age}세</span>
                            <span className="text-gray-500 font-outfit text-xs">{pillar.year}년~</span>
                        </div>

                        <div className="w-full h-px bg-white/5 mb-4" />

                        {/* Heavenly Stem */}
                        <div className="flex flex-col items-center gap-1 mb-3">
                            <span className="text-gray-400 font-pretendard text-[10px] sm:text-xs">
                                {pillar.heavenly.ten_god}
                            </span>
                            <span className={cn(
                                "font-serif text-3xl font-bold drop-shadow-md",
                                elementConfig[pillar.heavenly.element]?.text || "text-white"
                            )}>
                                {pillar.heavenly.label.split('(')[0]}
                            </span>
                            <span className="font-pretendard text-xs text-gray-500">
                                {pillar.heavenly.label.match(/\((.*?)\)/)?.[1] || ''}
                            </span>
                        </div>

                        {/* Earthly Branch */}
                        <div className="flex flex-col items-center gap-1 mt-1 border-t border-white/5 pt-2 w-full">
                            <span className={cn(
                                "font-serif text-3xl font-bold drop-shadow-md",
                                elementConfig[pillar.earthly.element]?.text || "text-white"
                            )}>
                                {pillar.earthly.label.split('(')[0]}
                            </span>
                            <span className="font-pretendard text-xs text-gray-500">
                                {pillar.earthly.label.match(/\((.*?)\)/)?.[1] || ''}
                            </span>
                            <span className="text-gray-400 font-pretendard text-[10px] sm:text-xs mt-1">
                                {pillar.earthly.ten_god}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
