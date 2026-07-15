"use client";

import React, { useEffect, useRef, useState } from 'react';
import { loadPaymentWidget, PaymentWidgetInstance } from '@tosspayments/payment-widget-sdk';
import { X } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    coinAmount: number;
    bonusCoins: number;
    price: number;
    packageName: string;
}

// TODO: Replace with your actual Toss Client Key
const TOSS_CLIENT_KEY = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
const CUSTOMER_KEY = "dummy-customer-key-" + Math.random().toString(36).substring(2, 11);

export default function PaymentModal({ isOpen, onClose, coinAmount, bonusCoins, price, packageName }: PaymentModalProps) {
    const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
    const paymentMethodsWidgetRef = useRef<any>(null);
    const [isWidgetLoaded, setIsWidgetLoaded] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        const initializeWidget = async () => {
            try {
                // Load Toss Payment Widget
                const paymentWidget = await loadPaymentWidget(TOSS_CLIENT_KEY, CUSTOMER_KEY);
                
                // Render Payment Methods
                const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
                    '#payment-widget',
                    { value: price },
                    { variantKey: 'DEFAULT' }
                );

                // Render specific Toss agreement UI
                paymentWidget.renderAgreement(
                    '#agreement-widget',
                    { variantKey: 'AGREEMENT' }
                );

                paymentWidgetRef.current = paymentWidget;
                paymentMethodsWidgetRef.current = paymentMethodsWidget;
                setIsWidgetLoaded(true);
            } catch (error) {
                console.error("Toss SDK Load Error:", error);
            }
        };

        initializeWidget();
    }, [isOpen, price]);

    const handlePaymentRequest = async () => {
        const paymentWidget = paymentWidgetRef.current;
        if (!paymentWidget) return;

        try {
            // Generate unique order ID
            const orderId = `toss_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            
            // Redirect URL calculation (we redirect to /store to handle the query parameters)
            const baseUrl = window.location.origin;
            const successUrl = `${baseUrl}/store?tossSuccess=true&reward=${coinAmount + bonusCoins}`;
            const failUrl = `${baseUrl}/store?tossFail=true`;

            await paymentWidget.requestPayment({
                orderId: orderId,
                orderName: packageName,
                successUrl: successUrl,
                failUrl: failUrl,
                customerEmail: "customer@example.com",
                customerName: "Saju User",
            });
        } catch (error) {
            console.error("Payment Request Exception:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[85vh] max-h-[800px]">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-bold tracking-tight text-[#2D3748]">토스페이먼츠 결제</h2>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="bg-yellow-50/80 border border-yellow-200 rounded-2xl p-5 text-center">
                        <p className="text-sm font-bold text-yellow-700 mb-1">{packageName}</p>
                        <p className="text-2xl font-black text-gray-800">{price.toLocaleString()} 원</p>
                        <p className="text-xs text-gray-500 mt-2">지급 코인: {coinAmount} C {bonusCoins > 0 && `(+ 보너스 ${bonusCoins} C)`}</p>
                    </div>

                    {!isWidgetLoaded && (
                        <div className="h-48 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                            <span className="ml-3 text-sm text-gray-500 font-medium">결제 모듈 불러오는 중...</span>
                        </div>
                    )}
                    
                    <div id="payment-widget" className="w-full" />
                    <div id="agreement-widget" className="w-full" />
                </div>

                {/* Footer Action */}
                <div className="p-5 border-t border-gray-100 bg-white">
                    <button 
                        onClick={handlePaymentRequest}
                        disabled={!isWidgetLoaded}
                        className="w-full bg-[#3182F6] hover:bg-[#2B73DA] text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 text-lg flex items-center justify-center gap-2"
                    >
                        {price.toLocaleString()}원 안전결제하기
                    </button>
                    <p className="text-center text-[10px] text-gray-400 mt-3 font-medium">
                        결제 진행 시 토스페이먼츠 보안 환경으로 이동합니다.<br />
                        테스트 환경이므로 실제 과금되지 않습니다.
                    </p>
                </div>
            </div>
        </div>
    );
}
