"use client";

import React, { useState } from 'react';
import { BookOpen, AlertCircle, FileText, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from './DestinyMatrixCard';

interface Props {
    sajuParams: any;
    monthTheme: string;
}

export default function MonthlyReportTemplate({ sajuParams, monthTheme }: Props) {
    const [reportText, setReportText] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateReport = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/reports/monthly', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    saju_params: sajuParams,
                    month_theme: monthTheme
                })
            });

            if (!response.ok) throw new Error('Failed to generate report');

            const data = await response.json();
            setReportText(data.report_markdown);
        } catch (err) {
            setError('리포트 생성 중 오류가 발생했습니다. 나중에 다시 시도해주세요.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full bg-black/40 border border-white/10 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden flex flex-col items-center">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-wood-green)] rounded-full blur-[120px] opacity-[0.05] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--color-fire-orange)] rounded-full blur-[120px] opacity-[0.05] pointer-events-none" />

            {!reportText ? (
                // Initial State
                <div className="w-full max-w-lg text-center flex flex-col items-center py-10 z-10">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                        <BookOpen className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-white mb-2 tracking-widest">월간 투자/건강 리포트</h3>
                    <p className="font-pretendard text-sm text-gray-400 mb-8 leading-relaxed">
                        이번 달의 고유한 기운({monthTheme})과 당신의 사주 명식을 분석하여,<br />
                        고전문헌(적천수 등) 기반의 프리미엄 조언을 생성합니다.
                    </p>
                    <button
                        onClick={handleGenerateReport}
                        disabled={isLoading}
                        className={cn(
                            "group relative overflow-hidden bg-white text-black font-pretendard font-bold text-sm sm:text-base py-3 sm:py-4 px-8 rounded-full transition-all duration-300 w-full sm:w-auto",
                            isLoading ? "bg-gray-400 cursor-not-allowed" : "hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                        )}
                    >
                        {isLoading ? "분석 중..." : "리포트 생성하기 (프리미엄)"}
                    </button>
                    {error && (
                        <div className="mt-4 flex items-center gap-2 text-[var(--color-fire-orange)] text-sm font-pretendard">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}
                </div>
            ) : (
                // Generated Report State
                <div className="w-full relative z-10 animate-fade-in flex flex-col h-[500px]">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10 shrink-0">
                        <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-[var(--color-earth-amber)]" />
                            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-widest">프리미엄 월간 리포트</h3>
                        </div>
                        <button
                            className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors border border-white/5 text-gray-300 hover:text-white"
                            title="리포트 다운로드 (PDF)"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="max-w-none font-pretendard">
                            <ReactMarkdown
                                components={{
                                    h1: ({ node, ...props }) => <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--color-earth-amber)] tracking-widest mb-8 pb-3 border-b border-white/10 text-center drop-shadow-md" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-lg sm:text-xl font-serif font-bold text-white mt-10 mb-5 flex items-center gap-2 before:content-[''] before:block before:w-1.5 before:h-5 before:bg-[var(--color-wood-neon)] before:rounded-full" {...props} />,
                                    h3: ({ node, ...props }) => <h3 className="text-base sm:text-lg font-bold text-[var(--color-fire-orange)] mt-8 mb-3" {...props} />,
                                    p: ({ node, ...props }) => <p className="text-sm sm:text-base text-gray-300 leading-loose mb-5 break-keep" {...props} />,
                                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-[var(--color-water-blue)] bg-[var(--color-water-blue)]/5 p-4 sm:p-5 rounded-r-2xl text-gray-400 font-serif italic mb-8 shadow-inner tracking-wide leading-relaxed" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="flex flex-col gap-3 mb-8 pl-2" {...props} />,
                                    li: ({ node, ...props }) => (
                                        <li className="text-sm sm:text-base text-gray-300 leading-relaxed flex items-start">
                                            <span className="text-[var(--color-wood-green)] mr-3 mt-1 text-lg leading-none">•</span>
                                            <span {...props} className="flex-1" />
                                        </li>
                                    ),
                                    strong: ({ node, ...props }) => <strong className="font-bold text-white bg-white/10 px-1.5 py-0.5 rounded shadow-sm text-[0.95em]" {...props} />,
                                }}
                            >
                                {reportText}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
