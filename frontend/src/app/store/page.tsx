"use client";

import { useState, useEffect } from "react";
import ProductModal from "@/components/Store/ProductModal";
import { Sparkles, Heart, BadgeDollarSign, Briefcase, Dumbbell, Clover, Star, ChevronRight } from "lucide-react";

// Types for store products
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: "elemental" | "wish" | "persona";
    elementTheme?: "wood" | "fire" | "earth" | "metal" | "water";
    imageUrl: string;
}

// Mock Products Database
export const storeProducts: Product[] = [
    {
        id: "elm_wood_01",
        name: "생명력의 나무 (목 기운)",
        description: "사주에 부족한 목(木) 기운을 채워주는 성장과 생명력의 부적.",
        price: 9900,
        category: "elemental",
        elementTheme: "wood",
        imageUrl: "/talismans/health.png"
    },
    {
        id: "elm_fire_01",
        name: "불타는 열정 (화 기운)",
        description: "강력한 화(火)의 에너지로 추진력을 극대화하는 맞춤형 부적.",
        price: 9900,
        category: "elemental",
        elementTheme: "fire",
        imageUrl: "/talismans/love.png"
    },
    {
        id: "wish_wealth_01",
        name: "금전운 시크릿 부적",
        description: "오프라인 재물 부적의 파동을 그대로 담은 디지털 굿즈.",
        price: 15000,
        category: "wish",
        imageUrl: "/talismans/wealth.png"
    },
    {
        id: "wish_love_01",
        name: "인연의 붉은 실 (도화)",
        description: "매력을 극대화하고 새로운 인연을 끌어당기는 사랑의 템플릿.",
        price: 15000,
        category: "wish",
        imageUrl: "/talismans/love.png"
    },
    {
        id: "persona_dragon_01",
        name: "청룡의 페르소나",
        description: "강력한 리더십을 상징하는 청룡 아바타 디자인.",
        price: 25000,
        category: "persona",
        imageUrl: "/talismans/health.png"
    },
    {
        id: "nft_lucky_01",
        name: "한정판 NFT 행운부적",
        description: "블록체인에 각인되어 영구 보존 가능한 나만의 유일무이한 NFT 럭키참.",
        price: 50000,
        category: "wish",
        imageUrl: "/talismans/wealth.png"
    },
    {
        id: "wallpaper_char_01",
        name: "일주 캐릭터 프리미엄 배경화면",
        description: "나의 태어난 일주(日柱)를 형상화한 하이엔드 3D 캐릭터 스마트폰 배경화면.",
        price: 5500,
        category: "persona",
        imageUrl: "/talismans/love.png"
    }
];

export default function DirectStorePage() {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [products, setProducts] = useState<Product[]>(storeProducts);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

    // Filter products based on active category
    const filteredProducts = products.filter(p => {
        if (!activeCategory) return true;
        const target = (p.name + " " + p.description).toLowerCase();
        if (activeCategory === "연애") return target.includes("인연") || target.includes("사랑") || target.includes("도화") || target.includes("연애") || p.elementTheme === "fire";
        if (activeCategory === "금전") return target.includes("금전") || target.includes("재물") || target.includes("돈");
        if (activeCategory === "건강") return target.includes("생명") || target.includes("건강") || p.elementTheme === "wood";
        if (activeCategory === "한정판") return target.includes("한정판") || target.includes("nft");
        if (activeCategory === "사업") return target.includes("사업") || target.includes("성공") || target.includes("리더십");
        if (activeCategory === "행운") return target.includes("행운") || target.includes("럭키");
        return true;
    });

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
                            imageUrl: p.image_url || '/talismans/health.png'
                        }));
                        setProducts([...dbProducts, ...storeProducts]);
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
                <h1 className="text-xl font-black text-gray-900 tracking-tight">부적상점</h1>
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

                    {/* Pagination Dots (Decorative) */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-200"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-200"></div>
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="bg-white pt-8 pb-8 px-4 grid grid-cols-4 gap-y-6 sm:grid-cols-6 rounded-b-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative z-20 -mt-4">
                    {[
                        { icon: Heart, label: "연애", color: "text-gray-700" },
                        { icon: BadgeDollarSign, label: "금전", color: "text-gray-700" },
                        { icon: Briefcase, label: "사업", color: "text-gray-700" },
                        { icon: Dumbbell, label: "건강", color: "text-gray-700" },
                        { icon: Clover, label: "행운", color: "text-gray-700" },
                        { icon: Star, label: "한정판", color: "text-gray-700" },
                    ].map((category, idx) => (
                        <button key={idx} onClick={() => setActiveCategory(activeCategory === category.label ? null : category.label)} className="flex flex-col items-center justify-center gap-2 group">
                            <div className={`w-14 h-14 rounded-2xl bg-white border ${activeCategory === category.label ? 'border-yellow-400 border-2 shadow-[0_4px_12px_rgba(250,204,21,0.3)]' : 'border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'} flex items-center justify-center transition-all relative overflow-hidden`}>
                                <category.icon className={`w-6 h-6 ${activeCategory === category.label ? 'text-yellow-500' : category.color} stroke-[1.5] relative z-10`} />
                            </div>
                            <span className={`text-[13px] font-bold ${activeCategory === category.label ? 'text-yellow-600' : 'text-gray-600'} tracking-wide`}>{category.label}</span>
                        </button>
                    ))}
                </div>

                {/* Dynamic Category View vs Default View */}
                {activeCategory && (
                    <div className="mt-8 px-4 pb-20">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[18px] font-black tracking-tight text-gray-900">[{activeCategory}] 관련 부적</h3>
                            <span className="text-[13px] font-bold text-gray-400">{filteredProducts.length}개 상품</span>
                        </div>
                        <div className="flex flex-col gap-4">
                            {filteredProducts.length > 0 ? filteredProducts.map((product, idx) => (
                                <div
                                    key={`cat_${product.id}`}
                                    onClick={() => handleProductClick(product)}
                                    className="flex items-center gap-4 cursor-pointer group bg-white p-3 rounded-2xl shadow-sm border border-gray-50"
                                >
                                    <div className="w-[90px] min-w-[90px] h-[90px] rounded-xl bg-gray-50 overflow-hidden relative border border-gray-100 flex items-center justify-center p-1">
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-[15px] font-bold text-gray-900 mb-1.5 leading-[1.3] line-clamp-2 tracking-tight break-keep group-hover:text-blue-600 transition-colors">
                                            [{product.name}] {product.description}
                                        </h4>
                                        <div className="text-[16px] font-black text-gray-900">{product.price.toLocaleString()}원</div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                                    <Clover className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium text-[14px]">해당 카테고리의 상품이 준비 중입니다.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Divider if Active Category */}
                {activeCategory && <div className="w-full h-2 bg-gray-100 mt-4 mb-2"></div>}

                {/* MD Recommended Horizon Scroll */}
                <div className="mt-8 px-4">
                    <div className="flex items-end justify-between mb-4">
                        <h3 className="text-[18px] font-black tracking-tight text-gray-900">MD 추천 잇템!</h3>
                        <button onClick={() => alert("현재 상점이 런칭 준비 중입니다.\n곧 전체 상품 보기 기능이 열립니다!")} className="text-[13px] font-bold text-gray-500 hover:text-gray-800 transition-colors">더보기 &gt;</button>
                    </div>

                    <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory hide-scrollbar">
                        {products.slice(0, 4).map(product => (
                            <div
                                key={`md_${product.id}`}
                                onClick={() => handleProductClick(product)}
                                className="min-w-[140px] max-w-[140px] sm:min-w-[160px] sm:max-w-[160px] flex-shrink-0 snap-start cursor-pointer group"
                            >
                                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3 border border-gray-100 flex items-center justify-center p-2 relative">
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-contain rounded-xl drop-shadow-sm group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {/* Star overlay fake for design */}
                                    <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-black/40 backdrop-blur-md rounded-full px-1.5 py-0.5 pointer-events-none">
                                        <Star className="w-2 h-2 text-yellow-400 fill-yellow-400" />
                                        <span className="text-[9px] font-bold text-white tracking-wider">NEW</span>
                                    </div>
                                </div>
                                <h4 className="text-[14px] font-bold text-gray-900 mb-1 line-clamp-2 leading-tight tracking-tight break-keep group-hover:text-blue-600 transition-colors">
                                    [{product.name}] {product.description}
                                </h4>
                                <div className="text-[15px] font-black text-gray-900">{product.price.toLocaleString()}원</div>
                                <div className="flex items-center gap-1 mt-1">
                                    <Star className="w-3.5 h-3.5 text-[#FFC107] fill-[#FFC107]" />
                                    <span className="text-[12px] font-bold text-gray-600">5.0</span>
                                    <span className="text-[11px] font-medium text-gray-400 tracking-wide">(14)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="w-full h-2 bg-gray-100 my-2"></div>

                {/* Real-time BEST List */}
                <div className="mt-8 px-4 pb-20">
                    <h3 className="text-[18px] font-black tracking-tight text-gray-900 mb-6">실시간 BEST</h3>

                    <div className="flex flex-col gap-4">
                        {products.slice(0, 5).map((product, idx) => (
                            <div
                                key={`best_${product.id}`}
                                onClick={() => handleProductClick(product)}
                                className="flex items-center gap-4 cursor-pointer group"
                            >
                                <div className="w-[100px] min-w-[100px] h-[100px] rounded-2xl bg-gray-50 overflow-hidden relative border border-gray-100 flex items-center justify-center p-1">
                                    <div className="absolute top-0 left-0 w-6 h-6 bg-[#2AC1BC] text-white flex items-center justify-center text-[12px] font-black z-10 rounded-br-xl">
                                        {idx + 1}
                                    </div>
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[15px] font-bold text-gray-900 mb-1.5 leading-[1.3] line-clamp-2 tracking-tight break-keep group-hover:text-blue-600 transition-colors">
                                        [{product.name}] {product.description}
                                    </h4>
                                    <div className="text-[16px] font-black text-gray-900">{product.price.toLocaleString()}원</div>
                                    <div className="flex items-center gap-1 mt-1.5">
                                        <Star className="w-3.5 h-3.5 text-[#FFC107] fill-[#FFC107]" />
                                        <span className="text-[12px] font-bold text-gray-600">4.8</span>
                                        <span className="text-[11px] font-medium text-gray-400 tracking-wide">(219)</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
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
