"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, ShoppingBag, PhoneCall, Layers } from "lucide-react";

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { name: "홈", path: "/", icon: Home },
        { name: "정통사주", path: "/saju", icon: Compass },
        { name: "부적상점", path: "/store", icon: ShoppingBag },
        { name: "운세상담", path: "/experts", icon: PhoneCall },
        { name: "타로", path: "/tarot", icon: Layers },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            <nav className="max-w-md mx-auto px-2 flex justify-between items-center h-16 sm:h-20">
                {navItems.map((item) => {
                    const isActive = pathname === item.path || (item.path !== "/" && pathname?.startsWith(item.path));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.path}
                            className="flex-1 flex flex-col items-center justify-center gap-1 min-w-[64px]"
                        >
                            <div
                                className={`transition-all duration-200 ${isActive ? "text-[var(--color-brand-red)] scale-110" : "text-gray-400 hover:text-gray-600"
                                    }`}
                            >
                                <Icon
                                    size={24}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                            </div>
                            <span
                                className={`text-[10px] font-pretendard transition-colors ${isActive ? "text-[var(--color-brand-red)] font-extrabold" : "text-gray-400 font-medium"
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
