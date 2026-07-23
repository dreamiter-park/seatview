/* ==========================================================================
   SeatView SPA Core Application Logic (Vanilla JS)
   ========================================================================== */

// --- 1. Seed & Mock Database ---
const STADIUMS_DB = [
  {
    id: "jamsil",
    name: "잠실 야구장",
    fullname: "서울종합운동장 야구장",
    team: "LG 트윈스 / 두산 베어스",
    location: "서울 송파구 올림픽로 25",
    bg: "assets/jamsil_stadium.png",
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
    bg: "assets/jamsil_stadium.png", // reusing for demo
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
    bg: "assets/jamsil_stadium.png",
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
    bg: "assets/jamsil_stadium.png",
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
    bg: "assets/jamsil_stadium.png",
    gradient: "linear-gradient(135deg, rgba(29, 78, 216, 0.95), rgba(15, 23, 42, 0.75))",
    blocks: [
      { id: "b101", name: "블루존 3-1구역", category: "응원" },
      { id: "b102", name: "3루 내야지정석", category: "내야" }
    ],
    amenities: {
      toilet: [{ name: "블루존 뒤 화장실", x: 30, y: 70 }],
      snack: [{ name: "라이온즈파크 납작만두", x: 35, y: 65 }],
      exit: [{ name: "정문 출구", x: 50, y: 80 }],
      medical: [{ name: "라팍 의무실", x: 50, y: 60 }]
    }
  },
  {
    id: "gwangju",
    name: "광주-기아 챔피언스 필드",
    fullname: "광주-기아 챔피언스 필드",
    team: "KIA 타이거즈",
    location: "광주 북구 서림로 10",
    bg: "assets/jamsil_stadium.png",
    gradient: "linear-gradient(135deg, rgba(185, 28, 28, 0.95), rgba(28, 25, 23, 0.75))",
    blocks: [
      { id: "b101", name: "3루 K9구역", category: "내야" },
      { id: "b102", name: "서서피크닉석", category: "외야" }
    ],
    amenities: {
      toilet: [{ name: "3루 내야 복도 화장실", x: 35, y: 70 }],
      snack: [{ name: "광주 챔필 마왕족발", x: 40, y: 65 }],
      exit: [{ name: "메인 게이트", x: 50, y: 80 }],
      medical: [{ name: "타이거즈 의무실", x: 50, y: 55 }]
    }
  },
  {
    id: "daejeon",
    name: "한화생명 이글스파크",
    fullname: "대전 한화생명 이글스파크",
    team: "한화 이글스",
    location: "대전 중구 대종로 373",
    bg: "assets/jamsil_stadium.png",
    gradient: "linear-gradient(135deg, rgba(234, 88, 12, 0.95), rgba(39, 39, 42, 0.75))",
    blocks: [
      { id: "b101", name: "1루 내야탁자석", category: "내야" },
      { id: "b102", name: "외야 자유석", category: "외야" }
    ],
    amenities: {
      toilet: [{ name: "1루 화장실", x: 65, y: 70 }],
      snack: [{ name: "농심 가락 떡볶이", x: 60, y: 65 }],
      exit: [{ name: "주 게이트", x: 50, y: 80 }],
      medical: [{ name: "이글스 의무실", x: 55, y: 50 }]
    }
  },
  {
    id: "busan",
    name: "사직 야구장",
    fullname: "사직 야구장",
    team: "롯데 자이언츠",
    location: "부산 동래구 사직로 45",
    bg: "assets/jamsil_stadium.png",
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
    bg: "assets/jamsil_stadium.png",
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
    { inner: "111", innerGrade: "table", mid: "213", midGrade: "table", outer: "315", outerGrade: "navy" },
    { inner: "110", innerGrade: "table", mid: "212", midGrade: "table", outer: "314", outerGrade: "navy" },
    { inner: "109", innerGrade: "blue", mid: "211", midGrade: "blue", outer: "313", outerGrade: "navy" },
    { inner: "108", innerGrade: "blue", mid: "210", midGrade: "blue", outer: "312", outerGrade: "navy" },
    { inner: "107", innerGrade: "blue", mid: "209", midGrade: "blue", outer: "311", outerGrade: "navy" },
    { inner: "106", innerGrade: "orange", mid: "208", midGrade: "blue", outer: "310", outerGrade: "navy" },
    { inner: "105", innerGrade: "orange", mid: "207", midGrade: "blue", outer: "309", outerGrade: "navy" },
    { inner: "104", innerGrade: "orange", mid: "206", midGrade: "red", outer: "308", outerGrade: "navy" },
    { inner: "103", innerGrade: "red", mid: "205", midGrade: "red", outer: "307", outerGrade: "navy" },
    { inner: "102", innerGrade: "red", mid: "204", midGrade: "red", outer: "306", outerGrade: "navy" },
    { inner: "101", innerGrade: "red", mid: "203", midGrade: "red", outer: "305", outerGrade: "navy" },
    { inner: null, innerGrade: null, mid: "202", midGrade: "red", outer: "304", outerGrade: "navy" },
    { inner: null, innerGrade: null, mid: "201", midGrade: "red", outer: "303", outerGrade: "navy" },
    { inner: null, innerGrade: null, mid: null, midGrade: null, outer: "302", outerGrade: "navy" },
    { inner: null, innerGrade: null, mid: null, midGrade: null, outer: "301", outerGrade: "navy" }
  ];

  const awayCols = [
    { inner: "112", innerGrade: "table", mid: "214", midGrade: "table", outer: "316", outerGrade: "navy" },
    { inner: "113", innerGrade: "table", mid: "215", midGrade: "table", outer: "317", outerGrade: "navy" },
    { inner: "114", innerGrade: "table", mid: "216", midGrade: "table", outer: "318", outerGrade: "navy" },
    { inner: "115", innerGrade: "table", mid: "217", midGrade: "blue", outer: "319", outerGrade: "navy" },
    { inner: "116", innerGrade: "blue", mid: "218", midGrade: "blue", outer: "320", outerGrade: "navy" },
    { inner: "117", innerGrade: "red", mid: "219", midGrade: "blue", outer: "321", outerGrade: "navy" },
    { inner: "118", innerGrade: "red", mid: "220", midGrade: "blue", outer: "322", outerGrade: "navy" },
    { inner: "119", innerGrade: "red", mid: "221", midGrade: "red", outer: "323", outerGrade: "navy" },
    { inner: "120", innerGrade: "red", mid: "222", midGrade: "red", outer: "324", outerGrade: "navy" },
    { inner: "121", innerGrade: "orange", mid: "223", midGrade: "red", outer: "325", outerGrade: "navy" },
    { inner: "122", innerGrade: "orange", mid: "224", midGrade: "red", outer: "326", outerGrade: "navy" },
    { inner: null, innerGrade: null, mid: "225", midGrade: "red", outer: "327", outerGrade: "navy" },
    { inner: null, innerGrade: null, mid: "226", midGrade: "red", outer: "328", outerGrade: "navy" },
    { inner: null, innerGrade: null, mid: null, midGrade: null, outer: "329", outerGrade: "navy" },
    { inner: null, innerGrade: null, mid: null, midGrade: null, outer: "330", outerGrade: "navy" },
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
    const num = 401 + i;
    jamsil.blocks.push({ id: `b${num}`, name: `외야 그린석 ${num}블록`, category: "외야", grade: "green" });
  }
}

// Seat Views DB (Key: stadiumId_blockId_rowNum_seatNum)
const SEAT_VIEWS_DB = {
  "jamsil_b103_1_1": {
    stadiumName: "잠실 야구장",
    blockName: "1루 오렌지석 103블록",
    seatName: "1열 1번",
    image: "assets/seat_view_clean.png",
    uploader: "@twins_victory",
    uploaderBadge: "골드 제보자",
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
    image: "assets/seat_view_clean.png",
    uploader: "@stadium_goer",
    uploaderBadge: "VIP 제보자",
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
    image: "assets/seat_view_clean.png",
    uploader: "@lotte_no_lg",
    uploaderBadge: "일반 제보자",
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
    image: "assets/seat_view_blocked.png",
    uploader: "@silent_fan",
    uploaderBadge: "실버 제보자",
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
    image: "assets/seat_view_clean.png",
    uploader: "@baseball_lover",
    uploaderBadge: "골드 제보자",
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
    image: "assets/seat_view_blocked.png",
    uploader: "@twins_victory",
    uploaderBadge: "일반 제보자",
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
    image: "assets/seat_view_clean.png",
    uploader: "@cheer_king",
    uploaderBadge: "VIP 제보자",
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
    image: "assets/seat_view_clean.png",
    uploader: "@dome_fan",
    uploaderBadge: "골드 제보자",
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
    image: "assets/seat_view_clean.png"
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
    image: "assets/seat_view_blocked.png"
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
    image: "assets/seat_view_clean.png"
  }
];

// --- 2. Application State ---
const state = {
  currentView: "main",
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
  userStats: {
    points: 1500,
    uploads: 3
  }
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

    // Initialize Comparisons from LocalStorage
    state.comparisons = JSON.parse(localStorage.getItem("seatview_compare") || "[]");

    // Populate Dynamic DOM Elements
    this.renderStadiumList();
    this.updateCompareBadge();

    // Setup Event Listeners
    this.setupListeners();

    // Initialize Theme
    const savedTheme = localStorage.getItem("seatview_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);

    // Update menu elements immediately based on theme
    const themeIcon = document.getElementById("theme-icon");
    const themeText = document.getElementById("theme-text");
    if (themeIcon && themeText) {
      if (savedTheme === "light") {
        themeIcon.setAttribute("data-lucide", "moon");
        themeText.textContent = "다크 모드로 전환";
      } else {
        themeIcon.setAttribute("data-lucide", "sun");
        themeText.textContent = "라이트 모드로 전환";
      }
    }

    // Trigger Initial Layout setup
    lucide.createIcons();
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
    // Quick handle search box typing
    const searchInput = document.getElementById("main-search-input");
    if (searchInput) {
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && searchInput.value.trim() !== "") {
          this.showToast("⚡", `'${searchInput.value}' 검색 결과가 준비 중입니다!`);
          searchInput.value = "";
        }
      });
    }

    // Set up click-and-drag horizontal scroll for the grade filter bar
    this.setupDragScroll("grade-filter-bar");
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

  // --- Router ---
  navigateTo(viewId) {
    // Hide all views
    document.querySelectorAll(".view").forEach(view => {
      view.classList.remove("active");
    });

    // Show targeted view
    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) {
      targetView.classList.add("active");
      state.currentView = viewId;
    }

    // Update Bottom Navigation state
    document.querySelectorAll(".nav-item").forEach(nav => {
      nav.classList.remove("active");
      if (nav.dataset.target === viewId) {
        nav.classList.add("active");
      }
    });

    // --- Dynamic Header Layout Updates ---
    const logoEl = document.getElementById("header-logo");
    const backBtn = document.getElementById("header-back-btn");
    const titleEl = document.getElementById("header-title");

    if (viewId === "stadiums" || viewId === "stadium-detail") {
      // Subpage header layout
      if (logoEl) logoEl.style.display = "none";
      if (backBtn) backBtn.style.display = "flex";
      if (titleEl) {
        titleEl.style.display = "block";
        if (viewId === "stadiums") {
          titleEl.textContent = "프로야구";
        } else if (viewId === "stadium-detail" && state.selectedStadium) {
          titleEl.textContent = state.selectedStadium.name;
        }
      }
    } else {
      // Main page/tab header layout
      if (logoEl) logoEl.style.display = "block";
      if (backBtn) backBtn.style.display = "none";
      if (titleEl) {
        titleEl.style.display = "none";
      }
    }

    // Specific Screen Initialization
    if (viewId === "ticketbook") {
      this.renderTicketbook();
    } else if (viewId === "compare") {
      this.renderCompareView();
    } else if (viewId === "stadiums") {
      this.renderStadiumList();
    }

    // Scroll to top of app content
    document.getElementById("app-content").scrollTop = 0;
  }

  handleNavClick(el) {
    const target = el.dataset.target;
    this.navigateTo(target);
  }

  handleHeaderBack() {
    if (state.currentView === "stadium-detail") {
      if (state.selectedBlock) {
        // Back to Stadium overall map view
        state.selectedBlock = null;
        document.getElementById("block-seats-section").style.display = "none";
        document.getElementById("stadium-overall-map-view").style.display = "block";
        
        const titleEl = document.getElementById("header-title");
        if (titleEl && state.selectedStadium) {
          titleEl.textContent = state.selectedStadium.name;
        }
      } else {
        // Back to Stadiums list
        this.navigateTo("stadiums");
      }
    } else if (state.currentView === "stadiums") {
      this.navigateTo("main");
    } else {
      this.navigateTo("main");
    }
  }

  openMenuModal() {
    this.openModal("modal-menu");
  }

  // --- Stadiums Selection View ---
  renderStadiumList() {
    const container = document.getElementById("stadium-grid-container");
    if (!container) return;

    container.innerHTML = "";
    STADIUMS_DB.forEach(st => {
      const card = document.createElement("div");
      card.className = "stadium-card";
      // Apply gradient overlay + background image photo
      card.style.backgroundImage = `${st.gradient}, url('${st.bg}')`;
      card.onclick = () => this.loadStadiumDetail(st.id);

      card.innerHTML = `
        <div class="stadium-card-main">
          <span class="stadium-card-team">${st.team.split(" / ")[0]}</span>
          <h3 class="stadium-card-name">${st.name}</h3>
          <span class="stadium-card-location"><i data-lucide="map-pin"></i> ${st.location.split(" ").slice(0, 2).join(" ")}</span>
        </div>
      `;
      container.appendChild(card);
    });
    lucide.createIcons();
  }

  // --- Stadium Detail View ---
  loadStadiumDetail(stadiumId) {
    const stadium = STADIUMS_DB.find(st => st.id === stadiumId);
    if (!stadium) return;

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

    // Inject Stadium SVG Map
    this.injectStadiumMap(stadiumId);

    // Reset display divs
    document.getElementById("stadium-overall-map-view").style.display = "block";
    document.getElementById("block-seats-section").style.display = "none";

    // Switch default tab
    this.switchDetailTab("map");

    // Render detailed blocks list for '전체' by default
    this.renderDetailedBlocks("전체");

    // Navigate to Detail view
    this.navigateTo("stadium-detail");
  }

  // Inject beautiful customizable SVG for Seating layout
  injectStadiumMap(stadiumId, detailedZoneName = null) {
    const containerId = detailedZoneName ? "detailed-block-svg-container" : "stadium-map-container";
    const container = document.getElementById(containerId);
    if (!container) return;

    const is3B = detailedZoneName === "3루 내야/응원석";
    const is1B = detailedZoneName === "1루 내야/응원석";
    const isOutfield = detailedZoneName === "외야석";
    const hasFilter = detailedZoneName !== null;

    // Reset grade filter view state on reload of Overall map
    state.selectedGradeFilter = "all";
    document.querySelectorAll(".grade-pill").forEach(p => p.classList.remove("active"));
    const allPill = Array.from(document.querySelectorAll(".grade-pill")).find(p => p.textContent.includes("전체"));
    if (allPill) allPill.classList.add("active");

    if (stadiumId === "jamsil") {
      const cx = 200, cy = 160;
      let svgContent = `
        <svg viewBox="50 10 300 300" width="100%" height="100%">
          <!-- Baseball infield grass background -->
          <circle cx="${cx}" cy="${cy}" r="45" fill="#14532d" opacity="0.3" />
          <path d="M 160 ${cy} L 200 ${cy - 40} L 240 ${cy} L 200 ${cy + 40} Z" fill="#b45309" opacity="0.4" />
          <rect x="197" y="${cy + 37}" width="6" height="6" fill="#ffffff" transform="rotate(45, 200, ${cy + 40})" />
      `;

      // Helper function to generate mathematically precise concentric wedge path
      const getWedgePath = (rIn, rOut, startAngle, endAngle) => {
        const rad = Math.PI / 180;
        // In Jamsil coordinate system, 0 is at the bottom (180 degrees from standard polar)
        const sAngle = (startAngle + 90) * rad;
        const eAngle = (endAngle + 90) * rad;

        const x1_in = cx + rIn * Math.cos(sAngle);
        const y1_in = cy + rIn * Math.sin(sAngle);
        const x2_in = cx + rIn * Math.cos(eAngle);
        const y2_in = cy + rIn * Math.sin(eAngle);

        const x1_out = cx + rOut * Math.cos(sAngle);
        const y1_out = cy + rOut * Math.sin(sAngle);
        const x2_out = cx + rOut * Math.cos(eAngle);
        const y2_out = cy + rOut * Math.sin(eAngle);

        const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;

        return `M ${x1_in} ${y1_in} L ${x1_out} ${y1_out} A ${rOut} ${rOut} 0 ${largeArc} 1 ${x2_out} ${y2_out} L ${x2_in} ${y2_in} A ${rIn} ${rIn} 0 ${largeArc} 0 ${x1_in} ${y1_in} Z`;
      };

      const getColorForGrade = (grade) => {
        const colors = {
          premium: "#a3e635",
          table: "#db2777",
          blue: "#2563eb",
          orange: "#ea580c",
          red: "#dc2626",
          navy: "#1e3a8a",
          green: "#16a34a"
        };
        return colors[grade] || "#64748b";
      };

      const homeCols = [
        { inner: "111", innerGrade: "table", mid: "213", midGrade: "table", outer: "315", outerGrade: "navy" },
        { inner: "110", innerGrade: "table", mid: "212", midGrade: "table", outer: "314", outerGrade: "navy" },
        { inner: "109", innerGrade: "blue", mid: "211", midGrade: "blue", outer: "313", outerGrade: "navy" },
        { inner: "108", innerGrade: "blue", mid: "210", midGrade: "blue", outer: "312", outerGrade: "navy" },
        { inner: "107", innerGrade: "blue", mid: "209", midGrade: "blue", outer: "311", outerGrade: "navy" },
        { inner: "106", innerGrade: "orange", mid: "208", midGrade: "blue", outer: "310", outerGrade: "navy" },
        { inner: "105", innerGrade: "orange", mid: "207", midGrade: "blue", outer: "309", outerGrade: "navy" },
        { inner: "104", innerGrade: "orange", mid: "206", midGrade: "red", outer: "308", outerGrade: "navy" },
        { inner: "103", innerGrade: "red", mid: "205", midGrade: "red", outer: "307", outerGrade: "navy" },
        { inner: "102", innerGrade: "red", mid: "204", midGrade: "red", outer: "306", outerGrade: "navy" },
        { inner: "101", innerGrade: "red", mid: "203", midGrade: "red", outer: "305", outerGrade: "navy" },
        { inner: null, innerGrade: null, mid: "202", midGrade: "red", outer: "304", outerGrade: "navy" },
        { inner: null, innerGrade: null, mid: "201", midGrade: "red", outer: "303", outerGrade: "navy" },
        { inner: null, innerGrade: null, mid: null, midGrade: null, outer: "302", outerGrade: "navy" },
        { inner: null, innerGrade: null, mid: null, midGrade: null, outer: "301", outerGrade: "navy" }
      ];

      const awayCols = [
        { inner: "112", innerGrade: "table", mid: "214", midGrade: "table", outer: "316", outerGrade: "navy" },
        { inner: "113", innerGrade: "table", mid: "215", midGrade: "table", outer: "317", outerGrade: "navy" },
        { inner: "114", innerGrade: "table", mid: "216", midGrade: "table", outer: "318", outerGrade: "navy" },
        { inner: "115", innerGrade: "table", mid: "217", midGrade: "blue", outer: "319", outerGrade: "navy" },
        { inner: "116", innerGrade: "blue", mid: "218", midGrade: "blue", outer: "320", outerGrade: "navy" },
        { inner: "117", innerGrade: "red", mid: "219", midGrade: "blue", outer: "321", outerGrade: "navy" },
        { inner: "118", innerGrade: "red", mid: "220", midGrade: "blue", outer: "322", outerGrade: "navy" },
        { inner: "119", innerGrade: "red", mid: "221", midGrade: "red", outer: "323", outerGrade: "navy" },
        { inner: "120", innerGrade: "red", mid: "222", midGrade: "red", outer: "324", outerGrade: "navy" },
        { inner: "121", innerGrade: "orange", mid: "223", midGrade: "red", outer: "325", outerGrade: "navy" },
        { inner: "122", innerGrade: "orange", mid: "224", midGrade: "red", outer: "326", outerGrade: "navy" },
        { inner: null, innerGrade: null, mid: "225", midGrade: "red", outer: "327", outerGrade: "navy" },
        { inner: null, innerGrade: null, mid: "226", midGrade: "red", outer: "328", outerGrade: "navy" },
        { inner: null, innerGrade: null, mid: null, midGrade: null, outer: "329", outerGrade: "navy" },
        { inner: null, innerGrade: null, mid: null, midGrade: null, outer: "330", outerGrade: "navy" },
        { inner: null, innerGrade: null, mid: null, midGrade: null, outer: "331", outerGrade: "navy" },
        { inner: null, innerGrade: null, mid: null, midGrade: null, outer: "332", outerGrade: "navy" },
        { inner: null, innerGrade: null, mid: null, midGrade: null, outer: "333", outerGrade: "navy" },
        { inner: null, innerGrade: null, mid: null, midGrade: null, outer: "334", outerGrade: "navy" }
      ];

      const blocks = [
        { id: "b_prem", label: "212", grade: "premium", rIn: 55, rOut: 75, start: -4, end: 4, color: "#a3e635" }
      ];

      homeCols.forEach((col, idx) => {
        const start = 4 + idx * 8;
        const end = start + 8;
        if (col.inner) blocks.push({ id: `b${col.inner}`, label: col.inner, grade: col.innerGrade, rIn: 55, rOut: 75, start, end, color: getColorForGrade(col.innerGrade) });
        if (col.mid) blocks.push({ id: `b${col.mid}`, label: col.mid, grade: col.midGrade, rIn: 77, rOut: 105, start, end, color: getColorForGrade(col.midGrade) });
        if (col.outer) blocks.push({ id: `b${col.outer}`, label: col.outer, grade: col.outerGrade, rIn: 107, rOut: 135, start, end, color: getColorForGrade(col.outerGrade) });
      });

      awayCols.forEach((col, idx) => {
        const end = -4 - idx * 8;
        const start = end - 8;
        if (col.inner) blocks.push({ id: `b${col.inner}`, label: col.inner, grade: col.innerGrade, rIn: 55, rOut: 75, start, end, color: getColorForGrade(col.innerGrade) });
        if (col.mid) blocks.push({ id: `b${col.mid}`, label: col.mid, grade: col.midGrade, rIn: 77, rOut: 105, start, end, color: getColorForGrade(col.midGrade) });
        if (col.outer) blocks.push({ id: `b${col.outer}`, label: col.outer, grade: col.outerGrade, rIn: 107, rOut: 135, start, end, color: getColorForGrade(col.outerGrade) });
      });

      const outfieldStart = 125;
      const outfieldEnd = 235;
      const outfieldStep = (outfieldEnd - outfieldStart) / 22;
      for (let i = 0; i < 22; i++) {
        const start = outfieldStart + i * outfieldStep;
        const end = start + outfieldStep;
        const num = 401 + i;
        blocks.push({ id: `b${num}`, label: `${num}`, grade: "green", rIn: 95, rOut: 135, start, end, color: "#16a34a" });
      }

      blocks.forEach(b => {
        const path = getWedgePath(b.rIn, b.rOut, b.start, b.end);
        
        // Calculate label position
        const rad = Math.PI / 180;
        const midAngle = ((b.start + b.end) / 2 + 90) * rad;
        const midRadius = (b.rIn + b.rOut) / 2;
        const lx = cx + midRadius * Math.cos(midAngle);
        const ly = cy + midRadius * Math.sin(midAngle);
        
        // Set font size based on block grade to fit narrow sectors nicely
        const fontSize = b.grade === "green" ? 5.2 : (b.grade === "navy" ? 5.6 : 6.2);

        svgContent += `
          <path d="${path}" class="stadium-sector" data-grade="${b.grade}" onclick="app.selectStadiumBlock('${b.id}')" fill="${b.color}" />
          <text x="${lx}" y="${ly + 2}" fill="white" font-size="${fontSize}" font-weight="normal" text-anchor="middle" pointer-events="none">${b.label}</text>
        `;
      });

      // Wheelchair circles
      svgContent += `
          <circle cx="${cx + 82 * Math.cos((32 + 90) * Math.PI / 180)}" cy="${cy + 82 * Math.sin((32 + 90) * Math.PI / 180)}" r="4" class="stadium-sector" data-grade="wheelchair" onclick="app.selectStadiumBlock('b103')" fill="#64748b" />
          <circle cx="${cx + 82 * Math.cos((-74 + 90) * Math.PI / 180)}" cy="${cy + 82 * Math.sin((-74 + 90) * Math.PI / 180)}" r="4" class="stadium-sector" data-grade="wheelchair" onclick="app.selectStadiumBlock('b121')" fill="#64748b" />
        </svg>
        <div id="amenities-marker-wrapper" style="position: absolute; inset: 0; pointer-events: none; margin: 16px;"></div>
      `;

      container.innerHTML = svgContent;
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
  filterMapByGrade(gradeName) {
    // 1. Update active class on filter pills
    document.querySelectorAll(".grade-pill").forEach(pill => {
      pill.classList.remove("active");
    });
    
    // Find clicked pill
    const clickedPill = Array.from(document.querySelectorAll(".grade-pill")).find(pill => 
      pill.getAttribute("onclick").includes(`'${gradeName}'`)
    );
    if (clickedPill) {
      clickedPill.classList.add("active");
    }

    state.selectedGradeFilter = gradeName;

    // 2. Dim non-matching sectors on the SVG map
    const sectors = document.querySelectorAll(".stadium-sector");
    sectors.forEach(sec => {
      const secGrade = sec.getAttribute("data-grade");
      if (gradeName === "all" || secGrade === gradeName) {
        sec.classList.remove("dimmed");
      } else {
        sec.classList.add("dimmed");
      }
    });

    // 3. Update the blocks grid below dynamically
    this.renderDetailedBlocks(state.selectedZone || "전체");

    const gradeLabels = {
      all: "전체 구역",
      premium: "프리미엄석",
      table: "테이블석",
      exciting: "익사이팅석",
      blue: "블루석",
      orange: "오렌지석(응원)",
      red: "레드석",
      navy: "네이비석",
      green: "외야그린석",
      wheelchair: "휠체어석"
    };
    this.showToast("🔍", `${gradeLabels[gradeName] || gradeName} 필터가 적용되었습니다.`);
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
      blocks = blocks.filter(b => b.grade === state.selectedGradeFilter);
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
          if (b.category === "응원") catClass = "cheer";
          if (b.category === "프리미엄") catClass = "premium";
          if (b.category === "외야") catClass = "outfield";

          return `
            <div class="block-card ${catClass}" onclick="app.selectStadiumBlock('${b.id}')">
              <span class="block-card-category">${b.category}</span>
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

  selectStadiumBlock(blockId) {
    if (!state.selectedStadium) return;

    const block = state.selectedStadium.blocks.find(b => b.id === blockId);
    if (!block) return;

    state.selectedBlock = block;

    // Hide Overall map, show Seating Grid
    document.getElementById("stadium-overall-map-view").style.display = "none";
    document.getElementById("block-seats-section").style.display = "block";

    // Set header title
    const titleEl = document.getElementById("header-title");
    if (titleEl) {
      titleEl.textContent = block.name;
    }

    // Render seating grid
    document.getElementById("selected-block-badge").textContent = block.category;
    document.getElementById("selected-block-title").textContent = block.name;
    this.renderSeatingGrid(blockId);
  }

  handleNoPhotoSeatClick(blockName, seatName) {
    if (!state.selectedStadium) return;
    const stadiumName = state.selectedStadium.name;
    this.showToast("ℹ️", `📷 [${stadiumName} - ${blockName} ${seatName}] 최초 시야 사진 제보 및 등록 기능은 정식 오픈 시 지원 예정입니다. 첫 제보자가 되어 보세요!`);
  }

  renderSeatingGrid(blockId) {
    const wrapper = document.getElementById("seat-grid-wrapper");
    const container = document.getElementById("seat-rows-container");
    if (!wrapper || !container) return;

    wrapper.style.display = "block";
    container.innerHTML = "";

    const isJamsil103 = (blockId === "b103" && state.selectedStadium && state.selectedStadium.id === "jamsil");
    const isJamsil118 = (blockId === "b118" && state.selectedStadium && state.selectedStadium.id === "jamsil");

    if (isJamsil103 || isJamsil118) {
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

      for (let r = 1; r <= 18; r++) {
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
              seatBtn.style.backgroundColor = "rgba(239, 68, 68, 0.25)";
              seatBtn.style.borderColor = "var(--danger)";
              seatBtn.style.color = "#ef4444";
              
              // Seed view key mapping
              const dbKey = isJamsil103 ? `jamsil_b103_${r}_${sVal}` : `jamsil_b103_1_1`; // reuse same photo detail for demo comparison
              seatBtn.onclick = () => this.openSeatDetail(dbKey);
            } else if (blocked.includes(seatKey)) {
              seatBtn.classList.add("blocked");
              seatBtn.disabled = true;
            } else {
              seatBtn.onclick = () => this.handleNoPhotoSeatClick(isJamsil103 ? "103블록" : "118블록", `${r}열 ${sVal}번`);
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
            seatBtn.innerHTML = "📷";
            seatBtn.onclick = () => this.openSeatDetail(dbKey);
          } else {
            const isMockPhoto = (r + s) % 7 === 0;
            if (isMockPhoto) {
              seatBtn.classList.add("has-camera");
              seatBtn.innerHTML = "📷";
              seatBtn.onclick = () => this.openMockSeatDetail(r, s);
            } else {
              seatBtn.onclick = () => this.handleNoPhotoSeatClick(state.selectedBlock.name.split(" ")[1] || "구역", `${r}열 ${s}번`);
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
  openSeatDetail(dbKey) {
    const seatInfo = SEAT_VIEWS_DB[dbKey];
    if (!seatInfo) return;

    state.activeModalSeatKey = dbKey;

    document.getElementById("modal-seat-stadium").textContent = seatInfo.stadiumName;
    document.getElementById("modal-seat-title").textContent = `${seatInfo.blockName} ${seatInfo.seatName}`;
    document.getElementById("modal-seat-img").src = seatInfo.image;
    document.getElementById("modal-seat-uploader").textContent = seatInfo.uploader;
    document.getElementById("modal-seat-description").textContent = seatInfo.comment;

    // Upvotes / Downvotes / Badge details
    document.getElementById("modal-seat-upvotes").textContent = seatInfo.upvotes || 0;
    document.getElementById("modal-seat-downvotes").textContent = seatInfo.downvotes || 0;
    document.getElementById("modal-seat-badge").textContent = seatInfo.uploaderBadge || "일반 제보자";

    const upvoteBtn = document.querySelector(".vote-btn.upvote");
    const downvoteBtn = document.querySelector(".vote-btn.downvote");
    if (upvoteBtn && downvoteBtn) {
      upvoteBtn.classList.remove("active");
      downvoteBtn.classList.remove("active");
      if (seatInfo.userVoted === "up") {
        upvoteBtn.classList.add("active");
      } else if (seatInfo.userVoted === "down") {
        downvoteBtn.classList.add("active");
      }
    }

    // Populate tags
    const tagsContainer = document.getElementById("modal-seat-tags");
    tagsContainer.innerHTML = "";
    seatInfo.tags.forEach(tag => {
      const span = document.createElement("span");
      span.className = "badge-tag";
      if (tag.startsWith("⚠️") || tag.startsWith("☀️") || tag.startsWith("🔊")) {
        span.classList.add("highlight-warn");
      } else if (tag.startsWith("✅")) {
        span.classList.add("highlight-ok");
      }
      span.textContent = tag;
      tagsContainer.appendChild(span);
    });

    this.openModal("modal-seat-detail");
  }

  openMockSeatDetail(row, seat) {
    if (!state.selectedStadium || !state.selectedBlock) return;
    
    // Create custom mock on-the-fly to ensure every photo button works with high quality
    const stId = state.selectedStadium.id;
    const bId = state.selectedBlock.id;
    const dbKey = `${stId}_${bId}_${row}_${seat}`;

    // Add to runtime DB if not exists
    if (!SEAT_VIEWS_DB[dbKey]) {
      const isGoodSeat = (row + seat) % 2 === 0;
      SEAT_VIEWS_DB[dbKey] = {
        stadiumName: state.selectedStadium.name,
        blockName: state.selectedBlock.name,
        seatName: `${row}열 ${seat}번`,
        image: isGoodSeat ? "assets/seat_view_clean.png" : "assets/seat_view_blocked.png",
        uploader: `@user_n${row}${seat}`,
        uploaderBadge: isGoodSeat ? "골드 제보자" : "일반 제보자",
        upvotes: isGoodSeat ? Math.floor(Math.random() * 20) + 5 : Math.floor(Math.random() * 5),
        downvotes: isGoodSeat ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 15) + 3,
        userVoted: null,
        tags: isGoodSeat ? ["✅ 양호한 시야", "✅ 이동 편리"] : ["⚠️ 앞 가림막 시야간섭", "🔊 스피커 가까움"],
        comment: isGoodSeat 
          ? "전반적으로 쾌적하고 관람하기 좋은 시야입니다. 가성비 좋은 명당 블록 중 하나예요!"
          : "펜스가 다소 시야를 차단해서 아쉽지만 경기 집중엔 큰 방해는 안 됩니다. 앰프가 가까운 편입니다."
      };
    }

    this.openSeatDetail(dbKey);
  }

  // --- 1:1 Side-by-Side Comparison ---
  addCurrentSeatToCompare() {
    if (!state.activeModalSeatKey) return;
    
    const seatInfo = SEAT_VIEWS_DB[state.activeModalSeatKey];
    if (!seatInfo) return;

    // Check if already in comparisons
    const alreadyAdded = state.comparisons.some(item => 
      item.stadiumName === seatInfo.stadiumName && 
      item.blockName === seatInfo.blockName && 
      item.seatName === seatInfo.seatName
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
      ...seatInfo
    });

    localStorage.setItem("seatview_compare", JSON.stringify(state.comparisons));
    this.updateCompareBadge();
    this.showToast("🛒", `${seatInfo.blockName} ${seatInfo.seatName}이 비교함에 담겼습니다!`);
    this.closeModal("modal-seat-detail");
  }

  removeCompareItem(key) {
    state.comparisons = state.comparisons.filter(item => item.key !== key);
    localStorage.setItem("seatview_compare", JSON.stringify(state.comparisons));
    this.updateCompareBadge();
    this.renderCompareView();
    this.showToast("🗑️", "비교 항목이 삭제되었습니다.");
  }

  clearComparison() {
    state.comparisons = [];
    localStorage.removeItem("seatview_compare");
    this.updateCompareBadge();
    this.renderCompareView();
    this.showToast("🗑️", "비교함이 비워졌습니다.");
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

    if (state.comparisons.length === 0) {
      container.innerHTML = `
        <div class="compare-empty">
          <div class="compare-empty-icon">
            <i data-lucide="columns"></i>
          </div>
          <h3>비교함이 비어 있습니다</h3>
          <p>각 좌석 상세정보 창에서 '1:1 비교함 담기' 버튼을 클릭하면 한눈에 시야를 비교해볼 수 있습니다.</p>
          <button class="btn btn-primary" onclick="app.navigateTo('stadiums')">구장 탐색하러 가기</button>
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
            <div class="compare-header-info">
              <span class="compare-seat-badge">${item.stadiumName}</span>
              <div class="compare-seat-name">${item.blockName} ${item.seatName}</div>
            </div>
            <div class="compare-image-box">
              <img src="${item.image}" alt="Seat View">
            </div>
            <div class="compare-content">
              <div class="compare-tags">
                ${item.tags.map(t => `<span class="compare-tag ${t.startsWith('⚠️') ? 'warning' : ''}">${t}</span>`).join("")}
              </div>
              <div class="compare-comment">
                <h5>💬 코멘트</h5>
                <p>${item.comment}</p>
              </div>
            </div>
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
            <div class="compare-header-info">
              <span class="compare-seat-badge">${itemLeft.stadiumName}</span>
              <div class="compare-seat-name">${itemLeft.blockName} ${itemLeft.seatName}</div>
            </div>
            <div class="compare-image-box">
              <img src="${itemLeft.image}" alt="Seat View 1">
            </div>
            <div class="compare-content">
              <div class="compare-tags">
                ${itemLeft.tags.map(t => `<span class="compare-tag ${t.startsWith('⚠️') ? 'warning' : ''}">${t}</span>`).join("")}
              </div>
              <div class="compare-comment">
                <h5>💬 관람평</h5>
                <p>${itemLeft.comment}</p>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="compare-column">
            <button class="compare-remove-btn" onclick="app.removeCompareItem('${itemRight.key}')">
              <i data-lucide="x"></i>
            </button>
            <div class="compare-header-info">
              <span class="compare-seat-badge">${itemRight.stadiumName}</span>
              <div class="compare-seat-name">${itemRight.blockName} ${itemRight.seatName}</div>
            </div>
            <div class="compare-image-box">
              <img src="${itemRight.image}" alt="Seat View 2">
            </div>
            <div class="compare-content">
              <div class="compare-tags">
                ${itemRight.tags.map(t => `<span class="compare-tag ${t.startsWith('⚠️') ? 'warning' : ''}">${t}</span>`).join("")}
              </div>
              <div class="compare-comment">
                <h5>💬 관람평</h5>
                <p>${itemRight.comment}</p>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    lucide.createIcons();
  }

  // --- Ticketbook Feature ---
  renderTicketbook() {
    const archiveContainer = document.getElementById("tickets-archive-container");
    if (!archiveContainer) return;

    archiveContainer.innerHTML = "";

    // Sort by date descending
    const sortedTickets = [...state.tickets].sort((a, b) => new Date(b.matchDate) - new Date(a.matchDate));

    // Stats calculations
    const total = sortedTickets.length;
    const wins = sortedTickets.filter(t => t.result === "승리").length;
    const losses = sortedTickets.filter(t => t.result === "패배").length;
    const draws = total - wins - losses;
    const winRate = total > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;

    // Update Stats Display
    document.getElementById("win-rate-text").textContent = total > 0 ? `${winRate}%` : "0%";
    document.getElementById("ticketbook-summary-desc").textContent = `총 ${total}회 직관 | ${wins}승 ${draws > 0 ? draws + '무 ' : ''}${losses}패`;

    // Render Stats Progress Circle
    const circle = document.getElementById("win-rate-circle");
    if (circle) {
      // conic gradient background matching win percentage
      circle.style.background = `radial-gradient(closest-side, var(--bg-card) 79%, transparent 80% 100%), conic-gradient(var(--accent-purple) ${winRate}%, var(--bg-input) 0)`;
    }

    if (sortedTickets.length === 0) {
      archiveContainer.innerHTML = `
        <div class="compare-empty" style="border-style: solid;">
          <div class="compare-empty-icon">
            <i data-lucide="book-open"></i>
          </div>
          <h3>등록된 티켓 기록이 없습니다</h3>
          <p>상단의 '직관 등록' 버튼을 눌러 소중한 직관 추억과 명당 시야를 나만의 티켓북에 담아보세요!</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    sortedTickets.forEach(ticket => {
      const card = document.createElement("div");
      card.className = "ticket-card";
      
      let badgeClass = "win";
      if (ticket.result === "패배") badgeClass = "lose";
      if (ticket.result === "무승부") badgeClass = "draw";

      card.innerHTML = `
        <button class="delete-ticket-btn" onclick="app.deleteTicket('${ticket.id}')" aria-label="Delete ticket">
          <i data-lucide="trash-2"></i>
        </button>
        <div class="ticket-img-header">
          <img src="${ticket.image}" alt="관전 좌석 시야">
          <span class="ticket-result-badge ${badgeClass}">${ticket.result} ${ticket.result === '승리' ? '🎉' : '😢'}</span>
        </div>
        <div class="ticket-body">
          <div class="ticket-meta-info">
            <span class="ticket-match-date">${ticket.matchDate}</span>
            ${ticket.score ? `<span class="ticket-score">${ticket.score}</span>` : ""}
          </div>
          <div class="ticket-stadium">${ticket.stadiumName}</div>
          <h4 class="ticket-seat-name">${ticket.blockName} ${ticket.seatName}</h4>
          ${ticket.comment ? `<p class="ticket-comment">${ticket.comment}</p>` : ""}
        </div>
      `;
      archiveContainer.appendChild(card);
    });

    lucide.createIcons();
  }

  // --- Add to Ticketbook flow ---
  openAddTicketModal() {
    this.showToast("ℹ️", "📷 시야 사진 제보 및 직관 등록 기능은 정식 서비스 오픈 시 제공 예정입니다.");
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

  handleTicketPhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      state.currentUploadedPhotoBase64 = event.target.result;
      
      const previewImg = document.getElementById("ticket-photo-preview");
      const placeholder = document.getElementById("upload-placeholder-content");
      
      previewImg.src = event.target.result;
      previewImg.style.display = "block";
      placeholder.style.display = "none";
    };
    reader.readAsDataURL(file);
  }

  saveNewTicket(e) {
    e.preventDefault();

    const stadiumId = document.getElementById("form-stadium").value;
    const stadium = STADIUMS_DB.find(st => st.id === stadiumId);
    const blockVal = document.getElementById("form-block").value.trim();
    const seatVal = document.getElementById("form-seat").value.trim();
    const dateVal = document.getElementById("form-match-date").value;
    const resultVal = document.getElementById("form-result").value || "승리 🎉";
    const scoreVal = document.getElementById("form-score").value.trim();
    const commentVal = document.getElementById("form-comment").value.trim();

    // Default image if user didn't upload any
    const finalImage = state.currentUploadedPhotoBase64 || "assets/seat_view_clean.png";

    const newTicket = {
      id: "ticket_" + Date.now(),
      stadiumId: stadiumId,
      stadiumName: stadium ? stadium.name : "기타 구장",
      blockName: blockVal,
      seatName: seatVal,
      matchDate: dateVal,
      result: resultVal,
      score: scoreVal,
      comment: commentVal,
      image: finalImage
    };

    // Save to LocalStorage
    state.tickets.push(newTicket);
    localStorage.setItem("seatview_tickets", JSON.stringify(state.tickets));

    // Seed database with new custom seat view so it shows up in explorer if chosen!
    // Strip block and seat info down for key mapping
    const bIdNormalized = "b_" + blockVal.replace(/[^0-9]/g, "");
    const rNum = parseInt(seatVal.replace(/[^0-9]/g, "").slice(0,1)) || 1;
    const sNum = parseInt(seatVal.replace(/[^0-9]/g, "").slice(1,2)) || 1;
    const dbKey = `${stadiumId}_${bIdNormalized}_${rNum}_${sNum}`;

    if (!SEAT_VIEWS_DB[dbKey]) {
      SEAT_VIEWS_DB[dbKey] = {
        stadiumName: newTicket.stadiumName,
        blockName: blockVal,
        seatName: seatVal,
        image: finalImage,
        uploader: "@나의기록",
        uploaderBadge: "골드 제보자",
        upvotes: 0,
        downvotes: 0,
        userVoted: null,
        tags: [resultVal === "승리" ? "✅ 직관 승요 기운" : "⚠️ 아쉬운 패배 기운", "✅ 직접 제보"],
        comment: commentVal || "유저가 직접 아카이빙한 소중한 시야 제보 데이터입니다."
      };
    }

    this.closeModal("modal-add-ticket");
    this.navigateTo("ticketbook");
    this.showToast("🎉", "새로운 직관 기록과 시야 정보가 등록되었습니다!");
  }

  // Auto-populate block if stadium in modal changed
  handleFormStadiumChange() {
    // Simple helper if form needs block hints
  }

  deleteTicket(id) {
    if (!confirm("정말 이 직관 티켓 기록을 삭제하시겠습니까?")) return;

    state.tickets = state.tickets.filter(t => t.id !== id);
    localStorage.setItem("seatview_tickets", JSON.stringify(state.tickets));
    this.renderTicketbook();
    this.showToast("🗑️", "직관 기록이 삭제되었습니다.");
  }

  addCurrentSeatToTicketbook() {
    if (!state.activeModalSeatKey) return;
    
    const seatInfo = SEAT_VIEWS_DB[state.activeModalSeatKey];
    if (!seatInfo) return;

    // Prefill modal form with current seat details
    this.closeModal("modal-seat-detail");
    this.openAddTicketModal();

    // Map keys to prepopulate form
    // Key parts: stadiumId_blockId_rowNum_seatNum
    const parts = state.activeModalSeatKey.split("_");
    const stadiumId = parts[0];
    
    document.getElementById("form-stadium").value = stadiumId;
    document.getElementById("form-block").value = seatInfo.blockName;
    document.getElementById("form-seat").value = seatInfo.seatName;

    // Use current seat view image
    state.currentUploadedPhotoBase64 = seatInfo.image;
    const previewImg = document.getElementById("ticket-photo-preview");
    const placeholder = document.getElementById("upload-placeholder-content");
    
    previewImg.src = seatInfo.image;
    previewImg.style.display = "block";
    placeholder.style.display = "none";
  }

  // --- Modal Helpers ---
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("active");
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("active");
    }
  }

  openProfileModal() {
    this.renderProfileModalContent();
    this.openModal("modal-profile");
  }

  renderProfileModalContent() {
    const body = document.getElementById("profile-modal-body");
    if (!body) return;

    if (state.isLoggedIn) {
      body.innerHTML = `
        <div class="profile-card-large">
          <img class="profile-avatar-large" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="프로필">
          <div class="profile-username">${state.userNickname} <span class="uploader-badge">VIP 제보자</span></div>
          
          <div class="profile-stats-grid">
            <div class="profile-stat-box">
              <span class="profile-stat-lbl">적립 포인트</span>
              <span class="profile-stat-val" style="color: var(--accent-purple);">${state.userStats.points.toLocaleString()} P</span>
            </div>
            <div class="profile-stat-box">
              <span class="profile-stat-lbl">등록한 시야 사진</span>
              <span class="profile-stat-val">${state.userStats.uploads}개</span>
            </div>
          </div>

          <div style="width: 100%; margin-top: 16px; display: flex; flex-direction: column; gap: 8px;">
            <button class="btn btn-primary btn-full-width" onclick="app.showToast('🎁', '포인트 환전소 점검 중입니다. 네이버페이 교환은 다음 날부터 정상 적용됩니다.')">
              포인트 기프티콘 교환
            </button>
            <button class="btn btn-secondary btn-full-width" style="color: var(--danger); border-color: rgba(239, 68, 68, 0.2);" onclick="app.simulateLogout()">
              로그아웃
            </button>
          </div>
        </div>
      `;
    } else {
      body.innerHTML = `
        <div class="login-promo-box">
          <div class="login-promo-icon">
            <i data-lucide="lock" style="width: 22px; height: 22px;"></i>
          </div>
          <h4>1초 소셜 로그인</h4>
          <p>로그인 시 나만의 직관 티켓북 관리, 시야 투표(추천/비추천) 참여, 비교함 정보 영구 동기화와 포인트 혜택을 받으실 수 있습니다.</p>
          
          <button class="login-btn-social kakao" onclick="app.simulateSocialLogin('Kakao')">
            <i data-lucide="message-circle" style="width: 16px; height: 16px; fill: currentColor;"></i> 카카오로 1초 로그인
          </button>
          <button class="login-btn-social naver" style="margin-top: 8px;" onclick="app.simulateSocialLogin('Naver')">
            <i data-lucide="chrome" style="width: 16px; height: 16px;"></i> 네이버로 1초 로그인
          </button>
        </div>
      `;
    }
    lucide.createIcons();
  }

  simulateSocialLogin(provider) {
    state.isLoggedIn = true;
    state.userNickname = "@직관러_홍길동";
    state.userStats.points = 1500;
    state.userStats.uploads = state.tickets.length;

    const profileBtn = document.querySelector(".profile-btn");
    if (profileBtn) {
      profileBtn.style.borderColor = "var(--success)";
    }

    this.closeModal("modal-profile");
    this.showToast("🔓", `${provider} 계정으로 로그인되어 전체 기능이 활성화되었습니다!`);
  }

  simulateLogout() {
    state.isLoggedIn = false;
    
    const profileBtn = document.querySelector(".profile-btn");
    if (profileBtn) {
      profileBtn.style.borderColor = "var(--accent-blue)";
    }

    this.closeModal("modal-profile");
    this.showToast("🔒", "로그아웃 되었습니다.");
  }

  voteCurrentSeat(type) {
    if (!state.isLoggedIn) {
      this.showToast("🔒", "로그인이 필요한 기능입니다. 우측 상단 프로필을 눌러 1초 로그인을 진행해 주세요!");
      return;
    }

    const dbKey = state.activeModalSeatKey;
    if (!dbKey) return;

    const seatInfo = SEAT_VIEWS_DB[dbKey];
    if (!seatInfo) return;

    if (seatInfo.userVoted === type) {
      // Toggle off
      seatInfo.userVoted = null;
      if (type === "up") {
        seatInfo.upvotes = Math.max(0, (seatInfo.upvotes || 0) - 1);
        this.showToast("👍", "추천을 취소했습니다.");
      } else {
        seatInfo.downvotes = Math.max(0, (seatInfo.downvotes || 0) - 1);
        this.showToast("👎", "비추천을 취소했습니다.");
      }
    } else {
      // Toggle on or switch
      if (seatInfo.userVoted) {
        if (seatInfo.userVoted === "up") {
          seatInfo.upvotes = Math.max(0, (seatInfo.upvotes || 0) - 1);
        } else {
          seatInfo.downvotes = Math.max(0, (seatInfo.downvotes || 0) - 1);
        }
      }
      
      seatInfo.userVoted = type;
      if (type === "up") {
        seatInfo.upvotes = (seatInfo.upvotes || 0) + 1;
        this.showToast("👍", "이 시야 사진을 추천했습니다!");
      } else {
        seatInfo.downvotes = (seatInfo.downvotes || 0) + 1;
        this.showToast("👎", "이 시야 사진을 비추천했습니다.");
      }
    }

    // Refresh UI
    document.getElementById("modal-seat-upvotes").textContent = seatInfo.upvotes;
    document.getElementById("modal-seat-downvotes").textContent = seatInfo.downvotes;
    
    const upvoteBtn = document.querySelector(".vote-btn.upvote");
    const downvoteBtn = document.querySelector(".vote-btn.downvote");
    if (upvoteBtn && downvoteBtn) {
      upvoteBtn.classList.remove("active");
      downvoteBtn.classList.remove("active");
      if (seatInfo.userVoted === "up") {
        upvoteBtn.classList.add("active");
      } else if (seatInfo.userVoted === "down") {
        downvoteBtn.classList.add("active");
      }
    }
  }

  showMusicalComingSoon() {
    this.showToast("🎭", "뮤지컬/대형공연장 시야 정보는 초기 서비스 안정화 후 곧 오픈될 예정입니다. 야구장 데이터를 먼저 체험해 보세요!");
  }

  loadJamsilDetail() {
    this.loadStadiumDetail("jamsil");
    // Trigger block 102 view
    setTimeout(() => {
      this.handleZoneClick("b102");
    }, 200);
  }

  // Tab switching in Stadium details
  switchDetailTab(tabName) {
    state.activeDetailTab = tabName;
    
    // Toggle active tab buttons
    document.querySelectorAll(".detail-tabs .tab-btn").forEach(btn => {
      btn.classList.remove("active");
    });
    const clickedBtn = document.querySelector(`.detail-tabs .tab-btn[onclick*="${tabName}"]`);
    if (clickedBtn) clickedBtn.classList.add("active");

    // Toggle panels
    document.getElementById("tab-content-map").classList.remove("active");
    document.getElementById("tab-content-info").classList.remove("active");

    document.getElementById(`tab-content-${tabName}`).classList.add("active");
  }

  // --- Toast System ---
  showToast(icon, message) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    
    let iconHTML = `<span style="font-size: 1.1rem; line-height: 1;">${icon}</span>`;
    
    toast.innerHTML = `
      ${iconHTML}
      <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = "slideUp 0.3s forwards, fadeOut 0.3s forwards";
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }

  toggleTheme() {
    // Close the menu first for smooth experience
    this.closeModal("modal-menu");
    
    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("seatview_theme", newTheme);

    // Update menu icons and texts
    const themeIcon = document.getElementById("theme-icon");
    const themeText = document.getElementById("theme-text");
    if (themeIcon && themeText) {
      if (newTheme === "light") {
        themeIcon.setAttribute("data-lucide", "moon");
        themeText.textContent = "다크 모드로 전환";
      } else {
        themeIcon.setAttribute("data-lucide", "sun");
        themeText.textContent = "라이트 모드로 전환";
      }
      // Re-render Lucide icons
      lucide.createIcons();
    }
    
    this.showToast(newTheme === "light" ? "☀️" : "🌙", `${newTheme === "light" ? "라이트" : "다크"} 모드로 전환되었습니다.`);
  }
}

// Instantiate global application controller
window.app = new SeatViewApp();
