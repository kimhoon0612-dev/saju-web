"use client";

import React, { useState, useEffect } from 'react';
import { Star, ChevronDown, Heart, Search, User, TicketPercent, Sparkles } from 'lucide-react';
import { cn } from '../../components/DestinyMatrixCard';
import ExpertProfileModal, { Expert } from '../../components/ExpertProfileModal';
import Link from 'next/link';

export default function ExpertsPage() {
    const [selectedTab, setSelectedTab] = useState("전체");
    const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [experts, setExperts] = useState<Expert[]>([]);
    const [loading, setLoading] = useState(true);

    const tabs = ["전체", "운세", "타로"];

    useEffect(() => {
        const fetchExperts = async () => {
            try {
                const host = window.location.origin;
                const res = await fetch(`${host}/api/experts?t=${Date.now()}`, { cache: 'no-store' });
                if (res.ok) {
                    const data = await res.json();
                    setExperts(data);
                }
            } catch (err) {
                console.error("Failed to load experts:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchExperts();
    }, []);

    return (
        <main className="min-h-screen bg-[#F5F6F8] pb-32">

            <div className="bg-white px-4 pt-1 pb-3 flex items-center justify-between">
                <h1 className="text-2xl font-black text-[#4A5568] tracking-tight">멘토링</h1>
                <div className="p-1.5 border border-gray-200 rounded-lg">
                    <TicketPercent className="w-5 h-5 text-gray-700" />
                </div>
            </div>

            {/* Premium Hero Section */}
            <div className="w-full bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 relative overflow-hidden flex flex-col items-center justify-center border-b border-indigo-950/50 py-10">
                {/* Background decorative elements */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-400 rounded-full mix-blend-screen filter blur-3xl"></div>
                    <div className="absolute top-20 -right-10 w-48 h-48 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center px-4">
                    <span className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-100 text-[11px] font-bold px-3 py-1 rounded-full mb-4 outline outline-1 outline-indigo-400/30 backdrop-blur-sm">
                        <Sparkles className="w-3 h-3 text-indigo-300" /> 프리미엄 1:1 상담
                    </span>
                    <h2 className="text-[24px] font-black text-white leading-[1.3] tracking-tight mb-2">
                        당신의 운명을 밝혀줄<br />최고의 멘토를 만나보세요
                    </h2>
                    <p className="text-[14px] text-indigo-200/80 font-medium max-w-[260px]">
                        엄선된 명리·타로 전문가들이 당신만의 깊이 있는 인생 해답을 제시합니다.
                    </p>
                </div>
            </div>

            {/* Expert List Section - Tabs */}
            <div className="bg-white sticky top-[56px] z-40 border-b border-gray-100 mt-2 rounded-t-[24px] overflow-hidden">
                {/* Search banner */}
                <div className="px-4 py-3 border-b border-gray-100">
                    <div className="w-full bg-gray-50 rounded-full py-2 px-4 flex items-center gap-2 border border-gray-100 focus-within:border-gray-400 focus-within:bg-white transition-colors">
                        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="키워드로 멘토를 찾아보세요"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-[13px] text-gray-800 w-full placeholder:text-gray-400"
                        />
                    </div>
                </div>

                <div className="flex px-4 overflow-x-auto hide-scrollbar gap-2 relative">
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
            </div>

            {/* Grid List */}
            <div className="px-4 py-4 grid grid-cols-2 gap-3 sm:gap-4">
                {experts.filter(expert => {
                    const matchesTab = selectedTab === '전체' || expert.category === selectedTab;
                    const matchesSearch = expert.display_name.includes(searchTerm) || (expert.tags && expert.tags.includes(searchTerm));
                    return matchesTab && matchesSearch;
                }).map(expert => (
                    <div
                        key={expert.id}
                        onClick={() => setSelectedExpert(expert)}
                        className="bg-white rounded-[20px] cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden group hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 transform hover:-translate-y-1"
                    >
                        {/* Premium Card Header / Image */}
                        <div className="w-full aspect-[4/5] bg-gray-50 relative overflow-hidden">
                            <img 
                                src={expert.image_url} 
                                alt={expert.display_name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                            />
                            
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                            {/* Top Badges */}
                            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                                <span className={cn(
                                    "text-[10px] font-black px-2 py-1 rounded-full shadow-sm backdrop-blur-md border border-white/20",
                                    expert.category === '운세' ? "bg-emerald-500/90 text-white" : "bg-indigo-500/90 text-white"
                                )}>{expert.category}</span>
                            </div>

                            {/* Online Status */}
                            {expert.is_online && (
                                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>
                                    <span className="text-[10px] font-bold text-white tracking-wide">상담가능</span>
                                </div>
                            )}

                            {/* Bottom Identity Overlay */}
                            <div className="absolute bottom-3 left-3 right-3 text-white">
                                <h3 className="text-[17px] font-black tracking-tight mb-0.5 drop-shadow-md">
                                    {expert.display_name}
                                </h3>
                                <p className="text-[12px] font-medium text-white/80 line-clamp-1 drop-shadow-sm leading-snug">
                                    {(expert.tags || "").split(',').slice(0, 2).map(t => t.trim()).join(' · ')}
                                </p>
                            </div>
                        </div>

                        {/* Card Body - Content */}
                        <div className="p-3">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1">
                                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                    <span className="text-[13px] font-bold text-gray-900">
                                        {expert.rating?.toFixed(1) || "5.0"}
                                    </span>
                                    <span className="text-[11px] text-gray-400 font-medium">({expert.reviews_count?.toLocaleString() || 0})</span>
                                </div>
                                <div className="text-[11px] font-bold text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-100">
                                    {expert.avg_minutes}분 평균
                                </div>
                            </div>

                            {/* Footer actions visually compact */}
                            <div className="w-full pt-2 border-t border-gray-50 flex items-center justify-between mt-1">
                                <span className="text-[11px] text-gray-400 font-medium tracking-tight">
                                    누적 {expert.total_consults?.toLocaleString() || 0}{(expert.total_consults || 0) > 5000 ? '+' : ''}회
                                </span>
                                <span className="text-[12px] font-black text-indigo-600 group-hover:text-indigo-700 transition-colors">
                                    상담하기 &gt;
                                </span>
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
