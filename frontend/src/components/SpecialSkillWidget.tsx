import React from 'react';
import { cn } from './DestinyMatrixCard';

interface Props {
    skills: string[];
    emptyBranches: string[];
    heavenlyNobles: string[];
}

export default function SpecialSkillWidget({ skills, emptyBranches, heavenlyNobles }: Props) {
    if (!skills || skills.length === 0) return null;

    // 카테고리화 헬퍼
    const isBad = (s: string) => s.includes('살') || s.includes('원진') || s.includes('충') || s.includes('형');
    const isGood = (s: string) => s.includes('귀인') || s.includes('장성') || s.includes('반안');
    const isNeutral = (s: string) => !isBad(s) && !isGood(s) && !s.includes('공망');

    return (
        <div className="w-full rounded-[2rem] bg-[#1a1c23]/80 backdrop-blur-md border border-white/10 p-5 sm:p-6 lg:p-8 shadow-xl mt-4">
            <h3 className="text-sm md:text-base font-outfit uppercase tracking-widest text-[#f39c12] mb-4 font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#f39c12] animate-pulse" />
                Special Traits
            </h3>

            {/* 고유 스킬(신살/형충회합) 배지 리스트 */}
            <div className="flex flex-wrap gap-2 md:gap-3">
                {skills.map((skill, idx) => {
                    const bad = isBad(skill);
                    const good = isGood(skill);

                    return (
                        <div
                            key={idx}
                            className={cn(
                                "px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-pretendard tracking-wide border shadow-sm transition-transform hover:scale-105",
                                bad ? "bg-red-500/10 border-red-500/30 text-red-400" :
                                    good ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                                        "bg-gray-500/10 border-gray-500/30 text-gray-300"
                            )}
                        >
                            {skill}
                        </div>
                    );
                })}
            </div>

            {/* 공망 / 천을귀인 요약 패널 */}
            {(emptyBranches.length > 0 || heavenlyNobles.length > 0) && (
                <div className="mt-6 flex flex-col sm:flex-row gap-4 border-t border-white/5 pt-4">
                    {emptyBranches.length > 0 && (
                        <div className="flex-1 bg-black/40 rounded-xl p-3 border border-white/5">
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">Void (공망)</span>
                            <div className="text-xl font-serif text-[#e74c3c] mt-1">{emptyBranches.join(', ')}</div>
                        </div>
                    )}
                    {heavenlyNobles.length > 0 && (
                        <div className="flex-1 bg-black/40 rounded-xl p-3 border border-white/5">
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest">Noble (천을귀인)</span>
                            <div className="text-xl font-serif text-[#2ecc71] mt-1">{heavenlyNobles.join(', ')}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
