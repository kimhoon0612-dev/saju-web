"use client";

import React, { useState } from 'react';
import { X, ChevronLeft, Star, Heart, Share2, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ProductModalProps {
    product: {
        id: string;
        name: string;
        description: string;
        price: number;
        imageUrl: string;
        original_price?: number;
        sales_tags?: string;
    };
    onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
    const [step, setStep] = useState<"detail" | "checkout" | "complete">("detail");
    const [activeTab, setActiveTab] = useState("info");
    const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
    const [error, setError] = useState<string | null>(null);

    const handleBuyClick = () => {
        setStep("checkout");
    };

    const handlePaymentSubmit = () => {
        if (!formData.name || !formData.phone || !formData.address) {
            setError("배송지 정보를 모두 입력해주세요.");
            return;
        }
        setError(null);
        // Mock API Call overhead here
        setTimeout(() => setStep("complete"), 800);
    };



    return (
        <div className="fixed inset-0 z-50 bg-white font-pretendard flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-300">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-40 bg-white px-4 h-14 flex items-center justify-between border-b border-gray-100">
                <button onClick={step === "detail" ? onClose : () => setStep("detail")} className="p-2 -ml-2 text-gray-800">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3 text-gray-700">
                    <button className="p-1"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg></button>
                    <button className="p-1"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-cart"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg></button>
                </div>
            </div>

            {/* Main Scrolling Content */}
            <div className="flex-1 overflow-y-auto pb-[90px] bg-[#F8F9FA]">
                {step === "detail" && (
                    <div className="bg-white pb-10">
                        {/* Product Image */}
                        <div className="w-full aspect-square bg-[#1A1A1A] relative flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/60 z-10"></div>
                            <img src={product.imageUrl} alt={product.name} className="w-[80%] h-auto object-contain relative z-20 drop-shadow-2xl" />
                        </div>

                        {/* Product Info Summary */}
                        <div className="p-5">
                            {product.sales_tags && (
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {product.sales_tags.split(',').map((tag, i) => (
                                        <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-black leading-none bg-red-100 text-red-600 border border-red-200">
                                            {tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <h1 className="text-[22px] font-bold text-gray-900 leading-[1.3] tracking-tight mb-2 break-keep">
                                {product.name}
                            </h1>

                            <div className="flex items-start justify-between mb-4">
                                <div className="flex flex-col">
                                    {product.original_price && product.original_price > product.price && (
                                        <span className="text-gray-400 text-sm line-through decoration-gray-300 font-medium">
                                            {product.original_price.toLocaleString()}원
                                        </span>
                                    )}
                                    <div className="flex items-baseline gap-2">
                                        {product.original_price && product.original_price > product.price && (
                                            <span className="text-[28px] font-black text-red-500">
                                                {Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                                            </span>
                                        )}
                                        <strong className="text-[28px] font-black text-gray-900 leading-none">
                                            {product.price.toLocaleString()}<span className="text-lg font-bold">원</span>
                                        </strong>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600 p-1 mt-1"><Share2 className="w-6 h-6" /></button>
                            </div>
                            <div className="flex items-center gap-1.5 pb-5 border-b border-gray-100 mt-2">
                                <Star className="w-4 h-4 text-[#FFC107] fill-[#FFC107]" />
                                <span className="text-[14px] font-bold text-gray-800">5.0</span>
                                <span className="text-[14px] font-medium text-gray-500 underline underline-offset-2">후기 4건</span>
                            </div>
                            <div className="pt-3 text-[13px] text-gray-500 font-medium">
                                4명 중 100%가 만족했어요.
                            </div>
                        </div>

                        {/* Sticky Tab Navigation */}
                        <div className="sticky top-14 z-30 bg-white border-b border-gray-100 flex items-center px-5 gap-6 pt-2">
                            {["상품정보", "후기 4", "문의"].map((tab, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveTab(tab === "상품정보" ? "info" : "other")}
                                    className={`pb-3 text-[15px] font-bold transition-colors ${activeTab === "info" && tab === "상품정보" ? "text-gray-900 border-b-2 border-yellow-300" : "text-gray-400"}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Product Rich Description Body (Mock content mimicking the red screenshot) */}
                        {activeTab === "info" && (
                            <div className="bg-[#6B1414] text-white p-6 relative overflow-hidden flex flex-col items-center">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-red-800/20 blur-[50px] rounded-full pointer-events-none" />

                                <div className="text-center mt-8 mb-12 relative z-10">
                                    <div className="text-[32px] font-serif text-[#FFD700] mb-2 tracking-widest">명리학 부적</div>
                                    <div className="text-[14px] text-gray-300 tracking-widest mb-4">맞춤형 기운 보강</div>
                                    <div className="text-[10px] text-gray-400 tracking-[0.2em] mb-4">PREMIUM EDITION</div>
                                    <div className="text-[28px] font-serif text-[#FFD700] border-t border-b border-[#FFD700]/30 py-3 px-6 break-keep">
                                        {product.name}
                                    </div>
                                </div>

                                <img src={product.imageUrl} alt={product.name} className="w-[80%] max-w-[280px] drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative z-10 mb-16" />

                                <div className="text-left w-full space-y-12 relative z-10 px-2 lg:px-8">
                                    <div>
                                        <h3 className="text-[22px] font-bold text-white mb-4 leading-tight break-keep">해당 부적의 효능 및 기운</h3>
                                        <p className="text-[15px] text-gray-300 leading-relaxed font-light break-keep">
                                            {product.description}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-[22px] font-bold text-white mb-4 leading-tight break-keep">신비로운 기운의 상징</h3>
                                        <p className="text-[15px] text-gray-300 leading-relaxed font-light break-keep">
                                            이 부적은 예로부터 전해 내려오는 비전(秘傳)의 방식들을 응용하여, 사용자에게 필요한 기운이 스며들 수 있도록 돕는 상징적인 매개체입니다.<br />
                                            모든 일에 긍정과 열정을 가지고 임할 때, 본 부적이 든든한 조력자 역할을 해줄 것입니다.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Checkout Flow */}
                {step === "checkout" && (
                    <div className="p-5 bg-white min-h-full">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">배송 정보 입력</h2>

                        <div className="p-4 bg-gray-50 rounded-xl mb-6 flex items-center gap-4">
                            <img src={product.imageUrl} className="w-16 h-16 object-cover rounded-lg border border-gray-200 bg-white" alt="thumb" />
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 leading-tight mb-1">{product.name}</h3>
                                <p className="text-[15px] font-black">{product.price.toLocaleString()}원</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">받으시는 분</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="이름을 입력해주세요"
                                    className="w-full h-12 px-4 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">연락처</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="010-0000-0000"
                                    className="w-full h-12 px-4 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">배송지 주소</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="상세 주소를 입력해주세요"
                                    className="w-full h-12 px-4 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="mt-4 text-red-500 text-sm font-bold flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        )}
                    </div>
                )}

                {/* Complete Flow */}
                {step === "complete" && (
                    <div className="p-5 flex flex-col items-center justify-center min-h-[60vh] text-center">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                        <h2 className="text-2xl font-black text-gray-900 mb-2">결제가 완료되었습니다</h2>
                        <p className="text-gray-500 mb-8 font-medium">프리미엄 실물 부적이 곧 배송될 예정입니다.<br />문자로 배송 안내를 도와드리겠습니다.</p>

                        <div className="w-full p-5 bg-gray-50 rounded-2xl text-left border border-gray-100 mb-8">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-500 text-sm">결제 금액</span>
                                <span className="text-gray-900 font-bold text-sm">{product.price.toLocaleString()}원</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 text-sm">배송지</span>
                                <span className="text-gray-900 font-bold text-sm truncate max-w-[60%]">{formData.address}</span>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full h-14 bg-gray-900 text-white font-bold rounded-xl text-[16px]"
                        >
                            쇼핑 계속하기
                        </button>
                    </div>
                )}
            </div>

            {/* Fixed Bottom Buy Button (Only visible on Detail & Checkout) */}
            {step !== "complete" && (
                <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-100 pb-safe z-50 flex gap-2">
                    {step === "detail" ? (
                        <>
                            <button className="w-14 h-[54px] items-center justify-center flex flex-col bg-white border border-gray-200 text-gray-500 font-bold text-[10px] rounded-[12px] shadow-sm hover:bg-gray-50 transition-all shrink-0">
                                <Heart className="w-6 h-6 mb-0.5 text-gray-400" />
                                찜
                            </button>
                            <button
                                onClick={handleBuyClick}
                                className="flex-1 h-[54px] bg-[#03C75A] text-white font-black text-[18px] rounded-[12px] shadow-md hover:bg-[#02b350] active:scale-[0.98] transition-all"
                            >
                                구매하기
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handlePaymentSubmit}
                            className="w-full h-[54px] bg-blue-600 text-white font-bold text-[16px] rounded-[12px] shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:bg-blue-700 active:scale-[0.98] transition-all"
                        >
                            {product.price.toLocaleString()}원 결제하기
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
