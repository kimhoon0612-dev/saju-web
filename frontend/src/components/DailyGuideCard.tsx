import React from 'react';
import { Sun, CalendarHeart, AlertTriangle, Sparkles } from 'lucide-react';
import { cn } from './DestinyMatrixCard';
import { ElementType } from './DaewunTimeline';

export interface DailyFortuneData {
    date: string;
    heavenly: { label: string; element: ElementType; ten_god: string };
    earthly: { label: string; element: ElementType; ten_god: string };
    clash_with: string[];
    harmony_with: string[];
    daily_message: string;
}

interface DailyGuideCardProps {
    fortune: DailyFortuneData | null;
}

const elementColors: Record<ElementType, string> = {
    wood: 'text-[var(--color-wood-green)]',
    fire: 'text-[var(--color-fire-orange)]',
    earth: 'text-[var(--color-earth-amber)]',
    metal: 'text-[var(--color-metal-silver)]',
    water: 'text-[var(--color-water-blue)]',
};

export default function DailyGuideCard({ fortune }: DailyGuideCardProps) {
    if (!fortune) return null;

    const hasClash = fortune.clash_with.length > 0;
    const hasHarmony = fortune.harmony_with.length > 0;

    return (
        <div className="w-full h-full rounded-[2rem] bg-black/40 border border-white/10 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden flex flex-col">
            {/* Dynamic Background Glow based on the heavenly stem's element */}
            <div className={cn(
                "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[100px] opacity-20 pointer-events-none transition-colors duration-1000",
                fortune.heavenly.element === 'wood' && "bg-[var(--color-wood-green)]",
                fortune.heavenly.element === 'fire' && "bg-[var(--color-fire-orange)]",
                fortune.heavenly.element === 'earth' && "bg-[var(--color-earth-amber)]",
                fortune.heavenly.element === 'metal' && "bg-[var(--color-metal-silver)]",
                fortune.heavenly.element === 'water' && "bg-[var(--color-water-blue)]"
            )} />

            <header className="mb-4 z-10 relative flex justify-between items-start">
                <div>
                    <h3 className="font-pretendard text-lg font-bold text-white flex items-center gap-2">
                        <Sun className="w-4 h-4 text-[var(--color-fire-orange)]" /> 오늘의 기운 (일진)
                    </h3>
                    <p className="font-outfit text-[10px] text-gray-400 mt-1 uppercase tracking-widest leading-tight">
                        Daily Energy Guide &bull; {fortune.date}
                    </p>
                </div>

                {/* Today's Pillars Display */}
                <div className="flex gap-2 bg-black/60 rounded-xl p-2 border border-white/5">
                    <div className="flex flex-col items-center justify-center px-1">
                        <span className="text-[10px] text-gray-500 font-pretendard">{fortune.heavenly.ten_god}</span>
                        <span className={cn("font-serif text-lg font-bold", elementColors[fortune.heavenly.element])}>
                            {fortune.heavenly.label.split('(')[0]}
                        </span>
                    </div>
                    <div className="flex flex-col items-center justify-center px-1 border-l border-white/10 pl-3">
                        <span className="text-[10px] text-gray-500 font-pretendard">{fortune.earthly.ten_god}</span>
                        <span className={cn("font-serif text-lg font-bold", elementColors[fortune.earthly.element])}>
                            {fortune.earthly.label.split('(')[0]}
                        </span>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex flex-col justify-center gap-4 z-10 relative">

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                    {hasClash && (
                        <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-full text-xs font-pretendard">
                            <AlertTriangle className="w-3 h-3" />
                            {fortune.clash_with.join(', ')} 충(沖) 주의
                        </div>
                    )}
                    {hasHarmony && (
                        <div className="flex items-center gap-1.5 bg-[var(--color-water-blue)]/10 border border-[var(--color-water-blue)]/20 text-[var(--color-water-blue)] px-3 py-1.5 rounded-full text-xs font-pretendard">
                            <CalendarHeart className="w-3 h-3" />
                            {fortune.harmony_with.join(', ')} 합(合) 발생
                        </div>
                    )}
                    {!hasClash && !hasHarmony && (
                        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-gray-300 px-3 py-1.5 rounded-full text-xs font-pretendard">
                            <Sparkles className="w-3 h-3 text-[var(--color-metal-silver)]" />
                            무난하고 평온한 하루
                        </div>
                    )}
                </div>

                {/* Main Message */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <p className="font-pretendard text-sm text-gray-200 leading-relaxed break-keep">
                        {fortune.daily_message}
                    </p>
                </div>
            </div>

        </div>
    );
}
