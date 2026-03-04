"use client";

import React, { useState } from 'react';
import { Sparkles, BookOpen, ChevronRight, CalendarPlus } from 'lucide-react';
import { cn } from './DestinyMatrixCard';

interface Citation {
    source: string;
    original: string;
    translation: string;
}

interface Props {
    insightText?: string | null;
}

export default function ActionableInsightWidget({ insightText }: Props) {
    const [showCitation, setShowCitation] = useState(false);

    const citation: Citation = {
        source: "적천수(滴天髓) - 통신론",
        original: "甲木參天 脫胎要火 春不容金 秋不容土",
        translation: "갑목은 하늘을 찌를 듯 솟아오르니, 그 껍질을 벗고 빛나기 위해서는 반드시 화(火)가 필요하다."
    };

    const handleCalendarSync = async () => {
        try {
            const dateStr = new Date().toISOString().split('T')[0];
            const message = insightText || "✨ 당신의 운행 좌표를 동기화하여 오늘의 집중 에너지를 확인하세요.";

            const response = await fetch('/api/calendar/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    date: dateStr,
                    message: message,
                    element_type: "general"
                })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fatename_schedule_${dateStr}.ics`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error syncing calendar:', error);
            alert("캘린더 동기화에 실패했습니다.");
        }
    };

    return (
        <div className="w-full h-full relative flex flex-col group">
            <div className="absolute top-0 left-0 w-32 h-32 bg-[var(--color-wood-green)] rounded-full blur-[100px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-1000" />

            <header className="flex items-center gap-3 mb-4 sm:mb-6 relative z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[rgba(46,204,113,0.2)] flex items-center justify-center border border-[var(--color-wood-green)] shrink-0">
                    <CalendarPlus className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-wood-neon)] drop-shadow-[0_0_8px_currentColor]" />
                </div>
                <div className="flex flex-col">
                    <h3 className="font-pretendard text-lg sm:text-xl font-bold text-white tracking-widest">Sync-Scheduler</h3>
                    <p className="font-outfit text-[10px] sm:text-xs text-[var(--color-wood-green)] font-medium uppercase tracking-widest mt-0.5">Best Window Timing</p>
                </div>
            </header>

            <div className="relative z-10 font-pretendard">
                {insightText ? (
                    <p className="text-gray-200 text-sm sm:text-base leading-relaxed mb-4">
                        {insightText}
                    </p>
                ) : (
                    <p className="text-gray-400 text-sm italic leading-relaxed mb-4">
                        ✨ 당신의 운행 좌표를 동기화하여 오늘의 집중 에너지를 확인하세요.
                    </p>
                )}
            </div>

            {/* Action Button & Tooltip Trigger */}
            <div className="mt-4 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10 w-full">
                <button
                    className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
                    onMouseEnter={() => setShowCitation(true)}
                    onMouseLeave={() => setShowCitation(false)}
                    onTouchStart={() => setShowCitation(true)}
                    onTouchEnd={() => setShowCitation(false)}
                >
                    <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="font-pretendard border-b border-dashed border-gray-500 pb-0.5 whitespace-nowrap">고전문헌 근거 살펴보기</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0 ml-auto">
                    <button
                        onClick={handleCalendarSync}
                        className="flex items-center gap-2 bg-[var(--color-wood-green)]/20 hover:bg-[var(--color-wood-green)]/40 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full backdrop-blur-md border border-[var(--color-wood-neon)]/50 hover:border-[var(--color-wood-neon)] transition-all font-outfit text-xs sm:text-sm shadow-[0_0_15px_rgba(46,204,113,0.3)] text-white hover:text-[var(--color-wood-neon)] focus:outline-none w-full justify-center sm:w-auto"
                        title="애플 / 구글 캘린더 연동 (Sync-Scheduler)"
                    >
                        <CalendarPlus className="w-4 h-4" /> Sync-Scheduler 연동
                    </button>
                </div>
            </div>

            {/* Citation Tooltip */}
            <div className={cn(
                "absolute bottom-16 sm:bottom-20 left-0 right-0 bg-[#1A1A1E]/95 border border-[var(--color-wood-green)] rounded-[1.5rem] p-4 sm:p-5 shadow-[0_0_30px_rgba(46,204,113,0.2)] transition-all duration-300 transform font-pretendard z-50 backdrop-blur-sm",
                showCitation ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            )}>
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--color-wood-neon)]" />
                    <span className="text-[10px] sm:text-xs font-bold text-[var(--color-wood-neon)] tracking-widest">{citation.source}</span>
                </div>
                <p className="text-sm sm:text-base font-serif text-white mb-2 sm:mb-3 tracking-widest leading-relaxed">{citation.original}</p>
                <p className="text-[11px] sm:text-xs text-gray-400 leading-relaxed border-t border-white/10 pt-2 sm:pt-3">{citation.translation}</p>
            </div>
        </div>
    );
}
