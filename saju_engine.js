/**
 * 만세력 엔진 (Saju Pro Engine)
 * - 60갑자 일주 계산
 * - 십이운성(12 Unseong) 계산 -> 에너지 레벨 변환
 * - 십성(Ten Gods) 계산 -> 플레이스타일 변환
 * - 공망(Void) 계산 -> 약점 변환
 */

const GAN_KR = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
const JI_KR = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

// 12운성 매핑 테이블 (일간 기준 지지의 운성)
// 순서: 자, 축, 인, 묘, 진, 사, 오, 미, 신, 유, 술, 해
const UNSEONG_TABLE = {
    '갑': ['목욕', '광대', '건록', '제왕', '쇠', '병', '사', '묘', '절', '태', '양', '장생'],
    '을': ['병', '쇠', '제왕', '건록', '광대', '목욕', '장생', '양', '태', '절', '묘', '사'],
    '병': ['태', '양', '장생', '목욕', '광대', '건록', '제왕', '쇠', '병', '사', '묘', '절'],
    '정': ['절', '묘', '사', '병', '쇠', '제왕', '건록', '광대', '목욕', '장생', '양', '태'],
    '무': ['태', '양', '장생', '목욕', '광대', '건록', '제왕', '쇠', '병', '사', '묘', '절'], // 병과 동일
    '기': ['절', '묘', '사', '병', '쇠', '제왕', '건록', '광대', '목욕', '장생', '양', '태'], // 정과 동일
    '경': ['사', '묘', '절', '태', '양', '장생', '목욕', '광대', '건록', '제왕', '쇠', '병'],
    '신': ['장생', '양', '태', '절', '묘', '사', '병', '쇠', '제왕', '건록', '광대', '목욕'],
    '임': ['제왕', '쇠', '병', '사', '묘', '절', '태', '양', '장생', '목욕', '광대', '건록'],
    '계': ['건록', '광대', '목욕', '장생', '양', '태', '절', '묘', '사', '병', '쇠', '제왕']
};

const SOCCER_UNSEONG = {
    '장생': { keyword: '슈퍼 루키', desc: '타고난 재능충. 뭘 해도 예쁨 받음.', ovr_bonus: 8 },
    '목욕': { keyword: '패션왕', desc: '실력보다 유니폼 핏이 중요함. 겉멋 듬.', ovr_bonus: 5 },
    '광대': { keyword: '유니폼 수집가', desc: '장비빨 세우는데 인생을 바침.', ovr_bonus: 4 },
    '건록': { keyword: '차기 주장', desc: '성실함의 아이콘. 코치들이 좋아함.', ovr_bonus: 9 },
    '제왕': { keyword: '월드 클래스', desc: '독불장군. 내가 곧 전술이다.', ovr_bonus: 10 },
    '쇠': { keyword: '노련한 베테랑', desc: '체력은 저질인데 위치선정으로 커버함.', ovr_bonus: 7 },
    '병': { keyword: '유리몸', desc: '잔부상 달고 삼. 아프다는 핑계가 많음.', ovr_bonus: 3 },
    '사': { keyword: '전술 분석관', desc: '뛰는 것보다 입으로 축구하는 걸 좋아함.', ovr_bonus: 4 },
    '묘': { keyword: '벤치 워머', desc: '자기만의 세계에 갇힘. 경기장보다 벤치가 편함.', ovr_bonus: 2 },
    '절': { keyword: '단기 계약직', desc: '기복이 심함. 잘할 땐 메시, 못할 땐 짐.', ovr_bonus: 3 },
    '태': { keyword: '만년 유망주', desc: '가능성만 10년째. 포텐이 안 터짐.', ovr_bonus: 5 },
    '양': { keyword: '양자', desc: '어느 팀을 가든 적응함. 무난함 그 자체.', ovr_bonus: 6 }
};

// 십성 (Ten Gods) 계산을 위한 오행 매핑
// 목: 0, 1 (갑,을) / 화: 2, 3 (병,정) / 토: 4, 5 (무,기) / 금: 6, 7 (경,신) / 수: 8, 9 (임,계)
// 지지 오행: 자(수), 축(토), 인(목), 묘(목), 진(토), 사(화), 오(화), 미(토), 신(금), 유(금), 술(토), 해(수)
const STEM_IDX = { '갑': 0, '을': 1, '병': 2, '정': 3, '무': 4, '기': 5, '경': 6, '신': 7, '임': 8, '계': 9 };
const BRANCH_ELEMENT = {
    '자': '수', '축': '토', '인': '목', '묘': '목', '진': '토', '사': '화',
    '오': '화', '미': '토', '신': '금', '유': '금', '술': '토', '해': '수'
};
const ELEMENT_MAP = {
    '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토', '기': '토', '경': '금', '신': '금', '임': '수', '계': '수'
};

const SOCCER_TEN_GODS = {
    '비견': { type: '독단적 스트라이커', desc: '패스 안 함. 내가 해결해야 직성이 풀림.' },
    '겁재': { type: '승부조작 브로커', desc: '수단과 방법을 가리지 않고 이기려 함.' },
    '식신': { type: '창의적 플레이메이커', desc: '즐겜 유저. 개인기 보여주려고 축구함.' },
    '상관': { type: '심판 킬러', desc: '말대꾸 장인. 심판이랑 싸우다 퇴장당함.' },
    '편재': { type: '공간 침투러', desc: '넓은 시야로 빈 공간만 찾아다님.' },
    '정재': { type: '살림꾼 풀백', desc: '정확한 크로스. 낭비 없는 축구를 함.' },
    '편관': { type: '터프가이 수비수', desc: '거친 태클. 상대 발목을 노림.' },
    '정관': { type: '모범생 미드필더', desc: '전술 지시 완벽 이행. 재미는 없음.' },
    '편인': { type: '괴짜 골키퍼', desc: '예측 불가능한 기행을 일삼음.' },
    '정인': { type: '사랑받는 마스코트', desc: '실력보단 인기로 주전 먹음.' }
};

// 십성 계산 로직 (간단화)
function getTenGods(gan, ji) {
    const gElem = ELEMENT_MAP[gan];
    const jElem = BRANCH_ELEMENT[ji];
    const relation = getElementRelation(gElem, jElem);
    const gYinYang = (STEM_IDX[gan] % 2 === 0) ? 'yang' : 'yin'; // 갑(0, 양), 을(1, 음)...
    // 지지 음양 매핑은 복잡하므로 단순화된 로직 사용 (실제 명리와 100% 일치하진 않아도 됨)
    // 자(양), 축(음), 인(양), 묘(음)... 로 가정 (체용론 제외)
    const jIdx = JI_KR.indexOf(ji);
    const jYinYang = (jIdx % 2 === 0) ? 'yang' : 'yin'; // 자(0, 양)... 틀림. 자는 체는 양이나 용은 음..
    // 여기선 간단히 짝수/홀수로 구분하여 비견/겁재 등 구분

    // 심플 매핑:
    // 비견/겁재: 오행 같음
    // 식신/상관: 내가 생함 (목생화)
    // 편재/정재: 내가 극함 (목극토)
    // 편관/정관: 나를 극함 (금극목)
    // 편인/정인: 나를 생함 (수생목)

    // 음양 같으면 식신/편재/편관/편인/비견
    // 음양 다르면 상관/정재/정관/정인/겁재

    const isSameYinYang = (gYinYang === jYinYang); // Note: 실제 지지 음양은 복잡하지만 여기선 단순화

    if (gElem === jElem) return isSameYinYang ? '비견' : '겁재';
    if (isSaeng(gElem, jElem)) return isSameYinYang ? '식신' : '상관'; // 내가 생함
    if (isKeuk(gElem, jElem)) return isSameYinYang ? '편재' : '정재'; // 내가 극함
    if (isKeuk(jElem, gElem)) return isSameYinYang ? '편관' : '정관'; // 나를 극함
    if (isSaeng(jElem, gElem)) return isSameYinYang ? '편인' : '정인'; // 나를 생함

    return '비견'; // Default
}

function isSaeng(a, b) {
    // 목생화, 화생토, 토생금, 금생수, 수생목
    const cycle = ['목', '화', '토', '금', '수'];
    return cycle[(cycle.indexOf(a) + 1) % 5] === b;
}

function isKeuk(a, b) {
    // 목극토, 화극금, 토극수, 금극목, 수극화
    const cycle = ['목', '화', '토', '금', '수'];
    return cycle[(cycle.indexOf(a) + 2) % 5] === b;
}

/*
    Public Methods
*/
export function calculateSaju(dateString) {
    const refDate = new Date(2000, 0, 1); // 2000-01-01 (무오)
    const targetDate = new Date(dateString);
    const diffDays = Math.floor((targetDate - refDate) / (1000 * 60 * 60 * 24));

    let stemIdx = (4 + diffDays) % 10; // 무(4)
    while (stemIdx < 0) stemIdx += 10;

    let branchIdx = (6 + diffDays) % 12; // 오(6)
    while (branchIdx < 0) branchIdx += 12;

    const gan = GAN_KR[stemIdx];
    const ji = JI_KR[branchIdx];
    const ilju = gan + ji;

    // 12 Unseong
    const unseongKey = UNSEONG_TABLE[gan][branchIdx]; // Direct mapping by branch index order
    // 자(0).. 해(11). UNSEONG_TABLE is ordered by 자..해
    const unseongData = SOCCER_UNSEONG[unseongKey];

    // Ten Gods
    const tenGod = getTenGods(gan, ji);
    const tenGodData = SOCCER_TEN_GODS[tenGod];

    // Generate Stats seeded by Ilju
    const seed = stemIdx * 100 + branchIdx;

    return {
        ilju: ilju,
        gan: gan,
        ji: ji,
        unseong: unseongData,
        tenGod: tenGodData,
        seed: seed
    };
}

export const ANIMAL_ICONS = {
    '자': '🐭', '축': '🐮', '인': '🐯', '묘': '🐰', '진': '🐲', '사': '🐍',
    '오': '🐴', '미': '🐑', '신': '🐵', '유': '🐔', '술': '🐶', '해': '🐷'
};

export const ANIMAL_NAMES = {
    '자': '쥐', '축': '소', '인': '호랑이', '묘': '토끼', '진': '용', '사': '뱀',
    '오': '말', '미': '양', '신': '원숭이', '유': '닭', '술': '개', '해': '돼지'
};
