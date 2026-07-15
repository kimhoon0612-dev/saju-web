"use client";

import React, { useState, useEffect } from 'react';
import { adminFetch } from '../adminFetch';
import { Sparkles, Edit2, Trash2, Eye, EyeOff, CheckCircle, Clock, Users, UploadCloud, Wifi, WifiOff, Plus, X } from 'lucide-react';

export default function ExpertsManager() {
    const [experts, setExperts] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [settlements, setSettlements] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'list' | 'reviews' | 'settlements'>('list');
    const [selectedExpert, setSelectedExpert] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: 0, category: '운세', display_name: '', code: '', tags: '', rating: 5.0,
        reviews_count: 0, avg_minutes: 10, total_consults: 0,
        image_url: '', is_online: true, is_free_available: false, banner_text: '', introduction_text: ''
    });
    const [isUploading, setIsUploading] = useState(false);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    useEffect(() => {
        if (activeTab === 'list') fetchExperts();
        if (activeTab === 'settlements') fetchSettlements();
    }, [activeTab]);

    useEffect(() => {
        if (selectedExpert && activeTab === 'reviews') fetchReviews(selectedExpert);
    }, [selectedExpert, activeTab]);

    const fetchExperts = async () => {
        const res = await adminFetch('/api/admin/experts/');
        if (res.ok) setExperts(await res.json());
    };

    const fetchReviews = async (expertId: number) => {
        const res = await adminFetch(`/api/admin/experts/${expertId}/reviews`);
        if (res.ok) setReviews(await res.json());
    };

    const fetchSettlements = async () => {
        const res = await adminFetch('/api/admin/experts/settlements/all');
        if (res.ok) setSettlements(await res.json());
    };

    // 온라인 상태 즉시 토글
    const handleToggleOnline = async (expertId: number) => {
        setTogglingId(expertId);
        try {
            const res = await adminFetch(`/api/admin/experts/${expertId}/toggle-online`, { method: 'PATCH' });
            if (res.ok) {
                const data = await res.json();
                setExperts(prev => prev.map(ex => ex.id === expertId ? { ...ex, is_online: data.is_online } : ex));
            }
        } finally {
            setTogglingId(null);
        }
    };

    // 전문가 저장 (신규/수정) — adminFetch 사용
    const handleSaveExpert = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = formData.id ? 'PUT' : 'POST';
        const url = formData.id ? `/api/admin/experts/${formData.id}` : '/api/admin/experts/';
        const res = await adminFetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (res.ok) {
            alert(formData.id ? '수정되었습니다.' : '등록되었습니다.');
            setIsEditing(false);
            fetchExperts();
        } else {
            alert('저장 실패. 관리자 토큰을 확인하세요.');
        }
    };

    const handleDeleteExpert = async (id: number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        await adminFetch(`/api/admin/experts/${id}`, { method: 'DELETE' });
        fetchExperts();
    };

    const handleImageUpload = async (file: File, forForm = true) => {
        setIsUploading(true);
        const fd = new FormData();
        fd.append("file", file);
        try {
            const res = await adminFetch('/api/admin/talisman/upload', { method: 'POST', body: fd });
            const data = await res.json();
            const url = data.document_url || data.url || '';
            if (forForm) setFormData(prev => ({ ...prev, image_url: url }));
        } catch (e) {
            alert("이미지 업로드 실패");
        } finally {
            setIsUploading(false);
        }
    };

    const handleToggleReview = async (id: number) => {
        await adminFetch(`/api/admin/experts/reviews/${id}`, { method: 'DELETE' });
        if (selectedExpert) fetchReviews(selectedExpert);
    };

    const handleCompleteSettlement = async (id: number) => {
        if (!confirm('정산 완료 처리하시겠습니까?')) return;
        await adminFetch(`/api/admin/experts/settlements/${id}/complete`, { method: 'PUT' });
        fetchSettlements();
    };

    const openEditForm = (expert: any = null) => {
        if (expert) {
            setFormData({ ...expert, tags: expert.tags || '', banner_text: expert.banner_text || '', introduction_text: expert.introduction_text || '' });
        } else {
            setFormData({ id: 0, category: '운세', display_name: '', code: '', tags: '', rating: 5.0, reviews_count: 0, avg_minutes: 10, total_consults: 0, image_url: '', is_online: true, is_free_available: false, banner_text: '', introduction_text: '' });
        }
        setIsEditing(true);
    };

    const tabBtn = (key: typeof activeTab, label: string) => (
        <button onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === key ? 'bg-[#4A5568] text-white' : 'text-gray-500 hover:text-gray-800'}`}>
            {label}
        </button>
    );

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-indigo-500" /> 상담사 관리 <span className="text-sm font-normal text-gray-400">({experts.length}명)</span>
                </h2>
                <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-200 gap-1">
                    {tabBtn('list', '전문가 목록')}
                    {tabBtn('reviews', '리뷰 관리')}
                    {tabBtn('settlements', '정산 현황')}
                </div>
            </div>

            {/* ── 전문가 목록 탭 ── */}
            {activeTab === 'list' && (
                <div className="flex flex-col gap-4">
                    <div className="flex justify-end">
                        <button onClick={() => openEditForm()}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow">
                            <Plus className="w-4 h-4" /> 신규 전문가 등록
                        </button>
                    </div>

                    {experts.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center text-gray-400 border border-gray-200">
                            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="font-bold">등록된 전문가가 없습니다.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {experts.map(ex => (
                                <div key={ex.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    {/* 이미지 + 온라인 배지 */}
                                    <div className="relative h-40 bg-gray-100">
                                        {ex.image_url ? (
                                            <img src={ex.image_url} alt={ex.display_name}
                                                className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-5xl">👤</div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        {/* 카테고리 배지 */}
                                        <span className={`absolute top-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-full ${ex.category === '운세' ? 'bg-emerald-500 text-white' : 'bg-purple-500 text-white'}`}>
                                            {ex.category}
                                        </span>
                                        {/* 온라인 토글 버튼 */}
                                        <button
                                            onClick={() => handleToggleOnline(ex.id)}
                                            disabled={togglingId === ex.id}
                                            className={`absolute top-2 right-2 flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full transition-all ${ex.is_online ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'} disabled:opacity-50`}
                                        >
                                            {ex.is_online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                                            {togglingId === ex.id ? '...' : ex.is_online ? '온라인' : '부재중'}
                                        </button>
                                        {/* 이름 */}
                                        <div className="absolute bottom-2 left-3 text-white">
                                            <p className="text-[16px] font-black drop-shadow">{ex.display_name}</p>
                                            <p className="text-[11px] text-white/70">{ex.code}</p>
                                        </div>
                                    </div>
                                    {/* 본문 */}
                                    <div className="p-3 flex items-center justify-between gap-2">
                                        <div className="flex gap-2 text-[12px] text-gray-500 font-medium">
                                            <span>⭐ {ex.rating?.toFixed(1)}</span>
                                            <span>|</span>
                                            <span>리뷰 {ex.reviews_count}</span>
                                            <span>|</span>
                                            <span>상담 {ex.total_consults?.toLocaleString()}회</span>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            <button onClick={() => { setSelectedExpert(ex.id); setActiveTab('reviews'); }}
                                                className="p-1.5 bg-gray-50 rounded-lg text-gray-500 hover:bg-gray-100 border border-gray-200" title="리뷰">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => openEditForm(ex)}
                                                className="p-1.5 bg-blue-50 rounded-lg text-blue-500 hover:bg-blue-100 border border-blue-100" title="수정">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteExpert(ex.id)}
                                                className="p-1.5 bg-red-50 rounded-lg text-red-500 hover:bg-red-100 border border-red-100" title="삭제">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── 리뷰 관리 탭 ── */}
            {activeTab === 'reviews' && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-5">
                        <h3 className="text-lg font-bold text-gray-700">후기 관리</h3>
                        <select className="bg-gray-50 border border-gray-200 rounded-xl p-2 text-sm text-gray-700"
                            value={selectedExpert || ''} onChange={e => setSelectedExpert(Number(e.target.value))}>
                            <option value="">전문가 선택</option>
                            {experts.map(ex => <option key={ex.id} value={ex.id}>{ex.display_name} ({ex.category})</option>)}
                        </select>
                    </div>
                    {!selectedExpert ? (
                        <p className="text-center py-10 text-gray-400">조회할 전문가를 선택하세요.</p>
                    ) : reviews.length === 0 ? (
                        <p className="text-center py-10 text-gray-400">후기가 없습니다.</p>
                    ) : (
                        <div className="space-y-3">
                            {reviews.map(rev => (
                                <div key={rev.id} className={`p-4 rounded-xl border flex gap-3 items-start ${rev.is_hidden ? 'bg-red-50 border-red-200 opacity-70' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-800 text-sm">{rev.author_name}</span>
                                            <span className="text-amber-500 text-xs">★ {rev.rating}</span>
                                        </div>
                                        <p className="text-gray-600 text-sm">{rev.content}</p>
                                    </div>
                                    <button onClick={() => handleToggleReview(rev.id)}
                                        className={`text-xs px-2 py-1 rounded-md font-bold flex items-center gap-1 shrink-0 ${rev.is_hidden ? 'bg-gray-200 text-gray-700' : 'bg-red-100 text-red-600'}`}>
                                        {rev.is_hidden ? <><Eye className="w-3 h-3" /> 공개</> : <><EyeOff className="w-3 h-3" /> 숨김</>}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── 정산 현황 탭 ── */}
            {activeTab === 'settlements' && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 overflow-x-auto">
                    <h3 className="text-lg font-bold text-gray-700 mb-5">전체 정산 내역</h3>
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="border-b text-gray-400">
                                <th className="py-3 px-3 font-normal">상담사</th>
                                <th className="py-3 px-3 font-normal">금액</th>
                                <th className="py-3 px-3 font-normal">발생일</th>
                                <th className="py-3 px-3 font-normal">상태</th>
                                <th className="py-3 px-3 font-normal text-right">처리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {settlements.map(s => (
                                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-3 font-bold text-gray-800">{s.expert_name}</td>
                                    <td className="py-3 px-3 text-green-600 font-bold">{s.amount.toLocaleString()}원</td>
                                    <td className="py-3 px-3 text-gray-400 text-xs">{new Date(s.created_at).toLocaleString()}</td>
                                    <td className="py-3 px-3">
                                        {s.status === 'PENDING' ? (
                                            <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-md text-xs font-bold flex items-center gap-1 w-max"><Clock className="w-3 h-3" /> 대기중</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-md text-xs font-bold flex items-center gap-1 w-max"><CheckCircle className="w-3 h-3" /> 완료됨</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-3 text-right">
                                        {s.status === 'PENDING' && (
                                            <button onClick={() => handleCompleteSettlement(s.id)}
                                                className="px-3 py-1 bg-gray-800 text-white text-xs font-bold rounded-lg hover:bg-gray-600">
                                                지급완료
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {settlements.length === 0 && <p className="text-center py-8 text-gray-400">정산 내역이 없습니다.</p>}
                </div>
            )}

            {/* ── 등록/수정 모달 ── */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setIsEditing(false)}>
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-7 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-900">{formData.id ? '전문가 수정' : '신규 전문가 등록'}</h3>
                            <button onClick={() => setIsEditing(false)} className="p-2 rounded-full hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <form onSubmit={handleSaveExpert} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: '표시 이름', key: 'display_name', type: 'text', required: true },
                                { label: '고유 코드', key: 'code', type: 'text', required: true },
                                { label: '평점', key: 'rating', type: 'number' },
                                { label: '평균 상담(분)', key: 'avg_minutes', type: 'number' },
                                { label: '리뷰 수', key: 'reviews_count', type: 'number' },
                                { label: '총 상담 수', key: 'total_consults', type: 'number' },
                            ].map(({ label, key, type, required }) => (
                                <div key={key}>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">{label}</label>
                                    <input required={required} type={type} step={type === 'number' ? '0.1' : undefined}
                                        value={(formData as any)[key]}
                                        onChange={e => setFormData(prev => ({ ...prev, [key]: type === 'number' ? parseFloat(e.target.value) : e.target.value }))}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 text-sm focus:outline-none focus:border-indigo-400" />
                                </div>
                            ))}

                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">카테고리</label>
                                <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 text-sm">
                                    <option>운세</option><option>타로</option><option>신점</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block">태그 (콤마 구분)</label>
                                <input type="text" value={formData.tags}
                                    onChange={e => setFormData(p => ({ ...p, tags: e.target.value }))}
                                    placeholder="#재물운, #연애운"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 text-sm" />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 mb-1 block">배너 텍스트</label>
                                <input type="text" value={formData.banner_text}
                                    onChange={e => setFormData(p => ({ ...p, banner_text: e.target.value }))}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 text-sm" />
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 mb-1 block">소개문구</label>
                                <textarea value={formData.introduction_text} rows={2}
                                    onChange={e => setFormData(p => ({ ...p, introduction_text: e.target.value }))}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-800 text-sm resize-none" />
                            </div>

                            {/* 이미지 업로드 */}
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold text-gray-500 mb-2 block">프로필 이미지</label>
                                <div className="flex items-center gap-4">
                                    {formData.image_url && (
                                        <img src={formData.image_url} alt="preview" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                                    )}
                                    <label className="flex items-center gap-2 cursor-pointer bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100">
                                        <UploadCloud className="w-4 h-4" />
                                        {isUploading ? '업로드 중...' : '이미지 선택'}
                                        <input type="file" accept="image/*" className="hidden" disabled={isUploading}
                                            onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
                                    </label>
                                    <input type="text" placeholder="또는 URL 직접 입력" value={formData.image_url}
                                        onChange={e => setFormData(p => ({ ...p, image_url: e.target.value }))}
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-2 text-sm text-gray-600" />
                                </div>
                            </div>

                            {/* 토글 옵션 */}
                            <div className="md:col-span-2 flex gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                {[
                                    { key: 'is_online', label: '현재 온라인 (상담가능)' },
                                    { key: 'is_free_available', label: '첫 회 무료' },
                                ].map(({ key, label }) => (
                                    <label key={key} className="flex items-center gap-2 cursor-pointer font-bold text-gray-700 text-sm">
                                        <input type="checkbox" checked={(formData as any)[key]}
                                            onChange={e => setFormData(p => ({ ...p, [key]: e.target.checked }))}
                                            className="w-4 h-4 accent-indigo-500" />
                                        {label}
                                    </label>
                                ))}
                            </div>

                            <button type="submit" className="md:col-span-2 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base transition-colors shadow">
                                저장하기
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
