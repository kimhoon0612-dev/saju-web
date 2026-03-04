"use client";

import React, { useEffect, useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface PillarPart { element: string; }
interface Pillar { heavenly: PillarPart; earthly: PillarPart; }
interface MatrixData {
    time_pillar: Pillar; day_pillar: Pillar; month_pillar: Pillar; year_pillar: Pillar;
}
interface Props { matrix?: MatrixData | null; }

export default function ElementalRadarChart({ matrix }: Props) {
    const [animatedScores, setAnimatedScores] = useState({ wood: 0, fire: 0, earth: 0, metal: 0, water: 0 });

    // Base scores
    let woodScore = 0, fireScore = 0, earthScore = 0, metalScore = 0, waterScore = 0;

    if (matrix) {
        let totalElements = 0;
        const pillars = [matrix.year_pillar, matrix.month_pillar, matrix.day_pillar, matrix.time_pillar];

        // Tally occurrences
        pillars.forEach(p => {
            if (!p) return;
            [p.heavenly?.element, p.earthly?.element].forEach(el => {
                if (!el) return;
                totalElements++;
                if (el === 'wood') woodScore++;
                if (el === 'fire') fireScore++;
                if (el === 'earth') earthScore++;
                if (el === 'metal') metalScore++;
                if (el === 'water') waterScore++;
            });
        });

        // Convert to percentage
        if (totalElements > 0) {
            woodScore = Math.round((woodScore / totalElements) * 100);
            fireScore = Math.round((fireScore / totalElements) * 100);
            earthScore = Math.round((earthScore / totalElements) * 100);
            metalScore = Math.round((metalScore / totalElements) * 100);
            waterScore = Math.round((waterScore / totalElements) * 100);
        }
    } else {
        // Fallback mock scores
        woodScore = 85; fireScore = 65; earthScore = 45; metalScore = 90; waterScore = 75;
    }

    // Animate the fill up to the target score
    useEffect(() => {
        const timeout = setTimeout(() => {
            setAnimatedScores({
                wood: Math.min(woodScore, 100),
                fire: Math.min(fireScore, 100),
                earth: Math.min(earthScore, 100),
                metal: Math.min(metalScore, 100),
                water: Math.min(waterScore, 100)
            });
        }, 300);
        return () => clearTimeout(timeout);
    }, [matrix]);

    const elements = [
        { id: 'wood', label: '木 (목)', score: animatedScores.wood, color: '#69FF97' }, // Neon Green
        { id: 'fire', label: '火 (화)', score: animatedScores.fire, color: '#FF6B6B' }, // Neon Red
        { id: 'earth', label: '土 (토)', score: animatedScores.earth, color: '#FFD166' }, // Amber
        { id: 'metal', label: '金 (금)', score: animatedScores.metal, color: '#F5F6FA' }, // Silver
        { id: 'water', label: '水 (수)', score: animatedScores.water, color: '#48CAE4' }  // Cyan
    ];

    return (
        <div className="w-full h-full relative flex flex-col font-pretendard">
            <header className="mb-4 z-10 flex flex-col">
                <h3 className="text-xl font-bold text-white tracking-widest">Aura Balance</h3>
                <p className="font-outfit text-[11px] text-gray-400 mt-0.5 uppercase tracking-widest">Liquid Glassmorphism Data</p>
            </header>

            {/* Custom SVG Liquid Bubbles representing Element percentages */}
            <div className="flex-1 w-full relative z-10 flex items-center justify-around gap-2 px-2 pb-4">
                {elements.map((el) => (
                    <div key={el.id} className="flex flex-col items-center justify-end h-[180px] w-12 sm:w-16 group relative">
                        {/* Liquid Container */}
                        <div className="w-full h-full bg-white/5 border border-white/10 rounded-full overflow-hidden relative shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md">
                            {/* The "Liquid" fill */}
                            <div
                                className="absolute bottom-0 w-full transition-all duration-[1500ms] ease-out flex items-center justify-center overflow-hidden"
                                style={{
                                    height: `${el.score}%`,
                                    backgroundColor: el.color,
                                    boxShadow: `0 0 20px ${el.color}`,
                                    opacity: 0.8
                                }}
                            >
                                {/* Simulating liquid surface wave with an SVG or just rounded top */}
                                <div className="absolute top-[-5vw] left-[-5vw] w-[20vw] h-[20vw] bg-white/20 rounded-full mix-blend-overlay animate-[spin_5s_linear_infinite] opacity-50" />
                            </div>
                        </div>

                        {/* Floating Percentage */}
                        <div className="absolute -top-6 font-outfit text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity -translate-y-2 group-hover:translate-y-0" style={{ color: el.color }}>
                            {el.score}%
                        </div>

                        {/* Label */}
                        <span className="mt-3 text-xs font-bold text-gray-300">{el.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
