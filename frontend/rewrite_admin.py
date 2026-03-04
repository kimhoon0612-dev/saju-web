import re

with open(r'c:\Users\김훈\Desktop\제미나이_앱\260223_명리학\frontend\src\app\admin\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Analytics
content = re.sub(
    r'const renderAnalytics = \(\) => \{.+?(?=const renderGoods = \(\) =>)',
    r'''const renderAnalytics = () => {
        if (!analyticsData) return <div className="text-gray-500 font-medium p-10 animate-pulse">데이터 통합 집계 중...</div>;
        const { traffic, revenue } = analyticsData;

        // Use dynamically growing historical data, or mock if we just loaded
        const displayChartData = chartDataHistory.length > 1 ? chartDataHistory : [
            { name: '최근 1', users: traffic.current_concurrent_users - 50 },
            { name: '최근 2', users: traffic.current_concurrent_users - 20 },
            { name: '비실시간 연결', users: traffic.current_concurrent_users }
        ];

        const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'];

        return (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">실시간 데이터 관제 (트래픽 & 통계)</h2>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100/50 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                            <Activity className="w-5 h-5 text-blue-500" />
                            <span className="text-sm font-medium text-gray-500">동시 접속자</span>
                        </div>
                        <div className="text-4xl font-black text-gray-900">{traffic.current_concurrent_users.toLocaleString()}</div>
                    </div>
                    <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100/50 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                            <Eye className="w-5 h-5 text-purple-500" />
                            <span className="text-sm font-medium text-gray-500">일간 활성(DAU)</span>
                        </div>
                        <div className="text-4xl font-black text-gray-900">{traffic.dau.toLocaleString()}</div>
                    </div>
                    <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100/50 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="w-5 h-5 text-indigo-500" />
                            <span className="text-sm font-medium text-gray-500">월간 활성(MAU)</span>
                        </div>
                        <div className="text-4xl font-black text-gray-900">{traffic.mau.toLocaleString()}</div>
                    </div>
                    <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100/50 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                            <DollarSign className="w-5 h-5 text-green-500" />
                            <span className="text-sm font-medium text-gray-500">누적 매출 (원)</span>
                        </div>
                        <div className="text-3xl font-black text-gray-900">{revenue.total_revenue.toLocaleString()}</div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100/50 h-[400px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-500" /> 실시간 트래픽 추이
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <span className="text-xs text-green-500 font-bold tracking-widest">LIVE DATA CONNECTED</span>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height="85%">
                            <LineChart data={displayChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" domain={['auto', 'auto']} />
                                <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#f3f4f6', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100/50 h-[400px]">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">유입 경로 분석</h3>
                        <ResponsiveContainer width="100%" height="85%">
                            <PieChart>
                                <Pie
                                    data={traffic.traffic_sources}
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="percentage"
                                    nameKey="source"
                                >
                                    {traffic.traffic_sources.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px' }}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    };

    ''', content, flags=re.DOTALL
)

# Goods
content = re.sub(
    r'const renderGoods = \(\) => \(.+?(?=const renderMarket = \(\) => \{)',
    r'''const renderGoods = () => (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">디지털 상점 / 부적 관리</h2>

            {goodsStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
                    <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100/50 hover:shadow-md transition-shadow">
                        <h3 className="text-gray-500 text-sm font-medium mb-2">오늘 스토어 매출</h3>
                        <p className="text-3xl font-bold text-gray-900">{goodsStats.daily_revenue.toLocaleString()} 원</p>
                    </div>
                    <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100/50 hover:shadow-md transition-shadow">
                        <h3 className="text-gray-500 text-sm font-medium mb-2">이번 달 스토어 매출</h3>
                        <p className="text-3xl font-bold text-gray-900">{goodsStats.monthly_revenue.toLocaleString()} 원</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-yellow-200/50 hover:shadow-md transition-shadow">
                        <h3 className="text-yellow-700 text-sm font-bold mb-2 flex items-center gap-1">
                            <Sparkles className="w-4 h-4" /> 디지털 상점 누적 매출액
                        </h3>
                        <p className="text-3xl font-black text-yellow-800">{goodsStats.total_revenue.toLocaleString()} 원</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Prompt Sandbox */}
                <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100/50">
                    <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-orange-400" /> AI 이미지 프롬프트 샌드박스
                    </h3>
                    <form onSubmit={handleSandboxSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="text-sm font-bold text-gray-600 mb-1 block">부적 테마 설정</label>
                            <select
                                value={sandboxTheme} onChange={e => setSandboxTheme(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="wealth">재물/성공 (Wealth)</option>
                                <option value="love">애정/궁합 (Love)</option>
                                <option value="health">건강/평안 (Health)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-600 mb-1 block">부적 설정액 (원)</label>
                            <input
                                type="number"
                                value={sandboxPrice} onChange={e => setSandboxPrice(Number(e.target.value))}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder="예: 15000"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-gray-600 mb-1 block">프롬프트 상세 템플릿</label>
                            <textarea
                                value={sandboxPrompt} onChange={e => setSandboxPrompt(e.target.value)}
                                rows={4}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                                placeholder="예: neon cyberpunk style lucky charm, detailed elements..."
                            />
                        </div>
                        <button
                            type="submit" disabled={isGenerating}
                            className="mt-2 w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all disabled:opacity-50 shadow-md shadow-orange-500/20"
                        >
                            {isGenerating ? "제작 중 (AI 호출)..." : "프롬프트 시뮬레이션 엔진 가동"}
                        </button>
                    </form>

                    {sandboxResult && (
                        <div className="mt-6 border-t border-gray-100 pt-6">
                            <h4 className="text-sm font-bold text-gray-700 mb-2">테스트 렌더링 결과 (생성시간: {sandboxResult.generation_time_ms}ms)</h4>
                            <img src={sandboxResult.preview_image_url} alt="sandbox result" className="w-full h-48 object-cover rounded-xl border border-gray-200 shadow-sm" />
                            <button onClick={handlePublish} className="mt-3 w-full py-2 bg-gray-900 hover:bg-black rounded-lg text-white text-sm font-medium transition-colors">상점 인벤토리에 정식 등록하기</button>
                        </div>
                    )}
                </div>

                {/* Inventory DB */}
                <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100/50 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-blue-500" /> 활성 인벤토리 카탈로그
                    </h3>
                    <div className="flex-1 border border-gray-100 rounded-xl overflow-hidden bg-gray-50/50">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-100/80 text-gray-700">
                                <tr>
                                    <th className="p-3 font-semibold">상품명</th>
                                    <th className="p-3 font-semibold">테마</th>
                                    <th className="p-3 font-semibold">판매가</th>
                                    <th className="p-3 font-semibold">상태</th>
                                    <th className="p-3 font-semibold">관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryData.map((item: any) => (
                                    <tr key={item.id} className="border-t border-gray-200 bg-white">
                                        <td className="p-3 font-bold text-gray-900">{item.name}</td>
                                        <td className="p-3">{item.theme}</td>
                                        <td className="p-3 font-bold text-orange-600">{item.price.toLocaleString()} 원</td>
                                        <td className="p-3"><span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold border border-green-200">판매중</span></td>
                                        <td className="p-3">
                                            <button onClick={() => handleDeleteProduct(item.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold focus:outline-none">삭제</button>
                                        </td>
                                    </tr>
                                ))}
                                {inventoryData.length === 0 && (
                                    <tr><td colSpan={5} className="p-6 text-center text-gray-400">등록된 상품이 없습니다. 샌드박스에서 추가해주세요.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

    ''', content, flags=re.DOTALL
)

# Market
content = re.sub(
    r'const renderMarket = \(\) => \{.+?(?=const renderSystem = \(\) => \{)',
    r'''const renderMarket = () => {
        if (!marketData) return <div className="text-gray-500 font-medium p-10 animate-pulse">마켓플레이스 데이터 로딩 중...</div>;
        const { logs, settlements } = marketData;

        return (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">전문가 플랫폼 통합 관리 (매칭 & 정산)</h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Matching Triggers List */}
                    <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100/50 flex flex-col h-[400px]">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" /> AI-전문가 매칭 트리거 로그
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">현재까지 총 {logs.total_ai_triggers}건의 심층상담 권유 중 <span className="font-bold text-blue-600">{logs.successful_matches}건이 결제됨</span> (전환율 {logs.conversion_rate}%)</p>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                            {logs.recent_logs.map((log: any, idx: number) => (
                                <div key={idx} className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col gap-1 transition-colors hover:bg-gray-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-700">예약 ID: #{log.reservation_id}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${log.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                                            {log.status === 'COMPLETED' ? '완료됨' : '진행중'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-800 mt-1 font-medium">AI 컨텍스트: {log.trigger_context}</p>
                                    <span className="text-[10px] text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Settlements Table */}
                    <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100/50 flex flex-col h-[400px] xl:col-span-2">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-500" /> 월별 정산 리포트 산출
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">대상 기간: {settlements.period} (에스크로 거래 완료 기준)</p>

                        <div className="flex-1 border border-gray-100 rounded-xl overflow-hidden bg-gray-50 w-full overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
                                <thead className="bg-gray-100/80 text-gray-700">
                                    <tr>
                                        <th className="p-3 font-semibold">전문가</th>
                                        <th className="p-3 font-semibold">상담 횟수</th>
                                        <th className="p-3 font-semibold text-right">플랫폼 수수료(10%)</th>
                                        <th className="p-3 font-semibold text-right">최종 지급액(원)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {settlements.settlements.map((s: any) => (
                                        <tr key={s.expert_id} className="border-t border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                                            <td className="p-3 font-bold text-gray-900">{s.expert_name}</td>
                                            <td className="p-3">{s.total_sessions}건</td>
                                            <td className="p-3 text-right text-red-500 font-medium">-{s.fee_deducted.toLocaleString()}</td>
                                            <td className="p-3 text-right text-blue-600 font-black">{s.final_settlement_amount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {settlements.settlements.length === 0 && (
                                        <tr><td colSpan={4} className="p-6 text-center text-gray-400">정산 내역이 없습니다.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <button className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/20">
                            이번 달 정산 일괄 승인 및 송출
                        </button>
                    </div>

                    {/* Expert Registration Form */}
                    <div className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100/50 flex flex-col lg:col-span-3">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-500" /> 신규 전문가 섭외 / 등록
                        </h3>
                        <form onSubmit={handleExpertRegister} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-1 block">활동명 (닉네임)</label>
                                <input required type="text" value={expertName} onChange={e => setExpertName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="예: 도원선사" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-1 block">전문 분야</label>
                                <select value={expertSpecialty} onChange={e => setExpertSpecialty(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                    <option value="사주/명리">사주/명리</option>
                                    <option value="타로/점성술">타로/점성술</option>
                                    <option value="신점/무속">신점/무속</option>
                                    <option value="심리/명상">심리/명상</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-600 mb-1 block">세션당 상담액 (원)</label>
                                <input required type="number" value={expertPrice} onChange={e => setExpertPrice(Number(e.target.value))} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <div className="md:col-span-2 lg:col-span-4 grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
                                <div className="lg:col-span-3">
                                    <label className="text-xs font-bold text-gray-600 mb-1 block">한줄 소개 (Bio)</label>
                                    <input required type="text" value={expertBio} onChange={e => setExpertBio(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="짧고 강렬한 캐치프레이즈" />
                                </div>
                                <button type="submit" disabled={isRegistering} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-md shadow-indigo-500/20 whitespace-nowrap">
                                    {isRegistering ? "등록 중..." : "시스템에 파트너 등록"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    ''', content, flags=re.DOTALL
)

# System + Render Root
content = re.sub(
    r'const renderSystem = \(\) => \{.+',
    r'''const renderSystem = () => {
        if (!systemData) return <div className="text-gray-500 font-medium p-10 animate-pulse">시스템 상태 체크 중...</div>;
        const { health, audit } = systemData;

        return (
            <div className="flex flex-col gap-6 animate-in fade-in duration-500">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">시스템 설정 및 보안 관리</h2>

                {/* Core API Health */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-100/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-3xl p-6 flex flex-col">
                        <h3 className="text-sm font-bold text-gray-800 mb-3">KASI 한국천문연구원 API</h3>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Latency: {health.kasi_api.latency_ms}ms</span>
                            <CheckCircle className="w-6 h-6 text-green-500" />
                        </div>
                    </div>
                    <div className="bg-white border border-gray-100/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-3xl p-6 flex flex-col">
                        <h3 className="text-sm font-bold text-gray-800 mb-3">LiveKit WebRTC 화상서버</h3>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Latency: {health.livekit_webrtc.latency_ms}ms</span>
                            <CheckCircle className="w-6 h-6 text-green-500" />
                        </div>
                    </div>
                    <div className={`bg-white border border-gray-100/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-3xl p-6 flex flex-col ${health.openai_api.status !== 'healthy' ? 'border-red-200 bg-red-50' : ''}`}>
                        <h3 className="text-sm font-bold text-gray-800 mb-3">OpenAI LLM 챗봇 엔진</h3>
                        <div className="flex justify-between items-center mb-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${health.openai_api.status !== 'healthy' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>Latency: {health.openai_api.latency_ms}ms</span>
                            {health.openai_api.status === 'healthy' ? <CheckCircle className="w-6 h-6 text-green-500" /> : <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />}
                        </div>
                        {health.openai_api.message && health.openai_api.status !== 'healthy' && (
                            <span className="text-xs font-bold text-red-500 bg-red-100 p-2 rounded-lg">{health.openai_api.message}</span>
                        )}
                    </div>
                </div>

                {/* Privacy Volatile Audit Logs */}
                <div className="bg-white border border-red-100 rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col h-[500px]">
                    <h3 className="text-lg font-bold text-red-600 mb-1 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5" /> 개인정보 휘발성 파기 보안 감사 로그 (Volatile Wipe)
                    </h3>
                    <p className="text-xs text-gray-500 mb-4 font-medium">사용자 출생 정보 연산 이후 즉각적인 메모리 파기 상태를 감시합니다.</p>

                    <div className="flex-1 overflow-y-auto border border-gray-100 rounded-xl bg-gray-50 p-3 space-y-1.5 font-mono text-[11px] custom-scrollbar">
                        {audit.audit_logs.map((log: any, idx: number) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between border border-gray-100 bg-white rounded-lg p-2.5 hover:shadow-sm transition-shadow">
                                <span className="text-gray-500 font-medium sm:w-44 mb-1 sm:mb-0">{log.timestamp.replace('T', ' ')}</span>
                                <span className="text-indigo-600 font-bold flex-1 sm:ml-4">[{log.process_id}] 메모리 파기 절차 발동</span>
                                <span className={`font-black mt-1 sm:mt-0 ${log.status === 'SUCCESS' ? 'text-green-600' : 'text-red-500 animate-pulse'}`}>
                                    {log.status === 'SUCCESS' ? '파기 성공' : '재시도 필요!'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F5F6F8] font-pretendard flex flex-col md:flex-row mt-[72px]">

            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 md:h-[calc(100vh-72px)] md:fixed md:top-[72px] md:left-0 bg-white shadow-[2px_0_10px_rgba(0,0,0,0.02)] border-r border-gray-100/50 z-40 flex flex-col">
                <div className="p-6 pb-2 hidden md:block">
                    <h1 className="text-2xl font-black font-outfit text-gray-900 tracking-tight">SyncMate</h1>
                    <p className="text-[11px] text-blue-500 tracking-widest font-bold mt-1 uppercase">Admin Panel</p>
                </div>

                <nav className="flex-1 flex md:flex-col gap-2 p-4 pt-4 md:pt-6 overflow-x-auto hide-scrollbar">
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`flex items-center gap-3 px-4 py-3 min-w-[140px] rounded-xl font-bold text-sm transition-all ${activeTab === 'analytics' ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-l-4 border-transparent'}`}
                    >
                        <LayoutDashboard className="w-5 h-5 shrink-0" /> <span className="hidden md:inline">트래픽/통계</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('goods')}
                        className={`flex items-center gap-3 px-4 py-3 min-w-[140px] rounded-xl font-bold text-sm transition-all ${activeTab === 'goods' ? 'bg-orange-50 text-orange-600 border-l-4 border-orange-500' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-l-4 border-transparent'}`}
                    >
                        <ShoppingBag className="w-5 h-5 shrink-0" /> <span className="hidden md:inline">상점 관리</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('market')}
                        className={`flex items-center gap-3 px-4 py-3 min-w-[140px] rounded-xl font-bold text-sm transition-all ${activeTab === 'market' ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-500' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-l-4 border-transparent'}`}
                    >
                        <Users className="w-5 h-5 shrink-0" /> <span className="hidden md:inline">마켓/정산</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('system')}
                        className={`flex items-center gap-3 px-4 py-3 min-w-[140px] rounded-xl font-bold text-sm transition-all ${activeTab === 'system' ? 'bg-red-50 text-red-600 border-l-4 border-red-500' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-l-4 border-transparent'}`}
                    >
                        <ShieldAlert className="w-5 h-5 shrink-0" /> <span className="hidden md:inline">보안/설정</span>
                    </button>
                </nav>

                {/* Admin Profile Foot */}
                <div className="p-4 border-t border-gray-100 hidden md:flex items-center gap-3 mt-auto">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-800 to-gray-900 flex justify-center items-center shadow-md">
                        <span className="text-white font-bold font-outfit text-xs">Admin</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900">최고 관리자</p>
                        <p className="text-[10px] text-green-600 font-bold">운영 서버 연결됨 (Prod-1)</p>
                    </div>
                </div>
            </aside>

            {/* Main Content Pane */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 pt-6 relative z-10 w-full overflow-x-hidden min-h-screen">
                {/* Top App Bar Header Search */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-gray-200/60 gap-4">
                    <div className="sm:hidden flex items-center w-full justify-between">
                        <h1 className="text-xl font-black font-outfit text-gray-900">SyncMate Admin</h1>
                    </div>
                    
                    <div className="relative w-full max-w-md">
                        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="사용자명, 검색어 입력..."
                            className="w-full bg-white border border-gray-200 shadow-sm rounded-full py-2.5 pl-10 pr-4 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    
                    <div className="flex gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                        <button className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex-1 sm:flex-none transition-colors shadow-sm">
                            전체 리포트 받기 (CSV)
                        </button>
                    </div>
                </header>

                {/* Dynamic Outlet */}
                {activeTab === 'analytics' && renderAnalytics()}
                {activeTab === 'goods' && renderGoods()}
                {activeTab === 'market' && renderMarket()}
                {activeTab === 'system' && renderSystem()}
            </main>
        </div>
    );
}
''', content, flags=re.DOTALL
)

with open(r'c:\Users\김훈\Desktop\제미나이_앱\260223_명리학\frontend\src\app\admin\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Admin dashboard rewritten safely.")
