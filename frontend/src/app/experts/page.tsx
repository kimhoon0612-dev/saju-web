"use client";

import React, { useState, useEffect } from 'react';
import { Star, ChevronDown, Heart, Search, User, TicketPercent } from 'lucide-react';
import { cn } from '../../components/DestinyMatrixCard';
import ExpertProfileModal, { Expert } from '../../components/ExpertProfileModal';
import Link from 'next/link';

const mockExperts: Expert[] = [
    {
        expert_id: 1,
        category: '신점',
        display_name: '쪽집게 천신불',
        code: '357',
        tags: ['#종합운세', '#궁합', '#사업', '#부부', '#대인관계'],
        rating: 4.7,
        reviews: 178,
        avg_minutes: 10,
        total_consults: 2706,
        image_url: 'https://i.pravatar.cc/150?img=47',
        is_online: true,
        banner_text: '선착순 7명 남음',
        is_free_available: true
    },
    {
        expert_id: 2,
        category: '운세',
        display_name: '예화',
        code: '002',
        tags: ['#종합운세', '#궁합', '#택일', '#학업', '#취업', '#사주'],
        rating: 4.7,
        reviews: 3610,
        avg_minutes: 14,
        total_consults: 9999,
        image_url: 'https://i.pravatar.cc/150?img=5',
        is_online: true,
        banner_text: '선착순 4명 남음',
        is_free_available: true
    },
    {
        expert_id: 3,
        category: '운세',
        display_name: '나무하트명리',
        code: '199',
        tags: ['#종합운세', '#궁합', '#학업', '#취업', '#사업', '#건강'],
        rating: 4.9,
        reviews: 120,
        avg_minutes: 12,
        total_consults: 850,
        image_url: 'https://i.pravatar.cc/150?img=11',
        is_online: true,
        is_free_available: false
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

            {/* Hero Banner */}
            <div className="w-full bg-[#FA5A3E] relative overflow-hidden h-48 flex items-center cursor-pointer">
                <div className="absolute top-0 right-0 w-[55%] h-full">
                    <img
                        src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600&auto=format&fit=crop"
                        alt="전문가"
                        className="w-full h-full object-cover object-top -scale-x-100 mix-blend-luminosity opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#FA5A3E]" />
                </div>

                <div className="relative z-10 px-6 max-w-[60%]">
                    <span className="inline-block bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full mb-3 border border-white/30 backdrop-blur-sm">
                        신점
                    </span>
                    <h2 className="text-[22px] font-black text-white leading-[1.2] tracking-tight mb-2">
                        커플 궁합 전문!
                    </h2>
                    <p className="text-[14px] font-medium text-white/90 leading-snug break-keep">
                        두 사람 사이의 속사정,<br />무엇이든 물어보세요
                    </p>
                </div>

                <div className="absolute bottom-4 right-4 bg-black/20 text-white text-[11px] px-2 py-0.5 rounded-sm backdrop-blur-sm">
                    전체보기 +
                </div>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                </div>
            </div>

            {/* Category Grid */}
            <div className="bg-white px-4 py-8 rounded-b-[24px] shadow-sm mb-2 relative z-20">
                <div className="grid grid-cols-4 gap-y-6">
                    {/* Simplified category icons */}
                    {[
                        { icon: '📜', label: '운세상담' },
                        { icon: '🃏', label: '타로상담' },
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
                            <div key={i} className="flex flex-col items-center justify-center gap-2 cursor-pointer group">
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
                                        expert.category === '신점' ? "text-red-500" :
                                            expert.category === '운세' ? "text-green-600" :
                                                "text-purple-500"
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
                                    {expert.is_free_available ? '무료 상담하기' : '상담하기'}
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
