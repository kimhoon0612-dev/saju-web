"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Share2, Star, Clock, Volume2, Heart, Bell } from 'lucide-react';
import { cn } from './DestinyMatrixCard';

export interface Expert {
    expert_id: number;
    category: string;
    display_name: string;
    code: string;
    tags: string[];
    rating: number;
    reviews: number;
    avg_minutes: number;
    total_consults: number;
    image_url: string;
    is_online: boolean;
    banner_text?: string;
    is_free_available?: boolean;
}

interface Props {
    expert: Expert;
    onClose: () => void;
}

export default function ExpertProfileModal({ expert, onClose }: Props) {
    const [activeTab, setActiveTab] = useState("소개");
    const [isLiked, setIsLiked] = useState(false);

    // Handle browser back button to close modal instead of navigating back to previous page
    useEffect(() => {
        // Push a new state into history when modal opens
        window.history.pushState({ modal: 'expert-profile' }, '');

        const handlePopState = (e: PopStateEvent) => {
            // If the user clicks back, this event fires. We call onClose instead of navigating.
            onClose();
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
            // If the modal unmounts normally (not via back button), we should back out our fake state
            // Unfortunately there's no perfect way to know, but we wait for the parent to remove us.
        };
    }, [onClose]);

    // Handle custom back button in header
    const handleClose = () => {
        // Pop the state we pushed
        window.history.back();
        // The popstate listener will trigger onClose
    };

    // Mock data for modal content
    const recentReviews = [
        { name: "김**", rating: 5, text: "항상 안좋은쪽으로는 정확하셔서 슬퍼요 ㅠㅠ" },
        { name: "최**", rating: 5, text: "오랜만이었어요! 중요한 순간을..." },
    ];

    return (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col animate-in slide-in-from-right-full duration-300">
            {/* Header */}
            <header className="flex items-center justify-between px-4 h-14 border-b border-gray-100 bg-white shrink-0">
                <button onClick={handleClose} className="p-2 -ml-2 text-gray-800">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-[16px] font-bold text-gray-900">
                    {expert.display_name} ({expert.code})
                </h1>
                <button className="p-2 -mr-2 text-gray-800">
                    <Share2 className="w-5 h-5" />
                </button>
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto w-full bg-[#f8f9fa] pb-24">
                {/* Top Profile Area */}
                <div className="bg-white px-5 pt-6 pb-6 mb-2">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className={cn(
                                    "text-[16px] font-black",
                                    expert.category === '신점' ? "text-red-500" :
                                        expert.category === '운세' ? "text-green-600" :
                                            "text-purple-500"
                                )}>{expert.category}</span>
                                <h2 className="text-[22px] font-black tracking-tight text-gray-900">{expert.display_name}</h2>
                            </div>
                            <p className="text-[14px] text-gray-500 font-medium mb-3">
                                평균 {expert.avg_minutes}분, 누적 {expert.total_consults.toLocaleString()}회
                            </p>
                            <div className="flex items-center gap-1.5 text-gray-500">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-[13px] font-medium">고정시간 없이 상시 대기중</span>
                            </div>
                        </div>
                        <div className="w-[84px] h-[84px] rounded-[30px] overflow-hidden bg-gray-100 border border-gray-100">
                            <img src={expert.image_url} alt={expert.display_name} className="w-full h-full object-cover" />
                        </div>
                    </div>

                    <div className="w-full h-[1px] bg-gray-100 mb-5"></div>

                    {/* Rating & Reviews Preview */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                                <Star className="w-5 h-5 text-red-500 fill-red-500" />
                                <span className="text-[20px] font-black text-gray-900">{expert.rating}</span>
                                <span className="text-[15px] font-bold text-gray-600">({expert.reviews.toLocaleString()}건)</span>
                            </div>
                            <button className="flex items-center text-[13px] font-medium text-gray-400">
                                전체보기 &gt;
                            </button>
                        </div>
                        <p className="text-[13px] text-gray-400 font-medium mb-4">
                            {expert.reviews}명중 94.4%가 만족했어요.
                        </p>

                        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                            {recentReviews.map((rev, idx) => (
                                <div key={idx} className="min-w-[200px] bg-white border border-gray-200 rounded-xl p-4 shadow-sm snap-start">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[14px] font-bold text-gray-900">{rev.name}</span>
                                        <div className="flex items-center gap-0.5">
                                            <Star className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                                            <span className="text-[13px] font-bold text-gray-900">{rev.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-[13px] text-gray-500 leading-snug line-clamp-2">
                                        {rev.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sticky Tabs */}
                <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
                    <div className="flex">
                        {["소개", `후기${expert.reviews}`, "고민상담"].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "flex-1 py-4 text-[15px] font-bold text-center border-b-[3px] transition-colors",
                                    activeTab === tab
                                        ? "border-gray-900 text-gray-900"
                                        : "border-transparent text-gray-400"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content: 소개 */}
                {activeTab === "소개" && (
                    <div className="bg-white px-5 py-8 flex flex-col gap-10">
                        {/* 전문 상담 분야 */}
                        <section>
                            <h3 className="text-[17px] font-black text-gray-900 mb-4">전문 상담 분야</h3>
                            <div className="flex flex-wrap gap-2">
                                {expert.tags.map(tag => (
                                    <span key={tag} className="border border-gray-200 text-gray-600 text-[14px] font-medium px-4 py-2 rounded-full">
                                        {tag.replace('#', '')}
                                    </span>
                                ))}
                            </div>
                        </section>

                        <div className="w-full h-[1px] bg-gray-100"></div>

                        {/* 상담사 한마디 */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <h3 className="text-[17px] font-black text-gray-900">상담사 한마디</h3>
                                <button className="flex items-center gap-1 border border-gray-200 rounded-full px-3 py-1 text-[12px] font-bold text-gray-600">
                                    상담사 음성 <Volume2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <p className="text-[15px] text-gray-800 leading-relaxed break-keep">
                                혼자인 듯 혼자가 아닌 여러분의 이야기에 진실로 대하고, 최선으로 마주하며, 진심으로 귀 기울이겠습니다. 보이지 않았던 마음 속 이야기를 풀어드리겠습니다. 여러분이 문을 여는 그 순간 마음속 시선은 달라질 것입니다. 여러분을 위한 따뜻한 휴식처가 되어 드리겠습니다.
                            </p>
                        </section>

                        <div className="w-full h-[1px] bg-gray-100"></div>

                        {/* 경력 */}
                        <section>
                            <h3 className="text-[17px] font-black text-gray-900 mb-4">경력</h3>
                            <ul className="flex flex-col gap-3">
                                <li className="flex items-start gap-2 text-[15px] text-gray-800">
                                    <span className="mt-2 w-1 h-1 bg-gray-800 rounded-full shrink-0"></span>
                                    한양대 컬러코칭과정 수료
                                </li>
                                <li className="flex items-start gap-2 text-[15px] text-gray-800">
                                    <span className="mt-2 w-1 h-1 bg-gray-800 rounded-full shrink-0"></span>
                                    타로상담사 1 · 2급
                                </li>
                                <li className="flex items-start gap-2 text-[15px] text-gray-800">
                                    <span className="mt-2 w-1 h-1 bg-gray-800 rounded-full shrink-0"></span>
                                    분노관리사 1급
                                </li>
                            </ul>
                        </section>

                        <div className="w-full h-[1px] bg-gray-100"></div>

                        {/* 상담사 인터뷰 */}
                        <section>
                            <h3 className="text-[17px] font-black text-gray-900 mb-6">상담사 인터뷰</h3>

                            <div className="flex flex-col gap-6">
                                {/* Q1 */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-7 h-7 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-[13px] shrink-0 mt-0.5">Q</div>
                                        <p className="text-[16px] font-bold text-gray-900 leading-snug">자기소개를 해주세요!</p>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-7 h-7 bg-yellow-300 text-yellow-900 rounded-full flex items-center justify-center font-bold text-[13px] shrink-0 mt-0.5">A</div>
                                        <p className="text-[15px] text-gray-700 leading-relaxed font-medium">
                                            안녕하세요.<br />
                                            저는 {expert.category} 상담사 {expert.display_name} 이라고 합니다.<br /><br />
                                            {expert.category} 이외에도 그림과 글 작업을 하는 작가로서 활동하고 있어요.
                                        </p>
                                    </div>
                                </div>

                                <div className="w-full border-t border-dashed border-gray-200"></div>

                                {/* Q2 */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-7 h-7 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-[13px] shrink-0 mt-0.5">Q</div>
                                        <p className="text-[16px] font-bold text-gray-900 leading-snug">{expert.category}를 처음 접하게 된 계기가 있었나요?</p>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-7 h-7 bg-yellow-300 text-yellow-900 rounded-full flex items-center justify-center font-bold text-[13px] shrink-0 mt-0.5">A</div>
                                        <p className="text-[15px] text-gray-700 leading-relaxed font-medium">
                                            전시 미팅 자리에 다른 작가님께서 {expert.category}를 가지고 오신 적이 있어요.<br />
                                            그때 그 작가님께서 봐주셨는데 너무 재밌더라고요.<br />
                                            그래서 처음 배워보고 싶다고 생각하게 됐어요.<br />
                                            글을 쓰면 책을 내고 싶고 그림을 그리면 전시하고 싶다는 생각이 들잖아요?<br />
                                            그런 것처럼 배우니까 자연스레 상담도 하게 된 것 같습니다.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-200 px-4 py-3 flex gap-3 z-50 pb-safe">
                <button
                    onClick={() => setIsLiked(!isLiked)}
                    className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl px-5 h-14 bg-gray-50 flex-shrink-0 active:bg-gray-100 transition-colors"
                >
                    <Heart className={cn("w-6 h-6", isLiked ? "text-red-500 fill-red-500" : "text-gray-500")} />
                    <span className="text-[15px] font-bold text-gray-700">270</span>
                </button>
                <button
                    className="flex-1 flex items-center justify-center gap-1.5 border border-gray-800 rounded-xl h-14 bg-white active:bg-gray-50 transition-colors"
                    onClick={() => alert('상담이 시작됩니다! (기능 준비 중)')}
                >
                    {expert.is_online ? (
                        <>
                            <span className="text-[16px] font-bold text-gray-900">바로 상담하기</span>
                        </>
                    ) : (
                        <>
                            <Bell className="w-5 h-5 text-gray-800" />
                            <span className="text-[16px] font-bold text-gray-900">상담 가능 시 알림 받기</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
