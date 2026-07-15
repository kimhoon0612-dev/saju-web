"use client";

import React from "react";

export type ElementType = "wood" | "fire" | "earth" | "metal" | "water";

const ELEMENT_PALETTE: Record<string, { bg: string; text: string; dot: string }> = {
  wood:  { bg: "bg-emerald-50", text: "text-emerald-800", dot: "bg-emerald-400" },
  fire:  { bg: "bg-rose-50",   text: "text-rose-800",    dot: "bg-rose-400"    },
  earth: { bg: "bg-amber-50",  text: "text-amber-800",   dot: "bg-amber-400"   },
  metal: { bg: "bg-slate-100", text: "text-slate-800",   dot: "bg-slate-400"   },
  water: { bg: "bg-sky-50",    text: "text-sky-800",     dot: "bg-sky-400"     },
};

const ELEMENT_KOR: Record<string, string> = {
  wood: "목", fire: "화", earth: "토", metal: "금", water: "수"
};

const TEN_GOD_ICON: Record<string, string> = {
  "편관": "⚔️", "정관": "🏛️", "편재": "💰", "정재": "💵",
  "편인": "📚", "정인": "🎓", "비견": "🤝", "겁재": "⚡",
  "식신": "🍀", "상관": "🎨", "일간": "⭐"
};

export interface DaewunPillar {
  age: number;
  year: number;
  heavenly: { label: string; element: string; ten_god: string };
  earthly:  { label: string; element: string; ten_god: string };
  description?: string;
  wealth_luck?: string;
  love_luck?:   string;
  career_luck?: string;
}

interface Props {
  daewunPillars: DaewunPillar[];
  daewunNumber: number;
}

const DaewunTimeline: React.FC<Props> = ({ daewunPillars, daewunNumber }) => {
  const currentYear = new Date().getFullYear();
  const [selected, setSelected] = React.useState<DaewunPillar | null>(null);

  const currentIndex = daewunPillars.findIndex(dw => currentYear >= dw.year && currentYear < dw.year + 10);
  const activeDw = currentIndex >= 0 ? daewunPillars[currentIndex] : null;

  const getHanja = (label?: string) => label ? label.split("(")[0] : "?";
  const getHangul = (label?: string) => label?.includes("(") ? label.split("(")[1].replace(")", "") : "?";

  if (!daewunPillars || daewunPillars.length === 0) return null;

  return (
    <div className="bg-white rounded-[32px] p-7 pt-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5">
      {/* Header */}
      <div className="text-[13px] text-gray-400 font-bold mb-1 tracking-wider uppercase">인생의 큰 흐름</div>
      <h2 className="text-[26px] font-black tracking-tight text-gray-900 mb-2">대운 10년 타임라인</h2>
      <p className="text-[13px] text-gray-500 font-medium mb-4 break-keep leading-relaxed">
        <span className="font-bold text-gray-800">{daewunNumber}세</span>부터 대운이 시작됩니다.
        {activeDw && (
          <> 현재는 <span className="font-bold text-gray-900">{activeDw.year}~{activeDw.year + 9}년</span>{" "}
          (<span className="font-bold text-gray-900">{activeDw.age}~{activeDw.age + 9}세</span>) 대운 중입니다.</>
        )}
      </p>

      {/* Current daewun progress bar */}
      {activeDw && (() => {
        const progressPct = Math.round(((currentYear - activeDw.year) / 10) * 100);
        const elem = activeDw.heavenly.element;
        const barColor = { wood: '#4CAF50', fire: '#FF7043', earth: '#FFA000', metal: '#90A4AE', water: '#42A5F5' }[elem] || '#6B7280';
        return (
          <div className="mb-5 bg-gray-50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-black text-gray-500">현재 대운 진행도</span>
              <span className="text-[13px] font-black text-gray-800">{progressPct}%</span>
            </div>
            <div className="relative h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPct}%`, background: `linear-gradient(90deg, ${barColor}80, ${barColor})` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-gray-400 font-bold">{activeDw.year}년</span>
              <span className="text-[10px] font-black" style={{ color: barColor }}>{currentYear}년 현재</span>
              <span className="text-[10px] text-gray-400 font-bold">{activeDw.year + 9}년</span>
            </div>
          </div>
        );
      })()}

      {/* Timeline horizontal scroll */}
      <div className="flex gap-2.5 overflow-x-auto pb-3 -mx-1 px-1 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
        {daewunPillars.map((dw, idx) => {
          const isCurrent = idx === currentIndex;
          const isPast = dw.year + 9 < currentYear;
          const elem = dw.heavenly.element;
          const palette = ELEMENT_PALETTE[elem] || ELEMENT_PALETTE.earth;
          const tenGodIcon = TEN_GOD_ICON[dw.heavenly.ten_god] || "✨";

          return (
            <button
              key={idx}
              onClick={() => setSelected(selected?.age === dw.age ? null : dw)}
              className={`flex-shrink-0 w-[88px] snap-start rounded-[20px] p-3 flex flex-col items-center gap-1 transition-all duration-200 border-2 ${
                isCurrent
                  ? 'bg-gray-900 text-white border-gray-900 shadow-xl scale-105'
                  : isPast
                  ? `${palette.bg} ${palette.text} border-transparent opacity-55`
                  : `${palette.bg} ${palette.text} border-transparent hover:border-gray-200 hover:shadow-md`
              }`}
            >
              {/* Age badge */}
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full whitespace-nowrap ${isCurrent ? 'bg-white/20 text-white' : 'bg-white/70 text-gray-500'}`}>
                {dw.age}~{dw.age + 9}세
              </span>

              {/* Hanja chars */}
              <div className="flex flex-col items-center my-0.5">
                <span className={`text-[30px] font-black leading-none ${isCurrent ? 'text-white' : ''}`}>
                  {getHanja(dw.heavenly.label)}
                </span>
                <span className={`text-[22px] font-black leading-none ${isCurrent ? 'text-white/80' : 'opacity-60'}`}>
                  {getHanja(dw.earthly.label)}
                </span>
              </div>

              {/* Element label */}
              <span className={`text-[10px] font-bold ${isCurrent ? 'text-white/70' : 'opacity-55'}`}>
                {ELEMENT_KOR[elem]}({getHangul(dw.heavenly.label)})
              </span>

              {/* Ten god */}
              <div className={`flex items-center gap-0.5 text-[11px] font-black ${isCurrent ? 'text-white' : ''}`}>
                <span>{tenGodIcon}</span>
                <span>{dw.heavenly.ten_god || '-'}</span>
              </div>

              {/* Year */}
              <span className={`text-[9px] font-medium ${isCurrent ? 'text-white/50' : 'opacity-35'}`}>
                {dw.year}
              </span>

              {/* Current indicator */}
              {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse mt-0.5" />}
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className={`mt-4 rounded-2xl p-5 ${ELEMENT_PALETTE[selected.heavenly.element]?.bg || 'bg-gray-50'} border border-white/80 transition-all`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-white/70 text-gray-600">
                {selected.year}~{selected.year + 9}년 · {selected.age}~{selected.age + 9}세
              </span>
              <h3 className={`text-[20px] font-black mt-2 ${ELEMENT_PALETTE[selected.heavenly.element]?.text || 'text-gray-900'}`}>
                {getHanja(selected.heavenly.label)}{getHanja(selected.earthly.label)} 대운
              </h3>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 text-[22px] leading-none p-1">×</button>
          </div>

          {selected.description && (
            <p className="text-[13px] text-gray-700 font-medium mb-4 break-keep leading-relaxed bg-white/60 rounded-xl p-3">
              {selected.description}
            </p>
          )}

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "💰 재물운", text: selected.wealth_luck },
              { label: "❤️ 애정운", text: selected.love_luck },
              { label: "💼 직장운", text: selected.career_luck },
            ].map(({ label, text }) =>
              text ? (
                <div key={label} className="bg-white/70 rounded-xl p-2.5 flex flex-col gap-1">
                  <span className="text-[11px] font-black text-gray-500">{label}</span>
                  <p className="text-[12px] text-gray-700 font-medium leading-snug break-keep">{text}</p>
                </div>
              ) : null
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DaewunTimeline;
