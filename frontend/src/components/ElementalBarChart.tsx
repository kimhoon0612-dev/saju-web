"use client";

import React, { useEffect, useState } from 'react';

interface PillarPart { element: string; }
interface Pillar { heavenly: PillarPart; earthly: PillarPart; }
interface MatrixData {
    time_pillar: Pillar; day_pillar: Pillar; month_pillar: Pillar; year_pillar: Pillar;
}
interface Props { matrix?: MatrixData | null; }

export default function ElementalBarChart({ matrix }: Props) {
    const [animatedScores, setAnimatedScores] = useState({ wood: 0, fire: 0, earth: 0, metal: 0, water: 0 });

    // Base counts
    let woodCount = 0, fireCount = 0, earthCount = 0, metalCount = 0, waterCount = 0;
    let totalElements = 0;

    if (matrix) {
        const pillars = [matrix.year_pillar, matrix.month_pillar, matrix.day_pillar, matrix.time_pillar];

        // Tally occurrences
        pillars.forEach(p => {
            if (!p) return;
            [p.heavenly?.element, p.earthly?.element].forEach(el => {
                if (!el) return;
                totalElements++;
                if (el === 'wood') woodCount++;
                if (el === 'fire') fireCount++;
                if (el === 'earth') earthCount++;
                if (el === 'metal') metalCount++;
                if (el === 'water') waterCount++;
            });
        });
    } else {
        // Fallback mock counts (total 8)
        woodCount = 2; fireCount = 3; earthCount = 1; metalCount = 0; waterCount = 2;
        totalElements = 8;
    }

    // Convert to percentage for width calculation
    const getPercent = (count: number) => totalElements > 0 ? (count / totalElements) * 100 : 0;

    // Animate the fill up to the target score
    useEffect(() => {
        const timeout = setTimeout(() => {
            setAnimatedScores({
                wood: getPercent(woodCount),
                fire: getPercent(fireCount),
                earth: getPercent(earthCount),
                metal: getPercent(metalCount),
                water: getPercent(waterCount)
            });
        }, 300);
        return () => clearTimeout(timeout);
    }, [matrix, woodCount, fireCount, earthCount, metalCount, waterCount]);

    const elements = [
        { id: 'wood', label: '목 (木)', count: woodCount, score: animatedScores.wood, color: '#A8D5BA', bg: '#F0F9F4', desc: '성장과 자립' },
        { id: 'fire', label: '화 (火)', count: fireCount, score: animatedScores.fire, color: '#FFB199', bg: '#FFF5F2', desc: '열정과 발산' },
        { id: 'earth', label: '토 (土)', count: earthCount, score: animatedScores.earth, color: '#F3E5AB', bg: '#FCFAEF', desc: '중용과 포용' },
        { id: 'metal', label: '금 (金)', count: metalCount, score: animatedScores.metal, color: '#CBD5E1', bg: '#F8FAFC', desc: '결단과 원칙' },
        { id: 'water', label: '수 (水)', count: waterCount, score: animatedScores.water, color: '#A0C4FF', bg: '#F2F7FF', desc: '지혜와 유연성' }
    ];

    return (
        <div className="w-full flex flex-col font-pretendard gap-4 mt-2 mb-4">
            {elements.map((el) => (
                <div key={el.id} className="flex flex-col gap-1.5 w-full group">
                    <div className="flex justify-between items-end px-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[14px] font-black text-gray-800 tracking-tight">{el.label}</span>
                            <span className="text-[12px] text-gray-400 font-medium">{el.desc}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[14px] font-bold text-gray-900">{el.count}</span>
                            <span className="text-[12px] font-medium text-gray-400">개</span>
                        </div>
                    </div>
                    {/* Progress Bar Container */}
                    <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: el.bg }}>
                        <div
                            className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                            style={{ width: `${Math.max(el.score, 3)}%`, backgroundColor: el.color }}
                        >
                            {/* Shimmer Effect */}
                            <div className="absolute top-0 left-0 w-full h-full bg-white/20 -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
