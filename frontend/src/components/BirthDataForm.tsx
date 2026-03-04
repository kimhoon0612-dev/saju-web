"use client";

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Sparkles, ChevronDown, User } from 'lucide-react';
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
        <div className="w-full rounded-[24px] bg-white border border-gray-200 p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <header className="mb-6 z-10 relative">
                <h3 className="font-pretendard text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2 tracking-tight">
                    <Sparkles className="w-6 h-6 text-[var(--color-brand-red)]" />운명의 좌표 입력
                </h3>
                <p className="font-outfit text-xs text-gray-500 mt-1 uppercase tracking-widest font-medium">Input Birth Coordinates</p>
            </header>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">

                {/* 이름 입력 */}
                <div className="flex flex-col gap-2.5">
                    <label className="font-pretendard text-sm text-gray-700 flex items-center gap-2 font-bold">
                        <User className="w-[18px] h-[18px] text-gray-400" />이름
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="이름을 입력해주세요 (선택)"
                        className="w-full h-14 bg-gray-50/50 border border-gray-200 rounded-xl px-4 font-pretendard text-[15px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-red)] focus:bg-white transition-all shadow-sm"
                    />
                </div>

                {/* 성별 선택 */}
                <div className="flex flex-col gap-2.5">
                    <label className="font-pretendard text-sm text-gray-700 flex items-center gap-2 font-bold">
                        성별 <span className="text-gray-400 text-[10px] font-medium tracking-wide">대운 주행 결정</span>
                    </label>
                    <div className="flex flex-row w-full gap-2">
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setGender('M'); }}
                            className={cn(
                                "flex-1 py-3.5 rounded-xl text-[15px] font-bold transition-all duration-200 border",
                                gender === 'M' ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                            )}
                        >
                            남성 (乾)
                        </button>
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setGender('F'); }}
                            className={cn(
                                "flex-1 py-3.5 rounded-xl text-[15px] font-bold transition-all duration-200 border",
                                gender === 'F' ? "bg-[var(--color-brand-red)] text-white border-[var(--color-brand-red)] shadow-md shadow-[var(--color-brand-red)]/20" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                            )}
                        >
                            여성 (坤)
                        </button>
                    </div>
                </div>

                {/* 양력/음력 선택 및 출생 일자 */}
                <div className="flex flex-col gap-2.5 mt-3">
                    <div className="flex items-center justify-between">
                        <label className="font-pretendard text-sm text-gray-700 flex items-center gap-2 font-bold">
                            출생 일자
                        </label>
                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                            <button
                                type="button"
                                onClick={() => setIsLunar(false)}
                                className={cn(
                                    "px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200",
                                    !isLunar ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                양력
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsLunar(true)}
                                className={cn(
                                    "px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200",
                                    isLunar ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
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
                                className="w-4 h-4 rounded border-gray-300 text-[var(--color-brand-red)] focus:ring-[var(--color-brand-red)]"
                            />
                            <label htmlFor="leap_month" className="text-sm text-gray-700 font-bold cursor-pointer select-none">
                                윤달입니다
                            </label>
                        </div>
                    )}

                    <div className="flex items-center gap-1.5 w-full">
                        <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-xl px-2 sm:px-3 py-3.5 hover:border-gray-300 transition-all focus-within:border-[var(--color-brand-red)] focus-within:bg-white relative">
                            <select value={year} onChange={(e) => setYear(e.target.value)} className="bg-transparent text-gray-900 font-outfit text-base sm:text-lg font-bold outline-none w-full appearance-none cursor-pointer text-center relative z-10">
                                {years.map(y => <option key={y} value={y} className="bg-white text-gray-900">{y}</option>)}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-6 sm:right-8 pointer-events-none" />
                            <span className="text-gray-500 font-pretendard text-sm shrink-0 whitespace-nowrap ml-1 relative z-10 pointer-events-none">년</span>
                        </div>
                        <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-xl px-2 sm:px-3 py-3.5 hover:border-gray-300 transition-all focus-within:border-[var(--color-brand-red)] focus-within:bg-white relative">
                            <select value={month} onChange={(e) => setMonth(e.target.value)} className="bg-transparent text-gray-900 font-outfit text-base sm:text-lg font-bold outline-none w-full appearance-none cursor-pointer text-center relative z-10">
                                {months.map(m => <option key={m} value={m} className="bg-white text-gray-900">{m}</option>)}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-6 sm:right-8 pointer-events-none" />
                            <span className="text-gray-500 font-pretendard text-sm shrink-0 whitespace-nowrap ml-1 relative z-10 pointer-events-none">월</span>
                        </div>
                        <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-xl px-2 sm:px-3 py-3.5 hover:border-gray-300 transition-all focus-within:border-[var(--color-brand-red)] focus-within:bg-white relative">
                            <select value={day} onChange={(e) => setDay(e.target.value)} className="bg-transparent text-gray-900 font-outfit text-base sm:text-lg font-bold outline-none w-full appearance-none cursor-pointer text-center relative z-10">
                                {days.map(d => <option key={d} value={d} className="bg-white text-gray-900">{d}</option>)}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-6 sm:right-8 pointer-events-none" />
                            <span className="text-gray-500 font-pretendard text-sm shrink-0 whitespace-nowrap ml-1 relative z-10 pointer-events-none">일</span>
                        </div>
                    </div>
                </div>

                {/* 태어난 시간 (Full Width) */}
                <div className="flex flex-col gap-2.5 mt-2 mb-2">
                    <label className="font-pretendard text-sm text-gray-700 flex items-center gap-2 font-bold">
                        출생 시간
                    </label>
                    <div className="flex items-center gap-1.5 w-full">
                        <div className="flex-[0.8] flex items-center bg-gray-50 border border-gray-200 rounded-xl px-2 sm:px-3 py-3.5 hover:border-gray-300 transition-all focus-within:border-[var(--color-brand-red)] focus-within:bg-white relative">
                            <select value={ampm} onChange={(e) => setAmpm(e.target.value)} className="bg-transparent text-[var(--color-brand-red)] font-pretendard font-bold text-sm sm:text-[15px] outline-none w-full appearance-none cursor-pointer text-center relative z-10">
                                <option value="오전" className="bg-white text-gray-900">오전</option>
                                <option value="오후" className="bg-white text-gray-900">오후</option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-[var(--color-brand-red)] absolute right-2 pointer-events-none" />
                        </div>
                        <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-xl px-2 sm:px-3 py-3.5 hover:border-gray-300 transition-all focus-within:border-[var(--color-brand-red)] focus-within:bg-white relative">
                            <select value={hour} onChange={(e) => setHour(e.target.value)} className="bg-transparent text-gray-900 font-outfit text-base sm:text-lg font-bold outline-none w-full appearance-none cursor-pointer text-center relative z-10">
                                {hours.map(h => <option key={h} value={h} className="bg-white text-gray-900">{h}</option>)}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-6 sm:right-8 pointer-events-none" />
                            <span className="text-gray-500 font-pretendard text-sm shrink-0 whitespace-nowrap ml-1 relative z-10 pointer-events-none">시</span>
                        </div>
                        <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-xl px-2 sm:px-3 py-3.5 hover:border-gray-300 transition-all focus-within:border-[var(--color-brand-red)] focus-within:bg-white relative">
                            <select value={minute} onChange={(e) => setMinute(e.target.value)} className="bg-transparent text-gray-900 font-outfit text-base sm:text-lg font-bold outline-none w-full appearance-none cursor-pointer text-center relative z-10">
                                {minutes.map(m => <option key={m} value={m} className="bg-white text-gray-900">{m.toString().padStart(2, '0')}</option>)}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-6 sm:right-8 pointer-events-none" />
                            <span className="text-gray-500 font-pretendard text-sm shrink-0 whitespace-nowrap ml-1 relative z-10 pointer-events-none">분</span>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                        "mt-4 w-full py-4.5 rounded-xl font-pretendard font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2",
                        isLoading
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-[var(--color-brand-red)] text-white shadow-md shadow-[var(--color-brand-red)]/30 hover:shadow-lg hover:shadow-[var(--color-brand-red)]/40 hover:-translate-y-0.5"
                    )}
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
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
