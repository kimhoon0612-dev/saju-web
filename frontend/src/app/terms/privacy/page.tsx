import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
    return (
        <div className="font-pretendard bg-[#F8F9FA] min-h-screen text-gray-900 pb-20">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md px-4 py-3 sticky top-0 z-50 flex items-center border-b border-gray-100">
                <Link href="/login" className="p-2 -ml-2 text-gray-800">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="font-black text-lg text-gray-900 ml-2">개인정보처리방침</h1>
            </header>

            {/* Content */}
            <main className="px-5 pt-6 flex flex-col gap-6 max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-400 mb-6">[시행일자: 2026. 03. 29]</p>
                    
                    <h2 className="text-md font-bold text-gray-900 mb-2">1. 수집하는 개인정보의 항목 및 수집방법</h2>
                    <p className="text-[13px] text-gray-600 leading-relaxed break-keep mb-6">
                        회사는 회원가입, 원활한 고객상담, 운세 서비스의 본질적 기능 제공을 위해 아래와 같은 개인정보를 수집하고 있습니다.<br/>
                        - <strong>필수항목</strong>: 로그인 식별자(카카오/Apple 고유 토큰), 생년월일, 태어난 시간, 성별, 이름(또는 닉네임)<br/>
                        - <strong>선택항목</strong>: 관상 및 손금 분석을 위한 이미지 데이터(분석 직후 폐기됨)<br/>
                        - <strong>자동수집</strong>: IP주소, 쿠키, 결제 기록, 서비스 이용기록
                    </p>

                    <h2 className="text-md font-bold text-gray-900 mb-2">2. 개인정보의 수집 및 이용 목적</h2>
                    <p className="text-[13px] text-gray-600 leading-relaxed break-keep mb-6">
                        - <strong>서비스 제공</strong>: 맞춤형 사주/타로/관상 분석 결과 도출, 구매 및 요금 결제, 유료 컨텐츠 제공<br/>
                        - <strong>회원 관리</strong>: 본인 식별, 불량 회원의 부정 이용 금지와 비인가 사용 방지, 고지사항 전달
                    </p>

                    <h2 className="text-md font-bold text-gray-900 mb-2">3. 개인정보의 보유 및 이용기간</h2>
                    <p className="text-[13px] text-gray-600 leading-relaxed break-keep mb-6">
                        원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 회사는 아래와 같이 관계법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.<br/>
                        - 대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)<br/>
                        - 소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)<br/>
                        - 로그인 등 웹사이트 방문기록: 3개월 (통신비밀보호법)
                    </p>

                    <h2 className="text-md font-bold text-gray-900 mb-2">4. 개인정보의 제3자 제공</h2>
                    <p className="text-[13px] text-gray-600 leading-relaxed break-keep mb-6">
                        회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.<br/>
                        - 인공지능 분석 처리 위탁: Google Gemini API (이미지 및 생년 정보 익명화 후 전송)<br/>
                        - 법령의 규정에 의거하거나 수사 목적으로 수사기관의 요구가 있는 경우
                    </p>

                    <h2 className="text-md font-bold text-gray-900 mb-2">5. 정보주체의 권리 및 행사방법</h2>
                    <p className="text-[13px] text-gray-600 leading-relaxed break-keep">
                        이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며 가입해지를 요청할 수도 있습니다. 권리 행사는 '마이페이지 &gt; 회원탈퇴' 를 클릭하여 본인 확인 절차를 거치신 후 직접 열람, 정정 또는 탈퇴가 가능합니다.
                    </p>
                </div>
            </main>
        </div>
    );
}
