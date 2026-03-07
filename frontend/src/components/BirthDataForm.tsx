"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Sparkles, ChevronDown, User, CheckSquare, Square } from 'lucide-react';
import { cn } from './DestinyMatrixCard';

interface BirthDataFormProps {
    onCalculate: (data: { name: string; birth_time_iso: string; longitude: number; is_lunar: boolean; is_leap_month: boolean; gender: string }) => void;
    isLoading: boolean;
    buttonText?: string;
}

export default function BirthDataForm({ onCalculate, isLoading, buttonText }: BirthDataFormProps) {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState('1990');
    const [month, setMonth] = useState('1');
    const [day, setDay] = useState('1');
    const [ampm, setAmpm] = useState('오전');
    const [hour, setHour] = useState('12');
    const [minute, setMinute] = useState('0');

    const [isLunar, setIsLunar] = useState(false);
    const [isLeapMonth, setIsLeapMonth] = useState(false);
    const [gender, setGender] = useState('F');
    const [name, setName] = useState('');
    const [isRemembered, setIsRemembered] = useState(false);

    // 컴포넌트 마운트 시 로컬 스토리지에서 저장된 정보 불러오기
    useEffect(() => {
        const savedData = localStorage.getItem('saju_saved_user_info');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.year) setYear(parsed.year);
                if (parsed.month) setMonth(parsed.month);
                if (parsed.day) setDay(parsed.day);
                if (parsed.ampm) setAmpm(parsed.ampm);
                if (parsed.hour) setHour(parsed.hour);
                if (parsed.minute) setMinute(parsed.minute);
                if (parsed.gender) setGender(parsed.gender);
                if (parsed.isLunar !== undefined) setIsLunar(parsed.isLunar);
                if (parsed.isLeapMonth !== undefined) setIsLeapMonth(parsed.isLeapMonth);
                if (parsed.name) setName(parsed.name);
                setIsRemembered(true);
            } catch (e) {
                console.error("Failed to parse saved user info", e);
            }
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let hr = parseInt(hour, 10);
        if (ampm === '오후' && hr !== 12) {
            hr += 12;
        } else if (ampm === '오전' && hr === 12) {
            hr = 0;
        }

        const m = month.padStart(2, '0');
        const d = day.padStart(2, '0');
        const h = hr.toString().padStart(2, '0');
        const min = minute.padStart(2, '0');

        const isoString = `${year}-${m}-${d}T${h}:${min}:00`;

        // "내 정보 기억하기" 설정 저장 로직
        if (isRemembered) {
            const dataToSave = {
                year, month, day, ampm, hour, minute,
                gender, isLunar, isLeapMonth, name
            };
            localStorage.setItem('saju_saved_user_info', JSON.stringify(dataToSave));
        } else {
            localStorage.removeItem('saju_saved_user_info');
        }

        onCalculate({
            name: name.trim() || "방문자",
            birth_time_iso: isoString,
            longitude: 126.978,
            is_lunar: isLunar,
            is_leap_month: isLeapMonth,
            gender: gender
        });
    };

    const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    // Calculate days in month
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    const days = Array.from({ length: daysInMonth || 31 }, (_, i) => i + 1);

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    return (
        <div className="w-full rounded-[24px] bg-[#1a142d]/80 backdrop-blur-md border border-[#d4af37]/20 p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <header className="mb-6 z-10 relative">
                <h3 className="font-pretendard text-xl sm:text-2xl font-black text-amber-100 flex items-center gap-2 tracking-tight">
                    <Sparkles className="w-6 h-6 text-[#d4af37]" />운명의 좌표 입력
                </h3>
                <p className="font-outfit text-xs text-[#d4af37]/60 mt-1 uppercase tracking-widest font-medium">Input Birth Coordinates</p>
            </header>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">

                {/* 이름 입력 */}
                <div className="flex flex-col gap-2.5">
                    <label className="font-pretendard text-sm text-[#d4af37]/80 flex items-center gap-2 font-bold">
                        <User className="w-[18px] h-[18px] text-[#d4af37]/60" />이름
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="이름을 입력해주세요 (선택)"
                        className="w-full h-14 bg-[#110e1b]/80 border border-[#d4af37]/30 rounded-xl px-4 font-pretendard text-[15px] font-medium text-white placeholder-[#d4af37]/40 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:bg-[#1a142d] transition-all shadow-inner"
                    />
                </div>

                {/* 성별 선택 */}
                <div className="flex flex-col gap-2.5">
                    <label className="font-pretendard text-sm text-[#d4af37]/80 flex items-center gap-2 font-bold">
                        성별 <span className="text-[#d4af37]/50 text-[10px] font-medium tracking-wide">대운 주행 결정</span>
                    </label>
                    <div className="flex flex-row w-full gap-2">
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setGender('M'); }}
                            className={cn(
                                "flex-1 py-3.5 rounded-xl text-[15px] font-bold transition-all duration-200 border",
                                gender === 'M' ? "bg-amber-600/20 text-amber-200 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]" : "bg-[#110e1b]/60 text-white/50 border-white/10 hover:bg-[#110e1b]"
                            )}
                        >
                            남성 (乾)
                        </button>
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setGender('F'); }}
                            className={cn(
                                "flex-1 py-3.5 rounded-xl text-[15px] font-bold transition-all duration-200 border",
                                gender === 'F' ? "bg-purple-600/20 text-purple-200 border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]" : "bg-[#110e1b]/60 text-white/50 border-white/10 hover:bg-[#110e1b]"
                            )}
                        >
                            여성 (坤)
                        </button>
                    </div>
                </div>

                {/* 양력/음력 선택 및 출생 일자 */}
                <div className="flex flex-col gap-2.5 mt-3">
                    <div className="flex items-center justify-between">
                        <label className="font-pretendard text-sm text-[#d4af37]/80 flex items-center gap-2 font-bold">
                            출생 일자
                        </label>
                        <div className="flex items-center bg-[#110e1b]/80 border border-white/10 rounded-lg p-1">
                            <button
                                type="button"
                                onClick={() => setIsLunar(false)}
                                className={cn(
                                    "px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200",
                                    !isLunar ? "bg-[#d4af37]/20 text-[#d4af37] shadow-sm" : "text-white/40 hover:text-white/70"
                                )}
                            >
                                양력
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsLunar(true)}
                                className={cn(
                                    "px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200",
                                    isLunar ? "bg-[#d4af37]/20 text-[#d4af37] shadow-sm" : "text-white/40 hover:text-white/70"
                                )}
                            >
                                음력
                            </button>
                        </div>
                    </div>

                    {isLunar && (
                        <div className="flex items-center gap-2 mb-1">
                            <input
                                type="checkbox"
                                id="leap_month"
                                checked={isLeapMonth}
                                onChange={(e) => setIsLeapMonth(e.target.checked)}
                                className="w-4 h-4 rounded border-[#d4af37]/40 bg-[#110e1b] text-[#d4af37] focus:ring-[#d4af37] focus:ring-offset-[#1a142d]"
                            />
                            <label htmlFor="leap_month" className="text-sm text-white/70 font-bold cursor-pointer select-none">
                                윤달입니다
                            </label>
                        </div>
                    )}

                    <div className="flex items-center gap-1.5 w-full">
                        <div className="flex-1 flex items-center bg-[#110e1b]/80 border border-white/10 rounded-xl px-2 sm:px-3 py-3.5 hover:border-[#d4af37]/40 transition-all focus-within:border-[#d4af37] focus-within:bg-[#1a142d] relative shadow-inner">
                            <select value={year} onChange={(e) => setYear(e.target.value)} className="bg-transparent text-white font-outfit text-base sm:text-lg font-bold outline-none w-full appearance-none cursor-pointer text-center relative z-10">
                                {years.map(y => <option key={y} value={y} className="bg-[#1a142d] text-white">{y}</option>)}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-[#d4af37]/50 absolute right-6 sm:right-8 pointer-events-none" />
                            <span className="text-[#d4af37]/50 font-pretendard text-sm shrink-0 whitespace-nowrap ml-1 relative z-10 pointer-events-none">년</span>
                        </div>
                        <div className="flex-1 flex items-center bg-[#110e1b]/80 border border-white/10 rounded-xl px-2 sm:px-3 py-3.5 hover:border-[#d4af37]/40 transition-all focus-within:border-[#d4af37] focus-within:bg-[#1a142d] relative shadow-inner">
                            <select value={month} onChange={(e) => setMonth(e.target.value)} className="bg-transparent text-white font-outfit text-base sm:text-lg font-bold outline-none w-full appearance-none cursor-pointer text-center relative z-10">
                                {months.map(m => <option key={m} value={m} className="bg-[#1a142d] text-white">{m}</option>)}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-[#d4af37]/50 absolute right-6 sm:right-8 pointer-events-none" />
                            <span className="text-[#d4af37]/50 font-pretendard text-sm shrink-0 whitespace-nowrap ml-1 relative z-10 pointer-events-none">월</span>
                        </div>
                        <div className="flex-1 flex items-center bg-[#110e1b]/80 border border-white/10 rounded-xl px-2 sm:px-3 py-3.5 hover:border-[#d4af37]/40 transition-all focus-within:border-[#d4af37] focus-within:bg-[#1a142d] relative shadow-inner">
                            <select value={day} onChange={(e) => setDay(e.target.value)} className="bg-transparent text-white font-outfit text-base sm:text-lg font-bold outline-none w-full appearance-none cursor-pointer text-center relative z-10">
                                {days.map(d => <option key={d} value={d} className="bg-[#1a142d] text-white">{d}</option>)}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-[#d4af37]/50 absolute right-6 sm:right-8 pointer-events-none" />
                            <span className="text-[#d4af37]/50 font-pretendard text-sm shrink-0 whitespace-nowrap ml-1 relative z-10 pointer-events-none">일</span>
                        </div>
                    </div>
                </div>

                {/* 태어난 시간 (Full Width) */}
                <div className="flex flex-col gap-2.5 mt-2 mb-2">
                    <label className="font-pretendard text-sm text-[#d4af37]/80 flex items-center gap-2 font-bold">
                        출생 시간
                    </label>
                    <div className="flex items-center gap-1.5 w-full">
                        <div className="flex-[0.8] flex items-center bg-[#110e1b]/80 border border-white/10 rounded-xl px-2 sm:px-3 py-3.5 hover:border-[#d4af37]/40 transition-all focus-within:border-[#d4af37] focus-within:bg-[#1a142d] relative shadow-inner">
                            <select value={ampm} onChange={(e) => setAmpm(e.target.value)} className="bg-transparent text-[#d4af37] font-pretendard font-bold text-sm sm:text-[15px] outline-none w-full appearance-none cursor-pointer text-center relative z-10">
                                <option value="오전" className="bg-[#1a142d] text-white">오전</option>
                                <option value="오후" className="bg-[#1a142d] text-white">오후</option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-[#d4af37]/80 absolute right-2 pointer-events-none" />
                        </div>
                        <div className="flex-1 flex items-center bg-[#110e1b]/80 border border-white/10 rounded-xl px-2 sm:px-3 py-3.5 hover:border-[#d4af37]/40 transition-all focus-within:border-[#d4af37] focus-within:bg-[#1a142d] relative shadow-inner">
                            <select value={hour} onChange={(e) => setHour(e.target.value)} className="bg-transparent text-white font-outfit text-base sm:text-lg font-bold outline-none w-full appearance-none cursor-pointer text-center relative z-10">
                                {hours.map(h => <option key={h} value={h} className="bg-[#1a142d] text-white">{h}</option>)}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-[#d4af37]/50 absolute right-6 sm:right-8 pointer-events-none" />
                            <span className="text-[#d4af37]/50 font-pretendard text-sm shrink-0 whitespace-nowrap ml-1 relative z-10 pointer-events-none">시</span>
                        </div>
                        <div className="flex-1 flex items-center bg-[#110e1b]/80 border border-white/10 rounded-xl px-2 sm:px-3 py-3.5 hover:border-[#d4af37]/40 transition-all focus-within:border-[#d4af37] focus-within:bg-[#1a142d] relative shadow-inner">
                            <select value={minute} onChange={(e) => setMinute(e.target.value)} className="bg-transparent text-white font-outfit text-base sm:text-lg font-bold outline-none w-full appearance-none cursor-pointer text-center relative z-10">
                                {minutes.map(m => <option key={m} value={m} className="bg-[#1a142d] text-white">{m.toString().padStart(2, '0')}</option>)}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-[#d4af37]/50 absolute right-6 sm:right-8 pointer-events-none" />
                            <span className="text-[#d4af37]/50 font-pretendard text-sm shrink-0 whitespace-nowrap ml-1 relative z-10 pointer-events-none">분</span>
                        </div>
                    </div>
                </div>

                {/* 내 정보 기억하기 Checkbox */}
                <div className="flex items-center justify-end w-full px-1">
                    <button
                        type="button"
                        onClick={() => setIsRemembered(!isRemembered)}
                        className="flex items-center gap-2 group outline-none"
                    >
                        <div className="relative flex items-center justify-center w-[18px] h-[18px]">
                            {isRemembered ? (
                                <CheckSquare className="w-5 h-5 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)] transition-all" />
                            ) : (
                                <Square className="w-5 h-5 text-white/30 group-hover:text-white/50 transition-all" />
                            )}
                        </div>
                        <span className={cn(
                            "text-[13px] font-pretendard transition-all",
                            isRemembered ? "text-amber-200/90 font-bold" : "text-white/50 font-medium group-hover:text-white/70"
                        )}>
                            내 정보 기억하기
                        </span>
                    </button>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                        "mt-4 w-full py-4.5 rounded-xl font-pretendard font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2",
                        isLoading
                            ? "bg-[#110e1b] text-white/50 border border-white/10 cursor-not-allowed"
                            : "bg-gradient-to-r from-amber-500 to-amber-400 text-[#111] shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:-translate-y-0.5 border border-amber-300"
                    )}
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
                            운명의 좌표 확인 중...
                        </>
                    ) : (
                        buttonText || "사주 명식 확인하기"
                    )}
                </button>

            </form>
        </div>
    );
}
