"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const isStoreEnabled = process.env.NEXT_PUBLIC_ENABLE_STORE === "true";

const navItems = [
  { name: "홈",    path: "/",       emoji: "🏠", activeEmoji: "🏠" },
  { name: "흐름",  path: "/saju",   emoji: "🌊", activeEmoji: "🌊" },
  { name: "타로",  path: "/tarot",  emoji: "🔮", activeEmoji: "🔮" },
  ...(isStoreEnabled ? [{ name: "스토어", path: "/store",  emoji: "🛍️", activeEmoji: "🛍️" }] : []),
  { name: "MY",   path: "/login",  emoji: "👤", activeEmoji: "👤" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(0,0,0,0.06)",
        paddingBottom: "env(safe-area-inset-bottom, 16px)",
        boxShadow: "0 -4px 32px rgba(0,0,0,0.06)"
      }}
    >
      <nav className="max-w-md mx-auto px-3 flex justify-between items-center h-[62px]">
        {navItems.map((item) => {
          const isActive =
            pathname === item.path ||
            (item.path !== "/" && pathname?.startsWith(item.path));

          return (
            <Link
              key={item.name}
              href={item.path}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative group"
            >
              {/* Active indicator pill */}
              {isActive && (
                <span
                  className="absolute -top-0 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full bg-gray-900"
                  style={{ animation: "scaleIn 0.25s ease both" }}
                />
              )}

              {/* Emoji icon */}
              <span
                className={`text-[22px] leading-none transition-all duration-200 select-none ${
                  isActive
                    ? "scale-110 drop-shadow-[0_2px_6px_rgba(0,0,0,0.15)]"
                    : "opacity-50 group-hover:opacity-80 group-hover:scale-105"
                }`}
              >
                {isActive ? item.activeEmoji : item.emoji}
              </span>

              {/* Label */}
              <span
                className={`text-[10px] font-pretendard transition-all duration-200 ${
                  isActive
                    ? "text-gray-900 font-black"
                    : "text-gray-400 font-bold group-hover:text-gray-600"
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
