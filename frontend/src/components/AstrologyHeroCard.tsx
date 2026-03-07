import React from 'react';
import { AstrologyData } from '@/utils/astrology';

interface AstrologyHeroCardProps {
    data: AstrologyData;
}

export default function AstrologyHeroCard({ data }: AstrologyHeroCardProps) {
    return (
        <div className={`w-full rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative ${data.bgStyle} mb-6`}>
            {/* Ambient Glow Effects */}
            <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-white/20 blur-3xl rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-30px] left-[-30px] w-32 h-32 bg-black/20 blur-2xl rounded-full pointer-events-none"></div>

            <div className="p-8 relative z-10 flex flex-col items-center text-center">
                {/* Badge */}
                <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[11px] font-bold px-3 py-1 rounded-full mb-5 shadow-sm uppercase tracking-widest">
                    {data.subtitle}
                </span>

                {/* Emoji Icon */}
                <div
                    className="w-24 h-24 rounded-full flex items-center justify-center text-[52px] mb-4 shadow-xl border-4 border-white/20 backdrop-blur-sm transition-transform hover:scale-105"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                >
                    {data.emoji}
                </div>

                {/* Title & Description */}
                <h2 className="text-[28px] font-black text-white mb-3 tracking-tight drop-shadow-md">
                    {data.title}
                </h2>

                <p className="text-[15px] font-medium text-white/90 leading-relaxed break-keep max-w-[90%]">
                    {data.description}
                </p>

                {/* Decorative Bottom Line */}
                <div className="w-12 h-1 bg-white/40 rounded-full mt-6 mb-2"></div>
            </div>
        </div>
    );
}
