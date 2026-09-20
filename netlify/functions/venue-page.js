// Renders a venue-specific version of index.html for search engines and
// direct links (/venue/:id). The SPA normally shows one generic <title>/
// <meta description> no matter which venue is open client-side, which
// means Google/Naver have no way to tell "세종문화회관" and "잠실야구장"
// apart, or to rank either for a search naming that specific venue.
//
// This fetches the real, currently-deployed index.html (so it never drifts
// out of sync with the actual app shell) and rewrites just the per-page
// bits: <title>, meta description, OG tags, a JSON-LD block, and a plain
// visible text summary of the venue crawlers can read without running JS.
// Real visitors get the exact same interactive app underneath — see the
// pathname-based deep link added in app_v6.js's init() (mirrors the
// existing ?venue= query-param one used by shareVenue()).
//
// No npm dependencies: relies on Node 18's built-in fetch, which is what
// Netlify Functions run on by default.

const SUPABASE_URL = "https://zgdumfqkhqroehaszmau.supabase.co/rest/v1";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZHVtZnFraHFyb2VoYXN6bWF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5MDA2NDcsImV4cCI6MjEwMDQ3NjY0N30.ZtbbY2R0iKMtmNyB36EF6YRR62TRV-_l6huo87FQ41g";

// JSON.stringify doesn't escape "<", so a value containing the literal
// text "</script>" (venue name/food/parking info is admin-entered today,
// but nothing stops that from changing) would prematurely close this
// script tag and let whatever follows execute as real HTML/JS. < is
// valid inside a JSON string and round-trips through JSON.parse fine, so
// this only changes what the raw HTML looks like, not the parsed value.
function safeJsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

function escapeHtml(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function supabaseGet(path) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase request failed: ${res.status}`);
  return res.json();
}

exports.handler = async (event) => {
  const idMatch = (event.path || "").match(/\/venue\/(\d+)/);
  const id = (event.queryStringParameters && event.queryStringParameters.id) || (idMatch && idMatch[1]);
  if (!id || !/^\d+$/.test(id)) {
    return { statusCode: 404, body: "Not found" };
  }

  // 요청 헤더의 호스트 값을 그대로 쓰면, 조작된 헤더로 다른 사이트의 HTML을
  // 가져와 우리 도메인의 페이지처럼 내보내게 만들 수 있다 — 허용 목록만 쓰고
  // 그 외에는 대표 도메인으로 고정한다.
  const ALLOWED_HOSTS = ["xn--on3b27no0awn.com", "www.xn--on3b27no0awn.com"];
  const reqHost = event.headers["x-forwarded-host"] || event.headers.host;
  const origin = ALLOWED_HOSTS.includes(reqHost) ? `https://${reqHost}` : "https://xn--on3b27no0awn.com";

  let venue, blocks;
  try {
    // Independent of each other (blocks is filtered by the URL's id, not
    // by anything the venue query returns) — no reason to wait for one
    // before starting the other.
    const [venues, blockRows] = await Promise.all([
      supabaseGet(`/venues?id=eq.${id}&select=id,name,address,food_info,parking_info&limit=1`),
      supabaseGet(`/musical_blocks?venue_id=eq.${id}&is_visible=eq.true&select=floor,full_name,block_code&order=floor.asc`),
    ]);
    venue = venues[0];
    if (!venue) return { statusCode: 404, body: "Venue not found" };
    blocks = blockRows;
  } catch (e) {
    console.error("venue-page function: Supabase fetch failed", e);
    return { statusCode: 502, body: "Upstream error" };
  }

  let indexHtml;
  try {
    const indexRes = await fetch(`${origin}/index.html`);
    indexHtml = await indexRes.text();
  } catch (e) {
    console.error("venue-page function: failed to fetch index.html", e);
    return { statusCode: 502, body: "Upstream error" };
  }

  // "뮤지컬"/"연극" spelled out explicitly in the title/description — the
  // venue name alone won't surface for someone searching the broader
  // category rather than a specific venue by name.
  const title = `${venue.name} 좌석 시야 후기 | 뮤지컬·연극 공연장 - 잘보여유`;
  const description = `${venue.name}에서 실제 관람객이 등록한 구역별 좌석 시야 사진과 후기를 확인하세요. 뮤지컬·연극 공연장 좌석 시야 공유 서비스 잘보여유.`;
  const canonicalUrl = `https://xn--on3b27no0awn.com/venue/${id}`;

  const floors = [...new Set(blocks.map((b) => b.floor))].sort((a, b) => a - b);
  const floorListHtml = floors
    .map((floor) => {
      const names = blocks
        .filter((b) => b.floor === floor)
        .map((b) => escapeHtml(b.full_name || (b.block_code ? `${b.block_code}구역` : "구역")))
        .join(", ");
      return `<li>${floor}층: ${names}</li>`;
    })
    .join("");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PerformingArtsTheater",
    name: venue.name,
    address: venue.address || undefined,
    url: canonicalUrl,
  };

  // app_v6.js's <body> is `display:flex; align-items:center; justify-content:center`
  // to center the phone-frame #app-content div — dropping this as a plain
  // sibling made it a second flex item fighting #app-content for space
  // (visible as a broken/squished flash right after landing, before JS
  // removes this div). position:fixed takes it out of that flex flow
  // entirely so it just overlays full-screen instead of participating in
  // body's layout, and the inline bg/text colors (with hard-coded
  // fallbacks matching the dark theme default) keep it from flashing
  // unstyled before style_v6.css has painted.
  // First-fold content is a loading spinner, not the crawler text — a real
  // visitor landing here was flashing a whole wall of text (title, floor
  // list, food/parking info) for the ~0.5-1s it takes app_v6.js to load
  // and remove this div, which read as "some other broken page" even
  // after the flex-layout squish itself was fixed. The rich text is still
  // genuinely present and visible in the DOM (just below the fold) —
  // scrolling reveals it — so crawlers see the exact same content as
  // before; this isn't cloaking, just ordering what a human notices first.
  const seoContentHtml = `
<div id="ssr-seo-content" style="position:fixed;inset:0;z-index:9999;overflow-y:auto;background:var(--bg-app,#080a0f);color:var(--text-primary,#f3f4f6);">
  <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;">
    <img src="/assets/header-logo.png" alt="잘보여유" style="height:28px;">
    <div style="width:26px;height:26px;border:3px solid rgba(255,255,255,0.15);border-top-color:#8b5cf6;border-radius:50%;animation:ssr-spin 0.8s linear infinite;"></div>
    <style>@keyframes ssr-spin{to{transform:rotate(360deg)}}</style>
  </div>
  <div style="max-width:640px;margin:0 auto;padding:0 16px 20px;font-family:sans-serif;line-height:1.6;">
    <h1>${escapeHtml(venue.name)} 좌석 시야 후기</h1>
    <p>${escapeHtml(venue.address || "")}</p>
    <h2>구역 정보</h2>
    <ul>${floorListHtml}</ul>
    ${venue.food_info ? `<h2>맛집 정보</h2><p>${escapeHtml(venue.food_info)}</p>` : ""}
    ${venue.parking_info ? `<h2>주차 정보</h2><p>${escapeHtml(venue.parking_info)}</p>` : ""}
    <p>실제 관람객이 등록한 ${escapeHtml(venue.name)}의 구역별 좌석 시야 사진은 앱에서 바로 확인하실 수 있습니다.</p>
  </div>
</div>`;

  // Replacement strings hold free-text venue data (food_info/parking_info
  // etc. can contain arbitrary characters) — using a function as the
  // second arg to .replace() instead of a plain string sidesteps String
  // .replace's special "$&"/"$1"-style pattern substitution, which would
  // otherwise silently mangle output if any of that text ever contains a
  // literal "$".
  const titleTag = escapeHtml(title);
  const descTag = escapeHtml(description);
  let html = indexHtml
    .replace(/<title>[^<]*<\/title>/, () => `<title>${titleTag}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, () => `<meta name="description" content="${descTag}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, () => `<meta property="og:title" content="${titleTag}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, () => `<meta property="og:description" content="${descTag}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, () => `<meta property="og:url" content="${canonicalUrl}">`)
    .replace(
      "</head>",
      () => `<link rel="canonical" href="${canonicalUrl}">\n<script type="application/ld+json">${safeJsonLd(jsonLd)}</script>\n</head>`
    )
    .replace("<body>", () => `<body>\n${seoContentHtml}`);

  return {
    statusCode: 200,
    // netlify.toml의 [[headers]]는 함수 응답에는 적용되지 않아서 여기서 직접 넣는다.
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Frame-Options": "SAMEORIGIN",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Content-Security-Policy": "object-src 'none'; base-uri 'self'; frame-ancestors 'self'",
    },
    body: html,
  };
};
