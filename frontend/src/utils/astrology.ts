export interface AstrologyData {
    type: string;
    title: string;
    subtitle: string;
    emoji: string;
    description: string;
    color: string;
    bgStyle: string;
}

export function getZodiacSign(month: number, day: number): AstrologyData {
    const signs = [
        { name: '염소자리', emoji: '♑', end: 19, desc: '결실을 향해 조용히 오르는 견고한 책임감', color: '#4A5568', bg: 'bg-gradient-to-br from-gray-700 to-gray-900' },
        { name: '물병자리', emoji: '♒', end: 18, desc: '얽매이지 않는 자유로운 바람과 혁신', color: '#38B2AC', bg: 'bg-gradient-to-br from-teal-400 to-blue-500' },
        { name: '물고기자리', emoji: '♓', end: 20, desc: '경계를 허무는 바닷빛 깊은 감수성', color: '#4299E1', bg: 'bg-gradient-to-br from-blue-300 to-blue-500' },
        { name: '양자리', emoji: '♈', end: 19, desc: '새로운 세상을 여는 뜨거운 생명력', color: '#F56565', bg: 'bg-gradient-to-br from-red-400 to-red-600' },
        { name: '황소자리', emoji: '♉', end: 20, desc: '아름다움을 지키는 대지의 묵직한 평온', color: '#48BB78', bg: 'bg-gradient-to-br from-green-400 to-green-600' },
        { name: '쌍둥이자리', emoji: '♊', end: 20, desc: '끝없는 호기심으로 세상을 탐색하는 지성', color: '#ECC94B', bg: 'bg-gradient-to-br from-yellow-300 to-yellow-500' },
        { name: '게자리', emoji: '♋', end: 22, desc: '포근한 달빛을 품은 보호와 사랑의 힘', color: '#A0AEC0', bg: 'bg-gradient-to-br from-gray-300 to-gray-500' },
        { name: '사자자리', emoji: '♌', end: 22, desc: '태양처럼 스스로 빛을 내는 압도적 존재감', color: '#ED8936', bg: 'bg-gradient-to-br from-orange-400 to-orange-600' },
        { name: '처녀자리', emoji: '♍', end: 22, desc: '완벽을 향해 나아가는 순결한 분석력', color: '#68D391', bg: 'bg-gradient-to-br from-emerald-400 to-teal-500' },
        { name: '천칭자리', emoji: '♎', end: 22, desc: '세련된 균형감각으로 빚어내는 조화의 미학', color: '#F687B3', bg: 'bg-gradient-to-br from-pink-300 to-pink-500' },
        { name: '전갈자리', emoji: '♏', end: 21, desc: '죽음과 부활을 관장하는 매혹적인 비밀', color: '#805AD5', bg: 'bg-gradient-to-br from-purple-600 to-purple-900' },
        { name: '사수자리', emoji: '♐', end: 21, desc: '미지의 세계를 향해 날아가는 자유의 화살', color: '#9F7AEA', bg: 'bg-gradient-to-br from-purple-400 to-indigo-500' }
    ];

    let index = month - 1;
    if (day > signs[index].end) {
        index = (index + 1) % 12;
    }
    const sign = signs[index];

    return {
        type: '별자리표',
        title: sign.name,
        subtitle: '나의 수호 별자리',
        emoji: sign.emoji,
        description: sign.desc,
        color: sign.color,
        bgStyle: sign.bg
    };
}

export function getBirthstone(month: number): AstrologyData {
    const stones = [
        { name: '가넷', emoji: '💎', desc: '영원한 우정과 변치 않는 진실한 마음의 상징', color: '#9B111E', bg: 'bg-gradient-to-br from-red-800 to-red-950' },
        { name: '자수정', emoji: '🔮', desc: '영혼을 정화하는 지혜와 직관의 크리스탈', color: '#9966CC', bg: 'bg-gradient-to-br from-purple-500 to-purple-800' },
        { name: '아쿠아마린', emoji: '🩵', desc: '바다의 여신이 내린 맑은 치유와 영원한 젊음', color: '#7FFFD4', bg: 'bg-gradient-to-br from-cyan-300 to-blue-400' },
        { name: '다이아몬드', emoji: '✨', desc: '억겁의 시간이 빚어낸 순수하고 불멸하는 영원', color: '#E0E5E5', bg: 'bg-gradient-to-br from-gray-100 to-gray-300' },
        { name: '에메랄드', emoji: '🍀', desc: '행운과 행복을 끌어당기는 초록빛 치유의 에너지', color: '#50C878', bg: 'bg-gradient-to-br from-emerald-500 to-green-700' },
        { name: '진주', emoji: '🤍', desc: '고통을 이겨내고 피어난 순결하고 고귀한 빛', color: '#FDFBEA', bg: 'bg-gradient-to-br from-yellow-50 to-gray-200' },
        { name: '루비', emoji: '❤️', desc: '태양의 열정을 담은 매혹적이고 찬란한 사랑', color: '#E0115F', bg: 'bg-gradient-to-br from-rose-500 to-red-700' },
        { name: '페리도트', emoji: '💚', desc: '어둠 속에서도 빛을 잃지 않는 우주의 파편', color: '#B4C424', bg: 'bg-gradient-to-br from-lime-400 to-green-500' },
        { name: '사파이어', emoji: '💙', desc: '천상의 진리를 품은 우아하고 깊은 푸른빛', color: '#0F52BA', bg: 'bg-gradient-to-br from-blue-700 to-indigo-900' },
        { name: '오팔', emoji: '🌈', desc: '모든 보석의 색을 담아낸 변화무쌍한 희망', color: '#E0EEF1', bg: 'bg-gradient-to-br from-pink-200 via-purple-200 to-cyan-200' },
        { name: '토파즈', emoji: '💛', desc: '부와 명예를 부르는 따뜻한 태양의 파동', color: '#FFC87C', bg: 'bg-gradient-to-br from-amber-200 to-orange-400' },
        { name: '터키석', emoji: '🧿', desc: '액운을 막아주는 강력하고 신비한 수호의 부적', color: '#40E0D0', bg: 'bg-gradient-to-br from-teal-300 to-cyan-500' }
    ];

    const stone = stones[month - 1];

    return {
        type: '퍼스널 젬잼',
        title: `${month}월의 탄생석: ${stone.name}`,
        subtitle: '수호 크리스탈',
        emoji: stone.emoji,
        description: stone.desc,
        color: stone.color,
        bgStyle: stone.bg
    };
}

export function getNumerology(year: number, month: number, day: number): AstrologyData {
    // Calculate Life Path Number
    let sum = year + month + day;
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
        sum = String(sum).split('').reduce((acc, curr) => acc + parseInt(curr, 10), 0);
    }

    // Check master numbers manually
    let lifePath = sum;

    const meanings: Record<number, { title: string, desc: string, color: string, bg: string }> = {
        1: { title: '1 - 창조자', desc: '스스로 길을 개척하는 독립적이고 강력한 리더의 영혼', color: '#E53E3E', bg: 'bg-gradient-to-br from-red-500 to-orange-500' },
        2: { title: '2 - 평화주의자', desc: '섬세한 직관으로 세상을 연결하고 조율하는 치유자', color: '#D69E2E', bg: 'bg-gradient-to-br from-yellow-400 to-orange-400' },
        3: { title: '3 - 예술가', desc: '기쁨과 영감을 흩뿌리는 창의적이고 찬란한 태양', color: '#38A169', bg: 'bg-gradient-to-br from-green-400 to-teal-500' },
        4: { title: '4 - 건축가', desc: '흔들리지 않는 견고한 질서를 세우는 현실의 마스터', color: '#3182CE', bg: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
        5: { title: '5 - 탐험가', desc: '자유를 갈망하며 미지의 세계를 경험하는 보헤미안', color: '#805AD5', bg: 'bg-gradient-to-br from-purple-500 to-purple-800' },
        6: { title: '6 - 수호자', desc: '깊은 사랑과 헌신으로 주변을 돌보는 따뜻한 등대', color: '#D53F8C', bg: 'bg-gradient-to-br from-pink-500 to-rose-600' },
        7: { title: '7 - 구도자', desc: '진리를 좇아 내면의 깊은 곳을 탐구하는 지혜로운 철학자', color: '#4A5568', bg: 'bg-gradient-to-br from-gray-600 to-gray-900' },
        8: { title: '8 - 통치자', desc: '현실의 풍요와 권력을 완성하는 압도적인 물질적 힘', color: '#2C7A7B', bg: 'bg-gradient-to-br from-teal-600 to-teal-900' },
        9: { title: '9 - 완성자', desc: '세상을 보듬고 다음 차원으로 넘어가는 위대한 인간애', color: '#B7791F', bg: 'bg-gradient-to-br from-yellow-600 to-amber-800' },
        11: { title: '11 - 깨어난 불꽃', desc: '[마스터 넘버] 우주의 메시지를 전달하는 직관적인 영적 메신저', color: '#E9D8FD', bg: 'bg-gradient-to-br from-indigo-300 to-purple-500' },
        22: { title: '22 - 마스터 빌더', desc: '[마스터 넘버] 원대한 이상을 현실에 구현해 내는 창조적 천재', color: '#C6F6D5', bg: 'bg-gradient-to-br from-emerald-300 to-teal-500' },
        33: { title: '33 - 마스터 티처', desc: '[마스터 넘버] 무조건적인 사랑으로 영혼을 구원하는 영적 스승', color: '#FED7E2', bg: 'bg-gradient-to-br from-pink-300 to-rose-400' },
    };

    const numerology = meanings[lifePath] || meanings[1];

    return {
        type: '나침반 흐름',
        title: `운명수: ${numerology.title}`,
        subtitle: '수비학 인생 바코드',
        emoji: '🔢',
        description: numerology.desc,
        color: numerology.color,
        bgStyle: numerology.bg
    };
}

export function getSeason(month: number): AstrologyData {
    const seasons = {
        spring: { title: '따스한 생명의 봄', emoji: '🌸', desc: '얼어붙은 땅을 뚫고 싹을 틔우는 호기심과 거침없는 시작의 힘', color: '#F687B3', bg: 'bg-gradient-to-br from-pink-300 to-rose-400' },
        summer: { title: '눈부신 열정의 여름', emoji: '🌿', desc: '세상을 초록으로 물들이고 태양처럼 확산하는 강렬한 성장의 힘', color: '#68D391', bg: 'bg-gradient-to-br from-green-400 to-emerald-600' },
        autumn: { title: '풍성한 결실의 가을', emoji: '🍁', desc: '황금빛으로 무르익은 지혜와 날카롭게 정돈하는 수확의 힘', color: '#DD6B20', bg: 'bg-gradient-to-br from-orange-400 to-amber-600' },
        winter: { title: '고독한 영맥의 겨울', emoji: '❄️', desc: '모든 것을 품고 조용히 다음 생명을 준비하는 깊은 응축의 힘', color: '#63B3ED', bg: 'bg-gradient-to-br from-blue-300 to-indigo-500' }
    };

    let season;
    if (month >= 3 && month <= 5) season = seasons.spring;
    else if (month >= 6 && month <= 8) season = seasons.summer;
    else if (month >= 9 && month <= 11) season = seasons.autumn;
    else season = seasons.winter;

    return {
        type: '계절 에너지',
        title: season.title,
        subtitle: '영혼의 계절',
        emoji: season.emoji,
        description: season.desc,
        color: season.color,
        bgStyle: season.bg
    };
}

export function getPastLife(): AstrologyData {
    // Past life is abstracted, we show a general mystical banner
    return {
        type: '과거의 나',
        title: '신비의 아카식 레코드',
        subtitle: '전생과 카르마',
        emoji: '👁️',
        description: '시간의 장막을 넘어, 당신의 영혼이 걸어온 전생의 발자취와 소울메이트',
        color: '#805AD5',
        bgStyle: 'bg-gradient-to-br from-purple-800 via-indigo-900 to-black text-white'
    };
}

export function getZodiacAnimal(year: number): AstrologyData {
    const animals = [
        { name: '원숭이', emoji: '🐵', desc: '번뜩이는 재치와 다재다능함으로 세상을 탐험하는 재주꾼', color: '#D69E2E', bg: 'bg-gradient-to-br from-yellow-300 to-orange-300' },
        { name: '닭', emoji: '🐔', desc: '새벽을 깨우는 날카로운 통찰력과 화려한 매력을 지닌 선구자', color: '#E53E3E', bg: 'bg-gradient-to-br from-red-400 to-red-600' },
        { name: '개', emoji: '🐶', desc: '굳건한 신의와 정의로움으로 자신이 믿는 것을 끝까지 지켜내는 충성심', color: '#B7791F', bg: 'bg-gradient-to-br from-amber-500 to-orange-700' },
        { name: '돼지', emoji: '🐷', desc: '세상을 품어내는 여유와 관대함으로 풍요로움을 끌어당기는 복덩이', color: '#F687B3', bg: 'bg-gradient-to-br from-pink-300 to-pink-500' },
        { name: '쥐', emoji: '🐭', desc: '뛰어난 적응력과 영리함으로 누구보다 빠르게 기회를 포착하는 지혜', color: '#4A5568', bg: 'bg-gradient-to-br from-gray-500 to-gray-700' },
        { name: '소', emoji: '🐮', desc: '묵묵하고 뚝심 있게 거대한 바위를 움직이는 흔들림 없는 인내의 힘', color: '#718096', bg: 'bg-gradient-to-br from-slate-400 to-slate-600' },
        { name: '호랑이', emoji: '🐯', desc: '거침없이 도전하고 대륙을 호령하는 카리스마 넘치는 리더십', color: '#DD6B20', bg: 'bg-gradient-to-br from-orange-400 to-orange-600' },
        { name: '토끼', emoji: '🐰', desc: '섬세한 감수성과 포근한 매력으로 평화와 예술을 사랑하는 이상주의자', color: '#9AE6B4', bg: 'bg-gradient-to-br from-green-200 to-teal-400' },
        { name: '용', emoji: '🐲', desc: '하늘을 나는 고결한 이상과 누구도 흉내 낼 수 없는 극강의 에너지', color: '#3182CE', bg: 'bg-gradient-to-br from-blue-400 to-indigo-600' },
        { name: '뱀', emoji: '🐍', desc: '가슴 깊은 곳에서 타오르는 열정과 완벽을 추구하는 지적인 우아함', color: '#38A169', bg: 'bg-gradient-to-br from-green-600 to-emerald-800' },
        { name: '말', emoji: '🐴', desc: '자유를 갈망하며 드넓은 초원을 달리는 멈출 수 없는 역동적 생명력', color: '#E53E3E', bg: 'bg-gradient-to-br from-red-500 to-rose-700' },
        { name: '양', emoji: '🐑', desc: '내면의 단단한 평화를 간직한 채 주변을 배려하는 따뜻한 치유자', color: '#E2E8F0', bg: 'bg-gradient-to-br from-gray-200 to-gray-400 text-gray-800' }
    ];

    const animal = animals[year % 12];

    return {
        type: '띠 해석',
        title: `${animal.name}띠`,
        subtitle: '수호 동물',
        emoji: animal.emoji,
        description: animal.desc,
        color: animal.color,
        bgStyle: animal.bg
    };
}

// Helper to get astrology data based on reading type
export function getAstrologyData(type: string, dateObj: Date): AstrologyData | null {
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();

    switch (type) {
        case '별자리표': return getZodiacSign(month, day);
        case '퍼스널 젬잼': return getBirthstone(month);
        case '나침반 흐름': return getNumerology(year, month, day);
        case '계절 에너지': return getSeason(month);
        case '과거의 나': return getPastLife();
        case '띠 해석': return getZodiacAnimal(year);
        default: return null;
    }
}
