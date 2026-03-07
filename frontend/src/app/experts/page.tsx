"use client";

import React, { useState, useEffect } from 'react';
import { Star, ChevronDown, Heart, Search, User, TicketPercent } from 'lucide-react';
import { cn } from '../../components/DestinyMatrixCard';
import ExpertProfileModal, { Expert } from '../../components/ExpertProfileModal';
import Link from 'next/link';

const mockExperts: Expert[] = [
    // --- 운세 (Saju/Fortune) 10명 ---
    {
        expert_id: 1, category: '운세', display_name: '예화', code: '002',
        tags: ['#종합운세', '#궁합', '#택일', '#학업', '#취업', '#사주'],
        rating: 4.8, reviews: 3610, avg_minutes: 14, total_consults: 9999,
        image_url: 'https://i.pravatar.cc/150?img=5',
        is_online: true, banner_text: '선착순 4명 남음', is_free_available: true
    },
    {
        expert_id: 2, category: '운세', display_name: '백산도사', code: '105',
        tags: ['#종합운세', '#부동산', '#금전운', '#사업'],
        rating: 4.9, reviews: 2150, avg_minutes: 16, total_consults: 8400,
        image_url: 'https://i.pravatar.cc/150?img=11',
        is_online: true, is_free_available: false
    },
    {
        expert_id: 3, category: '운세', display_name: '나무하트명리', code: '199',
        tags: ['#단기운세', '#궁합', '#학업', '#취업', '#건강'],
        rating: 4.7, reviews: 120, avg_minutes: 12, total_consults: 850,
        image_url: 'https://i.pravatar.cc/150?img=15',
        is_online: false, banner_text: '부재중', is_free_available: false
    },
    {
        expert_id: 4, category: '운세', display_name: '청운당', code: '307',
        tags: ['#신년운세', '#성격', '#대인관계'],
        rating: 5.0, reviews: 540, avg_minutes: 10, total_consults: 1200,
        image_url: 'https://i.pravatar.cc/150?img=33',
        is_online: true, is_free_available: true
    },
    {
        expert_id: 5, category: '운세', display_name: '해의기운', code: '401',
        tags: ['#사주풀이', '#직장', '#승진', '#이직'],
        rating: 4.6, reviews: 890, avg_minutes: 15, total_consults: 3200,
        image_url: 'https://i.pravatar.cc/150?img=47',
        is_online: true, banner_text: '대기열 적음', is_free_available: false
    },
    {
        expert_id: 6, category: '운세', display_name: '별길', code: '505',
        tags: ['#명리학', '#사주명리', '#성공운'],
        rating: 4.8, reviews: 1100, avg_minutes: 13, total_consults: 4100,
        image_url: 'https://i.pravatar.cc/150?img=52',
        is_online: false, is_free_available: true
    },
    {
        expert_id: 7, category: '운세', display_name: '송암', code: '612',
        tags: ['#정통사주', '#작명', '#개명'],
        rating: 4.9, reviews: 3200, avg_minutes: 18, total_consults: 11000,
        image_url: 'https://i.pravatar.cc/150?img=59',
        is_online: true, is_free_available: false
    },
    {
        expert_id: 8, category: '운세', display_name: '예지당', code: '710',
        tags: ['#연애운', '#재물운', '#사주'],
        rating: 4.7, reviews: 950, avg_minutes: 11, total_consults: 2800,
        image_url: 'https://i.pravatar.cc/150?img=65',
        is_online: true, banner_text: '빠른 상담', is_free_available: true
    },
    {
        expert_id: 9, category: '운세', display_name: '연화', code: '840',
        tags: ['#사주', '#가정', '#부부', '#육아'],
        rating: 4.8, reviews: 1450, avg_minutes: 14, total_consults: 5000,
        image_url: 'https://i.pravatar.cc/150?img=68',
        is_online: true, is_free_available: false
    },
    {
        expert_id: 10, category: '운세', display_name: '청명', code: '903',
        tags: ['#사주명리', '#궁합', '#사업운', '#재물'],
        rating: 4.9, reviews: 4100, avg_minutes: 20, total_consults: 14000,
        image_url: 'https://i.pravatar.cc/150?img=12',
        is_online: true, banner_text: '인기 상담사', is_free_available: true
    },

    // --- 타로 (Tarot) 10명 ---
    {
        expert_id: 11, category: '타로', display_name: '로제타로', code: '031',
        tags: ['#연애타로', '#속마음', '#재회'],
        rating: 4.9, reviews: 4500, avg_minutes: 12, total_consults: 15000,
        image_url: 'https://i.pravatar.cc/150?img=1',
        is_online: true, banner_text: '선착순 2명 남음', is_free_available: true
    },
    {
        expert_id: 12, category: '타로', display_name: '수비', code: '112',
        tags: ['#타로', '#심리상담', '#대인관계', '#고민'],
        rating: 4.8, reviews: 1800, avg_minutes: 15, total_consults: 6000,
        image_url: 'https://i.pravatar.cc/150?img=9',
        is_online: true, is_free_available: false
    },
    {
        expert_id: 13, category: '타로', display_name: '안젤라', code: '243',
        tags: ['#타로', '#연애', '#재회', '#썸'],
        rating: 4.7, reviews: 900, avg_minutes: 10, total_consults: 3100,
        image_url: 'https://i.pravatar.cc/150?img=16',
        is_online: false, is_free_available: true
    },
    {
        expert_id: 14, category: '타로', display_name: '셀레나', code: '351',
        tags: ['#직장인타로', '#이직', '#진로', '#적성'],
        rating: 5.0, reviews: 750, avg_minutes: 14, total_consults: 2300,
        image_url: 'https://i.pravatar.cc/150?img=20',
        is_online: true, banner_text: '예리한 통찰력', is_free_available: false
    },
    {
        expert_id: 15, category: '타로', display_name: '비너스', code: '419',
        tags: ['#타로카드', '#금전운', '#사업운'],
        rating: 4.6, reviews: 520, avg_minutes: 11, total_consults: 1400,
        image_url: 'https://i.pravatar.cc/150?img=24',
        is_online: true, is_free_available: true
    },
    {
        expert_id: 16, category: '타로', display_name: '릴리타로', code: '577',
        tags: ['#펫타로', '#반려동물', '#타로상담'],
        rating: 4.9, reviews: 1200, avg_minutes: 16, total_consults: 3800,
        image_url: 'https://i.pravatar.cc/150?img=26',
        is_online: true, banner_text: '반려동물 마음읽기', is_free_available: false
    },
    {
        expert_id: 17, category: '타로', display_name: '스윗베리', code: '608',
        tags: ['#타로점', '#오늘의운세', '#연애타로'],
        rating: 4.8, reviews: 3100, avg_minutes: 9, total_consults: 11500,
        image_url: 'https://i.pravatar.cc/150?img=34',
        is_online: false, is_free_available: true
    },
    {
        expert_id: 18, category: '타로', display_name: '문라이트', code: '722',
        tags: ['#달의기운', '#심리', '#힐링타로'],
        rating: 4.7, reviews: 850, avg_minutes: 18, total_consults: 2600,
        image_url: 'https://i.pravatar.cc/150?img=45',
        is_online: true, is_free_available: false
    },
    {
        expert_id: 19, category: '타로', display_name: '레아', code: '891',
        tags: ['#속마음', '#짝사랑', '#연애상담'],
        rating: 4.9, reviews: 5200, avg_minutes: 12, total_consults: 18000,
        image_url: 'https://i.pravatar.cc/150?img=10',
        is_online: true, banner_text: '압도적 후기', is_free_available: true
    },
    {
        expert_id: 20, category: '타로', display_name: '엘라', code: '999',
        tags: ['#종합타로', '#미래예측', '#운흐름'],
        rating: 4.8, reviews: 2900, avg_minutes: 14, total_consults: 8900,
        image_url: 'https://i.pravatar.cc/150?img=49',
        is_online: true, is_free_available: false
    }
];

export default function ExpertsPage() {
    const [selectedTab, setSelectedTab] = useState("전체");
    const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const tabs = ["전체", "운세", "타로"];

    return (
        <main className="min-h-screen bg-[#F5F6F8] pb-32">

            <div className="bg-white px-4 pt-1 pb-3 flex items-center justify-between">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">상담</h1>
                <div className="p-1.5 border border-gray-200 rounded-lg">
                    <TicketPercent className="w-5 h-5 text-gray-700" />
                </div>
            </div>

            {/* Animated Ad Banner Placeholder */}
            <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 relative overflow-hidden h-48 flex items-center justify-center border-b border-gray-100">

                {/* Background decorative elements */}
                <div className="absolute inset-0 opacity-40">
                    <div className="absolute top-4 left-4 w-16 h-16 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                    <div className="absolute bottom-4 right-4 w-20 h-20 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                {/* Animated animals layer */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -bottom-2 left-10 text-3xl animate-[bounce_3s_ease-in-out_infinite]">🐶</div>
                    <div className="absolute bottom-2 right-16 text-2xl animate-[bounce_2.5s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }}>🐰</div>
                    <div className="absolute top-6 left-1/4 text-2xl animate-[bounce_4s_ease-in-out_infinite]" style={{ animationDelay: '1.2s' }}>🐱</div>
                    <div className="absolute top-10 right-1/4 text-4xl animate-[pulse_3s_ease-in-out_infinite] origin-bottom -rotate-12">🦒</div>
                    <div className="absolute bottom-4 left-1/3 text-2xl animate-[bounce_2.8s_ease-in-out_infinite]" style={{ animationDelay: '1.8s' }}>🐼</div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-sm border border-white/50 text-center mx-4">
                    <span className="inline-block bg-indigo-100 text-indigo-700 text-[11px] font-black px-3 py-1 rounded-full mb-3 tracking-wide">
                        NOTICE
                    </span>
                    <h2 className="text-[20px] font-black text-gray-900 leading-[1.3] tracking-tight mb-1">
                        광고 오픈 준비 중입니다
                    </h2>
                    <p className="text-[14px] font-bold text-gray-600">
                        동물 친구들이 열심히 공간을<br />꾸미고 있어요! 🐾
                    </p>
                </div>

                {/* Pagination Dots (Decorative) */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-200"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-200"></div>
                </div>
            </div>

            {/* Category Grid */}
            <div className="bg-white px-4 py-8 rounded-b-[24px] shadow-sm mb-2 relative z-20">
                <div className="grid grid-cols-4 gap-y-6">
                    {/* Simplified category icons */}
                    {[
                        { icon: '📜', label: '운세상담', tab: '운세' },
                        { icon: '🃏', label: '타로상담', tab: '타로' },
                        { icon: '🤖', label: 'AI상담', href: '/experts/ai-chat' },
                        { icon: '📖', label: '이용가이드' },
                    ].map((item, i) => {
                        const content = (
                            <>
                                <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center text-[24px] group-hover:scale-105 transition-transform">
                                    {item.icon}
                                </div>
                                <span className="text-[12px] font-bold text-gray-800 tracking-tight">{item.label}</span>
                            </>
                        );

                        return item.href ? (
                            <Link key={i} href={item.href} className="flex flex-col items-center justify-center gap-2 cursor-pointer group">
                                {content}
                            </Link>
                        ) : (
                            <div key={i} onClick={() => {
                                if (item.label === '이용가이드') {
                                    alert('현재 이용가이드 내용을 리뉴얼 중입니다. 조금만 기다려주세요! 🛠️');
                                } else if (item.tab) {
                                    setSelectedTab(item.tab);
                                }
                            }} className="flex flex-col items-center justify-center gap-2 cursor-pointer group">
                                {content}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Expert List Section - Tabs */}
            <div className="bg-white sticky top-[56px] z-40 border-b border-gray-100 mt-2 rounded-t-[24px] overflow-hidden">
                {/* Search banner */}
                <div className="px-4 py-3">
                    <div className="w-full bg-gray-50 rounded-full py-2 px-4 flex items-center gap-2 border border-gray-100 focus-within:border-gray-400 focus-within:bg-white transition-colors">
                        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="상담사를 검색해보세요"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-[13px] text-gray-800 w-full placeholder:text-gray-400"
                        />
                    </div>
                </div>

                <div className="flex px-4 overflow-x-auto hide-scrollbar gap-2 relative border-b border-gray-100">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setSelectedTab(tab)}
                            className={cn(
                                "whitespace-nowrap pb-3 pt-2 text-[15px] font-bold border-b-[3px] px-1 transition-colors relative",
                                selectedTab === tab
                                    ? "border-gray-900 text-gray-900 z-10"
                                    : "border-transparent text-gray-400"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gray-200"></div>
                </div>

                <div className="px-4 py-3 flex gap-2 overflow-x-auto hide-scrollbar">
                    <button className="flex items-center gap-1 bg-gray-900 text-white px-3 py-1.5 rounded-full text-[13px] font-bold flex-shrink-0">
                        추천순 <ChevronDown className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-1 bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full text-[13px] font-medium flex-shrink-0">
                        상담분야 <ChevronDown className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-1 bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full text-[13px] font-medium flex-shrink-0">
                        바로 상담
                    </button>
                    <button className="flex items-center gap-1 bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full text-[13px] font-medium flex-shrink-0">
                        할인 쿠폰
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex flex-col">
                {mockExperts.filter(expert => {
                    const matchesTab = selectedTab === '전체' || expert.category === selectedTab;
                    const matchesSearch = expert.display_name.includes(searchTerm) || expert.tags.some(tag => tag.includes(searchTerm));
                    return matchesTab && matchesSearch;
                }).map(expert => (
                    <div
                        key={expert.expert_id}
                        onClick={() => setSelectedExpert(expert)}
                        className="bg-white p-5 cursor-pointer border-b border-gray-100"
                    >
                        {/* Tags */}
                        {expert.expert_id === 3 && (
                            <div className="inline-block bg-gray-100 text-gray-600 text-[11px] font-bold px-1.5 py-0.5 rounded-sm mb-2">
                                15% 할인
                            </div>
                        )}
                        <div className="flex items-start justify-between">
                            <div className="flex-1 pr-4">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <span className={cn(
                                        "text-[15px] font-black",
                                        expert.category === '운세' ? "text-green-600" : "text-purple-500"
                                    )}>{expert.category}</span>
                                    <h3 className="text-[18px] font-black text-gray-900 tracking-tight">
                                        {expert.display_name} <span className="text-gray-400 font-bold ml-0.5">({expert.code})</span>
                                    </h3>
                                </div>

                                <p className="text-[13px] text-gray-400 font-medium mb-3 leading-snug line-clamp-1 w-[90%]">
                                    {expert.tags.join(' ')}
                                </p>

                                <div className="flex items-center gap-2 text-[12px]">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                                        <span className="font-bold text-gray-900">{expert.rating} <span className="text-gray-500 font-medium">({expert.reviews.toLocaleString()})</span></span>
                                    </div>
                                    <div className="w-[1px] h-2.5 bg-gray-300"></div>
                                    <span className="text-gray-500">평균 <span className="font-bold text-gray-700">{expert.avg_minutes}분</span></span>
                                    <div className="w-[1px] h-2.5 bg-gray-300"></div>
                                    <span className="text-gray-500">누적 <span className="font-bold text-gray-700">{expert.total_consults.toLocaleString()}{expert.total_consults > 5000 ? '+' : ''}회</span></span>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="w-[68px] h-[68px] rounded-full overflow-hidden bg-gray-100 border border-gray-200 relative mb-4">
                                    <img src={expert.image_url} alt={expert.display_name} className="w-full h-full object-cover" />
                                </div>
                                {expert.is_online && (
                                    <div className="absolute top-1 right-2 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4 items-end">
                            <button className="flex items-center justify-center gap-1 border border-gray-200 rounded-[14px] px-5 py-3.5 text-gray-600 hover:bg-gray-50 flex-shrink-0">
                                <Heart className="w-5 h-5 font-normal" /> 찜
                            </button>
                            <div className="flex-1 relative">
                                {expert.banner_text && (
                                    <div className="absolute -top-7 right-4 bg-white border border-gray-200 text-[11px] font-bold text-gray-800 px-3 py-1 rounded-full shadow-sm z-10">
                                        {expert.banner_text}
                                        <div className="absolute -bottom-1 right-4 w-2 h-2 bg-white border-b border-r border-gray-200 rotate-45"></div>
                                    </div>
                                )}
                                <button className={cn(
                                    "w-full rounded-[14px] py-3.5 text-[15px] font-bold flex items-center justify-center transition-colors",
                                    expert.is_free_available
                                        ? "bg-[#1E1E1E] text-white hover:bg-black"
                                        : "bg-white border text-gray-900 border-gray-200 hover:bg-gray-50"
                                )}>
                                    상담하기
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedExpert && (
                <ExpertProfileModal
                    expert={selectedExpert}
                    onClose={() => setSelectedExpert(null)}
                />
            )}
        </main>
    );
}
