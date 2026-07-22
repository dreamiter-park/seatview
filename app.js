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
      { id: "b101", name: "1루 레드석 101블록", category: "내야" },
      { id: "b102", name: "1루 레드석 102블록", category: "내야" },
      { id: "b103", name: "1루 오렌지석(응원단상) 103블록", category: "응원" },
      { id: "b104", name: "1루 오렌지석(응원단상) 104블록", category: "응원" },
      { id: "b105", name: "1루 네이비석 301블록", category: "상층" },
      { id: "b201", name: "3루 레드석 120블록", category: "내야" },
      { id: "b202", name: "3루 오렌지석(원정응원) 121블록", category: "응원" },
      { id: "b301", name: "외야 그린석 401블록", category: "외야" }
    ],
    // Amenity coordinates (top% / left% inside stadium map wrapper)
    amenities: {
      toilet: [
        { name: "1루 화장실", x: 65, y: 70 },
        { name: "3루 화장실", x: 35, y: 70 },
        { name: "외야 중앙 화장실", x: 50, y: 15 }
      ],
      snack: [
        { name: "삼겹살 광장 매점", x: 72, y: 65 },
        { name: "원조 김말이 떡볶이", x: 58, y: 72 },
        { name: "3루 백미당/스테프핫도그", x: 28, y: 65 }
      ],
      exit: [
        { name: "1루 내야 출입구", x: 78, y: 80 },
        { name: "3루 내야 출입구", x: 22, y: 80 },
        { name: "외야 매표소 게이트", x: 50, y: 8 }
      ],
      medical: [
        { name: "의무실 (1루 복도 안쪽)", x: 60, y: 55 }
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

// Seat Views DB (Key: stadiumId_blockId_rowNum_seatNum)
const SEAT_VIEWS_DB = {
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
    // Listen for form stadium change to load block dropdown if needed
    // Simple routing link handlers already set inline on HTML (e.g. onclick="app.navigateTo(...)")
    
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
  }

  // --- Router ---
  navigateTo(viewId) {
    // --- 1:1 비교 로그인 차단 기능 추가 ---
    if (viewId === "compare" && !state.isLoggedIn) {
      if (confirm("[로그인 안내] 1:1 시야 비교함은 회원 전용 서비스입니다. 1초 간편 로그인 화면으로 이동하시겠습니까?")) {
        this.openModal("modal-profile");
      }
      return;
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
        // Depth 5 -> Depth 4
        state.selectedBlock = null;
        document.getElementById("block-seats-section").style.display = "none";
        document.getElementById("stadium-detailed-blocks-view").style.display = "block";
        
        const titleEl = document.getElementById("header-title");
        if (titleEl && state.selectedStadium && state.selectedZone) {
          titleEl.textContent = `${state.selectedStadium.name} - ${state.selectedZone}`;
        }
      } else if (state.selectedZone) {
        // Depth 4 -> Depth 3
        state.selectedZone = null;
        document.getElementById("stadium-detailed-blocks-view").style.display = "none";
        document.getElementById("stadium-overall-map-view").style.display = "block";
        
        const titleEl = document.getElementById("header-title");
        if (titleEl && state.selectedStadium) {
          titleEl.textContent = state.selectedStadium.name;
        }
      } else {
        // Depth 3 -> Depth 2
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

    // Reset display divs to Depth 3
    document.getElementById("stadium-overall-map-view").style.display = "block";
    document.getElementById("stadium-detailed-blocks-view").style.display = "none";
    document.getElementById("block-seats-section").style.display = "none";

    // Switch default tab
    this.switchDetailTab("map");

    // Navigate to Detail view
    this.navigateTo("stadium-detail");
  }

  // Inject beautiful customizable SVG for Seating layout
  injectStadiumMap(stadiumId) {
    const container = document.getElementById("stadium-map-container");
    if (!container) return;

    // We build a responsive SVG representation of a baseball field and seating sections
    // Inside/Outfield layout
    container.innerHTML = `
      <svg viewBox="0 0 400 300" width="100%" height="100%">
        <!-- Outfield green background -->
        <path d="M 80 130 A 150 150 0 0 1 320 130 L 200 250 Z" fill="#132c1c" stroke="#1e3a27" stroke-width="2" />
        <!-- Infield clay/dirt diamond -->
        <path d="M 140 190 L 200 130 L 260 190 L 200 250 Z" fill="#5c4033" opacity="0.6"/>
        <!-- Pitcher's mound and bases -->
        <circle cx="200" cy="190" r="8" fill="#a0785a" />
        <rect x="196" y="246" width="8" height="8" fill="#ffffff" transform="rotate(45, 200, 250)" />
        <rect x="256" y="186" width="8" height="8" fill="#ffffff" transform="rotate(45, 260, 190)" />
        <rect x="136" y="186" width="8" height="8" fill="#ffffff" transform="rotate(45, 140, 190)" />
        <rect x="196" y="126" width="8" height="8" fill="#ffffff" transform="rotate(45, 200, 130)" />

        <!-- 1st Base Lower Stands Zone -->
        <path d="M 230 250 A 45 45 0 0 0 290 190 L 330 210 A 90 90 0 0 1 245 285 Z" 
              class="stadium-zone" id="map-zone-b101" data-block="b101" onclick="app.selectStadiumZone('1루 내야/응원석')" fill="#334155" />
        <text x="280" y="235" fill="white" font-size="8" font-weight="bold" pointer-events="none">1루 레드</text>

        <!-- 1st Base Cheer Stage Zone -->
        <path d="M 290 190 A 45 45 0 0 0 310 150 L 355 160 A 90 90 0 0 1 330 210 Z" 
              class="stadium-zone" id="map-zone-b103" data-block="b103" onclick="app.selectStadiumZone('1루 내야/응원석')" fill="#f97316" />
        <text x="325" y="180" fill="white" font-size="7" font-weight="bold" pointer-events="none" transform="rotate(-30, 325, 180)">응원석(1루)</text>

        <!-- 1st Base Upper / Navy Zone -->
        <path d="M 245 285 A 90 90 0 0 0 330 210 L 375 235 A 140 140 0 0 1 265 300 Z" 
              class="stadium-zone" id="map-zone-b105" data-block="b105" onclick="app.selectStadiumZone('1루 내야/응원석')" fill="#1e293b" />
        <text x="310" y="270" fill="white" font-size="8" pointer-events="none">1루 네이비</text>

        <!-- 3루 Red Stands Zone -->
        <path d="M 170 250 A 45 45 0 0 1 110 190 L 70 210 A 90 90 0 0 0 155 285 Z" 
              class="stadium-zone" id="map-zone-b201" data-block="b201" onclick="app.selectStadiumZone('3루 내야/응원석')" fill="#334155" />
        <text x="105" y="235" fill="white" font-size="8" font-weight="bold" pointer-events="none">3루 레드</text>

        <!-- 3루 Cheer Stage Zone -->
        <path d="M 110 190 A 45 45 0 0 1 90 150 L 45 160 A 90 90 0 0 0 70 210 Z" 
              class="stadium-zone" id="map-zone-b202" data-block="b202" onclick="app.selectStadiumZone('3루 내야/응원석')" fill="#f97316" />
        <text x="50" y="180" fill="white" font-size="7" font-weight="bold" pointer-events="none" transform="rotate(30, 50, 180)">응원석(3루)</text>

        <!-- Outfield Green Zone -->
        <path d="M 70 130 A 130 130 0 0 1 330 130 L 360 110 A 170 170 0 0 0 40 110 Z" 
              class="stadium-zone" id="map-zone-b301" data-block="b301" onclick="app.selectStadiumZone('외야석')" fill="#166534" />
        <text x="200" y="90" fill="white" font-size="10" font-weight="bold" text-anchor="middle" pointer-events="none">외야 그린석</text>
      </svg>
      <!-- Amenity pin markers overlay wrapper -->
      <div id="amenities-marker-wrapper" style="position: absolute; inset: 0; pointer-events: none; margin: 16px;"></div>
    `;
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
  selectStadiumZone(zoneName) {
    state.selectedZone = zoneName;

    // Hide Overall map, show Detailed blocks map
    document.getElementById("stadium-overall-map-view").style.display = "none";
    document.getElementById("stadium-detailed-blocks-view").style.display = "block";

    // Set header title
    const titleEl = document.getElementById("header-title");
    if (titleEl && state.selectedStadium) {
      titleEl.textContent = `${state.selectedStadium.name} - ${zoneName}`;
    }

    // Render detailed blocks list / map
    this.renderDetailedBlocks(zoneName);
  }

  getBlocksForZone(stadium, zoneName) {
    if (zoneName.includes("1루")) {
      return stadium.blocks.filter(b => b.name.includes("1루") || b.name.includes("버건디") || b.name.includes("지니") || b.name.includes("블루존") || b.id.includes("101") || b.id.includes("102") || b.id.includes("103") || b.id.includes("105"));
    } else if (zoneName.includes("3루")) {
      return stadium.blocks.filter(b => b.name.includes("3루") || b.name.includes("다크버건디") || b.id.includes("201") || b.id.includes("202"));
    } else {
      return stadium.blocks.filter(b => b.name.includes("외야") || b.name.includes("프리미엄") || b.name.includes("다이아몬드") || b.name.includes("테이블") || b.id.includes("301") || b.name.includes("피크닉"));
    }
  }

  renderDetailedBlocks(zoneName) {
    const container = document.getElementById("detailed-block-map-container");
    if (!container || !state.selectedStadium) return;

    const blocks = this.getBlocksForZone(state.selectedStadium, zoneName);
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
        ${blocks.map(b => {
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
        }).join("")}
      </div>
    `;

    lucide.createIcons();
  }

  selectStadiumBlock(blockId) {
    if (!state.selectedStadium) return;

    const block = state.selectedStadium.blocks.find(b => b.id === blockId);
    if (!block) return;

    state.selectedBlock = block;

    // Hide Detailed blocks map, show Seating Grid
    document.getElementById("stadium-detailed-blocks-view").style.display = "none";
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
    const msg = `이 좌석 [${stadiumName} - ${blockName} ${seatName}]은 등록된 시야 사진이 없습니다.\n\n최초 제보자가 되어 소중한 시야 사진을 등록하시겠습니까?`;
    
    if (confirm(msg)) {
      if (state.isLoggedIn) {
        this.openAddTicketModal();
        
        document.getElementById("form-stadium").value = state.selectedStadium.id;
        document.getElementById("form-block").value = blockName;
        document.getElementById("form-seat").value = seatName;
        
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1;
        let dd = today.getDate();
        if (mm < 10) mm = '0' + mm;
        if (dd < 10) dd = '0' + dd;
        document.getElementById("form-match-date").value = `${yyyy}-${mm}-${dd}`;
      } else {
        const loginMsg = "[로그인 안내]\n사진 제보는 회원만 가능합니다. 1초 간편 로그인 페이지로 이동하시겠습니까?";
        if (confirm(loginMsg)) {
          this.openModal("modal-profile");
        }
      }
    }
  }

  renderSeatingGrid(blockId) {
    const wrapper = document.getElementById("seat-grid-wrapper");
    const container = document.getElementById("seat-rows-container");
    if (!wrapper || !container) return;

    wrapper.style.display = "block";
    container.innerHTML = "";

    // Generate simulated rows: Row 1 to Row 5, seats 1 to 8
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
        
        // Check if database contains a camera view for this seat
        const dbKey = `${state.selectedStadium.id}_${blockId}_${r}_${s}`;
        const hasPhoto = !!SEAT_VIEWS_DB[dbKey];

        if (hasPhoto) {
          seatBtn.classList.add("has-camera");
          seatBtn.innerHTML = "📷";
          seatBtn.onclick = () => this.openSeatDetail(dbKey);
        } else {
          // Mock some other seats to have camera views with a lower probability to feel realistic,
          // but for this demo, let's keep only strict seed database matches or add random mock views.
          // Let's make 10% of seats randomly viewable if not seeded.
          const isMockPhoto = (r + s) % 7 === 0;
          if (isMockPhoto) {
            seatBtn.classList.add("has-camera");
            seatBtn.innerHTML = "📷";
            seatBtn.onclick = () => this.openMockSeatDetail(r, s);
          } else {
            seatBtn.onclick = () => this.handleNoPhotoSeatClick(block.name, `${r}열 ${s}번`);
          }
        }

        seatsDiv.appendChild(seatBtn);
      }
      rowDiv.appendChild(seatsDiv);
      container.appendChild(rowDiv);
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
    
    // Check if logged in!
    if (!state.isLoggedIn) {
      this.closeModal("modal-seat-detail");
      if (confirm("[로그인 안내] 1:1 시야 비교함 담기는 회원 전용 기능입니다. 지금 1초 소셜 로그인 화면으로 이동하시겠습니까?")) {
        this.openModal("modal-profile");
      }
      return;
    }

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
    // Populate form stadium list
    const select = document.getElementById("form-stadium");
    if (select) {
      select.innerHTML = STADIUMS_DB.map(st => `<option value="${st.id}">${st.name}</option>`).join("");
    }

    // Reset upload placeholder preview for seat view photo
    document.getElementById("ticket-photo-preview").style.display = "none";
    document.getElementById("upload-placeholder-content").style.display = "flex";
    state.currentUploadedPhotoBase64 = null;

    // Reset upload placeholder preview for ticket OCR photo
    const ocrPreview = document.getElementById("ticket-ocr-preview");
    if (ocrPreview) ocrPreview.style.display = "none";
    const ocrPlaceholder = document.getElementById("ocr-placeholder-content");
    if (ocrPlaceholder) ocrPlaceholder.style.display = "flex";
    const ocrOverlay = document.getElementById("ocr-scanning-overlay");
    if (ocrOverlay) ocrOverlay.style.display = "none";

    // Reset fields
    document.getElementById("add-ticket-form").reset();
    document.getElementById("form-match-date").value = "";
    document.getElementById("form-result").value = "";

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
}

// Instantiate global application controller
window.app = new SeatViewApp();
