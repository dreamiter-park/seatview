// --- Supabase Config & Client ---
const SUPABASE_URL = 'https://zgdumfqkhqroehaszmau.supabase.co/rest/v1/'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZHVtZnFraHFyb2VoYXN6bWF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5MDA2NDcsImV4cCI6MjEwMDQ3NjY0N30.ZtbbY2R0iKMtmNyB36EF6YRR62TRV-_l6huo87FQ41g'; 

let supabaseClient = null;
if (SUPABASE_URL && !SUPABASE_URL.includes("본인의-프로젝트-고유ID") && window.supabase) {
  try {
    // URL에서 뒤쪽의 '/rest/v1/' 또는 '/rest/v1' 경로가 있다면 제거하여 SDK가 정상 작동하도록 함
    let cleanUrl = SUPABASE_URL.trim();
    if (cleanUrl.endsWith('/rest/v1/')) {
      cleanUrl = cleanUrl.slice(0, -9);
    } else if (cleanUrl.endsWith('/rest/v1')) {
      cleanUrl = cleanUrl.slice(0, -8);
    }
    supabaseClient = window.supabase.createClient(cleanUrl, SUPABASE_ANON_KEY);
  } catch (e) {
    console.error("Supabase 초기화 오류:", e);
  }
}

// 잘보여유 에디터 운영 계정(공연장이 공식 홈페이지 등에 올린 빈 좌석/무대
// 사진을 그대로 캡처해서 인용 등록하는 용도 — 실제 관람객이 앉아서 찍은
// 사진이 아님). 좌석 그리드 색상 구분(#17)과 공연장 목록 정렬용 카운트
// 제외(#18)에서 공통으로 쓴다.
const OFFICIAL_SOURCE_USER_ID = 'ca42d30f-a372-4cc7-8651-3cb49f473dd7';

// --- Kakao SDK Config (카카오톡 공유용, 로그인과는 별개) ---
const KAKAO_JS_KEY = '5b5835750aff0f479c11ff8a1c15b7e5';
if (window.Kakao && !Kakao.isInitialized()) {
  Kakao.init(KAKAO_JS_KEY);
}

// --- 1. Seed & Mock Database ---
let STADIUMS_DB = [];
let VENUES_DB = [];
// STADIUMS_DB uses string ids (jamsil, gocheok, ...) but the baseball_blocks/
// baseball_seats tables key off the stadiums table's real numeric id.
const BASEBALL_DB_ID_MAP = { jamsil: 1, gocheok: 2, incheon: 3, suwon: 4, daejeon: 5, daegu: 6, gwangju: 7, changwon: 8, busan: 9 };
// One shopping-ad banner per category (baseball/musical), keyed by category —
// managed from admin's "광고 관리" tab (shopping_ads table). Empty until
// loadShoppingAds() resolves, so buildShoppingAdCard() just skips the ad
// slot on the very first render instead of showing stale/placeholder content.
let SHOPPING_ADS_DB = {};
const MOCK_STADIUMS_DB = [
  {
    id: "jamsil",
    name: "잠실 야구장",
    fullname: "서울종합운동장 야구장",
    team: "LG 트윈스 / 두산 베어스",
    location: "서울 송파구 올림픽로 25",
    bg: "/assets/jamsil_stadium.jpg",
    gradient: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(127, 29, 29, 0.75))",
    blocks: [
      { id: "b101", name: "1루 레드석 101블록", category: "내야", grade: "red" },
      { id: "b102", name: "1루 레드석 102블록", category: "내야", grade: "red" },
      { id: "b103", name: "1루 오렌지석(응원단상) 103블록", category: "응원", grade: "orange" },
      { id: "b104", name: "1루 오렌지석(응원단상) 104블록", category: "응원", grade: "orange" },
      { id: "b105", name: "1루 네이비석 301블록", category: "상층", grade: "navy" },
      { id: "b117", name: "3루 레드석 117블록", category: "내야", grade: "red" },
      { id: "b118", name: "3루 레드석 118블록", category: "내야", grade: "red" },
      { id: "b119", name: "3루 레드석 119블록", category: "내야", grade: "red" },
      { id: "b120", name: "3루 레드석 120블록", category: "내야", grade: "red" },
      { id: "b121", name: "3루 오렌지석(원정응원) 121블록", category: "응원", grade: "orange" },
      { id: "b122", name: "3루 오렌지석 122블록", category: "응원", grade: "orange" },
      { id: "b223", name: "3루 레드석 223블록", category: "내야", grade: "red" },
      { id: "b224", name: "3루 레드석 224블록", category: "내야", grade: "red" },
      { id: "b225", name: "3루 레드석 225블록", category: "내야", grade: "red" },
      { id: "b226", name: "3루 레드석 226블록", category: "내야", grade: "red" },
      { id: "b301", name: "외야 그린석 401블록", category: "외야", grade: "green" },
      { id: "b_prem", name: "프리미엄석 212블록", category: "프리미엄", grade: "premium" },
      { id: "b_table", name: "1루 테이블석 110블록", category: "테이블", grade: "table" },
      { id: "b_excit", name: "1루 익사이팅석 104블록 옆", category: "내야", grade: "exciting" },
      { id: "b_blue", name: "1루 블루석 107블록", category: "내야", grade: "blue" }
    ],
    // Amenity coordinates (top% / left% inside stadium map wrapper)
    amenities: {
      toilet: [
        { name: "1루 화장실", x: 70, y: 71 },
        { name: "3루 화장실", x: 30, y: 71 },
        { name: "외야 중앙 화장실", x: 50, y: 13 }
      ],
      snack: [
        { name: "삼겹살 광장 매점", x: 79, y: 66 },
        { name: "원조 김말이 떡볶이", x: 61, y: 73.5 },
        { name: "3루 백미당/스테프핫도그", x: 21, y: 66 }
      ],
      exit: [
        { name: "1루 내야 출입구", x: 87, y: 82 },
        { name: "3루 내야 출입구", x: 13, y: 82 },
        { name: "외야 매표소 게이트", x: 50, y: 5 }
      ],
      medical: [
        { name: "의무실 (1루 복도 안쪽)", x: 63, y: 55 }
      ]
    }
  },
  {
    id: "gocheok",
    name: "고척 스카이돔",
    fullname: "고척 스카이돔",
    team: "키움 히어로즈",
    location: "서울 구로구 경인로 430",
    bg: "/assets/jamsil_stadium.jpg", // reusing for demo
    gradient: "linear-gradient(135deg, rgba(88, 28, 135, 0.95), rgba(30, 27, 75, 0.75))",
    blocks: [
      { id: "b101", name: "버건디석 111블록", category: "내야" },
      { id: "b102", name: "다크버건디석 105블록", category: "내야" },
      { id: "b103", name: "로얄다이아몬드클럽", category: "프리미엄" }
    ],
    amenities: {
      toilet: [
        { name: "내야 화장실 1", x: 45, y: 65 },
        { name: "외야 화장실 1", x: 50, y: 20 }
      ],
      snack: [
        { name: "고척 크림새우 맛집", x: 55, y: 70 }
      ],
      exit: [
        { name: "A 게이트", x: 50, y: 85 }
      ],
      medical: [
        { name: "돔 의무소", x: 50, y: 50 }
      ]
    }
  },
  {
    id: "suwon",
    name: "수원 KT 위즈파크",
    fullname: "수원 KT 위즈파크",
    team: "KT 위즈",
    location: "경기 수원시 장안구 경수대로 893",
    bg: "/assets/jamsil_stadium.jpg",
    gradient: "linear-gradient(135deg, rgba(24, 24, 27, 0.95), rgba(120, 53, 15, 0.75))",
    blocks: [
      { id: "b101", name: "응원지정석 109블록", category: "응원" },
      { id: "b102", name: "지니존 (백넷 뒤)", category: "프리미엄" }
    ],
    amenities: {
      toilet: [{ name: "지정석 복도 화장실", x: 60, y: 75 }],
      snack: [{ name: "진미통닭 위즈파크점", x: 65, y: 60 }],
      exit: [{ name: "주 게이트", x: 50, y: 80 }],
      medical: [{ name: "위즈 의무대", x: 40, y: 55 }]
    }
  },
  {
    id: "incheon",
    name: "인천 SSG 랜더스필드",
    fullname: "인천 SSG 랜더스필드",
    team: "SSG 랜더스",
    location: "인천 미추홀구 예술로 6",
    bg: "/assets/jamsil_stadium.jpg",
    gradient: "linear-gradient(135deg, rgba(153, 27, 27, 0.95), rgba(9, 9, 11, 0.75))",
    blocks: [
      { id: "b101", name: "의자지정석 1루 1블록", category: "내야" },
      { id: "b102", name: "홈런커플존", category: "외야" }
    ],
    amenities: {
      toilet: [{ name: "1루 복도 화장실", x: 70, y: 70 }],
      snack: [{ name: "스타벅스 랜더스필드점", x: 55, y: 40 }],
      exit: [{ name: "게이트 1", x: 50, y: 85 }],
      medical: [{ name: "랜더스 의무실", x: 45, y: 60 }]
    }
  },
  {
    id: "daegu",
    name: "대구 삼성 라이온즈 파크",
    fullname: "대구 삼성 라이온즈 파크",
    team: "삼성 라이온즈",
    location: "대구 수성구 야구전설로 1",
    bg: "/assets/jamsil_stadium.jpg",
    gradient: "linear-gradient(135deg, rgba(29, 78, 216, 0.95), rgba(15, 23, 42, 0.75))",
    blocks: [
      { id: "b101", name: "VIP석 1블록", category: "프리미엄" },
      { id: "b102", name: "블루존 (응원단상)", category: "응원" }
    ],
    amenities: {
      toilet: [{ name: "1루 복도 화장실", x: 65, y: 70 }],
      snack: [{ name: "대구 명물 납작만두", x: 60, y: 65 }],
      exit: [{ name: "메인 게이트", x: 50, y: 80 }],
      medical: [{ name: "라이온즈 의무실", x: 55, y: 55 }]
    }
  },
  {
    id: "gwangju",
    name: "광주 기아 챔피언스 필드",
    fullname: "광주 기아 챔피언스 필드",
    team: "KIA 타이거즈",
    location: "광주 북구 서림로 10",
    bg: "/assets/jamsil_stadium.jpg",
    gradient: "linear-gradient(135deg, rgba(185, 28, 28, 0.95), rgba(9, 9, 11, 0.75))",
    blocks: [
      { id: "b101", name: "챔피언석 (백넷 뒤)", category: "프리미엄" },
      { id: "b102", name: "3루 서프라이즈존", category: "내야" }
    ],
    amenities: {
      toilet: [{ name: "3루 지정석 화장실", x: 35, y: 70 }],
      snack: [{ name: "챔필 마왕족발/광주홈런볼", x: 40, y: 65 }],
      exit: [{ name: "중앙 출입구", x: 50, y: 80 }],
      medical: [{ name: "타이거즈 의무실", x: 45, y: 55 }]
    }
  },
  {
    id: "daejeon",
    name: "대전 한화생명 이글스파크",
    fullname: "대전 한화생명 이글스파크",
    team: "한화 이글스",
    location: "대전 중구 대종로 373",
    bg: "/assets/jamsil_stadium.jpg",
    gradient: "linear-gradient(135deg, rgba(234, 88, 12, 0.95), rgba(24, 24, 27, 0.75))",
    blocks: [
      { id: "b101", name: "1루 내야탁자석", category: "테이블" },
      { id: "b102", name: "1루 응원지정석", category: "응원" }
    ],
    amenities: {
      toilet: [{ name: "1루 출입구 쪽 화장실", x: 70, y: 75 }],
      snack: [{ name: "농심 가락국수 야구장점", x: 60, y: 70 }],
      exit: [{ name: "1루 매표소 방향 게이트", x: 50, y: 85 }],
      medical: [{ name: "이글스 의무대", x: 45, y: 60 }]
    }
  },
  {
    id: "busan",
    name: "부산 사직 야구장",
    fullname: "부산 사직 야구장",
    team: "롯데 자이언츠",
    location: "부산 동래구 사직로 45",
    bg: "/assets/jamsil_stadium.jpg",
    gradient: "linear-gradient(135deg, rgba(234, 88, 12, 0.95), rgba(3, 105, 161, 0.75))",
    blocks: [
      { id: "b101", name: "1루 내야필드석 11블록", category: "내야" },
      { id: "b102", name: "외야 자유석", category: "외야" }
    ],
    amenities: {
      toilet: [{ name: "1루 복도 화장실", x: 65, y: 70 }],
      snack: [{ name: "사직 운동장 자이언츠 만두", x: 70, y: 65 }],
      exit: [{ name: "중앙 게이트", x: 50, y: 80 }],
      medical: [{ name: "자이언츠 의무실", x: 50, y: 55 }]
    }
  },
  {
    id: "changwon",
    name: "창원 NC 파크",
    fullname: "창원 NC 파크",
    team: "NC 다이노스",
    location: "경남 창원시 마산회원구 삼호로 63",
    bg: "/assets/jamsil_stadium.jpg",
    gradient: "linear-gradient(135deg, rgba(3, 105, 161, 0.95), rgba(180, 83, 9, 0.75))",
    blocks: [
      { id: "b101", name: "1루 내야응원석 103블록", category: "응원" },
      { id: "b102", name: "프리미엄 테이블석", category: "프리미엄" }
    ],
    amenities: {
      toilet: [{ name: "1루 에스컬레이터 옆 화장실", x: 65, y: 70 }],
      snack: [{ name: "알통떡강정 파크점", x: 60, y: 65 }],
      exit: [{ name: "메인 진입 광장", x: 50, y: 85 }],
      medical: [{ name: "NC 의무실", x: 55, y: 60 }]
    }
  }
];

// Dynamically initialize all Jamsil blocks to match Ticketlink exactly
const jamsil = STADIUMS_DB.find(s => s.id === "jamsil");
if (jamsil) {
  jamsil.blocks = [
    { id: "b_prem", name: "프리미엄석 212블록", category: "프리미엄", grade: "premium" }
  ];
  
  const homeCols = [
    { inner: "111", innerGrade: "table", mid: "213", midGrade: "table", outer: "317", outerGrade: "navy" },
    { inner: "110", innerGrade: "table", mid: "212", midGrade: "table", outer: "316", outerGrade: "navy" },
    { inner: "109", innerGrade: "blue", mid: "211", midGrade: "blue", outer: "315", outerGrade: "navy" },
    { inner: "108", innerGrade: "blue", mid: "210", midGrade: "blue", outer: "314", outerGrade: "navy" },
    { inner: "107", innerGrade: "blue", mid: "209", midGrade: "blue", outer: "313", outerGrade: "navy" },
    { inner: "106", innerGrade: "red", mid: "208", midGrade: "orange", outer: "312", outerGrade: "navy" },
    { inner: "105", innerGrade: "red", mid: "207", midGrade: "orange", outer: "311", outerGrade: "navy" },
    { inner: "104", innerGrade: "red", mid: "206", midGrade: "orange", outer: "310", outerGrade: "navy" },
    { inner: "103", innerGrade: "red", mid: "205", midGrade: "orange", outer: "309", outerGrade: "navy" },
    { inner: "102", innerGrade: "red", mid: "204", midGrade: "red", outer: "308", outerGrade: "navy" },
    { inner: "101", innerGrade: "red", mid: "203", midGrade: "red", outer: "307", outerGrade: "navy" },
    { inner: null, innerGrade: null, mid: "202", midGrade: "red", outer: "306", outerGrade: "navy" },
    { inner: null, innerGrade: null, mid: "201", midGrade: "red", outer: "305", outerGrade: "navy" },
    { inner: null, innerGrade: null, mid: null, midGrade: null, outer: "304", outerGrade: "navy" },
    { inner: null, innerGrade: null, mid: null, midGrade: null, outer: "303", outerGrade: "navy" },
    { inner: null, innerGrade: null, mid: null, midGrade: null, outer: "302", outerGrade: "navy" },
    { inner: null, innerGrade: null, mid: null, midGrade: null, outer: "301", outerGrade: "navy" }
  ];

  const awayCols = [
    { inner: "112", innerGrade: "table", mid: "214", midGrade: "table", outer: "318", outerGrade: "navy" },
    { inner: "113", innerGrade: "table", mid: "215", midGrade: "table", outer: "319", outerGrade: "navy" },
    { inner: "114", innerGrade: "blue", mid: "216", midGrade: "blue", outer: "320", outerGrade: "navy" },
    { inner: "115", innerGrade: "blue", mid: "217", midGrade: "blue", outer: "321", outerGrade: "navy" },
    { inner: "116", innerGrade: "blue", mid: "218", midGrade: "blue", outer: "322", outerGrade: "navy" },
    { inner: "117", innerGrade: "red", mid: "219", midGrade: "orange", outer: "323", outerGrade: "navy" },
    { inner: "118", innerGrade: "red", mid: "220", midGrade: "orange", outer: "324", outerGrade: "navy" },
    { inner: "119", innerGrade: "red", mid: "221", midGrade: "orange", outer: "325", outerGrade: "navy" },
    { inner: "120", innerGrade: "red", mid: "222", midGrade: "orange", outer: "326", outerGrade: "navy" },
    { inner: "121", innerGrade: "red", mid: "223", midGrade: "red", outer: "327", outerGrade: "navy" },
    { inner: "122", innerGrade: "red", mid: "224", midGrade: "red", outer: "328", outerGrade: "navy" },
    { inner: null, innerGrade: null, mid: "225", midGrade: "red", outer: "329", outerGrade: "navy" },
    { inner: null, innerGrade: null, mid: "226", midGrade: "red", outer: "330", outerGrade: "navy" },
    { inner: null, innerGrade: null, mid: null, midGrade: null, outer: "331", outerGrade: "navy" },
    { inner: null, innerGrade: null, mid: null, midGrade: null, outer: "332", outerGrade: "navy" },
    { inner: null, innerGrade: null, mid: null, midGrade: null, outer: "333", outerGrade: "navy" },
    { inner: null, innerGrade: null, mid: null, midGrade: null, outer: "334", outerGrade: "navy" }
  ];

  const getKoreanName = (grade, num) => {
    const names = {
      premium: "프리미엄석",
      table: "테이블석",
      blue: "블루석",
      orange: "오렌지석(응원단상)",
      red: "레드석",
      navy: "네이비석",
      green: "외야 그린석"
    };
    return `${names[grade] || "지정석"} ${num}블록`;
  };

  homeCols.forEach(col => {
    if (col.inner) jamsil.blocks.push({ id: `b${col.inner}`, name: `1루 ${getKoreanName(col.innerGrade, col.inner)}`, category: "내야", grade: col.innerGrade });
    if (col.mid) jamsil.blocks.push({ id: `b${col.mid}`, name: `1루 ${getKoreanName(col.midGrade, col.mid)}`, category: "내야", grade: col.midGrade });
    if (col.outer) jamsil.blocks.push({ id: `b${col.outer}`, name: `1루 ${getKoreanName(col.outerGrade, col.outer)}`, category: "상층", grade: col.outerGrade });
  });

  awayCols.forEach(col => {
    if (col.inner) jamsil.blocks.push({ id: `b${col.inner}`, name: `3루 ${getKoreanName(col.innerGrade, col.inner)}`, category: "내야", grade: col.innerGrade });
    if (col.mid) jamsil.blocks.push({ id: `b${col.mid}`, name: `3루 ${getKoreanName(col.midGrade, col.mid)}`, category: "내야", grade: col.midGrade });
    if (col.outer) jamsil.blocks.push({ id: `b${col.outer}`, name: `3루 ${getKoreanName(col.outerGrade, col.outer)}`, category: "상층", grade: col.outerGrade });
  });

  for (let i = 0; i < 22; i++) {
    const num = 422 - i;
    const isOutfieldCheer = (num >= 405 && num <= 408);
    const blockName = isOutfieldCheer ? `외야 응원석 ${num}블록` : `외야 그린석 ${num}블록`;
    jamsil.blocks.push({ id: `b${num}`, name: blockName, category: "외야", grade: "green" });
  }
}

// Seat Views DB (Key: stadiumId_blockId_rowNum_seatNum)
const SEAT_VIEWS_DB = {
  "jamsil_b103_1_1": {
    stadiumName: "잠실 야구장",
    blockName: "1루 오렌지석 103블록",
    seatName: "1열 1번",
    image: "/assets/seat_view_clean.png",
    uploader: "@twins_victory",
    uploaderBadge: "골드 등록자",
    upvotes: 34,
    downvotes: 0,
    userVoted: null,
    tags: ["🔥 응원단상 코앞", "✅ 열정 응원존", "✅ 통로석"],
    comment: "오렌지석 103블록 맨 앞자리! 치어리더 분들과 거의 하이파이브 할 수 있을 정도로 가깝습니다. 응원단 앰프 바로 옆이라 흥이 배가 되며, 통로와 맞닿아 있어 드나들기 최고입니다."
  },
  "jamsil_b103_1_7": {
    stadiumName: "잠실 야구장",
    blockName: "1루 오렌지석 103블록",
    seatName: "1열 7번",
    image: "/assets/seat_view_clean.png",
    uploader: "@stadium_goer",
    uploaderBadge: "VIP 등록자",
    upvotes: 56,
    downvotes: 2,
    userVoted: null,
    tags: ["✅ 시야 대만족", "🔥 열광의 오렌지", "✅ 홈플레이트 잘보임"],
    comment: "1열 7번 중앙자리입니다! 투수 마운드와 홈플레이트가 막힘 없이 한눈에 조망되고 단상과도 가까워서 경기 몰입도와 응원 열기 두 가지 모두를 챙길 수 있는 잠실야구장 최고의 꿀자리입니다."
  },
  "jamsil_b103_1_14": {
    stadiumName: "잠실 야구장",
    blockName: "1루 오렌지석 103블록",
    seatName: "1열 14번",
    image: "/assets/seat_view_clean.png",
    uploader: "@lotte_no_lg",
    uploaderBadge: "일반 등록자",
    upvotes: 12,
    downvotes: 1,
    userVoted: null,
    tags: ["✅ 경기장 전경 한눈에", "🔥 서서 응원 필수"],
    comment: "103블록 맨 우측 라인 1열입니다. 우측 익사이팅석 방면까지 탁 트인 시야를 볼 수 있어 답답함이 없습니다. 응원단상 열기를 느끼고 싶으시다면 강추합니다."
  },
  "jamsil_b103_10_95": {
    stadiumName: "잠실 야구장",
    blockName: "1루 오렌지석 103블록",
    seatName: "10열 95번",
    image: "/assets/seat_view_blocked.png",
    uploader: "@silent_fan",
    uploaderBadge: "실버 등록자",
    upvotes: 8,
    downvotes: 15,
    userVoted: null,
    tags: ["⚠️ 응원봉 시야 방해", "☀️ 강한 오후 햇빛"],
    comment: "단차는 나쁘지 않으나 서서 응원하시는 분들이 많을 때 응원도구나 깃발 등에 홈플레이트 부근이 일부 가릴 수 있습니다. 오후 경기 때 햇빛이 정면으로 드는 점 참고해 주세요."
  },
  // Jamsil Block 101, Row 3, Seat 4
  "jamsil_b101_3_4": {
    stadiumName: "잠실 야구장",
    blockName: "1루 레드석 101블록",
    seatName: "3열 4번",
    image: "/assets/seat_view_clean.png",
    uploader: "@baseball_lover",
    uploaderBadge: "골드 등록자",
    upvotes: 28,
    downvotes: 1,
    userVoted: null,
    tags: ["✅ 시야 완전 클린", "✅ 응원단상 잘보임", "✅ 매점 가깝고 통로"],
    comment: "단차도 괜찮고 앞사람 머리에 홈플레이트가 거의 가리지 않습니다. 응원단상도 가깝고 통로석이라 화장실 이동하기도 엄청 편해요!"
  },
  // Jamsil Block 102, Row 4, Seat 2
  "jamsil_b102_4_2": {
    stadiumName: "잠실 야구장",
    blockName: "1루 레드석 102블록",
    seatName: "4열 2번",
    image: "/assets/seat_view_blocked.png",
    uploader: "@twins_victory",
    uploaderBadge: "일반 등록자",
    upvotes: 3,
    downvotes: 12,
    userVoted: null,
    tags: ["⚠️ 안전난간 가림", "🔊 앰프 소리 큼", "☀️ 낮 경기 강한 햇빛"],
    comment: "아쉽게도 눈높이에 안전 철제 난간이 정확히 겹칩니다. 경기 볼 때 몸을 약간 앞으로 숙이거나 뒤로 제껴야 투수 마운드가 보여서 피로감이 좀 있습니다. 앰프 바로 아래라 소리도 엄청 큽니다."
  },
  // Jamsil Block 103, Row 2, Seat 5
  "jamsil_b103_2_5": {
    stadiumName: "잠실 야구장",
    blockName: "1루 오렌지석 103블록",
    seatName: "2열 5번",
    image: "/assets/seat_view_clean.png",
    uploader: "@cheer_king",
    uploaderBadge: "VIP 등록자",
    upvotes: 45,
    downvotes: 4,
    userVoted: null,
    tags: ["✅ 응원단상 바로앞", "🔥 서서 관람 구역", "✅ 시야 좋음"],
    comment: "여긴 경기 보러 오는 게 아니라 응원하러 오는 자리입니다! 치어리더님들 1미터 앞에서 춤추시고 경기 내내 서있어야 해요. 체력 준비 필수!"
  },
  // Gocheok burgundy block 101 Row 2 Seat 6
  "gocheok_b101_2_6": {
    stadiumName: "고척 스카이돔",
    blockName: "버건디석 111블록",
    seatName: "2열 6번",
    image: "/assets/seat_view_clean.png",
    uploader: "@dome_fan",
    uploaderBadge: "골드 등록자",
    upvotes: 15,
    downvotes: 0,
    userVoted: null,
    tags: ["✅ 냉난방 쾌적", "✅ 시야 좋음"],
    comment: "고척돔 버건디 시야 완전 끝내줍니다! 한여름에도 땀 한 방울 안 흘리고 시원하게 야구 관람 가능한 에어컨 직빵 자리."
  }
};

// Initial User Ticketbook Data (stored in localStorage if missing)
const DEFAULT_TICKETS = [
  {
    id: "t1",
    stadiumId: "jamsil",
    stadiumName: "잠실 야구장",
    blockName: "1루 레드석 101블록",
    seatName: "3열 4번",
    matchDate: "2026-06-12",
    result: "승리",
    score: "LG 8 - 2 Doosan",
    comment: "승요 등극! 내가 가는 날엔 100% 이긴다. 시야도 시원시원하고 좋았음.",
    image: "/assets/seat_view_clean.png"
  },
  {
    id: "t2",
    stadiumId: "jamsil",
    stadiumName: "잠실 야구장",
    blockName: "1루 레드석 102블록",
    seatName: "4열 2번",
    matchDate: "2026-07-02",
    result: "패배",
    score: "LG 1 - 4 SSG",
    comment: "난간 때문에 시야가 너무 안 좋았고 경기도 패배해서 아쉬웠던 직관.",
    image: "/assets/seat_view_blocked.png"
  },
  {
    id: "t3",
    stadiumId: "suwon",
    stadiumName: "수원 KT 위즈파크",
    blockName: "응원지정석 109블록",
    seatName: "12열 3번",
    matchDate: "2026-07-15",
    result: "승리",
    score: "KT 6 - 5 KIA",
    comment: "9회말 역전 끝내기 홈런! 진미통닭도 짱맛있었다.",
    image: "/assets/seat_view_clean.png"
  }
];

// --- 2. Application State ---
const state = {
  currentView: "main",
  // App-internal back stack for the header's back arrow. Doesn't rely on
  // window.history — after an OAuth redirect (Kakao login), the browser's
  // real history stack has extra cross-origin entries mixed in, so
  // history.back() can land somewhere unexpected instead of the screen the
  // user actually came from within the app.
  viewHistory: [],
  // Per-venue back stack of floor tabs visited, for handleHeaderBack() —
  // reset each time a venue is opened (see loadVenueDetail).
  venueFloorHistory: [],
  selectedStadium: null,
  selectedBlock: null,
  selectedGradeFilter: "all", // Seat grade filter state (all, premium, table, etc.)
  activeAmenities: {
    toilet: false,
    snack: false,
    exit: false,
    medical: false
  },
  activeDetailTab: "map",
  comparisons: [], // Array of seat info objects to compare
  tickets: [],     // User tickets array
  currentUploadedPhotoBase64: null,
  activeModalSeatKey: null,
  isLoggedIn: false, // Login simulation state
  userNickname: "@직관러_홍길동",
};

// --- 3. App Controller ---
class SeatViewApp {
  constructor() {
    this.init();
  }

  init() {
    // Clock update
    this.updateClock();
    setInterval(() => this.updateClock(), 60000);

    // Initialize LocalStorage for Ticketbook
    if (!localStorage.getItem("seatview_tickets")) {
      localStorage.setItem("seatview_tickets", JSON.stringify(DEFAULT_TICKETS));
    }
    state.tickets = JSON.parse(localStorage.getItem("seatview_tickets"));

    // Initialize Comparisons from LocalStorage (session-style: expires after inactivity)
    state.comparisons = this.loadComparisons();
    this.rehydrateComparisons(); // fire-and-forget: fills in real photos once loaded

    // Populate Dynamic DOM Elements
    this.renderStadiumList();
    this.loadStadiums().then(() => {
      this.renderStadiumList();
      this.checkUserSession();
    });
    this.loadVenues().then(() => {
      this.renderVenueList();
      // Deep-link support for shareVenue()'s links (?venue=<id>), and for
      // the /venue/:id URLs the venue-page Netlify function serves for
      // search engines (see netlify/functions/venue-page.js) — jump
      // straight into that venue once the list it needs is loaded.
      const pathVenueId = (window.location.pathname.match(/^\/venue\/(\d+)/) || [])[1];
      const sharedVenueId = new URLSearchParams(window.location.search).get("venue") || pathVenueId;
      if (sharedVenueId) {
        this.loadVenueDetail(sharedVenueId);
        // The /venue/:id page pre-renders a plain-text summary for
        // crawlers (id="ssr-seo-content") — once the real interactive
        // view is up, drop it so a real visitor doesn't see the same
        // venue info twice.
        const ssrContent = document.getElementById("ssr-seo-content");
        if (ssrContent) ssrContent.remove();
      }

      // Deep-link for the seat-page Netlify function's /seat/:id URLs (see
      // netlify/functions/seat-page.js) — walk seat -> block -> venue so we
      // know which venue/floor to land on, then pop the seat's own detail
      // sheet on top exactly like a real user tapping that seat would.
      // openSeatDetail() resolves its own display info from dbKey alone, so
      // it doesn't need to wait for the floor grid to actually finish
      // rendering first.
      const pathSeatId = (window.location.pathname.match(/^\/seat\/(\d+)/) || [])[1];
      if (pathSeatId && supabaseClient) {
        (async () => {
          try {
            const { data: seatRow } = await supabaseClient.from("musical_seats").select("block_id").eq("id", pathSeatId).single();
            if (!seatRow) return;
            const { data: blockRow } = await supabaseClient.from("musical_blocks").select("venue_id, floor").eq("id", seatRow.block_id).single();
            if (!blockRow) return;
            await this.loadVenueDetail(blockRow.venue_id);
            this.selectVenueFloor(blockRow.floor);
            await this.openSeatDetail(pathSeatId, { category: "musical" });
            const ssrContent = document.getElementById("ssr-seo-content");
            if (ssrContent) ssrContent.remove();
          } catch (e) {
            console.warn("Seat deep-link failed:", e);
          }
        })();
      }
    });
    this.loadShoppingAds().then(() => {
      this.renderStadiumList();
      this.renderVenueList();
    });
    this.loadCategories();
    this.updateCompareBadge();

    // The one-shot checkUserSession() above can race the OAuth redirect's
    // async session write (worse inside slower in-app browsers like
    // KakaoTalk's), leaving state.isLoggedIn stuck false even though the
    // session eventually does land. Subscribing here catches that moment
    // (and any later sign-in/refresh/sign-out) reliably instead of relying
    // on a single point-in-time check.
    if (supabaseClient) {
      supabaseClient.auth.onAuthStateChange(() => {
        this.checkUserSession();
      });
    }

    // Setup Event Listeners
    this.setupListeners();

    // Show the event popup after setupListeners() has established the base
    // history.state (so this modal's pushState lands on top of it, not before).
    // Delayed slightly (rather than showing instantly on init) so a search
    // crawler's rendered-page snapshot is more likely to land on the real
    // homepage content underneath, not this promo overlay — it was showing
    // up as the page's search-result description otherwise.
    setTimeout(() => this.maybeShowEventPopup(), 1500);

    // Initialize profile values from localStorage
    const savedStadium = localStorage.getItem("seatview_favorite_stadium") || null;
    const savedTeam = localStorage.getItem("seatview_cheering_team") || null;
    const savedNickname = localStorage.getItem("seatview_nickname") || "@\uC57C\uAD6C\uB7EC\uBC84";
    state.favoriteStadiumId = savedStadium;
    state.cheeringTeam = savedTeam;
    state.userNickname = savedNickname;

    const profileStadiumEl = document.getElementById("my-profile-stadium");
    const profileTeamEl = document.getElementById("my-profile-team");
    const profileNicknameEl = document.getElementById("my-profile-nickname");
    const favStadiumObj = STADIUMS_DB.find(s => s.id === savedStadium);
    if (profileStadiumEl) profileStadiumEl.textContent = favStadiumObj ? favStadiumObj.name : "\uBBF8\uC124\uC815";
    if (profileTeamEl) profileTeamEl.textContent = savedTeam || "\uBBF8\uC124\uC815";
    if (profileNicknameEl) profileNicknameEl.textContent = savedNickname;

    // Initialize Theme
    const savedTheme = localStorage.getItem("seatview_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);

    // Update menu elements immediately based on theme
    const themeIcon = document.getElementById("theme-icon");
    const themeText = document.getElementById("theme-text");
    if (themeIcon && themeText) {
      if (savedTheme === "light") {
        themeIcon.setAttribute("data-lucide", "moon");
        themeText.textContent = "\uB2E4\uD06C \uBAA8\uB4DC\uB85C \uC804\uD658";
      } else {
        themeIcon.setAttribute("data-lucide", "sun");
        themeText.textContent = "\uB77C\uC774\uD2B8 \uBAA8\uB4DC\uB85C \uC804\uD658";
      }
    }

    // Trigger Initial Layout setup
    lucide.createIcons();
  }

  async loadCategories() {
    const container = document.getElementById("category-grid-container");
    if (!container) return;

    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('categories')
          .select('*')
          // Explicit display_order wins; anything without one falls back to
          // name (ㄱㄴㄷ/alphabetical) instead of arbitrary DB order.
          .order('display_order', { ascending: true, nullsFirst: false })
          .order('name', { ascending: true });

        if (!error && data && data.length > 0) {
          container.innerHTML = "";
          data.forEach(cat => {
            const card = document.createElement("div");
            // Determine CSS background image based on category ID
            let bgImage = "/assets/jamsil_stadium.jpg";
            if (cat.id === "musical") bgImage = "/assets/musical_stage.jpg";
            else if (cat.id === "plane") bgImage = "/assets/flight_cinema.jpg";

            // Click behavior is driven purely by badge_text: "TO BE" shows the
            // coming-soon popup, everything else navigates to its real screen.
            // Visual style stays the same as a normal card either way.
            card.className = "category-card";
            const isComingSoon = cat.badge_text === "TO BE";

            if (isComingSoon) {
              card.onclick = () => this.showCategoryComingSoon(cat.name);
            } else if (cat.id === "baseball") {
              card.onclick = () => this.navigateTo('stadiums');
            } else if (cat.id === "musical") {
              card.onclick = () => this.navigateTo('venues');
            } else {
              // No real screen built for this category yet either; fall back to
              // the same coming-soon popup instead of leaving the card dead.
              card.onclick = () => this.showCategoryComingSoon(cat.name);
            }

            // Badge HTML
            let badgeHtml = "";
            if (cat.badge_text) {
              const badgeColor = this.escapeHtml(cat.badge_color || "blue");
              badgeHtml = `<div class="category-tag ${badgeColor}">${this.escapeHtml(cat.badge_text)}</div>`;
            }

            card.innerHTML = `
              <div class="card-bg-overlay" style="background-image: url('${this.escapeHtml(bgImage)}');"></div>
              ${badgeHtml}
              <div class="category-info">
                <h3 class="category-name">${this.escapeHtml(cat.icon || '')} ${this.escapeHtml(cat.name)}</h3>
                <p class="category-sub">${this.escapeHtml(cat.subtitle || '')}</p>
              </div>
            `;
            container.appendChild(card);
          });
          return;
        }
      } catch (e) {
        console.error("Supabase 카테고리 로드 오류, 하드코딩 대체 작동:", e);
      }
    }

    // Fallback: render hardcoded items if Supabase is not ready or keys are placeholders
    container.innerHTML = `
      <div class="category-card" onclick="app.navigateTo('stadiums')">
        <div class="card-bg-overlay" style="background-image: url('/assets/jamsil_stadium.jpg');"></div>
        <div class="category-tag blue">MAX TRAFFIC</div>
        <div class="category-info">
          <h3 class="category-name">⚾ 프로야구장</h3>
          <p class="category-sub">10개 구단 홈구장</p>
        </div>
      </div>
      <div class="category-card" onclick="app.showMusicalComingSoon()">
        <div class="card-bg-overlay" style="background-image: url('/assets/musical_stage.jpg');"></div>
        <div class="category-tag red">HOT</div>
        <div class="category-info">
          <h3 class="category-name">🎭 뮤지컬 / 공연장</h3>
          <p class="category-sub">주요 대형 아트센터</p>
        </div>
      </div>
      <div class="category-card" onclick="app.showFlightComingSoon()">
        <div class="card-bg-overlay" style="background-image: url('/assets/flight_cinema.jpg');"></div>
        <div class="category-tag green">NEW</div>
        <div class="category-info">
          <h3 class="category-name">✈️ 항공 / 영화관</h3>
          <p class="category-sub">스페셜관 & 인기 기종</p>
        </div>
      </div>
    `;
  }

  async loadStadiums() {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('stadiums')
          .select('*')
          .order('display_order', { ascending: true, nullsFirst: false })
          .order('name', { ascending: true });

        if (!error && data && data.length > 0) {
          STADIUMS_DB = []; // Reset STADIUMS_DB to strictly use DB values
          
          const idMap = {
            1: "jamsil",
            2: "gocheok",
            3: "incheon",
            4: "suwon",
            5: "daejeon",
            6: "daegu",
            7: "gwangju",
            8: "changwon",
            9: "busan"
          };

          const amenitiesFallback = {
            jamsil: {
              toilet: [
                { name: "1루 화장실", x: 70, y: 71 },
                { name: "3루 화장실", x: 30, y: 71 },
                { name: "외야 중앙 화장실", x: 50, y: 13 }
              ],
              snack: [
                { name: "삼겹살 광장 매점", x: 79, y: 66 },
                { name: "원조 김말이 떡볶이", x: 61, y: 73.5 },
                { name: "3루 백미당/스테프핫도그", x: 21, y: 66 }
              ],
              exit: [
                { name: "1루 내야 출입구", x: 87, y: 82 },
                { name: "3루 내야 출입구", x: 13, y: 82 },
                { name: "외야 매표소 게이트", x: 50, y: 5 }
              ],
              medical: [
                { name: "의무실 (1루 복도 안쪽)", x: 63, y: 55 }
              ]
            },
            gocheok: {
              toilet: [
                { name: "내야 화장실 1", x: 45, y: 65 },
                { name: "외야 화장실 1", x: 50, y: 20 }
              ],
              snack: [
                { name: "고척 크림새우 맛집", x: 55, y: 70 }
              ],
              exit: [
                { name: "A 게이트", x: 50, y: 85 }
              ],
              medical: [
                { name: "돔 의무소", x: 50, y: 50 }
              ]
            },
            suwon: {
              toilet: [{ name: "지정석 복도 화장실", x: 60, y: 75 }],
              snack: [{ name: "진미통닭 위즈파크점", x: 65, y: 60 }],
              exit: [{ name: "주 게이트", x: 50, y: 80 }],
              medical: [{ name: "위즈 의무대", x: 40, y: 55 }]
            },
            incheon: {
              toilet: [{ name: "1루 복도 화장실", x: 70, y: 70 }],
              snack: [{ name: "스타벅스 랜더스필드점", x: 55, y: 40 }],
              exit: [{ name: "게이트 1", x: 50, y: 85 }],
              medical: [{ name: "랜더스 의무실", x: 45, y: 60 }]
            },
            busan: {
              toilet: [{ name: "1루 복도 화장실", x: 65, y: 70 }],
              snack: [{ name: "사직 운동장 자이언츠 만두", x: 70, y: 65 }],
              exit: [{ name: "중앙 게이트", x: 50, y: 80 }],
              medical: [{ name: "자이언츠 의무실", x: 50, y: 55 }]
            },
            changwon: {
              toilet: [{ name: "1루 에스컬레이터 옆 화장실", x: 65, y: 70 }],
              snack: [{ name: "알통떡강정 파크점", x: 60, y: 65 }],
              exit: [{ name: "메인 진입 광장", x: 50, y: 85 }],
              medical: [{ name: "NC 의무실", x: 55, y: 60 }]
            }
          };

          data.forEach(dbStadium => {
            const mappedId = idMap[dbStadium.id] || dbStadium.id;
            const secColor = dbStadium.secondary_color || '#1e293b';
            const newStadium = {
              id: mappedId,
              db_id: dbStadium.id,
              display_order: dbStadium.display_order,
              name: dbStadium.name,
              fullname: dbStadium.name,
              team: dbStadium.home_teams ? dbStadium.home_teams.join(" / ") : "",
              location: dbStadium.address || dbStadium.location_district,
              bg: dbStadium.bg_image_url || "/assets/jamsil_stadium.jpg",
              map_image_url: dbStadium.map_image_url,
              gradient: dbStadium.primary_color ? `linear-gradient(135deg, ${dbStadium.primary_color}DD, ${secColor}B0)` : "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.75))",
              blocks: [],
              amenities: amenitiesFallback[mappedId] || { toilet: [], snack: [], exit: [], medical: [] },
              food_info: dbStadium.food_info,
              parking_info: dbStadium.parking_info,
              sunlight_info: dbStadium.sunlight_info,
              status: dbStadium.status || 'open'
            };
            STADIUMS_DB.push(newStadium);
          });
          console.log("Dynamically loaded stadiums from database:", STADIUMS_DB);
          return;
        }
      } catch (e) {
        console.error("Supabase 야구장 로딩 에러, 임시 데이터 대체 작동:", e);
      }
    }
    // Fallback if Supabase is offline or failed
    STADIUMS_DB = JSON.parse(JSON.stringify(MOCK_STADIUMS_DB));
  }

  updateClock() {
    const clockEl = document.getElementById("current-time");
    if (clockEl) {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      hours = hours < 10 ? '0' + hours : hours;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      clockEl.textContent = `${hours}:${minutes}`;
    }
  }

  setupListeners() {
    // "맨 위로" 플로팅 버튼 — 실제 스크롤 컨테이너가 화면 폭에 따라 둘 중
    // 하나로 갈린다(style_v6.css의 481px 미만 미디어쿼리 참고): 좁은 화면
    // (실제 모바일)에서는 body/문서 자체가 스크롤되고, 넓은 화면(데스크톱
    // 미리보기 박스)에서는 .app-content가 내부 스크롤을 담당한다. 둘 다
    // 리스너를 걸어두면 현재 활성 스크롤러가 뭐든 안전하게 잡힌다.
    const scrollTopBtn = document.getElementById("btn-scroll-top");
    if (scrollTopBtn) {
      const SHOW_AFTER_PX = 400;
      const updateScrollTopBtn = () => {
        const scrolled = window.scrollY || document.getElementById("app-content")?.scrollTop || 0;
        scrollTopBtn.classList.toggle("visible", scrolled > SHOW_AFTER_PX);
      };
      window.addEventListener("scroll", updateScrollTopBtn, { passive: true });
      document.getElementById("app-content")?.addEventListener("scroll", updateScrollTopBtn, { passive: true });
      updateScrollTopBtn();
    }

    // Deter casual right-click-save / drag-save of seat-view photos (not a
    // real security control — DevTools/view-source always gets around this —
    // just raises the bar above a single right-click for most users.
    document.addEventListener("contextmenu", (e) => {
      if (e.target.tagName === "IMG") {
        e.preventDefault();
        this.showToast("🚫", "무단 캡처 및 재배포는 금지되어 있습니다.");
      }
    });
    document.addEventListener("dragstart", (e) => {
      if (e.target.tagName === "IMG") {
        e.preventDefault();
        this.showToast("🚫", "무단 캡처 및 재배포는 금지되어 있습니다.");
      }
    });

    // Quick handle search box typing — one search bar per category list
    // screen now (each one only ever needs to search its own category).
    const stadiumSearchInput = document.getElementById("stadium-search-input");
    if (stadiumSearchInput) {
      stadiumSearchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && stadiumSearchInput.value.trim() !== "") {
          const query = stadiumSearchInput.value.trim();
          stadiumSearchInput.value = "";
          this.handleStadiumSearch(query);
        }
      });
    }
    // Live filter, not a submit-and-navigate search — floor tabs already
    // show every zone at once now, so there's no "구역" or "좌석" left to
    // deep-link into. Typing just narrows the visible venue list by name.
    const venueSearchInput = document.getElementById("venue-search-input");
    if (venueSearchInput) {
      venueSearchInput.addEventListener("input", () => {
        this.renderVenueList(venueSearchInput.value);
      });
    }

    const ocrPickerSearchInput = document.getElementById("ocr-picker-venue-search");
    if (ocrPickerSearchInput) {
      ocrPickerSearchInput.addEventListener("input", () => {
        this.renderOcrPickerVenueList(ocrPickerSearchInput.value);
      });
    }

    // Set up click-and-drag horizontal scroll for the grade filter bar
    this.setupDragScroll("grade-filter-bar");

    // Swipe support for the seat-detail and compare image carousels, so
    // they work with a touch swipe (not just the < > buttons).
    this.setupImageSwipeGestures();

    // History API Router integration
    if (!history.state) {
      history.replaceState({ view: "main" }, "", "#main");
    }

    window.addEventListener("popstate", (e) => {
      // 1. Close modals first if any are active (Requirement 15)
      const activeModals = document.querySelectorAll(".modal.active");
      if (activeModals.length > 0) {
        const lastModal = activeModals[activeModals.length - 1];
        this.closeModal(lastModal.id, true);
        // A modal opened with pushHistory=false (see openModal) never had
        // its own back-stop, so this popstate is really about whatever's
        // underneath it — fall through instead of eating the back-press.
        // Modals that DO own an entry still stop here as before.
        if (lastModal.dataset.ownsHistory !== "false") return;
      }

      // 2. Otherwise, navigate views (or restore a venue floor tab)
      const stateObj = e.state;
      if (stateObj && typeof stateObj.venueFloor !== "undefined") {
        this.selectVenueFloor(stateObj.venueFloor, { pushHistory: false });
        return;
      }
      if (stateObj && stateObj.view) {
        this.navigateTo(stateObj.view, false);
      }
    });
  }

  // Splits a query into whitespace tokens and finds the longest leading
  // run of tokens that names a stadium/venue, so the rest can be parsed as
  // qualifiers (grade/floor, zone, seat). Tries longest prefix first so
  // "세종문화회관 대극장 1층 A" matches the full name, not just "세종".
  // A prefix only counts as a name match if it's an actual substring of
  // the real name, or an exact prefix of it — a loose "contains the first
  // 2 chars" check would let "잠실 101" wrongly swallow "101" as if it
  // were part of the name.
  matchNameAndTokens(query, db) {
    const tokens = query.trim().split(/\s+/).filter(Boolean);
    for (let i = tokens.length; i >= 1; i--) {
      const candidate = tokens.slice(0, i).join(" ");
      const target = db.find(item =>
        item.name.includes(candidate) ||
        (candidate.length >= 2 && item.name.slice(0, candidate.length) === candidate)
      );
      if (target) return { target, remainder: tokens.slice(i) };
    }
    return { target: null, remainder: tokens };
  }

  // Looks up one seat's real DB id by block + row + seat number, for the
  // deepest search level ("구장 등급 구역 좌석"). Row/seat are compared as
  // strings since some stadiums use letter row labels (e.g. Gocheok).
  async findSeatId(table, blockIdColumn, blockId, rowVal, seatVal) {
    if (!supabaseClient) return null;
    try {
      const { data: seats } = await supabaseClient
        .from(table)
        .select('id, row_num, seat_num')
        .eq(blockIdColumn, blockId);
      const match = (seats || []).find(s => String(s.row_num) === rowVal && String(s.seat_num) === seatVal);
      return match ? match.id : null;
    } catch (e) {
      console.warn(`Seat lookup error (${table}):`, e);
      return null;
    }
  }

  // Supports "야구장", "야구장 등급", "야구장 등급 구역", "야구장 구역"
  // (등급 생략 가능 — 구역코드는 구장 내에서 겹치지 않아 그 자체로 유일),
  // "야구장 등급 구역 N열 M번". 등급 텍스트는 구역이 있으면 무시된다 —
  // selectStadiumBlock()이 구역에서 등급을 자동으로 다시 채워주기 때문.
  async handleStadiumSearch(query) {
    const { target: stadium, remainder } = this.matchNameAndTokens(query, STADIUMS_DB);
    if (!stadium) {
      this.showToast("🔍", `'${query}' 검색 결과를 찾지 못했어요. "야구장명 [좌석등급] [구역] [좌석]" 형식으로 입력해 보세요. (예: 고척 111, 고척 111 5열 3번)`);
      return;
    }

    await this.loadStadiumDetail(stadium.id);
    const blocks = (state.selectedStadium && state.selectedStadium.blocks) || [];

    let tokens = [...remainder];
    let rowVal = null, seatVal = null;
    if (tokens.length >= 2 && /^.+열$/.test(tokens[tokens.length - 2]) && /^\d+번$/.test(tokens[tokens.length - 1])) {
      seatVal = tokens[tokens.length - 1].replace(/번$/, "");
      rowVal = tokens[tokens.length - 2].replace(/열$/, "");
      tokens = tokens.slice(0, -2);
    }

    let zoneCode = null;
    if (tokens.length > 0) {
      const lastTok = tokens[tokens.length - 1];
      const lastTokBare = lastTok.replace(/구역$/, "");
      const matched = blocks.find(b => String(b.block_code).toUpperCase() === lastTok.toUpperCase())
        || blocks.find(b => String(b.block_code).toUpperCase() === lastTokBare.toUpperCase());
      if (matched) {
        zoneCode = matched.block_code;
        tokens = tokens.slice(0, -1);
      }
    }

    if (!zoneCode) {
      const gradeText = tokens.join(" ").trim();
      if (!gradeText) {
        this.showToast("✅", `${stadium.name}으로 이동했어요.`);
        return;
      }
      const categories = [...new Set(blocks.map(b => b.category).filter(Boolean))];
      // Exact match must win before substring fuzziness — otherwise a
      // shorter category that happens to be a substring of the real match
      // (e.g. "버건디석" inside "다크버건디석") gets picked first just
      // because it appears earlier in the list. Whitespace is normalized
      // away at every tier too, since category names like "4층 지정석"
      // are commonly typed without the internal space ("4층지정석").
      const norm = s => s.replace(/\s+/g, "");
      const normGradeText = norm(gradeText);
      const matchedGrade = categories.find(c => c === gradeText)
        || categories.find(c => norm(c) === normGradeText)
        || categories.find(c => norm(c).includes(normGradeText) || normGradeText.includes(norm(c)));
      if (!matchedGrade) {
        this.showToast("🔍", `${stadium.name}에서 '${gradeText}' 좌석등급을 찾지 못했어요.`);
        return;
      }
      this.filterMapByGrade(matchedGrade);
      this.showToast("✅", `${stadium.name} ${matchedGrade}로 이동했어요.`);
      return;
    }

    const targetBlock = blocks.find(b => String(b.block_code).toUpperCase() === zoneCode.toUpperCase());
    this.selectStadiumBlock(targetBlock.id);

    if (rowVal !== null && seatVal !== null) {
      const seatId = targetBlock.db_id ? await this.findSeatId('baseball_seats', 'block_id', targetBlock.db_id, rowVal, seatVal) : null;
      if (seatId) {
        this.openSeatDetail(seatId, { category: "baseball" });
        this.showToast("✅", `${stadium.name} ${zoneCode}구역 ${rowVal}열 ${seatVal}번으로 이동했어요.`);
      } else {
        this.showToast("🔍", `${zoneCode}구역에서 ${rowVal}열 ${seatVal}번 좌석을 찾지 못했어요.`);
      }
      return;
    }

    this.showToast("✅", `${stadium.name} ${zoneCode}구역으로 이동했어요.`);
  }


  setupDragScroll(elementId) {
    const slider = document.getElementById(elementId);
    if (!slider) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    slider.style.cursor = "grab";

    slider.addEventListener("mousedown", (e) => {
      isDown = true;
      slider.style.cursor = "grabbing";
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener("mouseleave", () => {
      isDown = false;
      slider.style.cursor = "grab";
    });

    slider.addEventListener("mouseup", () => {
      isDown = false;
      slider.style.cursor = "grab";
    });

    slider.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 1.8; // scroll speed multiplier
      slider.scrollLeft = scrollLeft - walk;
    });
  }

  // Swipe-to-navigate for the seat-detail modal carousel and the compare
  // screen's image boxes — event-delegated on document since the compare
  // boxes are re-created on every render. Pointer events cover touch, mouse,
  // and pen in one code path so there's no double-handling on hybrid devices.
  setupImageSwipeGestures() {
    let startX = 0;
    let startY = 0;
    let tracking = false;
    let target = null; // 'modal' | 'compare'
    let compareKey = null;
    const SWIPE_THRESHOLD = 40;

    document.addEventListener("pointerdown", (e) => {
      const modalBox = e.target.closest(".modal-image-wrapper");
      const compareBox = e.target.closest(".compare-image-box");
      if (!modalBox && !compareBox) return;
      tracking = true;
      startX = e.clientX;
      startY = e.clientY;
      target = modalBox ? "modal" : "compare";
      compareKey = compareBox ? compareBox.dataset.key : null;
    });

    document.addEventListener("pointerup", (e) => {
      if (!tracking) return;
      tracking = false;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      // Ignore taps and mostly-vertical drags (those are page scrolling)
      if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;

      if (target === "modal") {
        dx < 0 ? this.nextSeatImage() : this.prevSeatImage();
      } else if (target === "compare" && compareKey) {
        this.navCompareImage(compareKey, dx < 0 ? 1 : -1);
      }
    });
  }

  // --- Router ---
  navigateTo(viewId, pushHistory = true) {
    const previousView = state.currentView;

    // A list screen's search box only makes sense to keep filled when the
    // user is returning to it from the detail screen they drilled into
    // (e.g. back-button from venue-detail to venues) — landing on it fresh
    // from anywhere else (home category card, mypage's empty-state link)
    // should start clean, or a leftover filter from an earlier visit just
    // looks like the list is missing items with no obvious explanation.
    if (viewId === "venues" && previousView !== "venue-detail") {
      const input = document.getElementById("venue-search-input");
      if (input) input.value = "";
    } else if (viewId === "stadiums" && previousView !== "stadium-detail") {
      const input = document.getElementById("stadium-search-input");
      if (input) input.value = "";
    }

    // Track the app-internal back stack for handleHeaderBack() — only for
    // genuine forward navigations (pushHistory=true means "the app decided
    // to go here", as opposed to popstate replaying a browser history entry).
    if (pushHistory && state.currentView && state.currentView !== viewId) {
      state.viewHistory.push(state.currentView);
    }

    if (pushHistory) {
      if (!history.state || history.state.view !== viewId) {
        history.pushState({ view: viewId }, "", "#" + viewId);
      }
    }

    // Hide all views
    document.querySelectorAll(".view").forEach(view => {
      view.classList.remove("active");
    });

    // Show targeted view
    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) {
      targetView.classList.add("active");
      state.currentView = viewId;
      // One shared <footer> element, physically moved to the bottom of
      // whichever view is now active (appendChild moves an existing node
      // rather than cloning it) — cheaper than duplicating the same
      // links/business info markup into every view section.
      const footerEl = document.getElementById("site-footer");
      if (footerEl) targetView.appendChild(footerEl);
    }

    // Kakao AdFit's script only scans .kakao_ad_area elements that are
    // already in the DOM (and visible) when it first loads. A slot sitting
    // inside a view that starts hidden (everything except "main") never
    // gets picked up, so it silently never shows an ad. Injecting the <ins>
    // fresh the first time each view actually becomes visible fixes that.
    if (viewId === "stadiums") this.injectKakaoAd("ad-slot-stadiums-list", "DAN-j8zQm1KA9FEGWPIx");
    if (viewId === "venues") this.injectKakaoAd("ad-slot-venues-list", "DAN-K9xdpROiUJHnjpww");
    if (viewId === "venue-detail") this.injectKakaoAd("ad-slot-venue-detail", "DAN-k3EmMkFGoCwuNZzq");

    // Update Bottom Navigation state (stadium-detail counts as part of the
    // "시야등록" tab since it's reached by drilling into stadiums)
    document.querySelectorAll(".nav-item").forEach(nav => {
      const target = nav.dataset.target;
      const isActive = target === viewId || (target === "stadiums" && viewId === "stadium-detail");
      nav.classList.toggle("active", isActive);
    });

    // --- Dynamic Header Layout Updates (Requirement 10) ---
    const logoEl = document.getElementById("header-logo");
    const backBtn = document.getElementById("header-back-btn");
    const titleEl = document.getElementById("header-title");

    // Logo is always visible now (tap → home from anywhere), replacing the
    // old "logo on main page, page-name title everywhere else" split.
    // Every subpage already shows what screen it is from its own content
    // (venue/stadium-detail have their own name banner below the header,
    // compare/ticketbook have their own headings/empty-states) — surveyed
    // before making the title unconditionally hidden so nothing actually
    // relied on it as the only "where am I" cue.
    if (logoEl) logoEl.style.display = "block";
    if (titleEl) titleEl.style.display = "none";
    if (viewId === "main") {
      if (backBtn) backBtn.style.display = "none";
    } else {
      if (backBtn) backBtn.style.display = "flex";
    }

    // Browser tab title — separate from the in-app header above (which
    // stays on the logo). A venue/seat deep-link (see netlify/functions/
    // venue-page.js, seat-page.js) sets document.title server-side before
    // the SPA boots, but nothing here ever updated it again afterward, so
    // whatever title the page first loaded with (that venue's name, or the
    // generic default) stuck around in the browser tab no matter where the
    // user navigated to next. Keep the format for venue-detail identical to
    // venue-page.js's so there's no visible flicker when the SPA takes over.
    const DEFAULT_TITLE = "잘보여유 - 뮤지컬·연극 공연장 좌석 시야 공유 서비스";
    if (viewId === "venue-detail" && state.selectedVenue) {
      document.title = `${state.selectedVenue.name} 좌석 시야 후기 | 뮤지컬·연극 공연장 - 잘보여유`;
    } else if (viewId === "stadium-detail" && state.selectedStadium) {
      document.title = `${state.selectedStadium.name} 좌석 시야 후기 | 잘보여유`;
    } else if (viewId === "venues") {
      document.title = "공연장 목록 | 잘보여유";
    } else if (viewId === "stadiums") {
      document.title = "프로야구장 목록 | 잘보여유";
    } else if (viewId === "compare") {
      document.title = "1:1 시야 비교 | 잘보여유";
    } else if (viewId === "ticketbook") {
      document.title = "마이페이지 | 잘보여유";
    } else {
      document.title = DEFAULT_TITLE;
    }

    // Specific Screen Initialization
    if (viewId === "ticketbook") {
      // Default to 공연장 the first time mypage is visited this
      // session; a later category switch is remembered on repeat visits.
      if (!state.ticketbookCategory) state.ticketbookCategory = "musical";
      if (state.ticketbookCategory === "musical" && !state.musicalTickets) {
        this.loadMusicalTickets().then(() => this.renderTicketbook());
      }
      this.renderTicketbook();
    } else if (viewId === "compare") {
      this.renderCompareView();
    } else if (viewId === "stadiums") {
      this.renderStadiumList();
    } else if (viewId === "venues") {
      // Render with whatever the search input currently shows (already
      // reset or preserved above) instead of always defaulting to
      // unfiltered — otherwise the grid could show all venues while the
      // input still displays a leftover search term, or vice versa.
      const venueSearchInputEl = document.getElementById("venue-search-input");
      this.renderVenueList(venueSearchInputEl ? venueSearchInputEl.value : "");
    } else if (viewId === "stadium-detail" && state.selectedBlock) {
      // Re-fetch the seat grid when the back-stack lands us back on a
      // block that was already open — otherwise a seat just registered
      // (from this block, then away to ticketbook, then back) still shows
      // as unregistered because the DOM was never re-rendered.
      this.renderSeatingGrid(state.selectedBlock.id);
    } else if (viewId === "venue-detail" && state.selectedVenueFloor) {
      this.renderVenueFloorGrid(state.selectedVenueFloor);
    }

    // Scroll to top of app content — .app-content is the scroller on desktop
    // (boxed phone preview), but real mobile now scrolls the actual page.
    document.getElementById("app-content").scrollTop = 0;
    window.scrollTo(0, 0);
  }

  handleNavClick(el) {
    const target = el.dataset.target;
    this.navigateTo(target);
  }

  handleHeaderBack() {
    // Mirror the popstate handler below: closing an open modal takes
    // priority over navigating the underlying view. Without this, tapping
    // "<" while e.g. the seat-detail sheet was open silently swapped the
    // view behind it while the sheet stayed visually open — looked like
    // the button did nothing.
    const activeModals = document.querySelectorAll(".modal.active");
    if (activeModals.length > 0) {
      const lastModal = activeModals[activeModals.length - 1];
      this.closeModal(lastModal.id);
      // A modal opened with pushHistory=false doesn't own a back-stop (see
      // openModal/selectVenueFloor): fall through so this same tap can also
      // step back a floor tab. Modals that DO own an entry stop here as before.
      if (lastModal.dataset.ownsHistory !== "false") return;
    }

    // If we're on venue-detail and have switched floor tabs, step back one
    // floor tab before leaving the venue entirely.
    if (state.currentView === "venue-detail" && (state.venueFloorHistory || []).length > 0) {
      const previousFloor = state.venueFloorHistory.pop();
      this.selectVenueFloor(previousFloor, { pushHistory: false });
      return;
    }

    if (state.currentView === "stadium-detail") {
      state.selectedBlock = null;
    } else if (state.currentView === "venue-detail") {
      state.selectedVenueBlock = null;
    }

    // Use the app's own back stack rather than window.history.back() — see
    // the comment on state.viewHistory for why the browser's real history
    // can't be trusted here after an OAuth redirect. pushHistory=false so
    // this doesn't push the view we're leaving right back onto the stack.
    const previousView = state.viewHistory.pop();
    this.navigateTo(previousView || "main", false);
  }


  async loginWithKakao() {
    if (!supabaseClient) {
      this.showToast("\u26A0\uFE0F", "Supabase \uD0AC\uB77C\uC774\uC5B8\uD2B8\uAC00 \uC124\uC815\uB418\uC9C0 \uC5A8\uC2B5\uB2C8\uB2E4.");
      return;
    }
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: window.location.origin + window.location.pathname,
        queryParams: {
          prompt: 'login'
        }
      }
    });
    if (error) {
      console.error("Kakao login error:", error);
      this.showToast("\u274C", "\uB85C\uADF8\uC778 \uC2DC\uB3C4 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.");
    }
  }

  async logout() {
    const confirmLogout = await this.showConfirmDialog("\uB85C\uADF8\uC544\uC6C3", "\uB85C\uADF8\uC544\uC6C3 \uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?");
    if (!confirmLogout) return;

    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }
    state.isLoggedIn = false;
    state.userId = null;
    state.userNickname = "@\uC57C\uAD6C\uB7EC\uBC84";
    state.userAvatarUrl = "";
    state.kakaoAvatarUrl = "";
    state.userEmail = "";

    localStorage.removeItem("seatview_nickname");
    localStorage.removeItem("seatview_favorite_stadium");
    localStorage.removeItem("seatview_cheering_team");

    // Clean up Supabase tokens
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("sb-") || key.includes("supabase"))) {
        localStorage.removeItem(key);
      }
    }
    
    const profileEmailEl = document.getElementById("my-profile-email");
    const profileAvatarEl = document.getElementById("my-profile-avatar");
    if (profileEmailEl) profileEmailEl.textContent = "(\uC774\uBA54\uC77C \uC815\uBCF4 \uC81C\uAC70)";
    if (profileAvatarEl) profileAvatarEl.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='12' cy='12' r='12' fill='%23c4c9d3'/><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' fill='%23ffffff'/></svg>";

    this.renderTicketbook();
    this.navigateTo("main");
    this.showToast("\uD83D\uDD13", "\uB85C\uADF8\uC544\uC6C3 \uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
    this.checkUserSession();
  }

  async checkUserSession() {
    if (!supabaseClient) return;
    try {
      const { data: { session }, error } = await supabaseClient.auth.getSession();
      if (session && session.user) {
        state.isLoggedIn = true;
        state.userId = session.user.id;

        const { data: profile, error: profileErr } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        state.userEmail = session.user.email || "";

        if (!profileErr && profile) {
          state.userNickname = profile.nickname || "@\uC57C\uAD6C\uB7EC\uBC84";
          state.favoriteStadiumId = profile.favorite_stadium_id || null;
          state.cheeringTeam = profile.cheering_team || null;
          state.kakaoAvatarUrl = profile.profile_image_url || "";
          state.userAvatarUrl = state.kakaoAvatarUrl;
        } else {
          const meta = session.user.user_metadata || {};
          state.userNickname = meta.name || meta.full_name || "@\uC57C\uAD6C\uB7EC\uBC84";
          state.kakaoAvatarUrl = meta.avatar_url || "";
          state.userAvatarUrl = state.kakaoAvatarUrl;
        }

        // Fetch user reviews directly from Supabase db
        try {
          const { data: dbReviews, error: dbReviewsErr } = await supabaseClient
            .from('baseball_seat_reviews')
            .select('*')
            .eq('user_id', state.userId)
            .order('ins_dtm', { ascending: false });

          if (!dbReviewsErr && dbReviews) {
            // baseball_seat_id is a real FK to baseball_seats.id now, so look up
            // the seat/block/stadium chain instead of guessing from a string.
            const seatIds = [...new Set(dbReviews.map(r => r.baseball_seat_id).filter(id => id != null))];
            let seatsById = {}, blocksById = {}, stadiumsById = {};

            if (seatIds.length > 0) {
              const { data: seatRows } = await supabaseClient.from('baseball_seats').select('*').in('id', seatIds);
              (seatRows || []).forEach(s => { seatsById[s.id] = s; });

              const blockIds = [...new Set((seatRows || []).map(s => s.block_id).filter(id => id != null))];
              if (blockIds.length > 0) {
                const { data: blockRows } = await supabaseClient.from('baseball_blocks').select('*').in('id', blockIds);
                (blockRows || []).forEach(b => { blocksById[b.id] = b; });

                const stadiumIds = [...new Set((blockRows || []).map(b => b.stadium_id).filter(id => id != null))];
                if (stadiumIds.length > 0) {
                  const { data: stadiumRows } = await supabaseClient.from('stadiums').select('*').in('id', stadiumIds);
                  (stadiumRows || []).forEach(st => { stadiumsById[st.id] = st; });
                }
              }
            }

            state.tickets = dbReviews.map(r => {
              const seatRow = seatsById[r.baseball_seat_id];
              const blockRow = seatRow ? blocksById[seatRow.block_id] : null;
              const stadiumRow = blockRow ? stadiumsById[blockRow.stadium_id] : null;

              return {
                id: r.id,
                seatId: r.baseball_seat_id,
                ins_dtm: r.ins_dtm,
                stadiumId: stadiumRow ? stadiumRow.id : null,
                stadiumName: stadiumRow ? stadiumRow.name : "기타 구장",
                blockName: blockRow ? (blockRow.full_name || blockRow.block_code + "구역") : "구역 정보 없음",
                seatName: this.formatSeatName(seatRow, !!(seatRow && seatRow.is_disabled_seat)),
                comment: r.content,
                image: r.image_urls && r.image_urls.length > 0 ? r.image_urls[0] : "",
                images: r.image_urls || [],
                isTicketVerified: !!r.is_ticket_verified
              };
            });
          } else {
            state.tickets = [];
          }
        } catch (dbErr) {
          console.warn("Fetch seat reviews error:", dbErr);
          state.tickets = [];
        }

        // Lightweight count-only fetch so the top-right badge can show the
        // combined 야구장+공연장 total without eagerly loading the full
        // musical ticket list (that stays lazy, see loadMusicalTickets()).
        try {
          const { count } = await supabaseClient
            .from('musical_seat_reviews')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', state.userId);
          state.musicalTicketCount = count || 0;
        } catch (countErr) {
          console.warn("Fetch musical review count error:", countErr);
          state.musicalTicketCount = 0;
        }

        const profileStadiumEl = document.getElementById("my-profile-stadium");
        const profileTeamEl = document.getElementById("my-profile-team");
        const profileNicknameEl = document.getElementById("my-profile-nickname");
        const profileEmailEl = document.getElementById("my-profile-email");
        const profileAvatarEl = document.getElementById("my-profile-avatar");
        const favStadiumObj = STADIUMS_DB.find(s => s.id === state.favoriteStadiumId);

        if (profileStadiumEl) profileStadiumEl.textContent = favStadiumObj ? favStadiumObj.name : "\uBBF8\uC124\uC815";
        if (profileTeamEl) profileTeamEl.textContent = state.cheeringTeam || "\uBBF8\uC124\uC815";
        if (profileNicknameEl) profileNicknameEl.textContent = state.userNickname;
        if (profileEmailEl) {
          if (state.userEmail) {
            profileEmailEl.textContent = state.userEmail;
            profileEmailEl.style.display = "block";
          } else {
            profileEmailEl.style.display = "none";
          }
        }
        if (profileAvatarEl) {
          profileAvatarEl.src = state.userAvatarUrl || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='12' cy='12' r='12' fill='%23c4c9d3'/><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' fill='%23ffffff'/></svg>";
        }

        // Restore pending login state if exists — set by addCurrentSeatToTicketbook()
        // right before the login-confirm modal opens, so a seat detail the
        // user was about to write a review for reopens automatically instead
        // of the OAuth redirect dropping them back on the main screen.
        const pendingJson = sessionStorage.getItem("seatview_pending_login_state");
        if (pendingJson) {
          try {
            const pending = JSON.parse(pendingJson);
            sessionStorage.removeItem("seatview_pending_login_state");

            if (pending.action && pending.action.type === "add_seat_photo" && pending.action.seatKey) {
              setTimeout(async () => {
                await this.openSeatDetail(pending.action.seatKey, { category: pending.action.category });
                setTimeout(() => this.addCurrentSeatToTicketbook(), 300);
              }, 400);
            }
          } catch (e) {
            console.warn("Restore pending login state error:", e);
          }
        }

        const footer = document.getElementById("my-page-footer");
        if (footer) footer.style.display = "block";
      } else {
        state.isLoggedIn = false;
        const footer = document.getElementById("my-page-footer");
        if (footer) footer.style.display = "none";
      }
    } catch (e) {
      console.warn("Session check fail:", e);
      state.isLoggedIn = false;
      const footer = document.getElementById("my-page-footer");
      if (footer) footer.style.display = "none";
    }
    this.renderTicketbook();
  }

  // --- Stadiums Selection View ---
  renderStadiumList() {
    const container = document.getElementById("stadium-grid-container");
    if (!container) return;

    container.innerHTML = "";
    const sortedStadiums = [...STADIUMS_DB].sort((a, b) => {
      const orderA = a.display_order !== undefined && a.display_order !== null ? a.display_order : 999;
      const orderB = b.display_order !== undefined && b.display_order !== null ? b.display_order : 999;
      return orderA - orderB;
    });

    // Product ad slot: lands on visual position 6 in the 2-column grid
    // (1 2 / 3 4 / 5 6 / ...), so inserted before the 6th stadium
    // (0-indexed: 5). Just one slot for now.
    const adInsertBeforeIndices = [5];

    sortedStadiums.forEach((st, index) => {
      if (adInsertBeforeIndices.includes(index)) {
        const adCard = this.buildShoppingAdCard('baseball', 0);
        if (adCard) container.appendChild(adCard);
      }

      const card = document.createElement("div");
      const isPreparing = st.status === "preparing";
      card.className = isPreparing ? "stadium-card preparing" : "stadium-card";
      // Open cards use each stadium's own team-color gradient over its photo.
      // Preparing cards keep the photo (for texture) but use one fixed neutral
      // gradient instead of st.gradient, so the team color isn't what was
      // making some of them stand out — plus a grayscale filter (in CSS) as
      // a second layer of insurance against the photos' own natural hues.
      card.style.backgroundImage = isPreparing
        ? `linear-gradient(135deg, rgba(15, 23, 42, 0.88), rgba(8, 10, 15, 0.88)), url('${st.bg}')`
        : `${st.gradient}, url('${st.bg}')`;
      card.onclick = isPreparing
        ? () => this.showItemPreparing(st.name)
        : () => this.loadStadiumDetail(st.id);

      const teamsHtml = st.team
        ? st.team.split(" / ").map(t => `<span class="stadium-card-team">[${this.escapeHtml(t.replace(/\s+/g, ""))}]</span>`).join("")
        : "";

      card.innerHTML = isPreparing
        ? `<div class="stadium-card-preparing-overlay"><i data-lucide="lock"></i><span class="preparing-label">준비중</span><span class="preparing-name">${this.escapeHtml(st.name)}</span></div>`
        : `
        <div class="stadium-card-main">
          <div class="stadium-card-team-container" style="display: flex; flex-wrap: wrap; gap: 4px;">
            ${teamsHtml}
          </div>
          <h3 class="stadium-card-name">${this.escapeHtml(st.name)}</h3>
          <span class="stadium-card-location"><i data-lucide="map-pin"></i> ${this.escapeHtml(st.location.split(" ").slice(0, 2).join(" "))}</span>
        </div>
      `;
      container.appendChild(card);
    });
    // An ad slot that lands exactly at the end of the list (nothing after
    // it to trigger the "insert before" check in the loop above) needs to
    // be appended here instead.
    if (adInsertBeforeIndices.includes(sortedStadiums.length)) {
      const adCard = this.buildShoppingAdCard('baseball', 0);
      if (adCard) container.appendChild(adCard);
    }
    lucide.createIcons();
  }

  // One row per category ('baseball'/'musical') in shopping_ads, managed
  // from admin's "광고 관리" tab — not a hardcoded asset/link anymore.
  async loadShoppingAds() {
    if (!supabaseClient) return;
    try {
      const { data, error } = await supabaseClient
        .from('shopping_ads')
        .select('*')
        .order('display_order', { ascending: true })
        .order('id', { ascending: true });
      if (error) throw error;
      const byCategory = {};
      (data || []).forEach(row => {
        if (!byCategory[row.category]) byCategory[row.category] = [];
        byCategory[row.category].push(row);
      });
      SHOPPING_ADS_DB = byCategory;
    } catch (e) {
      console.warn("Failed to load shopping ads:", e);
    }
  }

  // Shopping-mall product ad card, same size/grid slot as a stadium/venue
  // card. A category can have several ads registered — `occurrenceIndex`
  // (0, 1, 2... — which ad *slot* this is within the current list render,
  // not a position in the venue/stadium list) picks which one cycles into
  // this particular slot, wrapping back to the first once past the end.
  // Returns null (skip the slot entirely) when admin hasn't registered any
  // ad for this category yet, rather than showing a broken/empty card.
  buildShoppingAdCard(category, occurrenceIndex) {
    const ads = SHOPPING_ADS_DB[category];
    if (!ads || ads.length === 0) return null;
    const ad = ads[occurrenceIndex % ads.length];
    if (!ad || !ad.image_url) return null;

    // The banner image is expected to already be a fully composed graphic
    // (flag badge, AD mark, product name, description all baked in by
    // whoever designs it) — this card is just a plain clickable image,
    // no .stadium-card-main text overlay on top of it.
    const card = document.createElement("div");
    card.className = "stadium-card shopping-ad-card";
    card.style.backgroundImage = `url('${ad.image_url}')`;
    if (ad.link_url) {
      card.onclick = () => window.open(ad.link_url, "_blank", "noopener,noreferrer");
    }
    return card;
  }

  // 목업 전용 — 2열 정사각형 광고 그리드안. 기존 배너 소재(900x250, 3.6:1
  // 와이드)를 정사각형으로 그대로 cover-fit 하면 실제로 크게 잘리는데,
  // 그 실물 크롭 결과를 그대로 보여줘서 판단 재료로 쓰려는 것 — 실제
  // 채택 시엔 광고 소재 자체를 정사각형 비율로 새로 만들어야 한다. AD
  // 뱃지는 원본 이미지에 이미 박혀있어도 크롭되면 사라질 수 있어 코드로
  // 한 번 더 얹는다.
  buildShoppingAdPairCard(category, occurrenceIndex) {
    const ads = SHOPPING_ADS_DB[category];
    if (!ads || ads.length === 0) return null;

    const wrap = document.createElement("div");
    wrap.className = "shopping-ad-pair";

    for (let i = 0; i < 2; i++) {
      const ad = ads[(occurrenceIndex + i) % ads.length];
      if (!ad || !ad.image_url) continue;
      const tile = document.createElement("div");
      tile.className = "shopping-ad-square";
      tile.style.backgroundImage = `url('${ad.image_url}')`;
      tile.innerHTML = `<span class="shopping-ad-square-badge">AD</span>`;
      if (ad.link_url) {
        tile.onclick = () => window.open(ad.link_url, "_blank", "noopener,noreferrer");
      }
      wrap.appendChild(tile);
    }
    return wrap.children.length > 0 ? wrap : null;
  }

  // --- Venue (공연장) List + Detail — lean parallel to the stadium flow
  // above, not sharing code with it since loadStadiums()/loadStadiumDetail()
  // are full of baseball-only assumptions (hardcoded id remaps, amenities
  // fallback data per stadium) that don't apply here.
  async loadVenues() {
    if (!supabaseClient) return;
    try {
      const { data, error } = await supabaseClient
        .from('venues')
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('name', { ascending: true });
      if (!error && data) {
        VENUES_DB = data.map(v => ({
          id: v.id,
          name: v.name,
          location: v.address || v.location_district || "",
          bg: v.bg_image_url || "/assets/musical_stage.jpg",
          map_image_url: v.map_image_url,
          food_info: v.food_info,
          parking_info: v.parking_info,
          partner_message: v.partner_message || null,
          // Filled in below from musical_shows — venues.current_shows is
          // the old manually-curated array column, kept in the table for
          // now but no longer read here (see loadVenues()'s comment on
          // the musical_shows fetch for why).
          currentShows: [],
          nextShow: null,
          display_order: v.display_order,
          ins_dtm: v.ins_dtm,
          status: v.status || 'open',
          reviewCount: 0
        }));

        // 공연장의 "현재/다음 공연"을 더 이상 venues.current_shows(수동
        // 관리 배열)에서 읽지 않고, 공연장/공연명/상영기간을 따로 관리하는
        // musical_shows 테이블에서 아직 끝나지 않은 것만 조회한다. 종료된
        // 공연을 일일이 지워줄 필요 없이, 상영종료일이 지나면 자동으로
        // 목록에서 빠진다 (종료일 미정인 공연은 run_end를 null로 두면
        // 계속 "현재 공연"으로 표시됨). run_start 오름차순으로 받아서,
        // 아직 시작 전인 것 중 venue별 첫 항목이 곧 가장 빨리 시작하는
        // "다음 공연"이 된다.
        const today = new Date().toISOString().slice(0, 10);
        const { data: shows, error: showsErr } = await supabaseClient
          .from('musical_shows')
          .select('venue_id, show_name, run_start')
          .or(`run_end.is.null,run_end.gte.${today}`)
          .order('run_start', { ascending: true });
        if (!showsErr && shows) {
          const currentByVenue = {};
          const nextByVenue = {};
          shows.forEach(s => {
            if (s.run_start <= today) {
              (currentByVenue[s.venue_id] = currentByVenue[s.venue_id] || []).push(s.show_name);
            } else if (!(s.venue_id in nextByVenue)) {
              nextByVenue[s.venue_id] = s.show_name;
            }
          });
          VENUES_DB.forEach(v => {
            v.currentShows = currentByVenue[v.id] || [];
            v.nextShow = nextByVenue[v.id] || null;
          });
        } else if (showsErr) {
          console.error("공연 상영기간 로딩 에러:", showsErr);
        }

        // 목록 정렬 기준: 등록된 시야 데이터가 많은 공연장 먼저, 같으면
        // 기존 display_order 순 — 관리자가 정해둔 순서는 동률일 때의
        // tie-breaker로만 쓰임. 리뷰→좌석→구역→공연장 순으로 FK를 타고
        // 올라가야 해서(리뷰 테이블엔 venue_id가 직접 없음) 중첩 select로
        // 한 번에 가져온다. 공식 홈페이지 인용 계정(OFFICIAL_SOURCE_USER_ID)의
        // 리뷰는 여기서 제외한다 — 실제 리뷰가 하나도 없던 공연장이 그
        // 계정이 사진 몇 장 가져다 쓴 것만으로 상위권에 오르는 건 이
        // 정렬의 취지(실사용자 시야 데이터가 많은 순)에 안 맞는다. 좌석
        // 상세(개별 층/구역) 쪽 카운트는 이 필터의 영향을 받지 않는다.
        const { data: reviews, error: reviewErr } = await supabaseClient
          .from('musical_seat_reviews')
          .select('user_id, musical_seats(musical_blocks(venue_id))')
          .neq('user_id', OFFICIAL_SOURCE_USER_ID);
        if (!reviewErr && reviews) {
          const countByVenue = {};
          reviews.forEach(r => {
            const venueId = r.musical_seats && r.musical_seats.musical_blocks
              ? r.musical_seats.musical_blocks.venue_id
              : null;
            if (venueId != null) countByVenue[venueId] = (countByVenue[venueId] || 0) + 1;
          });
          VENUES_DB.forEach(v => { v.reviewCount = countByVenue[v.id] || 0; });
        }

        const originalOrder = new Map(VENUES_DB.map((v, i) => [v.id, i]));
        VENUES_DB.sort((a, b) => {
          if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
          return originalOrder.get(a.id) - originalOrder.get(b.id);
        });
      }
    } catch (e) {
      console.error("공연장 목록 로딩 에러:", e);
    }
  }

  // filterText: live substring match on venue name (2+ chars, from the
  // search box — see bindEvents) instead of the old STEP-era "공연장명 층
  // 구역" deep-link parser, which doesn't make sense anymore now that
  // picking a floor already shows every zone on it at once.
  renderVenueList(filterText = "") {
    const container = document.getElementById("venue-grid-container");
    if (!container) return;
    container.innerHTML = "";

    if (VENUES_DB.length === 0) {
      container.innerHTML = `
        <div class="compare-empty" style="border-style: solid;">
          <div class="compare-empty-icon"><i data-lucide="drama"></i></div>
          <h3>등록된 공연장이 없습니다</h3>
          <p>곧 다양한 공연장 시야 정보로<br>찾아뵙겠습니다!</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    const trimmed = filterText.trim();
    const searchClearBtn = document.getElementById("venue-search-clear-btn");
    if (searchClearBtn) searchClearBtn.style.display = filterText.length > 0 ? "flex" : "none";
    // Case-insensitive — "nol" typed lowercase should still match venues
    // named "NOL 유니플렉스" etc.
    const needle = trimmed.toLowerCase();
    // Search only ever matches what a card actually displays: the venue
    // name, current shows if any exist, or — only when there's no current
    // show to show instead — the next upcoming one. Matching nextShow
    // unconditionally would surface venues whose card shows a current show
    // with no visible trace of the searched-for (future) title anywhere.
    let venues = trimmed.length >= 1
      ? VENUES_DB.filter(v => {
          if (v.name.toLowerCase().includes(needle)) return true;
          if (v.currentShows && v.currentShows.length > 0) {
            return v.currentShows.some(s => s.toLowerCase().includes(needle));
          }
          return !!(v.nextShow && v.nextShow.toLowerCase().includes(needle));
        })
      : VENUES_DB.slice();

    // 정렬 기준 — "등록된 시야순"은 VENUES_DB가 loadVenues()에서 이미 그
    // 순서로 정렬돼 있어 그대로 두면 되고, 나머지 둘만 다시 정렬한다.
    const sortSelect = document.getElementById("venue-sort-select");
    const sortMode = sortSelect ? sortSelect.value : "reviews";
    if (sortMode === "recent") {
      venues = venues.slice().sort((a, b) => new Date(b.ins_dtm || 0) - new Date(a.ins_dtm || 0));
    } else if (sortMode === "name") {
      venues = venues.slice().sort((a, b) => a.name.localeCompare(b.name, "ko"));
    }

    const countEl = document.getElementById("venue-list-count");
    if (countEl) countEl.textContent = `총 ${venues.length}개`;

    if (venues.length === 0) {
      container.innerHTML = `
        <div class="compare-empty" style="border-style: solid;">
          <div class="compare-empty-icon"><i data-lucide="search-x"></i></div>
          <h3>'${this.escapeHtml(trimmed)}'와(과) 일치하는 공연장이 없습니다</h3>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    // Product ad slot: 공연장 5개 다음에 첫 광고, 그 뒤로는 8개마다 한 번씩
    // (5, 13, 21, 29...번째 위치에 삽입). Skipped while filtering — an ad
    // wedged into a short, deliberately-narrowed search result looks out
    // of place.
    const showAds = trimmed.length < 1;
    let adOccurrence = 0; // which ad slot this is (1st, 2nd, 3rd...), not a venue index — cycles through registered ads in order
    let nextAdIndex = 5; // first ad after 5 venues, then every 8 after that

    // 카드 배경 사진은 CSS background-image라 브라우저가 화면 밖 카드
    // 것까지 전부 내려받는다(55장 합쳐 약 5.9MB — 신규 방문자마다 Supabase
    // Cached Egress로 잡힘). 화면에 들어올 때만 실제로 url을 붙인다.
    if (this._venueBgObserver) this._venueBgObserver.disconnect();
    this._venueBgObserver = ("IntersectionObserver" in window)
      ? new IntersectionObserver((entries, obs) => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            el.style.backgroundImage = `url('${el.dataset.bg}')`;
            obs.unobserve(el);
          });
        }, { rootMargin: "300px 0px" })
      : null;

    venues.forEach((venue, index) => {
      if (showAds && index === nextAdIndex) {
        // 목업 테스트용으로 2열 정사각형 그리드(buildShoppingAdPairCard)를
        // 잠깐 대신 써본다 — 마음에 안 들면 이 한 줄만 buildShoppingAdCard
        // 호출로 되돌리면 원래대로 복구된다.
        const adCard = this.buildShoppingAdPairCard('musical', adOccurrence);
        if (adCard) { container.appendChild(adCard); adOccurrence += 2; }
        nextAdIndex += 8;
      }

      // A real <a href> (instead of a bare div) so search engine crawlers
      // can actually discover each venue's /venue/:id page by following a
      // link — a div with only an onclick handler is invisible to a
      // crawler. Real clicks still go through the SPA's own navigation via
      // preventDefault, so this never causes an actual page reload.
      const card = document.createElement("a");
      const isPreparing = venue.status === "preparing";
      card.className = isPreparing ? "stadium-card preparing" : "stadium-card";
      card.href = isPreparing ? "#" : `/venue/${venue.id}`;
      card.style.color = "inherit";
      card.style.textDecoration = "none";
      // Just the photo — .stadium-card::before (in style_v6.css) already
      // lays a bottom-heavy dark gradient over every card for text
      // legibility. This used to ALSO add its own diagonal tint on top of
      // that, which was really two overlays stacked (hence "too dark" no
      // matter how far the numbers here got turned down).
      if (this._venueBgObserver) {
        card.dataset.bg = venue.bg;
        this._venueBgObserver.observe(card);
      } else {
        card.style.backgroundImage = `url('${venue.bg}')`;
      }
      card.onclick = (e) => {
        e.preventDefault();
        if (isPreparing) this.showItemPreparing(venue.name);
        else this.loadVenueDetail(venue.id);
      };
      // 현재 상영 중인 공연은 동시 상영작이 있으면 전부 뱃지로 보여준다
      // (컨테이너가 flex-wrap이라 좁으면 줄바꿈). 현재 공연이 없을 때만
      // 다음 공연을 "예정" 스타일로 대신 보여주고, 둘 다 없으면 뱃지 자체를
      // 숨김.
      let showsHtml = "";
      if (venue.currentShows && venue.currentShows.length > 0) {
        showsHtml = venue.currentShows
          .map(s => `<span class="stadium-card-team stadium-card-team-current">[${this.escapeHtml(s)}]</span>`)
          .join("");
      } else if (venue.nextShow) {
        showsHtml = `<span class="stadium-card-team stadium-card-team-upcoming">공연예정 [${this.escapeHtml(venue.nextShow)}]</span>`;
      }
      card.innerHTML = isPreparing
        ? `<div class="stadium-card-preparing-overlay"><i data-lucide="lock"></i><span class="preparing-label">준비중</span><span class="preparing-name">${this.escapeHtml(venue.name)}</span></div>`
        : `
        <div class="stadium-card-main">
          ${showsHtml ? `<div class="stadium-card-team-container" style="display: flex; flex-wrap: wrap; gap: 4px;">${showsHtml}</div>` : ""}
          <h3 class="stadium-card-name">${this.escapeHtml(venue.name)}</h3>
          <span class="stadium-card-location"><i data-lucide="map-pin"></i> ${this.escapeHtml(venue.location)}</span>
        </div>
      `;
      container.appendChild(card);
    });
    lucide.createIcons();
  }

  async loadVenueDetail(venueId) {
    const venue = VENUES_DB.find(v => String(v.id) === String(venueId));
    if (!venue) return;
    if (venue.status === "preparing") {
      this.showItemPreparing(venue.name);
      return;
    }
    state.selectedVenue = venue;
    state.selectedVenueFloor = null;
    state.selectedVenueBlock = null;
    // Fresh per-venue back stack for handleHeaderBack()'s floor-tab
    // navigation (see selectVenueFloor()).
    state.venueFloorHistory = [];

    const nameEl = document.getElementById("venue-detail-name");
    const locEl = document.getElementById("venue-detail-location");
    const mapImgEl = document.getElementById("venue-detail-map-img");
    const foodEl = document.getElementById("venue-info-food");
    const parkingEl = document.getElementById("venue-info-parking");
    const showsEl = document.getElementById("venue-detail-shows");

    if (nameEl) nameEl.textContent = venue.name;
    if (locEl) locEl.textContent = venue.location;
    if (showsEl) {
      // 리스트 카드와 동일한 규칙: 현재 공연이 있으면 그것만, 없으면
      // 다음 공연을 "공연예정 [이름]"으로 대신 보여준다(둘을 같이
      // 보여주면 뱃지가 겹쳐 보여 오히려 헷갈림).
      const shows = venue.currentShows || [];
      let badges = "";
      if (shows.length > 0) {
        badges = shows.map(s => `<span class="stadium-badge">${this.escapeHtml(s)}</span>`).join("");
      } else if (venue.nextShow) {
        badges = `<span class="stadium-badge stadium-badge-upcoming">공연예정 [${this.escapeHtml(venue.nextShow)}]</span>`;
      }
      if (badges) {
        showsEl.innerHTML = badges;
        showsEl.style.display = "";
      } else {
        showsEl.style.display = "none";
      }
    }

    const bannerOverlay = document.querySelector("#detail-venue-banner .profile-overlay");
    if (bannerOverlay) bannerOverlay.style.backgroundImage = `url('${venue.bg}')`;

    // No silent fallback to the decorative bg photo here — that's a
    // building exterior shot, not a seat chart, and showing it under a
    // "좌석 이미지" toggle as if it were one is actively misleading. Hide the
    // whole toggle instead until a real map_image_url is registered.
    const venueMapCollapseBtn = document.getElementById("venue-map-collapse-btn");
    const venueMapGuideCard = venueMapCollapseBtn ? venueMapCollapseBtn.closest(".map-guide-card") : null;
    if (venueMapGuideCard) venueMapGuideCard.style.display = venue.map_image_url ? "" : "none";
    if (mapImgEl && venue.map_image_url) mapImgEl.src = venue.map_image_url;

    // Collapsed by default every time a venue's detail screen loads.
    const venueMapWrapper = document.getElementById("venue-static-map-wrapper");
    if (venueMapWrapper) venueMapWrapper.classList.add("collapsed");
    if (venueMapCollapseBtn) {
      venueMapCollapseBtn.classList.remove("expanded");
      const label = venueMapCollapseBtn.querySelector("span");
      if (label) label.textContent = "🗺️ 좌석 이미지 펼치기";
    }

    if (foodEl) foodEl.innerHTML = this.formatInfoText(venue.food_info) || "등록된 먹거리 정보가 없습니다.";
    if (parkingEl) parkingEl.innerHTML = this.formatInfoText(venue.parking_info) || "등록된 주차 정보가 없습니다.";

    // 공연장 제휴 한마디 — 아직 데이터가 없는 공연장이 대부분이라 값이
    // 있을 때만 카드 자체를 노출한다(빈 카드가 계속 보이면 "정보 없음"
    // 카드만 늘어나는 꼴이라 오히려 지저분함).
    const partnerCardEl = document.getElementById("venue-info-partner-card");
    const partnerEl = document.getElementById("venue-info-partner");
    if (partnerCardEl && partnerEl) {
      const formattedPartnerMsg = this.formatInfoText(venue.partner_message);
      if (formattedPartnerMsg) {
        partnerEl.innerHTML = formattedPartnerMsg;
        partnerCardEl.style.display = "";
      } else {
        partnerCardEl.style.display = "none";
      }
    }

    // 공연 일정 — 리스트/상단 뱃지는 "현재 아니면 다음 하나만" 규칙이지만,
    // 여기 정보 탭은 해당 공연장의 전체 일정을 훑어보는 용도라 현재/예정을
    // 모두, 날짜까지 같이 보여준다.
    const scheduleEl = document.getElementById("venue-info-schedule");
    if (scheduleEl) {
      if (!supabaseClient) {
        scheduleEl.textContent = "";
      } else {
        try {
          const today = new Date().toISOString().slice(0, 10);
          const { data: shows, error: showsErr } = await supabaseClient
            .from('musical_shows')
            .select('show_name, run_start, run_end')
            .eq('venue_id', venue.id)
            .or(`run_end.is.null,run_end.gte.${today}`)
            .order('run_start', { ascending: true });
          if (showsErr) throw showsErr;
          // 현재 공연은 전부, 공연예정은 최대 3개까지만 — 예정 리스트가
          // 너무 길어지면 정보 탭이 일정표처럼 늘어져 오히려 안 읽힘.
          const capped = [];
          let upcomingCount = 0;
          (shows || []).forEach(s => {
            if (s.run_start <= today) {
              capped.push(s);
            } else if (upcomingCount < 3) {
              capped.push(s);
              upcomingCount++;
            }
          });
          scheduleEl.innerHTML = (capped.length > 0)
            ? capped.map(s => {
                const isCurrent = s.run_start <= today;
                const period = `${this.formatShowDate(s.run_start)} ~ ${s.run_end ? this.formatShowDate(s.run_end) : "오픈런"}`;
                return `<div class="venue-schedule-item">
                  <span class="venue-schedule-dot ${isCurrent ? "current" : "upcoming"}"></span>
                  <div class="venue-schedule-item-body">
                    <span class="venue-schedule-item-title">${this.escapeHtml(s.show_name)}</span>
                    <span class="venue-schedule-item-meta">${isCurrent ? "공연중" : "공연예정"} · ${period}</span>
                  </div>
                </div>`;
              }).join("")
            : "등록된 공연 일정이 없습니다.";
        } catch (e) {
          console.error("공연 일정 로딩 에러:", e);
          scheduleEl.textContent = "공연 일정을 불러오지 못했습니다.";
        }
      }
    }

    // Switch default tab — unlike loadStadiumDetail(), this was never being
    // called here, so a stray leftover "active" class from a previous
    // screen (or none at all) could leave neither tab visibly selected.
    this.switchVenueDetailTab("map");

    // Reset STEP 2/3 UI from any previously-viewed venue
    const blockSelectorEl = document.getElementById("venue-block-selector-container");
    const seatRowsEl = document.getElementById("venue-seat-rows-container");
    if (blockSelectorEl) blockSelectorEl.innerHTML = "";
    if (seatRowsEl) seatRowsEl.innerHTML = "";
    const badgeEl = document.getElementById("venue-selected-block-badge");
    const titleEl = document.getElementById("venue-selected-block-title");
    if (badgeEl) badgeEl.textContent = "구역 미선택";
    if (titleEl) titleEl.textContent = "원하는 구역을 먼저 선택해 주세요";
    this.updateVenueStepVisibility();

    this.navigateTo("venue-detail");

    if (!supabaseClient) return;
    try {
      const { data: blocks, error } = await supabaseClient
        .from('musical_blocks')
        // admin_memo는 어드민 전용 메모라 일반 사용자 화면으로는 절대
        // 내려가면 안 되므로, select('*') 대신 실제 쓰는 컬럼만 명시한다.
        .select('id, venue_id, floor, block_code, full_name, total_rows, max_seats, offset_x, offset_y, label_position, show_row_label')
        .eq('venue_id', venue.id)
        .eq('is_visible', true)
        .order('floor', { ascending: true })
        .order('block_code', { ascending: true });
      if (error) throw error;
      venue.blocks = blocks || [];
      this.renderVenueFloorFilterBar(venue.blocks);
    } catch (e) {
      console.error("공연장 구역 로딩 에러:", e);
    }
  }

  maybeShowEventPopup() {
    const hideUntil = Number(localStorage.getItem("seatview_event_popup_hide_until") || 0);
    if (Date.now() < hideUntil) return;
    // pushHistory=false — this shows on every fresh load regardless of what
    // view/deep-link is underneath, so it must not insert its own back-stop
    // (same reasoning as modal-seat-detail in openSeatDetail): a real user
    // closing it and later pressing back would otherwise hit one extra
    // "nothing visibly happens" back-press before the real navigation.
    this.openModal("modal-event-popup", false);
  }

  closeEventPopup() {
    // The "3일간 다시 보지 않기" checkbox is actually read inside closeModal()
    // itself, so it's honored no matter which path closes this modal (this
    // button, the backdrop, the header "<" button, or a real back-press).
    this.closeModal("modal-event-popup");
  }

  // The visible "3일간 다시 보지 않기" button just checks the (hidden) checkbox
  // and closes — reuses the exact same checkbox-read-in-closeModal() logic
  // as every other close path, instead of duplicating the localStorage write.
  hideEventPopupFor3Days() {
    const checkbox = document.getElementById("event-popup-dontshow-checkbox");
    if (checkbox) checkbox.checked = true;
    this.closeEventPopup();
  }

  // Opens the share picker for the current venue (?venue=<id>, picked up
  // by init()'s deep-link check).
  shareVenue() {
    const venue = state.selectedVenue;
    if (!venue) return;
    const url = `${window.location.origin}${window.location.pathname}?venue=${venue.id}`;
    const urlInput = document.getElementById("share-modal-url");
    if (urlInput) urlInput.value = url;
    this.openModal("modal-venue-share");
  }

  shareToChannel(channel) {
    const venue = state.selectedVenue;
    if (!venue) return;
    const url = `${window.location.origin}${window.location.pathname}?venue=${venue.id}`;
    const text = `${venue.name} 좌석 시야 확인하러 가기`;

    if (channel === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
    } else if (channel === "x") {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
    } else if (channel === "band") {
      window.open(`https://band.us/plugin/share?body=${encodeURIComponent(text + " " + url)}&route=${encodeURIComponent(url)}`, "_blank");
    } else if (channel === "kakao") {
      if (!window.Kakao || !Kakao.isInitialized()) {
        this.copyShareLink();
        return;
      }
      // venue.bg is already the venue's bg_image_url (falls back to a local
      // asset path, which Kakao's servers can't fetch — needs to be absolute).
      const imageUrl = (venue.bg && /^https?:\/\//i.test(venue.bg))
        ? venue.bg
        : `${window.location.origin}/assets/musical_stage.jpg`;
      Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: venue.name,
          description: text,
          imageUrl,
          link: { mobileWebUrl: url, webUrl: url },
        },
        buttons: [
          {
            title: "좌석 시야 보러 가기",
            link: { mobileWebUrl: url, webUrl: url },
          },
        ],
      });
    }
  }

  copyShareLink() {
    const urlInput = document.getElementById("share-modal-url");
    const url = urlInput ? urlInput.value : "";
    if (!url || !navigator.clipboard) return;
    navigator.clipboard.writeText(url)
      .then(() => this.showToast("🔗", "링크가 복사되었습니다"))
      .catch(() => this.showToast("⚠️", "링크 복사에 실패했습니다"));
  }

  // STEP 1: floor pills, derived from whatever floors this venue's blocks
  // actually span (no hardcoded floor count).
  renderVenueFloorFilterBar(blocks) {
    const container = document.getElementById("venue-floor-filter-bar");
    if (!container) return;
    const floors = [...new Set(blocks.map(b => b.floor))].sort((a, b) => a - b);

    if (floors.length === 0) {
      container.innerHTML = `<span style="font-size: 0.8rem; color: var(--text-muted); padding: 8px;">등록된 층 정보가 없습니다.</span>`;
      return;
    }

    container.innerHTML = floors.map(floor => `
      <button class="grade-pill" onclick="app.selectVenueFloor(${floor})" data-floor="${floor}">${floor}층</button>
    `).join("");

    // The bar's default grid is fixed at 3 columns (matches the common case
    // and is shared with the baseball grade-filter's own use of this class),
    // so a 4th floor pill wraps onto a lonely second row. Widen to 4 columns
    // only for the specific case of exactly 4 floors — 1–3 already fit fine
    // as-is, and 5+ isn't a real venue shape we need to design for yet.
    container.classList.toggle("floor-count-4", floors.length === 4);

    // Default to 1층 whenever it exists, instead of making the user tap a
    // floor before seeing anything — falls back to whichever floor sorts
    // first if this venue doesn't have a 1층 at all.
    const defaultFloor = floors.includes(1) ? 1 : floors[0];
    this.selectVenueFloor(defaultFloor, { isInitial: true });

    // 층별로 시야 사진이 등록된 좌석 수를 탭에 표시. 개수가 0인 층은
    // 괄호 자체를 생략해 눈에 띄지 않게 한다.
    this.loadVenueFloorPhotoCounts();
  }

  // 대형 공연장은 한 층에 좌석이 1000개 넘게 있어서, 좌석 id를 전부
  // .in()에 나열하던 예전 방식은 URL 길이 초과 위험과 불필요한 트래픽
  // 낭비가 있었다. get_venue_floor_photo_counts RPC(DB 안에서 JOIN+COUNT)
  // 한 번 호출로 모든 층의 카운트를 가볍게 받아온다. 차단된(is_blocked)
  // 리뷰는 DB 함수 쪽에서 이미 제외된다.
  async loadVenueFloorPhotoCounts() {
    if (!supabaseClient || !state.selectedVenue) return;
    try {
      const { data: counts, error } = await supabaseClient
        .rpc('get_venue_floor_photo_counts', { p_venue_id: state.selectedVenue.id });
      if (error) throw error;
      (counts || []).forEach(row => {
        if (!row.seat_count) return;
        const btn = document.querySelector(`#venue-floor-filter-bar .grade-pill[data-floor="${row.floor}"]`);
        if (btn) btn.textContent = `${row.floor}층 (${row.seat_count})`;
      });
    } catch (e) {
      console.warn("층별 시야사진 개수 로딩 실패:", e);
    }
  }

  // pushHistory=false is used when restoring a floor from a back-navigation
  // (browser popstate or the header "<" button) so restoring doesn't itself
  // push a new entry. isInitial=true is used only for the very first
  // auto-selected floor on entering a venue — it replaces the venue-detail
  // history entry (adding venueFloor to it) instead of pushing a new one,
  // so the FIRST back-press out of a floor tab lands on that base entry
  // rather than leaving the venue outright.
  selectVenueFloor(floor, { pushHistory = true, isInitial = false } = {}) {
    const previousFloor = state.selectedVenueFloor;
    state.selectedVenueFloor = floor;
    document.querySelectorAll("#venue-floor-filter-bar .grade-pill").forEach(btn => {
      btn.classList.toggle("active", Number(btn.dataset.floor) === Number(floor));
    });
    this.updateVenueStepVisibility();
    this.renderVenueFloorGrid(floor);

    if (!pushHistory) return;

    if (isInitial) {
      history.replaceState({ view: "venue-detail", venueFloor: floor }, "", "#venue-detail");
    } else {
      if (previousFloor !== null && previousFloor !== undefined && previousFloor !== floor) {
        (state.venueFloorHistory = state.venueFloorHistory || []).push(previousFloor);
      }
      history.pushState({ view: "venue-detail", venueFloor: floor }, "", "#venue-detail");
    }
  }

  // Replaces the old STEP2(구역 선택)/STEP3(좌석 선택) pair — picking a
  // floor renders every zone on it at once, each positioned with
  // block.offset_x/offset_y (where that zone starts within the floor's
  // shared coordinate space) + seat.grid_x/grid_y (the seat's position
  // within its own zone, unchanged from how it's always been entered).
  // General layout rules for offset_x/offset_y (any venue, not just one —
  // see docs/musical-floor-grid-offsets.md for the full writeup admins
  // should follow when entering a new venue's block offsets):
  //  - Every block reserves 2 rows above its own first seat row: one row
  //    for its A/B/C... label, one blank row so the label doesn't sit
  //    flush against the seats under it (LABEL_ROW / SEAT_ROW_START below).
  //  - Two blocks stacked at different offset_y (e.g. OP above B) need at
  //    least 1 further blank row between one block's last seat row and the
  //    next block's label — pick offset_y values with that gap included.
  async renderVenueFloorGrid(floor) {
    const wrapper = document.getElementById("venue-floor-grid-wrapper");
    const container = document.getElementById("venue-floor-grid-container");
    if (!wrapper || !container || !state.selectedVenue) return;

    // Two overlapping calls (e.g. the page's initial auto-selected floor
    // still mid-fetch when the user immediately taps a different floor
    // tab) used to both render into the same container — the only
    // container.innerHTML="" happens before the async seat fetch below,
    // so whichever call's fetch resolved *second* just appended its seats
    // on top of the first call's instead of replacing them, leaving both
    // floors' seats visually overlapping. A generation token makes a
    // stale in-flight call's late resolution a no-op instead.
    const myGen = (this._floorGridRenderGen = (this._floorGridRenderGen || 0) + 1);
    const isStale = () => myGen !== this._floorGridRenderGen;

    container.innerHTML = "";
    container.style.gridTemplateColumns = "";
    container.style.gridTemplateRows = "";

    // A block's own label and its real seats (grid_y=1) both sit 1 row
    // after its offset_y baseline — flush, no gap between them (a blank
    // buffer row was tried here and looked too spaced out).
    const LABEL_ROW = 1;
    const SEAT_ROW_START = 1;
    const showEmptyState = () => {
      container.innerHTML = `
        <div style="padding: 40px 16px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
          🎭 해당 층은 현재 좌석 배치 정보 준비 중입니다.
        </div>
      `;
    };

    const blocks = (state.selectedVenue.blocks || []).filter(b => Number(b.floor) === Number(floor));
    if (blocks.length === 0 || !supabaseClient) {
      showEmptyState();
      return;
    }

    try {
      const blockIds = blocks.map(b => b.id);
      // A whole floor's combined seat count can pass Supabase's default
      // 1000-row response cap (this venue's 1층 alone is 1103) — a single
      // .select() would silently come back truncated with no error, so
      // page through with .range() until a page comes back short.
      const seats = [];
      const PAGE_SIZE = 1000;
      for (let page = 0; ; page++) {
        const { data: pageRows, error } = await supabaseClient
          .from('musical_seats')
          .select('*')
          .in('block_id', blockIds)
          .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
        if (error) throw error;
        seats.push(...(pageRows || []));
        if (!pageRows || pageRows.length < PAGE_SIZE) break;
        if (isStale()) return;
      }
      if (isStale()) return;

      if (!seats || seats.length === 0) {
        showEmptyState();
        return;
      }

      const seatIds = seats.map(s => s.id);
      // 별점 평균에 따른 색상 구분은 아직 데이터가 거의 없어서(예전 리뷰는
      // 전부 rating=null) 잠정적으로 꺼둔다 — 지금 켜면 사진이 있는 좌석도
      // 죄다 무색으로 보여서 오히려 "사진 없음"과 구분이 안 되는 역효과가
      // 난다. ratingColorClass()와 CSS의 rating-* 클래스는 그대로 남겨뒀으니
      // 별점 데이터가 충분히 쌓이면 이 블록만 되돌리면 된다(과거 버전:
      // git 이력 참고). 지금은 예전처럼 "사진 유무"만 표시.
      const seatsWithPhotos = new Set();
      // 공식 홈페이지 등에서 가져온 사진만 있는 좌석은 따로 모아서 회색으로
      // 구분 표시한다(실제 관람 시야와 안 헷갈리게) — 같은 좌석에 실제
      // 관람객 리뷰도 있으면 seatsWithPhotos(파란색)가 우선한다.
      const seatsWithOfficialPhotos = new Set();
      if (seatIds.length > 0) {
        const { data: reviews } = await supabaseClient
          .from('musical_seat_reviews')
          .select('musical_seat_id, image_urls, user_id')
          .eq('is_blocked', false)
          .in('musical_seat_id', seatIds);
        if (isStale()) return;
        (reviews || []).forEach(rev => {
          if (!Array.isArray(rev.image_urls) || rev.image_urls.length === 0) return;
          if (rev.user_id === OFFICIAL_SOURCE_USER_ID) {
            seatsWithOfficialPhotos.add(rev.musical_seat_id);
          } else {
            seatsWithPhotos.add(rev.musical_seat_id);
          }
        });
      }

      // A stale call could have been about to append here right as a newer
      // one already rendered — clear defensively right before this call's
      // own DOM writes, not just up top before the fetch.
      if (isStale()) return;
      container.innerHTML = "";

      const seatsByBlock = {};
      seats.forEach(s => {
        if (!seatsByBlock[s.block_id]) seatsByBlock[s.block_id] = [];
        seatsByBlock[s.block_id].push(s);
      });

      // Blank columns reserved on both edges so the scroll-fade mask (see
      // .venue-floor-grid-scroll) fades into genuine empty space instead of
      // dimming/clipping the leftmost or rightmost real seats — the fade
      // has no way to know it's already at the end of the content.
      const SIDE_MARGIN = 2;

      let maxCol = 0, maxRow = 0;
      blocks.forEach(b => {
        maxCol = Math.max(maxCol, (b.offset_x || 0) + (b.max_seats || 0));
        maxRow = Math.max(maxRow, (b.offset_y || 0) + (b.total_rows || 0) + SEAT_ROW_START);
      });
      if (maxCol === 0 || maxRow === 0) {
        showEmptyState();
        return;
      }
      maxCol += SIDE_MARGIN * 2;

      container.style.gridTemplateColumns = `repeat(${maxCol}, 26px)`;
      container.style.gridTemplateRows = `repeat(${maxRow}, 26px)`;

      blocks.forEach(b => {
        // Blocks with no real on-site zone lettering (single-zone venues)
        // are meant to have block_code left blank in admin instead of
        // carrying a made-up code — nothing to label here in that case.
        if (b.block_code && String(b.block_code).trim()) {
          const label = document.createElement("div");
          label.className = "floor-grid-block-label";
          label.textContent = b.block_code;
          label.style.gridColumn = `${(b.offset_x || 0) + SIDE_MARGIN + 1} / span ${b.max_seats || 1}`;
          // Was always row 1 — fine when every block starts at the same
          // offset_y, but a block set further back (e.g. B behind OP here)
          // still had its own label pinned to the very top, overlapping
          // whatever else was up there. Anchor it one row above wherever
          // THIS block's own first seat row actually lands instead.
          label.style.gridRow = String((b.offset_y || 0) + LABEL_ROW);
          container.appendChild(label);
        }

        (seatsByBlock[b.id] || []).forEach(seat => {
          const isWalkway = (seat.status == 3 || seat.status === "3" || seat.status === "WALKWAY");
          if (isWalkway) return; // no element at all — the grid cell just stays blank

          const seatBtn = document.createElement("button");
          seatBtn.className = "floor-grid-seat";
          const hasSeatNum = seat.seat_num !== null && seat.seat_num !== undefined && seat.seat_num !== "";
          seatBtn.textContent = hasSeatNum ? seat.seat_num : "";
          if (seatsWithPhotos.has(seat.id)) seatBtn.classList.add("has-camera");
          else if (seatsWithOfficialPhotos.has(seat.id)) seatBtn.classList.add("has-camera-official");
          if (seat.is_disabled_seat) {
            seatBtn.classList.add("is-disabled-seat");
            // No seat number to show for this cell — the icon would sit as
            // a tiny corner badge on an otherwise blank cell, easy to miss.
            // Make it the cell's whole visible content instead.
            if (!hasSeatNum) seatBtn.classList.add("no-seat-num");
          }
          // Zigzag rows — "half" is legacy data predating the half_right/
          // half_left split, treated the same as half_right.
          if (seat.offset_type === "half_right" || seat.offset_type === "half") {
            seatBtn.classList.add("offset-right");
          } else if (seat.offset_type === "half_left") {
            seatBtn.classList.add("offset-left");
          }
          seatBtn.style.gridColumn = String((b.offset_x || 0) + (seat.grid_x || 1) + SIDE_MARGIN);
          seatBtn.style.gridRow = String((b.offset_y || 0) + (seat.grid_y || 1) + SEAT_ROW_START);
          seatBtn.onclick = () => this.openSeatDetail(seat.id, { category: "musical" });
          container.appendChild(seatBtn);
        });

        // Row-number labels in the aisle beside this block, when set up
        // for one or both (label_position — the aisle needs to be 2
        // columns wide for this, and the label spans both, centered across
        // them, rather than sitting in one single "middle" column of a
        // 3-wide aisle). One label per distinct row (grid_y), read
        // straight off that row's own seats — nothing to show until real
        // seat data exists. 'both' is for when this block has more rows
        // than its neighbor on one side (e.g. an OP row its neighbor
        // doesn't have) — sourcing that shared aisle's labels from the
        // neighbor would leave the extra rows blank, so this block's own
        // (more complete) data covers the aisle on both sides instead.
        // Trimmed — a value pasted into the Supabase table editor can carry
        // an invisible trailing \r\n, which silently fails a strict ===
        // and just renders nothing with no error.
        const labelPos = (b.label_position || "").trim();
        const wantsLeft = labelPos === "left" || labelPos === "both";
        const wantsRight = labelPos === "right" || labelPos === "both";
        if (b.show_row_label !== false && (wantsLeft || wantsRight)) {
          const rowLabelByY = {};
          (seatsByBlock[b.id] || []).forEach(seat => {
            if (seat.row_num && rowLabelByY[seat.grid_y] === undefined) rowLabelByY[seat.grid_y] = seat.row_num;
          });
          const leftCol = (b.offset_x || 0) + SIDE_MARGIN - 1;
          const rightCol = (b.offset_x || 0) + (b.max_seats || 0) + SIDE_MARGIN + 1;
          Object.keys(rowLabelByY).forEach(gridY => {
            const row = String((b.offset_y || 0) + Number(gridY) + SEAT_ROW_START);
            const cols = [];
            if (wantsLeft) cols.push(leftCol);
            if (wantsRight) cols.push(rightCol);
            cols.forEach(col => {
              const rowLabelEl = document.createElement("div");
              rowLabelEl.className = "floor-grid-row-label";
              // musical_seats.row_num was entered inconsistently across
              // venues — some rows already have "열" typed in, some are a
              // bare number. Only append it to a plain number so a venue
              // that already has "1열" doesn't end up as "1열열".
              const rawRowLabel = String(rowLabelByY[gridY]);
              rowLabelEl.textContent = /^\d+$/.test(rawRowLabel) ? `${rawRowLabel}열` : rawRowLabel;
              rowLabelEl.style.gridColumn = `${col} / span 2`;
              rowLabelEl.style.gridRow = row;
              container.appendChild(rowLabelEl);
            });
          });
        }
      });

      // Combined floor is usually much wider than the viewport — start
      // centered instead of pinned to the left edge.
      const scrollHost = wrapper.querySelector(".venue-floor-grid-scroll");
      if (scrollHost) {
        requestAnimationFrame(() => {
          scrollHost.scrollLeft = (scrollHost.scrollWidth - scrollHost.clientWidth) / 2;
        });
      }
    } catch (e) {
      console.error("공연장 통합 좌석 로딩 에러:", e);
    }
  }

  switchVenueDetailTab(tabName) {
    document.querySelectorAll("#view-venue-detail .detail-tabs .tab-btn").forEach(btn => btn.classList.remove("active"));
    const clickedBtn = document.querySelector(`#view-venue-detail .detail-tabs .tab-btn[onclick*="${tabName}"]`);
    if (clickedBtn) clickedBtn.classList.add("active");

    document.getElementById("venue-tab-content-map").classList.remove("active");
    document.getElementById("venue-tab-content-info").classList.remove("active");
    document.getElementById(`venue-tab-content-${tabName}`).classList.add("active");
  }

  toggleVenueMapCollapse() {
    const wrapper = document.getElementById("venue-static-map-wrapper");
    const btn = document.getElementById("venue-map-collapse-btn");
    if (!wrapper || !btn) return;
    const isCollapsed = wrapper.classList.toggle("collapsed");
    if (isCollapsed) {
      btn.classList.remove("expanded");
      btn.querySelector("span").textContent = "🗺️ 좌석 이미지 펼치기";
    } else {
      btn.classList.add("expanded");
      btn.querySelector("span").textContent = "🗺️ 좌석 이미지 접기";
    }
  }

  // --- Stadium Detail View ---
  async loadStadiumDetail(stadiumId) {
    const stadium = STADIUMS_DB.find(st => st.id === stadiumId);
    if (!stadium) return;
    if (stadium.status === "preparing") {
      this.showItemPreparing(stadium.name);
      return;
    }

    state.selectedStadium = stadium;
    state.selectedZone = null;
    state.selectedBlock = null;

    // Reset Amenities
    Object.keys(state.activeAmenities).forEach(key => {
      state.activeAmenities[key] = false;
    });
    document.querySelectorAll(".amenity-pill").forEach(pill => pill.classList.remove("active"));

    // Populate Headers
    const nameEl = document.getElementById("detail-stadium-name");
    if (nameEl) nameEl.textContent = stadium.name;

    document.getElementById("detail-stadium-team").textContent = stadium.team;
    document.getElementById("detail-stadium-fullname").textContent = stadium.fullname;
    document.getElementById("detail-stadium-loc").textContent = stadium.location;
    
    // Set banner image
    const bannerOverlay = document.querySelector("#detail-stadium-banner .profile-overlay");
    if (bannerOverlay) {
      bannerOverlay.style.backgroundImage = `url('${stadium.bg}')`;
    }

    // Fetch blocks dynamically from Supabase
    let hasBlocks = false;
    if (supabaseClient) {
      try {
        const reverseIdMap = {
          "jamsil": 1,
          "gocheok": 2,
          "incheon": 3,
          "suwon": 4,
          "daejeon": 5,
          "daegu": 6,
          "gwangju": 7,
          "changwon": 8,
          "busan": 9
        };
        const dbId = reverseIdMap[stadiumId];
        if (dbId) {
          const { data: blocks, error } = await supabaseClient
            .from('baseball_blocks')
            .select('*')
            .eq('stadium_id', dbId)
            .eq('is_visible', true);

          if (!error && blocks && blocks.length > 0) {
            hasBlocks = true;
            const getEngGrade = (sg) => {
              if (!sg) return "navy";
              if (sg.includes("프리미엄")) return "premium";
              if (sg.includes("테이블")) return "table";
              if (sg.includes("익사이팅")) return "exciting";
              if (sg.includes("블루")) return "blue";
              if (sg.includes("오렌지")) return "orange";
              if (sg.includes("레드")) return "red";
              if (sg.includes("네이비")) return "navy";
              if (sg.includes("외야응원") || sg.includes("외야 응원")) return "outfield_cheer";
              if (sg.includes("외야") || sg.includes("그린")) return "green";
              if (sg.includes("휠체어")) return "wheelchair";
              if (sg.includes("버건디")) return "burgundy";
              if (sg.includes("다이아몬드") || sg.includes("로얄")) return "premium";
              if (sg.includes("스카이블루")) return "skyblue";
              return "navy";
            };

            stadium.blocks = blocks.map(b => {
              let engGrade = getEngGrade(b.seat_grade);
              return {
                id: String(b.id), // Match JAMSIL_MAP_MAPPING database ID format
                db_id: b.id,
                block_code: b.block_code,
                name: b.full_name || `${b.block_code}블록`,
                grade: engGrade,
                category: b.seat_grade,
                color_code: b.color_code,
                total_rows: b.total_rows,
                max_seats: b.max_seats,
                location_type: b.location_type
              };
            });
            console.log(`Loaded ${blocks.length} blocks from Supabase for ${stadiumId}.`);
          }
        }
      } catch (e) {
        console.error("Supabase blocks fetch failed, falling back to local:", e);
      }
    }

    // 구역 데이터가 정의되지 않은 구장은 상세화면 이동을 차단하고 팝업 노출
    if (!hasBlocks) {
      const modalTitle = document.getElementById("coming-soon-title");
      if (modalTitle) {
        modalTitle.textContent = `${stadium.name} 준비 중`;
      }
      this.openModal("modal-coming-soon");
      return;
    }

    // Render grade filter pills dynamically based on loaded blocks
    this.renderGradeFilterBar(stadium.blocks);

    // Load static stadium map image — collapsed by default every time a
    // stadium's detail screen loads, not just on the very first page load.
    // jamsil keeps its historical hardcoded fallback (real map, just not in
    // the DB yet); everyone else gets no silent fallback to the decorative
    // bg photo — that's a stadium exterior/crowd shot, not a seat chart,
    // and showing it under a "좌석 이미지" toggle as if it were one is
    // actively misleading. Hide the whole toggle instead.
    const mapWrapper = document.getElementById("stadium-static-map-wrapper");
    const mapCollapseBtn = document.getElementById("map-collapse-btn");
    const mapGuideCard = mapCollapseBtn ? mapCollapseBtn.closest(".map-guide-card") : null;
    const effectiveMapSrc = stadium.map_image_url || (stadiumId === "jamsil" ? "/stadiums/stadium_01.png" : null);
    if (mapGuideCard) mapGuideCard.style.display = effectiveMapSrc ? "" : "none";
    if (mapWrapper && effectiveMapSrc) {
      mapWrapper.innerHTML = `<img id="stadium-static-map-img" src="${this.escapeHtml(effectiveMapSrc)}" class="stadium-static-map" alt="구장 전체 안내도">`;
      mapWrapper.classList.add("collapsed");
    }
    if (mapCollapseBtn) {
      mapCollapseBtn.classList.remove("expanded");
      const label = mapCollapseBtn.querySelector("span");
      if (label) label.textContent = "🗺️ 좌석 이미지 펼치기";
    }

    // Set title on header
    const titleEl = document.getElementById("header-title");
    if (titleEl) {
      titleEl.textContent = stadium.name;
    }

    // Make sure map and seats containers are displayed
    const overallMap = document.getElementById("stadium-overall-map-view");
    if (overallMap) overallMap.style.display = "block";
    const seatsSec = document.getElementById("block-seats-section");
    if (seatsSec) seatsSec.style.display = "block";

    // Switch default tab
    this.switchDetailTab("map");

    // Clear previous choices. Grade filter/pills/STEP2 are NOT reset here —
    // renderGradeFilterBar() above already rebuilds the pill bar from
    // scratch and (when there's a default grade) auto-selects + populates
    // STEP2 itself; resetting it again right after would just immediately
    // undo that.
    state.selectedBlock = null;

    // Reset map dimming (all bright initially)
    const sectors = document.querySelectorAll(".stadium-sector");
    sectors.forEach(p => {
      p.classList.remove("dimmed");
      p.classList.remove("active-sector");
      p.style.opacity = "1";
      p.style.stroke = "none";
      p.style.fillOpacity = "0.5";
    });

    this.updateStepVisibility();

    // Set info tab content from DB values
    const foodEl = document.getElementById("info-food");
    const parkingEl = document.getElementById("info-parking");
    const sunlightEl = document.getElementById("info-sunlight");
    
    if (foodEl) foodEl.innerHTML = this.formatInfoText(stadium.food_info) || "등록된 맛집 정보가 없습니다.";
    if (parkingEl) parkingEl.innerHTML = this.formatInfoText(stadium.parking_info) || "등록된 주차 정보가 없습니다.";
    if (sunlightEl) sunlightEl.innerHTML = this.formatInfoText(stadium.sunlight_info) || "등록된 햇빛 정보가 없습니다.";

    // Navigate to Detail view
    this.navigateTo("stadium-detail");
  }

  // Dynamically render seat grade filter pills based on block categories
  renderGradeFilterBar(blocks) {
    const bar = document.getElementById("grade-filter-bar");
    if (!bar) return;
    bar.innerHTML = "";
    // Reset here (not left to a stale value from whatever stadium/grade was
    // last viewed) since auto-select is now conditional and may not fire.
    state.selectedGradeFilter = null;

    if (!blocks || blocks.length === 0) {
      bar.innerHTML = `<div style="padding: 12px; color: var(--text-muted); font-size: 0.85rem; text-align: center; width: 100%;">등록된 좌석 등급이 없습니다.</div>`;
      return;
    }

    const uniqueCategories = [];
    const blockColors = {};

    blocks.forEach(b => {
      const cat = b.category || "기타";
      if (!uniqueCategories.includes(cat)) {
        uniqueCategories.push(cat);
      }
      if (b.color_code) {
        blockColors[cat] = b.color_code;
      }
    });

    // No explicit display_order exists for block categories, so fall back to
    // 가나다순 (consistent with the rest of the app's ordering rule).
    uniqueCategories.sort((a, b) => a.localeCompare(b, "ko"));

    uniqueCategories.forEach((cat, idx) => {
      const gradeColors = {
        "프리미엄석": "#DAA520",
        "테이블석": "#8B0000",
        "블루석": "#1E90FF",
        "오렌지석": "#FF8C00",
        "레드석": "#E60012",
        "네이비석": "#1B365D",
        "외야 그린석": "#2E8B57",
        "외야 응원석": "#2E8B57",
        "익사이팅존": "#1B365D"
      };
      const color = gradeColors[cat] || blockColors[cat] || "#64748b";

      const btn = document.createElement("button");
      btn.className = "grade-pill";
      btn.setAttribute("data-grade", cat);
      btn.style.borderLeft = `3px solid ${color}`;
      btn.textContent = cat;

      // Only auto-select when there's exactly one real choice.
      if (idx === 0 && uniqueCategories.length === 1) {
        btn.classList.add("active");
        state.selectedGradeFilter = cat;
      }

      btn.onclick = () => this.filterMapByGrade(cat);
      bar.appendChild(btn);
    });

    const blockContainer = document.getElementById("block-selector-container");
    if (state.selectedGradeFilter) {
      this.renderBlockSelector(state.selectedGradeFilter);
    } else if (blockContainer) {
      blockContainer.innerHTML = `<div style="padding: 16px; color: var(--text-muted); font-size: 0.85rem; text-align: center; width: 100%;">좌석등급을 선택해 주세요.</div>`;
    }
    this.updateStepVisibility();
  }

  // Inject beautiful customizable SVG for Seating layout
  injectStadiumMap(stadiumId, detailedZoneName = null) {
    const containerId = detailedZoneName ? "detailed-block-svg-container" : "stadium-map-container";
    const container = document.getElementById(containerId);
    if (!container) return;
    container.style.aspectRatio = stadiumId === "jamsil" ? "963 / 1164" : "";

    const is3B = detailedZoneName === "3루 내야/응원석";
    const is1B = detailedZoneName === "1루 내야/응원석";
    const isOutfield = detailedZoneName === "외야석";
    const hasFilter = detailedZoneName !== null;

    // Reset grade filter view state on reload of Overall map. Scoped to
    // #view-stadium-detail — .grade-pill is shared with venue-detail's
    // floor pills, and an unscoped query here would silently clear the
    // active state on whichever floor a musical venue had selected.
    state.selectedGradeFilter = "all";
    document.querySelectorAll("#view-stadium-detail .grade-pill").forEach(p => p.classList.remove("active"));
    const allPill = Array.from(document.querySelectorAll("#view-stadium-detail .grade-pill")).find(p => p.textContent.includes("전체"));
    if (allPill) allPill.classList.add("active");

    const stadiumObj = state.selectedStadium;
    const hasDbMap = stadiumObj && stadiumObj.map_image_url;

    if (stadiumId === "jamsil" || hasDbMap) {
      let mapContent = "";
      if (stadiumId !== "jamsil" && hasDbMap) {
        // Render dynamic flat PNG stadium map image
        mapContent = `
          <div class="flat-map-container" style="position: relative; width: 100%; text-align: center; padding: 8px 0;">
            <img src="${stadiumObj.map_image_url}" style="width: 100%; max-width: 480px; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: var(--shadow-md);">
          </div>
        `;
      } else {
        // Fallback to Jamsil interactive SVG map
        mapContent = `
          <div id="image-map-pro-653" class="imp-initialized" data-image-map-id="653" data-image-map-name="JAMSIL">
            <div class="imp-container imp-ui-light">
              <div class="imp-ui-wrap">
                <div class="imp-ui"></div>
                <div class="imp-canvas-wrap">
                  <div class="imp-canvas">
                    <div class="imp-translate">
                      <div class="imp-scale">
                        <img src="https://myseatcheck.com/wp-content/uploads/2024/06/완성세로-1.jpg" class="imp-image">
                        <div class="imp-objects">
                          ${JAMSIL_SVG_HTML}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div id="amenities-marker-wrapper" style="position: absolute; inset: 0; pointer-events: none; margin: 16px;"></div>
        `;
      }
      container.innerHTML = mapContent;

      const stadium = STADIUMS_DB.find(st => st.id === stadiumId);

      // Find allowed blocks if filtering by zone
      let allowedBlocks = null;
      if (detailedZoneName) {
        allowedBlocks = new Set(this.getBlocksForZone(stadium, detailedZoneName).map(b => b.id));
      }

      // Bind events and classes to the imported SVG objects
      const elements = container.querySelectorAll('.imp-object');
      elements.forEach(el => {
        const polyId = el.getAttribute('data-object-id');
        const blockId = JAMSIL_MAP_MAPPING[polyId];
        if (blockId) {
          el.setAttribute('data-block-id', blockId);
          const block = stadium.blocks.find(b => b.id === blockId);
          if (block) {
            el.setAttribute('data-grade', block.grade);
          }

          // Apply zone filter if provided
          if (allowedBlocks && !allowedBlocks.has(blockId)) {
            el.style.opacity = "0.05";
            el.style.pointerEvents = "none";
          } else {
            el.classList.add('stadium-sector');
            // Add click listener
            el.addEventListener('click', () => {
              this.selectStadiumBlock(blockId);
            });
            // Add hover class
            el.addEventListener('mouseenter', () => {
              if (block && block.color_code) {
                el.style.setProperty('--hover-fill', `${block.color_code}66`);
                el.style.setProperty('--hover-stroke', block.color_code);
                el.style.setProperty('--hover-stroke-width', '2px');
              } else {
                el.style.removeProperty('--hover-fill');
                el.style.removeProperty('--hover-stroke');
                el.style.removeProperty('--hover-stroke-width');
              }
              el.classList.add('imp-object-highlighted');
            });
            el.addEventListener('mouseleave', () => {
              el.classList.remove('imp-object-highlighted');
            });
          }
        }
      });
    } else {
      // General fall-back SVG
      container.innerHTML = `
        <svg viewBox="0 0 400 300" width="100%" height="100%">
          <path d="M 80 130 A 150 150 0 0 1 320 130 L 200 250 Z" fill="#132c1c" stroke="#1e3a27" stroke-width="2" />
          <path d="M 140 190 L 200 130 L 260 190 L 200 250 Z" fill="#5c4033" opacity="0.6"/>
          <circle cx="200" cy="190" r="8" fill="#a0785a" />
          <path d="M 230 250 A 45 45 0 0 0 330 210 L 375 235 A 140 140 0 0 1 265 300 Z" class="stadium-sector" data-grade="red" onclick="app.selectStadiumBlock('b_prem')" fill="#dc2626" />
          <text x="290" y="260" fill="white" font-size="8" font-weight="bold" pointer-events="none">내야지정석</text>
          <path d="M 170 250 A 45 45 0 0 1 70 210 L 25 235 A 140 140 0 0 0 135 300 Z" class="stadium-sector" data-grade="blue" onclick="app.selectStadiumBlock('b_blue')" fill="#2563eb" />
          <text x="75" y="260" fill="white" font-size="8" font-weight="bold" pointer-events="none">내야지정석</text>
        </svg>
        <div id="amenities-marker-wrapper" style="position: absolute; inset: 0; pointer-events: none; margin: 16px;"></div>
      `;
    }
  }

  // Filter map sectors by clicked grade
  filterMapByGrade(gradeName, shouldScroll = true) {
    // 1. Update active class on filter pills — scoped to #view-stadium-detail
    // for the same reason as injectStadiumMap() above.
    document.querySelectorAll("#view-stadium-detail .grade-pill").forEach(pill => {
      pill.classList.remove("active");
    });

    // Find clicked pill by data-grade attribute
    const clickedPill = document.querySelector(`#view-stadium-detail .grade-pill[data-grade="${gradeName}"]`);
    if (clickedPill) {
      clickedPill.classList.add("active");
    }

    state.selectedGradeFilter = gradeName;
    state.selectedBlock = null; // Clear selected block when changing grade filter

    // Auto-select block if there is only 1 block for the grade
    if (state.selectedStadium && state.selectedStadium.blocks) {
      const blocks = state.selectedStadium.blocks;
      const filteredBlocks = gradeName === "all" ? blocks : blocks.filter(b => b.category === gradeName);
      if (filteredBlocks.length === 1) {
        this.renderBlockSelector(gradeName);
        this.selectStadiumBlock(filteredBlocks[0].id);
        this.showToast("🔍", `${gradeName} (단일 구역 자동 선택) 필터가 적용되었습니다.`);
        return;
      }
    }

    this.renderBlockSelector(gradeName);
    this.updateStepVisibility();

    // Smooth scroll to STEP 2
    if (shouldScroll) {
      const step2 = document.querySelector(".step-card.block-selector-wrapper");
      if (step2) {
        setTimeout(() => {
          step2.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    }

    this.showToast("🔍", `${gradeName} 필터가 적용되었습니다.`);
  }

  updateStepVisibility() {
    const step2 = document.getElementById("stadium-block-selector-wrapper");
    const step3 = document.getElementById("block-seats-section");

    if (step2) {
      if (state.selectedGradeFilter) {
        step2.classList.remove("disabled-step");
      } else {
        step2.classList.add("disabled-step");
      }
    }

    if (step3) {
      if (state.selectedBlock) {
        step3.classList.remove("disabled-step");
      } else {
        step3.classList.add("disabled-step");
      }
    }
  }

  // Musical equivalent of updateStepVisibility() — separate element id
  // since venue-detail and stadium-detail reuse the same step-card classes.
  // Only one card left (the floor grid itself) now that STEP2/3 are gone.
  updateVenueStepVisibility() {
    const step3 = document.getElementById("venue-block-seats-section");
    if (step3) {
      step3.classList.toggle("disabled-step", !state.selectedVenueFloor);
    }
  }

  // --- Amenities Toggling & Drawing Markers ---
  toggleAmenity(type) {
    state.activeAmenities[type] = !state.activeAmenities[type];

    // Toggle button active styling
    const btn = document.querySelector(`.amenity-pill[data-amenity="${type}"]`);
    if (btn) {
      if (state.activeAmenities[type]) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    }

    this.renderAmenityMarkers();
  }

  renderAmenityMarkers() {
    const wrapper = document.getElementById("amenities-marker-wrapper");
    if (!wrapper || !state.selectedStadium) return;

    // Clear old markers for this type
    // In order to animate nicely, we rebuild all active ones
    wrapper.innerHTML = "";

    const activeTypes = Object.keys(state.activeAmenities).filter(key => state.activeAmenities[key]);
    
    // Icon mapping
    const iconMap = {
      toilet: "smile",
      snack: "utensils",
      exit: "log-out",
      medical: "activity"
    };

    activeTypes.forEach(type => {
      const locations = state.selectedStadium.amenities[type] || [];
      locations.forEach(loc => {
        const marker = document.createElement("div");
        marker.className = `amenity-marker ${type} visible`;
        marker.style.left = `${loc.x}%`;
        marker.style.top = `${loc.y}%`;
        marker.innerHTML = `<i data-lucide="${iconMap[type]}" style="width: 13px; height: 13px;"></i>`;
        
        // Add name tooltip simulation (optional, just simple styling)
        marker.title = loc.name;

        wrapper.appendChild(marker);
      });
    });
    lucide.createIcons();
  }

  // --- Seating Grid Selection ---
  // --- Seating Grid Selection ---
  selectStadiumZone(zoneName) {
    state.selectedZone = zoneName;

    // Toggle screen views (Depth 3 -> Depth 4)
    document.getElementById("stadium-overall-map-view").style.display = "none";
    document.getElementById("stadium-detailed-blocks-view").style.display = "block";
    document.getElementById("block-seats-section").style.display = "none";
    const tabMapContainer = document.getElementById("tab-content-map");
    if (tabMapContainer) tabMapContainer.classList.remove("detailed-active");

    // Set header title
    const titleEl = document.getElementById("header-title");
    if (titleEl && state.selectedStadium) {
      titleEl.textContent = `${state.selectedStadium.name} - ${zoneName}`;
    }

    // Inject detailed block SVG map in-place!
    this.injectStadiumMap(state.selectedStadium.id, zoneName);

    // Render detailed blocks list
    this.renderDetailedBlocks(zoneName);

    // Scroll to top of the view content
    const appContent = document.getElementById("app-content");
    if (appContent) appContent.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  getBlocksForZone(stadium, zoneName) {
    if (zoneName === "전체") {
      return stadium.blocks;
    }
    if (zoneName.includes("1루")) {
      return stadium.blocks.filter(b => b.name.includes("1루") || b.name.includes("버건디") || b.name.includes("지니") || b.name.includes("블루존") || b.id.includes("101") || b.id.includes("102") || b.id.includes("103") || b.id.includes("105"));
    } else if (zoneName.includes("3루")) {
      return stadium.blocks.filter(b => b.name.includes("3루") || b.name.includes("다크버건디") || b.id.includes("117") || b.id.includes("118") || b.id.includes("119") || b.id.includes("120") || b.id.includes("121") || b.id.includes("122") || b.id.includes("223") || b.id.includes("224") || b.id.includes("225") || b.id.includes("226"));
    } else {
      return stadium.blocks.filter(b => b.name.includes("외야") || b.name.includes("프리미엄") || b.name.includes("다이아몬드") || b.name.includes("테이블") || b.id.includes("301") || b.name.includes("피크닉"));
    }
  }

  renderDetailedBlocks(zoneName) {
    const container = document.getElementById("detailed-block-map-container");
    if (!container || !state.selectedStadium) return;

    let blocks = this.getBlocksForZone(state.selectedStadium, zoneName);
    
    // Filter blocks by selected grade filter if active
    if (state.selectedGradeFilter && state.selectedGradeFilter !== "all") {
      blocks = blocks.filter(b => b.category === state.selectedGradeFilter);
    }

    const isCheerZone = zoneName.includes("응원") || blocks.some(b => b.category === "응원");

    container.innerHTML = `
      <div class="detailed-zone-header">
        <span class="zone-badge">${zoneName}</span>
        <h3>구역 상세 선택</h3>
      </div>

      ${isCheerZone ? `
        <div class="cheer-stage-banner">
          <div class="stage-light"></div>
          <div class="stage-content">
            <i data-lucide="megaphone" class="stage-icon"></i>
            <div>
              <div class="stage-title">📣 열정 응원단상 구역</div>
              <div class="stage-desc">이 구역은 열띤 응원가와 응원단장의 댄스가 바로 펼쳐지는 구역입니다!</div>
            </div>
          </div>
        </div>
      ` : `
        <div class="ground-direction-banner">
          <i data-lucide="compass" class="ground-icon"></i>
          <span>🏟️ 전방 그라운드 / 타석 방향</span>
        </div>
      `}

      <div class="blocks-grid">
        ${blocks.length > 0 ? blocks.map(b => {
          let catClass = "general";

          return `
            <div class="block-card ${catClass}" style="${b.color_code ? `--block-color: ${b.color_code};` : ''}" onclick="app.selectStadiumBlock('${b.id}')">
              <span class="block-card-category" style="${b.color_code ? `color: ${b.color_code}; background: ${b.color_code}1A;` : ''}">${b.category}</span>
              <h4 class="block-card-name">${b.name}</h4>
              <div class="block-card-action">
                <span>시야 확인</span>
                <i data-lucide="arrow-right"></i>
              </div>
            </div>
          `;
        }).join("") : `
          <div style="grid-column: 1 / -1; text-align: center; padding: 32px 16px; color: var(--text-muted); font-size: 0.85rem;">
            🔍 선택하신 등급의 좌석이 이 구역에 없습니다. <br> 다른 등급 필터를 선택해 주세요.
          </div>
        `}
      </div>
    `;

    lucide.createIcons();
  }

  renderBlockSelector(gradeFilter = "all") {
    if (!state.selectedStadium) return;
    const blocks = state.selectedStadium.blocks || [];
    const filteredBlocks = gradeFilter === "all" ? blocks : blocks.filter(b => b.category === gradeFilter);

    const groups = {};

    filteredBlocks.forEach(b => {
      let locType = b.location_type;
      if (!locType) {
        // Fallback matching logic for local mock datasets
        const name = b.name || "";
        const code = b.block_code || "";
        if (name.includes("1루") || code.startsWith("10") || code.startsWith("110") || code.startsWith("111") || code.startsWith("20") || code.startsWith("21") || code.startsWith("30") || code.startsWith("31")) {
          locType = "1루측 (HOME)";
        } else if (name.includes("3루") || code.startsWith("11") || code.startsWith("12") || code.startsWith("22") || code.startsWith("32") || code.startsWith("33")) {
          locType = "3루측 (AWAY)";
        } else {
          locType = "중앙/기타";
        }
      }

      if (!groups[locType]) {
        groups[locType] = [];
      }
      groups[locType].push(b);
    });

    const sortFunc = (a, b) => a.block_code.localeCompare(b.block_code, undefined, {numeric: true, sensitivity: 'base'});
    const groupOrder = ["1루측 (HOME)", "3루측 (AWAY)", "중앙/기타"];
    let html = "";

    const groupKeys = Object.keys(groups).sort((a, b) => {
      const getOrderScore = (name) => {
        if (name.includes("1루")) return 1;
        if (name.includes("3루")) return 2;
        if (name.includes("중앙") || name.includes("기타")) return 3;
        return 4;
      };
      return getOrderScore(a) - getOrderScore(b);
    });

    groupKeys.forEach(groupName => {
      const groupBlocks = groups[groupName];
      if (groupBlocks.length === 0) return;
      groupBlocks.sort(sortFunc);

      let groupClass = "other";
      let groupIcon = "map-pin";
      if (groupName.includes("1루") || groupName.includes("HOME")) {
        groupClass = "home";
        groupIcon = "home";
      } else if (groupName.includes("3루") || groupName.includes("AWAY")) {
        groupClass = "away";
        groupIcon = "flag";
      }

      html += `
        <div class="block-selector-group">
          <div class="block-selector-group-title ${groupClass}">
            <i data-lucide="${groupIcon}" style="width: 12px; height: 12px;"></i>
            <span>${groupName}</span>
          </div>
          <div class="block-selector-group-list ${groupBlocks.some(b => b.block_code.length > 3) ? 'has-long-labels' : ''}">
            ${groupBlocks.map(b => {
              const isActive = state.selectedBlock && state.selectedBlock.id === b.id;
              const gradeColors = {
                "프리미엄석": "#DAA520",
                "테이블석": "#8B0000",
                "블루석": "#1E90FF",
                "오렌지석": "#FF8C00",
                "레드석": "#E60012",
                "네이비석": "#1B365D",
                "외야 그린석": "#2E8B57",
                "외야 응원석": "#2E8B57",
                "익사이팅존": "#1B365D"
              };
              const pillColor = gradeColors[b.category] || b.color_code || "#64748b";
              const colorStyle = `border-left: 3.5px solid ${pillColor}; ${isActive ? `background-color: ${pillColor} !important; border-color: ${pillColor} !important; box-shadow: 0 0 8px ${pillColor}80;` : ''}`;
              return `
                <button class="block-pill-btn ${isActive ? 'active' : ''}" 
                        data-grade="${b.grade}"
                        style="${colorStyle}"
                        onclick="app.selectStadiumBlock('${b.id}')">
                  ${b.block_code}
                </button>
              `;
            }).join("")}
          </div>
        </div>
      `;
    });

    const container = document.getElementById("block-selector-container");
    if (container) {
      container.innerHTML = html || `<div style="padding: 12px; color: var(--text-muted); font-size: 0.85rem; text-align: center; width: 100%;">선택한 등급에 해당하는 구역이 없습니다.</div>`;
      lucide.createIcons();
    }
  }

  selectStadiumBlock(blockId) {
    if (blockId === "scoreboard") {
      this.showToast("ℹ️", "🏟️ 전광판 영역입니다. 경기 정보가 실시간 표기됩니다.");
      return;
    }
    if (!state.selectedStadium) return;

    const block = state.selectedStadium.blocks.find(b => b.id === blockId);
    if (!block) return;

    state.selectedBlock = block;

    // Update active grade filter to match the selected block's category
    // (scoped to #view-stadium-detail — same shared-class concern as above)
    if (block.category && block.category !== state.selectedGradeFilter) {
      state.selectedGradeFilter = block.category;
      document.querySelectorAll("#view-stadium-detail .grade-pill").forEach(pill => {
        pill.classList.remove("active");
      });
      const activePill = Array.from(document.querySelectorAll("#view-stadium-detail .grade-pill")).find(pill =>
        pill.getAttribute("data-grade") === block.category
      );
      if (activePill) {
        activePill.classList.add("active");
      }
    }

    // Refresh block selector buttons active highlight
    this.renderBlockSelector(state.selectedGradeFilter || "all");

    // Set header title (keep stadium name constant)
    const titleEl = document.getElementById("header-title");
    if (titleEl && state.selectedStadium) {
      titleEl.textContent = state.selectedStadium.name;
    }

    // Highlight matching SVG path and update dimming based on current grade filter
    const paths = document.querySelectorAll(".stadium-sector");
    paths.forEach(p => {
      const pBlockId = p.getAttribute("data-block-id");
      const matchedBlock = state.selectedStadium.blocks.find(b => String(b.id) === pBlockId);
      const matchesFilter = (state.selectedGradeFilter === "all" || (matchedBlock && matchedBlock.category === state.selectedGradeFilter));

      if (pBlockId === String(blockId)) {
        p.classList.add("active-sector");
        p.classList.remove("dimmed");
        p.style.stroke = "#ffffff";
        p.style.strokeWidth = "3.5px";
        p.style.fillOpacity = "0.9";
        p.style.opacity = "1";
      } else {
        p.classList.remove("active-sector");
        p.style.stroke = "none";
        p.style.fillOpacity = "0.5";
        if (matchesFilter) {
          p.classList.remove("dimmed");
          p.style.opacity = "1";
        } else {
          p.classList.add("dimmed");
          p.style.opacity = "0.18";
        }
      }
    });

    // Render seating grid
    document.getElementById("selected-block-badge").textContent = block.category;
    document.getElementById("selected-block-title").textContent = block.name;
    this.renderSeatingGrid(blockId);
    this.updateStepVisibility();

    // Smooth scroll to STEP 3
    const step3 = document.getElementById("block-seats-section");
    if (step3) {
      setTimeout(() => {
        step3.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }

  handleNoPhotoSeatClick(blockName, seatName) {
    if (!state.selectedStadium) return;
    const stadiumName = state.selectedStadium.name;
    this.showToast("ℹ️", `📷 [${stadiumName} - ${blockName} ${seatName}] 최초 시야 사진 등록 기능은 정식 오픈 시 지원 예정입니다. 첫 등록자가 되어 보세요!`);
  }

  async renderSeatingGrid(blockId) {
    const wrapper = document.getElementById("seat-grid-wrapper");
    const container = document.getElementById("seat-rows-container");
    if (!wrapper || !container) return;

    wrapper.style.display = "block";
    container.innerHTML = "";

    // Field/ground direction indicator, shown once above the seat rows.
    // The bar itself spans the full width of the seat grid (every block's
    // seats, not just whatever fits on screen) so it still reads as "this
    // whole strip faces the field" once scrolled past the first screenful —
    // so it stays the first child of #seat-rows-container, the same
    // intrinsically-wide element the seat rows lay out in.
    // The label needs to *look* centered in whatever's currently visible,
    // not centered in the full (e.g. 800px+) bar — CSS alone can't express
    // that (position:sticky only holds an element at a fixed edge once
    // scrolling would carry it past that edge; it can't keep an
    // already-centered-in-a-wider-box label main visible from the very
    // first, unscrolled render). So its horizontal position is recomputed
    // from wrapper's actual scroll position instead, on load and on every
    // scroll tick.
    if (state.selectedStadium) {
      const isPerformance = state.selectedStadium.category === "musical" || state.selectedStadium.id === "musical";
      const directionText = isPerformance ? "▲ 🎭 무대 (STAGE) 방면 ▲" : "▲ ⚾ 그라운드 (경기장) 방면 ▲";

      const indicator = document.createElement("div");
      indicator.className = "field-direction-indicator";
      indicator.style.width = "100%";
      indicator.style.position = "relative";
      indicator.style.background = "rgba(255, 255, 255, 0.04)";
      indicator.style.border = "1px dashed rgba(255, 255, 255, 0.15)";
      indicator.style.borderRadius = "6px";
      indicator.style.padding = "6px 8px";
      indicator.style.marginTop = "12px";
      indicator.style.marginBottom = "14px";
      indicator.style.boxSizing = "border-box";
      indicator.style.minHeight = "26px";

      const label = document.createElement("span");
      label.style.position = "absolute";
      label.style.top = "50%";
      label.style.whiteSpace = "nowrap";
      label.style.fontSize = "0.7rem";
      label.style.color = "rgba(255, 255, 255, 0.5)";
      label.style.fontWeight = "bold";
      label.style.letterSpacing = "2px";
      label.textContent = directionText;
      indicator.appendChild(label);
      container.appendChild(indicator);

      const recenterLabel = () => {
        const barWidth = indicator.clientWidth;
        const labelWidth = label.offsetWidth;
        const viewportCenter = wrapper.scrollLeft + wrapper.clientWidth / 2;
        const idealLeft = viewportCenter - labelWidth / 2 - 8; // -8 = indicator's own left padding
        const maxLeft = Math.max(0, barWidth - labelWidth - 16); // -16 = left+right padding
        const clampedLeft = Math.min(Math.max(idealLeft, 0), maxLeft);
        label.style.left = `${clampedLeft}px`;
        label.style.transform = "translateY(-50%)";
      };
      recenterLabel();
      // Each block selection re-renders this indicator from scratch — drop
      // the previous block's listener first so they don't pile up.
      if (wrapper._recenterFieldLabel) wrapper.removeEventListener("scroll", wrapper._recenterFieldLabel);
      wrapper._recenterFieldLabel = recenterLabel;
      wrapper.addEventListener("scroll", recenterLabel, { passive: true });
    }

    // Fetch and render seats from Supabase if available
    const block = state.selectedStadium ? state.selectedStadium.blocks.find(b => b.id === blockId) : null;
    if (supabaseClient && block && block.db_id) {
      try {
        const { data: seats, error } = await supabaseClient
          .from('baseball_seats')
          .select('*')
          .eq('block_id', block.db_id)
          .order('grid_y', { ascending: true })
          .order('grid_x', { ascending: true });

        if (!error) {
          const seatIds = (seats || []).map(s => s.id);
          const seatsWithPhotos = new Set();
          if (seatIds.length > 0) {
            const { data: reviews, error: revErr } = await supabaseClient
              .from('baseball_seat_reviews')
              .select('baseball_seat_id, image_urls')
              .in('baseball_seat_id', seatIds);

            if (!revErr && reviews) {
              reviews.forEach(rev => {
                const urls = Array.isArray(rev.image_urls) ? rev.image_urls : [];
                if (urls.length > 0) {
                  seatsWithPhotos.add(rev.baseball_seat_id);
                }
              });
            }
          }

          // Build rowsMap where coordinates map to seat objects: rowsMap[y][x] = seat
          const rowsMap = {};
          if (seats) {
            seats.forEach(seat => {
              const y = seat.grid_y || 1;
              const x = seat.grid_x || 1;
              if (!rowsMap[y]) {
                rowsMap[y] = {};
              }
              rowsMap[y][x] = seat;
            });
          }

          // Read grid dimensions from database blocks table fields
          const maxRows = block.total_rows || (seats && seats.length > 0 ? Math.max(...seats.map(s => s.grid_y || 1)) : 0);
          const maxCols = block.max_seats || (seats && seats.length > 0 ? Math.max(...seats.map(s => s.grid_x || 1)) : 0);

          if (maxRows === 0 || maxCols === 0) {
            container.innerHTML = `
              <div style="padding: 40px 16px; text-align: center; color: var(--text-muted); font-size: 0.85rem; background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); border-radius: 8px; width: 100%;">
                🏟️ 해당 구역은 현재 좌석 배치 정보 준비 중입니다.
              </div>
            `;
            return;
          }

          const visibleSeats = Math.min(maxCols, 14);
          container.style.setProperty('--visible-seats', visibleSeats);

          // Iterate row by row (1 to maxRows)
          for (let r = 1; r <= maxRows; r++) {
            // A row is a bare aisle spacer only when it has no seat records
            // at all, or the admin deliberately left its row label blank —
            // NOT just because every seat happens to be walkway. Some real
            // rows (e.g. a numbered row that legitimately has zero seats)
            // still need their row number shown, so the label itself is the
            // signal, not the seat statuses under it.
            const rowSeatsForAisleCheck = rowsMap[r];
            let rowLabelForAisleCheck = null;
            if (rowSeatsForAisleCheck) {
              const firstKeyForAisleCheck = Object.keys(rowSeatsForAisleCheck)[0];
              if (firstKeyForAisleCheck) rowLabelForAisleCheck = rowSeatsForAisleCheck[firstKeyForAisleCheck].row_num;
            }
            const isAisleRow = !rowSeatsForAisleCheck || rowLabelForAisleCheck === "";
            if (isAisleRow) {
              const aisleDiv = document.createElement("div");
              aisleDiv.className = "seat-row-aisle";
              container.appendChild(aisleDiv);
              continue;
            }

            const rowDiv = document.createElement("div");
            // Whole-row half-seat offset (staggered/fan-shaped sections) —
            // set once per row from whatever the seats share, rather than
            // nudging individual seats (that stacked extra flex gap onto
            // every seat instead of just shifting the row's start).
            let rowOffsetClass = "";
            if (rowsMap[r]) {
              const firstSeatKeyForOffset = Object.keys(rowsMap[r])[0];
              const rowOffsetType = firstSeatKeyForOffset ? rowsMap[r][firstSeatKeyForOffset].offset_type : null;
              if (rowOffsetType === "half_right") rowOffsetClass = " offset-right";
              else if (rowOffsetType === "half_left") rowOffsetClass = " offset-left";
            }
            rowDiv.className = `seat-row${rowOffsetClass}`;

            // Row Label: e.g. "1열", "2열"
            // If row has seat data, extract row_num, else fallback to index r
            let rowLabel = String(r);
            if (rowsMap[r]) {
              const firstSeatKey = Object.keys(rowsMap[r])[0];
              if (firstSeatKey && rowsMap[r][firstSeatKey].row_num) {
                rowLabel = rowsMap[r][firstSeatKey].row_num;
              }
            }
            const dispLabel = String(rowLabel).endsWith("열") ? rowLabel : `${rowLabel}열`;

            const label = document.createElement("span");
            label.className = "row-num";
            label.textContent = dispLabel;
            rowDiv.appendChild(label);

            const seatsDiv = document.createElement("div");
            seatsDiv.className = "row-seats";

            // Loop columns from 1 to maxCols
            for (let c = 1; c <= maxCols; c++) {
              const seat = rowsMap[r] ? rowsMap[r][c] : null;

              if (!seat) {
                // If there's no database seat at this grid coordinate, render as walkway gap
                const gapBtn = document.createElement("button");
                gapBtn.className = "seat-item gap";
                seatsDiv.appendChild(gapBtn);
              } else {
                const isWalkway = (seat.status == 3 || seat.status === "3" || seat.status === "WALKWAY");
                const isPhotoExists = seatsWithPhotos.has(seat.id);

                if (isWalkway) {
                  const gapBtn = document.createElement("button");
                  gapBtn.className = "seat-item gap";
                  seatsDiv.appendChild(gapBtn);
                } else {
                  const seatBtn = document.createElement("button");
                  seatBtn.className = "seat-item";
                  seatBtn.textContent = seat.seat_num !== null && seat.seat_num !== undefined ? seat.seat_num : "";

                  const dbKey = seat.id;
                  if (isPhotoExists) {
                    seatBtn.classList.add("has-camera");
                    
                    if (!SEAT_VIEWS_DB[dbKey]) {
                      SEAT_VIEWS_DB[dbKey] = {
                        stadiumName: state.selectedStadium.name,
                        blockName: state.selectedBlock.name,
                        seatName: this.formatSeatName({ row_num: seat.row_num || r, seat_num: seat.seat_num }, !!seat.is_disabled_seat),
                        image: "/assets/seat_view_clean.png",
                        uploader: "@anonymous",
                        uploaderBadge: "일반 등록자",
                        upvotes: 0,
                        downvotes: 0,
                        userVoted: null,
                        tags: ["✅ 일반 시야"],
                        comment: "데이터베이스에 등록된 시야 사진입니다."
                      };
                    }
                    seatBtn.onclick = () => this.openSeatDetail(dbKey);
                  } else {
                    seatBtn.onclick = () => this.openSeatDetail(dbKey);
                  }
                  seatsDiv.appendChild(seatBtn);
                }
              }
            }

            rowDiv.appendChild(seatsDiv);
            container.appendChild(rowDiv);
          }
          return;
        }
      } catch (e) {
        console.error("Supabase seats fetch failed, falling back to local layouts:", e);
      }
    }

    const isJamsil103 = ((blockId === "b103" || blockId === "7") && state.selectedStadium && state.selectedStadium.id === "jamsil");
    const isJamsil118 = ((blockId === "b118" || blockId === "21") && state.selectedStadium && state.selectedStadium.id === "jamsil");
    const isJamsil219 = ((blockId === "b219" || blockId === "44") && state.selectedStadium && state.selectedStadium.id === "jamsil");

    if (isJamsil103 || isJamsil118 || isJamsil219) {
      let layout, occupied, blocked;

      if (isJamsil103) {
        layout = {
          1: [1, 2, 3, 4, null, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
          2: [29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15],
          3: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44],
          4: [null, null, null, null, 55, 54, 53, 52, 51, 50, 49, 48, 47, 46, 45],
          5: [null, null, null, null, 56, 57, 58, 59, 60, 61, 62, null, null, null, null],
          6: [null, null, null, 70, 69, 68, 67, 66, 65, 64, 63, null, null, null, null],
          7: [null, null, null, 71, 72, 73, 74, 75, 76, 77, 78, null, null, null, null],
          8: [null, null, null, 86, 85, 84, 83, 82, 81, 80, 79, null, null, null, null],
          9: [null, null, null, 87, 88, 89, 90, 91, 92, 93, 94, null, null, null, null],
          10: [null, 106, 105, 104, 103, 102, 101, 100, 99, 98, 97, 96, 95, null, null],
          11: [107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122],
          12: [138, 137, 136, 135, 134, 133, 132, 131, 130, 129, 128, 127, 126, 125, 124, 123],
          13: [139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154],
          14: [170, 169, 168, 167, 166, 165, 164, 163, 162, 161, 160, 159, 158, 157, 156, 155],
          15: [171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186],
          16: [202, 201, 200, 199, 198, 197, 196, 195, 194, 193, 192, 191, 190, 189, 188, 187],
          17: [203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218],
          18: [null, null, null, 229, 228, 227, 226, 225, 224, 223, 222, 221, 220, 219, null, null]
        };
        occupied = ["1_1", "1_7", "1_14", "10_95"];
        blocked = [
          "3_30", "3_37", "3_44",
          "6_70", "6_63",
          "10_106", "10_100",
          "15_171", "15_178", "15_186",
          "18_229", "18_224", "18_219"
        ];
      } else if (isJamsil219) {
        layout = {
          1: [null, null, 25, 24, 23, 22, null, null, null, null, null, null, null, 3, 2, 1],
          2: [null, null, 26, 27, 28, 29, null, null, null, null, null, null, null, 4, 5, 6],
          3: [null, null, 33, 32, 31, 30, null, null, null, null, null, null, null, 9, 8, 7],
          4: [null, null, 34, 35, 36, 37, null, null, null, null, null, null, null, 10, 11, 12],
          5: [null, null, 41, 40, 39, 38, null, null, null, null, null, null, null, 15, 14, 13],
          6: [null, null, 42, 43, 44, 45, null, null, null, null, null, null, null, 16, 17, 18],
          7: [null, null, 49, 48, 47, 46, null, null, null, null, null, null, null, 21, 20, 19],
          8: [null, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64],
          9: [null, 79, 78, 77, 76, 75, 74, 73, 72, 71, 70, 69, 68, 67, 66, 65],
          10: [null, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94],
          11: [null, 109, 108, 107, 106, 105, 104, 103, 102, 101, 100, 99, 98, 97, 96, 95],
          12: [null, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124],
          13: [null, 139, 138, 137, 136, 135, 134, 133, 132, 131, 130, 129, 128, 127, 126, 125],
          14: [null, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154],
          15: [170, 169, 168, 167, 166, 165, 164, 163, 162, 161, 160, 159, 158, 157, 156, 155],
          16: [171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186],
          17: [202, 201, 200, 199, 198, 197, 196, 195, 194, 193, 192, 191, 190, 189, 188, 187],
          18: [203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218],
          19: [234, 233, 232, 231, 230, 229, 228, 227, 226, 225, 224, 223, 222, 221, 220, 219],
          20: [235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250],
          21: [266, 265, 264, 263, 262, 261, 260, 259, 258, 257, 256, 255, 254, 253, 252, 251]
        };
        occupied = ["1_23", "1_2", "3_32", "3_8"];
        blocked = [];
      } else {
        // jamsil 118 block layout
        layout = {
          1: [null, null, 1, 2, 3, 4, 5, 6, null, null],
          2: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
          3: [17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
          4: [27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
          5: [null, null, null, 37, null, null, 38, null, null, null],
          6: [null, null, null, 39, null, null, 40, null, null, null],
          7: [null, null, 41, 42, 43, null, null, 44, 45, 46],
          8: [null, 47, 48, 49, 50, null, 51, 52, null, null],
          9: [null, null, null, null, 53, 54, 55, null, null, null],
          10: [null, 56, 57, 58, 59, 60, null, null, null, null],
          11: [null, null, null, 61, 62, 63, 64, 65, null, null],
          12: [66, 67, 68, 69, 70, 71, 72, 73, 74, 75],
          13: [76, 77, 78, 79, 80, 81, 82, 83, 84, 85],
          14: [86, 87, 88, 89, 90, 91, 92, 93, 94, 95],
          15: [96, 97, 98, 99, 100, 101, 102, 103, 104, 105],
          16: [106, 107, 108, 109, 110, 111, 112, 113, 114, 115],
          17: [116, 117, 118, 119, 120, 121, 122, 123, 124, 125],
          18: [126, 127, 128, 129, 130, null, null, null, null, null]
        };
        occupied = ["1_3", "1_4", "1_5", "1_6", "5_37", "5_38", "7_41", "7_42", "7_43", "7_44", "8_48", "8_49", "8_50", "8_51", "8_52", "10_57", "10_58", "10_59", "10_60", "18_126", "18_127", "18_128", "18_129", "18_130"];
        blocked = [];
      }

      // Calculate max columns in this mock layout
      let maxCols = 0;
      Object.keys(layout).forEach(r => {
        if (layout[r].length > maxCols) {
          maxCols = layout[r].length;
        }
      });
      const visibleSeats = Math.min(maxCols, 14);
      container.style.setProperty('--visible-seats', visibleSeats);

      const maxRows = Math.max(...Object.keys(layout).map(Number));
      for (let r = 1; r <= maxRows; r++) {
        const rowDiv = document.createElement("div");
        rowDiv.className = "seat-row";

        const label = document.createElement("span");
        label.className = "row-num";
        label.textContent = `${r}열`;
        rowDiv.appendChild(label);

        const seatsDiv = document.createElement("div");
        seatsDiv.className = "row-seats";

        const rowSeatsArray = layout[r];
        rowSeatsArray.forEach((sVal, sIdx) => {
          if (sVal === null) {
            if (isJamsil118 && r === 18 && sIdx === 5) {
              // Render wide Cheer stage label
              const stageEl = document.createElement("div");
              stageEl.className = "cheer-stage-mini-label";
              stageEl.style.flex = "5";
              stageEl.style.backgroundColor = "#4b5563";
              stageEl.style.color = "white";
              stageEl.style.fontSize = "clamp(6px, 1.8vw, 9px)";
              stageEl.style.fontWeight = "bold";
              stageEl.style.display = "flex";
              stageEl.style.alignItems = "center";
              stageEl.style.justifyContent = "center";
              stageEl.style.borderRadius = "4px";
              stageEl.style.padding = "2px";
              stageEl.textContent = "응원단상";
              seatsDiv.appendChild(stageEl);
            } else if (isJamsil118 && r === 18 && sIdx > 5) {
              // Do nothing, covered by span
            } else {
              const gapBtn = document.createElement("button");
              gapBtn.className = "seat-item gap";
              seatsDiv.appendChild(gapBtn);
            }
          } else {
            const seatBtn = document.createElement("button");
            seatBtn.className = "seat-item";
            seatBtn.textContent = sVal;
            const seatKey = `${r}_${sVal}`;
            
            if (occupied.includes(seatKey)) {
              seatBtn.classList.add("has-camera");
              
              // Seed view key mapping (we'll reuse jamsil_b103 for demo detail visual comparison)
              const dbKey = isJamsil103 ? `jamsil_b103_${r}_${sVal}` : `jamsil_b103_1_1`;
              seatBtn.onclick = () => this.openSeatDetail(dbKey);
            } else if (blocked.includes(seatKey)) {
              seatBtn.classList.add("blocked");
              seatBtn.disabled = true;
            } else {
              const bNum = blockId.replace(/[^0-9]/g, "");
              const dbKey = `${state.selectedStadium.id}_b${bNum}_${r}_${sVal}`;
              seatBtn.onclick = () => this.openSeatDetail(dbKey);
            }
            seatsDiv.appendChild(seatBtn);
          }
        });
        rowDiv.appendChild(seatsDiv);
        container.appendChild(rowDiv);
      }
    } else {
      // Standard grid layout (Fallback)
      const maxRows = 5;
      const maxSeats = 8;

      const visibleSeats = Math.min(maxSeats, 14);
      container.style.setProperty('--visible-seats', visibleSeats);

      for (let r = 1; r <= maxRows; r++) {
        const rowDiv = document.createElement("div");
        rowDiv.className = "seat-row";

        const label = document.createElement("span");
        label.className = "row-num";
        label.textContent = `${r}열`;
        rowDiv.appendChild(label);

        const seatsDiv = document.createElement("div");
        seatsDiv.className = "row-seats";

        for (let s = 1; s <= maxSeats; s++) {
          const seatBtn = document.createElement("button");
          seatBtn.className = "seat-item";
          seatBtn.textContent = s;
          
          const dbKey = `${state.selectedStadium.id}_${blockId}_${r}_${s}`;
          const hasPhoto = !!SEAT_VIEWS_DB[dbKey];

          if (hasPhoto) {
            seatBtn.classList.add("has-camera");
            seatBtn.onclick = () => this.openSeatDetail(dbKey);
          } else {
            const isMockPhoto = (r + s) % 7 === 0;
            if (isMockPhoto) {
              seatBtn.classList.add("has-camera");
              seatBtn.onclick = () => this.openMockSeatDetail(r, s);
            } else {
              seatBtn.onclick = () => this.openSeatDetail(dbKey);
            }
          }
          seatsDiv.appendChild(seatBtn);
        }
        rowDiv.appendChild(seatsDiv);
        container.appendChild(rowDiv);
      }
    }
  }

  // --- Seat Detail Modal ---
  // --- Seat Detail Modal (Dynamic Carousel / Thumbnails) ---
  async openSeatDetail(dbKey, options = {}) {
    state.activeModalOwnReviewsOnly = !!options.ownReviewsOnly;
    state.activeModalCategory = options.category === "musical" ? "musical" : "baseball";
    const isMusical = state.activeModalCategory === "musical";
    const dbKeyStr = String(dbKey);
    const parts = dbKeyStr.split("_");
    const stadiumId = parts[0];
    const blockId = parts[1] || "";
    const r = parts[2] || "1";
    const s = parts[3] || "1";

    // Match demo seat by checking if it ends with "22567" or matches Gocheok Burgundy block 101, row D, seat 2
    // (musical seats never go through the demo/mock path \u2014 every musical seat id is a real row)
    const isDemoSeat = !isMusical && (dbKeyStr.endsWith("22567") || (stadiumId === "gocheok" && blockId === "b101" && (r === "D" || r === "D\uC5F4") && (s === "2" || s === "2\uBC88")));
    const isRealSeat = isMusical || (!isDemoSeat && /^\d+$/.test(dbKeyStr));

    // musical seat ids are plain integers too, so namespace the shared
    // SEAT_VIEWS_DB cache key to avoid colliding with a baseball seat that
    // happens to share the same raw id.
    const cacheKey = isMusical ? `musical_${dbKeyStr}` : dbKeyStr;
    state.activeModalSeatKey = isDemoSeat ? "22567" : dbKeyStr;

    let images = [];
    let comment = "\uC544\uC9C1 \uB4F1\uB85D\uB41C \uC2DC\uC57C \uC0AC\uC9C4\uC7B5\uB2C8\uB2E4. \uCCAB \uBC88\uC9F8 \uC2AC\uB85C\uC5D0 \uC0AC\uC9C4\uC744 \uC81C\uBCF4\uD574 \uC8FC\uC138\uC694!";
    let stadiumName, blockName, seatName;
    let isWheelchairSeat = false;
    // Hoisted out of the try block below so the "\uAD00\uB78C \uACF5\uC5F0" dropdown
    // (populated further down, past this whole if-block) can still read the
    // venue this seat belongs to \u2014 the same lookup the "N\uC5F4" show/hide fix
    // already does for showRowNum.
    let venueRow = null;

    if (isRealSeat && supabaseClient && isMusical) {
      try {
        const { data: seatRow } = await supabaseClient.from('musical_seats').select('*').eq('id', dbKey).single();
        isWheelchairSeat = !!(seatRow && seatRow.is_disabled_seat);
        let blockRow = null;
        if (seatRow) {
          const { data: bRow } = await supabaseClient.from('musical_blocks').select('id, venue_id, floor, block_code, full_name, total_rows, max_seats, offset_x, offset_y, label_position, show_row_label').eq('id', seatRow.block_id).single();
          blockRow = bRow;
          if (blockRow) {
            const { data: vRow } = await supabaseClient.from('venues').select('*').eq('id', blockRow.venue_id).single();
            venueRow = vRow;
          }
        }
        stadiumName = venueRow ? venueRow.name : (state.selectedVenue ? state.selectedVenue.name : "\uACF5\uC5F0\uC7A5");
        // Single-zone venues (e.g. \uBE14\uB8E8\uC2A4\uD018\uC5B4) leave block_code blank in
        // admin rather than carrying a made-up code \u2014 full_name is
        // admin-authored free text either way (e.g. just "1\uCE35"), so it's
        // always the right thing to show; block_code+"\uAD6C\uC5ED" is only a
        // fallback for when full_name itself is somehow empty.
        blockName = blockRow
          ? (blockRow.full_name || (blockRow.block_code ? blockRow.block_code + "\uAD6C\uC5ED" : ""))
          : (state.selectedVenueBlock ? (state.selectedVenueBlock.full_name || (state.selectedVenueBlock.block_code ? state.selectedVenueBlock.block_code + "\uAD6C\uC5ED" : "")) : "\uAD6C\uC5ED \uC815\uBCF4 \uC5C6\uC74C");

        // Row numbers only reach the user through some block's aisle
        // label_position feature. A single physical row is often split
        // across 2-3 separate block records side by side (e.g. a wide
        // center block plus narrow wing blocks flanking an aisle gap) \u2014
        // admins tend to only set label_position on the center one, since
        // that's where the aisle label visually renders, leaving the wings'
        // own seats showing no row number even though they're the exact
        // same row (e.g. LG\uC544\uD2B8\uC13C\uD130 1\uCE35 OP5\uC5F4: center block 43 has
        // label_position="both" and shows "OP5\uC5F4", but wing blocks 42/44
        // don't and show a bare seat number). Blocks that share this
        // block's floor AND offset_y are the same row-band by construction
        // (offset_y is the row-band's vertical start), so borrow the label
        // setting from any of them. This is narrower than the old "any
        // block on this floor" check (which wrongly roped in unrelated
        // blocks like BOX1/BOX2 sitting on a totally different offset_y).
        let showRowNum = true;
        if (blockRow) {
          showRowNum = !!(blockRow.label_position || "").trim();
          if (!showRowNum) {
            const { data: rowBandBlocks } = await supabaseClient
              .from('musical_blocks')
              .select('label_position')
              .eq('venue_id', blockRow.venue_id)
              .eq('floor', blockRow.floor)
              .eq('offset_y', blockRow.offset_y);
            showRowNum = !!(rowBandBlocks || []).some(b => (b.label_position || "").trim());
          }
        }
        // Wheelchair spaces are often a marked area rather than a numbered
        // seat, so seat_num can be null \u2014 showing that raw would render as
        // the literal string "null\uBC88".
        if (seatRow && (seatRow.seat_num === null || seatRow.seat_num === undefined || seatRow.seat_num === "")) {
          seatName = isWheelchairSeat
            ? (showRowNum ? `${seatRow.row_num}\uC5F4 \uC7A5\uC560\uC778\uC11D` : "\uC7A5\uC560\uC778\uC11D")
            : (showRowNum ? `${seatRow.row_num}\uC5F4` : "\uC88C\uC11D \uC815\uBCF4 \uC5C6\uC74C");
        } else if (seatRow) {
          seatName = showRowNum ? `${seatRow.row_num}\uC5F4 ${seatRow.seat_num}\uBC88` : `${seatRow.seat_num}\uBC88`;
          if (isWheelchairSeat) seatName += " (\uC7A5\uC560\uC778\uC11D)";
        } else {
          seatName = "\uC88C\uC11D \uC815\uBCF4 \uC5C6\uC74C";
        }
      } catch (e) {
        console.warn("Failed to resolve real musical seat info:", e);
        stadiumName = state.selectedVenue ? state.selectedVenue.name : "\uACF5\uC5F0\uC7A5";
        blockName = state.selectedVenueBlock ? (state.selectedVenueBlock.full_name || (state.selectedVenueBlock.block_code ? state.selectedVenueBlock.block_code + "\uAD6C\uC5ED" : "")) : "\uAD6C\uC5ED \uC815\uBCF4 \uC5C6\uC74C";
        seatName = "\uC88C\uC11D \uC815\uBCF4 \uC5C6\uC74C";
      }
    } else if (isRealSeat && supabaseClient) {
      try {
        const { data: seatRow } = await supabaseClient.from('baseball_seats').select('*').eq('id', dbKey).single();
        isWheelchairSeat = !!(seatRow && seatRow.is_disabled_seat);
        let blockRow = null, stadiumRow = null;
        if (seatRow) {
          const { data: bRow } = await supabaseClient.from('baseball_blocks').select('*').eq('id', seatRow.block_id).single();
          blockRow = bRow;
          if (blockRow) {
            const { data: stRow } = await supabaseClient.from('stadiums').select('*').eq('id', blockRow.stadium_id).single();
            stadiumRow = stRow;
          }
        }
        stadiumName = stadiumRow ? stadiumRow.name : (state.selectedStadium ? state.selectedStadium.name : "\uACBD\uAE30\uC7A5");
        blockName = blockRow ? (blockRow.full_name || blockRow.block_code + "\uAD6C\uC5ED") : (state.selectedBlock ? state.selectedBlock.name : "\uAD6C\uC5ED \uC815\uBCF4 \uC5C6\uC74C");
        if (seatRow && (seatRow.seat_num === null || seatRow.seat_num === undefined || seatRow.seat_num === "")) {
          seatName = isWheelchairSeat ? `${seatRow.row_num}\uC5F4 \uC7A5\uC560\uC778\uC11D` : `${seatRow.row_num}\uC5F4`;
        } else if (seatRow) {
          seatName = `${seatRow.row_num}\uC5F4 ${seatRow.seat_num}\uBC88`;
          if (isWheelchairSeat) seatName += " (\uC7A5\uC560\uC778\uC11D)";
        } else {
          seatName = "\uC88C\uC11D \uC815\uBCF4 \uC5C6\uC74C";
        }
      } catch (e) {
        console.warn("Failed to resolve real seat info:", e);
        stadiumName = state.selectedStadium ? state.selectedStadium.name : "\uACBD\uAE30\uC7A5";
        blockName = state.selectedBlock ? state.selectedBlock.name : "\uAD6C\uC5ED \uC815\uBCF4 \uC5C6\uC74C";
        seatName = "\uC88C\uC11D \uC815\uBCF4 \uC5C6\uC74C";
      }
    } else {
      const stadium = STADIUMS_DB.find(st => st.id === stadiumId);
      stadiumName = stadium ? stadium.name : (state.selectedStadium ? state.selectedStadium.name : "\uACBD\uAE30\uC7A5");
      blockName = blockId;
      if (blockId.startsWith("b")) {
        blockName = blockId.substring(1) + "\uC5D0\uB85C";
      } else if (state.selectedBlock) {
        blockName = state.selectedBlock.name;
      }
      seatName = `${r}\uC5F4 ${s}\uBC88`;
    }

    // Cached for addCurrentSeatToTicketbook(), which needs these resolved
    // display strings without re-deriving them from a key format that only
    // makes sense for baseball's "_"-joined composite keys.
    state.activeModalDisplayInfo = { stadiumName, blockName, seatName };

    const seatInfo = isDemoSeat
      ? SEAT_VIEWS_DB["22567"]
      : (SEAT_VIEWS_DB[cacheKey] = { ...(SEAT_VIEWS_DB[cacheKey] || {}), stadiumName, blockName, seatName });

    document.getElementById("modal-seat-stadium").textContent = stadiumName;
    document.getElementById("modal-seat-title").textContent = blockName ? `${blockName} ${seatName}` : seatName;
    document.getElementById("modal-seat-wheelchair-badge").style.display = isWheelchairSeat ? "inline-flex" : "none";

    // For real DB seats, skip this legacy placeholder-image block entirely —
    // images/comments come only from the actual baseball_seat_reviews fetch below.
    // Using seatInfo's leftover cache here used to fabricate a fake single
    // "/assets/seat_view_clean.png" photo even for seats with zero reviews.
    if (seatInfo && !isRealSeat) {

      const imageUrls = Array.isArray(seatInfo.images)
        ? seatInfo.images 
        : (seatInfo.image ? [seatInfo.image] : ["/assets/seat_view_clean.png"]);
      
      const directions = Array.isArray(seatInfo.directions)
        ? seatInfo.directions
        : [seatInfo.view_direction || "\uC815\uBA74"];

      imageUrls.forEach((url, i) => {
        let commentText = seatInfo.comment || "\uB370\uC774\uD130\uBCA0\uC774\uC2A4\uC5D0 \uB4F1\uB85D\uB41C \uC2DC\uC57C \uC0AC\uC9C4\uC785\uB2C8\uB2E4.";
        let uploaderName = seatInfo.uploader || "@\uC81C\uBCF4\uC790";
        if (Array.isArray(seatInfo.uploaders) && seatInfo.uploaders[i]) {
          uploaderName = seatInfo.uploaders[i];
        }

        if (seatInfo.is_anonymous || uploaderName === "\uC775\uBA85") {
          uploaderName = "\uC775\uBA85";
        } else if (uploaderName === "@\uB098\uC758\uAE30\uB85D" || uploaderName.startsWith("@")) {
          uploaderName = state.userNickname;
        }

        let uploaderBadge = seatInfo.uploaderBadge || "\uC2E4\uBC84 \uC81C\uBCF4\uC790";
        let uploaderDate = seatInfo.matchDate || seatInfo.ins_dtm || "2026-08-01";
        let viewDir = directions[i] || "\uC815\uBA74";

        if (isDemoSeat) {
          if (i === 0) {
            commentText = "\uACE0\uCC99\uB3D4 \uBC84\uAC74\uB514 101\uAD6C\uC5ED D\uC5F4 2\uBC88 \uC2DC\uC57C \uC608\uC220\uC785\uB2C8\uB2E4! \uD0C0\uC11D\uC7B5\uC5D0\uC11C \uC815\uB9D0 \uAC00\uCCA5\uACE0, \uB192\uC774\uB3C4 \uC801\uB2F9\uD574\uC11C \uD22C\uC218 \uACF5 \uADA4\uC801\uC774 \uC815\uBA74\uC73C\uB85C \uBCF4\uC5EC\uC694. \uACE0\uCC99\uB3D4 \uAC00\uC2EC \uB54C \uBB34\uC870\uAC74 \uAC15\uCD94\uD558\uB294 \uBA85\uB2F9 \uC790\uB9AC\uC785\uB2C8\uB2E4!";
            uploaderName = "@\uC57C\uAD6C\uB7EC\uBC84";
            uploaderBadge = "\uCCAB \uC81C\uBCF4\uC790";
            uploaderDate = "2026-08-01";
            viewDir = "home";
          } else {
            commentText = "\uAC19\uC740 \uC790\uB9AC\uC5D0\uC11C \uC57D\uAC04 \uC77C\uC5B4\uC11C\uC11C \uCC0D\uC740 \uC2DC\uC57C\uC785\uB2C8\uB2E4. \uC804\uAD11\uD310\uACFC \uC6B0\uCE21 \uC678\uC57C \uD39C\uC2A4\uAE4C\uC9C0 \uC544\uC8FC \uC2DC\uC6D0\uC2DC\uC6D0\uD558\uAC8C \uBCF4\uC785\uB2C8\uB2E4!";
            uploaderName = "@\uACE0\uCC99\uB3D4\uB2E8\uACE8";
            uploaderBadge = "\uACE8\uB4DC \uC81C\uBCF4\uC790";
            uploaderDate = "2026-08-02";
            viewDir = "center";
          }
        }

        images.push({
          url: url,
          direction: viewDir,
          comment: commentText,
          uploader: uploaderName,
          uploaderBadge: uploaderBadge,
          date: uploaderDate.split('T')[0]
        });
      });
      comment = seatInfo.comment || comment;
    }

    if (supabaseClient && dbKey) {
      try {
        let reviewsQuery = supabaseClient
          .from(isMusical ? 'musical_seat_reviews' : 'baseball_seat_reviews')
          .select('*')
          .eq(isMusical ? 'musical_seat_id' : 'baseball_seat_id', dbKey)
          .eq('is_blocked', false);

        // From 마이페이지, only show the reviews I personally wrote for this
        // seat, so I can judge whether to keep or delete just my own entry
        // instead of scrolling through everyone else's.
        if (options.ownReviewsOnly && state.userId) {
          reviewsQuery = reviewsQuery.eq('user_id', state.userId);
        }

        const { data: reviews, error } = await reviewsQuery
          .order('ins_dtm', { ascending: false });

        if (!error && reviews && reviews.length > 0) {
          const nickMap = await this.fetchNicknames(reviews.filter(r => !r.is_anonymous).map(r => r.user_id));
          const dbImages = [];
          reviews.forEach(rev => {
            const urls = Array.isArray(rev.image_urls) ? rev.image_urls : [];
            const dir = rev.view_direction || "\uC815\uBA74";
            const uploaderName = rev.is_anonymous ? "\uC775\uBA85" : (nickMap[rev.user_id] || "@\uC81C\uBCF4\uC790");
            const uploaderBadge = rev.is_anonymous ? "\uC77C\uBC18 \uC81C\uBCF4\uC790" : "\uACE8\uB4DC \uC81C\uBCF4\uC790";
            const uploaderDate = rev.ins_dtm || "2026-08-01";
            urls.forEach(u => {
              dbImages.push({
                url: u,
                reviewId: rev.id,
                insDtm: rev.ins_dtm,
                isAnonymous: !!rev.is_anonymous,
                isTicketVerified: !!rev.is_ticket_verified,
                ticketPhotoUrl: rev.ticket_photo_url || null,
                direction: dir,
                rating: typeof rev.rating === "number" ? rev.rating : null,
                comment: rev.content || "",
                uploader: uploaderName,
                uploaderBadge: uploaderBadge,
                // profiles_public only exposes id+nickname (no photo) \u2014 that's
                // deliberate, other reviewers' avatars were never meant to
                // show here. For the viewer's own review, though, we already
                // have their own (toggle-aware) avatar client-side.
                avatar: (!rev.is_anonymous && rev.user_id === state.userId) ? state.userAvatarUrl : null,
                // Kept ungated here (unlike avatar) so the owner's own edit
                // form can read it back via current.externalLink regardless
                // of anonymity — the badge itself is hidden for anonymous
                // posts at render time instead (see updateModalImage()).
                externalLink: rev.external_link || null,
                watchedDate: rev.watched_date || null,
                venueId: venueRow ? venueRow.id : null,
                // \uAD00\uB78C\uC77C\uC774 \uC788\uC73C\uBA74 \uADF8\uAC78 \uBCF4\uC5EC\uC8FC\uACE0, \uC5C6\uC73C\uBA74 \uB4F1\uB85D\uC77C(ins_dtm)\uB85C \uB300\uCCB4.
                date: rev.watched_date || uploaderDate.split('T')[0]
              });
            });
          });

          // \uC6B0\uC120\uC21C\uC704: \uC778\uC99D\uB428 > (\uAD00\uB78C\uC77C\uC774 \uC62C\uD574~\uC791\uB144\uC778 \uAC83 \uBA3C\uC800, \uADF8 \uC548\uC5D0\uC11C\uB294 \uAD00\uB78C\uC77C
          // \uCD5C\uC2E0\uC21C) > \uCD5C\uADFC\uB4F1\uB85D\uC77C > \uB2C9\uB124\uC784 \uC788\uC74C > \uB2C9\uB124\uC784 \uBE44\uACF5\uAC1C.
          // \uAD00\uB78C\uC77C\uC774 \uB108\uBB34 \uC608\uC804\uC774\uAC70\uB098 \uC544\uC608 \uC5C6\uC73C\uBA74 \uAD00\uB78C\uC77C \uB300\uC2E0 \uB4F1\uB85D\uC77C\uB85C \uC904\uC744 \uC138\uC6CC\uC11C,
          // \uC624\uB798\uB41C \uAD00\uB78C\uC77C \uD558\uB098\uAC00 \uCD5C\uADFC\uC5D0 \uC62C\uB77C\uC628 \uAE00\uB4E4\uBCF4\uB2E4 \uD56D\uC0C1 \uC55E\uC11C\uB294 \uAC78 \uB9C9\uB294\uB2E4.
          // \uC778\uC99D \uC5EC\uBD80\uC640 \uBB34\uAD00\uD558\uAC8C \uB450 \uADF8\uB8F9 \uBAA8\uB450 \uAC19\uC740 \uADDC\uCE59\uC744 \uC801\uC6A9\uD574 \uC77C\uAD00\uC131\uC744 \uC720\uC9C0.
          const recentWatchedCutoff = `${new Date().getFullYear() - 1}-01-01`;
          const isRecentWatched = (d) => !!d && d >= recentWatchedCutoff;
          // A review's multiple photos share the same sort keys, so a
          // stable sort keeps them adjacent in their original order.
          dbImages.sort((a, b) => {
            if (a.isTicketVerified !== b.isTicketVerified) return a.isTicketVerified ? -1 : 1;
            const aRecent = isRecentWatched(a.watchedDate);
            const bRecent = isRecentWatched(b.watchedDate);
            if (aRecent !== bRecent) return aRecent ? -1 : 1;
            if (aRecent) {
              if (a.watchedDate !== b.watchedDate) return a.watchedDate > b.watchedDate ? -1 : 1;
            }
            const aIns = a.insDtm || "";
            const bIns = b.insDtm || "";
            if (aIns !== bIns) return aIns > bIns ? -1 : 1;
            if (a.isAnonymous !== b.isAnonymous) return a.isAnonymous ? 1 : -1;
            return 0;
          });

          if (dbImages.length > 0) {
            images = dbImages;
          }
        }

        // Keep the real photos/reviews in the cache too, so
        // addCurrentSeatToCompare() can show the full swipeable set instead
        // of just a single placeholder image.
        if (isRealSeat) {
          SEAT_VIEWS_DB[cacheKey].images = images;
          SEAT_VIEWS_DB[cacheKey].comment = images[0] ? images[0].comment : "";
        }
      } catch (e) {
        console.warn("Could not load database seat reviews:", e);
      }
    }

    const hasPhotos = (images.length > 0);
    state.activeModalHasPhotos = hasPhotos;

    const placeholderEl = document.getElementById("modal-seat-placeholder");
    const carouselEl = document.querySelector(".modal-image-carousel-container");
    const uploaderRowEl = document.querySelector(".modal-uploader-row");
    const descBoxEl = document.querySelector(".modal-desc-box");
    const btnCompare = document.getElementById("btn-detail-compare");

    if (!hasPhotos) {
      if (placeholderEl) placeholderEl.style.display = "flex";
      if (carouselEl) carouselEl.style.display = "none";
      if (uploaderRowEl) uploaderRowEl.style.display = "none";
      if (descBoxEl) descBoxEl.style.display = "none";
      
      if (btnCompare) {
        btnCompare.disabled = true;
        btnCompare.style.opacity = "0.5";
        btnCompare.style.pointerEvents = "none";
      }
      
      this.modalImages = [];
    } else {
      if (placeholderEl) placeholderEl.style.display = "none";
      if (carouselEl) carouselEl.style.display = "block";
      if (uploaderRowEl) uploaderRowEl.style.display = "flex";
      // .modal-desc-box is display:flex in CSS (column layout, fixed
      // height) so its comment <p> can scroll instead of overflowing —
      // forcing "block" here defeated that.
      if (descBoxEl) descBoxEl.style.display = "flex";
      
      if (btnCompare) {
        btnCompare.disabled = false;
        btnCompare.style.opacity = "1";
        btnCompare.style.pointerEvents = "auto";
      }
      
      this.modalImages = images;
      this.currentImageIndex = 0;
      this.updateModalImage();
    }

    // Opened from 마이페이지: show "기록 수정" / "기록 삭제" instead of the
    // compare/report actions, since this view is for reviewing/deciding on
    // my own existing entry, not registering a new one or comparing.
    const compareBtn = document.getElementById("btn-detail-compare");
    const reportBtn = document.getElementById("btn-detail-report");
    const editBtn = document.getElementById("btn-detail-edit");
    const deleteBtn = document.getElementById("btn-detail-delete");
    const expiredNoteEl = document.getElementById("detail-edit-window-expired-note");
    const ownMode = state.activeModalOwnReviewsOnly && hasPhotos;
    // The buttons themselves used to stay visible past the 3-day edit/delete
    // window — clicking either still worked, just to bounce you off an
    // "expired" alert dialog. Terms 제7조 says the capability is simply gone
    // after 3 days, so the buttons should read that way too: hidden, with a
    // short note instead of a dead-looking control that invites a click.
    const withinWindow = ownMode && this.modalImages.length > 0 && this.isWithinEditWindow(this.modalImages[0].insDtm);
    if (compareBtn) compareBtn.style.display = state.activeModalOwnReviewsOnly ? "none" : "";
    if (reportBtn) reportBtn.style.display = state.activeModalOwnReviewsOnly ? "none" : "";
    if (editBtn) editBtn.style.display = withinWindow ? "flex" : "none";
    if (deleteBtn) deleteBtn.style.display = withinWindow ? "flex" : "none";
    if (expiredNoteEl) expiredNoteEl.style.display = (ownMode && !withinWindow) ? "block" : "none";

    // Owns its own back-stop like any normal modal: from the bottom sheet,
    // back closes it and reveals venue-detail underneath; from venue-detail
    // itself (sheet already closed), back leaves the venue. Floor-tab
    // history (selectVenueFloor) is tracked independently and still works
    // underneath this — the two aren't mutually exclusive.
    this.openModal("modal-seat-detail");
  }

  // Both 3-day windows share the same rule, so this checks whichever
  // timestamp is relevant (delete uses a ticket, edit uses a modal image).
  isWithinEditWindow(insDtm) {
    if (!insDtm) return false;
    const diffDays = Math.abs(new Date() - new Date(insDtm)) / (1000 * 60 * 60 * 24);
    return diffDays <= 3;
  }

  async deleteCurrentModalReview() {
    if (!this.modalImages || this.modalImages.length === 0) return;
    const reviewId = this.modalImages[this.currentImageIndex].reviewId;
    if (!reviewId) return;
    await this.deleteTicket(reviewId);
    this.closeModal("modal-seat-detail");
  }

  async editCurrentModalReview() {
    if (!this.modalImages || this.modalImages.length === 0) return;
    const current = this.modalImages[this.currentImageIndex];
    const reviewId = current.reviewId;
    if (!reviewId) return;

    if (!this.isWithinEditWindow(current.insDtm)) {
      await this.showAlertDialog("수정할 수 없어요", "등록 후 3일이 경과한 기록은 직접 수정이 불가능합니다.\n\n수정이 필요하신 경우 고객센터 이메일(j2mi.help@gmail.com)로 요청주시기 바랍니다.");
      return;
    }
    // Unlike a fresh registration, an edit can already be verified — start
    // from that actual status (not a blind reset to unverified) so the
    // "좌석 인증(티켓)" field shows "인증됨" as-is when it already is, and so
    // saving without touching it doesn't silently un-verify the review. If
    // it's not yet verified, this still leaves the "인증하기" button live so
    // it can be verified right here during the edit.
    state.ticketVerified = !!current.isTicketVerified;
    state.ticketVerifiedCategory = state.ticketVerified ? state.activeModalCategory : null;
    // A ticket photo attached earlier but not yet reviewed by an admin —
    // reflect that pending state (and its thumbnail) too, not just the
    // final verified/not.
    state.ticketPendingReview = !state.ticketVerified && !!current.ticketPhotoUrl;
    state.pendingTicketPhotoBlob = null;
    if (state.ticketPendingPhotoPreviewUrl) URL.revokeObjectURL(state.ticketPendingPhotoPreviewUrl);
    state.ticketPendingPhotoPreviewUrl = null;
    // current.ticketPhotoUrl is a private-bucket storage path, not a URL —
    // resolve it to a short-lived signed URL so the owner can preview their
    // own still-pending photo here.
    state.ticketPendingExistingPath = state.ticketPendingReview ? current.ticketPhotoUrl : null;
    state.ticketPendingExistingUrl = state.ticketPendingReview
      ? await this.getTicketPhotoSignedUrl(current.ticketPhotoUrl)
      : null;
    state.ticketPhotoRemovedExisting = null;
    this.updateTicketVerifyFormUI();
    // "변경" doesn't make sense while editing — the seat itself can't
    // actually change here (saving an edit never touches which seat the
    // review belongs to), so unlike a fresh registration there's nothing
    // for that button to coherently do. Force it hidden regardless of
    // verified state.
    const wrongSeatLinkEl = document.getElementById("form-wrong-seat-link");
    if (wrongSeatLinkEl) wrongSeatLinkEl.style.display = "none";

    // Gather every photo that belongs to this specific review (a review can
    // have multiple photos, and the carousel mixes photos from other
    // reviews of the same seat in together).
    const ownPhotos = this.modalImages
      .filter(img => img.reviewId === reviewId)
      .map(img => img.url);

    this.closeModal("modal-seat-detail");

    document.getElementById("add-ticket-form").reset();
    const commentEl = document.getElementById("form-comment");
    if (commentEl) {
      commentEl.value = current.comment || "";
      commentEl.style.height = "auto";
      this.autoResizeTextarea(commentEl);
      this.updateCommentCounter(commentEl);
    }
    const nickToggleEl = document.getElementById("form-show-nickname-toggle");
    if (nickToggleEl) nickToggleEl.checked = !current.isAnonymous;
    const extLinkEl = document.getElementById("form-external-link");
    if (extLinkEl) extLinkEl.value = current.externalLink || "";
    const ratingGroupEl = document.getElementById("form-rating-group");
    if (ratingGroupEl) ratingGroupEl.style.display = state.activeModalCategory === "musical" ? "" : "none";
    // 예전에 등록된 리뷰는 별점이 없을 수 있음(0으로 표시, 저장 시 다시
    // 골라야 함) — 이미 별점이 있으면 그 값을 그대로 보여준다.
    this.resetFormRating(current.rating || 0);
    this.setTicketDateFieldDefaults();
    const dateEl = document.getElementById("form-match-date");
    if (dateEl) dateEl.value = current.watchedDate || "";

    const labelEl = document.getElementById("form-seat-info-label");
    if (labelEl) {
      const heading = document.getElementById("modal-seat-title") ? document.getElementById("modal-seat-title").textContent : "";
      const subheading = document.getElementById("modal-seat-stadium") ? document.getElementById("modal-seat-stadium").textContent : "";
      labelEl.innerHTML = `${this.escapeHtml(subheading)}<br>${this.escapeHtml(heading)}`;
    }

    state.tempUploadedPhotos = ownPhotos.map(url => ({ type: "existing", url }));
    // Snapshot so saveNewTicket can diff against the final list at save time
    // and only clean up storage files that were actually confirmed removed —
    // deleting immediately here would break the live review if the user
    // cancels the edit instead of submitting.
    state.editingOriginalPhotos = [...ownPhotos];
    state.currentUploadedPhotoBase64 = null;
    this.renderUploadedPhotosThumbnails();

    state.editingReviewId = reviewId;

    const titleEl = document.getElementById("add-ticket-modal-title");
    if (titleEl) titleEl.textContent = "시야 사진 수정";

    const submitBtn = document.querySelector("#add-ticket-form button[type='submit']");
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "<i data-lucide=\"check\"></i> 수정 완료";
      lucide.createIcons();
    }

    this.openModal("modal-add-ticket");
    // Re-run the resize now that the modal is actually visible — doing it
    // earlier (while the modal was still hidden) measures scrollHeight as 0,
    // which is why the box looked collapsed until the user typed a character.
    if (commentEl) this.autoResizeTextarea(commentEl);
  }

  updateModalImage() {
    const imgEl = document.getElementById("modal-seat-img");
    const dirEl = document.getElementById("modal-seat-direction");
    const descEl = document.getElementById("modal-seat-description");
    const thumbContainer = document.getElementById("modal-seat-thumbnails");

    const avatarEl = document.getElementById("modal-seat-avatar");
    const uploaderEl = document.getElementById("modal-seat-uploader");
    const badgeEl = document.getElementById("modal-seat-badge");
    const dateEl = document.getElementById("modal-seat-date");

    if (!this.modalImages || this.modalImages.length === 0) return;

    const curImg = this.modalImages[this.currentImageIndex];
    if (imgEl && imgEl.getAttribute("src") !== curImg.url) {
      // 브라우저는 <img>의 src를 바꿔도 새 사진이 다 불러와질 때까지 이전 사진을
      // 그대로 화면에 남겨둔다 — 그래서 다른 좌석을 열면 마지막에 봤던 사진이
      // 잠깐 보였다가 바뀌었다. 새 사진이 준비될 때까지는 숨긴다.
      const reveal = () => { imgEl.style.opacity = "1"; };
      imgEl.style.transition = "opacity 0.15s";
      imgEl.style.opacity = "0";
      imgEl.onload = reveal;
      imgEl.onerror = reveal;
      imgEl.src = curImg.url;
      if (imgEl.complete && imgEl.naturalWidth > 0) reveal();
    }
    const dirMap = {
      'home': '\uD648/\uD0C0\uC11D',
      'center': '\uE5E0\uB77C\uC6B4\uB4DC \uC815\uBA74',
      'outfield': '\uC678\uC57C/\uC804\uAD11\uD310'
    };
    const displayDir = dirMap[curImg.direction] || curImg.direction;
    if (dirEl) {
      dirEl.style.display = "flex";
      dirEl.innerHTML = `\uD83D\uDCF8 ${displayDir}`;
    }
    if (descEl) {
      // Attaching a comment is optional, and most submissions skip it \u2014 a
      // "no review registered" placeholder read as if the whole submission
      // were incomplete, not just the (fully optional) text. Just hide the
      // line instead of saying anything when there's no comment.
      // Full text here (not truncateComment's ellipsis) \u2014 the box itself
      // stays a fixed height either way (.modal-desc-box), so a long
      // comment scrolls inside it instead of being cut off mid-sentence.
      const comment = curImg.comment;
      descEl.textContent = comment || "";
      descEl.style.display = comment ? "block" : "none";
    }

    const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='12' cy='12' r='12' fill='%23c4c9d3'/><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' fill='%23ffffff'/></svg>";
    if (avatarEl) avatarEl.src = curImg.avatar || defaultAvatar;
    if (uploaderEl) uploaderEl.textContent = curImg.uploader || "@\uC81C\uBCF4\uC790";
    if (badgeEl) badgeEl.textContent = curImg.uploaderBadge || "\uC2E4\uBC84 \uC81C\uBCF4\uC790";
    // \uBCC4\uC810\uC740 \uB4F1\uB85D/\uC218\uC815 \uD3FC\uC5D0\uC11C\uB9CC \uC785\uB825\uBC1B\uB294 \uAC12\uC774\uACE0, \uAC1C\uBCC4 \uB9AC\uBDF0 \uC0C1\uC138(\uC5EC\uAE30)\uC5D0\uB294
    // \uB178\uCD9C\uD558\uC9C0 \uC54A\uB294\uB2E4 \u2014 curImg.rating\uC740 \uADF8\uB300\uB85C \uAC16\uACE0 \uC788\uC9C0\uB9CC \uC774 \uD654\uBA74\uC5D0\uC11C\uB294
    // \uC548 \uC4F4\uB2E4.
    const extLinkBadgeEl = document.getElementById("modal-seat-external-link");
    if (extLinkBadgeEl) {
      // Anonymous posts hide the link too \u2014 a personal blog/SNS is at least
      // as identifying as a nickname, so showing it would defeat the point
      // of choosing anonymous. The raw value survives on curImg regardless
      // (see the dbImages.push comment above) so the owner's own edit form
      // still gets it back.
      const platform = !curImg.isAnonymous ? this.detectExternalLinkPlatform(curImg.externalLink) : null;
      if (platform) {
        extLinkBadgeEl.href = curImg.externalLink;
        extLinkBadgeEl.className = `ext-link-badge ${platform}`;
        const label = platform === "naver" ? "\uBE14\uB85C\uADF8" : "\uC778\uC2A4\uD0C0\uADF8\uB7A8";
        // A colored text pill alone doesn't read as clickable \u2014 the icon is
        // what actually signals "this leads somewhere else".
        extLinkBadgeEl.innerHTML = `${label} <i data-lucide="external-link" style="width: 9px; height: 9px;"></i>`;
        extLinkBadgeEl.style.display = "inline-flex";
        lucide.createIcons();
      } else {
        extLinkBadgeEl.style.display = "none";
      }
    }
    const verifiedBadgeEl = document.getElementById("modal-seat-verified-badge");
    if (verifiedBadgeEl) verifiedBadgeEl.style.display = curImg.isTicketVerified ? "block" : "none";
    if (dateEl) {
      // Unlabeled, a bare date is ambiguous — it could be the day the
      // reviewer actually watched the show, or (when they skipped that
      // optional field) just whenever they got around to posting, which
      // can be days/weeks later and doesn't say anything about how
      // current the seat view still is.
      const dateLabel = curImg.watchedDate ? "관람일" : "등록일";
      dateEl.textContent = `${dateLabel} ${curImg.date || "2026-08-01"}`;
    }

    const prevBtn = document.getElementById("btn-carousel-prev");
    const nextBtn = document.getElementById("btn-carousel-next");
    if (prevBtn && nextBtn) {
      if (this.modalImages.length > 1) {
        prevBtn.style.display = "flex";
        nextBtn.style.display = "flex";
      } else {
        prevBtn.style.display = "none";
        nextBtn.style.display = "none";
      }
    }

    const counterEl = document.getElementById("modal-seat-counter");
    if (counterEl) {
      counterEl.textContent = `${this.currentImageIndex + 1} / ${this.modalImages.length}`;
    }

    if (thumbContainer) {
      thumbContainer.innerHTML = "";
      if (this.modalImages.length > 1) {
        this.modalImages.forEach((img, idx) => {
          const thumb = document.createElement("div");
          thumb.className = `thumb-item ${idx === this.currentImageIndex ? 'active' : ''}`;
          // img.url\uC740 DB\uC5D0\uC11C \uC628 \uAC12\uC774\uB77C, innerHTML\uC5D0 \uADF8\uB300\uB85C \uB07C\uC6B0\uBA74 \uB530\uC634\uD45C\uAC00 \uB4E0
          // \uC8FC\uC18C\uB85C \uC18D\uC131\uC744 \uAE68\uACE0 \uC2A4\uD06C\uB9BD\uD2B8\uB97C \uC2EC\uC744 \uC218 \uC788\uB2E4 \u2014 \uC694\uC18C\uB97C \uC9C1\uC811 \uB9CC\uB4E4\uC5B4
          // src\uC5D0\uB9CC \uB123\uB294\uB2E4.
          const thumbImg = document.createElement("img");
          thumbImg.src = img.url;
          thumbImg.alt = `\uC378\uB124\uC77C ${idx + 1}`;
          thumb.appendChild(thumbImg);
          thumb.onclick = () => this.setSeatImageIndex(idx);
          thumbContainer.appendChild(thumb);
        });
      }
    }
  }

  prevSeatImage() {
    if (!this.modalImages || this.modalImages.length <= 1) return;
    this.currentImageIndex = (this.currentImageIndex - 1 + this.modalImages.length) % this.modalImages.length;
    this.updateModalImage();
  }

  nextSeatImage() {
    if (!this.modalImages || this.modalImages.length <= 1) return;
    this.currentImageIndex = (this.currentImageIndex + 1) % this.modalImages.length;
    this.updateModalImage();
  }

  setSeatImageIndex(idx) {
    if (idx < 0 || idx >= this.modalImages.length) return;
    this.currentImageIndex = idx;
    this.updateModalImage();
  }

  openMockSeatDetail(row, seat) {
    if (!state.selectedStadium || !state.selectedBlock) return;
    
    const stId = state.selectedStadium.id;
    const bId = state.selectedBlock.id;
    const dbKey = `${stId}_${bId}_${row}_${seat}`;

    if (!SEAT_VIEWS_DB[dbKey]) {
      const isGoodSeat = (row + seat) % 2 === 0;
      SEAT_VIEWS_DB[dbKey] = {
        stadiumName: state.selectedStadium.name,
        blockName: state.selectedBlock.name,
        seatName: `${row}열 ${seat}번`,
        images: isGoodSeat 
          ? ["/assets/seat_view_clean.png", "/assets/jamsil_stadium.jpg", "/assets/seat_view_blocked.png"]
          : ["/assets/seat_view_blocked.png", "/assets/seat_view_clean.png"],
        directions: isGoodSeat 
          ? ["home", "center", "outfield"]
          : ["home", "center"],
        comment: isGoodSeat 
          ? "전반적으로 쾌적하고 관람하기 좋은 시야입니다. 가성비 좋은 명당 블록 중 하나예요!"
          : "펜스가 다소 시야를 차단해서 아쉽지만 경기 집중엔 큰 방해는 안 됩니다. 앰프가 가까운 편입니다."
      };
    }

    this.openSeatDetail(dbKey);
  }

  // --- 1:1 Side-by-Side Comparison ---
  addCurrentSeatToCompare() {
    if (!state.isLoggedIn) {
      sessionStorage.removeItem("seatview_pending_login_state");
      this.openModal("modal-login-confirm");
      return;
    }

    // SEAT_VIEWS_DB only ever holds baseball's legacy placeholder data —
    // musical seats never get an entry there, which silently no-op'd this
    // whole function for them. state.activeModalDisplayInfo and
    // this.modalImages are populated by openSeatDetail() for both
    // categories, so use those instead as the single source of truth.
    if (!state.activeModalSeatKey || !state.activeModalDisplayInfo) return;

    const { stadiumName, blockName, seatName } = state.activeModalDisplayInfo;
    const images = Array.isArray(this.modalImages) ? this.modalImages : [];

    // Check if already in comparisons
    const alreadyAdded = state.comparisons.some(item =>
      item.stadiumName === stadiumName &&
      item.blockName === blockName &&
      item.seatName === seatName
    );

    if (alreadyAdded) {
      this.showToast("⚠️", "이미 비교함에 담긴 좌석입니다.");
      this.closeModal("modal-seat-detail");
      return;
    }

    if (state.comparisons.length >= 2) {
      this.showToast("⚠️", "비교함엔 최대 2개의 좌석만 담을 수 있습니다. 기존 내역을 비워주세요.");
      this.closeModal("modal-seat-detail");
      return;
    }

    state.comparisons.push({
      key: state.activeModalSeatKey,
      category: state.activeModalCategory,
      stadiumName,
      blockName,
      seatName,
      images
    });

    this.saveComparisons();
    this.updateCompareBadge();
    this.showToast("🛒", `${blockName} ${seatName}이 비교함에 담겼습니다!`);
    this.closeModal("modal-seat-detail");

    // Two seats is the max comparison supports — once the 2nd one lands,
    // jump straight to the compare screen instead of making the user find it.
    if (state.comparisons.length === 2) {
      this.navigateTo("compare");
    }
  }

  // Comparisons behave like a session: they persist across reloads in the
  // same browsing session, but auto-clear after COMPARE_SESSION_TTL_MS of
  // inactivity so stale picks from days ago don't linger forever.
  //
  // New photos now upload to the "seat-photos" Storage bucket and
  // baseball_seat_reviews.image_urls stores a short URL, but older rows saved before
  // that migration can still hold full base64 strings — so saving
  // state.comparisons as-is can still blow past localStorage's ~5-10MB
  // per-origin quota and throw an uncaught QuotaExceededError that used to
  // crash the whole page. Only lightweight fields go to localStorage; the
  // actual photos are re-fetched from Supabase on load (see
  // rehydrateComparisons).
  saveComparisons() {
    try {
      const lightweight = state.comparisons.map(item => ({
        key: item.key,
        category: item.category === "musical" ? "musical" : "baseball",
        stadiumName: item.stadiumName,
        blockName: item.blockName,
        seatName: item.seatName,
        reviewIds: Array.isArray(item.images)
          ? [...new Set(item.images.map(img => img.reviewId).filter(id => id != null))]
          : []
      }));
      localStorage.setItem("seatview_compare", JSON.stringify(lightweight));
      localStorage.setItem("seatview_compare_ts", String(Date.now()));
    } catch (e) {
      // Worst case the comparison list just doesn't survive a reload —
      // never let a storage quota issue take down the whole app.
      console.warn("Failed to persist comparisons (storage quota?):", e);
    }
  }

  loadComparisons() {
    const COMPARE_SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
    const ts = parseInt(localStorage.getItem("seatview_compare_ts") || "0", 10);
    const expired = !ts || (Date.now() - ts > COMPARE_SESSION_TTL_MS);
    if (expired) {
      localStorage.removeItem("seatview_compare");
      localStorage.removeItem("seatview_compare_ts");
      return [];
    }
    try {
      return JSON.parse(localStorage.getItem("seatview_compare") || "[]");
    } catch (e) {
      return [];
    }
  }

  // Looks up public nicknames (id, nickname only) for the given user ids via
  // the profiles_public view, so review lists never need to read a full
  // profiles row (which is locked down to owner-only access).
  async fetchNicknames(userIds) {
    const ids = [...new Set(userIds.filter(Boolean))];
    if (!supabaseClient || ids.length === 0) return {};
    const { data, error } = await supabaseClient
      .from('profiles_public')
      .select('id, nickname')
      .in('id', ids);
    if (error || !data) return {};
    const map = {};
    data.forEach(p => { map[p.id] = p.nickname; });
    return map;
  }

  // Re-fetches the actual photos/reviews for whatever lightweight comparison
  // entries were restored from localStorage, then re-renders if the user is
  // looking at the compare screen.
  async rehydrateComparisons() {
    if (!supabaseClient || state.comparisons.length === 0) return;

    const hydrated = [];
    for (const item of state.comparisons) {
      if (!item.reviewIds || item.reviewIds.length === 0) {
        hydrated.push(item);
        continue;
      }
      try {
        const isMusical = item.category === "musical";
        const { data: reviews } = await supabaseClient
          .from(isMusical ? 'musical_seat_reviews' : 'baseball_seat_reviews')
          .select('*')
          .in('id', item.reviewIds);

        const nickMap = await this.fetchNicknames((reviews || []).filter(r => !r.is_anonymous).map(r => r.user_id));
        const images = [];
        (reviews || []).forEach(rev => {
          (rev.image_urls || []).forEach(u => {
            images.push({
              url: u,
              reviewId: rev.id,
              comment: rev.content || "",
              uploader: rev.is_anonymous ? "익명" : (nickMap[rev.user_id] || "@등록자")
            });
          });
        });

        hydrated.push({ ...item, images, image: images[0] ? images[0].url : null, comment: images[0] ? images[0].comment : "" });
      } catch (e) {
        console.warn("Failed to rehydrate comparison item:", e);
        hydrated.push(item);
      }
    }

    state.comparisons = hydrated;
    if (state.currentView === "compare") {
      this.renderCompareView();
    }
  }

  removeCompareItem(key) {
    state.comparisons = state.comparisons.filter(item => item.key !== key);
    this.saveComparisons();
    this.updateCompareBadge();
    this.renderCompareView();
    this.showToast("🗑️", "비교 항목이 삭제되었습니다.");
  }

  clearComparison() {
    state.comparisons = [];
    localStorage.removeItem("seatview_compare");
    localStorage.removeItem("seatview_compare_ts");
    this.updateCompareBadge();
    this.renderCompareView();
    this.showToast("🗑️", "비교함이 비워졌습니다.");
  }

  // Shared markup for one compare column: image carousel (when the seat has
  // more than one photo) + the comment that belongs to whichever photo is
  // currently shown.
  buildCompareColumnHtml(item) {
    if (!state.compareImageIndices) state.compareImageIndices = {};
    const images = Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : (item.image ? [{ url: item.image, comment: item.comment }] : []);
    const idx = Math.min(state.compareImageIndices[item.key] || 0, Math.max(images.length - 1, 0));
    const current = images[idx];

    return `
      <div class="compare-header-info">
        <span class="compare-seat-badge">${item.stadiumName}</span>
        <div class="compare-seat-name">${item.blockName} ${item.seatName}</div>
      </div>
      <div class="compare-image-box" data-key="${item.key}">
        ${current ? `<img src="${current.url}" alt="좌석 시야">` : `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color: var(--text-muted); font-size:0.72rem;">등록된 사진이 없습니다</div>`}
        ${images.length > 1 ? `
          <button class="carousel-nav-btn prev" style="width: 36px; height: 36px;" onclick="app.navCompareImage('${item.key}', -1)"><i data-lucide="chevron-left"></i></button>
          <button class="carousel-nav-btn next" style="width: 36px; height: 36px;" onclick="app.navCompareImage('${item.key}', 1)"><i data-lucide="chevron-right"></i></button>
          <span style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.55); color: rgba(255,255,255,0.85); padding: 2px 8px; border-radius: 20px; font-size: 0.65rem; font-weight: 600;">${idx + 1} / ${images.length}</span>
        ` : ""}
      </div>
      <div class="compare-content">
        <div class="compare-comment">
          <h5>💬 코멘트</h5>
          <p>${current && current.comment ? this.escapeHtml(this.truncateComment(current.comment)) : "등록된 코멘트가 없습니다."}</p>
        </div>
      </div>
    `;
  }

  navCompareImage(key, delta) {
    if (!state.compareImageIndices) state.compareImageIndices = {};
    const item = state.comparisons.find(i => i.key === key);
    if (!item) return;
    const images = Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : (item.image ? [item.image] : []);
    if (images.length <= 1) return;
    const current = state.compareImageIndices[key] || 0;
    state.compareImageIndices[key] = (current + delta + images.length) % images.length;
    this.renderCompareView();
  }

  updateCompareBadge() {
    const badge = document.getElementById("compare-badge");
    if (!badge) return;

    const count = state.comparisons.length;
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = "flex";
    } else {
      badge.style.display = "none";
    }
  }

  renderCompareView() {
    const container = document.getElementById("compare-main-container");
    if (!container) return;

    container.innerHTML = "";

    const toolbar = document.getElementById("compare-toolbar");
    const countEl = document.getElementById("compare-count");
    if (toolbar) toolbar.style.display = state.comparisons.length > 0 ? "flex" : "none";
    if (countEl) countEl.textContent = state.comparisons.length;

    if (state.comparisons.length === 0) {
      container.innerHTML = `
        <div class="compare-empty">
          <div class="compare-empty-icon">
            <i data-lucide="columns"></i>
          </div>
          <h3>비교함이 비어 있습니다</h3>
          <p>좌석 상세에서 '1:1 비교함 담기'를 누르면 시야를 한눈에 비교해볼 수 있어요.</p>
          <button class="btn btn-primary" onclick="app.navigateTo('main')">좌석 둘러보러 가기</button>
        </div>
      `;
    } else if (state.comparisons.length === 1) {
      const item = state.comparisons[0];
      container.innerHTML = `
        <div class="compare-split-layout">
          <div class="compare-column">
            <button class="compare-remove-btn" onclick="app.removeCompareItem('${item.key}')">
              <i data-lucide="trash"></i>
            </button>
            ${this.buildCompareColumnHtml(item)}
          </div>
          <div class="compare-empty" style="padding: 20px; border-radius: 20px;">
            <div class="compare-empty-icon" style="margin-bottom: 8px;">
              <i data-lucide="plus"></i>
            </div>
            <p style="font-size: 0.72rem; line-height: 1.3;">비교할 두 번째 좌석을 찾아서 담아주세요!</p>
            <button class="btn btn-secondary" style="padding: 8px 12px; font-size: 0.72rem; border-radius: 8px;" onclick="app.navigateTo('stadiums')">좌석 추가</button>
          </div>
        </div>
      `;
    } else {
      // 2 items: Side by side split view
      const itemLeft = state.comparisons[0];
      const itemRight = state.comparisons[1];
      
      container.innerHTML = `
        <div class="compare-split-layout">
          <!-- Left Column -->
          <div class="compare-column">
            <button class="compare-remove-btn" onclick="app.removeCompareItem('${itemLeft.key}')">
              <i data-lucide="x"></i>
            </button>
            ${this.buildCompareColumnHtml(itemLeft)}
          </div>

          <!-- Right Column -->
          <div class="compare-column">
            <button class="compare-remove-btn" onclick="app.removeCompareItem('${itemRight.key}')">
              <i data-lucide="x"></i>
            </button>
            ${this.buildCompareColumnHtml(itemRight)}
          </div>
        </div>
      `;
    }
    lucide.createIcons();
  }

  // --- Ticketbook Feature ---
  async switchTicketbookCategory(category) {
    state.ticketbookCategory = category;
    document.querySelectorAll("#ticketbook-category-tabs .tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.category === category);
    });
    if (category === "musical") {
      // Always refetch rather than cache — a musical review can be added or
      // edited from the venue-detail seat grid without ever touching this
      // array, so a stale cache would silently miss it.
      await this.loadMusicalTickets();
    }
    this.renderTicketbook();
  }

  // Parallel to the baseball review fetch inside checkUserSession() — kept
  // separate and loaded lazily (only once, on first visit to the 공연장 탭)
  // since most sessions never touch it.
  async loadMusicalTickets() {
    state.musicalTickets = [];
    if (!supabaseClient || !state.userId) return;
    try {
      const { data: dbReviews, error } = await supabaseClient
        .from('musical_seat_reviews')
        .select('*')
        .eq('user_id', state.userId)
        .order('ins_dtm', { ascending: false });

      if (error || !dbReviews) return;

      const seatIds = [...new Set(dbReviews.map(r => r.musical_seat_id).filter(id => id != null))];
      let seatsById = {}, blocksById = {}, venuesById = {};

      if (seatIds.length > 0) {
        const { data: seatRows } = await supabaseClient.from('musical_seats').select('*').in('id', seatIds);
        (seatRows || []).forEach(s => { seatsById[s.id] = s; });

        const blockIds = [...new Set((seatRows || []).map(s => s.block_id).filter(id => id != null))];
        if (blockIds.length > 0) {
          const { data: blockRows } = await supabaseClient.from('musical_blocks').select('id, venue_id, floor, block_code, full_name, total_rows, max_seats, offset_x, offset_y, label_position, show_row_label').in('id', blockIds);
          (blockRows || []).forEach(b => { blocksById[b.id] = b; });

          const venueIds = [...new Set((blockRows || []).map(b => b.venue_id).filter(id => id != null))];
          if (venueIds.length > 0) {
            const { data: venueRows } = await supabaseClient.from('venues').select('*').in('id', venueIds);
            (venueRows || []).forEach(v => { venuesById[v.id] = v; });
          }
        }
      }

      state.musicalTickets = dbReviews.map(r => {
        const seatRow = seatsById[r.musical_seat_id];
        const blockRow = seatRow ? blocksById[seatRow.block_id] : null;
        const venueRow = blockRow ? venuesById[blockRow.venue_id] : null;

        return {
          id: r.id,
          seatId: r.musical_seat_id,
          ins_dtm: r.ins_dtm,
          stadiumName: venueRow ? venueRow.name : "기타 공연장",
          blockName: blockRow ? (blockRow.full_name || (blockRow.block_code ? blockRow.block_code + "구역" : "")) : "구역 정보 없음",
          seatName: this.formatSeatName(seatRow, !!(seatRow && seatRow.is_disabled_seat)),
          comment: r.content,
          image: r.image_urls && r.image_urls.length > 0 ? r.image_urls[0] : "",
          images: r.image_urls || [],
          isTicketVerified: !!r.is_ticket_verified
        };
      });
    } catch (e) {
      console.warn("Fetch musical seat reviews error:", e);
      state.musicalTickets = [];
    }
  }

  renderTicketbook() {
    const loginPrompt = document.getElementById("ticketbook-login-prompt");
    const statsCard = document.getElementById("ticketbook-stats-card");
    const heading = document.getElementById("ticketbook-heading");
    const archiveContainer = document.getElementById("tickets-archive-container");
    const footer = document.getElementById("my-page-footer");
    const categoryTabs = document.getElementById("ticketbook-category-tabs");
    const viewToggleBtn = document.getElementById("btn-ticket-view-toggle");
    const searchToggleBtn = document.getElementById("btn-ticket-search-toggle");

    if (!state.isLoggedIn) {
      if (loginPrompt) loginPrompt.style.display = "flex";
      if (statsCard) statsCard.style.display = "none";
      if (heading) heading.style.display = "none";
      if (archiveContainer) archiveContainer.innerHTML = "";
      if (footer) footer.style.display = "none";
      if (categoryTabs) categoryTabs.style.display = "none";
      if (viewToggleBtn) viewToggleBtn.style.display = "none";
      if (searchToggleBtn) searchToggleBtn.style.display = "none";
      // 검색창을 켜둔 채로 로그아웃했을 수 있으니, 다시 로그인했을 때
      // 열려있는 채로 남아있지 않도록 같이 닫아준다.
      const searchBox = document.getElementById("ticket-search-box");
      if (searchBox) searchBox.style.display = "none";
      lucide.createIcons();
      return;
    }

    if (loginPrompt) loginPrompt.style.display = "none";
    if (statsCard) statsCard.style.display = "";
    if (heading) heading.style.display = "";
    if (footer) footer.style.display = "block";
    if (categoryTabs) categoryTabs.style.display = "flex";
    if (viewToggleBtn) viewToggleBtn.style.display = "flex";
    if (searchToggleBtn) searchToggleBtn.style.display = "flex";

    if (!archiveContainer) return;

    this.applyTicketViewMode();
    archiveContainer.innerHTML = "";

    const activeCategory = state.ticketbookCategory === "musical" ? "musical" : "baseball";

    // Keep the tab buttons' visual state in sync with activeCategory on
    // every render, not just when switchTicketbookCategory() runs a click —
    // otherwise a stray "active" class left over from elsewhere (e.g. an
    // unrelated tab group sharing the same .tab-btn class) can leave both
    // tabs unhighlighted until the user clicks one.
    if (categoryTabs) {
      categoryTabs.querySelectorAll(".tab-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.category === activeCategory);
      });
    }

    const sourceTickets = activeCategory === "musical" ? (state.musicalTickets || []) : state.tickets;
    let sortedTickets = [...sourceTickets].sort((a, b) => new Date(b.ins_dtm) - new Date(a.ins_dtm));
    const total = sortedTickets.length;

    // Venue-name filter for the collapsible search box (see
    // toggleTicketSearch) — most people only register a handful of seats
    // and never need this, but a few register far more and lose track of
    // which ones they've already done.
    const searchInput = document.getElementById("ticket-search-input");
    const searchClearBtn = document.getElementById("ticket-search-clear-btn");
    if (searchClearBtn) searchClearBtn.style.display = (searchInput && searchInput.value.length > 0) ? "flex" : "none";
    const searchNeedle = searchInput ? searchInput.value.trim().toLowerCase() : "";
    if (searchNeedle) {
      sortedTickets = sortedTickets.filter(t => (t.stadiumName || "").toLowerCase().includes(searchNeedle));
    }

    // Update Stats Display
    // Top badge shows the combined report count across both baseball and
    // musical categories, regardless of which tab is currently active.
    // Musical count prefers the full loaded list (accurate after visiting the
    // 공연장 탭) and falls back to the lightweight count fetched at login.
    const musicalCount = state.musicalTickets ? state.musicalTickets.length : (state.musicalTicketCount || 0);
    const combinedTotal = (state.tickets ? state.tickets.length : 0) + musicalCount;
    const winRateTextEl = document.getElementById("win-rate-text");
    if (winRateTextEl) {
      winRateTextEl.textContent = `${combinedTotal}\uD68C`;
    }
    
    const summaryDescEl = document.getElementById("ticketbook-summary-desc");
    if (summaryDescEl) {
      summaryDescEl.textContent = `\uCD1D ${total}\uD68C \uC2DC\uC57C \uC81C\uBCF4 \uB4F1\uB85D`;
    }

    const circle = document.getElementById("win-rate-circle");
    if (circle) {
      circle.style.background = `radial-gradient(closest-side, var(--bg-card) 87%, transparent 88% 100%), conic-gradient(var(--accent-purple) 100%, var(--bg-input) 0)`;
    }

    const eventWidget = document.getElementById("ticketbook-event-widget");
    if (eventWidget) {
      const now = new Date();
      const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const monthlySubmissions = sortedTickets.filter(t => t.ins_dtm && t.ins_dtm.startsWith(currentYearMonth)).length;
      
      eventWidget.innerHTML = `
        <div class="ticketbook-event-icon">
          <i data-lucide="gift"></i>
        </div>
        <div class="ticketbook-event-content">
          <h4>\uD83C\uDF81 \uC774\uB2EC\uC758 \uC9C1\uAD00 \uC774\uBCA4\uD2B8 \uC751\uBAA8 \uD624\uD669</h4>
          <p>\uC774\uBC88 \uB2EC \uC2DC\uC57C \uC0AC\uC9C4 \uC81C\uBCF4 <span class="highlight">${monthlySubmissions}\uD68C</span>\uB85C \uACBD\uAE30\uAD00\uB78C\uAD8C \uCD94\uCCA8\uAD8C <span class="highlight">${monthlySubmissions}\uC7A5</span> \uC790\uB5D9 \uC801\uB9BD \uC644\uB8CC!</p>
        </div>
      `;
    }

    if (sortedTickets.length === 0) {
      // The empty-state card looks lopsided squeezed into one cell of the
      // 2-column album grid, so force list layout for it regardless of the
      // user's saved view-mode preference — that preference only matters
      // once there's an actual grid of cards to lay out.
      archiveContainer.classList.add("view-list");

      // A search with zero matches is a different situation from having no
      // registrations at all \u2014 showing "no registrations" plus a CTA to go
      // register would be misleading when the real list isn't empty.
      if (searchNeedle) {
        archiveContainer.innerHTML = `
          <div class="compare-empty" style="border-style: solid;">
            <div class="compare-empty-icon"><i data-lucide="search-x"></i></div>
            <h3>'${this.escapeHtml(searchInput.value.trim())}'\uC640(\uACFC) \uC77C\uCE58\uD558\uB294 \uACF5\uC5F0\uC7A5\uC774 \uC5C6\uC2B5\uB2C8\uB2E4</h3>
          </div>
        `;
        lucide.createIcons();
        return;
      }

      // \uD504\uB85C\uC57C\uAD6C\uC7A5\uC740 \uC544\uC9C1 \uC624\uD508 \uC804\uC774\uB77C \uD648 \uD654\uBA74 \uCE74\uD14C\uACE0\uB9AC \uCE74\uB4DC\uC640 \uB3D9\uC77C\uD558\uAC8C
      // "\uC900\uBE44 \uC911" \uC548\uB0B4\uB85C \uB9C9\uB294\uB2E4 \u2014 \uC2E4\uC81C \uC57C\uAD6C\uC7A5 \uBAA9\uB85D\uC73C\uB85C \uB4E4\uC5B4\uAC00\uC9C0\uC9C0 \uC54A\uAC8C.
      const emptyNavAction = activeCategory === "musical"
        ? "app.navigateTo('venues')"
        : "app.showCategoryComingSoon('\uD504\uB85C\uC57C\uAD6C\uC7A5')";
      const emptyLabel = activeCategory === "musical" ? "\uACF5\uC5F0\uC7A5 \uB458\uB7EC\uBCF4\uB7EC \uAC00\uAE30" : "\uC57C\uAD6C\uC7A5 \uB458\uB7EC\uBCF4\uB7EC \uAC00\uAE30";
      archiveContainer.innerHTML = `
        <div class="compare-empty" style="border-style: solid;">
          <div class="compare-empty-icon">
            <i data-lucide="${activeCategory === 'musical' ? 'drama' : 'book-open'}"></i>
          </div>
          <h3>\uB4F1\uB85D\uD558\uC2E0 \uAE30\uB85D\uC774 \uC5C6\uC2B5\uB2C8\uB2E4</h3>
          <p>\uC0C8\uB85C\uC6B4 \uC2DC\uC57C \uC0AC\uC9C4\uACFC \uD6C4\uAE30\uB97C \uB4F1\uB85D\uD574\uC11C<br>\uB098\uB9CC\uC758 \uC2DC\uC57C \uAE30\uB85D\uC744 \uB0A8\uACA8\uBCF4\uC138\uC694</p>
          <button class="add-ticket-btn" onclick="${emptyNavAction}" style="background: rgba(168, 85, 247, 0.15); border: 1.5px solid rgba(168, 85, 247, 0.3); color: #c084fc; font-weight: 700; font-size: 0.72rem; padding: 8px 14px; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; width: auto; height: auto; margin-top: 16px;">
            <i data-lucide="map-pin" style="width: 12px; height: 12px;"></i> ${emptyLabel}
          </button>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    sortedTickets.forEach(ticket => {
      const card = document.createElement("div");
      card.className = "ticket-card";
      card.style.cursor = "pointer";

      const photoCount = Array.isArray(ticket.images) ? ticket.images.length : 0;

      card.innerHTML = `
        <div class="ticket-img-header">
          <img src="${ticket.image}" alt="\uAD00\uC804 \uC2DC\uC57C \uC0AC\uC9C4">
          ${ticket.isTicketVerified ? `<span style="position: absolute; top: 8px; left: 8px; background: rgba(5, 150, 105, 0.9); color: #fff; font-size: 0.6rem; font-weight: 700; padding: 2px 7px; border-radius: 20px;">\u2713 \uC778\uC99D\uB428</span>` : ""}
          ${photoCount > 1 ? `<span style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.6); color: #fff; font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 20px; display: flex; align-items: center; gap: 3px;"><i data-lucide="images" style="width: 11px; height: 11px;"></i> ${photoCount}</span>` : ""}
        </div>
        <div class="ticket-body">
          <div class="ticket-meta-info" style="display: flex; align-items: baseline; justify-content: space-between; gap: 4px;">
            <span class="ticket-stadium-name">${ticket.stadiumName}</span>
            <span class="ticket-date">${ticket.ins_dtm ? new Date(ticket.ins_dtm).toISOString().split('T')[0].slice(2).replace(/-/g, '.') : ''}</span>
          </div>
          <h4 class="ticket-seat-info">${ticket.blockName} ${ticket.seatName}</h4>
          <p class="ticket-comment-preview">${ticket.comment ? this.escapeHtml(ticket.comment) : "\uB4F1\uB85D\uB41C \uAD00\uB78C\uD3C9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4."}</p>
        </div>
      `;
      if (ticket.seatId) {
        card.onclick = () => this.openSeatDetail(ticket.seatId, { ownReviewsOnly: true, category: activeCategory });
      }
      archiveContainer.appendChild(card);
    });
    lucide.createIcons();
  }

  // "맨 위로" 플로팅 버튼 클릭 핸들러 — 실제 스크롤러가 window든
  // .app-content든 상관없이 둘 다 부드럽게 최상단으로 스크롤한다(활성이
  // 아닌 쪽은 어차피 scrollTop이 이미 0이라 호출해도 아무 일도 안 일어남).
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.getElementById("app-content")?.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Shared "×" clear-button handler for search inputs — empties the field,
  // puts focus back so typing a new query doesn't need an extra click, and
  // re-runs whatever render function that search box drives.
  clearSearchInput(inputId, rerender) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.value = "";
    input.focus();
    if (typeof rerender === "function") rerender();
  }

  // 등록 폼의 별점 위젯 — 클릭한 별까지 채워서 표시하고 값은
  // #form-rating-stars의 data-value에 보관한다(네이티브 input이 아니라서
  // form.reset()이 못 건드리므로, 폼 리셋 지점마다 resetFormRating()을
  // 같이 불러줘야 함).
  setFormRating(value) {
    const container = document.getElementById("form-rating-stars");
    if (!container) return;
    container.dataset.value = String(value);
    container.querySelectorAll(".star-btn").forEach(btn => {
      btn.classList.toggle("filled", Number(btn.dataset.star) <= value);
    });
  }

  resetFormRating(value = 0) {
    this.setFormRating(value);
  }

  // 좌석 색상 5단계 — 실제 경계값은 관리자와 합의한 기준(4.5/3.5/2.5/1.5)
  // 그대로. avg가 유효하지 않으면(평점 있는 리뷰가 하나도 없으면) null을
  // 돌려줘서 호출부가 "사진 없음"과 동일하게 무색 처리하게 한다.
  ratingColorClass(avg) {
    if (typeof avg !== "number" || Number.isNaN(avg)) return null;
    if (avg >= 4.5) return "rating-green";
    if (avg >= 3.5) return "rating-lightgreen";
    if (avg >= 2.5) return "rating-yellow";
    if (avg >= 1.5) return "rating-orange";
    return "rating-red";
  }

  // Collapsible venue-name search for the ticket archive — tucked behind an
  // icon so it doesn't take up space for the majority of people who only
  // ever register a handful of seats and have nothing to search for.
  toggleTicketSearch() {
    const box = document.getElementById("ticket-search-box");
    const input = document.getElementById("ticket-search-input");
    if (!box) return;
    const opening = box.style.display === "none" || !box.style.display;
    box.style.display = opening ? "block" : "none";
    if (opening) {
      if (input) input.focus();
    } else if (input) {
      // Closing the box clears the search so the archive isn't left
      // silently filtered with no visible input to explain why.
      input.value = "";
      this.renderTicketbook();
    }
  }

  // Shopping-mall-style 1열/2열 toggle for the ticketbook grid. Defaults to
  // 2 columns; the choice is remembered in localStorage across visits.
  toggleTicketViewMode() {
    const current = localStorage.getItem("seatview_ticket_view") || "2col";
    const next = current === "2col" ? "1col" : "2col";
    localStorage.setItem("seatview_ticket_view", next);
    this.applyTicketViewMode();
  }

  applyTicketViewMode() {
    const mode = localStorage.getItem("seatview_ticket_view") || "2col";
    const container = document.getElementById("tickets-archive-container");
    const btn = document.getElementById("btn-ticket-view-toggle");
    if (container) container.classList.toggle("view-list", mode === "1col");
    if (btn) {
      // Icon shown is the mode a tap would switch TO.
      btn.innerHTML = mode === "2col"
        ? '<i data-lucide="list" style="width: 16px; height: 16px;"></i>'
        : '<i data-lucide="layout-grid" style="width: 16px; height: 16px;"></i>';
      if (window.lucide) lucide.createIcons();
    }
  }

  // --- Add to Ticketbook flow ---
  openAddTicketModal() {
    // Populate stadium dropdown list first
    const stadiumSelect = document.getElementById("form-stadium");
    if (stadiumSelect) {
      stadiumSelect.innerHTML = `<option value="">야구장을 선택하세요</option>` +
        STADIUMS_DB.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
    }

    // Reset form fields
    document.getElementById("add-ticket-form").reset();
    state.currentUploadedPhotoBase64 = null;

    // Reset previews
    const previewImg = document.getElementById("ticket-photo-preview");
    const placeholder = document.getElementById("upload-placeholder-content");
    if (previewImg) previewImg.style.display = "none";
    if (placeholder) placeholder.style.display = "flex";

    const ocrPreviewImg = document.getElementById("ticket-ocr-preview");
    const ocrPlaceholder = document.getElementById("ocr-placeholder-content");
    if (ocrPreviewImg) ocrPreviewImg.style.display = "none";
    if (ocrPlaceholder) ocrPlaceholder.style.display = "flex";

    // Show OCR scan simulation step since they are registering from My Page
    const ocrFormGroup = document.getElementById("ticket-ocr-box").closest(".form-group");
    if (ocrFormGroup) {
      ocrFormGroup.style.display = "block";
    }

    this.openModal("modal-add-ticket");
  }

  handleTicketOCRSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Show scanner overlay
    const overlay = document.getElementById("ocr-scanning-overlay");
    if (overlay) overlay.style.display = "flex";

    const reader = new FileReader();
    reader.onload = (event) => {
      // Simulate OCR scanning delay of 1.5 seconds
      setTimeout(() => {
        if (overlay) overlay.style.display = "none";

        const previewImg = document.getElementById("ticket-ocr-preview");
        const placeholder = document.getElementById("ocr-placeholder-content");
        
        if (previewImg) {
          previewImg.src = event.target.result;
          previewImg.style.display = "block";
        }
        if (placeholder) placeholder.style.display = "none";

        // Auto-populate OCR scanning mock values
        document.getElementById("form-stadium").value = "jamsil";
        document.getElementById("form-block").value = "101블록";
        document.getElementById("form-seat").value = "3열 4번";
        document.getElementById("form-match-date").value = "2026-07-22";
        document.getElementById("form-score").value = "LG 5 - 3 Doosan";

        // Trigger result calculation
        this.updateMatchResultAutomatically();

        this.showToast("✨", "티켓 OCR 분석이 완료되어 경기 정보가 자동 입력되었습니다!");
      }, 1500);
    };
    reader.readAsDataURL(file);
  }

  updateMatchResultAutomatically() {
    const cheeringTeam = document.getElementById("form-cheering-team").value;
    const scoreVal = document.getElementById("form-score").value.trim();
    const resultInput = document.getElementById("form-result");

    if (!resultInput) return;

    if (!cheeringTeam) {
      resultInput.value = "";
      return;
    }

    // Simple parser for KBO score, e.g. "LG 5 - 3 Doosan"
    if (scoreVal.includes("-")) {
      const parts = scoreVal.split("-");
      const scoreLeft = parseInt(parts[0].replace(/[^0-9]/g, "")) || 0;
      const scoreRight = parseInt(parts[1].replace(/[^0-9]/g, "")) || 0;
      
      const teamLeftMatch = parts[0].match(/[a-zA-Z가-힣]+/);
      const teamRightMatch = parts[1].match(/[a-zA-Z가-힣]+/);
      
      const teamLeft = teamLeftMatch ? teamLeftMatch[0].trim().toLowerCase() : "";
      const teamRight = teamRightMatch ? teamRightMatch[0].trim().toLowerCase() : "";
      
      const cheeringLower = cheeringTeam.toLowerCase();

      let winningTeam = "";
      if (scoreLeft > scoreRight) {
        winningTeam = teamLeft;
      } else if (scoreRight > scoreLeft) {
        winningTeam = teamRight;
      }

      if (scoreLeft === scoreRight) {
        resultInput.value = "무승부 🤝";
      } else if (cheeringLower.includes(winningTeam) || winningTeam.includes(cheeringLower)) {
        resultInput.value = "승리 🎉";
      } else {
        resultInput.value = "패배 😢";
      }
    } else {
      resultInput.value = "승리 🎉";
    }
  }

  // Tiled diagonal watermark, repeated across the whole image rather than
  // stamped once in a corner — a corner mark is trivial to crop out before
  // reposting, a repeating diagonal pattern isn't. Stroke+fill in opposite
  // tones so it stays legible on both bright and dark seat-view photos.
  drawDiagonalWatermark(ctx, width, height) {
    const text = "잘보여유.com";
    // Photos display inside a fixed 1:1 square with object-fit: contain, so
    // the on-screen scale is governed by whichever dimension is longer, not
    // by width alone — size off that dimension so the watermark reads the
    // same regardless of the photo's orientation.
    const fontSize = Math.max(14, Math.round(Math.max(width, height) * 0.025));
    ctx.save();
    ctx.font = `${fontSize}px 'Noto Sans KR', sans-serif`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.32)";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.24)";
    ctx.lineWidth = 1.2;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.translate(width / 2, height / 2);
    ctx.rotate(-Math.PI / 6);

    // Step scales with the canvas itself (not a fixed pixel gap) so the
    // repeat count holds regardless of photo resolution — but it used to
    // scale with a >=1x multiple of width/height, which meant the *next*
    // repeat always landed at or past the visible edge, so only ~1 copy
    // ever actually showed inside the frame. Dividing by ~3 instead of
    // multiplying guarantees at least a few real repeats fit inside the
    // visible width/height on both axes, independent of orientation.
    const textWidth = ctx.measureText(text).width;
    const stepX = Math.max(textWidth + 40, width / 2);
    const stepY = Math.max(fontSize * 4, height / 2);
    // Tile well past the canvas bounds so rotation doesn't leave gaps at
    // the corners.
    const diag = Math.sqrt(width * width + height * height);
    for (let y = -diag; y <= diag; y += stepY) {
      for (let x = -diag; x <= diag; x += stepX) {
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
      }
    }
    ctx.restore();
  }

  // Exact SHA-256 of the compressed file's bytes. Unlike a perceptual hash
  // (aHash etc.), this only ever matches a byte-for-byte identical file —
  // two genuinely different photos colliding by chance is practically
  // impossible (this was tried first as an 8x8 average-hash, but that
  // flagged visually-similar-but-different photos as duplicates too, e.g.
  // two adjacent seats' shots of the same stage, or even two solid-color
  // test swatches with matching average brightness — a real risk of
  // blocking an honest new submission). This only catches the exact-file
  // repost case, not a re-saved/recompressed copy of the same photo, but
  // every photo already goes through this app's own WebP compression on
  // upload, so a re-upload of "the same photo" downloaded and re-submitted
  // elsewhere still round-trips through identical compression here.
  async computeExactPhotoHash(blob) {
    const buf = await blob.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  // Looks up whether any of these photo hashes are already attached to a
  // review on a *different* seat — the same seat re-saving its own photo
  // (an edit) is fine, reposting it under a different seat is what this
  // catches. category-scoped only (a baseball photo reposted as a musical
  // one is out of scope for now).
  async checkDuplicatePhotoHashes(hashes, isMusical, excludeSeatId) {
    if (!supabaseClient || !hashes || hashes.length === 0) return null;
    const table = isMusical ? "musical_seat_reviews" : "baseball_seat_reviews";
    const seatFk = isMusical ? "musical_seat_id" : "baseball_seat_id";
    try {
      const { data, error } = await supabaseClient
        .from(table)
        .select(`id, ${seatFk}`)
        .overlaps("photo_hashes", hashes);
      if (error || !data) return null;
      return data.find(row => String(row[seatFk]) !== String(excludeSeatId)) || null;
    } catch (e) {
      console.warn("checkDuplicatePhotoHashes failed:", e);
      return null;
    }
  }

  compressImageToWebP(file, maxWidth = 1024, quality = 0.7) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Scale by whichever side is longer — width-only checks left a
          // tall portrait photo (width under maxWidth, height far past it)
          // completely uncompressed, which also fed the watermark tiler a
          // much taller canvas than intended (see drawDiagonalWatermark).
          const longSide = Math.max(width, height);
          if (longSide > maxWidth) {
            const scale = maxWidth / longSide;
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          this.drawDiagonalWatermark(ctx, width, height);

          const webpBase64 = canvas.toDataURL("image/webp", quality);
          resolve(webpBase64);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Same compression pipeline as compressImageToWebP, but resolves a Blob
  // instead of a base64 data URI — Blobs upload directly to Supabase Storage
  // without the ~33% base64 size overhead.
  compressImageToWebPBlob(file, maxWidth = 1024, quality = 0.7) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Scale by whichever side is longer — width-only checks left a
          // tall portrait photo (width under maxWidth, height far past it)
          // completely uncompressed, which also fed the watermark tiler a
          // much taller canvas than intended (see drawDiagonalWatermark).
          const longSide = Math.max(width, height);
          if (longSide > maxWidth) {
            const scale = maxWidth / longSide;
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          this.drawDiagonalWatermark(ctx, width, height);

          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("WebP 변환 실패"));
          }, "image/webp", quality);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // compressImageToWebPBlob asks canvas.toBlob for "image/webp", but some
  // in-app browsers (e.g. Naver Blog's iOS in-app browser) silently fall
  // back to a different format when they don't support WebP encoding —
  // the spec requires toBlob to still report the format it actually used
  // via blob.type, it just doesn't throw or reject when it can't honor the
  // request. Trusting that real type (instead of hardcoding "image/webp")
  // keeps the upload's declared Content-Type honest regardless of what the
  // browser actually produced.
  extensionForMimeType(mimeType) {
    const map = { "image/webp": "webp", "image/png": "png", "image/jpeg": "jpg", "image/gif": "gif" };
    return map[mimeType] || (mimeType || "").split("/")[1] || "jpg";
  }

  // Uploads a compressed seat-view photo to the "seat-photos" Supabase
  // Storage bucket and returns its public URL. Path is namespaced by user id
  // purely to keep files organized in the bucket browser.
  async uploadSeatPhoto(blob) {
    const prefix = state.userId ? String(state.userId) : "guest";
    const contentType = blob.type || "image/webp";
    const fileName = `${prefix}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${this.extensionForMimeType(contentType)}`;
    // Filenames are timestamp+random and never reused (upsert: false), so
    // the content behind a given URL never changes — safe to cache for as
    // long as browsers/CDN will let us (1 year) instead of the "no-cache"
    // default, which was forcing a revalidation round-trip on every single
    // view of a photo that was never going to change.
    const { error } = await supabaseClient.storage
      .from("seat-photos")
      .upload(fileName, blob, { contentType, upsert: false, cacheControl: "31536000" });
    if (error) throw error;
    const { data } = supabaseClient.storage.from("seat-photos").getPublicUrl(fileName);
    return data.publicUrl;
  }

  // Photos are compressed and object-URL-previewed immediately on selection,
  // but the actual Storage upload is deferred until the user hits 저장/수정
  // 완료 — so an abandoned form or a removed-before-save photo never touches
  // the bucket at all, and there's nothing to clean up for that case.
  // tempUploadedPhotos entries are either {type:"existing", url} (already
  // hosted, from editing a saved review) or {type:"new", blob, previewUrl}
  // (picked this session, not yet uploaded).
  async resolveFinalImageUrls(photos) {
    const results = [];
    for (const p of photos) {
      if (p && p.type === "existing") {
        results.push(p.url);
      } else if (p && p.type === "new") {
        const url = await this.uploadSeatPhoto(p.blob);
        if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
        results.push(url);
      } else if (typeof p === "string") {
        results.push(p); // defensive fallback, shouldn't normally occur
      }
    }
    return results;
  }

  // Best-effort cleanup for photos removed from a review (edit) or a whole
  // deleted review — never throws, since a stray orphaned file in the bucket
  // is harmless and shouldn't block the user-facing action that triggered it.
  // Silently ignores non-storage URLs (e.g. legacy base64 rows from before
  // the Storage migration) since there's nothing to remove for those.
  async deleteSeatPhotosFromStorage(urls) {
    if (!supabaseClient || !urls || urls.length === 0) return;
    const marker = "/object/public/seat-photos/";
    const paths = urls
      .filter(u => typeof u === "string" && u.includes(marker))
      .map(u => u.split(marker)[1]);
    if (paths.length === 0) return;
    try {
      const { error } = await supabaseClient.storage.from("seat-photos").remove(paths);
      if (error) console.warn("Seat photo storage cleanup warning:", error);
    } catch (e) {
      console.warn("Seat photo storage cleanup error:", e);
    }
  }

  // Ticket photos go to a *private* bucket, separate from seat-photos —
  // unlike seat-view photos (meant to be public), a ticket photo can show a
  // real name/booking number, and anyone with the public anon key can query
  // ticket_photo_url straight off the reviews table regardless of what the
  // UI shows other users. Storing it in a public bucket meant that URL was
  // directly fetchable by anyone who bothered to query the table, even
  // though no page ever links to it. Returns a storage *path*, not a URL —
  // there's no such thing as a usable public URL for a private object, so
  // every reader (this client's own preview, admin's review queue) has to
  // turn the path into a short-lived signed URL on demand instead.
  async uploadTicketPhoto(blob) {
    // The "ticket-photos" bucket's INSERT policy requires the path's first
    // folder segment to exactly equal auth.uid() (unlike seat-photos, which
    // just requires being logged in, path notwithstanding). state.userId is
    // normally that same id, but right after a fresh Kakao login it can
    // still be stale for a moment (checkUserSession() racing the OAuth
    // redirect's async session write — see its comment in init()); a ticket
    // photo saved in that window got its path built from the stale value
    // and was rejected by the policy. Re-reading the session right here
    // guarantees the folder name always matches the id RLS actually checks.
    let prefix = state.userId ? String(state.userId) : "guest";
    if (supabaseClient) {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session && session.user) prefix = session.user.id;
      } catch (e) {
        // fall back to state.userId (or "guest") above
      }
    }
    const contentType = blob.type || "image/webp";
    const fileName = `${prefix}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${this.extensionForMimeType(contentType)}`;
    const { error } = await supabaseClient.storage
      .from("ticket-photos")
      .upload(fileName, blob, { contentType, upsert: false });
    if (error) throw error;
    return fileName;
  }

  async deleteTicketPhotosFromStorage(paths) {
    if (!supabaseClient || !paths || paths.length === 0) return;
    const clean = paths.filter(p => typeof p === "string" && p);
    if (clean.length === 0) return;
    try {
      const { error } = await supabaseClient.storage.from("ticket-photos").remove(clean);
      if (error) console.warn("Ticket photo storage cleanup warning:", error);
    } catch (e) {
      console.warn("Ticket photo storage cleanup error:", e);
    }
  }

  // Short-lived (10 min) signed URL so the owner can preview their own
  // pending ticket photo without the bucket needing to be public.
  async getTicketPhotoSignedUrl(path) {
    if (!supabaseClient || !path) return "";
    try {
      const { data, error } = await supabaseClient.storage.from("ticket-photos").createSignedUrl(path, 600);
      if (error) throw error;
      return (data && data.signedUrl) || "";
    } catch (e) {
      console.warn("Ticket photo signed URL error:", e);
      return "";
    }
  }

  async handleTicketPhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const webpData = await this.compressImageToWebP(file);
      state.currentUploadedPhotoBase64 = webpData;
      
      const previewImg = document.getElementById("ticket-photo-preview");
      const placeholder = document.getElementById("upload-placeholder-content");
      
      if (previewImg) {
        previewImg.src = webpData;
        previewImg.style.display = "block";
      }
      if (placeholder) {
        placeholder.style.display = "none";
      }
    } catch (err) {
      console.error("Image compression error:", err);
    }
  }

  // Only these two platforms are allowed — driving traffic to the poster's
  // own blog/SNS is the whole point, but an open-ended URL field would let
  // anyone link anywhere, so it's restricted to domains we can label with
  // confidence in the UI (see ext-link-badge below).
  normalizeExternalLink(raw) {
    const v = (raw || "").trim();
    if (!v) return "";
    return /^https?:\/\//i.test(v) ? v : `https://${v}`;
  }

  // Wheelchair spaces are often a marked area rather than a numbered seat,
  // so seat_num can be null — showing that raw renders as the literal
  // string "null번" (see openSeatDetail's own inline version of this same
  // logic, kept separate there since it also folds in the per-floor
  // showRowNum check).
  formatSeatName(seatRow, isWheelchairSeat, showRowNum = true) {
    if (!seatRow) return "좌석 정보 없음";
    const hasSeatNum = seatRow.seat_num !== null && seatRow.seat_num !== undefined && seatRow.seat_num !== "";
    if (!hasSeatNum) {
      return isWheelchairSeat
        ? (showRowNum ? `${seatRow.row_num}열 장애인석` : "장애인석")
        : (showRowNum ? `${seatRow.row_num}열` : "좌석 정보 없음");
    }
    let name = showRowNum ? `${seatRow.row_num}열 ${seatRow.seat_num}번` : `${seatRow.seat_num}번`;
    if (isWheelchairSeat) name += " (장애인석)";
    return name;
  }

  detectExternalLinkPlatform(url) {
    if (!url) return null;
    try {
      // Naver's mobile blog links come from m.blog.naver.com, not just the
      // bare domain — strip a leading www./m. the same way so both work.
      // 호스트 이름만 보면 "javascript://blog.naver.com/%0Aalert(1)" 같은
      // 값이 통과해서, 링크를 누르는 순간 스크립트가 실행된다 — http(s)만 허용.
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
      const host = parsed.hostname.replace(/^(www\.|m\.)/i, "").toLowerCase();
      if (host === "blog.naver.com") return "naver";
      if (host === "instagram.com") return "instagram";
      return null;
    } catch (e) {
      return null;
    }
  }

  async saveNewTicket(e) {
    e.preventDefault();
    const isMusical = state.activeModalCategory === "musical";

    // Snapshot every mutable state.* field this function reads AFTER an
    // await, taken before the first await runs. Photo uploads (and the
    // duplicate/OCR checks before them) can take a few seconds — if the
    // user closes this modal mid-submission and opens a DIFFERENT seat's
    // form (or a fresh registration) before this call resolves, those
    // global state fields get overwritten out from under it. Without this
    // snapshot, the submission that finally reaches the actual insert/
    // update below would silently use the *other* seat's key, photos, or
    // (worst case) find state.activeModalSeatKey no longer parses as a
    // valid seat id — which skips the insert entirely while the code still
    // falls through to the success toast, producing exactly the "toast
    // says done but nothing saved" symptom. Arrays are captured by
    // reference, which is safe here because every reset elsewhere
    // reassigns a fresh array (`state.x = []`) rather than mutating this
    // one in place.
    const formSnapshot = {
      editingReviewId: state.editingReviewId,
      activeModalSeatKey: state.activeModalSeatKey,
      tempUploadedPhotos: state.tempUploadedPhotos,
      ticketVerified: state.ticketVerified,
      ticketPhotoRemovedExisting: state.ticketPhotoRemovedExisting,
      editingOriginalPhotos: state.editingOriginalPhotos,
      pendingTicketPhotoBlob: state.pendingTicketPhotoBlob,
      userId: state.userId,
      userEmail: state.userEmail
    };

    // Disable submit button immediately to prevent duplicate submissions
    const submitBtn = e.target.querySelector("button[type='submit']");
    let originalBtnHtml = "";
    if (submitBtn) {
      submitBtn.disabled = true;
      originalBtnHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = "<i class='spinner-border' style='width: 14px; height: 14px; margin-right: 6px; border: 2px solid; border-top-color: transparent; border-radius: 50%; display: inline-block; animation: spin 0.8s linear infinite; vertical-align: middle;'></i>\uB4F1\uB85D \uC911...";
    }

    // Photo upload is mandatory (supports both tempUploadedPhotos and currentUploadedPhotoBase64)
    const hasPhotos = formSnapshot.tempUploadedPhotos && formSnapshot.tempUploadedPhotos.length > 0;
    if (!hasPhotos && !state.currentUploadedPhotoBase64) {
      await this.showAlertDialog("사진 업로드 필요", "시야 등록을 위해 실제 좌석 시야 사진 업로드는 필수입니다.");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
      return;
    }

    // 시야 별점도 사진과 마찬가지로 필수 — 공연장(뮤지컬) 카테고리에만
    // 해당하고, 야구장은 필드 자체가 없어서 검사하지 않는다. 단, 공연장이
    // 공식 제공한 시야 사진을 그대로 캡처해서 올리는 "잘보여유 에디터"
    // 운영 계정(dreamiter@naver.com)은 본인이 직접 관람한 게 아니라서
    // 별점을 매기는 게 오히려 왜곡이라 이 계정만 필수 검증에서 제외한다.
    const RATING_EXEMPT_EMAILS = ["dreamiter@naver.com"];
    const isRatingExemptAccount = RATING_EXEMPT_EMAILS.includes(formSnapshot.userEmail);
    const ratingContainer = document.getElementById("form-rating-stars");
    const ratingVal = isMusical && ratingContainer ? parseInt(ratingContainer.dataset.value, 10) || 0 : 0;
    if (isMusical && !isRatingExemptAccount && ratingVal < 1) {
      await this.showAlertDialog("별점 선택 필요", "이 자리에서 시야가 얼마나 좋았는지 별점을 선택해 주세요.");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
      return;
    }

    // One seat-view report per seat per user. This is mainly a race-condition
    // backstop now — the real check happens at click-time in
    // addCurrentSeatToTicketbook(), before the user fills out the form.
    if (!formSnapshot.editingReviewId) {
      const dbKeyForCheck = formSnapshot.activeModalSeatKey;
      const realSeatIdForCheck = /^\d+$/.test(String(dbKeyForCheck)) ? parseInt(dbKeyForCheck, 10) : null;
      if (await this.hasExistingSeatReview(realSeatIdForCheck, isMusical)) {
        await this.showAlertDialog("중복 등록 불가", "이 좌석에는 이미 시야 사진을 등록하셨습니다.\n\n한 좌석당 1인 1건만 등록할 수 있어요. 기존 등록 내역은 마이페이지에서 수정하거나 삭제할 수 있습니다.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
        return;
      }

      // Same photo reposted under a different seat — catches copy/paste
      // reuse (own or someone else's photo) rather than a genuine new-seat
      // submission. Only checked for brand-new reviews; edits to an
      // existing review's own photos are left alone.
      const newHashes = (formSnapshot.tempUploadedPhotos || [])
        .filter(p => p.type === "new" && p.hash)
        .map(p => p.hash);
      const dupe = await this.checkDuplicatePhotoHashes(newHashes, isMusical, realSeatIdForCheck);
      if (dupe) {
        await this.showAlertDialog("등록 불가", "이미 다른 좌석에 등록된 사진과 동일합니다.\n\n본인이 실제로 관람한 좌석에서 촬영한 사진만 등록해 주세요.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
        return;
      }
    }

    const stadiumId = document.getElementById("form-stadium").value;
    const stadium = STADIUMS_DB.find(st => st.id === stadiumId);
    const blockVal = document.getElementById("form-block").value.trim();
    const seatVal = document.getElementById("form-seat").value.trim();
    const dateEl = document.getElementById("form-match-date");
    const resultEl = document.getElementById("form-result");
    const scoreEl = document.getElementById("form-score");
    const dateVal = dateEl ? dateEl.value : "";
    const resultVal = resultEl ? resultEl.value : "\uC2B9\uB9AC \uD83C\uDF89";
    const scoreVal = scoreEl ? scoreEl.value.trim() : "";
    const commentVal = document.getElementById("form-comment").value.trim();
    const nickToggleEl = document.getElementById("form-show-nickname-toggle");
    const isAnonymous = nickToggleEl ? !nickToggleEl.checked : false;

    const externalLinkRaw = document.getElementById("form-external-link").value.trim();
    let externalLinkVal = null;
    if (externalLinkRaw) {
      const normalizedLink = this.normalizeExternalLink(externalLinkRaw);
      if (!this.detectExternalLinkPlatform(normalizedLink)) {
        await this.showAlertDialog("링크 오류", "네이버 블로그(blog.naver.com) 또는 인스타그램(instagram.com) 링크만 등록할 수 있어요.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
        return;
      }
      externalLinkVal = normalizedLink;
    }

    // Upload any not-yet-uploaded photos to Storage now that the user has
    // actually confirmed the submission (existing/already-hosted photos in
    // an edit pass straight through unchanged).
    let finalImagesList;
    try {
      finalImagesList = (formSnapshot.tempUploadedPhotos && formSnapshot.tempUploadedPhotos.length > 0)
        ? await this.resolveFinalImageUrls(formSnapshot.tempUploadedPhotos)
        : [state.currentUploadedPhotoBase64];
    } catch (err) {
      console.error("Photo upload error:", err);
      this.showToast("❌", "사진 업로드 중 오류가 발생했습니다. 다시 시도해 주세요.");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
      return;
    }
    const finalImage = finalImagesList[0];

    // Ticket photo attached via "좌석 인증(티켓)" — upload now only if a new
    // one was picked this session. Goes to the private "ticket-photos"
    // bucket (see uploadTicketPhoto) — the admin panel deletes it the
    // moment a decision is made, so it never lingers, and it's never public
    // in the meantime either. Left out of the payload entirely on edits
    // where nothing new was chosen, so an already-pending (or
    // already-cleared) value isn't accidentally overwritten. Despite the
    // name, this now holds a storage *path*, not a URL.
    let newTicketPhotoUrl = null;
    if (formSnapshot.pendingTicketPhotoBlob) {
      try {
        newTicketPhotoUrl = await this.uploadTicketPhoto(formSnapshot.pendingTicketPhotoBlob);
      } catch (err) {
        console.error("Ticket photo upload error:", err);
        this.showToast("❌", "티켓 사진 업로드 중 오류가 발생했습니다. 다시 시도해 주세요.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
        return;
      }
    }

    // Editing an existing review (opened via 기록 수정) updates that one row
    // instead of creating a new ticket/review.
    if (formSnapshot.editingReviewId) {
      try {
        const updatePayload = {
          image_urls: finalImagesList,
          content: commentVal,
          is_anonymous: isAnonymous,
          external_link: externalLinkVal,
          watched_date: dateVal || null,
          is_ticket_verified: !!formSnapshot.ticketVerified,
          mod_dtm: new Date().toISOString()
        };
        // ratingVal은 미선택 시 0인데, DB 체크 제약은 null이거나 1~5만
        // 허용한다 — 별점 예외 계정이 0으로 저장 시도하면 제약 위반으로
        // 저장 자체가 실패하므로 0을 null로 변환해서 보낸다.
        if (isMusical) updatePayload.rating = ratingVal || null;
        if (newTicketPhotoUrl) {
          updatePayload.ticket_photo_url = newTicketPhotoUrl;
        } else if (formSnapshot.ticketPhotoRemovedExisting) {
          // "x" on a previously-attached (already-uploaded) pending photo —
          // clear it rather than leaving it dangling as a pending review
          // for a photo the user no longer wants attached.
          updatePayload.ticket_photo_url = null;
        }
        const { error } = await supabaseClient
          .from(isMusical ? 'musical_seat_reviews' : 'baseball_seat_reviews')
          .update(updatePayload)
          .eq('id', formSnapshot.editingReviewId)
          .eq('user_id', formSnapshot.userId);
        if (error) throw error;

        // Now that the DB row no longer references the old list, it's safe
        // to delete any photos the user removed during this edit.
        const removedUrls = (formSnapshot.editingOriginalPhotos || []).filter(u => !finalImagesList.includes(u));
        this.deleteSeatPhotosFromStorage(removedUrls);
        if (formSnapshot.ticketPhotoRemovedExisting && !newTicketPhotoUrl) {
          this.deleteTicketPhotosFromStorage([formSnapshot.ticketPhotoRemovedExisting]);
        }
        state.editingOriginalPhotos = null;

        state.editingReviewId = null;
        const titleEl = document.getElementById("add-ticket-modal-title");
        if (titleEl) titleEl.textContent = "좌석 시야 사진 등록";
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }

        this.closeModal("modal-add-ticket");
        // Editing (unlike a brand-new submission) is only ever reached from
        // 마이페이지's ownReviewsOnly card, for both categories — so this
        // should always return there, same as baseball, not to venue-detail.
        if (isMusical) {
          await this.loadMusicalTickets();
        } else {
          await this.checkUserSession();
        }
        this.renderTicketbook();
        this.navigateTo("ticketbook");
        this.showToast("✅", "시야 기록이 수정되었습니다!");
      } catch (error) {
        console.error("Supabase review update error:", error);
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
        await this.showAlertDialog("수정 실패", "기록 수정 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      }
      return;
    }

    // Musical submissions don't get a local seatview_tickets/SEAT_VIEWS_DB
    // cache entry — that cache only backs the baseball ticketbook list and
    // the demo-seat placeholder path, neither of which musical uses.
    if (!isMusical) {
      const newTicket = {
        id: "ticket_" + Date.now(),
        ins_dtm: new Date().toISOString(), // store creation time for the 3-day policy
        stadiumId: stadiumId,
        stadiumName: stadium ? stadium.name : "기타 구장",
        blockName: blockVal,
        seatName: seatVal,
        matchDate: dateVal,
        result: resultVal,
        score: scoreVal,
        comment: commentVal,
        image: finalImage,
        images: finalImagesList
      };

      state.tickets.push(newTicket);
      localStorage.setItem("seatview_tickets", JSON.stringify(state.tickets));

      if (!SEAT_VIEWS_DB[formSnapshot.activeModalSeatKey]) {
        SEAT_VIEWS_DB[formSnapshot.activeModalSeatKey] = {
          stadiumName: newTicket.stadiumName,
          blockName: blockVal,
          seatName: seatVal,
          image: finalImage,
          images: finalImagesList,
          uploader: isAnonymous ? "익명" : state.userNickname,
          uploaderBadge: isAnonymous ? "일반 등록자" : "골드 등록자",
          upvotes: 0,
          downvotes: 0,
          userVoted: null,
          tags: [resultVal === "승리" ? "✅ 직관 승요 기운" : "⚠️ 아쉬운 패배 기운", "✅ 직접 등록"],
          comment: commentVal || "유저가 직접 아카이빙한 소중한 시야 등록 데이터입니다."
        };
      }
    }

    // Use the same seat key the detail modal opened with (real baseball_seats.id
    // or musical_seats.id for DB-backed seats, or a demo/composite string for
    // placeholder baseball seats that have no matching row in baseball_seats).
    const dbKey = formSnapshot.activeModalSeatKey;
    const realSeatId = /^\d+$/.test(String(dbKey)) ? parseInt(dbKey, 10) : null;

    // Musical never has a demo/placeholder seat path (unlike baseball) — a
    // null realSeatId here always means something went wrong (formerly: the
    // race this whole snapshot exists to prevent), never a legitimate
    // local-only case. Surface it instead of silently skipping the insert
    // and falling through to the success toast below with nothing saved.
    if (isMusical && realSeatId === null) {
      console.error("saveNewTicket: musical realSeatId came back null", { dbKey });
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
      await this.showAlertDialog("등록 실패", "좌석 정보를 확인하지 못해 저장하지 못했습니다. 다시 시도해 주세요.");
      return;
    }

    // Save to Supabase (only for real DB-backed seats — demo/placeholder
    // baseball seats have no matching row, so the FK constraint would
    // reject them; those stay local-only, same as before)
    if (supabaseClient && formSnapshot.userId && realSeatId !== null) {
      try {
        const photoHashesForInsert = (formSnapshot.tempUploadedPhotos || []).map(p => p.hash || null);
        // What "인증됨" actually vouches for is the seat (venue/floor/block/
        // seat number) matching the ticket — not the watched date, which is
        // just metadata. state.ticketVerified is only ever true while the
        // seat currently loaded in this form is exactly the one OCR
        // matched: opening the form manually (including via the "다른
        // 좌석인가요?" escape hatch) always calls resetTicketVerifiedState()
        // first, so there's no path where the seat changes underneath an
        // still-true flag.
        const isTicketVerified = !!formSnapshot.ticketVerified;
        const insertPayload = isMusical
          ? { musical_seat_id: realSeatId, user_id: formSnapshot.userId, image_urls: finalImagesList, photo_hashes: photoHashesForInsert, is_ticket_verified: isTicketVerified, ticket_photo_url: newTicketPhotoUrl, content: commentVal, is_anonymous: isAnonymous, external_link: externalLinkVal, watched_date: dateVal || null, rating: ratingVal || null }
          : { baseball_seat_id: realSeatId, user_id: formSnapshot.userId, image_urls: finalImagesList, photo_hashes: photoHashesForInsert, is_ticket_verified: isTicketVerified, ticket_photo_url: newTicketPhotoUrl, content: commentVal, is_anonymous: isAnonymous, external_link: externalLinkVal, watched_date: dateVal || null };

        const { error } = await supabaseClient
          .from(isMusical ? 'musical_seat_reviews' : 'baseball_seat_reviews')
          .insert(insertPayload);
        if (error) throw error;

        // Reload from DB to get actual autogenerated integer IDs and pick
        // up the just-added review — without this, 마이페이지 kept showing
        // stale data (the local state.tickets/musicalTickets array from
        // whenever it was last loaded) until a full page refresh.
        if (isMusical) await this.loadMusicalTickets();
        else await this.checkUserSession();

        // Same staleness problem hits the venue list's review-count sort —
        // it's only ever computed once at app init, so a fresh registration
        // never bumps this venue up the list until a full page reload.
        if (isMusical) this.loadVenues().then(() => this.renderVenueList());
      } catch (error) {
        console.warn("Supabase review insert warning:", error);
        // Every branch here must return (never fall through) — this used to
        // only special-case 23505 and let any other error (a DB-side rate
        // limit trigger, a network blip, etc.) silently drop through to the
        // success toast/modal-close below with nothing actually saved. That
        // exact "success toast, nothing saved" symptom was traced to a DB
        // rate-limit trigger firing on musical_seat_reviews (Postgres logs:
        // "Rate limit exceeded: too many reviews submitted recently",
        // P0001) — this branch existed before that trigger and never
        // handled it, or anything else, as a real failure.
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
        if (error && error.code === '23505') {
          // Unique-constraint violation means the app-level pre-check above
          // lost a race (e.g. the same seat submitted from two tabs at once).
          await this.showAlertDialog("중복 등록 불가", "이 좌석에는 이미 시야 사진을 등록하셨습니다.\n\n한 좌석당 1인 1건만 등록할 수 있어요.");
        } else if (error && error.message && error.message.includes("Rate limit exceeded")) {
          await this.showAlertDialog("잠시만 기다려 주세요", "짧은 시간에 너무 많은 시야 정보가 등록되어 잠시 제한되었습니다.\n몇 분 후 다시 시도해 주세요.");
        } else {
          await this.showAlertDialog("등록 실패", "시야 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.");
        }
        return;
      }
    }

    // Restore the submit button so it isn't stuck in the loading state the
    // next time this same modal is reopened for another seat.
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }

    this.closeModal("modal-add-ticket");
    if (isMusical) {
      if (state.selectedVenueFloor) this.renderVenueFloorGrid(state.selectedVenueFloor);
      this.navigateTo("venue-detail");
    } else {
      this.renderTicketbook();
      this.navigateTo("ticketbook");
    }
    this.showToast("🎉", isMusical ? "새로운 시야 정보가 등록되었습니다!" : "새로운 직관 기록과 시야 정보가 등록되었습니다!");
  }

  // Auto-populate block if stadium in modal changed
  handleFormStadiumChange() {
    // Simple helper if form needs block hints
  }

  async deleteTicket(id) {
    // deleteCurrentModalReview() calls this right after the seat-detail
    // modal was open, so activeModalCategory still reflects which list/
    // table this delete actually belongs to.
    const isMusical = state.activeModalCategory === "musical";
    const sourceList = isMusical ? (state.musicalTickets || []) : state.tickets;

    // The onclick attribute passes id as a quoted string, but DB-backed
    // ticket.id values are numbers — compare as strings so this always matches.
    const ticket = sourceList.find(t => String(t.id) === String(id));
    if (ticket) {
      // 3-day deletion window check
      const createdTime = new Date(ticket.ins_dtm || ticket.matchDate);
      const diffTime = Math.abs(new Date() - createdTime);
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      if (diffDays > 3) {
        await this.showAlertDialog("삭제할 수 없어요", "등록 후 3일이 경과한 시야 사진 및 기록은 직접 삭제가 불가능합니다.\n\n삭제가 필요하신 경우 고객센터 이메일(j2mi.help@gmail.com)로 요청주시기 바랍니다.");
        return;
      }
    }

    const confirmed = await this.showConfirmDialog("기록 삭제", "정말 이 시야 기록을 삭제하시겠습니까?", { okText: "삭제", cancelText: "취소" });
    if (!confirmed) return;

    if (supabaseClient && state.userId) {
      try {
        const { error } = await supabaseClient
          .from(isMusical ? 'musical_seat_reviews' : 'baseball_seat_reviews')
          .delete()
          .eq('id', id)
          .eq('user_id', state.userId);
        if (error) throw error;
      } catch (e) {
        console.error("Supabase review delete error:", e);
        this.showToast("❌", "데이터베이스 삭제 중 오류가 발생했습니다.");
        return;
      }
    }

    // The review row itself is gone now, so its photo files are safe to remove.
    if (ticket && ticket.images) {
      this.deleteSeatPhotosFromStorage(ticket.images);
    }

    if (isMusical) {
      state.musicalTickets = (state.musicalTickets || []).filter(t => String(t.id) !== String(id));
      this.loadVenues().then(() => this.renderVenueList());
    } else {
      state.tickets = state.tickets.filter(t => String(t.id) !== String(id));
      localStorage.setItem("seatview_tickets", JSON.stringify(state.tickets));
    }
    this.renderTicketbook();
    this.showToast("🗑️", "기록이 삭제되었습니다.");
  }

  // Shared by the click-time check in addCurrentSeatToTicketbook() and the
  // submit-time backstop in saveNewTicket().
  async hasExistingSeatReview(realSeatId, isMusical) {
    if (!supabaseClient || !state.userId || realSeatId === null) return false;
    try {
      const { data, error } = await supabaseClient
        .from(isMusical ? 'musical_seat_reviews' : 'baseball_seat_reviews')
        .select('id')
        .eq(isMusical ? 'musical_seat_id' : 'baseball_seat_id', realSeatId)
        .eq('user_id', state.userId)
        .limit(1);
      return !error && data && data.length > 0;
    } catch (e) {
      console.warn("Duplicate seat review check error:", e);
      return false;
    }
  }

  // --- Ticket-photo OCR shortcut (header camera icon) ---------------------
  // Scans a ticket photo via a Supabase Edge Function (which holds the
  // Anthropic API key server-side — never in this file), matches the
  // extracted venue/block/row/seat text against real DB rows, then opens
  // the same 시야사진 등록 sheet a normal seat-grid click would, pre-filled.
  // If the Edge Function has no key configured (paused for budget reasons)
  // or nothing matches, this just falls back to a toast telling the user to
  // pick their seat manually — never a dead end.

  resetTicketVerifiedState() {
    state.ticketVerified = false;
    state.ticketVerifiedCategory = null;
    state.ticketPendingReview = false;
    if (state.ticketPendingPhotoPreviewUrl) URL.revokeObjectURL(state.ticketPendingPhotoPreviewUrl);
    state.ticketPendingPhotoPreviewUrl = null;
    state.pendingTicketPhotoBlob = null;
    state.ticketPendingExistingUrl = null;
    state.ticketPendingExistingPath = null;
    state.ticketPhotoRemovedExisting = null;
    this.updateTicketVerifyFormUI();
  }

  // Toggles the "좌석 인증(티켓)" field in modal-add-ticket between three
  // states: the "인증하기" action button, a thumbnail preview + "관리자
  // 확인 중" pending, and "✓ 인증됨" done. OCR-based auto-verification
  // turned out too unreliable across real ticket formats/photo quality, so
  // this is now an admin-review workflow instead — attaching a photo here
  // just queues it for manual approval (see saveNewTicket for the upload,
  // and the admin panel for the approve/reject action that sets
  // is_ticket_verified). Also toggles the seat banner's "변경" button —
  // it's only meaningful once there's a verification to lose, so it stays
  // hidden otherwise (see handleWrongSeatFromOcr for the confirm prompt).
  updateTicketVerifyFormUI() {
    const actionEl = document.getElementById("form-ticket-verify-action");
    const pendingEl = document.getElementById("form-ticket-verify-pending");
    const pendingImg = document.getElementById("form-ticket-verify-pending-img");
    const doneEl = document.getElementById("form-ticket-verify-done");
    const wrongSeatLink = document.getElementById("form-wrong-seat-link");
    const verified = !!state.ticketVerified;
    const pending = !verified && !!state.ticketPendingReview;
    if (actionEl) actionEl.style.display = (!verified && !pending) ? "block" : "none";
    if (pendingEl) pendingEl.style.display = pending ? "flex" : "none";
    if (pendingImg && pending) pendingImg.src = state.ticketPendingPhotoPreviewUrl || state.ticketPendingExistingUrl || "";
    if (doneEl) doneEl.style.display = verified ? "flex" : "none";
    if (wrongSeatLink) wrongSeatLink.style.display = verified ? "inline-block" : "none";
  }

  // "좌석 인증(티켓)" button inside modal-add-ticket — lets a manually-
  // opened registration attach a ticket photo for admin review in the same
  // sheet instead of only being possible later from 마이페이지.
  startInlineTicketVerify() {
    document.getElementById("form-ticket-verify-input").click();
  }

  // Just queues the photo for the admin to review — no more OCR call here.
  // Mirrors resolveFinalImageUrls' deferred-upload pattern: the file is
  // compressed and held in memory, and only actually uploaded to Storage
  // if the user goes on to submit the form (see saveNewTicket), so an
  // abandoned form never leaves an orphaned file behind.
  async handleInlineTicketVerifyFileSelect(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;

    let blob;
    try {
      blob = await this.compressImageToWebPBlob(file);
    } catch (err) {
      console.error("Ticket photo compress error:", err);
      this.showToast("⚠️", "사진을 처리하는 중 오류가 발생했어요.");
      return;
    }

    if (state.ticketPendingPhotoPreviewUrl) URL.revokeObjectURL(state.ticketPendingPhotoPreviewUrl);
    state.pendingTicketPhotoBlob = blob;
    state.ticketPendingPhotoPreviewUrl = URL.createObjectURL(blob);
    state.ticketPendingExistingUrl = null;
    state.ticketPendingExistingPath = null;
    state.ticketPhotoRemovedExisting = null;
    state.ticketPendingReview = true;
    this.updateTicketVerifyFormUI();
  }

  // "x" button on the attached ticket photo thumbnail. A freshly-picked
  // photo (not yet saved) is just discarded from memory; an already-
  // uploaded one (attached in an earlier session, editing now) is flagged
  // so saveNewTicket clears ticket_photo_url and deletes the file on save
  // instead of silently leaving orphaned pending state behind.
  removeTicketPhoto() {
    if (state.ticketPendingPhotoPreviewUrl) {
      URL.revokeObjectURL(state.ticketPendingPhotoPreviewUrl);
      state.ticketPendingPhotoPreviewUrl = null;
    }
    state.pendingTicketPhotoBlob = null;
    if (state.ticketPendingExistingPath) {
      state.ticketPhotoRemovedExisting = state.ticketPendingExistingPath;
      state.ticketPendingExistingUrl = null;
      state.ticketPendingExistingPath = null;
    }
    state.ticketPendingReview = false;
    this.updateTicketVerifyFormUI();
  }

  // "변경" button on the seat banner — only shown once verified (see
  // updateTicketVerifyFormUI), so clicking it always means giving up an
  // existing verification. Confirm that's really what they want before
  // closing this sheet and sending them into the manual 공연장/구장 list →
  // 좌석 selection flow to pick a different seat. That manual path always
  // calls resetTicketVerifiedState() when it reopens this form, so there's
  // no separate "clear verified" step needed after confirming here.
  async handleWrongSeatFromOcr() {
    const confirmed = await this.showConfirmDialog(
      "좌석 변경",
      "좌석을 변경하면 지금까지의 티켓 인증이 취소돼요.\n\n계속하시겠어요?",
      { okText: "변경할게요", cancelText: "취소" }
    );
    if (!confirmed) return;

    const category = state.ticketVerifiedCategory;
    this.closeModal("modal-add-ticket");
    this.resetTicketVerifiedState();
    // Stay on the specific venue/stadium they were already on (state.
    // selectedVenue/selectedStadium is already set — either from opening
    // this form directly off that detail page, or from triggerOcrPhotoAttach
    // navigating there before the OCR scan even ran) rather than dropping
    // them back at the full list to find it again.
    const isMusical = category === "musical";
    const current = isMusical ? state.selectedVenue : state.selectedStadium;
    if (current) {
      this.navigateTo(isMusical ? "venue-detail" : "stadium-detail");
    } else {
      this.navigateTo(isMusical ? "venues" : "stadiums");
    }
  }

  // Header entry point: which venue this is isn't known yet, so ask
  // category → venue before running OCR at all. This means OCR never has
  // to guess the venue name from the ticket photo — the least reliable
  // field to read (small text, easily hidden behind a finger or blurred
  // out by resizing) — matching only has to find block/row/seat within a
  // venue we already know for certain.
  startTicketScan() {
    if (!state.isLoggedIn) {
      sessionStorage.removeItem("seatview_pending_login_state");
      this.openModal("modal-login-confirm");
      return;
    }
    const stepCategory = document.getElementById("ocr-picker-step-category");
    const stepVenue = document.getElementById("ocr-picker-step-venue");
    const stepAttach = document.getElementById("ocr-picker-step-attach");
    const stepConfirm = document.getElementById("ocr-picker-step-confirm");
    if (stepCategory) stepCategory.style.display = "flex";
    if (stepVenue) stepVenue.style.display = "none";
    if (stepAttach) stepAttach.style.display = "none";
    if (stepConfirm) stepConfirm.style.display = "none";
    this.openModal("modal-ocr-venue-picker");
  }

  selectOcrScanCategory(category) {
    const stepCategory = document.getElementById("ocr-picker-step-category");
    const stepVenue = document.getElementById("ocr-picker-step-venue");
    const searchWrap = document.getElementById("ocr-picker-venue-search-wrap");
    const searchInput = document.getElementById("ocr-picker-venue-search");
    state.ocrPickerCategory = category;
    state.ocrPickerList = category === "musical" ? (VENUES_DB || []) : (STADIUMS_DB || []);
    // Baseball only has 9 stadiums (a short static list), so a search box
    // there is just noise — musical has enough venues that finding one by
    // scrolling gets tedious, same as the full 공연장 list screen.
    if (searchWrap) searchWrap.style.display = category === "musical" ? "flex" : "none";
    if (searchInput) searchInput.value = "";
    this.renderOcrPickerVenueList("");
    if (stepCategory) stepCategory.style.display = "none";
    if (stepVenue) stepVenue.style.display = "flex";
  }

  renderOcrPickerVenueList(filterText) {
    const listEl = document.getElementById("ocr-picker-venue-list");
    if (!listEl) return;
    const list = state.ocrPickerList || [];
    const trimmed = String(filterText || "").trim();
    const q = trimmed.toLowerCase();
    const filtered = q ? list.filter(v => String(v.name || "").toLowerCase().includes(q)) : list;

    if (filtered.length === 0) {
      // Same empty-state pattern as renderVenueList's search-miss case, so
      // it doesn't look like a different feature — and a fixed-height list
      // container (set in index.html) means this never makes the popup
      // itself grow or shrink as the result count changes.
      listEl.innerHTML = `
        <div class="compare-empty" style="border-style: solid; padding: 32px 16px;">
          <div class="compare-empty-icon"><i data-lucide="search-x"></i></div>
          <h3 style="font-size: 0.85rem;">'${this.escapeHtml(trimmed)}'와(과) 일치하는 공연장이 없습니다</h3>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    listEl.innerHTML = filtered.map((v) => {
      const idx = list.indexOf(v);
      return `<button class="btn btn-secondary" onclick="app.selectOcrScanVenueByIndex(${idx})" style="flex: none; padding: 12px 14px; font-weight: 600; font-size: 0.85rem; border-radius: 10px; text-align: left;">${this.escapeHtml(v.name)}</button>`;
    }).join("");
  }

  // Picking a venue no longer jumps straight to the OS file picker — that
  // felt like a dead end with zero context ("뭐지?"). Instead it moves to a
  // third in-modal step with a couple of quick tips for getting a
  // recognizable ticket photo, and the actual attach happens from there.
  selectOcrScanVenueByIndex(index) {
    const list = state.ocrPickerList || [];
    const v = list[index];
    if (!v) return;
    const category = state.ocrPickerCategory;
    const dbId = category === "musical" ? Number(v.id) : BASEBALL_DB_ID_MAP[v.id];
    if (!dbId) return;
    state.pendingOcrScan = { category, dbId, rawId: v.id, venueName: v.name };

    // Already inside one category, so the generic "공연장/구장" label is just
    // noise — say the one that actually applies.
    const venueWord = category === "musical" ? "공연장" : "구장";
    const labelEl = document.getElementById("ocr-picker-selected-venue-label");
    if (labelEl) labelEl.textContent = `선택한 ${venueWord}`;
    const tipWordEl = document.getElementById("ocr-picker-tip-venue-word");
    if (tipWordEl) tipWordEl.textContent = venueWord;
    const nameEl = document.getElementById("ocr-picker-selected-venue-name");
    if (nameEl) nameEl.textContent = v.name;
    const stepVenue = document.getElementById("ocr-picker-step-venue");
    const stepAttach = document.getElementById("ocr-picker-step-attach");
    if (stepVenue) stepVenue.style.display = "none";
    if (stepAttach) stepAttach.style.display = "flex";
  }

  // "변경" button on the attach step — back to picking a different venue,
  // without losing the category or the already-rendered list/search state.
  backToOcrPickerVenueList() {
    const stepVenue = document.getElementById("ocr-picker-step-venue");
    const stepAttach = document.getElementById("ocr-picker-step-attach");
    if (stepAttach) stepAttach.style.display = "none";
    if (stepVenue) stepVenue.style.display = "flex";
  }

  triggerOcrPhotoAttach() {
    // Navigate to the picked venue/stadium right away — not just after OCR
    // finishes — so the screen behind the OS file picker is already the
    // right context instead of whatever screen the header button happened
    // to be opened from (e.g. the venues list).
    this.goToPendingVenueDetail(state.pendingOcrScan);
    this.closeModal("modal-ocr-venue-picker");
    document.getElementById("ticket-scan-input").click();
  }

  // Jumps straight to the picked venue's/stadium's seat grid — called right
  // when the photo attach starts (see triggerOcrPhotoAttach), so the right
  // screen is already showing underneath the OS file picker and again
  // behind the OCR loading state, whatever the outcome ends up being.
  goToPendingVenueDetail(pending) {
    if (!pending) return;
    if (pending.category === "musical") {
      this.loadVenueDetail(pending.rawId);
    } else {
      this.loadStadiumDetail(pending.rawId);
    }
  }

  // Downscales client-side before sending — the Edge Function only needs
  // enough resolution to read printed text, and a smaller payload is
  // cheaper per Claude API call.
  // maxWidth was 1200 originally, but real-world ticket photos usually have
  // a lot of background (hand, venue interior) around a small ticket, so the
  // seat/date text shrank to unreadable at 1200px — raised to 2000 (roughly
  // 2-3x more image tokens/cost per scan, still a fraction of a cent).
  resizeImageToBase64ForOcr(file, maxWidth = 2000, quality = 0.9) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          const longSide = Math.max(width, height);
          if (longSide > maxWidth) {
            const scale = maxWidth / longSide;
            width = Math.round(width * scale);
            height = Math.round(height * scale);
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d").drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve({ base64: dataUrl.split(",")[1], mediaType: "image/jpeg" });
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async handleTicketScanFileSelect(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;

    const pending = state.pendingOcrScan;
    state.pendingOcrScan = null;
    if (!pending) return;

    this.showToast("🔍", "티켓 정보를 읽는 중...");
    let result;
    try {
      console.log("[OCR debug] original file:", { name: file.name, type: file.type, sizeKB: Math.round(file.size / 1024) });
      const { base64, mediaType } = await this.resizeImageToBase64ForOcr(file);
      console.log("[OCR debug] resized image:", { mediaType, base64Length: base64.length, approxKB: Math.round(base64.length * 0.75 / 1024) });
      console.log("[OCR debug] paste this whole line into a new browser tab's address bar to SEE the exact image that was sent:");
      console.log("data:" + mediaType + ";base64," + base64);
      const cleanUrl = SUPABASE_URL.replace(/\/rest\/v1\/?$/, "");
      // 서버 함수는 유료 AI 호출이라 로그인한 사용자의 토큰만 받는다(공개된
      // anon 키만으로는 거절 -> 아래 "사용할 수 없어요" 안내로 자연스럽게 수동 입력).
      let accessToken = SUPABASE_ANON_KEY;
      try {
        const { data: sessionData } = await supabaseClient.auth.getSession();
        if (sessionData && sessionData.session && sessionData.session.access_token) accessToken = sessionData.session.access_token;
      } catch (_) { /* 세션을 못 읽으면 anon 키로 시도 -> 서버가 거절 */ }
      const resp = await fetch(`${cleanUrl}/functions/v1/ocr-ticket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "apikey": SUPABASE_ANON_KEY
        },
        body: JSON.stringify({ imageBase64: base64, mediaType })
      });
      result = await resp.json();
    } catch (err) {
      console.error("Ticket OCR request error:", err);
      // Already on the picked venue's detail screen (navigated there as
      // soon as "티켓 사진 첨부하기" was tapped) — just let them pick manually.
      this.showToast("⚠️", "티켓 인식 중 오류가 발생했어요. 직접 좌석을 선택해 등록해 주세요.");
      return;
    }

    if (!result || !result.ok) {
      // Covers: no API key configured (feature paused for budget reasons),
      // Anthropic billing/rate-limit errors, or a genuine parse failure —
      // all treated the same way from the user's side.
      console.log("[OCR debug] edge function did not return ok:", result);
      this.showToast("ℹ️", "지금은 티켓 인식 기능을 사용할 수 없어요. 직접 좌석을 선택해 등록해 주세요.");
      return;
    }

    console.log("[OCR debug] raw extracted fields:", result.data);
    const parsedSeat = this.parseSeatText(result.data && result.data.seatText);
    console.log("[OCR debug] parsed seatText:", parsedSeat);
    const matchData = { ...result.data, ...parsedSeat };
    const match = await this.matchOcrToKnownVenue(matchData, pending.category, pending.dbId);
    if (!match) {
      console.log("[OCR debug] no match — see [OCR match debug] lines above for the exact step that failed");
      this.showToast("ℹ️", "티켓에서 좌석 정보를 정확히 찾지 못했어요. 직접 좌석을 선택해 등록해 주세요.");
      return;
    }
    match.stadiumName = pending.venueName;

    if (await this.hasExistingSeatReview(match.realSeatId, match.category === "musical")) {
      await this.showAlertDialog("중복 등록 불가", "이 좌석에는 이미 시야 사진을 등록하셨습니다.\n\n한 좌석당 1인 1건만 등록할 수 있어요.");
      return;
    }

    // OCR's guess still needs a human sanity check before committing to it —
    // confirm the exact seat up front instead of just opening the form and
    // hoping the user notices if it's wrong. A dedicated step inside this
    // same modal reads better than the generic system-alert-style confirm
    // dialog for something this central to the flow.
    state.pendingOcrMatchConfirm = match;
    const venueEl = document.getElementById("ocr-picker-confirm-venue");
    const seatEl = document.getElementById("ocr-picker-confirm-seat");
    if (venueEl) venueEl.textContent = match.stadiumName;
    if (seatEl) seatEl.textContent = `${match.blockName} ${match.seatName}`;
    const stepAttach = document.getElementById("ocr-picker-step-attach");
    const stepConfirm = document.getElementById("ocr-picker-step-confirm");
    if (stepAttach) stepAttach.style.display = "none";
    if (stepConfirm) stepConfirm.style.display = "flex";
    this.openModal("modal-ocr-venue-picker");
  }

  resolveOcrSeatConfirm(confirmed) {
    const match = state.pendingOcrMatchConfirm;
    state.pendingOcrMatchConfirm = null;
    this.closeModal("modal-ocr-venue-picker");
    if (confirmed && match) {
      this.openTicketFormFromOcrMatch(match);
    } else {
      this.showToast("ℹ️", "직접 좌석을 선택해 등록해 주세요.");
    }
  }

  // Splits the Edge Function's verbatim seatText into floor/block/row/
  // seatNum ourselves, client-side — deliberately NOT asking the vision
  // model to do this split (see the Edge Function prompt comment): across
  // several real tickets it read the text fine but reliably misassigned it
  // (dropped a zone letter, shifted row into seatNum, etc.). Copying text
  // verbatim is a task it's good at; splitting Korean seat notation into
  // fields apparently isn't, at this model size. This can be tested/fixed
  // directly against real ticket strings without a redeploy.
  parseSeatText(seatText) {
    const text = String(seatText || "").trim();
    if (!text) return { floor: null, block: null, row: null, seatNum: null };

    const floorMatch = text.match(/(\d+)\s*층/);
    const floor = floorMatch ? Number(floorMatch[1]) : null;

    // The value right before "열" — usually digits, but sometimes a zone
    // letter/한글 stands in for the row (see matchBlockFromOcr's row-as-
    // block-code fallback). Greedy matching plus backtracking naturally
    // skips over an earlier "C구역"-style chunk that isn't immediately
    // followed by "열", landing on the real "16열" instead of grabbing
    // "구역 16" as one blob.
    const rowMatch = text.match(/([A-Za-z가-힣0-9]+)\s*열/);
    const row = rowMatch ? rowMatch[1] : null;

    let seatNum = null;
    const seatWithSuffix = text.match(/(\d+)\s*번/);
    if (seatWithSuffix) {
      seatNum = Number(seatWithSuffix[1]);
    } else {
      // Some tickets never print "번" at all — fall back to the last
      // standalone number in the string, since the seat number is almost
      // always the final token (but not if it's the only number and that
      // number was already claimed as the floor).
      const allNums = text.match(/\d+/g);
      if (allNums && allNums.length > 0) {
        const last = allNums[allNums.length - 1];
        if (!(floorMatch && allNums.length === 1 && last === floorMatch[1])) {
          seatNum = Number(last);
        }
      }
    }

    let block = text
      .replace(/\d+\s*층/, "")
      .replace(/[A-Za-z가-힣0-9]+\s*열/, "")
      .replace(/\d+\s*번/, "")
      .trim();
    if (!seatWithSuffix && seatNum != null) {
      block = block.replace(new RegExp(String(seatNum) + "\\s*$"), "").trim();
    }
    block = block || null;

    return { floor, block, row, seatNum };
  }

  // Shared text normalizer for OCR matching — venue/block names in our DB
  // sometimes use "_" as a separator (e.g. "세종문화회관_대극장") where a
  // printed ticket uses a space, so strip common separators, not just
  // whitespace, before comparing.
  normOcrText(s) {
    return String(s || "").replace(/[\s_·,.\-]+/g, "").toLowerCase();
  }

  // Finds the block a ticket's "구역" text refers to, within one venue's/
  // stadium's block list (already narrowed down by the caller — this never
  // searches across venues). Falls back to treating the "row" field as a
  // bare block_code, since some venues print the zone letter under "열" on
  // the ticket (e.g. "1층 D열 41번" actually means zone D, seat 41 — no row
  // is printed at all).
  matchBlockFromOcr(blocks, data) {
    const norm = this.normOcrText;
    const blockNorm = norm(data.block);
    const rowAsBlockNorm = norm(data.row);
    const tryFind = (list) => {
      let m = list.find(b => blockNorm && (
        norm(b.full_name).includes(blockNorm) || norm(b.block_code).includes(blockNorm) ||
        blockNorm.includes(norm(b.block_code)) || (b.seat_grade && norm(b.seat_grade).includes(blockNorm))
      ));
      if (!m) {
        m = list.find(b => rowAsBlockNorm && norm(b.block_code) === rowAsBlockNorm);
      }
      return m || null;
    };

    // Block codes repeat across floors at the same venue (e.g. block "D"
    // exists on 1층, 2층 AND 3층) — narrow to the floor OCR actually read
    // first, or .find() silently grabs whichever floor's same-lettered
    // block happens to come first in the query result, which can be a
    // completely different (wrong) block. Only falls back to a venue-wide
    // search if that comes up empty (e.g. OCR misread the floor).
    let blockMatch = null;
    if (data.floor != null) {
      const sameFloor = blocks.filter(b => b.floor != null && String(b.floor) === String(data.floor));
      console.log(`[OCR match debug] data.floor="${data.floor}" narrowed ${blocks.length} blocks down to ${sameFloor.length} on that floor`);
      if (sameFloor.length > 0) blockMatch = tryFind(sameFloor);
    } else {
      console.log("[OCR match debug] data.floor is null — OCR didn't read a floor, searching all floors at once (risk of grabbing the wrong same-lettered block)");
    }
    if (!blockMatch) blockMatch = tryFind(blocks);
    return blockMatch || null;
  }

  // Finds the seat a ticket's row/seat number refers to, within one block's
  // seat list. Prefers an exact row+seat match; falls back to seat_num
  // alone (only when it's unambiguous within the block) since seat_num runs
  // continuously across rows at some venues and the row itself isn't always
  // printed on the ticket.
  matchSeatFromOcr(seats, data) {
    if (data.seatNum == null) return null;
    let seatMatch = data.row != null
      ? seats.find(s => String(s.row_num) === String(data.row) && String(s.seat_num) === String(data.seatNum))
      : null;
    if (!seatMatch) {
      const bySeatNum = seats.filter(s => String(s.seat_num) === String(data.seatNum));
      if (bySeatNum.length === 1) seatMatch = bySeatNum[0];
    }
    return seatMatch || null;
  }

  // Matches OCR-extracted block/row/seat text against one already-known
  // venue/stadium (picked by the user before scanning — see
  // startTicketScan/startTicketScanForCurrentVenue), so this never has to
  // read the venue name off the ticket itself.
  async matchOcrToKnownVenue(data, category, dbId) {
    if (!data || data.seatNum == null) {
      console.log("[OCR match debug] no data.seatNum at all — OCR didn't extract a seat number, matching never had a chance", data);
      return null;
    }
    const isMusical = category === "musical";
    try {
      const { data: blocks, error } = await supabaseClient
        .from(isMusical ? "musical_blocks" : "baseball_blocks")
        .select(isMusical ? "id, block_code, full_name, floor" : "id, block_code, full_name, seat_grade")
        .eq(isMusical ? "venue_id" : "stadium_id", dbId);
      if (error || !blocks) {
        console.log("[OCR match debug] block list query failed:", error);
        return null;
      }
      console.log(`[OCR match debug] fetched ${blocks.length} blocks for dbId=${dbId}:`, blocks.map(b => b.full_name || b.block_code));

      const blockMatch = this.matchBlockFromOcr(blocks, data);
      if (!blockMatch) {
        console.log(`[OCR match debug] no block matched data.block="${data.block}" / data.row="${data.row}" against any of the ${blocks.length} blocks above`);
        // Some venues only print 층/열/좌석번호 with no 구역 at all (e.g. a
        // ticket that literally just says "1층 5열 22번") — there's no zone
        // text to match against, ever. Last resort: search row+seat across
        // every block on that floor, and accept it only if it's unique —
        // otherwise this would risk silently guessing the wrong zone.
        return await this.matchByFloorRowSeatOnly(blocks, data, isMusical, category);
      }
      console.log("[OCR match debug] block matched:", blockMatch.full_name || blockMatch.block_code);

      const { data: seats, error: seatErr } = await supabaseClient
        .from(isMusical ? "musical_seats" : "baseball_seats")
        .select("id, row_num, seat_num")
        .eq("block_id", blockMatch.id);
      if (seatErr || !seats) {
        console.log("[OCR match debug] seat list query failed:", seatErr);
        return null;
      }
      console.log(`[OCR match debug] fetched ${seats.length} seats in that block, looking for row="${data.row}" seatNum="${data.seatNum}"`);

      const seatMatch = this.matchSeatFromOcr(seats, data);
      if (!seatMatch) {
        const sameSeatNum = seats.filter(s => String(s.seat_num) === String(data.seatNum));
        console.log(`[OCR match debug] no seat matched — ${sameSeatNum.length} seat(s) in this block share seat_num="${data.seatNum}" (need exactly 1 to fall back safely):`, sameSeatNum);
        return null;
      }

      return {
        category,
        realSeatId: seatMatch.id,
        blockName: blockMatch.full_name || blockMatch.block_code,
        seatName: this.formatSeatName(seatMatch, !!seatMatch.is_disabled_seat),
        watchedDate: data.date || null
      };
    } catch (e) {
      console.warn("OCR venue-scoped match failed:", e);
      return null;
    }
  }

  // Fallback for tickets with no 구역 text at all — searches row+seat across
  // every block on the read floor and only returns a match if it's unique
  // venue-wide on that floor. Never guesses between ambiguous candidates.
  async matchByFloorRowSeatOnly(blocks, data, isMusical, category) {
    if (data.floor == null || data.row == null || data.seatNum == null) {
      console.log("[OCR match debug] floor-wide fallback skipped — missing floor, row, or seatNum");
      return null;
    }
    const sameFloorBlocks = blocks.filter(b => b.floor != null && String(b.floor) === String(data.floor));
    if (sameFloorBlocks.length === 0) {
      console.log(`[OCR match debug] floor-wide fallback skipped — no blocks found on floor="${data.floor}"`);
      return null;
    }

    // Fetches every seat on the floor rather than filtering row/seat_num
    // server-side (column types are inconsistent enough across tables —
    // row_num is text, seat_num numeric — that a strict .eq() risks a
    // type-mismatch false miss); the same String()-normalized comparison
    // used everywhere else in this matcher is more robust here too.
    const { data: floorSeats, error } = await supabaseClient
      .from(isMusical ? "musical_seats" : "baseball_seats")
      .select("id, block_id, row_num, seat_num")
      .in("block_id", sameFloorBlocks.map(b => b.id));
    if (error || !floorSeats) {
      console.log("[OCR match debug] floor-wide fallback query failed:", error);
      return null;
    }

    const candidates = floorSeats.filter(s => String(s.row_num) === String(data.row) && String(s.seat_num) === String(data.seatNum));
    if (candidates.length !== 1) {
      console.log(`[OCR match debug] floor-wide fallback found ${candidates.length} seat(s) matching row="${data.row}" seatNum="${data.seatNum}" across ${sameFloorBlocks.length} blocks on floor="${data.floor}" — need exactly 1 to accept it:`, candidates);
      return null;
    }

    const seatMatch = candidates[0];
    const blockMatch = sameFloorBlocks.find(b => b.id === seatMatch.block_id);
    console.log("[OCR match debug] floor-wide fallback uniquely matched:", blockMatch && (blockMatch.full_name || blockMatch.block_code));

    return {
      category,
      realSeatId: seatMatch.id,
      blockName: (blockMatch && (blockMatch.full_name || blockMatch.block_code)) || "",
      seatName: this.formatSeatName(seatMatch, !!seatMatch.is_disabled_seat),
      watchedDate: data.date || null
    };
  }

  // Used by the "좌석 인증(티켓)" field inside modal-add-ticket (both new
  // registration and 기록 수정): checks whether a freshly-scanned ticket's
  // block/row/seat matches the seat already selected for this form, rather
  // than searching for a seat to match. No venue check needed — the seat is
  // already known, so we only need to confirm this ticket describes it.
  async verifyOcrMatchesSeat(data, seatId, isMusical) {
    if (!data || data.seatNum == null) return false;
    try {
      const { data: seatRow, error: seatErr } = await supabaseClient
        .from(isMusical ? "musical_seats" : "baseball_seats")
        .select("id, row_num, seat_num, block_id")
        .eq("id", seatId)
        .single();
      if (seatErr || !seatRow) return false;

      const { data: blockRow, error: blockErr } = await supabaseClient
        .from(isMusical ? "musical_blocks" : "baseball_blocks")
        .select(isMusical ? "id, block_code, full_name" : "id, block_code, full_name, seat_grade")
        .eq("id", seatRow.block_id)
        .single();
      if (blockErr || !blockRow) return false;

      const blockMatch = this.matchBlockFromOcr([blockRow], data);
      if (!blockMatch) return false;

      const norm = this.normOcrText;
      const rowOk = data.row == null || String(data.row) === String(seatRow.row_num) || norm(data.row) === norm(blockRow.block_code);
      return rowOk && String(data.seatNum) === String(seatRow.seat_num);
    } catch (e) {
      console.warn("verifyOcrMatchesSeat failed:", e);
      return false;
    }
  }

  // Same form the seat-grid click path opens, just pre-filled from the
  // OCR match instead of from whichever seat the user tapped.
  async openTicketFormFromOcrMatch(match) {
    state.activeModalCategory = match.category;
    state.activeModalSeatKey = String(match.realSeatId);

    document.getElementById("add-ticket-form").reset();
    const commentEl = document.getElementById("form-comment");
    if (commentEl) {
      commentEl.style.height = "auto";
      this.updateCommentCounter(commentEl);
    }

    const labelEl = document.getElementById("form-seat-info-label");
    if (labelEl) labelEl.innerHTML = `${this.escapeHtml(match.stadiumName)}<br>${this.escapeHtml(match.blockName)} ${this.escapeHtml(match.seatName)}`;

    const ratingGroupEl = document.getElementById("form-rating-group");
    if (ratingGroupEl) ratingGroupEl.style.display = match.category === "musical" ? "" : "none";
    this.resetFormRating(0);

    const dateEl = document.getElementById("form-match-date");
    if (dateEl) dateEl.value = match.watchedDate || "";

    // Verified is about the seat matching the ticket, not the date — so it
    // isn't reconsidered if the user edits 관람일 afterward. It only ever
    // goes false again by leaving this form (see handleWrongSeatFromOcr /
    // resetTicketVerifiedState), which re-fetches with a genuinely
    // different seat, or none at all.
    state.ticketVerified = true;
    state.ticketVerifiedCategory = match.category;
    this.updateTicketVerifyFormUI();
    const wrongSeatLink = document.getElementById("form-wrong-seat-link");
    if (wrongSeatLink) wrongSeatLink.style.display = "inline-block";

    state.tempUploadedPhotos = [];
    this.renderUploadedPhotosThumbnails();
    state.editingReviewId = null;

    const titleEl = document.getElementById("add-ticket-modal-title");
    if (titleEl) titleEl.textContent = "좌석 시야 사진 등록";

    const submitBtn = document.querySelector("#add-ticket-form button[type='submit']");
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "등록하기";
      lucide.createIcons();
    }

    this.showToast("✅", "티켓 정보를 확인했어요. 내용을 확인하고 등록해 주세요.");
    this.openModal("modal-add-ticket");
  }

  // 관람일은 미래 날짜를 고를 수 없어야 함(아직 안 본 공연/경기의 시야를
  // 등록할 순 없으니까) — 기본값을 오늘로 채워주지는 않음. 실제 관람일이
  // 등록일과 다른 경우가 많아서, 안 건드리면 그냥 빈 채로 둔다.
  setTicketDateFieldDefaults() {
    const dateEl = document.getElementById("form-match-date");
    if (!dateEl) return;
    dateEl.max = new Date().toISOString().split("T")[0];
  }

  async addCurrentSeatToTicketbook() {
    if (!state.isLoggedIn) {
      if (state.activeModalSeatKey) {
        sessionStorage.setItem("seatview_pending_login_state", JSON.stringify({
          action: { type: "add_seat_photo", seatKey: state.activeModalSeatKey, category: state.activeModalCategory }
        }));
      }
      this.openModal("modal-login-confirm");
      return;
    }

    if (!state.activeModalSeatKey) return;

    // Check for a duplicate up front — before the user fills out photos and
    // a comment — so a "already registered" rejection can't hit them after
    // they've already done the work.
    const realSeatIdForCheck = /^\d+$/.test(String(state.activeModalSeatKey)) ? parseInt(state.activeModalSeatKey, 10) : null;
    if (await this.hasExistingSeatReview(realSeatIdForCheck, state.activeModalCategory === "musical")) {
      this.closeModal("modal-seat-detail");
      await this.showAlertDialog("중복 등록 불가", "이 좌석에는 이미 시야 사진을 등록하셨습니다.\n\n한 좌석당 1인 1건만 등록할 수 있어요. 기존 등록 내역은 마이페이지에서 수정하거나 삭제할 수 있습니다.");
      return;
    }

    // Musical seat ids are plain integers, not baseball's "_"-joined
    // composite key, so there's nothing to parse — use the display info
    // openSeatDetail() already resolved instead.
    if (state.activeModalCategory === "musical") {
      this.closeModal("modal-seat-detail");

      document.getElementById("add-ticket-form").reset();
      const commentEl = document.getElementById("form-comment");
      if (commentEl) {
        commentEl.style.height = "auto";
        this.updateCommentCounter(commentEl);
      }

      const info = state.activeModalDisplayInfo || {};
      const labelEl = document.getElementById("form-seat-info-label");
      if (labelEl) labelEl.innerHTML = `${this.escapeHtml(info.stadiumName || "")}<br>${this.escapeHtml(info.blockName || "")} ${this.escapeHtml(info.seatName || "")}`;
      const ratingGroupEl = document.getElementById("form-rating-group");
      if (ratingGroupEl) ratingGroupEl.style.display = "";
      this.resetFormRating(0);
      this.setTicketDateFieldDefaults();
      this.resetTicketVerifiedState();

      state.tempUploadedPhotos = [];
      this.renderUploadedPhotosThumbnails();
      state.editingReviewId = null;

      const titleEl = document.getElementById("add-ticket-modal-title");
      if (titleEl) titleEl.textContent = "좌석 시야 사진 등록";

      const submitBtn = document.querySelector("#add-ticket-form button[type='submit']");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = "등록하기";
        lucide.createIcons();
      }

      this.openModal("modal-add-ticket");
      return;
    }

    const isDemoSeat = state.activeModalSeatKey.endsWith("22567");
    const seatInfo = isDemoSeat ? SEAT_VIEWS_DB["22567"] : SEAT_VIEWS_DB[state.activeModalSeatKey];

    const parts = state.activeModalSeatKey.split("_");
    const stadiumId = parts[0];
    const blockId = parts[1] || "";
    const r = parts[2] || "1";
    const s = parts[3] || "1";

    const stadium = STADIUMS_DB.find(st => st.id === stadiumId);
    const stadiumName = stadium ? stadium.name : (state.selectedStadium ? state.selectedStadium.name : "\uACBD\uAE30\uC7A5");

    let blockName = blockId;
    if (blockId.startsWith("b")) {
      blockName = blockId.substring(1) + "\uC5D0\uB85C";
    } else if (state.selectedBlock) {
      blockName = state.selectedBlock.name;
    }
    const seatName = `${r}\uC5F4 ${s}\uBC88`;

    this.closeModal("modal-seat-detail");

    // Reset form fields first before setting prepopulated values
    document.getElementById("add-ticket-form").reset();
    const commentEl = document.getElementById("form-comment");
    if (commentEl) {
      commentEl.style.height = "auto";
      this.updateCommentCounter(commentEl);
    }
    const stadiumSelect = document.getElementById("form-stadium");
    if (stadiumSelect) {
      stadiumSelect.innerHTML = STADIUMS_DB.map(st => `<option value="${st.id}">${this.escapeHtml(st.name)}</option>`).join("");
    }

    document.getElementById("form-stadium").value = stadiumId;
    document.getElementById("form-block").value = seatInfo ? seatInfo.blockName : blockName;
    document.getElementById("form-seat").value = seatInfo ? seatInfo.seatName : seatName;

    const labelEl = document.getElementById("form-seat-info-label");
    if (labelEl) {
      labelEl.innerHTML = `${this.escapeHtml(stadiumName)}<br>${this.escapeHtml(seatInfo ? seatInfo.blockName : blockName)} ${this.escapeHtml(seatInfo ? seatInfo.seatName : seatName)}`;
    }
    // 야구장엔 시야 별점 개념이 없음 — 이전에 공연장 폼을 열어뒀다 여기로
    // 왔을 때 별점 필드가 그대로 남아있지 않도록 명시적으로 숨긴다.
    const ratingGroupEl = document.getElementById("form-rating-group");
    if (ratingGroupEl) ratingGroupEl.style.display = "none";
    this.setTicketDateFieldDefaults();
    this.resetTicketVerifiedState();

    state.tempUploadedPhotos = [];
    this.renderUploadedPhotosThumbnails();

    // Make sure nothing carries over from a previous edit/submission
    state.editingReviewId = null;
    const titleEl = document.getElementById("add-ticket-modal-title");
    if (titleEl) titleEl.textContent = "좌석 시야 사진 등록";

    const submitBtn = document.querySelector("#add-ticket-form button[type='submit']");
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "등록하기";
      lucide.createIcons();
    }

    this.openModal("modal-add-ticket");
  }

  confirmGoToLogin() {
    this.closeModal("modal-login-confirm");
    this.closeModal("modal-seat-detail");
    this.loginWithKakao();
  }

  // Custom-styled replacement for native confirm()/alert(). Resolves true when
  // the OK button is clicked, false on cancel/backdrop click (alert-only mode
  // always resolves true since there's nothing to cancel).
  showConfirmDialog(title, message, options = {}) {
    return new Promise((resolve) => {
      const titleEl = document.getElementById("generic-confirm-title");
      const descEl = document.getElementById("generic-confirm-desc");
      const okBtn = document.getElementById("generic-confirm-ok-btn");
      const cancelBtn = document.getElementById("generic-confirm-cancel-btn");
      const backdrop = document.getElementById("generic-confirm-backdrop");

      if (titleEl) titleEl.textContent = title;
      if (descEl) descEl.textContent = message;

      const alertOnly = options.alertOnly === true;
      if (cancelBtn) cancelBtn.style.display = alertOnly ? "none" : "";
      if (okBtn) okBtn.textContent = options.okText || "확인";
      if (cancelBtn && !alertOnly) cancelBtn.textContent = options.cancelText || "취소";

      const cleanup = (result) => {
        if (okBtn) okBtn.onclick = null;
        if (cancelBtn) cancelBtn.onclick = null;
        if (backdrop) backdrop.onclick = null;
        this.closeModal("modal-generic-confirm");
        resolve(result);
      };

      if (okBtn) okBtn.onclick = () => cleanup(true);
      if (cancelBtn) cancelBtn.onclick = () => cleanup(false);
      if (backdrop) backdrop.onclick = () => cleanup(alertOnly ? true : false);

      this.openModal("modal-generic-confirm");
    });
  }

  showAlertDialog(title, message) {
    return this.showConfirmDialog(title, message, { alertOnly: true });
  }

  showSubmissionPolicyDetail() {
    this.showAlertDialog(
      "시야 등록 정책 및 유의사항",
      "• 등록 후 3일이 지난 시야 사진 및 관람평은 서비스 특성상 직접 삭제할 수 없으며, 회원 탈퇴 시에도 다른 이용자들을 위해 삭제되지 않고 유지될 수 있습니다.\n\n" +
      "• 사진은 반드시 카메라 1배 줌(확대하지 않은 상태)으로 촬영해 주세요. 확대 촬영 시 실제 좌석에서 보이는 시야와 다르게 표시되어, 1배 줌이 아닌 사진은 삭제될 수 있습니다.\n\n" +
      "• 좌석 시야와 무관하거나 부적절한 사진이 등록된 경우, 운영자가 임의로 삭제하거나 노출을 제한할 수 있습니다.\n\n" +
      "• 사진에 타인의 얼굴이 포함된 경우, 초상권 보호를 위해 모자이크 처리 등 식별이 어렵게 조치해 주세요."
    );
  }

  // --- Modal Helpers ---
  openModal(modalId, pushHistory = true) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("active");
      document.body.classList.add("modal-open");

      // Reusable modals (e.g. modal-add-ticket) keep the same .modal-body
      // DOM node across every open, so a scroll position left over from a
      // previous seat's form carried straight into the next one — the sheet
      // could visibly open already scrolled past the seat-info header.
      const modalBody = modal.querySelector(".modal-body");
      if (modalBody) modalBody.scrollTop = 0;

      // Tag whether this open owns a history entry, so popstate/back-button
      // handling (below, and in handleHeaderBack) can tell apart "closing
      // this modal IS the back-navigation" from "this modal never had its
      // own back-stop, so the back-press is really about whatever's
      // underneath" — without hardcoding which modal ids behave which way.
      modal.dataset.ownsHistory = pushHistory ? "true" : "false";

      // Push history state so back button closes it (Requirement 15)
      if (pushHistory && (!history.state || history.state.modalId !== modalId)) {
        history.pushState({ modalId: modalId, view: state.currentView }, "", "#" + modalId);
      }
    }
  }

  closeModal(modalId, triggeredByPopState = false) {
    const modal = document.getElementById(modalId);
    if (modal) {
      // A "!" field tooltip is a fixed-position bubble appended to <body>,
      // outside the modal's own DOM — closing the modal doesn't remove it,
      // so it was left floating on screen over whatever's underneath.
      const tooltipBubble = document.getElementById("field-tooltip-bubble");
      if (tooltipBubble) {
        tooltipBubble.remove();
        if (this._fieldTooltipDismissHandler) {
          document.removeEventListener("click", this._fieldTooltipDismissHandler, true);
          this._fieldTooltipDismissHandler = null;
        }
      }

      // The event popup's "3일간 다시 보지 않기" checkbox has to be read
      // HERE, not only in closeEventPopup() — this modal doesn't own a
      // history entry (see openModal), so a real back-press or the header
      // "<" button closes it by calling closeModal() directly, skipping
      // closeEventPopup() entirely. Checking here covers every close path.
      if (modalId === "modal-event-popup") {
        const checkbox = document.getElementById("event-popup-dontshow-checkbox");
        if (checkbox && checkbox.checked) {
          const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
          localStorage.setItem("seatview_event_popup_hide_until", String(Date.now() + THREE_DAYS_MS));
        }
      }
      modal.classList.remove("active");

      // Check if any other modals are still active
      const activeModals = document.querySelectorAll(".modal.active");
      if (activeModals.length === 0) {
        document.body.classList.remove("modal-open");
      }
      
      // If closed manually (not via popstate), rewrite the current history entry
      // back to the underlying view. We intentionally use replaceState (not
      // history.back()) because back() is asynchronous and fires a delayed
      // popstate event — if another modal/view navigation happens right after
      // closeModal() in the same call chain, that delayed popstate would undo it.
      if (!triggeredByPopState) {
        if (history.state && history.state.modalId === modalId) {
          const fallbackView = history.state.view || state.currentView || "main";
          history.replaceState({ view: fallbackView }, "", "#" + fallbackView);
        }
      }
    }
  }

  openEditProfileModal() {
    const nickInput = document.getElementById("profile-nickname-input");
    const stadiumSelect = document.getElementById("profile-stadium-select");
    const teamSelect = document.getElementById("profile-team-select");

    if (nickInput) nickInput.value = state.userNickname || "";
    if (stadiumSelect) {
      const placeholder = `<option value="" disabled ${state.favoriteStadiumId ? "" : "selected"}>구장을 선택해주세요</option>`;
      stadiumSelect.innerHTML = placeholder + STADIUMS_DB.map(s => `<option value="${this.escapeHtml(s.id)}">${this.escapeHtml(s.name)}</option>`).join("");
      stadiumSelect.value = state.favoriteStadiumId || "";
    }
    if (teamSelect) teamSelect.value = state.cheeringTeam || "";

    this.openModal("modal-edit-profile");
  }

  async saveProfileSettings(e) {
    e.preventDefault();
    const nickVal = document.getElementById("profile-nickname-input").value.trim();
    const stadiumVal = document.getElementById("profile-stadium-select").value || null;
    const teamVal = document.getElementById("profile-team-select").value || null;

    if (!nickVal) return;

    if (supabaseClient && state.userId) {
      const { data, error } = await supabaseClient
        .from('profiles')
        .update({
          nickname: nickVal,
          favorite_stadium_id: stadiumVal,
          cheering_team: teamVal,
          mod_dtm: new Date().toISOString()
        })
        .eq('id', state.userId)
        .select();

      // RLS can silently block an update: no error, but zero rows come back.
      // Treat that the same as a real failure instead of reporting success.
      if (error || !data || data.length === 0) {
        console.warn("Supabase profile update failed or blocked by RLS:", error, data);
        await this.showAlertDialog("\uC800\uC7A5 \uC2E4\uD328", "\uD504\uB85C\uD544 \uC800\uC7A5\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.");
        return;
      }

      supabaseClient.auth.updateUser({
        data: {
          name: nickVal,
          full_name: nickVal
        }
      }).then(({ error }) => {
        if (error) console.warn("Supabase auth metadata update warning:", error);
      });
    }

    state.userNickname = nickVal;
    state.favoriteStadiumId = stadiumVal;
    state.cheeringTeam = teamVal;

    localStorage.setItem("seatview_nickname", nickVal);
    localStorage.setItem("seatview_favorite_stadium", stadiumVal);
    localStorage.setItem("seatview_cheering_team", teamVal);

    // Refresh UI
    const profileStadiumEl = document.getElementById("my-profile-stadium");
    const profileTeamEl = document.getElementById("my-profile-team");
    const profileNicknameEl = document.getElementById("my-profile-nickname");
    const favStadiumObj = STADIUMS_DB.find(s => s.id === stadiumVal);

    if (profileStadiumEl) profileStadiumEl.textContent = favStadiumObj ? favStadiumObj.name : "\uBBF8\uC124\uC815";
    if (profileTeamEl) profileTeamEl.textContent = teamVal || "\uBBF8\uC124\uC815";
    if (profileNicknameEl) profileNicknameEl.textContent = nickVal;
    const profileAvatarEl = document.getElementById("my-profile-avatar");
    if (profileAvatarEl) {
      profileAvatarEl.src = state.userAvatarUrl || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><circle cx='12' cy='12' r='12' fill='%23c4c9d3'/><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' fill='%23ffffff'/></svg>";
    }

    this.closeModal("modal-edit-profile");
    this.showToast("\uD83C\uDF89", "\uD504\uB85C\uD544 \uC124\uC815\uC774 \uBCC0\uACBD\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
  }

  openWithdrawModal() {
    this.openModal("modal-withdraw");
  }

  async confirmWithdrawal() {
    if (supabaseClient && state.userId) {
      try {
        const { error } = await supabaseClient
          .from('profiles')
          .delete()
          .eq('id', state.userId);
          
        if (error) throw error;
        
        await supabaseClient.auth.signOut();
        
        state.isLoggedIn = false;
        state.userId = null;
        state.userNickname = "@\uC57C\uAD6C\uB7EC\uBC84";
        state.favoriteStadiumId = null;
        state.cheeringTeam = null;
        state.userEmail = "";
        state.userAvatarUrl = "";

        localStorage.removeItem("supabase.auth.token");
        localStorage.removeItem("seatview_nickname");
        localStorage.removeItem("seatview_favorite_stadium");
        localStorage.removeItem("seatview_cheering_team");

        // Clean up Supabase tokens
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && (key.startsWith("sb-") || key.includes("supabase"))) {
            localStorage.removeItem(key);
          }
        }

        this.closeModal("modal-withdraw");
        this.showToast("\uD83D\uDD13", "\uD68C\uC6D0 \uD0C8\uD1F4\uAC00 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.");
        this.navigateTo("main");
        this.checkUserSession();
      } catch (e) {
        console.warn("Withdraw error:", e);
        await this.showAlertDialog("\uD0C8\uD1F4 \uCC98\uB9AC \uC2E4\uD328", "\uD68C\uC6D0 \uD0C8\uD1F4\uB97C \uC9C0\uC6D0\uD558\uAE30 \uC704\uD574 DB\uC5D0 \uD0C8\uD1F4 Policy\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4.\n\n\uC548\uB0B4\uB4DC\uB9AC\uB294 SQL \uCFFC\uB9AC\uB97C SQL Editor\uC5D0 \uC2E4\uD589\uD574 \uC8FC\uC138\uC694!");
      }
    }
  }

  async handleMultiplePhotosSelect(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!state.tempUploadedPhotos) {
      state.tempUploadedPhotos = [];
    }

    const remaining = 5 - state.tempUploadedPhotos.length;
    const toUpload = Array.from(files).slice(0, remaining);

    if (files.length > remaining) {
      this.showToast("\u26A0\uFE0F", "\uCD5C\uB300 5\uC7A5\uAE4C\uC9C0\uB9CC \uB4F1\uB85D \uAC00\uB2A5\uD569\uB2C8\uB2E4.");
    }

    // Only compress + build a local preview here \u2014 the actual Storage
    // upload happens at save time (see resolveFinalImageUrls), so picking
    // then removing a photo before saving never touches the bucket.
    try {
      const blobs = await Promise.all(toUpload.map(file => this.compressImageToWebPBlob(file)));
      const hashes = await Promise.all(blobs.map(blob => this.computeExactPhotoHash(blob).catch(() => null)));
      blobs.forEach((blob, i) => {
        state.tempUploadedPhotos.push({ type: "new", blob, hash: hashes[i], previewUrl: URL.createObjectURL(blob) });
      });
      this.renderUploadedPhotosThumbnails();
    } catch (err) {
      console.error("Multi-image compression error:", err);
      this.showToast("\u26A0\uFE0F", "\uC0AC\uC9C4 \uCC98\uB9AC \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC5B4\uC694.");
    }

    e.target.value = "";
  }

  renderUploadedPhotosThumbnails() {
    const container = document.getElementById("uploaded-photos-thumbnails-container");
    const countLbl = document.getElementById("photos-count-lbl");
    const triggerBtn = document.getElementById("btn-photo-upload-trigger");
    if (!container) return;

    container.innerHTML = "";
    const photos = state.tempUploadedPhotos || [];

    if (countLbl) {
      countLbl.textContent = `${photos.length}/5`;
    }

    if (triggerBtn) {
      if (photos.length >= 5) {
        triggerBtn.style.display = "none";
      } else {
        triggerBtn.style.display = "flex";
      }
    }

    photos.forEach((photo, index) => {
      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      wrapper.style.width = "60px";
      wrapper.style.height = "60px";
      wrapper.style.borderRadius = "10px";
      wrapper.style.overflow = "hidden";
      wrapper.style.border = "1px solid var(--border-color)";

      const src = typeof photo === "string" ? photo : (photo.type === "existing" ? photo.url : photo.previewUrl);

      wrapper.innerHTML = `
        <img src="${src}" style="width: 100%; height: 100%; object-fit: cover;">
        <button type="button" onclick="app.removeUploadedPhoto(${index})" style="position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.6); color: #fff; border: none; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; font-size: 8px; cursor: pointer; padding: 0;">
          \u2715
        </button>
      `;
      container.appendChild(wrapper);
    });
  }

  removeUploadedPhoto(index) {
    if (state.tempUploadedPhotos) {
      const [removed] = state.tempUploadedPhotos.splice(index, 1);
      // Nothing to clean up on the server: "existing" entries aren't touched
      // until save time (see the diff in saveNewTicket), and "new" entries
      // were never uploaded in the first place — just release the local preview.
      if (removed && removed.type === "new" && removed.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      this.renderUploadedPhotosThumbnails();
    }
  }


  // Individual stadium/venue not ready yet (status='preparing'), as opposed
  // to showCategoryComingSoon() which is for an entire category. Reuses the
  // same modal with wording that doesn't tell the user to go look at baseball
  // data — they're already inside an open category, just this one item isn't ready.
  showItemPreparing(itemName) {
    const titleEl = document.getElementById("coming-soon-title");
    const descEl = document.getElementById("coming-soon-desc");
    if (titleEl) titleEl.textContent = "시야 정보 준비 중입니다";
    if (descEl) {
      descEl.innerHTML = `${itemName}은(는)<br>아직 좌석 시야 데이터를 준비하고 있어요.<br>조금만 기다려 주세요!`;
    }
    this.openModal("modal-coming-soon");
  }

  showCategoryComingSoon(categoryName) {
    const titleEl = document.getElementById("coming-soon-title");
    const descEl = document.getElementById("coming-soon-desc");
    if (titleEl) titleEl.textContent = "서비스 준비 중입니다";
    if (descEl) {
      descEl.innerHTML = `${categoryName} 시야 정보는<br>초기 서비스 안정화 후 곧 오픈될 예정입니다.<br>공연장 데이터부터 먼저 체험해 보세요!`;
    }
    this.openModal("modal-coming-soon");
  }

  showMusicalComingSoon() {
    const titleEl = document.getElementById("coming-soon-title");
    const descEl = document.getElementById("coming-soon-desc");
    if (titleEl) titleEl.textContent = "\uC11C\uBE44\uC2A4 \uC900\uBE44 \uC911\uC785\uB2C8\uB2E4";
    if (descEl) {
      descEl.innerHTML = "\uACF5\uC530\uC7A5(\uBBA4\uC9C0\uCEEC/\uC5F0\uADF9) \uC2DC\uC57C \uC815\uBCF4\uB294<br>\uCD08\uAE30 \uC11C\uBE44\uC2A4 \uC548\uC815\uD654 \uD6C4 \uACE7 \uC624\uD540\uB420 \uC608\uC815\uC785\uB2C8\uB2E4.<br>\uC57C\uAD6C\uC7A5 \uB370\uC774\uD130\uB9AC\uD130 \uBA3C\uC800 \uCCB4\uD5D8\uD574 \uBCF4\uC138\uC694!";
    }
    this.openModal("modal-coming-soon");
  }

  showFlightComingSoon() {
    const titleEl = document.getElementById("coming-soon-title");
    const descEl = document.getElementById("coming-soon-desc");
    if (titleEl) titleEl.textContent = "\uC11C\uBE44\uC2A4 \uC900\uBE44 \uC911\uC785\uB2C8\uB2E4";
    if (descEl) {
      descEl.innerHTML = "\uBE44\uD5E9\uAE30(\uD56D\uACF5) \uC2DC\uC57C \uC815\uBCF4\uB294<br>\uCD08\uAE30 \uC11C\uBE44\uC2A4 \uC548\uC815\uD654 \uD6C4 \uACE7 \uC624\uD540\uB420 \uC608\uC815\uC785\uB2C8\uB2E4.<br>\uC57C\uAD6C\uC7A5 \uB370\uC774\uD130\uB9AC\uD130 \uBA3C\uC800 \uCCB4\uD5D8\uD574 \uBCF4\uC138\uC694!";
    }
    this.openModal("modal-coming-soon");
  }

  toggleMapCollapse() {
    const wrapper = document.getElementById("stadium-static-map-wrapper");
    const btn = document.getElementById("map-collapse-btn");
    if (!wrapper || !btn) return;
    
    const isCollapsed = wrapper.classList.toggle("collapsed");
    if (isCollapsed) {
      btn.classList.remove("expanded");
      btn.querySelector("span").textContent = "🗺️ 좌석 이미지 펼치기";
    } else {
      btn.classList.add("expanded");
      btn.querySelector("span").textContent = "🗺️ 좌석 이미지 접기";
    }
  }

  loadJamsilDetail() {
    this.loadStadiumDetail("jamsil");
    // Trigger block 102 view
    setTimeout(() => {
      if (state.selectedStadium && state.selectedStadium.blocks) {
        const b102 = state.selectedStadium.blocks.find(b => b.block_code === "102" || b.id === "b102" || b.id === "5");
        if (b102) {
          this.selectStadiumBlock(b102.id);
        }
      }
    }, 200);
  }

  // Tab switching in Stadium details
  switchDetailTab(tabName) {
    state.activeDetailTab = tabName;

    // Scoped to #view-stadium-detail — an unscoped ".detail-tabs .tab-btn"
    // query hits every tab group on the page (mypage's category tabs and
    // venue-detail's own tabs also use the same shared classes), silently
    // wiping their "active" state whenever this ran.
    document.querySelectorAll("#view-stadium-detail .detail-tabs .tab-btn").forEach(btn => {
      btn.classList.remove("active");
    });
    const clickedBtn = document.querySelector(`#view-stadium-detail .detail-tabs .tab-btn[onclick*="${tabName}"]`);
    if (clickedBtn) clickedBtn.classList.add("active");

    // Toggle panels
    document.getElementById("tab-content-map").classList.remove("active");
    document.getElementById("tab-content-info").classList.remove("active");

    document.getElementById(`tab-content-${tabName}`).classList.add("active");
  }

  // Small anchored speech-bubble tooltip (shopping-site style) for a "!"
  // info button — not a toast, since a bottom-of-screen notification reads
  // as a status update, not an explanation tied to a specific field. Tap
  // anywhere else to dismiss; only one shows at a time.
  showFieldTooltip(triggerEl, message) {
    const existing = document.getElementById("field-tooltip-bubble");
    // Clicking the SAME "!" that's already showing its bubble should close
    // it (a real toggle) rather than tear it down and immediately rebuild
    // an identical-looking one, which read as "the second click does
    // nothing." Clicking a DIFFERENT "!" while one is open still just
    // swaps to the new bubble, same as before.
    const reopeningSameTrigger = existing && existing._triggerEl === triggerEl;
    if (existing) existing.remove();
    if (this._fieldTooltipDismissHandler) {
      document.removeEventListener("click", this._fieldTooltipDismissHandler, true);
      this._fieldTooltipDismissHandler = null;
    }
    if (reopeningSameTrigger) return;

    const bubble = document.createElement("div");
    bubble._triggerEl = triggerEl;
    bubble.id = "field-tooltip-bubble";
    bubble.textContent = message;
    bubble.style.cssText = "position:fixed; z-index:4000; max-width:270px; white-space:pre-line; word-break:keep-all; background:#1f2430; color:#f3f4f6; font-size:0.72rem; font-weight:600; line-height:1.5; padding:9px 12px; border-radius:10px; box-shadow:0 8px 24px rgba(0,0,0,0.35); border:1px solid rgba(255,255,255,0.08);";

    const arrow = document.createElement("div");
    arrow.style.cssText = "position:absolute; width:9px; height:9px; background:#1f2430; border-left:1px solid rgba(255,255,255,0.08); border-top:1px solid rgba(255,255,255,0.08); transform:rotate(45deg); top:-5px;";
    bubble.appendChild(arrow);

    document.body.appendChild(bubble);

    const rect = triggerEl.getBoundingClientRect();
    const bubbleRect = bubble.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - bubbleRect.width / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - bubbleRect.width - 8));
    bubble.style.left = left + "px";
    bubble.style.top = (rect.bottom + 8) + "px";
    arrow.style.left = (rect.left + rect.width / 2 - left - 4.5) + "px";

    const dismiss = (e) => {
      if (bubble.contains(e.target) || e.target === triggerEl) return;
      bubble.remove();
      document.removeEventListener("click", dismiss, true);
      this._fieldTooltipDismissHandler = null;
    };
    this._fieldTooltipDismissHandler = dismiss;
    // Deferred so the same click that opened it doesn't immediately close it.
    setTimeout(() => document.addEventListener("click", dismiss, true), 0);
  }

  // --- Toast System ---
  showToast(icon, message) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    
    // message can echo back raw user input (e.g. a search query with no
    // match) — build it as a text node instead of interpolating into
    // innerHTML, so it can never be parsed as markup/script.
    toast.innerHTML = `<span style="font-size: 1.1rem; line-height: 1;">${icon}</span><span class="toast-message"></span>`;
    toast.querySelector(".toast-message").textContent = message;

    container.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = "slideUp 0.3s forwards, fadeOut 0.3s forwards";
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }

  // Safety net for the fixed-height comment boxes: new comments are capped
  // at input time (120자), but this guards against any older/legacy data
  // that predates that limit.
  truncateComment(text, max = 120) {
    if (!text) return text;
    return text.length > max ? text.slice(0, max) + "…" : text;
  }

  // Escapes user-supplied text (review comments, nicknames, etc.) before it
  // is interpolated into an innerHTML template, so stored content can never
  // be parsed as markup/script by the browser.
  // "2026-07-01" -> "2026.07.01", for the venue-detail 공연 일정 card.
  formatShowDate(isoDate) {
    return isoDate ? isoDate.replace(/-/g, ".") : "";
  }

  escapeHtml(text) {
    if (text === null || text === undefined) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Turns admin-entered info text (food/parking/sunlight, etc.) into a
  // (optionally two-level) bullet list with **bold** support, instead of
  // collapsing into one run-on line — textContent ignores literal newlines
  // in the stored string entirely (default white-space:normal), and can't
  // render any markup even if the admin typed it.
  // A line with no leading whitespace is a top-level item (• marker); a
  // line that starts with whitespace is a sub-item under it (- marker,
  // indented) — e.g. "공연장 주차장" then "   관람객 할인" underneath.
  // Any dash the admin already typed on an indented line is stripped first
  // so it isn't doubled up with the auto-added one. **word** within a line
  // becomes bold. Escaped first so stored text can never inject real markup,
  // same as escapeHtml's own use.
  formatInfoText(raw) {
    if (!raw) return "";
    const items = String(raw).split("\n")
      .filter(line => line.trim().length > 0)
      .map(line => {
        const isSubItem = /^\s/.test(line);
        const content = line.trim().replace(/^-+\s*/, "");
        const bolded = this.escapeHtml(content).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        return `<li${isSubItem ? ' class="info-sub-item"' : ''}>${bolded}</li>`;
      });
    if (items.length === 0) return "";
    return `<ul class="info-bullet-list">${items.join("")}</ul>`;
  }

  // Kakao AdFit's script scans for .kakao_ad_area elements once, when it
  // loads — a slot markup'd directly into a view that starts hidden (see
  // .view's display:none) never gets picked up, so it silently never fills.
  // Building the <ins> fresh into an empty container the first time that
  // view is actually shown sidesteps this (guarded so a second visit to the
  // same view doesn't inject a duplicate ad into the same slot).
  // Kakao AdFit's script (ba.min.js) only scans the DOM for .kakao_ad_area
  // elements once, when it first executes — it has no MutationObserver to
  // notice slots created later. Since this <ins> is created here (well
  // after that first scan, whenever the user first navigates into this
  // view), Kakao's script has never seen it and it would stay hidden
  // forever unless something re-runs that scan. Re-appending a fresh
  // <script src="ba.min.js"> tag does exactly that.
  injectKakaoAd(containerId, adUnit, width = 320, height = 50) {
    const container = document.getElementById(containerId);
    if (!container || container.dataset.injected === "true") return;
    container.dataset.injected = "true";
    const ins = document.createElement("ins");
    ins.className = "kakao_ad_area";
    ins.style.display = "none";
    ins.setAttribute("data-ad-unit", adUnit);
    ins.setAttribute("data-ad-width", String(width));
    ins.setAttribute("data-ad-height", String(height));
    container.appendChild(ins);

    const script = document.createElement("script");
    script.src = "//t1.kakaocdn.net/kas/static/ba.min.js";
    script.async = true;
    document.body.appendChild(script);
  }

  autoResizeTextarea(textarea) {
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }

  updateCommentCounter(textarea) {
    const counterEl = document.getElementById("form-comment-counter");
    if (!counterEl || !textarea) return;
    const max = textarea.getAttribute("maxlength") || 120;
    counterEl.textContent = `${textarea.value.length}/${max}`;
  }
}

// Instantiate global application controller
window.app = new SeatViewApp();
