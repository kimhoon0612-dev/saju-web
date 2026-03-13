import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SyncMate - Synchronize Your Cosmic Flow",
  description: "우주의 흐름과 나의 일상을 동기화하는 스마트 파트너",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.css" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&display=swap" />
      </head>
      <body
        className={`${outfit.variable} font-pretendard antialiased bg-[#F5F6F8] text-[#111111]`}
      >
        <main className="pb-24 md:pb-8 min-h-screen">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
