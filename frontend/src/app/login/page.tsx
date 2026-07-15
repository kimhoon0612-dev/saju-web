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
    const KAKAO_REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY || "";
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
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #F8F9FA 0%, #EEF2FF 50%, #F8F9FA 100%)" }}
    >
      {/* Decorative background orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-violet-100/60 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-indigo-100/50 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-48 h-48 bg-amber-100/40 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">

        {/* Logo / Hero */}
        <div className="flex flex-col items-center mb-10 animate-fade-in-up">
          {/* Owl icon with glow */}
          <div
            className="w-24 h-24 rounded-[28px] flex items-center justify-center mb-5 shadow-[0_8px_32px_rgba(99,102,241,0.18)]"
            style={{ background: "linear-gradient(135deg, #ffffff 0%, #f0f0ff 100%)", border: "1.5px solid rgba(99,102,241,0.12)" }}
          >
            <span className="text-5xl">🦉</span>
          </div>

          <h1 className="text-[32px] font-black text-gray-900 mb-1 tracking-tight">명리박사</h1>
          <p className="text-[15px] text-gray-500 font-medium text-center leading-relaxed">
            당신의 운명을 꿰뚫는<br />단 하나의 지침서
          </p>
        </div>

        {isLoggedIn ? (
          /* Already logged in state */
          <div className="w-full flex flex-col gap-3 animate-scale-in">
            <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
                <span className="text-3xl">👋</span>
              </div>
              <div className="text-center">
                <h2 className="text-[18px] font-black text-gray-900 mb-1">이미 로그인 중입니다</h2>
                <p className="text-[13px] text-gray-500 font-medium">로그아웃하면 데이터가 초기화됩니다.</p>
              </div>
              <button
                onClick={() => router.push("/")}
                className="w-full h-12 btn-primary rounded-[14px] text-[15px] font-black tracking-tight"
                disabled={isLoading}
              >
                메인 화면으로
              </button>
              
              <div className="w-full flex flex-col gap-2 mt-2 pt-2 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full h-11 bg-gray-50 text-gray-700 rounded-[14px] text-[14px] font-bold border border-gray-200 transition-all hover:bg-gray-100"
                  disabled={isLoading}
                >
                  로그아웃
                </button>
                <button
                  onClick={handleWithdrawal}
                  className="w-full h-11 bg-red-50 text-red-500 rounded-[14px] text-[13px] font-bold border border-red-100 transition-all hover:bg-red-100"
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
              className={`w-full h-[56px] rounded-[16px] flex items-center justify-center font-black text-[16px] tracking-tight transition-all relative shadow-md active:scale-95 ${
                !termsAgreed
                  ? "opacity-40 cursor-not-allowed bg-[#FEE500] text-black"
                  : "bg-[#FEE500] text-black hover:shadow-lg hover:-translate-y-0.5"
              }`}
              style={{ boxShadow: termsAgreed ? "0 4px 18px rgba(254,229,0,0.45)" : undefined }}
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
            <label className={`flex items-start gap-3 bg-white rounded-[18px] p-4 cursor-pointer transition-all border ${termsAgreed ? "border-indigo-400 shadow-[0_0_0_3px_rgba(99,102,241,0.12)]" : "border-gray-100 shadow-sm hover:border-gray-200"}`}>
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${termsAgreed ? "bg-indigo-500" : "border-2 border-gray-300 bg-white"}`}>
                  {termsAgreed && (
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <p className={`text-[13px] font-black ${termsAgreed ? "text-indigo-700" : "text-gray-700"}`}>
                  [필수] 만 14세 이상이며, 약관에 동의합니다.
                </p>
                <p className="text-[12px] text-gray-400 font-medium mt-0.5 leading-snug">
                  서비스 이용약관 및 개인정보처리방침에 동의합니다.
                </p>
              </div>
            </label>

            {/* Terms links */}
            <div className="flex justify-center gap-6 pt-1">
              <Link href="/terms/service" className="text-[12px] text-gray-400 font-bold hover:text-gray-600 underline underline-offset-4 transition-colors">이용약관</Link>
              <Link href="/terms/privacy" className="text-[12px] text-gray-400 font-bold hover:text-gray-600 underline underline-offset-4 transition-colors">개인정보처리방침</Link>
            </div>

            {/* Guest Login for Reviewers */}
            <div className="flex flex-col items-center gap-1.5 mt-3 pt-3 border-t border-gray-100/60">
              <button
                onClick={handleGuestLogin}
                disabled={isLoading}
                className="text-[13px] font-black text-gray-500 hover:text-indigo-600 transition-colors py-1 cursor-pointer active:scale-95"
              >
                🔍 게스트로 둘러보기 (심사용)
              </button>
              <p className="text-[10px] text-gray-400 font-medium select-none">카카오 계정이 없는 해외 심사관 전용 기능입니다.</p>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 mt-1">
              {["🔒 보안 인증", "📊 1만+ 사용자", "⭐ 4.9점"].map(badge => (
                <span key={badge} className="text-[11px] text-gray-400 font-bold">{badge}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
