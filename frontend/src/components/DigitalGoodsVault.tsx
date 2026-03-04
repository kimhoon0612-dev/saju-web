"use client";

import React, { useState } from 'react';
import { Download, Sparkles, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from './DestinyMatrixCard';

interface Props {
    sajuParams: any;
}

export default function DigitalGoodsVault({ sajuParams }: Props) {
    const [goodsData, setGoodsData] = useState<{ image_url: string; theme: string; description: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/goods/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ saju_params: sajuParams })
            });

            if (!response.ok) throw new Error('Failed to generate goods');

            const data = await response.json();
            setGoodsData(data);
        } catch (err) {
            setError('디지털 굿즈 생성 중 오류가 발생했습니다.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!goodsData?.image_url) return;
        try {
            const response = await fetch(goodsData.image_url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fatename_wallpaper_${new Date().getTime()}.jpg`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading image', error);
            // Fallback for CORS restricted URLs (like direct Unsplash sometimes)
            window.open(goodsData.image_url, '_blank');
        }
    };

    return (
        <div className="w-full bg-black/40 border border-white/10 rounded-[2rem] p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-fire-orange)] rounded-full blur-[150px] opacity-[0.05] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--color-water-blue)] rounded-full blur-[150px] opacity-[0.05] pointer-events-none" />

            <div className="flex-1 flex flex-col z-10 w-full">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5 text-[var(--color-wood-neon)]" />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-white tracking-widest">디지털 굿즈 & 월페이퍼</h3>
                </div>

                <p className="font-pretendard text-sm sm:text-base text-gray-300 mb-6 leading-relaxed block max-w-md">
                    당신의 사주 원국에서 도출된 핵심 수호 에너지를 시각화합니다.
                    스마트폰 배경화면이나 프로필로 설정하여 긍정적인 파동을 일상에 더하세요.
                </p>

                {!goodsData ? (
                    <div className="flex flex-col gap-3 items-start">
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className={cn(
                                "group bg-white text-black font-pretendard font-bold text-sm py-3 px-6 rounded-full transition-all duration-300 flex items-center gap-2",
                                isLoading ? "bg-gray-400 cursor-not-allowed" : "hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                            )}
                        >
                            <ImageIcon className="w-4 h-4" />
                            {isLoading ? "기운을 형상화하는 중..." : "나만의 수호 배경화면 생성"}
                        </button>
                        {error && (
                            <div className="flex items-center gap-2 text-[var(--color-fire-orange)] text-xs font-pretendard mt-2">
                                <AlertCircle className="w-3.5 h-3.5" /> {error}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 animate-fade-in">
                        <div className="bg-white/5 border border-white/10 p-4 rounded-xl border-l-4 border-l-[var(--color-wood-neon)]">
                            <h4 className="font-serif text-lg text-[var(--color-earth-amber)] mb-2">{goodsData.theme}</h4>
                            <p className="text-sm text-gray-400 font-pretendard leading-relaxed">{goodsData.description}</p>
                        </div>

                        <button
                            onClick={handleDownload}
                            className="bg-white/10 hover:bg-white/20 text-white font-pretendard text-sm py-3 px-6 rounded-full transition-all border border-white/20 flex items-center gap-2 w-fit"
                        >
                            <Download className="w-4 h-4" /> 고해상도 다운로드
                        </button>
                    </div>
                )}
            </div>

            {/* Image Preview Area */}
            <div className="w-full md:w-[320px] aspect-[9/16] rounded-2xl bg-black/50 border border-white/10 overflow-hidden relative flex items-center justify-center shrink-0 shadow-2xl z-10">
                {isLoading ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-4 border-[var(--color-wood-green)] border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs text-gray-500 font-pretendard animate-pulse tracking-widest">GENERATING...</span>
                    </div>
                ) : goodsData?.image_url ? (
                    <img
                        src={goodsData.image_url}
                        alt="Digital Goods Preview"
                        className="w-full h-full object-cover animate-fade-in"
                        crossOrigin="anonymous"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-3 opacity-30">
                        <ImageIcon className="w-12 h-12 text-gray-500" />
                        <span className="text-xs font-outfit text-gray-500 tracking-widest">PREVIEW</span>
                    </div>
                )}
            </div>
        </div>
    );
}
