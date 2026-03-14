"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, Edit2, Trash2, Plus, EyeOff, Eye, CheckCircle, Clock, Users, UploadCloud } from 'lucide-react';

export default function ExpertsManager() {
    const [experts, setExperts] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [settlements, setSettlements] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'list' | 'reviews' | 'settlements' | 'partner'>('list');

    const [selectedExpert, setSelectedExpert] = useState<number | null>(null);

    // Form states (Virtual Expert)
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: 0, category: '운세', display_name: '', code: '', tags: '', rating: 5.0,
        avg_minutes: 10, image_url: '', is_online: true, is_free_available: false, banner_text: ''
    });

    // Real Expert (Partner) Registration states
    const [expertName, setExpertName] = useState("");
    const [expertSpecialty, setExpertSpecialty] = useState("사주/명리");
    const [expertBio, setExpertBio] = useState("");
    const [expertPrice, setExpertPrice] = useState<number>(10000);
    const [expertShareRatio, setExpertShareRatio] = useState<number>(70);
    const [expertImageUrl, setExpertImageUrl] = useState<string>("");
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

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

    const handleImageUpload = async (file: File) => {
        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await fetch('/api/admin/talisman/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            setExpertImageUrl(data.url);
        } catch (e) {
            console.error(e);
            alert("이미지 업로드에 실패했습니다.");
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleExpertRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsRegistering(true);
        try {
            await fetch('/api/admin/marketplace/register-expert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    display_name: expertName,
                    specialty: expertSpecialty,
                    short_bio: expertBio,
                    price_per_session: expertPrice,
                    share_ratio_percent: expertShareRatio,
                    image_url: expertImageUrl || null
                })
            });
            alert('파트너 상담사 프로필이 성공적으로 등록되었습니다.');
            setExpertName(""); setExpertBio(""); setExpertShareRatio(70); setExpertImageUrl("");
        } catch (e) {
            console.error(e);
        } finally {
            setIsRegistering(false);
        }
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
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-[#4A5568]" /> 상담사 일괄 관리
                </h2>
                <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-200">
                    <button onClick={() => setActiveTab('list')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'list' ? 'bg-[#4A5568] text-white' : 'text-gray-500 hover:text-[#2D3748]'}`}>전문가 목록</button>
                    <button onClick={() => setActiveTab('reviews')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'reviews' ? 'bg-[#4A5568] text-white' : 'text-gray-500 hover:text-[#2D3748]'}`}>리뷰 관리</button>
                    <button onClick={() => setActiveTab('settlements')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'settlements' ? 'bg-[#4A5568] text-white' : 'text-gray-500 hover:text-[#2D3748]'}`}>정산 현황 (가상)</button>
                </div>
            </div>

            {/* Removed Partner Registration Tab (Moved to List Tab) */}

            {/* List Tab */}
            {activeTab === 'list' && (
                <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-700">등록된 전문가 목록</h3>
                        <button onClick={() => {
                            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                        }} className="bg-[#4A5568] text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-600">
                            신규 등록 (아래로)
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 text-gray-500">
                                    <th className="py-3 px-4 font-normal">구분</th>
                                    <th className="py-3 px-4 font-normal">코드</th>
                                    <th className="py-3 px-4 font-normal">이름</th>
                                    <th className="py-3 px-4 font-normal">상태</th>
                                    <th className="py-3 px-4 font-normal text-right">관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {experts.map(ex => (
                                    <tr key={ex.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${ex.category === '운세' ? 'bg-green-900/40 text-green-400' : 'bg-purple-900/40 text-purple-400'}`}>
                                                {ex.category}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">{ex.code}</td>
                                        <td className="py-3 px-4 font-bold text-gray-800">{ex.display_name}</td>
                                        <td className="py-3 px-4">
                                            <span className={`flex items-center gap-1.5 text-xs font-bold ${ex.is_online ? 'text-green-400' : 'text-gray-400'}`}>
                                                <div className={`w-2 h-2 rounded-full ${ex.is_online ? 'bg-green-400' : 'bg-white/40'}`} />
                                                {ex.is_online ? '상담가능' : '부재중'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 flex justify-end gap-2">
                                            <button onClick={() => { setSelectedExpert(ex.id); setActiveTab('reviews'); }} className="p-1.5 bg-gray-50 rounded-md text-[#4A5568] hover:bg-gray-100" title="리뷰 보기">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => openEditForm(ex)} className="p-1.5 bg-gray-50 rounded-md text-blue-400 hover:bg-gray-100" title="수정">
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

                    {/* Moved Partner Registration Form Here */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Users className="w-6 h-6 text-indigo-400" /> 신규 파트너 상담사 계정 섭외 / 등록
                        </h3>
                        <p className="text-sm text-gray-500 mb-8 border-b border-gray-200 pb-4">이곳에서 등록된 상담사는 실제 결제 및 월간 정산이 연동되는 공식 파트너 계정입니다.</p>
                        <form onSubmit={handleExpertRegister} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-1 block">활동명 (닉네임)</label>
                                <input required type="text" value={expertName} onChange={e => setExpertName(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-[#2D3748] text-sm focus:outline-none focus:border-[#4A5568] focus:ring-1 focus:ring-[#d4af37]" placeholder="예: 도원선사" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-1 block">전문 분야</label>
                                <select value={expertSpecialty} onChange={e => setExpertSpecialty(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-[#2D3748] text-sm focus:outline-none focus:border-[#4A5568] focus:ring-1 focus:ring-[#d4af37]">
                                    <option value="사주/명리">사주/명리</option>
                                    <option value="타로/점성술">타로/점성술</option>
                                    <option value="신점/무속">신점/무속</option>
                                    <option value="심리/명상">심리/명상</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-1 block">세션당 상담액 (원)</label>
                                <input required type="number" value={expertPrice} onChange={e => setExpertPrice(Number(e.target.value))} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-[#2D3748] text-sm focus:outline-none focus:border-[#4A5568] focus:ring-1 focus:ring-[#d4af37]" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-[#4A5568] mb-1 block">수익 배분비 (상담사 %)</label>
                                <input required type="number" min="0" max="100" value={expertShareRatio} onChange={e => setExpertShareRatio(Number(e.target.value))} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-[#4A5568] font-bold text-sm focus:outline-none focus:border-[#4A5568] focus:ring-1 focus:ring-[#d4af37]" />
                            </div>
                            <div className="md:col-span-2 lg:col-span-5 grid grid-cols-1 lg:grid-cols-2 gap-6 items-end mt-2">
                                <div>
                                    <label className="text-xs font-bold text-gray-600 mb-2 block">프로필 사진 첨부</label>
                                    <div className="flex items-center gap-4 bg-gray-50 border border-gray-300 rounded-lg p-3 h-[72px]">
                                        <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex justify-center items-center overflow-hidden shrink-0 relative">
                                            {expertImageUrl ? (
                                                <img src={expertImageUrl} alt="preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <UploadCloud className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={(e) => { 
                                                    const file = e.target.files?.[0];
                                                    if(file) handleImageUpload(file);
                                                }}
                                                className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-[#4A5568] file:text-white hover:file:bg-gray-600 cursor-pointer" 
                                                disabled={isUploadingImage}
                                            />
                                            {isUploadingImage && <p className="text-[10px] text-blue-500 mt-1 font-bold">사진 업로드 중...</p>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 mb-1 block">한줄 소개 (Bio)</label>
                                        <input required type="text" value={expertBio} onChange={e => setExpertBio(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-[#2D3748] text-sm focus:outline-none focus:border-[#4A5568] focus:ring-1 focus:ring-[#d4af37]" placeholder="짧고 강렬한 캐치프레이즈" />
                                    </div>
                                    <button type="submit" disabled={isRegistering || isUploadingImage} className="w-full py-3 h-[48px] bg-gradient-to-r from-[#4A5568] to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-bold rounded-lg transition-colors shadow-sm whitespace-nowrap disabled:opacity-50 flex items-center justify-center">
                                        {isRegistering ? "등록 중..." : "파트너 계정 생성"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
                <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-700">후기(리뷰) 관리</h3>
                        <select
                            className="bg-gray-50 border border-gray-300 rounded-xl p-2 text-[#2D3748] text-sm focus:outline-none focus:border-[#4A5568]"
                            value={selectedExpert || ''}
                            onChange={(e) => setSelectedExpert(Number(e.target.value))}
                        >
                            <option value="">전문가 선택</option>
                            {experts.map(ex => <option key={ex.id} value={ex.id}>{ex.display_name} ({ex.category})</option>)}
                        </select>
                    </div>

                    {!selectedExpert ? (
                        <div className="text-center py-10 text-gray-400">조회할 전문가를 선택해주세요.</div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">해당 전문가의 후기가 없습니다.</div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map(rev => (
                                <div key={rev.id} className={`p-4 rounded-xl border ${rev.is_hidden ? 'border-red-900/50 bg-red-900/10 opacity-70' : 'border-gray-200 bg-gray-50'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <span className="text-sm font-bold text-gray-700 mr-2">{rev.author_name}</span>
                                            <span className="text-[#4A5568] text-xs">★ {rev.rating}</span>
                                        </div>
                                        <button
                                            onClick={() => handleToggleReview(rev.id)}
                                            className={`text-xs px-2 py-1 rounded-md font-bold flex items-center gap-1 ${rev.is_hidden ? 'bg-[#4A5568] text-white' : 'bg-red-900/40 text-red-300'}`}
                                        >
                                            {rev.is_hidden ? <><Eye className="w-3 h-3" /> 보이기</> : <><EyeOff className="w-3 h-3" /> 숨기기</>}
                                        </button>
                                    </div>
                                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{rev.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Settlements Tab */}
            {activeTab === 'settlements' && (
                <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-700 mb-6">전체 정산 대기 및 내역</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 text-gray-500">
                                    <th className="py-3 px-4 font-normal">상담사</th>
                                    <th className="py-3 px-4 font-normal">금액</th>
                                    <th className="py-3 px-4 font-normal">발생 일시</th>
                                    <th className="py-3 px-4 font-normal">상태</th>
                                    <th className="py-3 px-4 font-normal text-right">처리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {settlements.map(set => (
                                    <tr key={set.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 font-bold text-gray-800">{set.expert_name}</td>
                                        <td className="py-3 px-4 text-green-400 font-bold">{set.amount.toLocaleString()}원</td>
                                        <td className="py-3 px-4 text-gray-500">{new Date(set.created_at).toLocaleString()}</td>
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
                                                <button onClick={() => handleCompleteSettlement(set.id)} className="px-3 py-1.5 bg-[#4A5568] hover:bg-gray-600 text-black font-bold rounded-lg text-xs transition-colors">
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
                    <div className="bg-white border border-gray-300 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <Edit2 className="w-5 h-5 text-[#4A5568]" /> {formData.id ? '상담사 수정' : '신규 상담사 등록'}
                            </h3>
                            <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-[#2D3748]"><EyeOff className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleSaveExpert} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-bold text-gray-600 mb-1 block">카테고리</label>
                                <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-[#2D3748] focus:outline-none focus:border-[#4A5568]">
                                    <option value="운세">운세</option>
                                    <option value="타로">타로</option>
                                    <option value="신점">신점 (히든)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-600 mb-1 block">이름</label>
                                <input required type="text" value={formData.display_name} onChange={e => setFormData({ ...formData, display_name: e.target.value })} className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-[#2D3748] focus:outline-none focus:border-[#4A5568]" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-600 mb-1 block">고유 코드 (ex: 002)</label>
                                <input required type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-[#2D3748] focus:outline-none focus:border-[#4A5568]" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-600 mb-1 block">태그 (콤마로 구분)</label>
                                <input type="text" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} placeholder="#재회, #어장" className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-[#2D3748] focus:outline-none focus:border-[#4A5568]" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-600 mb-1 block">평점</label>
                                <input type="number" step="0.1" value={formData.rating} onChange={e => setFormData({ ...formData, rating: parseFloat(e.target.value) })} className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-[#2D3748] focus:outline-none focus:border-[#4A5568]" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-600 mb-1 block">평균 상담시간(분)</label>
                                <input type="number" value={formData.avg_minutes} onChange={e => setFormData({ ...formData, avg_minutes: parseInt(e.target.value) })} className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-[#2D3748] focus:outline-none focus:border-[#4A5568]" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-bold text-gray-600 mb-1 block">이미지 URL</label>
                                <input type="text" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-[#2D3748] focus:outline-none focus:border-[#4A5568]" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-bold text-gray-600 mb-1 block">상단 배너 텍스트 (예: 선착순 4명)</label>
                                <input type="text" value={formData.banner_text} onChange={e => setFormData({ ...formData, banner_text: e.target.value })} className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-[#2D3748] focus:outline-none focus:border-[#4A5568]" />
                            </div>
                            <div className="flex items-center gap-4 md:col-span-2 p-3 bg-gray-50 rounded-xl border border-gray-100 mt-2">
                                <label className="flex items-center gap-2 text-[#2D3748] font-bold cursor-pointer">
                                    <input type="checkbox" checked={formData.is_online} onChange={e => setFormData({ ...formData, is_online: e.target.checked })} className="w-5 h-5 accent-[#d4af37]" />
                                    현재 온라인(상담가능)
                                </label>
                                <label className="flex items-center gap-2 text-[#2D3748] font-bold cursor-pointer ml-4">
                                    <input type="checkbox" checked={formData.is_free_available} onChange={e => setFormData({ ...formData, is_free_available: e.target.checked })} className="w-5 h-5 accent-[#d4af37]" />
                                    첫회 무료 여부
                                </label>
                            </div>

                            <button type="submit" className="md:col-span-2 mt-4 py-3.5 rounded-xl bg-[#4A5568] hover:bg-gray-600 text-black font-black text-lg transition-all shadow-lg">
                                저장하기
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
