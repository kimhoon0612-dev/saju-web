"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function KakaoCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  
  // Prevent strict mode double-firing
  const isProcessing = useRef(false);

  useEffect(() => {
    if (isProcessing.current) return;
    
    const code = searchParams.get("code");
    
    if (!code) {
      setError("카카오 인증 코드를 받지 못했습니다. 다시 시도해 주세요.");
      return;
    }

    const exchangeCodeForToken = async () => {
      isProcessing.current = true;
      try {
        const redirect_uri = window.location.origin + "/auth/kakao/callback";
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

        const response = await fetch(`${apiUrl}/api/auth/kakao`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: code,
            redirect_uri: redirect_uri
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || "카카오 로그인 연동 실패");
        }

        const data = await response.json();
        
        // Save the real issued JWT token
        localStorage.setItem("access_token", data.access_token);
        
        // Redirect to main app
        router.push("/");
        
      } catch (err: any) {
        console.error("Kakao Login Error:", err);
        setError(err.message || "카카오 로그인 중 오류가 발생했습니다.");
      }
    };

    exchangeCodeForToken();
  }, [searchParams, router]);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#F7F7F7]">
      {error ? (
        <div className="flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl shadow-sm mx-4">
          <h2 className="text-xl font-bold text-red-500 mb-2">로그인 실패</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-black text-white rounded-xl font-bold active:scale-95 transition-transform"
          >
            로그인 화면으로 돌아가기
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#FEE500] border-t-transparent rounded-full animate-spin mb-4" />
          <h2 className="text-xl font-bold font-pretendard text-gray-800">카카오 로그인 중입니다...</h2>
          <p className="text-gray-500 mt-2 text-sm">잠시만 기다려주세요</p>
        </div>
      )}
    </div>
  );
}

export default function KakaoCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#F7F7F7]">
        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#FEE500] border-t-transparent rounded-full animate-spin mb-4" />
          <h2 className="text-xl font-bold font-pretendard text-gray-800">카카오 로그인 준비 중...</h2>
        </div>
      </div>
    }>
      <KakaoCallbackHandler />
    </Suspense>
  );
}
