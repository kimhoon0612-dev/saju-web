"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) setIsLoggedIn(true);
  }, []);

  const handleKakaoLogin = () => {
    if (!termsAgreed) return;
    setIsLoading(true);
    const KAKAO_REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY || "a1a2b678a3ba09a7c064e3b4bfafc6cd";
    const REDIRECT_URI = `${window.location.origin}/auth/kakao/callback`;
    window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    sessionStorage.clear();
    setIsLoggedIn(false);
    window.location.href = "/login";
  };

  const handleWithdrawal = async () => {
    if (!confirm("정말로 탈퇴하시겠습니까?\n탈퇴 시 모든 분석 데이터와 획득한 혜택이 즉시 파기되며 복구할 수 없습니다.")) {
      return;
    }
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://saju-web.onrender.com";
      const baseUrl = window.location.hostname === "localhost" ? "http://localhost:8000" : API_BASE;
      
      const res = await fetch(`${baseUrl}/api/users/me`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        alert("회원 탈퇴가 안전하게 처리되었습니다. 이용해 주셔서 감사합니다.");
        localStorage.removeItem("access_token");
        sessionStorage.clear();
        setIsLoggedIn(false);
        window.location.href = "/login";
      } else {
        const err = await res.json();
        alert(err.detail || "탈퇴 처리 중 오류가 발생했습니다.");
      }
    } catch (err) {
      alert("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://saju-web.onrender.com";
      const baseUrl = window.location.hostname === "localhost" ? "http://localhost:8000" : API_BASE;
      
      const res = await fetch(`${baseUrl}/api/auth/apple`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          code: "mock_reviewer_guest",
          redirect_uri: ""
        })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("access_token", data.access_token);
        window.location.href = "/";
      } else {
        alert("게스트 입장 도중 오류가 발생했습니다.");
      }
    } catch (err) {
      alert("네트워크 연결 실패로 게스트 진입이 불가능합니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-[#0C0F26]"
    >
      {/* Decorative cosmic nebula orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-indigo-500/15 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">

        {/* Logo / Hero */}
        <div className="flex flex-col items-center mb-8 animate-fade-in-up">
          {/* Animated Mascot Character Card */}
          <div className="relative w-32 h-32 mb-6 drop-shadow-[0_10px_30px_rgba(168,85,247,0.25)] animate-bounce" style={{ animationDuration: '3.5s' }}>
            <img
              src="/images/welcome_anime_mascot.png"
              alt="세상의 모든 사주팔자 마스코트"
              className="w-full h-full object-contain rounded-[32px] border-2 border-white/10 bg-[#161233]"
            />
          </div>

          <h1 className="text-[26px] font-black text-white mb-2 tracking-tight">세상의 모든 사주팔자</h1>
          <p className="text-[14px] text-white/50 font-medium text-center leading-relaxed">
            우주의 흐름과 나의 일상을 동기화하는<br />가장 쉽고 친근한 명리 가이드
          </p>
        </div>

        {isLoggedIn ? (
          /* Already logged in state */
          <div className="w-full flex flex-col gap-3 animate-scale-in">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[28px] p-6 shadow-xl flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                <span className="text-3xl">👋</span>
              </div>
              <div className="text-center">
                <h2 className="text-[17px] font-black text-white mb-1">이미 로그인 중입니다</h2>
                <p className="text-[12px] text-white/55 font-medium">로그아웃하면 데이터가 초기화됩니다.</p>
              </div>
              <button
                onClick={() => router.push("/")}
                className="w-full h-12 bg-white text-indigo-950 hover:bg-gray-100 rounded-[14px] text-[14px] font-black tracking-tight transition-all active:scale-95 shadow-md"
                disabled={isLoading}
              >
                메인 화면으로
              </button>
              
              <div className="w-full flex flex-col gap-2 mt-2 pt-2 border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="w-full h-11 bg-white/5 text-white/80 rounded-[14px] text-[13px] font-bold border border-white/10 transition-all hover:bg-white/10"
                  disabled={isLoading}
                >
                  로그아웃
                </button>
                <button
                  onClick={handleWithdrawal}
                  className="w-full h-11 bg-red-950/30 text-red-400 rounded-[14px] text-[12px] font-bold border border-red-900/30 transition-all hover:bg-red-900/20"
                  disabled={isLoading}
                >
                  회원 탈퇴 (모든 정보 삭제)
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Login flow */
          <div className="w-full flex flex-col gap-4 animate-fade-in-up delay-200">

            {/* Kakao Login - Primary */}
            <button
              onClick={handleKakaoLogin}
              disabled={isLoading || !termsAgreed}
              className={`w-full h-15 rounded-[20px] flex items-center justify-center font-black text-[16px] tracking-tight transition-all relative border-2 border-black ${
                !termsAgreed
                  ? "opacity-40 cursor-not-allowed bg-[#FEE500] text-black"
                  : "bg-[#FEE500] text-black shadow-[4px_4px_0px_#000000] hover:shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#000000]"
              }`}
            >
              {/* Kakao icon */}
              <div className="absolute left-5">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 4C7.02944 4 3 7.12643 3 10.982C3 13.4478 4.60411 15.6133 6.95837 16.8856L6.08272 20.061C5.97893 20.4374 6.38871 20.7265 6.70327 20.5015L10.3758 17.8741C10.9026 17.9351 11.4447 17.9641 12 17.9641C16.9706 17.9641 21 14.8377 21 10.982C21 7.12643 16.9706 4 12 4Z" fill="black"/>
                </svg>
              </div>
              {isLoading ? "로그인 중..." : "카카오로 시작하기"}
            </button>

            {/* Terms consent */}
            <label className={`flex items-start gap-3 bg-white/5 backdrop-blur-md rounded-[20px] p-4 cursor-pointer transition-all border ${termsAgreed ? "border-indigo-400 shadow-[0_0_0_3px_rgba(99,102,241,0.15)]" : "border-white/10 shadow-sm hover:border-white/20"}`}>
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${termsAgreed ? "bg-indigo-500" : "border-2 border-white/30 bg-transparent"}`}>
                  {termsAgreed && (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <p className={`text-[13px] font-black ${termsAgreed ? "text-indigo-400" : "text-white/80"}`}>
                  [필수] 만 14세 이상이며, 약관에 동의합니다.
                </p>
                <p className="text-[12px] text-white/40 font-medium mt-0.5 leading-snug">
                  서비스 이용약관 및 개인정보처리방침에 동의합니다.
                </p>
              </div>
            </label>

            {/* Terms links */}
            <div className="flex justify-center gap-6 pt-1">
              <Link href="/terms/service" className="text-[12px] text-white/40 font-bold hover:text-white/70 underline underline-offset-4 transition-colors">이용약관</Link>
              <Link href="/terms/privacy" className="text-[12px] text-white/40 font-bold hover:text-white/70 underline underline-offset-4 transition-colors">개인정보처리방침</Link>
            </div>

            {/* Guest Login for Reviewers */}
            <div className="flex flex-col items-center gap-1.5 mt-3 pt-3 border-t border-white/10">
              <button
                onClick={handleGuestLogin}
                disabled={isLoading}
                className="text-[13px] font-black text-white/50 hover:text-indigo-400 transition-colors py-1 cursor-pointer active:scale-95"
              >
                🔍 게스트로 둘러보기 (심사용)
              </button>
              <p className="text-[10px] text-white/30 font-medium select-none">카카오 계정이 없는 해외 심사관 전용 기능입니다.</p>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 mt-1">
              {["🔒 보안 인증", "📊 1만+ 사용자", "⭐ 4.9점"].map(badge => (
                <span key={badge} className="text-[11px] text-white/30 font-bold">{badge}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
