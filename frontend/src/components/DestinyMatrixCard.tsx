import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import EnergyGauge from './EnergyGauge';
import SpecialSkillWidget from './SpecialSkillWidget';
import html2canvas from 'html2canvas';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type ElementType = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

interface BaziChar {
    id: string;
    element: ElementType;
    label: string;
    ten_god?: string;
}

interface HiddenStem {
    label: string;
    ten_god: string;
}

interface Pillar {
    titleKo: string;
    titleEn: string;
    heavenly: BaziChar;
    earthly: BaziChar;
    hidden_stems?: HiddenStem[];
    twelve_state?: string;
    symbolic_stars?: string[];
}

interface MatrixData {
    time_pillar: Pillar;
    day_pillar: Pillar;
    month_pillar: Pillar;
    year_pillar: Pillar;
}

const elementConfig: Record<ElementType, { bg: string, text: string, border: string }> = {
    wood: { bg: 'bg-[#27ae60]', text: 'text-white', border: 'border-[#1e8449]' },
    fire: { bg: 'bg-[#c0392b]', text: 'text-white', border: 'border-[#922b21]' },
    earth: { bg: 'bg-[#f39c12]', text: 'text-white', border: 'border-[#d68910]' },
    metal: { bg: 'bg-[#ecf0f1]', text: 'text-[#2c3e50]', border: 'border-[#bdc3c7]' },
    water: { bg: 'bg-[#2c3e50]', text: 'text-white', border: 'border-[#1a252f]' },
};

// 12지신 아이콘 매핑 (Emoji Vector styled)
const ZODIAC_EMOJI: Record<string, string> = {
    '子': '🐭', '丑': '🐮', '寅': '🐯', '卯': '🐰',
    '辰': '🐲', '巳': '🐍', '午': '🐴', '未': '🐏',
    '申': '🐵', '酉': '🐔', '戌': '🐶', '亥': '🐷'
};

interface Props {
    matrix?: MatrixData | null;
    timeInfo?: {
        true_solar_time: string;
        original_time: string;
        longitude_offset_min: number;
        eot_min: number;
        total_correction_min: number;
    } | null;
}

export default function DestinyMatrixCard({ matrix, timeInfo }: Props) {
    const cardRef = React.useRef<HTMLDivElement>(null);
    const [selectedChar, setSelectedChar] = React.useState<{ char: string, type: 'heavenly' | 'earthly', element: ElementType, ten_god: string, title: string, details?: string } | null>(null);

    const handleDownload = async () => {
        if (!cardRef.current) return;
        try {
            const canvas = await html2canvas(cardRef.current, {
                scale: 2,
                backgroundColor: '#0f1115', // Deep navy background 
                useCORS: true,
                windowWidth: 1080, // Force 9:16 mobile ratio for stories
                windowHeight: 1920,
            });
            const image = canvas.toDataURL("image/png", 1.0);
            const link = document.createElement("a");
            link.href = image;
            link.download = `syncmate_fortune_${new Date().getTime()}.png`;
            link.click();
        } catch (err) {
            console.error("Failed to make card news:", err);
        }
    };

    const pillars: Pillar[] = matrix ? [
        matrix.time_pillar,
        matrix.day_pillar,
        matrix.month_pillar,
        matrix.year_pillar,
    ] : [
        { titleKo: '시 주', titleEn: 'Time Pillar', heavenly: { id: 'h1', element: 'water', label: '癸(계)', ten_god: '편인' }, earthly: { id: 'e1', element: 'earth', label: '未(미)', ten_god: '편재' }, hidden_stems: [{ label: '丁', ten_god: '편재' }, { label: '乙', ten_god: '식신' }, { label: '己', ten_god: '편관' }], twelve_state: '묘', symbolic_stars: ['화개살', '반안살', '천덕귀인'] },
        { titleKo: '일 주', titleEn: 'Day Pillar', heavenly: { id: 'h2', element: 'wood', label: '乙(을)', ten_god: '본원' }, earthly: { id: 'e2', element: 'water', label: '亥(해)', ten_god: '정인' }, hidden_stems: [{ label: '戊', ten_god: '정재' }, { label: '甲', ten_god: '겁재' }, { label: '壬', ten_god: '정인' }], twelve_state: '사', symbolic_stars: ['지살', '겁살'] },
        { titleKo: '월 주', titleEn: 'Month Pillar', heavenly: { id: 'h3', element: 'wood', label: '甲(갑)', ten_god: '겁재' }, earthly: { id: 'e3', element: 'metal', label: '申(신)', ten_god: '정관' }, hidden_stems: [{ label: '戊', ten_god: '정재' }, { label: '壬', ten_god: '정인' }, { label: '庚', ten_god: '정관' }], twelve_state: '태', symbolic_stars: ['겁살', '역마살', '홍염살'] },
        { titleKo: '년 주', titleEn: 'Year Pillar', heavenly: { id: 'h4', element: 'wood', label: '乙(을)', ten_god: '비견' }, earthly: { id: 'e4', element: 'water', label: '亥(해)', ten_god: '정인' }, hidden_stems: [{ label: '戊', ten_god: '정재' }, { label: '甲', ten_god: '겁재' }, { label: '壬', ten_god: '정인' }], twelve_state: '사', symbolic_stars: ['지살', '겁살'] },
    ];

    const emptyBranches = pillars.map(p => p.symbolic_stars?.includes('공망') ? p.earthly.label.charAt(0) : null).filter(Boolean) as string[];
    const heavenlyNobles = pillars.map(p => p.symbolic_stars?.includes('천을귀인') ? p.earthly.label.charAt(0) : null).filter(Boolean) as string[];

    // 수집된 모든 신살 추출 (중복 제거)
    const allSkills = Array.from(new Set(
        pillars.flatMap(p => p.symbolic_stars || []).filter(s => s !== '공망' && s !== '천을귀인')
    ));

    return (
        <div ref={cardRef} className="w-full flex flex-col gap-4 relative bg-transparent">

            {/* 1. 메인 8글자 매트릭스 (Destiny Matrix) */}
            <div className="w-full rounded-[2rem] bg-[#1a1c23]/60 backdrop-blur-xl border border-white/10 p-4 sm:p-6 lg:p-8 shadow-2xl relative flex flex-col">
                <header className="mb-6 flex flex-col items-center justify-center gap-2 relative z-10 border-b border-white/10 pb-4">
                    <h2 className="font-pretendard text-2xl sm:text-3xl font-extrabold text-white tracking-widest text-center">운명의 매트릭스</h2>
                </header>

                <div className="flex-1 flex flex-col xl:flex-row items-center justify-start relative z-10 w-full max-w-6xl mx-auto gap-8">
                    <div className="flex w-full justify-between items-stretch gap-2 sm:gap-4 md:gap-6 lg:gap-8 flex-1">
                        {pillars.map((pillar, idx) => {
                            const hConfig = elementConfig[pillar.heavenly.element];
                            const eConfig = elementConfig[pillar.earthly.element];
                            const eChar = pillar.earthly.label.charAt(0);
                            const zodiac = ZODIAC_EMOJI[eChar] || '';

                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center justify-start w-full min-w-[70px]">
                                    {/* 필러 상단 명칭 */}
                                    <div className="text-xs sm:text-sm text-gray-400 font-pretendard mb-2 whitespace-nowrap font-medium tracking-widest text-center w-full bg-white/5 py-1 rounded-md">
                                        {pillar.titleKo}
                                    </div>

                                    {/* 천간 십성 */}
                                    <div className="w-full text-center text-sm md:text-base text-[#ecf0f1] font-pretendard font-semibold mb-2 mt-2 tracking-wide">
                                        {pillar.heavenly.ten_god}
                                    </div>

                                    {/* 천간 한자 */}
                                    <div
                                        onClick={() => setSelectedChar({ char: pillar.heavenly.label.split('(')[0], type: 'heavenly', element: pillar.heavenly.element as ElementType, ten_god: pillar.heavenly.ten_god || '', title: `${pillar.titleKo} 천간` })}
                                        className={cn("w-full aspect-square flex items-center justify-center mb-1 shadow-lg rounded-xl border-b-4 border-r-2 cursor-pointer transition-transform hover:scale-105 active:scale-95 group relative", hConfig.bg, hConfig.text, hConfig.border)}
                                    >
                                        <span className="text-5xl sm:text-6xl md:text-[5rem] lg:text-[5.5rem] font-bold font-serif leading-none tracking-tighter drop-shadow-md">
                                            {pillar.heavenly.label.split('(')[0]}
                                        </span>
                                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-xl transition-colors" />
                                    </div>

                                    {/* 지지 한자 & 12지신 */}
                                    <div
                                        onClick={() => setSelectedChar({ char: pillar.earthly.label.split('(')[0], type: 'earthly', element: pillar.earthly.element as ElementType, ten_god: pillar.earthly.ten_god || '', title: `${pillar.titleKo} 지지`, details: `지장간: ${pillar.hidden_stems?.map(hs => hs.label).join(', ')}` })}
                                        className={cn("relative w-full aspect-square flex items-center justify-center shadow-lg rounded-xl border-t-2 border-l-2 cursor-pointer transition-transform hover:scale-105 active:scale-95 group", eConfig.bg, eConfig.text, eConfig.border)}
                                    >
                                        <span className="text-5xl sm:text-6xl md:text-[5rem] lg:text-[5.5rem] font-bold font-serif leading-none tracking-tighter drop-shadow-md z-10 relative">
                                            {pillar.earthly.label.split('(')[0]}
                                        </span>
                                        {/* 벡터 12지신 캐릭터 (배경 워터마크 형) */}
                                        <span className="absolute bottom-1 right-1 text-2xl sm:text-3xl lg:text-4xl opacity-50 grayscale mix-blend-overlay z-0">
                                            {zodiac}
                                        </span>
                                    </div>

                                    {/* 지지 십성 */}
                                    <div className="w-full text-center text-sm md:text-base text-[#ecf0f1] font-pretendard font-semibold mt-3 mb-2 tracking-wide">
                                        {pillar.earthly.ten_god}
                                    </div>

                                    <div className="w-[80%] h-[1px] bg-white/20 my-2" />

                                    {/* 지장간 (한자 + 십성) */}
                                    <div className="w-full flex justify-around px-1 mt-1 min-h-[50px]">
                                        {pillar.hidden_stems?.map((hs, i) => (
                                            <div key={i} className="flex flex-col items-center justify-end gap-1">
                                                <span className="text-gray-400 text-[10px] sm:text-[11px] font-pretendard">{hs.ten_god}</span>
                                                <span className="text-white text-sm sm:text-base font-bold font-serif">{hs.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="w-[80%] h-[1px] bg-white/20 my-3" />

                                    {/* 12운성 에너지 게이지 */}
                                    <div className="w-[90%] mt-1 mb-4">
                                        <EnergyGauge stateStr={pillar.twelve_state || '-'} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 2. 스페셜 스킬 위젯 (신살, 형충회합, 공망, 천을귀인) */}
            <SpecialSkillWidget
                skills={allSkills}
                emptyBranches={emptyBranches}
                heavenlyNobles={heavenlyNobles}
            />

            {/* RPG Style Stat Modal */}
            {selectedChar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedChar(null)} />
                    <div className="bg-[#0B0E14] border border-white/20 rounded-[2rem] p-6 sm:p-8 max-w-sm w-full relative z-10 shadow-[0_0_50px_rgba(0,180,216,0.2)] animate-in zoom-in-95 duration-200">
                        <button onClick={() => setSelectedChar(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                            ✕
                        </button>

                        <div className="flex flex-col items-center gap-4 text-center">
                            <span className="font-outfit text-[11px] text-gray-400 tracking-widest uppercase">{selectedChar.title}</span>

                            <div className={cn("w-24 h-24 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)]", elementConfig[selectedChar.element].bg, elementConfig[selectedChar.element].text)}>
                                <span className="text-6xl font-serif font-bold">{selectedChar.char}</span>
                            </div>

                            <div className="w-full">
                                <h3 className="text-xl font-bold text-white mb-2">{selectedChar.ten_god} <span className="text-sm font-normal text-gray-400">({selectedChar.element.toUpperCase()})</span></h3>

                                <div className="bg-white/5 rounded-xl p-4 border border-white/5 text-left mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-gray-400 font-bold">에너지 레벨</span>
                                        <span className="text-xs text-[var(--color-wood-neon)] font-bold">Lv.85</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-[var(--color-water-blue)] to-[var(--color-wood-neon)] w-[85%]" />
                                    </div>
                                </div>

                                {selectedChar.details && (
                                    <div className="text-xs text-gray-300 bg-white/5 px-3 py-2 rounded-lg inline-block border border-white/10">
                                        {selectedChar.details}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
