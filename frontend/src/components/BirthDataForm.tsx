"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, CheckSquare, Square } from 'lucide-react';
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
    
    // 회원가입 관련 상태 반환
    const [email, setEmail] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    
    // 이메일 인증 관련 상태
    const [verificationCode, setVerificationCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isCodeVerified, setIsCodeVerified] = useState(false);
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [isVerifyingCode, setIsVerifyingCode] = useState(false);
    
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
                gender, isLunar, isLeapMonth, name, email
            };
            localStorage.setItem('saju_saved_user_info', JSON.stringify(dataToSave));
        } else {
            localStorage.removeItem('saju_saved_user_info');
        }

        handleRegister(isoString);
    };

    const handleCalculate = (isoString: string) => {
        onCalculate({
            name: name.trim() || "방문자",
            birth_time_iso: isoString,
            longitude: 126.978,
            is_lunar: isLunar,
            is_leap_month: isLeapMonth,
            gender: gender
        });
    };

    const handleSendVerificationCode = async () => {
        if (!email) {
            alert("이메일 주소를 입력해주세요.");
            return;
        }
        setIsSendingCode(true);
        try {
            const res = await fetch('/api/auth/send-verification-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                alert("인증 코드가 이메일로 전송되었습니다. 10분 내에 입력해주세요.");
                setIsCodeSent(true);
            } else {
                alert(`전송 실패: ${data.detail || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error(error);
            alert("서버 오류로 인해 인증 코드를 전송하지 못했습니다.");
        } finally {
            setIsSendingCode(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!verificationCode) {
            alert("인증 코드를 입력해주세요.");
            return;
        }
        setIsVerifyingCode(true);
        try {
            const res = await fetch('/api/auth/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: verificationCode })
            });
            const data = await res.json();
            if (res.ok) {
                alert("이메일 인증이 성공적으로 완료되었습니다.");
                setIsCodeVerified(true);
            } else {
                alert(`인증 실패: ${data.detail || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error(error);
            alert("서버 오류로 인해 인증을 완료하지 못했습니다.");
        } finally {
            setIsVerifyingCode(false);
        }
    };

    const handleRegister = async (isoString: string) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    password: "dummy_password_for_saju",
                    name: name.trim() || "회원",
                    gender: gender,
                    birth_time_iso: isoString,
                    is_lunar: isLunar,
                    is_leap_month: isLeapMonth,
                    login_type: "email"
                })
            });

            const data = await res.json();
            if (res.ok) {
                alert("회원가입이 완료되었습니다! 분석 결과를 확인합니다.");
                // Immediately proceed to calculate after success
                handleCalculate(isoString);
            } else {
                alert(`가입 실패: ${data.detail || '알 수 없는 오류'}`);
            }
        } catch (error) {
            console.error("Registration error:", error);
            alert("서버 오류로 인해 가입에 실패했습니다.");
        }
    };

    const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    // Calculate days in month
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    const days = Array.from({ length: daysInMonth || 31 }, (_, i) => i + 1);

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    return (
        <div className="w-full rounded-[32px] bg-white/95 backdrop-blur-md border border-gray-100 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
            <header className="mb-8 z-10 relative flex flex-col items-center">
                <span className="text-[32px] mb-2">✨</span>
                <h3 className="font-pretendard text-[24px] font-black text-gray-900 tracking-tight text-center">
                    나의 운명 코드
                </h3>
                <p className="text-[14px] text-gray-500 mt-1 font-medium text-center">정확한 사주 분석을 위해 정보를 입력해주세요</p>
            </header>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
                {/* 이름 입력 */}
                <div className="flex flex-col gap-2">
                    <label className="font-pretendard text-[13px] text-gray-600 flex items-center gap-1.5 font-extrabold px-1">
                        어떻게 불러드릴까요?
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="이름이나 닉네임을 입력해주세요 (선택)"
                        className="w-full h-14 bg-gray-50/50 border border-gray-200 rounded-[18px] px-5 font-pretendard text-[16px] font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all"
                    />
                </div>

                {/* 성별 선택 */}
                <div className="flex flex-col gap-2">
                    <label className="font-pretendard text-[13px] text-gray-600 flex items-center gap-1.5 font-extrabold px-1">
                        성별
                    </label>
                    <div className="flex flex-row w-full gap-2.5">
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setGender('M'); }}
                            className={cn(
                                "flex-1 py-4 rounded-[18px] text-[16px] font-black transition-all duration-200 border",
                                gender === 'M' ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            )}
                        >
                            남성
                        </button>
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setGender('F'); }}
                            className={cn(
                                "flex-1 py-4 rounded-[18px] text-[16px] font-black transition-all duration-200 border",
                                gender === 'F' ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-400 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            )}
                        >
                            여성
                        </button>
                    </div>
                </div>

                {/* 양력/음력 선택 및 출생 일자 */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1 mb-1">
                        <label className="font-pretendard text-[13px] text-gray-600 flex items-center gap-1.5 font-extrabold">
                            생년월일
                        </label>
                        <div className="flex items-center bg-gray-100/80 rounded-xl p-1">
                            <button
                                type="button"
                                onClick={() => setIsLunar(false)}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-[13px] font-extrabold transition-all duration-200",
                                    !isLunar ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                양력
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsLunar(true)}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-[13px] font-extrabold transition-all duration-200",
                                    isLunar ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                음력
                            </button>
                        </div>
                    </div>

                    {isLunar && (
                        <div className="flex items-center gap-2 mb-2 px-1">
                            <input
                                type="checkbox"
                                id="leap_month"
                                checked={isLeapMonth}
                                onChange={(e) => setIsLeapMonth(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                            />
                            <label htmlFor="leap_month" className="text-[14px] text-gray-700 font-bold cursor-pointer select-none">
                                윤달입니다
                            </label>
                        </div>
                    )}

                    <div className="flex items-center gap-2 w-full">
                        <div className="flex-[1.2] flex items-center bg-gray-50/50 border border-gray-200 rounded-[18px] px-3 py-4 hover:border-gray-300 transition-all focus-within:ring-2 focus-within:ring-gray-900/10 focus-within:border-gray-900 relative">
                            <select value={year} onChange={(e) => setYear(e.target.value)} className="bg-transparent text-gray-900 font-outfit text-lg font-black outline-none w-full appearance-none cursor-pointer text-center relative z-10">
                                {years.map(y => <option key={y} value={y} className="text-gray-900">{y}</option>)}
                            </select>
                            <ChevronDown className="w-5 h-5 text-gray-400 absolute right-6 sm:right-8 pointer-events-none" strokeWidth={2.5} />
                            <span className="text-gray-700 font-pretendard text-[15px] font-bold shrink-0 whitespace-nowrap ml-1 relative z-10 pointer-events-none">년</span>
                        </div>
                        <div className="flex-1 flex items-center bg-gray-50/50 border border-gray-200 rounded-[18px] px-3 py-4 hover:border-gray-300 transition-all focus-within:ring-2 focus-within:ring-gray-900/10 focus-within:border-gray-900 relative">
                            <select value={month} onChange={(e) => setMonth(e.target.value)} className="bg-transparent text-gray-900 font-outfit text-lg font-black outline-none w-full appearance-none cursor-pointer text-center relative z-10">
                                {months.map(m => <option key={m} value={m} className="text-gray-900">{m}</option>)}
                            </select>
                            <ChevronDown className="w-5 h-5 text-gray-400 absolute right-6 sm:right-8 pointer-events-none" strokeWidth={2.5} />
                            <span className="text-gray-700 font-pretendard text-[15px] font-bold shrink-0 whitespace-nowrap ml-1 relative z-10 pointer-events-none">월</span>
                        </div>
                        <div className="flex-1 flex items-center bg-gray-50/50 border border-gray-200 rounded-[18px] px-3 py-4 hover:border-gray-300 transition-all focus-within:ring-2 focus-within:ring-gray-900/10 focus-within:border-gray-900 relative">
                            <select value={day} onChange={(e) => setDay(e.target.value)} className="bg-transparent text-gray-900 font-outfit text-lg font-black outline-none w-full appearance-none cursor-pointer text-center relative z-10">
                                {days.map(d => <option key={d} value={d} className="text-gray-900">{d}</option>)}
                            </select>
                            <ChevronDown className="w-5 h-5 text-gray-400 absolute right-6 sm:right-8 pointer-events-none" strokeWidth={2.5} />
                            <span className="text-gray-700 font-pretendard text-[15px] font-bold shrink-0 whitespace-nowrap ml-1 relative z-10 pointer-events-none">일</span>
                        </div>
                    </div>
                </div>

                {/* 태어난 시간 */}
                <div className="flex flex-col gap-2 mb-2">
                    <label className="font-pretendard text-[13px] text-gray-600 flex items-center gap-1.5 font-extrabold px-1">
                        태어난 시간
                    </label>
                    <div className="flex items-center gap-2 w-full">
                        <div className="flex-[0.8] flex items-center bg-gray-50/50 border border-gray-200 rounded-[18px] px-3 py-4 hover:border-gray-300 transition-all focus-within:ring-2 focus-within:ring-gray-900/10 focus-within:border-gray-900 relative">
                            <select value={ampm} onChange={(e) => setAmpm(e.target.value)} className="bg-transparent text-gray-900 font-pretendard font-black text-[16px] outline-none w-full appearance-none cursor-pointer text-center relative z-10">
                                <option value="오전" className="text-gray-900">오전</option>
                                <option value="오후" className="text-gray-900">오후</option>
                            </select>
                            <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 pointer-events-none" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 flex items-center bg-gray-50/50 border border-gray-200 rounded-[18px] px-3 py-4 hover:border-gray-300 transition-all focus-within:ring-2 focus-within:ring-gray-900/10 focus-within:border-gray-900 relative">
                            <select value={hour} onChange={(e) => setHour(e.target.value)} className="bg-transparent text-gray-900 font-outfit text-lg font-black outline-none w-full appearance-none cursor-pointer text-center relative z-10">
                                {hours.map(h => <option key={h} value={h} className="text-gray-900">{h}</option>)}
                            </select>
                            <ChevronDown className="w-5 h-5 text-gray-400 absolute right-6 sm:right-8 pointer-events-none" strokeWidth={2.5} />
                            <span className="text-gray-700 font-pretendard text-[15px] font-bold shrink-0 whitespace-nowrap ml-1 relative z-10 pointer-events-none">시</span>
                        </div>
                        <div className="flex-1 flex items-center bg-gray-50/50 border border-gray-200 rounded-[18px] px-3 py-4 hover:border-gray-300 transition-all focus-within:ring-2 focus-within:ring-gray-900/10 focus-within:border-gray-900 relative">
                            <select value={minute} onChange={(e) => setMinute(e.target.value)} className="bg-transparent text-gray-900 font-outfit text-lg font-black outline-none w-full appearance-none cursor-pointer text-center relative z-10">
                                {minutes.map(m => <option key={m} value={m} className="text-gray-900">{m.toString().padStart(2, '0')}</option>)}
                            </select>
                            <ChevronDown className="w-5 h-5 text-gray-400 absolute right-6 sm:right-8 pointer-events-none" strokeWidth={2.5} />
                            <span className="text-gray-700 font-pretendard text-[15px] font-bold shrink-0 whitespace-nowrap ml-1 relative z-10 pointer-events-none">분</span>
                        </div>
                    </div>
                </div>

                {/* Registration Optional Fields */}
                <div className="flex flex-col gap-2 border-t border-gray-100 pt-6 mt-2">
                    <label className="font-pretendard text-[14px] text-gray-800 flex items-center gap-1.5 font-extrabold px-1">
                        계정 만들기 (선택사항)
                    </label>
                    <p className="text-[12px] text-gray-500 font-medium px-1 mb-2">
                        가입하시면 분석 결과와 찜한 전문가 목록이 저장됩니다.
                    </p>
                    
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setIsCodeSent(false);
                                    setIsCodeVerified(false);
                                    setVerificationCode('');
                                }}
                                disabled={isCodeVerified}
                                placeholder="결과를 저장할 이메일 주소를 입력해주세요"
                                className={cn(
                                    "flex-1 h-12 bg-gray-50/50 border border-gray-200 rounded-[14px] px-4 font-pretendard text-[15px] font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all",
                                    isCodeVerified ? "text-gray-500 bg-gray-100" : "text-gray-900"
                                )}
                            />
                            <button
                                type="button"
                                onClick={handleSendVerificationCode}
                                disabled={!email || isCodeVerified || isSendingCode}
                                className={cn(
                                    "h-12 px-4 rounded-[14px] font-pretendard text-[14px] font-bold whitespace-nowrap transition-colors flex items-center justify-center min-w-[100px]",
                                    isCodeVerified ? "bg-gray-100 text-gray-500 cursor-not-allowed" :
                                    (!email || isSendingCode) ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-900 text-white hover:bg-black"
                                )}
                            >
                                {isSendingCode ? "전송 중..." : isCodeVerified ? "인증 완료" : isCodeSent ? "재전송" : "인증코드 받기"}
                            </button>
                        </div>
                        
                        {isCodeSent && !isCodeVerified && (
                            <div className="flex gap-2 animate-in slide-in-from-top-2 duration-300">
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    placeholder="인증코드 6자리"
                                    className="flex-1 h-12 bg-gray-50 border border-gray-200 rounded-[14px] px-4 font-pretendard text-[15px] font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all"
                                    maxLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={handleVerifyCode}
                                    disabled={verificationCode.length !== 6 || isVerifyingCode}
                                    className={cn(
                                        "h-12 px-4 rounded-[14px] font-pretendard text-[14px] font-bold whitespace-nowrap transition-colors flex items-center justify-center min-w-[100px]",
                                        (verificationCode.length !== 6 || isVerifyingCode) ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-900 text-white hover:bg-black"
                                    )}
                                >
                                    {isVerifyingCode ? "확인 중..." : "확인"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 내 정보 기억하기 Checkbox */}
                <div className="flex items-center justify-end w-full px-2 mt-4">
                    <button
                        type="button"
                        onClick={() => setIsRemembered(!isRemembered)}
                        className="flex items-center gap-2 group outline-none"
                    >
                        <div className="relative flex items-center justify-center w-5 h-5">
                            {isRemembered ? (
                                <CheckSquare className="w-5 h-5 text-gray-900" />
                            ) : (
                                <Square className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" />
                            )}
                        </div>
                        <span className={cn(
                            "text-[14px] font-pretendard transition-all",
                            isRemembered ? "text-gray-900 font-black" : "text-gray-500 font-bold group-hover:text-gray-700"
                        )}>
                            내 정보 기억하기
                        </span>
                    </button>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col mt-4">
                    <button
                        type="submit"
                        disabled={isLoading || (email.length > 0 && !isCodeVerified)}
                        className={cn(
                            "w-full h-[64px] rounded-[18px] font-pretendard font-black text-[18px] transition-all duration-300 flex items-center justify-center gap-2",
                            (isLoading || (email.length > 0 && !isCodeVerified))
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-gray-900 text-white shadow-lg hover:bg-black hover:shadow-xl hover:-translate-y-0.5"
                        )}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : null}
                        {email === '' ? "바로 결과 보기" : email !== '' && !isCodeVerified ? "이메일 인증을 완료해주세요" : "회원가입하고 결과 보기"}
                    </button>
                </div>

            </form>
        </div>
    );
}
