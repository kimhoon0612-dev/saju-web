"use client";

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingBag, Users, ShieldAlert, Activity, DollarSign, Eye, Search, AlertTriangle, CheckCircle, Database, Sparkles, X, UploadCloud, Edit2 } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import ExpertsManager from './experts/ExpertsManager';

type TabId = 'analytics' | 'goods' | 'market' | 'system' | 'experts' | 'users';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<TabId>('analytics');

    // Module States
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [chartDataHistory, setChartDataHistory] = useState<{ name: string, users: number }[]>([]);
    const [marketData, setMarketData] = useState<any>(null);
    const [systemData, setSystemData] = useState<any>(null);
    const [inventoryData, setInventoryData] = useState<any[]>([]);
    const [usersList, setUsersList] = useState<any[]>([]);

    // Sandbox State
    const [sandboxPrompt, setSandboxPrompt] = useState("");
    const [sandboxTheme, setSandboxTheme] = useState("wealth");
    const [sandboxPrice, setSandboxPrice] = useState<number>(15000);
    const [sandboxOriginalPrice, setSandboxOriginalPrice] = useState<number>(0);
    const [sandboxSalesTags, setSandboxSalesTags] = useState("");
    const [sandboxResult, setSandboxResult] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [goodsStats, setGoodsStats] = useState<any>(null);

    // Upload/Edit State
    const [uploadMode, setUploadMode] = useState<'sandbox' | 'direct'>('sandbox');
    const [directName, setDirectName] = useState("");
    const [directPrice, setDirectPrice] = useState<number>(15000);
    const [directDescription, setDirectDescription] = useState("");
    const [directTheme, setDirectTheme] = useState("wealth");
    const [directOriginalPrice, setDirectOriginalPrice] = useState<number>(0);
    const [directSalesTags, setDirectSalesTags] = useState("");
    const [directImageFile, setDirectImageFile] = useState<File | null>(null);
    const [directCategory, setDirectCategory] = useState("amulet");
    const [directCoinAmount, setDirectCoinAmount] = useState<number>(0);
    const [directBonusCoins, setDirectBonusCoins] = useState<number>(0);
    const [isUploading, setIsUploading] = useState(false);

    // Edit Modal State
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [editName, setEditName] = useState("");
    const [editPrice, setEditPrice] = useState<number>(0);
    const [editDescription, setEditDescription] = useState("");
    const [editTheme, setEditTheme] = useState("wealth");
    const [editOriginalPrice, setEditOriginalPrice] = useState<number>(0);
    const [editSalesTags, setEditSalesTags] = useState("");
    const [editImageFile, setEditImageFile] = useState<File | null>(null);
    const [editCoinAmount, setEditCoinAmount] = useState<number>(0);
    const [editBonusCoins, setEditBonusCoins] = useState<number>(0);

    // Expert Registration State
    const [expertName, setExpertName] = useState("");
    const [expertSpecialty, setExpertSpecialty] = useState("사주/명리");
    const [expertBio, setExpertBio] = useState("");
    const [expertPrice, setExpertPrice] = useState<number>(10000);
    const [isRegistering, setIsRegistering] = useState(false);

    // Fetch Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (activeTab === 'analytics') {
            fetchAnalytics();
            // Start real-time polling
            interval = setInterval(fetchAnalytics, 3000);
        }
        if (activeTab === 'goods') fetchInventory();
        if (activeTab === 'market') fetchMarket();
        if (activeTab === 'system') fetchSystem();
        if (activeTab === 'users') fetchUsers();

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [activeTab]);

    const fetchAnalytics = async () => {
        try {
            const [trafficRes, revenueRes] = await Promise.all([
                fetch('/api/admin/analytics/traffic').then(r => r.json()),
                fetch('/api/admin/analytics/revenue').then(r => r.json())
            ]);
            setAnalyticsData({ traffic: trafficRes, revenue: revenueRes });

            // Push to historical chart data
            setChartDataHistory(prev => {
                const now = new Date();
                const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
                const nextPoints = [...prev, { name: timeStr, users: trafficRes.current_concurrent_users }];
                if (nextPoints.length > 10) nextPoints.shift(); // Keep last 10 ticks
                return nextPoints;
            });
        } catch (e) {
            console.error(e);
        }
    };

    const fetchInventory = async () => {
        try {
            const [invRes, statsRes] = await Promise.all([
                fetch('/api/admin/talisman/inventory', { cache: 'no-store' }),
                fetch('/api/admin/talisman/stats', { cache: 'no-store' })
            ]);
            const invData = await invRes.json();
            const statsData = await statsRes.json();

            setInventoryData(invData.catalog || []);
            setGoodsStats(statsData.data || null);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchMarket = async () => {
        try {
            const [logsRes, settleRes] = await Promise.all([
                fetch('/api/admin/marketplace/matching-logs', { cache: 'no-store' }).then(r => r.json()),
                fetch('/api/admin/marketplace/settlements', { cache: 'no-store' }).then(r => r.json())
            ]);
            setMarketData({ logs: logsRes, settlements: settleRes });
        } catch (e) {
            console.error(e);
        }
    };

    const fetchSystem = async () => {
        try {
            const [healthRes, auditRes] = await Promise.all([
                fetch('/api/admin/system/health', { cache: 'no-store' }).then(r => r.json()),
                fetch('/api/admin/system/privacy-audit', { cache: 'no-store' }).then(r => r.json())
            ]);
            setSystemData({ health: healthRes, audit: auditRes });
        } catch (e) {
            console.error(e);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users', { cache: 'no-store' });
            const data = await res.json();
            setUsersList(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSandboxSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);
        try {
            const res = await fetch('/api/admin/talisman/sandbox', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: sandboxPrompt, theme: sandboxTheme })
            });
            const data = await res.json();
            setSandboxResult(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePublish = async () => {
        if (!sandboxResult) return;
        try {
            const themeName = sandboxTheme === 'wealth' ? '재물' : sandboxTheme === 'love' ? '애정' : '건강';
            await fetch('/api/admin/talisman/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `${themeName} 프리미엄 AI 부적`,
                    theme: sandboxTheme,
                    price_points: sandboxPrice,
                    original_price: sandboxOriginalPrice > 0 ? sandboxOriginalPrice : null,
                    sales_tags: sandboxSalesTags || null,
                    prompt_template: sandboxPrompt,
                    is_active: true,
                    image_url: sandboxResult.preview_image_url
                })
            });
            alert('인벤토리에 성공적으로 배포되었습니다. 공용 상점에 즉시 반영됩니다!');
            fetchInventory();
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteProduct = async (id: number) => {
        if (!confirm('정말로 이 부적을 인벤토리에서 삭제하시겠습니까?')) return;
        try {
            // Optimistically update UI
            setInventoryData(prev => prev.filter(item => item.id !== id));
            await fetch(`/api/admin/talisman/inventory/${id}`, { method: 'DELETE' });
            // Re-fetch to ensure sync
            fetchInventory();
        } catch (e) {
            console.error(e);
        }
    };

    const handleDirectUploadImage = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch('/api/admin/talisman/upload', {
            method: 'POST',
            body: formData
        });
        if (!res.ok) throw new Error("업로드 실패");
        const data = await res.json();
        return data.document_url;
    };

    const handleDirectSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!directName || (!directImageFile && directCategory !== 'coin')) return alert("상품명과 대표 이미지를 등록해주세요");
        setIsUploading(true);
        try {
            let imageUrl = "/talismans/wealth.png";
            if (directImageFile) {
                imageUrl = await handleDirectUploadImage(directImageFile);
            }

            await fetch('/api/admin/talisman/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: directName,
                    theme: directCategory === 'coin' ? 'coin' : directTheme,
                    price_points: directPrice,
                    original_price: directOriginalPrice > 0 ? directOriginalPrice : null,
                    sales_tags: directSalesTags || null,
                    prompt_template: directDescription || "관리자 직접 업로드 상품",
                    category: directCategory,
                    coin_amount: directCategory === 'coin' ? directCoinAmount : 0,
                    bonus_coins: directCategory === 'coin' ? directBonusCoins : 0,
                    is_active: true,
                    image_url: imageUrl
                })
            });
            alert('인벤토리에 성공적으로 등록되었습니다.');
            setDirectName("");
            setDirectDescription("");
            setDirectImageFile(null);
            setDirectCoinAmount(0);
            setDirectBonusCoins(0);
            fetchInventory();
        } catch (e) {
            console.error(e);
            alert("등록 실패");
        } finally {
            setIsUploading(false);
        }
    };

    const handleEditOpen = (product: any) => {
        setEditingProduct(product);
        setEditName(product.name);
        setEditPrice(product.price);
        setEditDescription(product.description || "");
        setEditTheme(product.theme);
        setEditOriginalPrice(product.original_price || 0);
        setEditSalesTags(product.sales_tags || "");
        setEditImageFile(null);
        setEditCoinAmount(product.coin_amount || 0);
        setEditBonusCoins(product.bonus_coins || 0);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        try {
            let imageUrl = editingProduct.image_url;
            if (editImageFile) {
                imageUrl = await handleDirectUploadImage(editImageFile);
            }

            await fetch(`/api/admin/talisman/inventory/${editingProduct.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editName,
                    theme: editTheme,
                    price_points: editPrice,
                    original_price: editOriginalPrice > 0 ? editOriginalPrice : null,
                    sales_tags: editSalesTags || null,
                    prompt_template: editDescription || "수정된 상품",
                    category: editingProduct.category,
                    coin_amount: editingProduct.category === 'coin' ? editCoinAmount : 0,
                    bonus_coins: editingProduct.category === 'coin' ? editBonusCoins : 0,
                    is_active: true,
                    image_url: imageUrl
                })
            });
            alert('상품이 수정되었습니다.');
            setEditingProduct(null);
            fetchInventory();
        } catch (e) {
            console.error(e);
            alert("수정 실패");
        } finally {
            setIsUploading(false);
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
                    price_per_session: expertPrice
                })
            });
            alert('전문가 프로필이 성공적으로 등록되었습니다.');
            setExpertName(""); setExpertBio("");
            fetchMarket();
        } catch (e) {
            console.error(e);
        } finally {
            setIsRegistering(false);
        }
    };

    // UI Components per Tab
    const renderAnalytics = () => {
        if (!analyticsData) return <div className="text-[#d4af37]/60 font-medium p-10 animate-pulse">데이터 통합 집계 중...</div>;
        const { traffic, revenue } = analyticsData;

        // Use dynamically growing historical data, or mock if we just loaded
        const displayChartData = chartDataHistory.length > 1 ? chartDataHistory : [
            { name: '최근 1', users: traffic.current_concurrent_users - 50 },
            { name: '최근 2', users: traffic.current_concurrent_users - 20 },
            { name: '비실시간 연결', users: traffic.current_concurrent_users }
        ];

        const COLORS = ['#8B5CF6', '#d4af37', '#EC4899', '#3B82F6'];

        return (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
                <h2 className="text-2xl font-bold text-amber-100 tracking-tight mb-2 flex items-center gap-2"><Sparkles className="w-6 h-6 text-[#d4af37]" /> 실시간 데이터 관제 (트래픽 & 통계)</h2>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-[#1a142d]/80 rounded-3xl p-6 shadow-xl border border-[#d4af37]/20 hover:border-[#d4af37]/40 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                            <Activity className="w-5 h-5 text-purple-400" />
                            <span className="text-sm font-medium text-white/50">동시 접속자</span>
                        </div>
                        <div className="text-4xl font-black text-white">{traffic.current_concurrent_users.toLocaleString()}</div>
                    </div>
                    <div className="bg-[#1a142d]/80 rounded-3xl p-6 shadow-xl border border-[#d4af37]/20 hover:border-[#d4af37]/40 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                            <Eye className="w-5 h-5 text-[#d4af37]" />
                            <span className="text-sm font-medium text-white/50">일간 활성(DAU)</span>
                        </div>
                        <div className="text-4xl font-black text-white">{traffic.dau.toLocaleString()}</div>
                    </div>
                    <div className="bg-[#1a142d]/80 rounded-3xl p-6 shadow-xl border border-[#d4af37]/20 hover:border-[#d4af37]/40 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="w-5 h-5 text-indigo-400" />
                            <span className="text-sm font-medium text-white/50">월간 활성(MAU)</span>
                        </div>
                        <div className="text-4xl font-black text-white">{traffic.mau.toLocaleString()}</div>
                    </div>
                    <div className="bg-[#1a142d]/80 rounded-3xl p-6 shadow-xl border border-[#d4af37]/20 border-l-4 border-l-[#d4af37] hover:border-[#d4af37]/40 transition-colors">
                        <div className="flex items-center gap-3 mb-2">
                            <DollarSign className="w-5 h-5 text-green-400" />
                            <span className="text-sm font-medium text-white/50">누적 매출 (원)</span>
                        </div>
                        <div className="text-3xl font-black text-[#d4af37]">{revenue.total_revenue.toLocaleString()}</div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 bg-[#1a142d]/80 rounded-3xl p-6 shadow-xl border border-[#d4af37]/20 h-[400px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-amber-100 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-[#d4af37]" /> 실시간 트래픽 추이
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <span className="text-xs text-green-400 font-bold tracking-widest">LIVE DATA CONNECTED</span>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height="85%">
                            <LineChart data={displayChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                                <XAxis dataKey="name" stroke="#ffffff60" />
                                <YAxis stroke="#ffffff60" domain={['auto', 'auto']} />
                                <Tooltip contentStyle={{ backgroundColor: '#1a142d', borderColor: '#d4af37', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#d4af37' }} />
                                <Line type="monotone" dataKey="users" stroke="#d4af37" strokeWidth={3} dot={{ r: 4, fill: '#1a142d', stroke: '#d4af37' }} activeDot={{ r: 6, fill: '#d4af37' }} isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-[#1a142d]/80 rounded-3xl p-6 shadow-xl border border-[#d4af37]/20 h-[400px]">
                        <h3 className="text-lg font-bold text-amber-100 mb-4">유입 경로 분석</h3>
                        <ResponsiveContainer width="100%" height="85%">
                            <PieChart>
                                <Pie
                                    data={traffic.traffic_sources}
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="percentage"
                                    nameKey="source"
                                    stroke="none"
                                >
                                    {traffic.traffic_sources.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1a142d', borderColor: '#d4af37', borderRadius: '12px', color: '#fff' }} />
                                <Legend wrapperStyle={{ color: '#fff' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    };

    const renderGoods = () => (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-amber-100 tracking-tight mb-2 flex items-center gap-2"><Sparkles className="w-6 h-6 text-[#d4af37]" /> 디지털 상점 / 부적 관리</h2>

            {goodsStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
                    <div className="bg-[#1a142d]/80 rounded-3xl p-6 shadow-xl border border-[#d4af37]/20 hover:border-[#d4af37]/40 transition-colors">
                        <h3 className="text-white/50 text-sm font-medium mb-2">오늘 스토어 매출</h3>
                        <p className="text-3xl font-bold text-white">{goodsStats.daily_revenue.toLocaleString()} 원</p>
                    </div>
                    <div className="bg-[#1a142d]/80 rounded-3xl p-6 shadow-xl border border-[#d4af37]/20 hover:border-[#d4af37]/40 transition-colors">
                        <h3 className="text-white/50 text-sm font-medium mb-2">이번 달 스토어 매출</h3>
                        <p className="text-3xl font-bold text-white">{goodsStats.monthly_revenue.toLocaleString()} 원</p>
                    </div>
                    <div className="bg-gradient-to-br from-[#d4af37]/20 to-orange-500/10 rounded-3xl p-6 shadow-xl border border-[#d4af37]/40 hover:border-[#d4af37]/60 transition-colors">
                        <h3 className="text-amber-200 text-sm font-bold mb-2 flex items-center gap-1">
                            <Sparkles className="w-4 h-4" /> 디지털 상점 누적 매출액
                        </h3>
                        <p className="text-3xl font-black text-amber-400">{goodsStats.total_revenue.toLocaleString()} 원</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Prompt Sandbox */}
                <div className="bg-[#1a142d]/80 rounded-3xl p-6 shadow-xl border border-[#d4af37]/20">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-400" /> 상품 추가
                        </h3>
                        <div className="flex bg-[#110e1b] rounded-lg p-1 border border-[#d4af37]/20">
                            <button type="button" onClick={() => setUploadMode('sandbox')} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${uploadMode === 'sandbox' ? 'bg-[#d4af37] text-black' : 'text-white/50 hover:text-white'}`}>AI 샌드박스</button>
                            <button type="button" onClick={() => setUploadMode('direct')} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${uploadMode === 'direct' ? 'bg-[#d4af37] text-black' : 'text-white/50 hover:text-white'}`}>직접 업로드</button>
                        </div>
                    </div>

                    {uploadMode === 'sandbox' ? (
                        <>
                            <form onSubmit={handleSandboxSubmit} className="flex flex-col gap-4">
                                <div>
                                    <label className="text-sm font-bold text-white/70 mb-1 block">부적 테마 설정</label>
                                    <select
                                        value={sandboxTheme} onChange={e => setSandboxTheme(e.target.value)}
                                        className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                                    >
                                        <option value="wealth">재물/성공 (Wealth)</option>
                                        <option value="love">애정/궁합 (Love)</option>
                                        <option value="health">건강/평안 (Health)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-white/70 mb-1 block">부적 설정액 (원)</label>
                                    <input
                                        type="number"
                                        value={sandboxPrice} onChange={e => setSandboxPrice(Number(e.target.value))}
                                        className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                                        placeholder="예: 15000"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-white/70 mb-1 block">이커머스 정가 (원)</label>
                                        <input
                                            type="number"
                                            value={sandboxOriginalPrice} onChange={e => setSandboxOriginalPrice(Number(e.target.value))}
                                            className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                                            placeholder="예: 25000"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-white/70 mb-1 block">뱃지 / 커머스 태그</label>
                                        <input
                                            type="text"
                                            value={sandboxSalesTags} onChange={e => setSandboxSalesTags(e.target.value)}
                                            className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                                            placeholder="쉼표로 구분 (예: BEST,무료배송)"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-white/70 mb-1 block">프롬프트 상세 템플릿</label>
                                    <textarea
                                        value={sandboxPrompt} onChange={e => setSandboxPrompt(e.target.value)}
                                        rows={4}
                                        className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] resize-none"
                                        placeholder="예: neon cyberpunk style lucky charm, detailed elements..."
                                    />
                                </div>
                                <button
                                    type="submit" disabled={isGenerating}
                                    className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-[#111] font-bold transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                                >
                                    {isGenerating ? "제작 중 (AI 호출)..." : "프롬프트 시뮬레이션 엔진 가동"}
                                </button>
                            </form>

                            {sandboxResult && (
                                <div className="mt-6 border-t border-[#d4af37]/20 pt-6">
                                    <h4 className="text-sm font-bold text-white/70 mb-2">테스트 렌더링 결과 (생성시간: {sandboxResult.generation_time_ms}ms)</h4>
                                    <img src={sandboxResult.preview_image_url} alt="sandbox result" className="w-full h-48 object-cover rounded-xl border border-[#d4af37]/30 shadow-sm" />
                                    <button onClick={handlePublish} className="mt-3 w-full py-2 bg-[#d4af37] hover:bg-amber-400 rounded-lg text-[#111] text-sm font-bold transition-colors shadow-[0_0_10px_rgba(212,175,55,0.3)]">상점 인벤토리에 정식 등록하기</button>
                                </div>
                            )}
                        </>
                    ) : (
                        <form onSubmit={handleDirectSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="text-sm font-bold text-white/70 mb-1 block">상품 유형</label>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setDirectCategory('amulet')} className={`flex-1 py-2 rounded-lg font-bold text-sm ${directCategory === 'amulet' ? 'bg-[#d4af37] text-black shadow-[0_0_10px_rgba(212,175,55,0.4)]' : 'bg-[#110e1b] text-white/50 border border-[#d4af37]/30 hover:bg-[#d4af37]/10'} transition-all`}>부적 (디지털)</button>
                                    <button type="button" onClick={() => setDirectCategory('goods')} className={`flex-1 py-2 rounded-lg font-bold text-sm ${directCategory === 'goods' ? 'bg-[#d4af37] text-black shadow-[0_0_10px_rgba(212,175,55,0.4)]' : 'bg-[#110e1b] text-white/50 border border-[#d4af37]/30 hover:bg-[#d4af37]/10'} transition-all`}>실물 굿즈</button>
                                    <button type="button" onClick={() => setDirectCategory('coin')} className={`flex-1 py-2 rounded-lg font-bold text-sm ${directCategory === 'coin' ? 'bg-[#d4af37] text-black shadow-[0_0_10px_rgba(212,175,55,0.4)]' : 'bg-[#110e1b] text-white/50 border border-[#d4af37]/30 hover:bg-[#d4af37]/10'} transition-all`}>코인 패키지</button>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-sm font-bold text-white/70 mb-1 block">{directCategory === 'coin' ? '패키지 명' : '상품명'}</label>
                                <input required type="text" value={directName} onChange={e => setDirectName(e.target.value)} className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" placeholder={directCategory === 'coin' ? "예: 1000 코인 패키지" : "예: 무병장수부 또는 금전운 팔찌"} />
                            </div>
                            
                            <div>
                                <label className="text-sm font-bold text-white/70 mb-1 block">판매 설정액 (원)</label>
                                <input required type="number" value={directPrice} onChange={e => setDirectPrice(Number(e.target.value))} className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" />
                            </div>

                            {/* Conditional Rendering Default vs Coin */}
                            {directCategory === 'coin' ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-bold text-white/70 mb-1 block">지급 코인 (기본)</label>
                                            <input required type="number" value={directCoinAmount} onChange={e => setDirectCoinAmount(Number(e.target.value))} className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37]" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-white/70 mb-1 block">추가 보너스 코인</label>
                                            <input required type="number" value={directBonusCoins} onChange={e => setDirectBonusCoins(Number(e.target.value))} className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37]" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-white/70 mb-1 block">커머스 태그 (Sales Tags)</label>
                                        <input type="text" value={directSalesTags} onChange={e => setDirectSalesTags(e.target.value)} className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37]" placeholder="예: BEST, 인기상품" />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="text-sm font-bold text-white/70 mb-1 block">상품 테마 속성</label>
                                        <select value={directTheme} onChange={e => setDirectTheme(e.target.value)} className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]">
                                            <option value="wealth">재물/사업 (Wealth)</option>
                                            <option value="love">애정/인연 (Love)</option>
                                            <option value="health">건강/수호 (Health)</option>
                                            <option value="wood">기타 소원 (Wish)</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-bold text-white/70 mb-1 block">이커머스 정가 (원)</label>
                                            <input type="number" value={directOriginalPrice} onChange={e => setDirectOriginalPrice(Number(e.target.value))} className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37]" placeholder="예: 25000" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-white/70 mb-1 block">커머스 태그 (Sales Tags)</label>
                                            <input type="text" value={directSalesTags} onChange={e => setDirectSalesTags(e.target.value)} className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37]" placeholder="예: 첫결제할인,무료배송" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-white/70 mb-1 block">상세 설명 / 효능</label>
                                        <textarea required value={directDescription} onChange={e => setDirectDescription(e.target.value)} rows={12} className="w-full min-h-[200px] bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] resize-y" placeholder="프리미엄 상품 설명..." />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-white/70 mb-1 block">대표 이미지 업로드</label>
                                        <input required={directCategory !== 'coin'} type="file" accept="image/*" onChange={e => setDirectImageFile(e.target.files?.[0] || null)} className="w-full text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#d4af37]/20 file:text-[#d4af37] hover:file:bg-[#d4af37]/30" />
                                    </div>
                                </>
                            )}
                            
                            <button type="submit" disabled={isUploading} className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-[#2AC1BC] to-[#1F9B96] hover:from-[#1F9B96] hover:to-[#177874] text-white font-bold transition-all disabled:opacity-50">
                                {isUploading ? "업로드 중..." : "직접 업로드하여 정식 배포"}
                            </button>
                        </form>
                    )}
                </div>

                {/* Inventory DB */}
                <div className="bg-[#1a142d]/80 rounded-3xl p-6 shadow-xl border border-[#d4af37]/20 flex flex-col">
                    <h3 className="text-lg font-bold text-amber-100 mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-[#d4af37]" /> 활성 인벤토리 카탈로그
                    </h3>
                    <div className="flex-1 border border-[#d4af37]/20 rounded-xl overflow-hidden bg-[#110e1b]">
                        <table className="w-full text-left text-sm text-white/80">
                            <thead className="bg-[#d4af37]/10 text-amber-200 border-b border-[#d4af37]/20">
                                <tr>
                                    <th className="p-3 font-semibold">유형</th>
                                    <th className="p-3 font-semibold">상품명</th>
                                    <th className="p-3 font-semibold">테마</th>
                                    <th className="p-3 font-semibold">판매가</th>
                                    <th className="p-3 font-semibold">상태</th>
                                    <th className="p-3 font-semibold">관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryData.map((item: any) => (
                                    <tr key={item.id} className="border-b border-[#d4af37]/10 hover:bg-[#1a142d]/50 transition-colors">
                                        <td className="p-3">
                                            {item.category === 'coin' && <span className="bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded text-[10px] font-bold border border-yellow-500/30">코인</span>}
                                            {item.category === 'goods' && <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-500/30">굿즈</span>}
                                            {item.category === 'amulet' && <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-500/30">부적</span>}
                                        </td>
                                        <td className="p-3 font-bold text-white">{item.name}</td>
                                        <td className="p-3 text-white/70">{item.theme}</td>
                                        <td className="p-3 font-bold text-amber-400">{item.price.toLocaleString()} 원</td>
                                        <td className="p-3"><span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-md text-xs font-bold border border-green-500/30">판매중</span></td>
                                        <td className="p-3">
                                            <div className="flex gap-3">
                                                <button onClick={() => handleEditOpen(item)} className="text-blue-400 hover:text-blue-300 text-xs font-semibold focus:outline-none">수정</button>
                                                <button onClick={() => handleDeleteProduct(item.id)} className="text-red-400 hover:text-red-300 text-xs font-semibold focus:outline-none">삭제</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {inventoryData.length === 0 && (
                                    <tr><td colSpan={5} className="p-6 text-center text-white/40">등록된 상품이 없습니다. 샌드박스에서 추가해주세요.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMarket = () => {
        if (!marketData) return <div className="text-[#d4af37]/60 font-medium p-10 animate-pulse">마켓플레이스 데이터 로딩 중...</div>;
        const { logs, settlements } = marketData;

        return (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
                <h2 className="text-2xl font-bold text-amber-100 tracking-tight mb-2 flex items-center gap-2"><Sparkles className="w-6 h-6 text-[#d4af37]" /> 전문가 플랫폼 통합 관리 (매칭 & 정산)</h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Matching Triggers List */}
                    <div className="bg-[#1a142d]/80 rounded-3xl p-6 shadow-xl border border-[#d4af37]/20 hover:border-[#d4af37]/40 transition-colors flex flex-col h-[400px]">
                        <h3 className="text-lg font-bold text-amber-100 mb-1 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" /> AI-전문가 매칭 트리거 로그
                        </h3>
                        <p className="text-xs text-white/50 mb-4">현재까지 총 <span className="text-white">{logs.total_ai_triggers}</span>건의 심층상담 권유 중 <span className="font-bold text-[#d4af37]">{logs.successful_matches}건이 결제됨</span> (전환율 {logs.conversion_rate}%)</p>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                            {logs.recent_logs.map((log: any, idx: number) => (
                                <div key={idx} className="bg-[#110e1b] border border-[#d4af37]/20 rounded-xl p-3 flex flex-col gap-1 transition-colors hover:border-[#d4af37]/40">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-white/80">예약 ID: #{log.reservation_id}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${log.status === 'COMPLETED' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>
                                            {log.status === 'COMPLETED' ? '완료됨' : '진행중'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-white/90 mt-1 font-medium">AI 컨텍스트: {log.trigger_context}</p>
                                    <span className="text-[10px] text-white/40">{new Date(log.created_at).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Settlements Table */}
                    <div className="bg-[#1a142d]/80 rounded-3xl p-6 shadow-xl border border-[#d4af37]/20 hover:border-[#d4af37]/40 transition-colors flex flex-col h-[400px] xl:col-span-2">
                        <h3 className="text-lg font-bold text-amber-100 mb-1 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-400" /> 월별 정산 리포트 산출
                        </h3>
                        <p className="text-xs text-white/50 mb-4">대상 기간: <span className="text-white">{settlements.period}</span> (에스크로 거래 완료 기준)</p>

                        <div className="flex-1 border border-[#d4af37]/20 rounded-xl overflow-hidden bg-[#110e1b] w-full overflow-x-auto">
                            <table className="w-full text-left text-sm text-white/80 whitespace-nowrap">
                                <thead className="bg-[#d4af37]/10 text-amber-200 border-b border-[#d4af37]/20">
                                    <tr>
                                        <th className="p-3 font-semibold">전문가</th>
                                        <th className="p-3 font-semibold text-right">코인 매출(원)</th>
                                        <th className="p-3 font-semibold text-right">060 매출(원)</th>
                                        <th className="p-3 font-semibold text-right">플랫폼 수수료(10~40%)</th>
                                        <th className="p-3 font-semibold text-right">최종 지급액(원)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {settlements.settlements.map((s: any) => (
                                        <tr key={s.expert_id} className="border-b border-[#d4af37]/10 hover:bg-[#1a142d]/50 transition-colors">
                                            <td className="p-3 font-bold text-white">{s.expert_name}</td>
                                            <td className="p-3 text-right text-yellow-400 font-medium">{Math.floor(s.final_settlement_amount * 0.4).toLocaleString()}</td>
                                            <td className="p-3 text-right text-blue-400 font-medium">{Math.floor(s.final_settlement_amount * 0.6).toLocaleString()}</td>
                                            <td className="p-3 text-right text-red-400 font-medium">-{s.fee_deducted.toLocaleString()}</td>
                                            <td className="p-3 text-right text-[#d4af37] font-black">{s.final_settlement_amount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {settlements.settlements.length === 0 && (
                                        <tr><td colSpan={5} className="p-6 text-center text-white/40">정산 내역이 없습니다.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <button className="mt-4 w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20">
                            이번 달 정산 일괄 승인 및 송출
                        </button>
                    </div>

                    {/* Expert Registration Form */}
                    <div className="bg-[#1a142d]/80 rounded-3xl p-6 shadow-xl border border-[#d4af37]/20 hover:border-[#d4af37]/40 transition-colors flex flex-col lg:col-span-3">
                        <h3 className="text-lg font-bold text-amber-100 mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-400" /> 신규 전문가 섭외 / 등록
                        </h3>
                        <form onSubmit={handleExpertRegister} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="text-xs font-bold text-white/70 mb-1 block">활동명 (닉네임)</label>
                                <input required type="text" value={expertName} onChange={e => setExpertName(e.target.value)} className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" placeholder="예: 도원선사" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-white/70 mb-1 block">전문 분야</label>
                                <select value={expertSpecialty} onChange={e => setExpertSpecialty(e.target.value)} className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]">
                                    <option value="사주/명리">사주/명리</option>
                                    <option value="타로/점성술">타로/점성술</option>
                                    <option value="신점/무속">신점/무속</option>
                                    <option value="심리/명상">심리/명상</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-white/70 mb-1 block">세션당 상담액 (원)</label>
                                <input required type="number" value={expertPrice} onChange={e => setExpertPrice(Number(e.target.value))} className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" />
                            </div>
                            <div className="md:col-span-2 lg:col-span-4 grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
                                <div className="lg:col-span-3">
                                    <label className="text-xs font-bold text-white/70 mb-1 block">한줄 소개 (Bio)</label>
                                    <input required type="text" value={expertBio} onChange={e => setExpertBio(e.target.value)} className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" placeholder="짧고 강렬한 캐치프레이즈" />
                                </div>
                                <button type="submit" disabled={isRegistering} className="w-full py-2.5 bg-gradient-to-r from-[#d4af37] to-amber-500 hover:from-amber-400 hover:to-amber-300 text-[#111] font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(212,175,55,0.3)] whitespace-nowrap">
                                    {isRegistering ? "등록 중..." : "시스템에 파트너 등록"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    const renderSystem = () => {
        if (!systemData) return <div className="text-[#d4af37]/60 font-medium p-10 animate-pulse">시스템 상태 체크 중...</div>;
        const { health, audit } = systemData;

        return (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
                <h2 className="text-2xl font-bold text-amber-100 tracking-tight mb-2 flex items-center gap-2"><Sparkles className="w-6 h-6 text-[#d4af37]" /> 시스템 설정 및 보안 관리</h2>

                {/* Core API Health */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#1a142d]/80 border border-[#d4af37]/20 shadow-xl rounded-3xl p-6 flex flex-col hover:border-[#d4af37]/40 transition-colors">
                        <h3 className="text-sm font-bold text-amber-200 mb-3">KASI 한국천문연구원 API</h3>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-white/50 bg-[#110e1b] px-2 py-1 rounded-full border border-white/10">Latency: {health.kasi_api.latency_ms}ms</span>
                            <CheckCircle className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                    <div className="bg-[#1a142d]/80 border border-[#d4af37]/20 shadow-xl rounded-3xl p-6 flex flex-col hover:border-[#d4af37]/40 transition-colors">
                        <h3 className="text-sm font-bold text-amber-200 mb-3">LiveKit WebRTC 화상서버</h3>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-white/50 bg-[#110e1b] px-2 py-1 rounded-full border border-white/10">Latency: {health.livekit_webrtc.latency_ms}ms</span>
                            <CheckCircle className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                    <div className={`bg-[#1a142d]/80 shadow-xl rounded-3xl p-6 flex flex-col transition-colors ${health.openai_api.status !== 'healthy' ? 'border-red-500/50 bg-red-900/10' : 'border-[#d4af37]/20 hover:border-[#d4af37]/40'}`}>
                        <h3 className="text-sm font-bold text-amber-200 mb-3">OpenAI LLM 챗봇 엔진</h3>
                        <div className="flex justify-between items-center mb-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full border ${health.openai_api.status !== 'healthy' ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-[#110e1b] text-white/50 border-white/10'}`}>Latency: {health.openai_api.latency_ms}ms</span>
                            {health.openai_api.status === 'healthy' ? <CheckCircle className="w-6 h-6 text-green-400" /> : <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />}
                        </div>
                        {health.openai_api.message && health.openai_api.status !== 'healthy' && (
                            <span className="text-xs font-bold text-red-300 bg-red-500/20 p-2 rounded-lg border border-red-500/30">{health.openai_api.message}</span>
                        )}
                    </div>
                </div>

                {/* Privacy Volatile Audit Logs */}
                <div className="bg-[#1a142d]/80 border border-red-500/20 rounded-3xl p-6 shadow-xl flex flex-col h-[500px]">
                    <h3 className="text-lg font-bold text-red-400 mb-1 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5" /> 개인정보 휘발성 파기 보안 감사 로그 (Volatile Wipe)
                    </h3>
                    <p className="text-xs text-white/50 mb-4 font-medium">사용자 출생 정보 연산 이후 즉각적인 메모리 파기 상태를 감시합니다.</p>

                    <div className="flex-1 overflow-y-auto border border-[#d4af37]/20 rounded-xl bg-[#110e1b] p-3 space-y-1.5 font-mono text-[11px] custom-scrollbar">
                        {audit.audit_logs.map((log: any, idx: number) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between border border-white/5 bg-[#1a142d] rounded-lg p-2.5 hover:border-white/10 transition-colors">
                                <span className="text-white/40 font-medium sm:w-44 mb-1 sm:mb-0">{log.timestamp.replace('T', ' ')}</span>
                                <span className="text-indigo-400 font-bold flex-1 sm:ml-4">[{log.process_id}] 메모리 파기 절차 발동</span>
                                <span className={`font-black mt-1 sm:mt-0 ${log.status === 'SUCCESS' ? 'text-green-400' : 'text-red-500 animate-pulse'}`}>
                                    {log.status === 'SUCCESS' ? '파기 성공' : '재시도 필요!'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderUsers = () => {
        return (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
                <h2 className="text-2xl font-bold text-amber-100 tracking-tight mb-2 flex items-center gap-2">
                    <Users className="w-6 h-6 text-[#d4af37]" /> 회원 관리 (Users)
                </h2>

                <div className="bg-[#1a142d]/80 rounded-3xl p-6 shadow-xl border border-[#d4af37]/20 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-amber-100 flex items-center gap-2">
                            <Database className="w-5 h-5 text-[#d4af37]" /> 가입된 전체 회원 목록
                        </h3>
                        <span className="text-xs text-white/50 bg-[#110e1b] px-3 py-1.5 rounded-full border border-white/10">총 {usersList.length}명</span>
                    </div>

                    <div className="flex-1 border border-[#d4af37]/20 rounded-xl overflow-hidden bg-[#110e1b] w-full overflow-x-auto">
                        <table className="w-full text-left text-sm text-white/80 whitespace-nowrap">
                            <thead className="bg-[#d4af37]/10 text-amber-200 border-b border-[#d4af37]/20">
                                <tr>
                                    <th className="p-3 font-semibold">ID</th>
                                    <th className="p-3 font-semibold">가입 이메일</th>
                                    <th className="p-3 font-semibold">이름</th>
                                    <th className="p-3 font-semibold">성별</th>
                                    <th className="p-3 font-semibold">생년월일(ISO)</th>
                                    <th className="p-3 font-semibold">음력/윤달</th>
                                    <th className="p-3 font-semibold">보유 포인트</th>
                                    <th className="p-3 font-semibold">가입일</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersList.map((user: any) => (
                                    <tr key={user.id} className="border-b border-[#d4af37]/10 hover:bg-[#1a142d]/50 transition-colors">
                                        <td className="p-3 text-white/60">#{user.id}</td>
                                        <td className="p-3 font-bold text-white">{user.email || '미연동'}</td>
                                        <td className="p-3 text-white/90">{user.name || '알 수 없음'}</td>
                                        <td className="p-3 text-white/70">{user.gender === 'M' ? '남성' : (user.gender === 'F' ? '여성' : '-')}</td>
                                        <td className="p-3 text-white/70">{user.birth_time_iso ? user.birth_time_iso.replace('T', ' ') : '-'}</td>
                                        <td className="p-3 text-white/50 text-xs">
                                            {user.is_lunar ? '음력' : '양력'}{user.is_leap_month ? ' (윤달)' : ''}
                                        </td>
                                        <td className="p-3 text-amber-400 font-bold">{user.point_balance.toLocaleString()} P</td>
                                        <td className="p-3 text-white/40 text-xs">{new Date(user.created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {usersList.length === 0 && (
                                    <tr><td colSpan={8} className="p-6 text-center text-white/40">가입된 회원이 없습니다.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#0d0914] text-white font-pretendard flex flex-col md:flex-row pb-24 md:pb-8">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-[#1a142d] to-transparent opacity-80" />
                <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-900/10 rounded-full blur-[100px] mix-blend-screen" />
                <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[100px] mix-blend-screen" />
            </div>

            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 bg-[#110e1b] border-r border-[#d4af37]/20 flex flex-col md:fixed md:h-screen z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
                {/* Admin Profile & Logo */}
                <div className="p-6 border-b border-[#d4af37]/20 flex items-center justify-between md:justify-start gap-4 bg-gradient-to-b from-[#1a142d] to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex justify-center items-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black font-outfit tracking-tight text-white drop-shadow-md">FateName <span className="text-[#d4af37]">OS</span></h2>
                            <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-0.5">Control Center</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible custom-scrollbar">
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`flex items-center gap-3 px-4 py-3 min-w-[140px] rounded-xl font-bold text-sm transition-all ${activeTab === 'analytics' ? 'bg-[#d4af37]/10 text-[#d4af37] border-l-4 border-[#d4af37]' : 'text-white/60 hover:text-amber-100 hover:bg-[#1a142d] border-l-4 border-transparent'}`}
                    >
                        <Activity className="w-5 h-5 shrink-0" /> <span className="hidden md:inline">종합 대시보드</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('goods')}
                        className={`flex items-center gap-3 px-4 py-3 min-w-[140px] rounded-xl font-bold text-sm transition-all ${activeTab === 'goods' ? 'bg-[#d4af37]/10 text-[#d4af37] border-l-4 border-[#d4af37]' : 'text-white/60 hover:text-amber-100 hover:bg-[#1a142d] border-l-4 border-transparent'}`}
                    >
                        <ShoppingBag className="w-5 h-5 shrink-0" /> <span className="hidden md:inline">마켓관리</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('market')}
                        className={`flex items-center gap-3 px-4 py-3 min-w-[140px] rounded-xl font-bold text-sm transition-all ${activeTab === 'market' ? 'bg-[#d4af37]/10 text-[#d4af37] border-l-4 border-[#d4af37]' : 'text-white/60 hover:text-amber-100 hover:bg-[#1a142d] border-l-4 border-transparent'}`}
                    >
                        <DollarSign className="w-5 h-5 shrink-0" /> <span className="hidden md:inline">상담사 정산</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('experts')}
                        className={`flex items-center gap-3 px-4 py-3 min-w-[140px] rounded-xl font-bold text-sm transition-all ${activeTab === 'experts' ? 'bg-[#d4af37]/10 text-[#d4af37] border-l-4 border-[#d4af37]' : 'text-white/60 hover:text-amber-100 hover:bg-[#1a142d] border-l-4 border-transparent'}`}
                    >
                        <Sparkles className="w-5 h-5 shrink-0" /> <span className="hidden md:inline">상담사 관리</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-3 px-4 py-3 min-w-[140px] rounded-xl font-bold text-sm transition-all ${activeTab === 'users' ? 'bg-[#d4af37]/10 text-[#d4af37] border-l-4 border-[#d4af37]' : 'text-white/60 hover:text-amber-100 hover:bg-[#1a142d] border-l-4 border-transparent'}`}
                    >
                        <Users className="w-5 h-5 shrink-0" /> <span className="hidden md:inline">회원/멤버십</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('system')}
                        className={`flex items-center gap-3 px-4 py-3 min-w-[140px] rounded-xl font-bold text-sm transition-all ${activeTab === 'system' ? 'bg-[#d4af37]/10 text-[#d4af37] border-l-4 border-[#d4af37]' : 'text-white/60 hover:text-amber-100 hover:bg-[#1a142d] border-l-4 border-transparent'}`}
                    >
                        <ShieldAlert className="w-5 h-5 shrink-0" /> <span className="hidden md:inline">보안 및 설정</span>
                    </button>
                </nav>

                {/* Admin Profile Foot */}
                <div className="p-4 border-t border-[#d4af37]/20 hidden md:flex items-center gap-3 mt-auto bg-[#0d0914]/50">
                    <div className="w-10 h-10 rounded-full border border-[#d4af37]/30 bg-gradient-to-tr from-[#1a142d] to-[#2a1b41] flex justify-center items-center shadow-lg relative overflow-hidden">
                        <div className="absolute inset-0 bg-[#d4af37]/10" />
                        <span className="text-amber-200 font-bold font-outfit text-xs z-10">Admin</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-amber-100">천공의 지배자</p>
                        <p className="text-[10px] text-green-400 font-bold">Prod-1 동기화 완료</p>
                    </div>
                </div>
            </aside>

            {/* Main Content Pane */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 pt-6 pb-32 mb-16 relative z-10 w-full overflow-x-hidden min-h-screen">
                {/* Top App Bar Header Search */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-[#d4af37]/20 gap-4">
                    <div className="sm:hidden flex items-center w-full justify-between">
                        <h1 className="text-xl font-black font-outfit text-amber-100 flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#d4af37]" /> 운명의 관리자</h1>
                    </div>

                    <div className="relative w-full max-w-md">
                        <Search className="w-4 h-4 text-[#d4af37]/50 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="사용자명, 검색어 입력..."
                            className="w-full bg-[#110e1b]/80 border border-[#d4af37]/20 shadow-inner rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                        />
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                        <button className="px-5 py-2.5 bg-[#1a142d]/80 border border-[#d4af37]/30 rounded-full text-xs font-bold text-[#d4af37] hover:bg-[#d4af37]/10 flex-1 sm:flex-none transition-colors shadow-sm">
                            전체 운명 리포트 (CSV)
                        </button>
                    </div>
                </header>

                {/* Dynamic Outlet */}
                {activeTab === 'analytics' && renderAnalytics()}
                {activeTab === 'goods' && renderGoods()}
                {activeTab === 'market' && renderMarket()}
                {activeTab === 'system' && renderSystem()}
                {activeTab === 'users' && renderUsers()}
                {activeTab === 'experts' && <ExpertsManager />}
            </main>

            {/* Edit Modal */}
            {editingProduct && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1a142d] border border-[#d4af37]/30 rounded-3xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-amber-100 flex items-center gap-2"><Edit2 className="w-5 h-5 text-[#d4af37]" /> 부적 수정</h3>
                            <button onClick={() => setEditingProduct(null)} className="text-white/50 hover:text-white"><X className="w-6 h-6" /></button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="text-sm font-bold text-white/70 mb-1 block">{editingProduct?.category === 'coin' ? '패키지 명' : '상품명'}</label>
                                <input required type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" />
                            </div>
                            
                            {editingProduct?.category === 'coin' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-white/70 mb-1 block">지급 코인 (기본)</label>
                                        <input required type="number" value={editCoinAmount} onChange={e => setEditCoinAmount(Number(e.target.value))} className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-white/70 mb-1 block">추가 보너스 코인</label>
                                        <input required type="number" value={editBonusCoins} onChange={e => setEditBonusCoins(Number(e.target.value))} className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-bold text-white/70 mb-1 block">설정액/판매가 (원)</label>
                                <input required type="number" value={editPrice} onChange={e => setEditPrice(Number(e.target.value))} className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" />
                            </div>

                            {editingProduct?.category !== 'coin' && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-bold text-white/70 mb-1 block">테마 속성</label>
                                            <select value={editTheme} onChange={e => setEditTheme(e.target.value)} className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]">
                                                <option value="wealth">재물/사업 (Wealth)</option>
                                                <option value="love">애정/인연 (Love)</option>
                                                <option value="health">건강/수호 (Health)</option>
                                                <option value="wood">기타 소원 (Wish)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-white/70 mb-1 block">이커머스 정가 (원)</label>
                                            <input type="number" value={editOriginalPrice} onChange={e => setEditOriginalPrice(Number(e.target.value))} className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37]" placeholder="25000" />
                                        </div>
                                    </div>
                                </>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-sm font-bold text-white/70 mb-1 block">판매 태그 (CSV)</label>
                                    <input type="text" value={editSalesTags} onChange={e => setEditSalesTags(e.target.value)} className="w-full bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37]" placeholder="BEST,인기상품" />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-white/70 mb-1 block">상세 설명 / 부가 혜택 문구</label>
                                <textarea required value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={12} className="w-full min-h-[200px] bg-[#110e1b] border border-[#d4af37]/30 rounded-xl p-3 text-white focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] resize-y" />
                            </div>

                            {editingProduct?.category !== 'coin' && (
                                <div>
                                    <label className="text-sm font-bold text-white/70 mb-1 block">이미지 업로드 (선택, 기존 이미지 유지됨)</label>
                                    <input type="file" accept="image/*" onChange={e => setEditImageFile(e.target.files?.[0] || null)} className="w-full text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#d4af37]/20 file:text-[#d4af37] hover:file:bg-[#d4af37]/30" />
                                </div>
                            )}
                            <button type="submit" disabled={isUploading} className="mt-4 w-full py-3 rounded-xl bg-[#d4af37] hover:bg-amber-400 text-black font-bold transition-all disabled:opacity-50">
                                {isUploading ? "수정 중..." : "상품 수정 완료"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
