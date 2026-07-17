import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
    return (
        <div className="font-pretendard bg-[#F8F9FA] min-h-screen text-gray-900 pb-20">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md px-4 py-3 sticky top-0 z-50 flex items-center border-b border-gray-100">
                <Link href="/login" className="p-2 -ml-2 text-gray-800">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="font-black text-lg text-gray-900 ml-2">서비스 이용약관</h1>
            </header>

            {/* Content */}
            <main className="px-5 pt-6 flex flex-col gap-6 max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-400 mb-6">[시행일자: 2026. 03. 29]</p>
                    
                    <h2 className="text-md font-bold text-gray-900 mb-2">제1조 (목적)</h2>
                    <p className="text-[13px] text-gray-600 leading-relaxed break-keep mb-6">
                        본 약관은 "세상의 모든 사주팔자"(이하 "회사")가 제공하는 사주, 타로, 관상 등 운세 관련 서비스(이하 "서비스")를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
                    </p>

                    <h2 className="text-md font-bold text-gray-900 mb-2">제2조 (용어의 정의)</h2>
                    <p className="text-[13px] text-gray-600 leading-relaxed break-keep mb-6">
                        1. "이용자"란 회사 서비스에 접속하여 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.<br />
                        2. "회원"이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며 서비스를 계속적으로 이용할 수 있는 자를 말합니다.<br />
                        3. "코인"이란 서비스 내에서 유료 콘텐츠(부적, 상담 등)를 구매할 수 있는 가상 화폐를 말합니다.
                    </p>

                    <h2 className="text-md font-bold text-gray-900 mb-2">제3조 (약관의 효력 및 변경)</h2>
                    <p className="text-[13px] text-gray-600 leading-relaxed break-keep mb-6">
                        회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다. 회사는 합리적인 사유가 발생할 경우 관련 법령에 위배되지 않는 범위 내에서 약관을 개정할 수 있습니다.
                    </p>

                    <h2 className="text-md font-bold text-gray-900 mb-2">제4조 (이용계약의 체결 및 서비스 연령 제한)</h2>
                    <p className="text-[13px] text-gray-600 leading-relaxed break-keep mb-6">
                        본 서비스는 만 14세 이상 이용자를 대상으로 제공되며, 만 14세 미만 아동은 서비스이용 요건을 불충족하므로 가입 및 결제가 제한됩니다.
                    </p>

                    <h2 className="text-md font-bold text-gray-900 mb-2">제5조 (코인정책 및 유료 결제 규정)</h2>
                    <p className="text-[13px] text-gray-600 leading-relaxed break-keep mb-6">
                        코인은 회사가 정한 지불 수단 및 결제 방식을 따라 구매할 수 있습니다. 유료 결제 후 디지털 재화의 특성상 본인이 구매한 부적/분석서의 조회가 완료된 시점 이후로는 원칙적으로 환불이 불가능합니다. 단, 앱 내 기술적 오류로 분석 불능 상황이 발생 시 구매액 상당의 코인으로 보상 지급됩니다.
                    </p>

                    <h2 className="text-md font-bold text-gray-900 mb-2">제6조 (AI 결과의 불명확성 면책)</h2>
                    <p className="text-[13px] text-gray-600 leading-relaxed break-keep">
                        본 서비스는 AI(인공지능)를 활용한 명리학적 해석을 제공하는 엔터테인먼트 목적의 콘텐츠입니다. 기술의 한계로 인해 운세 및 결과 풀이가 현실과 항상 일치하지 않을 수 있으며, 회사는 본 결과를 바탕으로 한 사용자의 중요한 결정 및 손해에 대해 법적 책임을 지지 않습니다.
                    </p>
                </div>
            </main>
        </div>
    );
}
