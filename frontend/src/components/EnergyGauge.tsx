import React from 'react';
import { cn } from './DestinyMatrixCard';

interface Props {
    stateStr: string;
}

// 12운성 맵핑 (0~100 에너지 레벨)
const stateToEnergy: Record<string, { level: number; color: string; description: string }> = {
    '장생': { level: 80, color: 'bg-green-400', description: '탄생/성장' },
    '목욕': { level: 60, color: 'bg-teal-400', description: '매력/불안정' },
    '관대': { level: 90, color: 'bg-emerald-500', description: '자립/발전' },
    '건록': { level: 100, color: 'bg-blue-500', description: '완성/성숙' },
    '제왕': { level: 100, color: 'bg-purple-500', description: '절정/권력' },
    '쇠': { level: 70, color: 'bg-yellow-500', description: '노련/후퇴' },
    '병': { level: 40, color: 'bg-orange-400', description: '쇠약/예술성' },
    '사': { level: 20, color: 'bg-red-400', description: '정지/사색' },
    '묘': { level: 10, color: 'bg-gray-400', description: '저장/잠복' },
    '절': { level: 5, color: 'bg-slate-600', description: '단절/새출발' },
    '태': { level: 15, color: 'bg-pink-300', description: '잉태/가능성' },
    '양': { level: 50, color: 'bg-lime-400', description: '보육/평화' },
};

export default function EnergyGauge({ stateStr }: Props) {
    if (!stateStr || stateStr === '-') return <div className="text-gray-500 text-xs">-</div>;

    const energy = stateToEnergy[stateStr] || { level: 0, color: 'bg-gray-500', description: '' };

    return (
        <div className="w-full flex flex-col gap-1 items-center justify-center">
            {/* 상단 텍스트 */}
            <div className="flex w-full justify-between items-end px-1 mb-0.5">
                <span className="text-[10px] sm:text-xs text-white font-pretendard tracking-widest">{stateStr}</span>
                <span className="text-[8px] sm:text-[9px] text-gray-400 font-pretendard">{energy.level}%</span>
            </div>

            {/* 게이지 바 */}
            <div className="w-full h-1.5 sm:h-2 bg-black/40 rounded-full overflow-hidden shadow-inner border border-white/5 relative">
                <div
                    className={cn("h-full rounded-full transition-all duration-700 ease-out", energy.color)}
                    style={{ width: `${energy.level}%` }}
                />

                {/* 글로우 이펙트 */}
                <div
                    className={cn("absolute top-0 left-0 h-full blur-[2px] opacity-50", energy.color)}
                    style={{ width: `${energy.level}%` }}
                />
            </div>

            {/* 하단 설명 */}
            <span className="text-[9px] sm:text-[10px] text-gray-500 font-pretendard mt-0.5">
                {energy.description}
            </span>
        </div>
    );
}
