"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, Edit2, Trash2, Plus, EyeOff, Eye, CheckCircle, Clock } from 'lucide-react';

export default function ExpertsManager() {
    const [experts, setExperts] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [settlements, setSettlements] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'list' | 'reviews' | 'settlements'>('list');

    const [selectedExpert, setSelectedExpert] = useState<number | null>(null);

    // Form states
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: 0, category: '운세', display_name: '', code: '', tags: '', rating: 5.0,
        avg_minutes: 10, image_url: '', is_online: true, is_free_available: false, banner_text: ''
    });

    useEffect(() => {
        if (activeTab === 'list') fetchExperts();
        if (activeTab === 'settlements') fetchSettlements();
    }, [activeTab]);

    useEffect(() => {
        if (selectedExpert && activeTab === 'reviews') {
            fetchReviews(selectedExpert);
        }
    }, [selectedExpert, activeTab]);

    const fetchExperts = async () => {
        const res = await fetch('/api/admin/experts');
        if (res.ok) setExperts(await res.json());
    };

    const fetchReviews = async (expertId: number) => {
        const res = await fetch(`/api/admin/experts/${expertId}/reviews`);
        if (res.ok) setReviews(await res.json());
    };

    const fetchSettlements = async () => {
        const res = await fetch('/api/admin/experts/settlements/all');
        if (res.ok) setSettlements(await res.json());
    };

    const handleSaveExpert = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = formData.id ? 'PUT' : 'POST';
        const url = formData.id ? `/api/admin/experts/${formData.id}` : '/api/admin/experts';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        setIsEditing(false);
        fetchExperts();
    };

    const handleDeleteExpert = async (id: number) => {
        if (!confirm('정말 삭제하시겠습니까? 관련 리뷰와 정산 내역이 함께 삭제됩니다.')) return;
        await fetch(`/api/admin/experts/${id}`, { method: 'DELETE' });
        fetchExperts();
    };

    const handleToggleReview = async (id: number) => {
        await fetch(`/api/admin/experts/reviews/${id}`, { method: 'DELETE' });
        if (selectedExpert) fetchReviews(selectedExpert);
    };

    const handleCompleteSettlement = async (id: number) => {
        if (!confirm('정산을 완료 처리하시겠습니까?')) return;
        await fetch(`/api/admin/experts/settlements/${id}/complete`, { method: 'PUT' });
        fetchSettlements();
    };

    const openEditForm = (expert: any = null) => {
        if (expert) {
            setFormData({ ...expert, tags: expert.tags || '' });
        } else {
            setFormData({
                id: 0, category: '운세', display_name: '', code: '', tags: '', rating: 5.0,
                avg_minutes: 10, image_url: '', is_online: true, is_free_available: false, banner_text: ''
            });
        }
        setIsEditing(true);
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-amber-100 tracking-tight flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-[#d4af37]" /> 상담사 일괄 관리
                </h2>
                <div className="flex bg-[#110e1b] rounded-lg p-1 border border-[#d4af37]/20">
                    <button onClick={() => setActiveTab('list')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'list' ? 'bg-[#d4af37] text-black' : 'text-white/50 hover:text-white'}`}>전문가 목록</button>
                    <button onClick={() => setActiveTab('reviews')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'reviews' ? 'bg-[#d4af37] text-black' : 'text-white/50 hover:text-white'}`}>리뷰 관리</button>
                    <button onClick={() => setActiveTab('settlements')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'settlements' ? 'bg-[#d4af37] text-black' : 'text-white/50 hover:text-white'}`}>정산 현황</button>
                </div>
            </div>

            {/* List Tab */}
            {activeTab === 'list' && (
                <div className="bg-[#1a142d]/80 rounded-3xl p-6 shadow-xl border border-[#d4af37]/20">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-amber-200">등록된 전문가 목록</h3>
                        <button onClick={() => openEditForm()} className="bg-[#d4af37] text-black px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-amber-400">
                            <Plus className="w-4 h-4" /> 신규 등록
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-white/10 text-white/50">
                                    <th className="py-3 px-4 font-normal">구분</th>
                                    <th className="py-3 px-4 font-normal">코드</th>
                                    <th className="py-3 px-4 font-normal">이름</th>
                                    <th className="py-3 px-4 font-normal">상태</th>
                                    <th className="py-3 px-4 font-normal text-right">관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {experts.map(ex => (
                                    <tr key={ex.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${ex.category === '운세' ? 'bg-green-900/40 text-green-400' : 'bg-purple-900/40 text-purple-400'}`}>
                                                {ex.category}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-white/70">{ex.code}</td>
                                        <td className="py-3 px-4 font-bold text-amber-100">{ex.display_name}</td>
                                        <td className="py-3 px-4">
                                            <span className={`flex items-center gap-1.5 text-xs font-bold ${ex.is_online ? 'text-green-400' : 'text-white/40'}`}>
                                                <div className={`w-2 h-2 rounded-full ${ex.is_online ? 'bg-green-400' : 'bg-white/40'}`} />
                                                {ex.is_online ? '상담가능' : '부재중'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 flex justify-end gap-2">
                                            <button onClick={() => { setSelectedExpert(ex.id); setActiveTab('reviews'); }} className="p-1.5 bg-[#110e1b] rounded-md text-amber-400 hover:bg-white/10" title="리뷰 보기">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => openEditForm(ex)} className="p-1.5 bg-[#110e1b] rounded-md text-blue-400 hover:bg-white/10" title="수정">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteExpert(ex.id)} className="p-1.5 bg-red-900/30 rounded-md text-red-400 hover:bg-red-900/50" title="삭제">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
                <div className="bg-[#1a142d]/80 rounded-3xl p-6 shadow-xl border border-[#d4af37]/20">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-amber-200">후기(리뷰) 관리</h3>
                        <select
                            className="bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-2 text-white text-sm focus:outline-none focus:border-[#d4af37]"
                            value={selectedExpert || ''}
                            onChange={(e) => setSelectedExpert(Number(e.target.value))}
                        >
                            <option value="">전문가 선택</option>
                            {experts.map(ex => <option key={ex.id} value={ex.id}>{ex.display_name} ({ex.category})</option>)}
                        </select>
                    </div>

                    {!selectedExpert ? (
                        <div className="text-center py-10 text-white/40">조회할 전문가를 선택해주세요.</div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-10 text-white/40">해당 전문가의 후기가 없습니다.</div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map(rev => (
                                <div key={rev.id} className={`p-4 rounded-xl border ${rev.is_hidden ? 'border-red-900/50 bg-red-900/10 opacity-70' : 'border-[#d4af37]/20 bg-[#110e1b]'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="text-sm font-bold text-amber-200 mr-2">{rev.author_name}</span>
                                            <span className="text-amber-400 text-xs">★ {rev.rating}</span>
                                        </div>
                                        <button
                                            onClick={() => handleToggleReview(rev.id)}
                                            className={`text-xs px-2 py-1 rounded-md font-bold flex items-center gap-1 ${rev.is_hidden ? 'bg-[#d4af37] text-black' : 'bg-red-900/40 text-red-300'}`}
                                        >
                                            {rev.is_hidden ? <><Eye className="w-3 h-3" /> 보이기</> : <><EyeOff className="w-3 h-3" /> 숨기기</>}
                                        </button>
                                    </div>
                                    <p className="text-white/80 text-sm whitespace-pre-wrap">{rev.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Settlements Tab */}
            {activeTab === 'settlements' && (
                <div className="bg-[#1a142d]/80 rounded-3xl p-6 shadow-xl border border-[#d4af37]/20">
                    <h3 className="text-lg font-bold text-amber-200 mb-6">전체 정산 대기 및 내역</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-white/10 text-white/50">
                                    <th className="py-3 px-4 font-normal">상담사</th>
                                    <th className="py-3 px-4 font-normal">금액</th>
                                    <th className="py-3 px-4 font-normal">발생 일시</th>
                                    <th className="py-3 px-4 font-normal">상태</th>
                                    <th className="py-3 px-4 font-normal text-right">처리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {settlements.map(set => (
                                    <tr key={set.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-4 font-bold text-amber-100">{set.expert_name}</td>
                                        <td className="py-3 px-4 text-green-400 font-bold">{set.amount.toLocaleString()}원</td>
                                        <td className="py-3 px-4 text-white/50">{new Date(set.created_at).toLocaleString()}</td>
                                        <td className="py-3 px-4">
                                            {set.status === 'PENDING' ? (
                                                <span className="px-2 py-1 bg-orange-900/40 text-orange-400 rounded-md text-xs font-bold flex items-center gap-1 w-max">
                                                    <Clock className="w-3 h-3" /> 대기중
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-blue-900/40 text-blue-400 rounded-md text-xs font-bold flex items-center gap-1 w-max">
                                                    <CheckCircle className="w-3 h-3" /> 완료됨
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            {set.status === 'PENDING' && (
                                                <button onClick={() => handleCompleteSettlement(set.id)} className="px-3 py-1.5 bg-[#d4af37] hover:bg-amber-400 text-black font-bold rounded-lg text-xs transition-colors">
                                                    지급 완료 처리
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Edit/Create Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1a142d] border border-[#d4af37]/30 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-amber-100 flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-[#d4af37]" /> {formData.id ? '상담사 수정' : '신규 상담사 등록'}
                            </h3>
                            <button onClick={() => setIsEditing(false)} className="text-white/50 hover:text-white"><EyeOff className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleSaveExpert} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-bold text-white/70 mb-1 block">카테고리</label>
                                <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37]">
                                    <option value="운세">운세</option>
                                    <option value="타로">타로</option>
                                    <option value="신점">신점 (히든)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white/70 mb-1 block">이름</label>
                                <input required type="text" value={formData.display_name} onChange={e => setFormData({ ...formData, display_name: e.target.value })} className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37]" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white/70 mb-1 block">고유 코드 (ex: 002)</label>
                                <input required type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37]" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white/70 mb-1 block">태그 (콤마로 구분)</label>
                                <input type="text" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} placeholder="#재회, #어장" className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37]" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white/70 mb-1 block">평점</label>
                                <input type="number" step="0.1" value={formData.rating} onChange={e => setFormData({ ...formData, rating: parseFloat(e.target.value) })} className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37]" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-white/70 mb-1 block">평균 상담시간(분)</label>
                                <input type="number" value={formData.avg_minutes} onChange={e => setFormData({ ...formData, avg_minutes: parseInt(e.target.value) })} className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37]" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-bold text-white/70 mb-1 block">이미지 URL</label>
                                <input type="text" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37]" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-bold text-white/70 mb-1 block">상단 배너 텍스트 (예: 선착순 4명)</label>
                                <input type="text" value={formData.banner_text} onChange={e => setFormData({ ...formData, banner_text: e.target.value })} className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37]" />
                            </div>
                            <div className="flex items-center gap-4 md:col-span-2 p-3 bg-[#110e1b] rounded-xl border border-[#d4af37]/10 mt-2">
                                <label className="flex items-center gap-2 text-white font-bold cursor-pointer">
                                    <input type="checkbox" checked={formData.is_online} onChange={e => setFormData({ ...formData, is_online: e.target.checked })} className="w-5 h-5 accent-[#d4af37]" />
                                    현재 온라인(상담가능)
                                </label>
                                <label className="flex items-center gap-2 text-white font-bold cursor-pointer ml-4">
                                    <input type="checkbox" checked={formData.is_free_available} onChange={e => setFormData({ ...formData, is_free_available: e.target.checked })} className="w-5 h-5 accent-[#d4af37]" />
                                    첫회 무료 여부
                                </label>
                            </div>

                            <button type="submit" className="md:col-span-2 mt-4 py-3.5 rounded-xl bg-[#d4af37] hover:bg-amber-400 text-black font-black text-lg transition-all shadow-lg">
                                저장하기
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
