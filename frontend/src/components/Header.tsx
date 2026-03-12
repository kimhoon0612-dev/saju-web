import React from 'react';
import Link from 'next/link';
import { Search, User } from 'lucide-react';

export default function Header() {
    return (
        <header className="w-full fixed top-0 z-50 bg-white backdrop-blur-md">
            <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
                {/* Left side: Weather / Fine dust */}
                <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500">
                    <div>미세 <span className="text-[#2AC1BC] font-bold">· 좋음</span></div>
                    <div className="w-[1px] h-2.5 bg-gray-200"></div>
                    <div>초미세 <span className="text-[#2AC1BC] font-bold">· 좋음</span></div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    {/* Lucky bag indicator */}
                    <div className="flex items-center bg-gray-50 rounded-full pl-2 pr-3 py-1 cursor-pointer">
                        <span className="text-[15px] leading-none mr-1.5 translate-y-[-1px]">🧧</span>
                        <span className="text-[13px] font-bold text-gray-900">0</span>
                    </div>

                    <button className="w-8 h-8 flex items-center justify-center text-gray-800 hover:text-black transition-all">
                        <Search className="w-5 h-5" strokeWidth={3} />
                    </button>

                    <button className="w-7 h-7 bg-[#212124] rounded-full flex items-center justify-center text-white transition-all shadow-sm">
                        <User className="w-[14px] h-[14px]" strokeWidth={3} />
                    </button>
                </div>
            </div>
        </header>
    );
}