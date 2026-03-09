"use client";

import { useState, useEffect, useMemo } from "react";
import ProductModal from "@/components/Store/ProductModal";
import { Sparkles, Heart, BadgeDollarSign, Briefcase, Dumbbell, Clover, Star, ChevronRight } from "lucide-react";

// Types for store products
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    elementTheme?: string;
    imageUrl: string;
    original_price?: number;
    sales_tags?: string;
}

// Mock Products Database
export const storeProducts: Product[] = [
    {
        id: "elm_wood_01",
        name: "생명력의 나무 (목 기운)",
        description: "사주에 부족한 목(木) 기운을 채워주는 성장과 생명력의 오브제.",
        price: 9900,
        category: "elemental",
        elementTheme: "wood",
        imageUrl: "/talismans/health.png"
    },
    {
        id: "elm_fire_01",
        name: "불타는 열정 (화 기운)",
        description: "강력한 화(火)의 에너지로 추진력을 극대화하는 맞춤형 오브제.",
        price: 9900,
        category: "elemental",
        elementTheme: "fire",
        imageUrl: "/talismans/love.png"
    },
    {
        id: "wish_wealth_01",
        name: "금전운 시크릿 오브제",
        description: "오프라인 재물운의 파동을 그대로 담은 디지털 굿즈.",
        price: 15000,
        category: "wish",
        elementTheme: "wealth",
        imageUrl: "/talismans/wealth.png"
    },
    {
        id: "wish_love_01",
        name: "인연의 붉은 실 (도화)",
        description: "매력을 극대화하고 새로운 인연을 끌어당기는 사랑의 템플릿.",
        price: 15000,
        category: "wish",
        elementTheme: "love",
        imageUrl: "/talismans/love.png"
    },
    {
        id: "persona_dragon_01",
        name: "청룡의 페르소나",
        description: "강력한 리더십을 상징하는 청룡 아바타 디자인.",
        price: 25000,
        category: "persona",
        elementTheme: "wood",
        imageUrl: "/talismans/health.png"
    },
    {
        id: "nft_lucky_01",
        name: "한정판 디지털 럭키참",
        description: "영구 보존 가능한 나만의 유일무이한 프리미엄 럭키참.",
        price: 50000,
        category: "wish",
        elementTheme: "wealth",
        imageUrl: "/talismans/wealth.png"
    },
    {
        id: "wallpaper_char_01",
        name: "일주 캐릭터 프리미엄 배경화면",
        description: "나의 태어난 일주(日柱)를 형상화한 하이엔드 3D 캐릭터 스마트폰 배경화면.",
        price: 5500,
        category: "persona",
        elementTheme: "wood",
        imageUrl: "/talismans/love.png"
    }
];

export default function DirectStorePage() {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [products, setProducts] = useState<Product[]>(storeProducts);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [storeTab, setStoreTab] = useState<'MARKET' | 'COIN'>('MARKET');
    const [userCoins, setUserCoins] = useState(0); // Mock user coin balance

    // Browser back button handling for the modal
    useEffect(() => {
        const handlePopState = (e: PopStateEvent) => {
            if (selectedProduct) {
                // If a product modal is open, prevent default back navigation and just close the modal
                setSelectedProduct(null);
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [selectedProduct]);

    const handleProductClick = (product: Product) => {
        // Push a new state so the browser's "Back" button functions as a closing action for the modal
        window.history.pushState({ modalOpen: true }, '');
        setSelectedProduct(product);
    };

    const handleCloseModal = () => {
        // This will trigger popstate, which actually closes the modal
        window.history.back();
    };

    const handleChargeRequest = (amount: number, bonus: number, price: number) => {
        alert(`[PG 연동 대기]\n\n총 ${amount + bonus}코인 충전 결제창으로 이동하시겠습니까?\n(결제 금액: ${price.toLocaleString()}원)`);
    };

    // Filter products based on active category
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            if (!activeCategory || activeCategory === "전체보기") return true;
            if (activeCategory === "재물/사업") return p.elementTheme === "wealth" || p.elementTheme === "metal";
            if (activeCategory === "애정/인연") return p.elementTheme === "love" || p.elementTheme === "fire";
            if (activeCategory === "건강/수호") return p.elementTheme === "health" || p.elementTheme === "water";
            if (activeCategory === "소원/기타") return p.elementTheme === "wood" || p.elementTheme === "earth";
            return true;
        });
    }, [products, activeCategory]);

    // MZ 추천 잇템 - 테마별로 1개씩 선정
    const mzPicks = useMemo(() => {
        const picks: Product[] = [];
        const themes = ["wealth", "love", "health", "wood"];
        themes.forEach(theme => {
            const items = products.filter(p => p.elementTheme === theme);
            if (items.length > 0) {
                // 당일 날짜 기반 슈도 랜덤
                picks.push(items[new Date().getDate() % items.length]);
            }
        });
        if (picks.length < 4) return [...picks, ...products].slice(0, 4);
        return picks;
    }, [products]);

    useEffect(() => {
        const fetchStoreDB = async () => {
            try {
                // Determine the correct host regardless of whether accessed via localhost or tunnel
                const host = window.location.origin;
                const res = await fetch(`${host}/api/store/products`, { cache: 'no-store' });

                if (res.ok) {
                    const data = await res.json();
                    if (data && data.products) {
                        const dbProducts: Product[] = data.products.map((p: any) => ({
                            id: `db_${p.id}`,
                            name: p.name,
                            description: p.description,
                            price: p.price,
                            category: p.category,
                            elementTheme: p.theme,
                            imageUrl: p.image_url || '/talismans/health.png',
                            original_price: p.original_price,
                            sales_tags: p.sales_tags
                        }));
                        const allProducts = [...storeProducts, ...dbProducts];
                        const uniqueProducts = Array.from(new Map(allProducts.map(item => [item.name, item])).values());
                        setProducts(uniqueProducts);
                    }
                }
            } catch (error) {
                console.warn("Failed to load DB products, falling back to static products:", error);
                // Already initialized with storeProducts, so we don't need to do anything else.
            }
        };
        fetchStoreDB();
    }, []);

    return (
        <div className="font-pretendard bg-[#F8F9FA] min-h-screen pb-24">
            {/* Store Header Navigation */}
            <div className="bg-white sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b border-gray-100">
                <h1 className="text-xl font-black text-gray-900 tracking-tight">마켓</h1>
                <div className="flex items-center gap-3">
                    <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    </button>
                </div>
            </div>

            <main className="w-full">
                {/* Animated Ad Banner Placeholder */}
                <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 relative overflow-hidden h-48 flex items-center justify-center border-b border-gray-100 rounded-b-[2rem]">
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

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-200"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-200"></div>
                    </div>
                </div>

                {/* Top Level Tabs */}
                <div className="flex px-4 pt-4 bg-[#F8F9FA] relative z-20">
                    <button
                        onClick={() => setStoreTab('MARKET')}
                        className={`flex-1 flex flex-col items-center justify-center py-3 text-[15px] font-bold border-b-[3px] transition-colors ${storeTab === 'MARKET' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400'} `}
                    >
                        부적/굿즈 마켓
                    </button>
                    <button
                        onClick={() => setStoreTab('COIN')}
                        className={`flex-1 flex items-center justify-center gap-1 py-3 text-[15px] font-bold border-b-[3px] transition-colors ${storeTab === 'COIN' ? 'border-[#d4af37] text-yellow-600' : 'border-transparent text-gray-400'} `}
                    >
                        <span className="text-yellow-500">⚡</span> 코인 충전소
                    </button>
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gray-200"></div>
                </div>

                {/* Categories Grid (Only in Market Mode) */}
                {storeTab === 'MARKET' && (
                    <>
                        <div className="bg-white pt-6 pb-8 px-4 grid grid-cols-5 gap-y-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative z-10 rounded-b-[24px]">
                            {[
                                { icon: Star, label: "전체보기", color: "text-gray-700" },
                                { icon: BadgeDollarSign, label: "재물/사업", color: "text-gray-700" },
                                { icon: Heart, label: "애정/인연", color: "text-gray-700" },
                                { icon: Dumbbell, label: "건강/수호", color: "text-gray-700" },
                                { icon: Sparkles, label: "소원/기타", color: "text-gray-700" },
                            ].map((category, idx) => (
                                <button key={idx} onClick={() => setActiveCategory(activeCategory === category.label ? null : category.label)} className="flex flex-col items-center justify-center gap-2 group">
                                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border ${activeCategory === category.label ? 'border-yellow-400 border-2 shadow-[0_4px_12px_rgba(250,204,21,0.3)]' : 'border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'} flex items-center justify-center transition-all relative overflow-hidden`}>
                                        <category.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${activeCategory === category.label ? 'text-yellow-500' : category.color} stroke-[1.5] relative z-10`} />
                                    </div>
                                    <span className={`text-[12px] sm:text-[13px] font-bold ${activeCategory === category.label ? 'text-yellow-600' : 'text-gray-600'} tracking-tight sm:tracking-wide shrink-0 whitespace-nowrap`}>{category.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Dynamic Category View vs Default View */}
                        {activeCategory && (
                            <div className="mt-8 px-4 pb-20">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-[18px] font-black tracking-tight text-gray-900">[{activeCategory}] 관련 굿즈/오브제</h3>
                                    <span className="text-[13px] font-bold text-gray-400">{filteredProducts.length}개 상품</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    {filteredProducts.length > 0 ? filteredProducts.map((product, idx) => {
                                        const originalPrice = Math.floor(product.price * 1.25); // Set 20% discount as mock
                                        return (
                                            <div
                                                key={`cat_${product.id}`}
                                                onClick={() => handleProductClick(product)}
                                                className="flex flex-col cursor-pointer group bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden"
                                            >
                                                <div className="w-full aspect-square bg-gray-50 overflow-hidden relative flex items-center justify-center p-2 border-b border-gray-100">
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    <div className="absolute top-2 left-2 flex items-center gap-1">
                                                        <span className="bg-[#FF3B30] text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm shadow-sm flex items-center gap-0.5 border border-red-500"><span className="text-[8px]">🚀</span>당일발급</span>
                                                    </div>
                                                </div>
                                                <div className="p-3">
                                                    <h4 className="text-[13px] font-medium text-gray-900 mb-1.5 leading-[1.3] line-clamp-2 break-keep group-hover:text-blue-600 transition-colors">
                                                        [{product.name}] {product.description}
                                                    </h4>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[14px] font-bold text-red-500">20%</span>
                                                        <span className="text-[15px] sm:text-[16px] font-black text-gray-900 tracking-tight">{product.price.toLocaleString()}원</span>
                                                    </div>
                                                    <div className="text-[11px] text-gray-400 line-through mb-1.5 font-medium">{originalPrice.toLocaleString()}원</div>
                                                    <div className="flex items-center gap-1 mt-auto">
                                                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                                        <span className="text-[11px] font-bold text-gray-700">4.9</span>
                                                        <span className="text-[10px] text-gray-400 font-medium">({Math.floor(Math.random() * 500) + 50})</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }) : (
                                        <div className="col-span-2 text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                            <Clover className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500 font-medium text-[14px]">해당 카테고리의 상품이 준비 중입니다.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Divider if Active Category */}
                        {activeCategory && <div className="w-full h-2 bg-gray-100 mt-4 mb-2"></div>}

                        {/* MZ Recommended Horizon Scroll */}
                        <div className="mt-8 px-4">
                            <div className="flex items-end justify-between mb-4">
                                <h3 className="text-[18px] font-black tracking-tight text-gray-900">요즘 MZ픽! 잇템</h3>
                                <button onClick={() => setActiveCategory("전체보기")} className="text-[13px] font-bold text-gray-500 hover:text-gray-800 transition-colors">더보기 &gt;</button>
                            </div>

                            <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory hide-scrollbar">
                                {mzPicks.map(product => {
                                    const originalPrice = Math.floor(product.price * 1.15); // 13% discount
                                    return (
                                        <div
                                            key={`md_${product.id}`}
                                            onClick={() => handleProductClick(product)}
                                            className="min-w-[140px] max-w-[140px] sm:min-w-[150px] sm:max-w-[150px] flex-shrink-0 snap-start cursor-pointer group"
                                        >
                                            <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-50 mb-2.5 border border-gray-100 flex items-center justify-center p-2 relative shadow-sm">
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-500"
                                                />
                                                {/* Tag overlay */}
                                                <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-blue-600 rounded-sm px-1.5 py-0.5 shadow-sm border border-blue-700">
                                                    <span className="text-[9px] font-black text-white tracking-wider">오늘특가</span>
                                                </div>
                                            </div>
                                            <h4 className="text-[13px] font-medium text-gray-900 mb-1 line-clamp-2 leading-[1.3] break-keep group-hover:text-blue-600 transition-colors">
                                                [{product.name}] {product.description}
                                            </h4>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[14px] font-bold text-red-500">13%</span>
                                                <span className="text-[15px] sm:text-[16px] font-black text-gray-900 tracking-tight">{product.price.toLocaleString()}원</span>
                                            </div>
                                            <div className="text-[11px] text-gray-400 line-through mb-1 font-medium">{originalPrice.toLocaleString()}원</div>
                                            <div className="flex items-center gap-1 mt-1 inline-flex bg-gray-50 px-1.5 py-0.5 rounded text-[10px] border border-gray-100">
                                                <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                                                <span className="font-bold text-gray-600">5.0</span>
                                                <span className="text-gray-400 font-medium">({Math.floor(Math.random() * 200) + 10})</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="w-full h-2 bg-gray-100 my-2"></div>

                        {/* Real-time BEST List */}
                        <div className="mt-8 px-4 pb-20">
                            <h3 className="text-[18px] font-black tracking-tight text-gray-900 mb-6">실시간 BEST 탑 10</h3>

                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                {products.sort((a, b) => b.price - a.price).slice(0, 10).map((product, idx) => {
                                    const originalPrice = Math.floor(product.price * 1.3);
                                    return (
                                        <div
                                            key={`best_${product.id}`}
                                            onClick={() => handleProductClick(product)}
                                            className="flex flex-col cursor-pointer group bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden relative"
                                        >
                                            <div className="absolute top-0 left-0 w-7 h-7 bg-gray-900/90 text-[13px] font-black z-10 rounded-br-xl backdrop-blur-sm shadow-sm border-r border-b border-gray-800 flex items-center justify-center text-white">
                                                {idx + 1}
                                            </div>
                                            <div className="w-full aspect-square bg-gray-50 overflow-hidden relative flex items-center justify-center p-2 border-b border-gray-100 text-center">
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="p-3 flex flex-col justify-between flex-1">
                                                <div>
                                                    <h4 className="text-[13px] font-medium text-gray-900 mb-1.5 leading-[1.3] line-clamp-2 break-keep group-hover:text-blue-600 transition-colors">
                                                        [{product.name}] {product.description}
                                                    </h4>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[14px] font-bold text-red-500">23%</span>
                                                        <span className="text-[15px] sm:text-[16px] font-black text-gray-900 tracking-tight">{product.price.toLocaleString()}원</span>
                                                    </div>
                                                    <div className="text-[11px] text-gray-400 line-through mb-1.5 font-medium">{originalPrice.toLocaleString()}원</div>
                                                </div>
                                                <div className="flex items-center justify-between mt-1">
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                                        <span className="text-[11px] font-bold text-gray-700">4.8</span>
                                                        <span className="text-[10px] text-gray-400 font-medium">({Math.floor(Math.random() * 800) + 100})</span>
                                                    </div>
                                                    <span className="border border-green-200 text-green-600 text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-green-50/50 hidden sm:inline-block">무료배송</span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </>)}

                {/* Coin Charger Mode */}
                {storeTab === 'COIN' && (
                    <div className="mt-6 px-4 pb-24">
                        {/* Coin Balance Card */}
                        <div className="bg-gradient-to-r from-gray-900 to-black rounded-3xl p-6 text-white mb-8 shadow-[0_10px_30px_rgba(0,0,0,0.15)] relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-yellow-500/20 blur-3xl rounded-full"></div>
                            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full"></div>

                            <div className="relative z-10 flex flex-col items-center">
                                <span className="text-[14px] font-medium text-gray-400 mb-1">현재 보유 코인</span>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-yellow-400 text-3xl">⚡</span>
                                    <span className="text-4xl font-black tracking-tight">{userCoins.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-xl p-3 flex items-center justify-between">
                                    <span className="text-[13px] text-gray-300">내역 확인하기</span>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        <h3 className="text-[18px] font-black tracking-tight text-gray-900 mb-4 px-1">충전 가능한 패키지 🎁</h3>
                        <div className="flex flex-col gap-3">
                            {[
                                { amount: 100, bonus: 0, price: 1000 },
                                { amount: 500, bonus: 50, price: 5000, tag: "인기" },
                                { amount: 1000, bonus: 150, price: 10000 },
                                { amount: 3000, bonus: 500, price: 30000, tag: "베스트셀러" },
                                { amount: 5000, bonus: 1000, price: 50000, highlight: true },
                            ].map((pkg, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleChargeRequest(pkg.amount, pkg.bonus, pkg.price)}
                                    className={`w-full bg-white rounded-2xl p-4 flex items-center justify-between transition-all group ${pkg.highlight ? 'border-2 border-yellow-400 shadow-[0_4px_15px_rgba(250,204,21,0.2)]' : 'border border-gray-100 shadow-sm hover:border-gray-300'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${pkg.highlight ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                                            <span className={`text-2xl ${pkg.highlight ? 'text-yellow-500' : ''}`}>⚡</span>
                                        </div>
                                        <div className="text-left flex flex-col justify-center">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[16px] font-black text-gray-900 group-hover:scale-105 transition-transform">{pkg.amount} 코인</span>
                                                {pkg.tag && (
                                                    <span className="bg-red-50 text-red-500 text-[10px] font-black px-1.5 py-0.5 rounded-sm">{pkg.tag}</span>
                                                )}
                                            </div>
                                            {pkg.bonus > 0 ? (
                                                <span className="text-[12px] font-bold text-yellow-600 mt-0.5">+ {pkg.bonus} 보너스 지급!</span>
                                            ) : (
                                                <span className="text-[12px] font-medium text-gray-400 mt-0.5">베이직 패키지</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl text-[14px] font-bold transition-colors ${pkg.highlight ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-950' : 'bg-gray-900 text-white group-hover:bg-gray-800'}`}>
                                        {pkg.price.toLocaleString()}원
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Product Purchase Modal */}
            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}
