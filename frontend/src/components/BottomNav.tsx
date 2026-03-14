"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { name: "나의 흐름", path: "/saju", emoji: "🐹" },
        { name: "투데이", path: "/today", emoji: "🏠" },
        { name: "타로", path: "/tarot", emoji: "🔮" },
        { name: "멘토", path: "/experts", emoji: "🦉" },
        { name: "마켓", path: "/store", emoji: "🛍️" },
        { name: "관리자", path: "/admin", emoji: "⚙️" },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            <nav className="max-w-md mx-auto px-2 flex justify-between items-center h-16 sm:h-20">
                {navItems.map((item) => {
                    const isActive = pathname === item.path || (item.path !== "/" && pathname?.startsWith(item.path));

                    return (
                        <Link
                            key={item.name}
                            href={item.path}
                            className="flex-1 flex flex-col items-center justify-center gap-1 min-w-[64px]"
                        >
                            <div
                                className={`transition-all duration-200 text-[24px] ${isActive ? "scale-110 drop-shadow-sm grayscale-0" : "grayscale opacity-60 hover:opacity-100 hover:grayscale-0"
                                    }`}
                            >
                                {item.emoji}
                            </div>
                            <span
                                className={`text-[11px] font-pretendard transition-colors ${isActive ? "text-[#2D3748] font-black tracking-tight" : "text-gray-500 font-bold tracking-tight"
                                    }`}
                            >
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
